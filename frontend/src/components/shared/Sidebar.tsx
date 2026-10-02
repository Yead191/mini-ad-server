'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Layers,
  Image as ImageIcon,
  PlaySquare,
  ExternalLink,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { name: 'Overview', href: '/', icon: Target },
  { name: 'Campaigns', href: '/campaigns', icon: Layers },
  { name: 'Creatives', href: '/creatives', icon: ImageIcon },
  { name: 'Reports & CTR', href: '/reports', icon: BarChart3 },
  { name: 'Ad Simulator', href: '/simulator', icon: PlaySquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 border-r border-slate-200/80 bg-white p-5 flex flex-col justify-between hidden md:flex">
      <div>
        {/* Brand header */}
        <div className="flex items-center gap-2.5 px-2 py-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm shadow-xs">
            A
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 text-sm tracking-tight leading-none">
              AdForge
            </h1>
            <span className="text-[11px] font-medium text-slate-400">
              Mini Ad Server
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4',
                    isActive ? 'text-slate-900' : 'text-slate-400'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* External Publisher Demo link */}
      <div className="border-t border-slate-100 pt-4">
        <a
          href="http://localhost:5000/demo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200/70"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            Publisher Demo
          </span>
          <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
            HTML
          </span>
        </a>
      </div>
    </aside>
  );
}
