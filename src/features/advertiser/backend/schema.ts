import { z } from 'zod';

const MIN_COMPANY_NAME_LENGTH = 1;
const MAX_COMPANY_NAME_LENGTH = 200;
const MIN_LOCATION_LENGTH = 1;
const MAX_LOCATION_LENGTH = 500;
const MIN_CATEGORY_LENGTH = 1;
const MAX_CATEGORY_LENGTH = 100;

export const AdvertiserProfileSubmitRequestSchema = z.object({
  companyName: z
    .string()
    .min(
      MIN_COMPANY_NAME_LENGTH,
      `업체명은 최소 ${MIN_COMPANY_NAME_LENGTH}자 이상이어야 합니다`,
    )
    .max(
      MAX_COMPANY_NAME_LENGTH,
      `업체명은 ${MAX_COMPANY_NAME_LENGTH}자 이하여야 합니다`,
    ),
  location: z
    .string()
    .min(
      MIN_LOCATION_LENGTH,
      `위치는 최소 ${MIN_LOCATION_LENGTH}자 이상이어야 합니다`,
    )
    .max(
      MAX_LOCATION_LENGTH,
      `위치는 ${MAX_LOCATION_LENGTH}자 이하여야 합니다`,
    ),
  category: z
    .string()
    .min(
      MIN_CATEGORY_LENGTH,
      `카테고리는 최소 ${MIN_CATEGORY_LENGTH}자 이상이어야 합니다`,
    )
    .max(
      MAX_CATEGORY_LENGTH,
      `카테고리는 ${MAX_CATEGORY_LENGTH}자 이하여야 합니다`,
    ),
  businessNumber: z
    .string()
    .regex(/^\d{3}-\d{2}-\d{5}$/, {
      message: '사업자등록번호는 000-00-00000 형식이어야 합니다',
    }),
});

export type AdvertiserProfileSubmitRequest = z.infer<
  typeof AdvertiserProfileSubmitRequestSchema
>;

export const AdvertiserProfileSubmitResponseSchema = z.object({
  profileId: z.string().uuid(),
  userId: z.string().uuid(),
  companyName: z.string(),
  location: z.string(),
  category: z.string(),
  businessNumber: z.string(),
  verificationStatus: z.enum(['pending', 'verified', 'failed']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AdvertiserProfileSubmitResponse = z.infer<
  typeof AdvertiserProfileSubmitResponseSchema
>;

export const AdvertiserProfileQueryResponseSchema = z.object({
  profile: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    companyName: z.string(),
    location: z.string(),
    category: z.string(),
    businessNumber: z.string(),
    verificationStatus: z.enum(['pending', 'verified', 'failed']),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export type AdvertiserProfileQueryResponse = z.infer<
  typeof AdvertiserProfileQueryResponseSchema
>;

export const AdvertiserProfileRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  company_name: z.string(),
  location: z.string(),
  category: z.string(),
  business_number: z.string(),
  verification_status: z.enum(['pending', 'verified', 'failed']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AdvertiserProfileRow = z.infer<typeof AdvertiserProfileRowSchema>;