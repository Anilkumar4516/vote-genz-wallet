# ====================================================================
# S3 Immutable Storage with Object Lock
# Houses voter face templates (encrypted at rest) and tamper-proof Merkle proofs
# ====================================================================

resource "aws_s3_bucket" "voter_photo_storage" {
  bucket = "vote-wallet-${var.environment}-voter-photos"

  tags = {
    Name = "vote-wallet-voter-photos"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "photo_storage_crypto" {
  bucket = aws_s3_bucket.voter_photo_storage.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.database_encryption_key.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "block_public" {
  bucket = aws_s3_bucket.voter_photo_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Immutable Audit Log Bucket with S3 Object Lock (WORM - Write Once Read Many)
resource "aws_s3_bucket" "immutable_audit_vault" {
  bucket = "vote-wallet-${var.environment}-audit-vault"

  object_lock_enabled = true

  tags = {
    Name = "vote-wallet-audit-vault"
  }
}
