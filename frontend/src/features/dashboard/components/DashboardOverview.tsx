"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/shared/MetricCard";
import { Button } from "@/components/ui/button";
import { getCampaigns } from "@/helpers/next-fetch/campaignActions";
import { getCreatives } from "@/helpers/next-fetch/creativeActions";
import { getReport } from "@/helpers/next-fetch/reportActions";
import { Campaign } from "@/types/campaign";
import {
  Layers,
  Image as ImageIcon,
  Eye,
  Percent,
  PlaySquare,
  ExternalLink,
  ShieldCheck,
  Zap,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";

export function DashboardOverview() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [creativesCount, setCreativesCount] = useState(0);
  const [totalImpressions, setTotalImpressions] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const fromDate = thirtyDaysAgo.toISOString().split("T")[0];

      const [campRes, creatRes, repRes] = await Promise.all([
        getCampaigns(),
        getCreatives(),
        getReport(fromDate, today, "campaign"),
      ]);

      if (campRes.success && campRes.data) {
        setCampaigns(campRes.data);
      }
      if (creatRes.success && creatRes.data) {
        setCreativesCount(creatRes.data.length);
      }
      if (repRes.success && repRes.data) {
        const imps = repRes.data.reduce(
          (acc, curr) => acc + curr.impressions,
          0,
        );
        const clks = repRes.data.reduce((acc, curr) => acc + curr.clicks, 0);
        setTotalImpressions(imps);
        setTotalClicks(clks);
      }
    } catch {
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const ctr =
    totalImpressions > 0
      ? Number(((totalClicks / totalImpressions) * 100).toFixed(2))
      : 0;

  return (
    <div className="space-y-8">
      {/* Header section - clean & functional */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Ad Server Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time campaign routing, Redis caching, daily caps, and attribution tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/simulator">
            <Button variant="primary" size="sm">
              <PlaySquare className="h-4 w-4 mr-1.5" />
              Live Ad Simulator
            </Button>
          </Link>
          <a
            href="http://localhost:5000/demo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" size="sm">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
              Publisher Demo
            </Button>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Campaigns"
          value={loading ? "..." : `${activeCampaigns} / ${campaigns.length}`}
          icon={Layers}
          subtext="Eligible for ad serving"
        />
        <MetricCard
          title="Banner Creatives"
          value={loading ? "..." : creativesCount}
          icon={ImageIcon}
          subtext="Configured banner dimensions"
        />
        <MetricCard
          title="Total Impressions"
          value={loading ? "..." : totalImpressions.toLocaleString()}
          icon={Eye}
          subtext="Verified via 1x1 transparent pixel"
        />
        <MetricCard
          title="Click-Through Rate"
          value={loading ? "..." : `${ctr}%`}
          change={`${totalClicks} clicks`}
          isPositive={ctr > 2}
          icon={Percent}
          subtext="Clicks ÷ Impressions × 100"
        />
      </div>

      {/* Architecture Highlights & Engine Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Redis Candidate Caching
              </h3>
              <span className="text-[11px] text-slate-500">Sub-millisecond candidate lookup</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eligible creatives are cached by dimension (<code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700 font-mono text-[11px]">ad_candidates:300x250</code>) with a 60-second TTL. Flushed on campaign updates.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                IP Frequency Capping
              </h3>
              <span className="text-[11px] text-slate-500">Ad fatigue prevention</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Restricts delivery to a maximum of 3 impressions per creative per client IP per day using Redis daily counters with 24-hour expiration.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-purple-50 p-2 text-purple-700">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Daily Impression Limit
              </h3>
              <span className="text-[11px] text-slate-500">Budget enforcement</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Enforces each campaign&apos;s configured <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700 font-mono text-[11px]">daily_impression_limit</code>, preventing over-delivery once daily impression target is achieved.
          </p>
        </div>
      </div>
    </div>
  );
}
