import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  subtext?: string;
}

export function MetricCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  subtext,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:border-slate-300">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className="rounded-md bg-slate-100 p-1.5 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              'text-xs font-medium',
              isPositive ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-slate-600'
            )}
          >
            {change}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
}
