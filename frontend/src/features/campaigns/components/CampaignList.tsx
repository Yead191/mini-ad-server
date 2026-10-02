'use client';

import React, { useState, useEffect } from 'react';
import { Campaign } from '@/types/campaign';
import {
  getCampaigns,
  updateCampaign,
  deleteCampaign,
} from '@/helpers/next-fetch/campaignActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CampaignModal } from './CampaignModal';
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Layers,
  Calendar,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await getCampaigns();
      if (res.success && res.data) {
        setCampaigns(res.data);
      } else {
        toast.error(res.message || 'Failed to fetch campaigns');
      }
    } catch {
      toast.error('Network error loading campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleToggleStatus = async (campaign: Campaign) => {
    const nextStatus = campaign.status === 'active' ? 'paused' : 'active';
    setActionLoadingId(campaign.id);
    try {
      const res = await updateCampaign(campaign.id, { status: nextStatus });
      if (res.success) {
        toast.success(`Campaign ${nextStatus === 'active' ? 'activated' : 'paused'}`);
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaign.id ? { ...c, status: nextStatus } : c))
        );
      } else {
        toast.error(res.message || 'Failed to update campaign');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign? All associated creatives and events will be deleted.')) {
      return;
    }
    setActionLoadingId(id);
    try {
      const res = await deleteCampaign(id);
      if (res.success) {
        toast.success('Campaign deleted');
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
      } else {
        toast.error(res.message || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Campaigns</h2>
          <p className="text-sm text-slate-400">
            Manage delivery states, impression limits, and associated creatives.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCampaigns} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Campaign
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Loading campaigns from PostgreSQL...</p>
          </div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center">
          <Layers className="h-10 w-10 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-white">No campaigns found</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
            Create your first campaign to start configuring creatives and serving ads.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-sm">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Daily Limit</th>
                <th className="px-6 py-4">Creatives</th>
                <th className="px-6 py-4">Total Events</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{c.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      ID: {c.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={c.status === 'active' ? 'active' : 'paused'}>
                      {c.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-medium text-slate-200">
                      {c.daily_impression_limit.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 block">per day</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <Layers className="h-3.5 w-3.5 text-blue-400" />
                      {c._count?.creatives ?? c.creatives?.length ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                      <Eye className="h-3.5 w-3.5 text-emerald-400" />
                      {c._count?.ad_events?.toLocaleString() ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant={c.status === 'active' ? 'secondary' : 'primary'}
                        size="sm"
                        disabled={actionLoadingId === c.id}
                        onClick={() => handleToggleStatus(c)}
                        title={c.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
                      >
                        {c.status === 'active' ? (
                          <>
                            <Pause className="h-3.5 w-3.5 mr-1 text-amber-400" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                            Resume
                          </>
                        )}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={actionLoadingId === c.id}
                        onClick={() => handleDelete(c.id)}
                        title="Delete Campaign"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCampaigns}
      />
    </div>
  );
}
