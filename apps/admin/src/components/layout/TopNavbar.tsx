'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '../../store/admin-auth.store';
import { getRoleBadgeStyle } from '../../lib/rbac';
import { LogOut, User, Clock, ShieldCheck, Bell } from 'lucide-react';

export const TopNavbar: React.FC = () => {
  const { user, logout } = useAdminAuthStore();
  const router = useRouter();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const roleStyle = user ? getRoleBadgeStyle(user.role) : null;

  return (
    <header className="h-16 border-b border-slate-800 bg-surface-400/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Active Environment & UTC Clock */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-200 border border-slate-700/80">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-bold">OPERATIONS CENTER ONLINE</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{time || '12:00:00 UTC'}</span>
        </div>
      </div>

      {/* Right: User Profile & Role & Logout */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-white">{user.name}</span>
              {roleStyle && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block mt-0.5 ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                >
                  {user.role}
                </span>
              )}
            </div>

            <div className="w-9 h-9 rounded-full bg-surface-100 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-sm">
              <User className="w-4 h-4" />
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors ml-1"
              title="Sign Out of Operations Console"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="text-xs text-cyan-400 hover:underline font-semibold"
          >
            Sign In &rarr;
          </button>
        )}
      </div>
    </header>
  );
};
