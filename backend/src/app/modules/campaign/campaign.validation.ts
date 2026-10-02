import { z } from 'zod';

const createCampaignZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Campaign name is required',
    }).min(1, 'Campaign name cannot be empty'),
    daily_impression_limit: z.number({
      required_error: 'Daily impression limit is required',
    }).int('Daily impression limit must be an integer').positive('Daily impression limit must be a positive integer'),
    status: z.enum(['active', 'paused']).optional().default('active'),
  }),
});

const updateCampaignZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Campaign name cannot be empty').optional(),
    daily_impression_limit: z.number().int().positive().optional(),
    status: z.enum(['active', 'paused']).optional(),
  }),
});

export const CampaignValidation = {
  createCampaignZodSchema,
  updateCampaignZodSchema,
};
