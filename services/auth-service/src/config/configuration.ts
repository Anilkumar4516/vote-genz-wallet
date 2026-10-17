export interface AuthConfig {
  port: number;
  nodeEnv: string;
  voterRegistryDb: {
    host: string;
    port: number;
    user: string;
    pass: string;
    name: string;
    poolMax: number;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    sessionTtlSeconds: number;
  };
  sms: {
    provider: 'msg91' | 'twilio' | 'mock';
    msg91: {
      authKey: string;
      templateId: string;
      senderId: string;
    };
    twilio: {
      accountSid: string;
      authToken: string;
      fromNumber: string;
    };
  };
  lockout: {
    maxFailedAttempts: number;
    lockoutDurationSeconds: number;
    adminAlertUrl: string;
  };
}

export default (): AuthConfig => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  voterRegistryDb: {
    host: process.env.VOTER_REGISTRY_DB_HOST || 'localhost',
    port: parseInt(process.env.VOTER_REGISTRY_DB_PORT || '5432', 10),
    user: process.env.VOTER_REGISTRY_DB_USER || 'voter_registry_readonly',
    pass: process.env.VOTER_REGISTRY_DB_PASS || 'secure_ro_password',
    name: process.env.VOTER_REGISTRY_DB_NAME || 'vote_wallet_identity',
    poolMax: parseInt(process.env.VOTER_REGISTRY_DB_POOL_MAX || '20', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_auth_jwt_key_min_32_bytes_random',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    sessionTtlSeconds: parseInt(process.env.SESSION_TTL_SECONDS || '900', 10),
  },
  sms: {
    provider: (process.env.SMS_PROVIDER as any) || 'mock',
    msg91: {
      authKey: process.env.MSG91_AUTH_KEY || '',
      templateId: process.env.MSG91_TEMPLATE_ID || '',
      senderId: process.env.MSG91_SENDER_ID || 'VOTEIN',
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_FROM_NUMBER || '',
    },
  },
  lockout: {
    maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS || '3', 10),
    lockoutDurationSeconds: parseInt(process.env.LOCKOUT_DURATION_SECONDS || '1800', 10),
    adminAlertUrl: process.env.ADMIN_ALERT_WEBHOOK_URL || 'http://localhost:3003/admin/audit-log',
  },
});
