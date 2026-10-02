import express from 'express';
import { TrackController } from './track.controller';

const router = express.Router();

router.get('/impression', TrackController.trackImpression);
router.get('/click', TrackController.trackClick);

export const TrackRoutes = router;
