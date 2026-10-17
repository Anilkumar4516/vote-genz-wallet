'use client';

import { create } from 'zustand';
import { AdminRole, AdminPermission, hasPermission } from '../lib/rbac';
import { AdminUser, setAdminSession, clearAdminSession, getStoredAdminToken, getStoredAdminUser } from '../lib/auth';
import { syncAdminToken } from '../lib/api';

interface AdminAuthState {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  setAuthenticated: (token: string, user: AdminUser) => void;
  hasPermission: (permission: AdminPermission) => boolean;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  token: typeof window !== 'undefined' ? getStoredAdminToken() : null,
  user: typeof window !== 'undefined' ? getStoredAdminUser() : null,
  isAuthenticated: typeof window !== 'undefined' ? Boolean(getStoredAdminToken()) : false,

  setAuthenticated: (token, user) => {
    setAdminSession(token, user);
    syncAdminToken(token);
    set({ token, user, isAuthenticated: true });
  },

  hasPermission: (permission) => {
    const { user } = get();
    return hasPermission(user?.role, permission);
  },

  logout: () => {
    clearAdminSession();
    syncAdminToken(undefined);
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
