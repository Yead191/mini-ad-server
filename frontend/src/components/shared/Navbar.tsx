'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Database, Cpu } from 'lucide-react';

export function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Engine Live: Express + PostgreSQL + Redis
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="http://localhost:5000/demo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Publisher Demo Page
        </a>
      </div>
    </header>
  );
}
