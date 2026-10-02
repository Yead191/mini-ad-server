'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getReport } from '@/helpers/next-fetch/reportActions';
import { CampaignReportItem, DayReportItem, ReportResult } from '@/types/report';
import { MetricCard } from '@/components/shared/MetricCard';
import { Button } from '@/components/ui/button';
import { Eye, MousePointerClick, Percent, Calendar, RefreshCw, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';

export function ReportAnalyticsView() {
  const getDefaultDates = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    return {
      from: sevenDaysAgo.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    };
  };

  const defaults = getDefaultDates();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [groupBy, setGroupBy] = useState<'campaign' | 'day'>('campaign');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportResult>([]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReport(from, to, groupBy);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error(res.message || 'Failed to fetch report');
      }
    } catch {
      toast.error('Network error loading reports');
    } finally {
      setLoading(false);
    }
  }, [from, to, groupBy]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Aggregate totals
  const totalImpressions = data.reduce((acc, curr) => acc + curr.impressions, 0);
  const totalClicks = data.reduce((acc, curr) => acc + curr.clicks, 0);
  const averageCtr =
    totalImpressions > 0
      ? Number(((totalClicks / totalImpressions) * 100).toFixed(2))
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Performance Reports & CTR
          </h2>
          <p className="text-sm text-slate-400">
            Real-time attribution telemetry grouped by campaign or calendar day.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              From:
            </span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              To:
            </span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setGroupBy('campaign')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                groupBy === 'campaign'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              By Campaign
            </button>
            <button
              onClick={() => setGroupBy('day')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                groupBy === 'day'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              By Day
            </button>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={fetchReport} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Run Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Impressions"
          value={totalImpressions.toLocaleString()}
          icon={Eye}
          subtext="Ad impressions verified via 1x1 pixel"
        />
        <MetricCard
          title="Total Clicks"
          value={totalClicks.toLocaleString()}
          icon={MousePointerClick}
          subtext="Clicks captured through 302 tracking"
        />
        <MetricCard
          title="Overall CTR"
          value={`${averageCtr}%`}
          icon={Percent}
          change={averageCtr > 2 ? 'Strong' : 'Healthy'}
          isPositive={averageCtr > 2}
          subtext="Clicks ÷ Impressions × 100"
        />
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-blue-400" />
            Attribution Breakdown ({groupBy === 'campaign' ? 'Campaign Grouping' : 'Daily Timeline'})
          </h3>
          <span className="text-xs text-slate-400">
            {data.length} {data.length === 1 ? 'record' : 'records'} returned
          </span>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No telemetry records found for this date range. Try broadening the filter.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="px-6 py-3.5">
                  {groupBy === 'campaign' ? 'Campaign Name' : 'Calendar Date'}
                </th>
                <th className="px-6 py-3.5">Impressions</th>
                <th className="px-6 py-3.5">Clicks</th>
                <th className="px-6 py-3.5">CTR Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.map((item, idx) => {
                const isCampaign = groupBy === 'campaign';
                const label = isCampaign
                  ? (item as CampaignReportItem).campaign_name
                  : (item as DayReportItem).date;

                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{label}</div>
                      {isCampaign && (
                        <div className="text-xs font-mono text-slate-500">
                          {(item as CampaignReportItem).campaign_id}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {item.impressions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {item.clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-400 w-12 font-mono">
                          {item.ctr}%
                        </span>
                        <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(item.ctr * 5, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
