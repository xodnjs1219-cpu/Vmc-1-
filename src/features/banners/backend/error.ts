export const bannerErrorCodes = {
  bannerNotFound: 'BANNER_NOT_FOUND',
  bannerFetchFailed: 'BANNER_FETCH_FAILED',
  validationError: 'BANNER_VALIDATION_ERROR',
} as const;

export type BannerErrorCode =
  (typeof bannerErrorCodes)[keyof typeof bannerErrorCodes];