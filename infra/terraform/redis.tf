# ====================================================================
# AWS ElastiCache Redis 7 Replication Group
# Sub-millisecond OTP validation, token burn locks, and rate limits
# ====================================================================

resource "aws_elasticache_subnet_group" "redis_subnets" {
  name       = "vote-wallet-redis-subnets"
  subnet_ids = [aws_subnet.private_db_1.id, aws_subnet.private_db_2.id]
}

resource "aws_elasticache_replication_group" "redis_cluster" {
  replication_group_id          = "vote-wallet-redis"
  description                   = "High-throughput Redis cluster for Vote Wallet"
  node_type                     = "cache.r6g.large"
  num_cache_clusters            = 2
  parameter_group_name          = "default.redis7"
  port                          = 6379
  subnet_group_name             = aws_elasticache_subnet_group.redis_subnets.name
  automatic_failover_enabled    = true
  at_rest_encryption_enabled    = true
  transit_encryption_enabled    = true
  kms_key_id                    = aws_kms_key.database_encryption_key.arn

  tags = {
    Name = "vote-wallet-redis-cluster"
  }
}
