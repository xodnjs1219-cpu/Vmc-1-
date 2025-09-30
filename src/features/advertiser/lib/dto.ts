import { z } from 'zod';
import {
  AdvertiserProfileSubmitRequestSchema,
  AdvertiserProfileSubmitResponseSchema,
  AdvertiserProfileQueryResponseSchema,
} from '@/features/advertiser/backend/schema';

export type AdvertiserProfileSubmitRequest = z.infer<
  typeof AdvertiserProfileSubmitRequestSchema
>;
export type AdvertiserProfileSubmitResponse = z.infer<
  typeof AdvertiserProfileSubmitResponseSchema
>;
export type AdvertiserProfileResponse = z.infer<
  typeof AdvertiserProfileQueryResponseSchema
>;

export {
  AdvertiserProfileSubmitRequestSchema,
  AdvertiserProfileSubmitResponseSchema,
  AdvertiserProfileQueryResponseSchema as AdvertiserProfileResponseSchema,
};