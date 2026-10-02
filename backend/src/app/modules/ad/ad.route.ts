import express from 'express';
import { AdController } from './ad.controller';

const router = express.Router();

router.get('/', AdController.getAd);

export const AdRoutes = router;
