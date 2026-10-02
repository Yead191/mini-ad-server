import Redis from 'ioredis';
import config from './index';
import { logger, errorLogger } from '../shared/logger';
import colors from 'colors';

export const redisClient = config.redis.url
  ? new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    })
  : new Redis({
      host: config.redis.host,
      port: Number(config.redis.port),
      password: config.redis.password || undefined,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    });

redisClient.on('connect', () => {
  logger.info(colors.green('⚡ Redis connected successfully'));
});

redisClient.on('error', (err) => {
  errorLogger.error(colors.red('❌ Redis connection error:'), err);
});
