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
  clientIp: string = '127.0.0.1',
  ignoreCap: boolean = false
): Promise<IAdResponse | null> => {
  if (!sizeParam || typeof sizeParam !== 'string') {
    return null;
  }

  const sizeMatch = sizeParam
    .trim()
    .toLowerCase()
    .match(/^(\d+)x(\d+)$/);
  if (!sizeMatch) {
    return null;
  }

  const width = parseInt(sizeMatch[1], 10);
  const height = parseInt(sizeMatch[2], 10);

  const cacheKey = `ad_candidates:${width}x${height}`;
  let candidates = await RedisHelper.redisGet<ICachedCandidate[]>(cacheKey);

  if (!candidates) {
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

    await RedisHelper.redisSet(cacheKey, candidates, undefined, 60);
  }

  if (!candidates || candidates.length === 0) {
    return null;
  }

  const eligibleCandidates: ICachedCandidate[] = [];

  for (const candidate of candidates) {
    if (candidate.campaign.status !== 'active') {
      continue;
    }

    const limitReached = await RedisHelper.isDailyLimitReached(
      candidate.campaign_id,
      candidate.campaign.daily_impression_limit,
    );
    if (limitReached) {
      continue;
    }
    if (!ignoreCap) {
      const frequencyCapped = await RedisHelper.isFrequencyCapped(
        candidate.id,
        clientIp,
        3,
      );
      if (frequencyCapped) {
        continue;
      }
    }

    eligibleCandidates.push(candidate);
  }

  if (eligibleCandidates.length === 0) {
    return null;
  }

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
