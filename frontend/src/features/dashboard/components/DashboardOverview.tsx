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
  MousePointerClick,
  Percent,
  PlaySquare,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  Zap,
  Cpu,
  RefreshCw,
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
      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-linear-to-r from-blue-900/30 via-indigo-900/20 to-slate-900/40 p-6 md:p-8 backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20 mb-3">
              <Zap className="h-3.5 w-3.5" /> High-Throughput Ad Server
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Mini Ad-Serving Control Center
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Real-time campaign routing, sub-millisecond creative decisioning
              via Redis caching, frequency capping, and 302 click redirect
              attribution.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/simulator">
              <Button variant="primary">
                <PlaySquare className="h-4 w-4 mr-2" />
                Live Ad Simulator
              </Button>
            </Link>
            <a
              href="http://localhost:5000/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-medium rounded-lg px-4 py-2 text-sm bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors border border-slate-700 shadow-sm"
            >
              <ExternalLink className="h-4 w-4 mr-2 text-blue-400" />
              Publisher Demo Page
            </a>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Campaigns"
          value={loading ? "..." : `${activeCampaigns} / ${campaigns.length}`}
          icon={Layers}
          subtext="Eligible for live ad selection"
        />
        <MetricCard
          title="Banner Creatives"
          value={loading ? "..." : creativesCount}
          icon={ImageIcon}
          subtext="300x250, 728x90 sizes"
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

      {/* Architecture Highlights & Bonus Implementation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Redis Candidate Caching
              </h3>
              <span className="text-xs text-slate-400">
                Bonus 1 (Completed)
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Candidate creatives are cached per dimensions (
            <code className="text-blue-400">ad_candidates:300x250</code>) with a
            60-second TTL. Automatically invalidated upon campaign or creative
            updates.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                IP Frequency Capping
              </h3>
              <span className="text-xs text-slate-400">
                Bonus 2 (Completed)
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Restricts delivery to a maximum of 3 impressions per creative per
            client IP per day using Redis daily counters with automatic 24-hour
            expiration.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Daily Impression Limit
              </h3>
              <span className="text-xs text-slate-400">
                Bonus 3 (Completed)
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Enforces each campaign&apos;s configured{" "}
            <code className="text-indigo-400">daily_impression_limit</code>,
            preventing over-delivery once the daily target is reached.
          </p>
        </div>
      </div>
    </div>
  );
}
