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
        toast.success(`Campaign ${nextStatus === 'active' ? 'resumed' : 'paused'}`);
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
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Campaigns</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage delivery states, impression limits, and associated creatives.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={fetchCampaigns} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Campaign
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <div className="text-center">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading campaigns...</p>
          </div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Layers className="h-10 w-10 text-slate-400 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No campaigns found</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            Create your first campaign to start configuring creatives and serving ads.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-5 py-3">Campaign Name</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Daily Limit</th>
                <th className="px-5 py-3">Creatives</th>
                <th className="px-5 py-3">Total Events</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/75 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {c.id}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={c.status === 'active' ? 'active' : 'paused'}>
                      {c.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-medium text-slate-900">
                      {c.daily_impression_limit.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">per day</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                      <Layers className="h-3.5 w-3.5 text-slate-400" />
                      {c._count?.creatives ?? c.creatives?.length ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-slate-700 font-mono">
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      {c._count?.ad_events?.toLocaleString() ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={actionLoadingId === c.id}
                        onClick={() => handleToggleStatus(c)}
                        title={c.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
                      >
                        {c.status === 'active' ? (
                          <>
                            <Pause className="h-3 w-3 mr-1 text-amber-600" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1 text-emerald-600" />
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
                        <Trash2 className="h-3 w-3" />
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
