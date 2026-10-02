import { Creative } from './creative';

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused';
  daily_impression_limit: number;
  created_at: string;
  updated_at: string;
  creatives?: Creative[];
  _count?: {
    ad_events: number;
    creatives: number;
  };
}

export interface CreateCampaignPayload {
  name: string;
  daily_impression_limit: number;
  status?: 'active' | 'paused';
}

export interface UpdateCampaignPayload {
  name?: string;
  daily_impression_limit?: number;
  status?: 'active' | 'paused';
}
