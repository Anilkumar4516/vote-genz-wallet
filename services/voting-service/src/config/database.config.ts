import { PoolConfig } from 'pg';
import { DatabaseConfig } from './configuration';

export function createPgPoolConfig(dbConfig: DatabaseConfig, applicationName: string): PoolConfig {
  return {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.pass,
    database: dbConfig.name,
    max: dbConfig.poolMax,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    application_name: applicationName,
  };
}
