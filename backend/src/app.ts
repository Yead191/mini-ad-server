import cors from 'cors';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import requestIp from 'request-ip';
import { AdRoutes } from './app/modules/ad/ad.route';
import { CampaignRoutes } from './app/modules/campaign/campaign.route';
import { CreativeRoutes } from './app/modules/creative/creative.route';
import { ReportRoutes } from './app/modules/report/report.route';
import { TrackRoutes } from './app/modules/track/track.route';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import { redisClient } from './config/redis';
import router from './routes';
import { Morgan } from './shared/morgen';

const app = express();

// IP extraction
app.use(requestIp.mw());

// Morgan logging
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

// CORS and Body Parsers
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static publisher demo
app.use(express.static(path.join(process.cwd(), 'public')));
app.get('/demo', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'public', 'publisher.html'));
});

// Root endpoints (PDF specifications)
app.use('/ad', AdRoutes);
app.use('/track', TrackRoutes);
app.use('/report', ReportRoutes);
app.use('/campaigns', CampaignRoutes);
app.use('/creatives', CreativeRoutes);

// Versioned API routes (/api/v1)
app.use('/api/v1', router);

// Reset frequency caps endpoint for testing
app.all('/reset-frequency-caps', async (req: Request, res: Response) => {
  try {
    const stream = redisClient.scanStream({ match: 'freq:*' });
    const keys: string[] = [];
    for await (const chunk of stream) {
      keys.push(...chunk);
    }
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: `Reset frequency caps (${keys.length} keys cleared)`,
    });
  } catch (err: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message,
    });
  }
});

// Live / Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Mini Ad Server',
  });
});

app.get('/', (req: Request, res: Response) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 40px;">
      <h1 style="color: #0f172a;">🎯 Mini Ad Server is Online</h1>
      <p style="color: #475569;">Serving high performance ad decisions, tracking, and analytics.</p>
      <div style="margin-top: 24px;">
        <a href="/demo" style="display:inline-block; padding: 10px 20px; background: #2563eb; color: white; border-radius: 6px; text-decoration: none; font-weight: 500;">Open Publisher Demo</a>
        <a href="/health" style="display:inline-block; padding: 10px 20px; background: #e2e8f0; color: #1e293b; border-radius: 6px; text-decoration: none; font-weight: 500; margin-left: 10px;">Health Check</a>
      </div>
    </div>
  `);
});

// Global error handler
app.use(globalErrorHandler);

// Not found route
app.use((req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Endpoint Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: `API route ${req.originalUrl} does not exist.`,
      },
    ],
  });
});

export default app;
