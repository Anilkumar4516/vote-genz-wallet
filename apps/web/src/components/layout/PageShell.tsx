import React from 'react';
import { cn } from '../../lib/utils';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const PageShell: React.FC<PageShellProps> = ({ children, className, glow = true }) => {
  return (
    <main className="relative flex-1 flex flex-col items-center justify-start py-8 px-4 sm:px-6 w-full max-w-5xl mx-auto">
      {/* Ambient background glows */}
      {glow && (
        <>
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent blur-3xl rounded-full -z-10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute top-1/3 -left-32 w-72 h-72 bg-emerald-500/5 blur-3xl rounded-full -z-10"
            aria-hidden="true"
          />
        </>
      )}

      <div className={cn('w-full flex flex-col items-center', className)}>
        {children}
      </div>
    </main>
  );
};
