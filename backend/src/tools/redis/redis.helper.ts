import { redisClient } from '../../config/redis';

const buildField = (query: Record<string, any>): string => {
  if (!query) return '';
  const sortedQuery = Object.keys(query)
    .sort()
    .reduce((acc: Record<string, any>, key) => {
      acc[key] = query[key];
      return acc;
    }, {});

  return new URLSearchParams(sortedQuery as Record<string, string>).toString();
};

const redisSet = async (
  key: string,
  value: any,
  query?: Record<string, any>,
  ttl: number = 60
) => {
  try {
    const queryString = query ? buildField(query) : '';
    const fullKey = queryString ? `${key}:${queryString}` : key;
    await redisClient.set(fullKey, JSON.stringify(value), 'EX', ttl);
    return true;
  } catch {
    return false;
  }
};

const redisGet = async <T = any>(
  key: string,
  query?: Record<string, any>
): Promise<T | null> => {
  try {
    const queryString = query ? buildField(query) : '';
    const fullKey = queryString ? `${key}:${queryString}` : key;
    const raw = await redisClient.get(fullKey);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const keyDelete = async (pattern: string) => {
  try {
    const stream = redisClient.scanStream({ match: pattern });
    const keys: string[] = [];
    for await (const resultKeys of stream) {
      for (const key of resultKeys) {
        keys.push(key);
      }
    }
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch {
    // Fail silently if redis is unavailable
  }
};

// Helper to get today's date string YYYY-MM-DD
const getTodayKey = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

// Bonus: Frequency Cap Check
// No more than maxImpressions per creative per IP per day (default 3)
const isFrequencyCapped = async (
  creativeId: string,
  ip: string,
  limit: number = 3
): Promise<boolean> => {
  try {
    const key = `freq:${creativeId}:${ip}:${getTodayKey()}`;
    const count = await redisClient.get(key);
    if (count !== null && Number(count) >= limit) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

const incrementFrequencyCap = async (
  creativeId: string,
  ip: string
): Promise<number> => {
  try {
    const key = `freq:${creativeId}:${ip}:${getTodayKey()}`;
    const newCount = await redisClient.incr(key);
    if (newCount === 1) {
      await redisClient.expire(key, 86400); // 24 hours
    }
    return newCount;
  } catch {
    return 0;
  }
};

// Bonus: Campaign Daily Impression Limit Check
const isDailyLimitReached = async (
  campaignId: string,
  dailyLimit: number
): Promise<boolean> => {
  try {
    const key = `campaign_daily:${campaignId}:${getTodayKey()}`;
    const count = await redisClient.get(key);
    if (count !== null && Number(count) >= dailyLimit) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

const incrementDailyImpression = async (campaignId: string): Promise<number> => {
  try {
    const key = `campaign_daily:${campaignId}:${getTodayKey()}`;
    const newCount = await redisClient.incr(key);
    if (newCount === 1) {
      await redisClient.expire(key, 86400); // 24 hours
    }
    return newCount;
  } catch {
    return 0;
  }
};

// Invalidate ad candidates cache when campaigns/creatives change
const invalidateAdCache = async () => {
  await keyDelete('ad_candidates:*');
};

export const RedisHelper = {
  redisSet,
  redisGet,
  keyDelete,
  isFrequencyCapped,
  incrementFrequencyCap,
  isDailyLimitReached,
  incrementDailyImpression,
  invalidateAdCache,
  getTodayKey,
};
