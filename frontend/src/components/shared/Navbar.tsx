"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Database, Cpu } from "lucide-react";

export function Navbar() {
  return (
    <header className="flex h-16 items-center justify-end border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-md">
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
