# ====================================================================
# AWS KMS Customer Managed Keys (CMK)
# Enforces FIPS 140-3 Hardware Envelope Encryption
# Used for ballot encryption key ceremony backup & database encryption at rest
# ====================================================================

resource "aws_kms_key" "election_master_key" {
  description             = "Vote Wallet Election Master Encryption Key (FIPS 140-3)"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "vote-wallet-election-master-key"
  }
}

resource "aws_kms_alias" "election_master_key_alias" {
  name          = "alias/vote-wallet-election-master-key"
  target_key_id = aws_kms_key.election_master_key.key_id
}

resource "aws_kms_key" "database_encryption_key" {
  description             = "KMS Key for RDS PostgreSQL & S3 Encryption at Rest"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "vote-wallet-database-encryption-key"
  }
}
