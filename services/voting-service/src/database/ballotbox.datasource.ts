import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient } from 'pg';
import { createPgPoolConfig } from '../config/database.config';
import { DatabaseConfig } from '../config/configuration';

@Injectable()
export class BallotBoxDataSource implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BallotBoxDataSource.name);
  private pool: Pool;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const dbConfig = this.configService.get<DatabaseConfig>('ballotBoxDb');
    this.pool = new Pool(createPgPoolConfig(dbConfig, 'voting-service:ballotbox'));

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle Ballot Box DB client', err.stack);
    });

    this.logger.log('Ballot Box DataSource initialized (Dedicated credentials & zero voter IDs)');
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('Ballot Box DB pool disconnected');
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
