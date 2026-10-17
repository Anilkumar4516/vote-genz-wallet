import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Service (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.VOTER_REGISTRY_DB_HOST = 'localhost';
    process.env.REDIS_HOST = 'localhost';
    process.env.JWT_SECRET = 'super_secret_auth_jwt_key_min_32_bytes_random';

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

  it('/auth/login (POST) validates citizen and initiates OTP dispatch', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        nationalId: 'VOTER-IND-2026-001',
        mobileNumber: '+919876543210',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('OTP_SENT');
        expect(res.body.expiresInSec).toBe(300);
      });
  });

  it('/auth/verify-otp (POST) verifies OTP and returns short-lived JWT session', () => {
    return request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({
        nationalId: 'VOTER-IND-2026-001',
        otp: '123456',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('AUTHENTICATED');
        expect(res.body.session?.accessToken).toBeDefined();
      });
  });

  it('/verify/fingerprint (POST) verifies biometric hardware signature', () => {
    return request(app.getHttpServer())
      .post('/verify/fingerprint')
      .send({
        nationalId: 'VOTER-IND-2026-001',
        challenge: 'auth-challenge-token-xyz',
        signature: 'sig_valid_hardware_enclave_key_01',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.verified).toBe(true);
        expect(res.body.factor).toBe('fingerprint');
      });
  });
});
