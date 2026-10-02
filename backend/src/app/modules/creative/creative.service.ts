import { Creative } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { prisma } from '../../../shared/prisma';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const createCreativeToDB = async (payload: {
  campaign_id: string;
  width: number;
  height: number;
  image_url: string;
  click_url: string;
}): Promise<Creative> => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: payload.campaign_id },
  });

  if (!campaign) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Associated campaign not found');
  }

  const result = await prisma.creative.create({
    data: payload,
  });

  await RedisHelper.invalidateAdCache();
  return result;
};

const getAllCreativesFromDB = async (campaignId?: string): Promise<Creative[]> => {
  const where = campaignId ? { campaign_id: campaignId } : {};
  const result = await prisma.creative.findMany({
    where,
    include: {
      campaign: true,
      _count: {
        select: {
          ad_events: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });
  return result;
};

const getCreativeByIdFromDB = async (id: string): Promise<Creative | null> => {
  const result = await prisma.creative.findUnique({
    where: { id },
    include: {
      campaign: true,
      _count: {
        select: {
          ad_events: true,
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Creative not found');
  }

  return result;
};

const updateCreativeToDB = async (
  id: string,
  payload: Partial<Creative>
): Promise<Creative> => {
  const isExist = await prisma.creative.findUnique({ where: { id } });
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Creative not found');
  }

  const result = await prisma.creative.update({
    where: { id },
    data: payload,
  });

  await RedisHelper.invalidateAdCache();
  return result;
};

const deleteCreativeFromDB = async (id: string): Promise<Creative> => {
  const isExist = await prisma.creative.findUnique({ where: { id } });
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Creative not found');
  }

  const result = await prisma.creative.delete({
    where: { id },
  });

  await RedisHelper.invalidateAdCache();
  return result;
};

export const CreativeService = {
  createCreativeToDB,
  getAllCreativesFromDB,
  getCreativeByIdFromDB,
  updateCreativeToDB,
  deleteCreativeFromDB,
};
