export interface Creative {
  id: string;
  campaign_id: string;
  width: number;
  height: number;
  image_url: string;
  click_url: string;
  created_at: string;
  updated_at: string;
  campaign?: {
    id: string;
    name: string;
    status: string;
  };
  _count?: {
    ad_events: number;
  };
}

export interface CreateCreativePayload {
  campaign_id: string;
  width: number;
  height: number;
  image_url: string;
  click_url: string;
}

export interface UpdateCreativePayload {
  width?: number;
  height?: number;
  image_url?: string;
  click_url?: string;
}
