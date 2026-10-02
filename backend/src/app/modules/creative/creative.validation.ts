import { z } from 'zod';

const createCreativeZodSchema = z.object({
  body: z.object({
    campaign_id: z.string({
      required_error: 'campaign_id is required',
    }).min(1, 'campaign_id cannot be empty'),
    width: z.number({
      required_error: 'width is required',
    }).int('width must be an integer').positive('width must be positive'),
    height: z.number({
      required_error: 'height is required',
    }).int('height must be an integer').positive('height must be positive'),
    image_url: z.string({
      required_error: 'image_url is required',
    }).url('image_url must be a valid URL'),
    click_url: z.string({
      required_error: 'click_url is required',
    }).url('click_url must be a valid URL'),
  }),
});

const updateCreativeZodSchema = z.object({
  body: z.object({
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    image_url: z.string().url().optional(),
    click_url: z.string().url().optional(),
  }),
});

export const CreativeValidation = {
  createCreativeZodSchema,
  updateCreativeZodSchema,
};
