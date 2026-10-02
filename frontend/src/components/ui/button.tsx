import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variants = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-xs active:scale-[0.99]',
      secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-xs focus:ring-slate-400',
      outline: 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 shadow-xs',
      danger: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 focus:ring-rose-500',
      ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    };

    const sizes = {
      sm: 'px-2.5 py-1.5 text-xs',
      md: 'px-3.5 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
