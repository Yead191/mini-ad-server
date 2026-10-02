import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'active' | 'paused' | 'neutral' | 'info';
}

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  const variants = {
    active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    paused: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
