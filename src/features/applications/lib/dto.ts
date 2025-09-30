import { z } from 'zod';
import {
  ApplicationListQuerySchema,
  ApplicationListResponseSchema,
  ApplicationResponseSchema,
  ApplicationSubmitRequestSchema,
} from '@/features/applications/backend/schema';

export type ApplicationSubmitRequest = z.infer<
  typeof ApplicationSubmitRequestSchema
>;
export type ApplicationListQuery = z.infer<typeof ApplicationListQuerySchema>;
export type ApplicationListResponse = z.infer<typeof ApplicationListResponseSchema>;
export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;

export {
  ApplicationSubmitRequestSchema,
  ApplicationListQuerySchema,
  ApplicationListResponseSchema,
  ApplicationResponseSchema,
};