import { AdminRole } from './rbac';

export const ADMIN_TOKEN_KEY = 'vote_admin_token';
export const ADMIN_USER_KEY = 'vote_admin_user';

export interface AdminUser {
  adminId: string;
  name: string;
  role: AdminRole;
  email: string;
}

export function getStoredAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getStoredAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(ADMIN_USER_KEY);
  if (!user) return null;
  try {
    return JSON.parse(user) as AdminUser;
  } catch {
    return null;
  }
}

export function setAdminSession(token: string, user: AdminUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}
