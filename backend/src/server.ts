import colors from 'colors';
import { Server } from 'http';
import app from './app';
import config from './config';
import { redisClient } from './config/redis';
import { errorLogger, logger } from './shared/logger';
import { prisma } from './shared/prisma';

let server: Server;

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  errorLogger.error('uncaughtException Detected', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  errorLogger.error('unhandledRejection Detected', error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

async function main() {
  try {
    // Connect to PostgreSQL via Prisma
    await prisma.$connect();
    logger.info(colors.green('🚀 PostgreSQL connected successfully via Prisma'));

    // Verify Redis connection status
    await redisClient.ping();
    logger.info(colors.green('🚀 Redis connected successfully'));

    // Start HTTP server
    const port = typeof config.port === 'number' ? config.port : Number(config.port);
    const host = config.ip_address || '0.0.0.0';

    server = app.listen(port, () => {
      logger.info(
        colors.bold.italic.bgGreen(`🎯 Mini Ad Server listening on http://localhost:${port}`)
      );
    });

    // Graceful shutdown handling
    const exitHandler = () => {
      if (server) {
        server.close(async () => {
          logger.info('HTTP server closed');
          await prisma.$disconnect();
          await redisClient.quit();
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on('SIGTERM', exitHandler);
    process.on('SIGINT', exitHandler);
  } catch (error) {
    errorLogger.error(colors.red('❌ Failed to start server:'), error);
    process.exit(1);
  }
}

main();