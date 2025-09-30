import { z } from 'zod';
import { AdvertiserProfileSubmitRequestSchema } from '@/features/advertiser/backend/schema';

export type AdvertiserProfileSubmitRequest = z.infer<
  typeof AdvertiserProfileSubmitRequestSchema
>;

export { AdvertiserProfileSubmitRequestSchema };