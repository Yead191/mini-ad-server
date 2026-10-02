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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Overview", href: "/", icon: Target },
  { name: "Campaigns", href: "/campaigns", icon: Layers },
  { name: "Creatives", href: "/creatives", icon: ImageIcon },
  { name: "Reports & CTR", href: "/reports", icon: BarChart3 },
  { name: "Ad Simulator", href: "/simulator", icon: PlaySquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-slate-200/80 bg-white p-5  flex-col justify-between hidden md:flex z-30 overflow-y-auto">
      <div>
        {/* Brand header */}
        <div className="flex items-center gap-3 px-2 py-2 mb-6">
          <div>
            <h1 className="font-bold text-slate-900 text-base tracking-tight leading-tight">
              AdForge
            </h1>
            <span className="text-xs font-medium text-slate-500">
              Mini Ad Server
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
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
                  "flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-slate-100 text-slate-900 font-semibold shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-slate-900" : "text-slate-400",
                  )}
                />
                <span className="leading-none">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* External Publisher Demo link */}
      <div className="border-t border-slate-100 pt-4 mt-6">
        <a
          href="http://localhost:5000/demo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200/80 shadow-2xs"
        >
          <span className="flex items-center gap-2.5">
            <ExternalLink className="h-4 w-4 text-slate-500 shrink-0" />
            Publisher Demo
          </span>
          <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-xs font-semibold text-slate-600">
            HTML
          </span>
        </a>
      </div>
    </aside>
  );
}
