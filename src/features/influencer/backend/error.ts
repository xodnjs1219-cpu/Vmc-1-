export const influencerErrorCodes = {
  invalidBirthDate: 'INVALID_BIRTH_DATE',
  ageRestriction: 'AGE_RESTRICTION',
  duplicateChannel: 'DUPLICATE_CHANNEL',
  noVerifiedChannel: 'NO_VERIFIED_CHANNEL',
  profileNotFound: 'PROFILE_NOT_FOUND',
  channelNotFound: 'CHANNEL_NOT_FOUND',
  invalidChannelUrl: 'INVALID_CHANNEL_URL',
  profileCreationFailed: 'PROFILE_CREATION_FAILED',
  channelCreationFailed: 'CHANNEL_CREATION_FAILED',
  validationError: 'VALIDATION_ERROR',
  unauthorizedAccess: 'UNAUTHORIZED_ACCESS',
  minChannelRequired: 'MIN_CHANNEL_REQUIRED',
} as const;

export type InfluencerServiceError =
  (typeof influencerErrorCodes)[keyof typeof influencerErrorCodes];