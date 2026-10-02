'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

export function Navbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200/80 bg-white px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          Engine Active: PostgreSQL + Redis + Express
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="http://localhost:5000/demo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
        >
          <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
          Publisher Demo Page
        </a>
      </div>
    </header>
  );
}
