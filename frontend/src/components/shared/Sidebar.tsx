"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Layers,
  Image as ImageIcon,
  PlaySquare,
  ExternalLink,
  Target,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Target },
  { name: "Campaigns", href: "/campaigns", icon: Layers },
  { name: "Creatives", href: "/creatives", icon: ImageIcon },
  { name: "Reports & CTR", href: "/reports", icon: BarChart3 },
  { name: "Ad Simulator", href: "/simulator", icon: PlaySquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950 p-5  flex-col justify-between hidden md:flex">
      <div>
        {/* Brand header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-none">
              AdForge
            </h1>
            <span className="text-[11px] font-medium text-slate-400">
              Mini Ad Server Engine
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-blue-400" : "text-slate-400",
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* External Publisher Demo link */}
      <div className="border-t border-slate-800 pt-4">
        <a
          href="http://localhost:5000/demo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all border border-slate-800"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-blue-400" />
            Open Publisher Demo
          </span>
          <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
            HTML
          </span>
        </a>
      </div>
    </aside>
  );
}
