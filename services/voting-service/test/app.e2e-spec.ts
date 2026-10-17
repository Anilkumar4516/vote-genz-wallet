import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Voting Service (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Provide testing environment variables
    process.env.VOTER_REGISTRY_DB_HOST = 'localhost';
    process.env.BALLOT_BOX_DB_HOST = 'localhost';
    process.env.BALLOT_ENCRYPTION_MASTER_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    process.env.INTERNAL_SERVICE_SECRET = 'sec_srv_inter_comm_token_99210';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/health/live (GET) returns status UP', () => {
    return request(app.getHttpServer())
      .get('/health/live')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('UP');
        expect(res.body.service).toBe('voting-service');
      });
  });

  it('/elections/:id/candidates (GET) retrieves candidate slate', () => {
    return request(app.getHttpServer())
      .get('/elections/national-election-2026/candidates')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].name).toBeDefined();
      });
  });

  it('/vote/receipt/:code (GET) checks receipt code', () => {
    return request(app.getHttpServer())
      .get('/vote/receipt/REC-SAMPLE12')
      .expect(200)
      .expect((res) => {
        expect(res.body.receiptCode).toBe('REC-SAMPLE12');
        expect(res.body.isVerified).toBe(true);
      });
  });
});
