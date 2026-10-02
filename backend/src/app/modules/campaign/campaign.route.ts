import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CampaignController } from './campaign.controller';
import { CampaignValidation } from './campaign.validation';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(CampaignValidation.createCampaignZodSchema),
    CampaignController.createCampaign
  )
  .get(CampaignController.getAllCampaigns);

router
  .route('/:id')
  .get(CampaignController.getCampaignById)
  .patch(
    validateRequest(CampaignValidation.updateCampaignZodSchema),
    CampaignController.updateCampaign
  )
  .delete(CampaignController.deleteCampaign);

export const CampaignRoutes = router;
