import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient } from 'pg';
import { createPgPoolConfig } from '../config/database.config';
import { DatabaseConfig } from '../config/configuration';

@Injectable()
export class RegistryDataSource implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RegistryDataSource.name);
  private pool: Pool;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const dbConfig = this.configService.get<DatabaseConfig>('voterRegistryDb');
    this.pool = new Pool(createPgPoolConfig(dbConfig, 'voting-service:registry'));

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle Registry DB client', err.stack);
    });

    this.logger.log('Voter Registry DataSource initialized (Participation insert-only credentials)');
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('Registry DB pool disconnected');
    }
  }

  getPool(): Pool {
    return this.pool;
  }

  async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1;');
      return true;
    } catch {
      return false;
    }
  }
}
