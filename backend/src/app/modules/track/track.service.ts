import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { prisma } from '../../../shared/prisma';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const recordImpression = async (
  creativeId: string,
  ip?: string,
  userAgent?: string
): Promise<void> => {
  const creative = await prisma.creative.findUnique({
    where: { id: creativeId },
  });

  if (!creative) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Unknown creative');
  }

  // Record ad event
  await prisma.adEvent.create({
    data: {
      campaign_id: creative.campaign_id,
      creative_id: creative.id,
      type: 'impression',
      ip: ip || null,
      user_agent: userAgent || null,
    },
  });

  // Bonus: increment daily impression count for campaign in Redis
  await RedisHelper.incrementDailyImpression(creative.campaign_id);

  // Bonus: increment frequency cap counter for IP + creative
  if (ip) {
    await RedisHelper.incrementFrequencyCap(creative.id, ip);
  }
};

const recordClick = async (
  creativeId: string,
  ip?: string,
  userAgent?: string
): Promise<string> => {
  const creative = await prisma.creative.findUnique({
    where: { id: creativeId },
  });

  if (!creative) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Unknown creative');
  }

  // Record click event
  await prisma.adEvent.create({
    data: {
      campaign_id: creative.campaign_id,
      creative_id: creative.id,
      type: 'click',
      ip: ip || null,
      user_agent: userAgent || null,
    },
  });

  return creative.click_url;
};

export const TrackService = {
  recordImpression,
  recordClick,
};
