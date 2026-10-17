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
    <header className="h-16 border-b border-yellow-200 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Active Environment & UTC Clock */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-emerald-800 font-bold">OPERATIONS CENTER ONLINE</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-slate-600">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>{time || '12:00:00 UTC'}</span>
        </div>
      </div>

      {/* Right: User Profile & Role & Logout */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900">{user.name}</span>
              {roleStyle && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block mt-0.5 ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                >
                  {user.role}
                </span>
              )}
            </div>

            <div className="w-9 h-9 rounded-full bg-amber-100 border border-yellow-300 flex items-center justify-center text-amber-700 shadow-sm">
              <User className="w-4 h-4" />
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
              title="Sign Out of Operations Console"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="text-xs text-amber-700 hover:underline font-bold"
          >
            Sign In &rarr;
          </button>
        )}
      </div>
    </header>
  );
};
