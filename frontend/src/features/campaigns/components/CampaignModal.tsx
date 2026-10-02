'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { createCampaign } from '@/helpers/next-fetch/campaignActions';
import { toast } from 'sonner';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CampaignModal({ isOpen, onClose, onSuccess }: CampaignModalProps) {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState(1000);
  const [status, setStatus] = useState<'active' | 'paused'>('active');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Campaign name is required');
      return;
    }
    if (limit <= 0) {
      toast.error('Daily impression limit must be positive');
      return;
    }

    setLoading(true);
    try {
      const res = await createCampaign({
        name: name.trim(),
        daily_impression_limit: Number(limit),
        status,
      });

      if (res.success) {
        toast.success('Campaign created successfully');
        setName('');
        setLimit(1000);
        setStatus('active');
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || 'Failed to create campaign');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Campaign">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Campaign Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q4 Growth Sprint"
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Daily Impression Limit
          </label>
          <input
            type="number"
            required
            min={1}
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10) || 0)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-slate-500">
            Ad server stops serving once campaign reaches this daily limit.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Initial Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'paused')}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="active">Active (Eligible for ad serving)</option>
            <option value="paused">Paused (Do not serve)</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
