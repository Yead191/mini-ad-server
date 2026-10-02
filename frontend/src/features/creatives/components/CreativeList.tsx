"use client";

import React, { useState, useEffect } from "react";
import { Creative } from "@/types/creative";
import { Campaign } from "@/types/campaign";
import {
  getCreatives,
  deleteCreative,
} from "@/helpers/next-fetch/creativeActions";
import { getCampaigns } from "@/helpers/next-fetch/campaignActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreativeModal } from "./CreativeModal";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

export function CreativeList() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [creativeRes, campaignRes] = await Promise.all([
        getCreatives(),
        getCampaigns(),
      ]);

      if (creativeRes.success && creativeRes.data) {
        setCreatives(creativeRes.data);
      }
      if (campaignRes.success && campaignRes.data) {
        setCampaigns(campaignRes.data);
      }
    } catch {
      toast.error("Failed to load creatives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this creative?")) return;
    setDeletingId(id);
    try {
      const res = await deleteCreative(id);
      if (res.success) {
        toast.success("Creative deleted");
        setCreatives((prev) => prev.filter((c) => c.id !== id));
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Creatives
          </h2>
          <p className="text-sm text-slate-400">
            Banners, dimensions, image assets, and tracking landing pages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Creative
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : creatives.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center">
          <ImageIcon className="h-10 w-10 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-white">
            No creatives found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
            Add banner creatives with width, height, and destination links.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Creative
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {creatives.map((c) => (
            <div
              key={c.id}
              className="flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md transition-all hover:border-slate-700"
            >
              {/* Image Preview Banner */}
              <div className="relative h-44 bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image_url}
                  alt={`Creative ${c.width}x${c.height}`}
                  className="max-h-full max-w-full object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="info">
                    {c.width} × {c.height}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Layers className="h-3.5 w-3.5 text-blue-400" />
                    <span className="font-medium text-slate-300 truncate">
                      {c.campaign?.name || "Unassigned"}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-500 truncate">
                    ID: {c.id}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <a
                    href={c.click_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium truncate max-w-[200px]"
                  >
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    Live Link
                  </a>

                  <Button
                    variant="danger"
                    size="sm"
                    disabled={deletingId === c.id}
                    onClick={() => handleDelete(c.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreativeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        campaigns={campaigns}
      />
    </div>
  );
}
