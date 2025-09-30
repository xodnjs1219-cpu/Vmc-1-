import { z } from 'zod';
import {
  ApplicationSubmitRequestSchema,
  ApplicationListQuerySchema,
} from '@/features/applications/backend/schema';

export type ApplicationSubmitRequest = z.infer<
  typeof ApplicationSubmitRequestSchema
>;
export type ApplicationListQuery = z.infer<typeof ApplicationListQuerySchema>;

export { ApplicationSubmitRequestSchema, ApplicationListQuerySchema };