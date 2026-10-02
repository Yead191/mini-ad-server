import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'active' | 'paused' | 'neutral' | 'info';
}

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  const variants = {
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    paused: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
