/**
 * Production Redis Client & Redis Streams Manager
 * Handles:
 * 1. High-throughput Redis connection pool (ioredis)
 * 2. Atomic Token Burn & Voter Participation check via Redis Lua script (Microsecond latency)
 * 3. Redis Streams for Async Ballot Ingestion (XADD / XREADGROUP)
 * 4. Distributed Session & OTP Store
 * 5. Sliding-Window Rate Limiting
 */

const Redis = require('ioredis');

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

let redisClient = null;
let isRedisConnected = false;

// Atomic Lua Script for One-Person-One-Vote & Anonymous Token Burning
// Key 1: voter_participation_set (election specific)
// Key 2: token_hash_key
// ARGV 1: voterId
// ARGV 2: timestamp
const ATOMIC_BURN_LUA = `
  local participationKey = KEYS[1]
  local tokenKey = KEYS[2]
  local voterId = ARGV[1]
  local timestamp = ARGV[2]

  -- 1. Check if voter already cast ballot
  local alreadyVoted = redis.call('SISMEMBER', participationKey, voterId)
  if alreadyVoted == 1 then
    return 'ALREADY_VOTED'
  end

  -- 2. Check if token exists and is valid
  local tokenUsed = redis.call('HGET', tokenKey, 'used')
  if not tokenUsed then
    return 'TOKEN_NOT_FOUND'
  end
  if tokenUsed == '1' then
    return 'TOKEN_ALREADY_USED'
  end

  -- 3. Atomic burn and participation lock
  redis.call('HSET', tokenKey, 'used', '1', 'used_at', timestamp)
  redis.call('SADD', participationKey, voterId)
  
  return 'SUCCESS'
`;

function getRedisClient() {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 10) {
        console.warn('⚠️ Redis retry count exceeded. Operating in fallback mode.');
        return null;
      }
      return Math.min(times * 100, 2000);
    },
    lazyConnect: true
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log(`✅ Connected to Redis cluster at ${REDIS_HOST}:${REDIS_PORT}`);
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
    // Log error cleanly without crashing
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`⚠️ Redis Connection Notice: ${err.message}`);
    }
  });

  // Define custom command for atomic token burn
  redisClient.defineCommand('atomicBurnToken', {
    numberOfKeys: 2,
    lua: ATOMIC_BURN_LUA
  });

  return redisClient;
}

/**
 * Initializes Redis connection
 */
async function initRedis() {
  const client = getRedisClient();
  try {
    await client.connect();
    isRedisConnected = true;
    return true;
  } catch (err) {
    isRedisConnected = false;
    console.warn(`⚠️ Redis unavailable at ${REDIS_HOST}:${REDIS_PORT}. System will operate with in-memory fallback.`);
    return false;
  }
}

/**
 * Check if Redis is actively connected
 */
function isConnected() {
  return isRedisConnected && redisClient && redisClient.status === 'ready';
}

/**
 * Enqueue a ballot payload to Redis Streams for background persistence & Merkle batching
 * @param {number} electionId
 * @param {object} payload
 * @returns {Promise<string>} Stream Message ID
 */
async function enqueueBallot(electionId, payload) {
  const client = getRedisClient();
  const streamKey = `election:${electionId}:ballot_stream`;
  const messageData = [
    'payload', JSON.stringify(payload),
    'timestamp', new Date().toISOString()
  ];
  return await client.xadd(streamKey, '*', ...messageData);
}

/**
 * Create Redis Stream consumer group if it doesn't already exist
 */
async function ensureConsumerGroup(streamKey, groupName) {
  const client = getRedisClient();
  try {
    await client.xgroup('CREATE', streamKey, groupName, '$', 'MKSTREAM');
  } catch (err) {
    if (!err.message.includes('BUSYGROUP')) {
      throw err;
    }
  }
}

/**
 * Sliding Window Distributed Rate Limiter
 * @param {string} identifier IP or Voter ID
 * @param {string} action E.g. 'vote_cast' or 'otp_request'
 * @param {number} limit Max requests
 * @param {number} windowSec Time window in seconds
 * @returns {Promise<{allowed: boolean, remaining: number}>}
 */
async function checkRateLimit(identifier, action, limit, windowSec) {
  if (!isConnected()) return { allowed: true, remaining: limit };

  const client = getRedisClient();
  const key = `ratelimit:${action}:${identifier}`;
  const now = Date.now();
  const windowStart = now - (windowSec * 1000);

  const multi = client.multi();
  multi.zremrangebyscore(key, 0, windowStart);
  multi.zadd(key, now, `${now}-${Math.random()}`);
  multi.zcard(key);
  multi.expire(key, windowSec);

  const results = await multi.exec();
  const count = results[2][1];
  const allowed = count <= limit;

  return {
    allowed,
    remaining: Math.max(0, limit - count)
  };
}

const REDIS_PUBSUB_CHANNEL = 'election:events';
let subClient = null;

/**
 * Publish real-time election event across Redis cluster
 */
async function publishEvent(eventType, payload) {
  if (!isConnected()) return false;
  try {
    const client = getRedisClient();
    const data = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });
    await client.publish(REDIS_PUBSUB_CHANNEL, data);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Subscribe to real-time election events across Redis cluster
 */
async function subscribeEvents(callback) {
  if (!isConnected()) return false;
  try {
    if (!subClient) {
      subClient = getRedisClient().duplicate();
      await subClient.connect();
      await subClient.subscribe(REDIS_PUBSUB_CHANNEL);
      subClient.on('message', (channel, message) => {
        if (channel === REDIS_PUBSUB_CHANNEL) {
          try {
            const parsed = JSON.parse(message);
            callback(parsed.type, parsed.data);
          } catch (_) {}
        }
      });
    }
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  getRedisClient,
  initRedis,
  isConnected,
  enqueueBallot,
  ensureConsumerGroup,
  checkRateLimit,
  publishEvent,
  subscribeEvents
};
