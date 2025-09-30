import { z } from 'zod';
import {
  CampaignCreateRequestSchema,
  CampaignUpdateRequestSchema,
  CampaignListQuerySchema,
  CampaignStatusUpdateRequestSchema,
  SelectApplicantsRequestSchema,
} from '@/features/campaigns/backend/schema';

export type CampaignCreateRequest = z.infer<typeof CampaignCreateRequestSchema>;
export type CampaignUpdateRequest = z.infer<typeof CampaignUpdateRequestSchema>;
export type CampaignListQuery = z.infer<typeof CampaignListQuerySchema>;
export type CampaignStatusUpdateRequest = z.infer<
  typeof CampaignStatusUpdateRequestSchema
>;
export type SelectApplicantsRequest = z.infer<typeof SelectApplicantsRequestSchema>;

export {
  CampaignCreateRequestSchema,
  CampaignUpdateRequestSchema,
  CampaignListQuerySchema,
  CampaignStatusUpdateRequestSchema,
  SelectApplicantsRequestSchema,
};