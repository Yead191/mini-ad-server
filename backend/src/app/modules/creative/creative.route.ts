import express from 'express';
import { fileUploader } from '../../../helpers/fileUploader';
import validateRequest from '../../middlewares/validateRequest';
import { CreativeController } from './creative.controller';
import { CreativeValidation } from './creative.validation';

const router = express.Router();

// Dedicated standalone image upload endpoint
router.post(
  '/upload',
  fileUploader.uploadSingle,
  CreativeController.uploadCreativeImage
);

router
  .route('/')
  .post(
    fileUploader.uploadSingle,
    (req, res, next) => {
      // If a file was uploaded via multipart/form-data, populate image_url
      if (req.file) {
        const host = req.get('host') || 'localhost:5000';
        const protocol = req.protocol || 'http';
        req.body.image_url = `${protocol}://${host}/uploads/creatives/${req.file.filename}`;
      }
      // Coerce string fields if sent via FormData
      if (req.body.width !== undefined && typeof req.body.width === 'string') {
        req.body.width = Number(req.body.width);
      }
      if (req.body.height !== undefined && typeof req.body.height === 'string') {
        req.body.height = Number(req.body.height);
      }
      next();
    },
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
