export type AdminRole = 'ADMIN' | 'AUDITOR' | 'COMMISSIONER';

export interface AdminEntity {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  totpSecret: string;
  isMfaEnabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
}
