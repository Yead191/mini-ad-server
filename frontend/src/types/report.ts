export interface CampaignReportItem {
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface DayReportItem {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

export type ReportResult = CampaignReportItem[] | DayReportItem[];
