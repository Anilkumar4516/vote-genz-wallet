export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  name: string;
  poolMax: number;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  voterRegistryDb: DatabaseConfig;
  ballotBoxDb: DatabaseConfig;
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  crypto: {
    masterKey: string;
    kmsProvider: string;
    kmsKeyId: string;
  };
  security: {
    jwtSecret: string;
    internalServiceSecret: string;
    adminAuditServiceUrl: string;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3002', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  voterRegistryDb: {
    host: process.env.VOTER_REGISTRY_DB_HOST || 'localhost',
    port: parseInt(process.env.VOTER_REGISTRY_DB_PORT || '5432', 10),
    user: process.env.VOTER_REGISTRY_DB_USER || 'voter_participation_insert_only',
    pass: process.env.VOTER_REGISTRY_DB_PASS || 'secure_insert_password',
    name: process.env.VOTER_REGISTRY_DB_NAME || 'vote_wallet_identity',
    poolMax: parseInt(process.env.VOTER_REGISTRY_DB_POOL_MAX || '25', 10),
  },
  ballotBoxDb: {
    host: process.env.BALLOT_BOX_DB_HOST || 'localhost',
    port: parseInt(process.env.BALLOT_BOX_DB_PORT || '5432', 10),
    user: process.env.BALLOT_BOX_DB_USER || 'ballot_box_user',
    pass: process.env.BALLOT_BOX_DB_PASS || 'secure_ballot_password',
    name: process.env.BALLOT_BOX_DB_NAME || 'vote_wallet_ballot_box',
    poolMax: parseInt(process.env.BALLOT_BOX_DB_POOL_MAX || '50', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  crypto: {
    masterKey: process.env.BALLOT_ENCRYPTION_MASTER_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    kmsProvider: process.env.KMS_PROVIDER || 'local',
    kmsKeyId: process.env.KMS_KEY_ID || 'alias/vote-wallet-ballot-key',
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'super_secure_voting_service_jwt_secret_token_min_32_chars',
    internalServiceSecret: process.env.INTERNAL_SERVICE_SECRET || 'sec_srv_inter_comm_token_99210',
    adminAuditServiceUrl: process.env.ADMIN_AUDIT_SERVICE_URL || 'http://localhost:3003/admin/audit-log',
  },
});
