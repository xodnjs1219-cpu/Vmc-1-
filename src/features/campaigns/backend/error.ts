export const campaignErrorCodes = {
  campaignCreationFailed: 'CAMPAIGN_CREATION_FAILED',
  campaignNotFound: 'CAMPAIGN_NOT_FOUND',
  campaignUpdateFailed: 'CAMPAIGN_UPDATE_FAILED',
  invalidDateRange: 'INVALID_DATE_RANGE',
  invalidRecruitmentPeriod: 'INVALID_RECRUITMENT_PERIOD',
  unauthorizedAccess: 'CAMPAIGN_UNAUTHORIZED_ACCESS',
  advertiserNotVerified: 'ADVERTISER_NOT_VERIFIED',
  advertiserProfileNotFound: 'ADVERTISER_PROFILE_NOT_FOUND',
  invalidStatusTransition: 'INVALID_STATUS_TRANSITION',
  selectionCountMismatch: 'SELECTION_COUNT_MISMATCH',
  validationError: 'CAMPAIGN_VALIDATION_ERROR',
} as const;

export type CampaignErrorCode =
  (typeof campaignErrorCodes)[keyof typeof campaignErrorCodes];