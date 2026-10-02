'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Campaign } from '@/types/campaign';
import { createCreative } from '@/helpers/next-fetch/creativeActions';
import { toast } from 'sonner';

interface CreativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaigns: Campaign[];
}

export function CreativeModal({
  isOpen,
  onClose,
  onSuccess,
  campaigns,
}: CreativeModalProps) {
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id || '');
  const [sizePreset, setSizePreset] = useState<'300x250' | '728x90' | 'custom'>('300x250');
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(250);
  const [imageUrl, setImageUrl] = useState('');
  const [clickUrl, setClickUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePresetChange = (preset: '300x250' | '728x90' | 'custom') => {
    setSizePreset(preset);
    if (preset === '300x250') {
      setWidth(300);
      setHeight(250);
    } else if (preset === '728x90') {
      setWidth(728);
      setHeight(90);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId) {
      toast.error('Please select an active campaign');
      return;
    }
    if (!imageUrl.trim()) {
      toast.error('Image URL is required');
      return;
    }
    if (!clickUrl.trim()) {
      toast.error('Click destination URL is required');
      return;
    }

    setLoading(true);
    try {
      const res = await createCreative({
        campaign_id: campaignId,
        width: Number(width),
        height: Number(height),
        image_url: imageUrl.trim(),
        click_url: clickUrl.trim(),
      });

      if (res.success) {
        toast.success('Creative added successfully');
        setImageUrl('');
        setClickUrl('');
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || 'Failed to create creative');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Creative">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Assign to Campaign
          </label>
          <select
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select a Campaign</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Size Slot Preset
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handlePresetChange('300x250')}
              className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                sizePreset === '300x250'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              300x250 (Medium)
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('728x90')}
              className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                sizePreset === '728x90'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              728x90 (Banner)
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('custom')}
              className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                sizePreset === 'custom'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Custom Size
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Width (px)
            </label>
            <input
              type="number"
              required
              min={10}
              value={width}
              onChange={(e) => {
                setWidth(parseInt(e.target.value, 10) || 0);
                setSizePreset('custom');
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Height (px)
            </label>
            <input
              type="number"
              required
              min={10}
              value={height}
              onChange={(e) => {
                setHeight(parseInt(e.target.value, 10) || 0);
                setSizePreset('custom');
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Banner Image URL
          </label>
          <input
            type="url"
            required
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/banner.png"
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Click Destination URL (Landing Page)
          </label>
          <input
            type="url"
            required
            value={clickUrl}
            onChange={(e) => setClickUrl(e.target.value)}
            placeholder="https://clientpage.com/product"
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Creative'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
