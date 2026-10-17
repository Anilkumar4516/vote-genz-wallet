variable "aws_region" {
  description = "AWS region for election infrastructure deployment"
  type        = string
  default     = "ap-south-1" # Mumbai region
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the dedicated election VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "voter_registry_db_password" {
  description = "Master password for the Voter Registry Database"
  type        = string
  sensitive   = true
}

variable "ballot_box_db_password" {
  description = "Master password for the Isolated Ballot Box Database"
  type        = string
  sensitive   = true
}
