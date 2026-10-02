import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CreativeController } from './creative.controller';
import { CreativeValidation } from './creative.validation';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(CreativeValidation.createCreativeZodSchema),
    CreativeController.createCreative
  )
  .get(CreativeController.getAllCreatives);

router
  .route('/:id')
  .get(CreativeController.getCreativeById)
  .patch(
    validateRequest(CreativeValidation.updateCreativeZodSchema),
    CreativeController.updateCreative
  )
  .delete(CreativeController.deleteCreative);

export const CreativeRoutes = router;
