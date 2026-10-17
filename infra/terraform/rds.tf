# ====================================================================
# Dual Isolated RDS PostgreSQL 16 Databases
# Strict Physical & Access Separation:
# 1. voter_registry_db: Identity Roll & Voter Participation
# 2. ballot_box_db: Encrypted Ballots with ZERO Voter Identifiers
# ====================================================================

# Database 1: Voter Identity Registry
resource "aws_db_instance" "voter_registry" {
  identifier             = "vote-wallet-voter-registry"
  allocated_storage      = 100
  max_allocated_storage  = 1000
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = "db.r6g.xlarge"
  db_name                = "vote_wallet_identity"
  username               = "voter_admin"
  password               = var.voter_registry_db_password
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  multi_az               = true
  storage_encrypted      = true
  kms_key_id             = aws_kms_key.database_encryption_key.arn
  skip_final_snapshot    = false
  final_snapshot_identifier = "vote-wallet-voter-registry-final"

  tags = {
    Name = "vote-wallet-voter-registry"
    Data = "PII_Voter_Registry"
  }
}

# Database 2: Encrypted Anonymous Ballot Box
resource "aws_db_instance" "ballot_box" {
  identifier             = "vote-wallet-ballot-box"
  allocated_storage      = 200
  max_allocated_storage  = 2000
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = "db.r6g.2xlarge" # Optimized for heavy ballot insertion IOPS
  db_name                = "vote_wallet_ballot_box"
  username               = "ballot_box_admin"
  password               = var.ballot_box_db_password
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  multi_az               = true
  storage_encrypted      = true
  kms_key_id             = aws_kms_key.database_encryption_key.arn
  skip_final_snapshot    = false
  final_snapshot_identifier = "vote-wallet-ballot-box-final"

  tags = {
    Name = "vote-wallet-ballot-box"
    Data = "Anonymous_Encrypted_Ballots"
  }
}
