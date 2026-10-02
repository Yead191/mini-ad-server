import express from 'express';
import { AdRoutes } from '../app/modules/ad/ad.route';
import { CampaignRoutes } from '../app/modules/campaign/campaign.route';
import { CreativeRoutes } from '../app/modules/creative/creative.route';
import { ReportRoutes } from '../app/modules/report/report.route';
import { TrackRoutes } from '../app/modules/track/track.route';

const router = express.Router();

const apiRoutes = [
  {
    path: '/campaigns',
    route: CampaignRoutes,
  },
  {
    path: '/creatives',
    route: CreativeRoutes,
  },
  {
    path: '/ad',
    route: AdRoutes,
  },
  {
    path: '/track',
    route: TrackRoutes,
  },
  {
    path: '/report',
    route: ReportRoutes,
  },
];

apiRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
