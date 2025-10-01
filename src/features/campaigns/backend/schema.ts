import { z } from 'zod';

const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 200;
const MIN_PARTICIPANTS = 1;

export const CampaignCreateRequestSchema = z
  .object({
    title: z
      .string()
      .min(
        MIN_TITLE_LENGTH,
        `체험단명은 최소 ${MIN_TITLE_LENGTH}자 이상이어야 합니다`,
      )
      .max(
        MAX_TITLE_LENGTH,
        `체험단명은 ${MAX_TITLE_LENGTH}자 이하여야 합니다`,
      ),
    recruitmentStart: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식을 입력해주세요 (YYYY-MM-DD)'),
    recruitmentEnd: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식을 입력해주세요 (YYYY-MM-DD)'),
    maxParticipants: z
      .number()
      .int('모집 인원은 정수여야 합니다')
      .min(MIN_PARTICIPANTS, `모집 인원은 최소 ${MIN_PARTICIPANTS}명 이상이어야 합니다`),
    benefits: z.string().min(1, '제공 혜택을 입력해주세요'),
    storeInfo: z.string().min(1, '매장 정보를 입력해주세요'),
    mission: z.string().min(1, '미션 내용을 입력해주세요'),
  })
  .strict();

export type CampaignCreateRequest = z.infer<typeof CampaignCreateRequestSchema>;

export const CampaignCreateResponseSchema = z.object({
  campaignId: z.string().uuid(),
  advertiserId: z.string().uuid(),
  title: z.string(),
  recruitmentStart: z.string(),
  recruitmentEnd: z.string(),
  maxParticipants: z.number(),
  benefits: z.string(),
  storeInfo: z.string(),
  mission: z.string(),
  status: z.enum(['recruiting', 'closed', 'completed']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CampaignCreateResponse = z.infer<typeof CampaignCreateResponseSchema>;

export const CampaignUpdateRequestSchema = z
  .object({
    title: z
      .string()
      .min(
        MIN_TITLE_LENGTH,
        `체험단명은 최소 ${MIN_TITLE_LENGTH}자 이상이어야 합니다`,
      )
      .max(
        MAX_TITLE_LENGTH,
        `체험단명은 ${MAX_TITLE_LENGTH}자 이하여야 합니다`,
      )
      .optional(),
    recruitmentStart: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식을 입력해주세요 (YYYY-MM-DD)')
      .optional(),
    recruitmentEnd: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식을 입력해주세요 (YYYY-MM-DD)')
      .optional(),
    maxParticipants: z
      .number()
      .int('모집 인원은 정수여야 합니다')
      .min(MIN_PARTICIPANTS, `모집 인원은 최소 ${MIN_PARTICIPANTS}명 이상이어야 합니다`)
      .optional(),
    benefits: z.string().min(1, '제공 혜택을 입력해주세요').optional(),
    storeInfo: z.string().min(1, '매장 정보를 입력해주세요').optional(),
    mission: z.string().min(1, '미션 내용을 입력해주세요').optional(),
  })
  .strict();

export type CampaignUpdateRequest = z.infer<typeof CampaignUpdateRequestSchema>;

export const CampaignListQuerySchema = z.object({
  status: z.enum(['recruiting', 'closed', 'completed']).optional(),
  category: z.string().optional(),
  region: z.string().optional(),
  sort: z.enum(['latest', 'deadline', 'popular']).optional().default('latest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type CampaignListQuery = z.infer<typeof CampaignListQuerySchema>;

export const CampaignResponseSchema = z.object({
  id: z.string().uuid(),
  advertiserId: z.string().uuid(),
  title: z.string(),
  recruitmentStart: z.string(),
  recruitmentEnd: z.string(),
  maxParticipants: z.number(),
  benefits: z.string(),
  storeInfo: z.string(),
  mission: z.string(),
  status: z.enum(['recruiting', 'closed', 'completed']),
  createdAt: z.string(),
  updatedAt: z.string(),
  advertiser: z
    .object({
      companyName: z.string(),
      location: z.string(),
      category: z.string(),
    })
    .optional(),
  applicantsCount: z.number().optional(),
});

export type CampaignResponse = z.infer<typeof CampaignResponseSchema>;

export const CampaignListResponseSchema = z.object({
  campaigns: z.array(CampaignResponseSchema),
  totalCount: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type CampaignListResponse = z.infer<typeof CampaignListResponseSchema>;

export const CampaignDetailResponseSchema = z.object({
  campaign: CampaignResponseSchema,
  canApply: z.boolean().optional(),
  hasApplied: z.boolean().optional(),
  applicationStatus: z.enum(['pending', 'selected', 'rejected']).optional(),
});

export type CampaignDetailResponse = z.infer<typeof CampaignDetailResponseSchema>;

export const CampaignStatusUpdateRequestSchema = z.object({
  status: z.enum(['recruiting', 'closed', 'completed']),
});

export type CampaignStatusUpdateRequest = z.infer<
  typeof CampaignStatusUpdateRequestSchema
>;

export const ApplicantResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  userName: z.string(),
  userEmail: z.string(),
  birthDate: z.string(),
  message: z.string(),
  visitDate: z.string(),
  status: z.enum(['pending', 'selected', 'rejected']),
  createdAt: z.string(),
  channels: z.array(
    z.object({
      platform: z.enum(['naver', 'youtube', 'instagram', 'threads']),
      name: z.string(),
      url: z.string(),
      status: z.enum(['pending', 'verified', 'failed']),
    }),
  ),
});

export type ApplicantResponse = z.infer<typeof ApplicantResponseSchema>;

export const CampaignDetailAdvertiserResponseSchema = z.object({
  campaign: CampaignResponseSchema,
  applicants: z.array(ApplicantResponseSchema),
  isOwner: z.boolean(),
});

export type CampaignDetailAdvertiserResponse = z.infer<
  typeof CampaignDetailAdvertiserResponseSchema
>;

export const ApplicantsListResponseSchema = z.object({
  applicants: z.array(ApplicantResponseSchema),
  totalCount: z.number(),
});

export type ApplicantsListResponse = z.infer<typeof ApplicantsListResponseSchema>;

export const SelectApplicantsRequestSchema = z.object({
  selectedIds: z.array(z.string().uuid()).min(1, '최소 1명 이상 선정해주세요'),
});

export type SelectApplicantsRequest = z.infer<typeof SelectApplicantsRequestSchema>;

export const CampaignRowSchema = z.object({
  id: z.string().uuid(),
  advertiser_id: z.string().uuid(),
  title: z.string(),
  recruitment_start: z.string(),
  recruitment_end: z.string(),
  max_participants: z.number(),
  benefits: z.string(),
  store_info: z.string(),
  mission: z.string(),
  status: z.enum(['recruiting', 'closed', 'completed']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CampaignRow = z.infer<typeof CampaignRowSchema>;