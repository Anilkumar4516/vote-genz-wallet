output "voter_registry_endpoint" {
  description = "Voter Registry Database Endpoint"
  value       = aws_db_instance.voter_registry.endpoint
}

output "ballot_box_endpoint" {
  description = "Ballot Box Database Endpoint"
  value       = aws_db_instance.ballot_box.endpoint
}

output "redis_primary_endpoint" {
  description = "Redis Primary Cluster Endpoint"
  value       = aws_elasticache_replication_group.redis_cluster.primary_endpoint_address
}

output "election_master_kms_arn" {
  description = "Election Master KMS Key ARN"
  value       = aws_kms_key.election_master_key.arn
}

output "audit_vault_bucket" {
  description = "Immutable WORM Audit S3 Bucket"
  value       = aws_s3_bucket.immutable_audit_vault.bucket
}
