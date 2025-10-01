import { z } from 'zod';
import {
  ApplicantsListResponseSchema,
  ApplicantResponseSchema,
  CampaignCreateRequestSchema,
  CampaignCreateResponseSchema,
  CampaignDetailResponseSchema,
  CampaignDetailAdvertiserResponseSchema,
  CampaignListQuerySchema,
  CampaignListResponseSchema,
  CampaignResponseSchema,
  CampaignStatusUpdateRequestSchema,
  CampaignUpdateRequestSchema,
  SelectApplicantsRequestSchema,
} from '@/features/campaigns/backend/schema';

export type CampaignCreateRequest = z.infer<typeof CampaignCreateRequestSchema>;
export type CampaignCreateResponse = z.infer<typeof CampaignCreateResponseSchema>;
export type CampaignUpdateRequest = z.infer<typeof CampaignUpdateRequestSchema>;
export type CampaignListQuery = z.infer<typeof CampaignListQuerySchema>;
export type CampaignStatusUpdateRequest = z.infer<
  typeof CampaignStatusUpdateRequestSchema
>;
export type SelectApplicantsRequest = z.infer<typeof SelectApplicantsRequestSchema>;
export type CampaignListResponse = z.infer<typeof CampaignListResponseSchema>;
export type CampaignResponse = z.infer<typeof CampaignResponseSchema>;
export type CampaignDetailResponse = z.infer<typeof CampaignDetailResponseSchema>;
export type CampaignDetailAdvertiserResponse = z.infer<typeof CampaignDetailAdvertiserResponseSchema>;
export type ApplicantsListResponse = z.infer<typeof ApplicantsListResponseSchema>;
export type ApplicantResponse = z.infer<typeof ApplicantResponseSchema>;

export {
  ApplicantsListResponseSchema,
  ApplicantResponseSchema,
  CampaignCreateRequestSchema,
  CampaignCreateResponseSchema,
  CampaignDetailResponseSchema,
  CampaignDetailAdvertiserResponseSchema,
  CampaignListQuerySchema,
  CampaignListResponseSchema,
  CampaignResponseSchema,
  CampaignStatusUpdateRequestSchema,
  CampaignUpdateRequestSchema,
  SelectApplicantsRequestSchema,
};