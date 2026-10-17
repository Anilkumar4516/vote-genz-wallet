import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3002;

  @IsString()
  @IsNotEmpty({ message: 'VOTER_REGISTRY_DB_HOST is required for participation logging' })
  VOTER_REGISTRY_DB_HOST: string;

  @IsString()
  @IsNotEmpty({ message: 'BALLOT_BOX_DB_HOST is required for ballot box persistence' })
  BALLOT_BOX_DB_HOST: string;

  @IsString()
  @IsNotEmpty({ message: 'BALLOT_ENCRYPTION_MASTER_KEY is required for zero-knowledge ballot sealing' })
  BALLOT_ENCRYPTION_MASTER_KEY: string;

  @IsString()
  @IsNotEmpty({ message: 'INTERNAL_SERVICE_SECRET is required for internal tallying security' })
  INTERNAL_SERVICE_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map((e) => Object.values(e.constraints || {})).flat();
    throw new Error(`\n❌ [voting-service startup halted] Missing or invalid environment variables:\n - ${errorMessages.join('\n - ')}\n`);
  }
  return validatedConfig;
}
