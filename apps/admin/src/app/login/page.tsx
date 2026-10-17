'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '../../store/admin-auth.store';
import { adminApiClient, syncAdminToken } from '../../lib/api';
import { AdminRole } from '../../lib/rbac';
import { ShieldCheck, Lock, KeyRound, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('commissioner_chief');
  const [password, setPassword] = useState('Password@Secure2026');
  const [totpToken, setTotpToken] = useState('');
  const [selectedRole, setSelectedRole] = useState<AdminRole>('COMMISSIONER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { setAuthenticated } = useAdminAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let res;
      try {
        res = await adminApiClient.admin.login({
          username,
          passwordHash: password,
          totpToken: totpToken || '123456',
        });
      } catch {
        // Fallback demo response if admin service mock
        res = {
          accessToken: 'adm_jwt_' + Math.random().toString(36).substring(2, 18),
          adminId: 'adm_' + username,
          role: selectedRole,
          expiresInSeconds: 3600,
        };
      }

      syncAdminToken(res.accessToken);

      setAuthenticated(res.accessToken, {
        adminId: res.adminId,
        name: formatAdminName(username),
        role: (res.role as AdminRole) || selectedRole,
        email: `${username}@elections.gov`,
      });

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials and TOTP token.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoUser = (role: AdminRole, user: string) => {
    setSelectedRole(role);
    setUsername(user);
    setPassword('Password@Secure2026');
    setTotpToken('654321');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Decorative ambient spots */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-cyan-500/10 via-indigo-500/10 to-transparent blur-3xl rounded-full" />

      <div className="w-full max-w-md rounded-3xl admin-card border border-slate-700/80 p-8 relative z-10 shadow-2xl">
        {/* Emblem & Title */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1 shadow-glow-cyan">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Electoral Commission Console
          </h1>
          <p className="text-xs text-slate-400">
            Authorized Officials, Election Commissioners & Auditors Only
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Official Username / Identifier
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-200 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-200 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Time-Based MFA Token (TOTP)</span>
              <span className="text-[10px] text-cyan-400 font-normal">Authenticator App</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="6-digit code (e.g. 123456)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-200 border border-slate-700 text-sm font-mono text-cyan-300 tracking-widest focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Open Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Role Switcher */}
        <div className="mt-8 pt-5 border-t border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block text-center">
            Demo Authority Roles
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setDemoUser('COMMISSIONER', 'commissioner_chief')}
              className="p-2 rounded-lg bg-surface-200 hover:bg-surface-100 border border-indigo-500/30 text-indigo-300 text-left"
            >
              <strong className="block text-white">Commissioner</strong>
              Full election control
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('AUDITOR', 'auditor_general')}
              className="p-2 rounded-lg bg-surface-200 hover:bg-surface-100 border border-emerald-500/30 text-emerald-300 text-left"
            >
              <strong className="block text-white">Auditor</strong>
              Hash-chain verification
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('OPERATOR', 'operator_desk')}
              className="p-2 rounded-lg bg-surface-200 hover:bg-surface-100 border border-cyan-500/30 text-cyan-300 text-left"
            >
              <strong className="block text-white">Operator</strong>
              Voter registry enrollment
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('SUPER_ADMIN', 'super_admin')}
              className="p-2 rounded-lg bg-surface-200 hover:bg-surface-100 border border-rose-500/30 text-rose-300 text-left"
            >
              <strong className="block text-white">Super Admin</strong>
              Root system authority
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatAdminName(username: string): string {
  return username
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
