export const applicationErrorCodes = {
  applicationCreationFailed: 'APPLICATION_CREATION_FAILED',
  applicationNotFound: 'APPLICATION_NOT_FOUND',
  duplicateApplication: 'DUPLICATE_APPLICATION',
  campaignNotFound: 'CAMPAIGN_NOT_FOUND',
  campaignNotRecruiting: 'CAMPAIGN_NOT_RECRUITING',
  recruitmentPeriodEnded: 'RECRUITMENT_PERIOD_ENDED',
  maxParticipantsReached: 'MAX_PARTICIPANTS_REACHED',
  influencerProfileNotFound: 'INFLUENCER_PROFILE_NOT_FOUND',
  influencerNotVerified: 'INFLUENCER_NOT_VERIFIED',
  noVerifiedChannels: 'NO_VERIFIED_CHANNELS',
  invalidVisitDate: 'INVALID_VISIT_DATE',
  unauthorizedAccess: 'APPLICATION_UNAUTHORIZED_ACCESS',
  validationError: 'APPLICATION_VALIDATION_ERROR',
} as const;

export type ApplicationErrorCode =
  (typeof applicationErrorCodes)[keyof typeof applicationErrorCodes];