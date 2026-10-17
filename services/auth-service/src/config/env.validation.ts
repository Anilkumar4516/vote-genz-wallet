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
  PORT: number = 3001;

  @IsString()
  @IsNotEmpty({ message: 'VOTER_REGISTRY_DB_HOST is required' })
  VOTER_REGISTRY_DB_HOST: string;

  @IsString()
  @IsNotEmpty({ message: 'REDIS_HOST is required' })
  REDIS_HOST: string;

  @IsString()
  @IsNotEmpty({ message: 'JWT_SECRET is required' })
  JWT_SECRET: string;
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
    throw new Error(`\n❌ [auth-service startup halted] Missing or invalid environment variables:\n - ${errorMessages.join('\n - ')}\n`);
  }
  return validatedConfig;
}
