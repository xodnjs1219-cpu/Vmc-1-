export const advertiserErrorCodes = {
  profileCreationFailed: 'ADVERTISER_PROFILE_CREATION_FAILED',
  profileNotFound: 'ADVERTISER_PROFILE_NOT_FOUND',
  duplicateBusinessNumber: 'DUPLICATE_BUSINESS_NUMBER',
  invalidBusinessNumber: 'INVALID_BUSINESS_NUMBER',
  validationError: 'ADVERTISER_VALIDATION_ERROR',
  unauthorizedAccess: 'ADVERTISER_UNAUTHORIZED_ACCESS',
} as const;

export type AdvertiserErrorCode =
  (typeof advertiserErrorCodes)[keyof typeof advertiserErrorCodes];