import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'cyan' | 'emerald' | 'amber' | 'yellow' | 'none';
  variant?: 'glass' | 'solid' | 'interactive';
}

export const Card: React.FC<CardProps> = ({
  className,
  glow = 'none',
  variant = 'glass',
  children,
  ...props
}) => {
  const glowClasses = {
    none: '',
    cyan: 'border-cyan-500/30 shadow-glow-cyan',
    emerald: 'border-emerald-500/30 shadow-glow-emerald',
    amber: 'border-yellow-400 shadow-md',
    yellow: 'border-yellow-300 shadow-md',
  };

  const variantClasses = {
    glass: 'glass-card',
    solid: 'bg-surface-200 border border-slate-800',
    interactive: 'glass-card hover:scale-[1.01] cursor-pointer',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-6 relative overflow-hidden',
        variantClasses[variant],
        glowClasses[glow],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
