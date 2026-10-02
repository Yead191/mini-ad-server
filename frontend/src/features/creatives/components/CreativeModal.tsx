'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Campaign } from '@/types/campaign';
import { createCreative } from '@/helpers/next-fetch/creativeActions';
import { toast } from 'sonner';
import { UploadCloud, Image as ImageIcon, X, CheckCircle2, Link2 } from 'lucide-react';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [useUrlFallback, setUseUrlFallback] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [clickUrl, setClickUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (campaigns.length > 0 && !campaignId) {
      setCampaignId(campaigns[0].id);
    }
  }, [campaigns, campaignId]);

  // Clean up object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP, GIF)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Auto-detect image dimensions
    const img = new Image();
    img.src = objectUrl;
    img.onload = () => {
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;
      if (naturalW === 300 && naturalH === 250) {
        setSizePreset('300x250');
        setWidth(300);
        setHeight(250);
      } else if (naturalW === 728 && naturalH === 90) {
        setSizePreset('728x90');
        setWidth(728);
        setHeight(90);
      } else {
        setSizePreset('custom');
        setWidth(naturalW);
        setHeight(naturalH);
      }
      toast.success(`Image loaded (${naturalW}×${naturalH}px)`);
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId) {
      toast.error('Please select an active campaign');
      return;
    }

    if (!useUrlFallback && !selectedFile) {
      toast.error('Please upload an ad banner image');
      return;
    }

    if (useUrlFallback && !imageUrl.trim()) {
      toast.error('Image URL is required');
      return;
    }

    if (!clickUrl.trim()) {
      toast.error('Click destination URL is required');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (selectedFile) {
        // Use multipart FormData
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('campaign_id', campaignId);
        formData.append('width', String(width));
        formData.append('height', String(height));
        formData.append('click_url', clickUrl.trim());

        res = await createCreative(formData);
      } else {
        // Fallback to JSON with URL
        res = await createCreative({
          campaign_id: campaignId,
          width: Number(width),
          height: Number(height),
          image_url: imageUrl.trim(),
          click_url: clickUrl.trim(),
        });
      }

      if (res.success) {
        toast.success('Banner creative added successfully');
        handleRemoveFile();
        setImageUrl('');
        setClickUrl('');
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || 'Failed to create creative');
      }
    } catch {
      toast.error('An unexpected error occurred while adding creative');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Banner Creative">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Assign to Campaign
          </label>
          <select
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="">Select a Campaign</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.status})
              </option>
            ))}
          </select>
        </div>

        {/* Banner Upload Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Banner Creative Asset
            </label>
            <button
              type="button"
              onClick={() => {
                setUseUrlFallback(!useUrlFallback);
                handleRemoveFile();
              }}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer transition-colors"
            >
              <Link2 className="h-3 w-3" />
              {useUrlFallback ? 'Upload file instead' : 'Use external URL instead'}
            </button>
          </div>

          {!useUrlFallback ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
                id="banner-file-input"
              />

              {previewUrl ? (
                <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xs flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {selectedFile?.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB • {width}×{height}px
                      </p>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-1">
                        <CheckCircle2 className="h-3 w-3" /> Ready for upload
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-slate-900 bg-slate-100/80 scale-[1.01]'
                      : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/70 text-slate-700 mb-2">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    Click to browse or drag and drop banner image
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports PNG, JPG, WebP, GIF up to 10MB
                  </p>
                </div>
              )}
            </div>
          ) : (
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/banner.png"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          )}
        </div>

        {/* Preset Sizing */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Size Slot Preset
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handlePresetChange('300x250')}
              className={`py-1.5 px-3 text-xs font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                sizePreset === '300x250'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                  : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
              }`}
            >
              300x250 (Medium)
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('728x90')}
              className={`py-1.5 px-3 text-xs font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                sizePreset === '728x90'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                  : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
              }`}
            >
              728x90 (Banner)
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('custom')}
              className={`py-1.5 px-3 text-xs font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                sizePreset === 'custom'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                  : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Click Destination URL (Landing Page)
          </label>
          <input
            type="url"
            required
            value={clickUrl}
            onChange={(e) => setClickUrl(e.target.value)}
            placeholder="https://example.com/product"
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Uploading & Creating...' : 'Add Banner Creative'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
