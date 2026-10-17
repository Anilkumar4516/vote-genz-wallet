import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin Service (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.VOTER_REGISTRY_DB_HOST = 'localhost';
    process.env.JWT_SECRET = 'admin_portal_jwt_secret_token_xyz';

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

  it('/admin/auth/login (POST) validates credentials and requires TOTP MFA', () => {
    return request(app.getHttpServer())
      .post('/admin/auth/login')
      .send({
        email: 'admin@votewallet.gov',
        password: 'any_admin_pass',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.mfaRequired).toBe(true);
        expect(res.body.mfaSessionToken).toBeDefined();
      });
  });

  it('/audit/verify-chain (GET) verifies cryptographic hash chain continuity', () => {
    return request(app.getHttpServer())
      .get('/audit/verify-chain')
      .set('x-admin-role', 'AUDITOR')
      .expect(200)
      .expect((res) => {
        expect(res.body.isChainValid).toBe(true);
        expect(res.body.tamperDetected).toBe(false);
      });
  });

  it('/admin/key-ceremony/initiate (POST) splits master key into 3 Shamir shares', () => {
    return request(app.getHttpServer())
      .post('/admin/key-ceremony/initiate')
      .set('x-admin-role', 'ADMIN')
      .send({ electionId: 'national-election-2026' })
      .expect(200)
      .expect((res) => {
        expect(res.body.electionId).toBe('national-election-2026');
        expect(res.body.trustees.length).toBe(3);
      });
  });
});
