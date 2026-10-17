terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "VoteWallet"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Security    = "ZeroKnowledge"
    }
  }
}

# 1. Dedicated Multi-AZ Virtual Private Cloud
resource "aws_vpc" "vote_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "vote-wallet-${var.environment}-vpc"
  }
}

# 2. Subnets: Public (Ingress/ALB) and Private (Microservices & DBs)
resource "aws_subnet" "public_1" {
  vpc_id            = aws_vpc.vote_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"
  tags = { Name = "vote-public-subnet-1" }
}

resource "aws_subnet" "public_2" {
  vpc_id            = aws_vpc.vote_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}b"
  tags = { Name = "vote-public-subnet-2" }
}

resource "aws_subnet" "private_db_1" {
  vpc_id            = aws_vpc.vote_vpc.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "${var.aws_region}a"
  tags = { Name = "vote-private-db-subnet-1" }
}

resource "aws_subnet" "private_db_2" {
  vpc_id            = aws_vpc.vote_vpc.id
  cidr_block        = "10.0.12.0/24"
  availability_zone = "${var.aws_region}b"
  tags = { Name = "vote-private-db-subnet-2" }
}

resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "vote-wallet-db-subnets"
  subnet_ids = [aws_subnet.private_db_1.id, aws_subnet.private_db_2.id]
}
