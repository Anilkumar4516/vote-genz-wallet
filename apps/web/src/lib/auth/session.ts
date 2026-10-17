/**
 * Voter Web Portal Session Manager
 */

export const TOKEN_STORAGE_KEY = 'vote_access_token';
export const STEP_STORAGE_KEY = 'vote_flow_step';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(STEP_STORAGE_KEY);
}

export function isSessionActive(): boolean {
  return Boolean(getStoredToken());
}
