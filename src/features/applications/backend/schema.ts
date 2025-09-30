import { z } from 'zod';

const MIN_MESSAGE_LENGTH = 1;
const MAX_MESSAGE_LENGTH = 500;

export const ApplicationSubmitRequestSchema = z.object({
  campaignId: z.string().uuid('올바른 체험단 ID 형식이 아닙니다'),
  message: z
    .string()
    .min(
      MIN_MESSAGE_LENGTH,
      `각오 한마디는 최소 ${MIN_MESSAGE_LENGTH}자 이상이어야 합니다`,
    )
    .max(
      MAX_MESSAGE_LENGTH,
      `각오 한마디는 ${MAX_MESSAGE_LENGTH}자 이하여야 합니다`,
    ),
  visitDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식을 입력해주세요 (YYYY-MM-DD)'),
});

export type ApplicationSubmitRequest = z.infer<
  typeof ApplicationSubmitRequestSchema
>;

export const ApplicationSubmitResponseSchema = z.object({
  applicationId: z.string().uuid(),
  campaignId: z.string().uuid(),
  userId: z.string().uuid(),
  message: z.string(),
  visitDate: z.string(),
  status: z.enum(['pending', 'selected', 'rejected']),
  createdAt: z.string(),
});

export type ApplicationSubmitResponse = z.infer<
  typeof ApplicationSubmitResponseSchema
>;

export const ApplicationListQuerySchema = z.object({
  status: z.enum(['pending', 'selected', 'rejected']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ApplicationListQuery = z.infer<typeof ApplicationListQuerySchema>;

export const ApplicationResponseSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  userId: z.string().uuid(),
  message: z.string(),
  visitDate: z.string(),
  status: z.enum(['pending', 'selected', 'rejected']),
  createdAt: z.string(),
  updatedAt: z.string(),
  campaign: z.object({
    title: z.string(),
    recruitmentEnd: z.string(),
    benefits: z.string(),
    status: z.enum(['recruiting', 'closed', 'completed']),
  }),
});

export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;

export const ApplicationListResponseSchema = z.object({
  applications: z.array(ApplicationResponseSchema),
  totalCount: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type ApplicationListResponse = z.infer<
  typeof ApplicationListResponseSchema
>;

export const ApplicationRowSchema = z.object({
  id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  user_id: z.string().uuid(),
  message: z.string(),
  visit_date: z.string(),
  status: z.enum(['pending', 'selected', 'rejected']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ApplicationRow = z.infer<typeof ApplicationRowSchema>;