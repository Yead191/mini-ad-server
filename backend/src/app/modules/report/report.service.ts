import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { prisma } from '../../../shared/prisma';

export interface ICampaignReportItem {
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface IDayReportItem {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

const isValidDateString = (dateStr: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};

const generateReport = async (
  from: string | undefined,
  to: string | undefined,
  groupBy: string = 'campaign',
): Promise<ICampaignReportItem[] | IDayReportItem[]> => {
  if (!from || !isValidDateString(from)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Invalid or missing "from" date. Format must be YYYY-MM-DD.',
    );
  }

  if (!to || !isValidDateString(to)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Invalid or missing "to" date. Format must be YYYY-MM-DD.',
    );
  }

  const startDate = new Date(`${from}T00:00:00.000Z`);
  const endDate = new Date(`${to}T23:59:59.999Z`);

  if (startDate > endDate) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      '"from" date cannot be after "to" date.',
    );
  }

  // Validate group_by
  const normalizedGroupBy = groupBy.trim().toLowerCase();
  if (normalizedGroupBy !== 'campaign' && normalizedGroupBy !== 'day') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Invalid "group_by" parameter. Must be either "campaign" or "day".',
    );
  }

  // Fetch all events
  const events = await prisma.adEvent.findMany({
    where: {
      created_at: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      campaign_id: true,
      type: true,
      created_at: true,
    },
  });

  if (normalizedGroupBy === 'campaign') {
    // Get campaign details
    const campaigns = await prisma.campaign.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const campaignMap = new Map<string, string>();
    campaigns.forEach(c => campaignMap.set(c.id, c.name));

    // Group counts by campaign id
    const statsByCampaign = new Map<
      string,
      { impressions: number; clicks: number }
    >();

    campaigns.forEach(c => {
      statsByCampaign.set(c.id, { impressions: 0, clicks: 0 });
    });

    for (const ev of events) {
      if (!statsByCampaign.has(ev.campaign_id)) {
        statsByCampaign.set(ev.campaign_id, { impressions: 0, clicks: 0 });
      }
      const stat = statsByCampaign.get(ev.campaign_id)!;
      if (ev.type === 'impression') {
        stat.impressions += 1;
      } else if (ev.type === 'click') {
        stat.clicks += 1;
      }
    }

    const report: ICampaignReportItem[] = [];

    statsByCampaign.forEach((stats, campaignId) => {
      const impressions = stats.impressions;
      const clicks = stats.clicks;
      const ctr =
        impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;

      report.push({
        campaign_id: campaignId,
        campaign_name: campaignMap.get(campaignId) || 'Unknown Campaign',
        impressions,
        clicks,
        ctr,
      });
    });

    // Sort by impressions descending
    return report.sort((a, b) => b.impressions - a.impressions);
  } else {
    const statsByDay = new Map<
      string,
      { impressions: number; clicks: number }
    >();

    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      statsByDay.set(dateStr, { impressions: 0, clicks: 0 });
      current.setUTCDate(current.getUTCDate() + 1);
    }

    for (const ev of events) {
      const dayStr = ev.created_at.toISOString().split('T')[0];
      if (!statsByDay.has(dayStr)) {
        statsByDay.set(dayStr, { impressions: 0, clicks: 0 });
      }
      const stat = statsByDay.get(dayStr)!;
      if (ev.type === 'impression') {
        stat.impressions += 1;
      } else if (ev.type === 'click') {
        stat.clicks += 1;
      }
    }

    const report: IDayReportItem[] = [];

    statsByDay.forEach((stats, date) => {
      const impressions = stats.impressions;
      const clicks = stats.clicks;
      const ctr =
        impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;

      report.push({
        date,
        impressions,
        clicks,
        ctr,
      });
    });

    // Sort by date ascending
    return report.sort((a, b) => a.date.localeCompare(b.date));
  }
};

export const ReportService = {
  generateReport,
};
