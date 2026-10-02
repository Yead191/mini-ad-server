import { prisma } from '../../../shared/prisma';
import { RedisHelper } from '../../../tools/redis/redis.helper';

export interface IAdResponse {
  creative_id: string;
  html: string;
  impression_url: string;
  click_url: string;
}

interface ICachedCandidate {
  id: string;
  campaign_id: string;
  width: number;
  height: number;
  image_url: string;
  click_url: string;
  campaign: {
    id: string;
    status: string;
    daily_impression_limit: number;
  };
}

const serveAd = async (
  sizeParam: string | undefined,
  clientIp: string = '127.0.0.1'
): Promise<IAdResponse | null> => {
  if (!sizeParam || typeof sizeParam !== 'string') {
    return null;
  }

  // Parse size e.g. "300x250"
  const sizeMatch = sizeParam.trim().toLowerCase().match(/^(\d+)x(\d+)$/);
  if (!sizeMatch) {
    return null;
  }

  const width = parseInt(sizeMatch[1], 10);
  const height = parseInt(sizeMatch[2], 10);

  // Bonus 1: Check Redis cache for candidate list with TTL
  const cacheKey = `ad_candidates:${width}x${height}`;
  let candidates = await RedisHelper.redisGet<ICachedCandidate[]>(cacheKey);

  if (!candidates) {
    // Cache miss: query database for active campaign creatives matching width and height
    const dbCandidates = await prisma.creative.findMany({
      where: {
        width,
        height,
        campaign: {
          status: 'active',
        },
      },
      include: {
        campaign: {
          select: {
            id: true,
            status: true,
            daily_impression_limit: true,
          },
        },
      },
    });

    candidates = dbCandidates as ICachedCandidate[];

    // Cache candidates list in Redis with a 60-second TTL
    await RedisHelper.redisSet(cacheKey, candidates, undefined, 60);
  }

  if (!candidates || candidates.length === 0) {
    return null;
  }

  // Bonus 2 & 3: Filter candidates by Daily Impression Limit and Frequency Capping
  const eligibleCandidates: ICachedCandidate[] = [];

  for (const candidate of candidates) {
    // Verify campaign is still active
    if (candidate.campaign.status !== 'active') {
      continue;
    }

    // Bonus 3: Enforce each campaign's daily_impression_limit
    const limitReached = await RedisHelper.isDailyLimitReached(
      candidate.campaign_id,
      candidate.campaign.daily_impression_limit
    );
    if (limitReached) {
      continue;
    }

    // Bonus 2: Frequency cap (no more than 3 impressions per creative per IP per day)
    const frequencyCapped = await RedisHelper.isFrequencyCapped(
      candidate.id,
      clientIp,
      3
    );
    if (frequencyCapped) {
      continue;
    }

    eligibleCandidates.push(candidate);
  }

  if (eligibleCandidates.length === 0) {
    return null;
  }

  // Random selection from active, eligible candidates
  const randomIndex = Math.floor(Math.random() * eligibleCandidates.length);
  const chosen = eligibleCandidates[randomIndex];

  const html = `<img src="${chosen.image_url}" width="${chosen.width}" height="${chosen.height}" alt="Ad" style="display:block;max-width:100%;height:auto;" />`;
  const impression_url = `/track/impression?c=${chosen.id}`;
  const click_url = `/track/click?c=${chosen.id}`;

  return {
    creative_id: chosen.id,
    html,
    impression_url,
    click_url,
  };
};

export const AdService = {
  serveAd,
};
