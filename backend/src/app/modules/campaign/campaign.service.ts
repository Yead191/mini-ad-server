import { Campaign } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { prisma } from '../../../shared/prisma';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const createCampaignToDB = async (payload: {
  name: string;
  daily_impression_limit: number;
  status?: string;
}): Promise<Campaign> => {
  const result = await prisma.campaign.create({
    data: {
      name: payload.name,
      daily_impression_limit: payload.daily_impression_limit,
      status: payload.status || 'active',
    },
  });

  await RedisHelper.invalidateAdCache();
  return result;
};

const getAllCampaignsFromDB = async (): Promise<Campaign[]> => {
  const result = await prisma.campaign.findMany({
    include: {
      creatives: true,
      _count: {
        select: {
          ad_events: true,
          creatives: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });
  return result;
};

const getCampaignByIdFromDB = async (id: string): Promise<Campaign | null> => {
  const result = await prisma.campaign.findUnique({
    where: { id },
    include: {
      creatives: true,
      _count: {
        select: {
          ad_events: true,
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Campaign not found');
  }

  return result;
};

const updateCampaignToDB = async (
  id: string,
  payload: Partial<Campaign>
): Promise<Campaign> => {
  const isExist = await prisma.campaign.findUnique({ where: { id } });
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Campaign not found');
  }

  const result = await prisma.campaign.update({
    where: { id },
    data: payload,
  });

  await RedisHelper.invalidateAdCache();
  return result;
};

const deleteCampaignFromDB = async (id: string): Promise<Campaign> => {
  const isExist = await prisma.campaign.findUnique({ where: { id } });
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Campaign not found');
  }

  const result = await prisma.campaign.delete({
    where: { id },
  });

  await RedisHelper.invalidateAdCache();
  return result;
};

export const CampaignService = {
  createCampaignToDB,
  getAllCampaignsFromDB,
  getCampaignByIdFromDB,
  updateCampaignToDB,
  deleteCampaignFromDB,
};
