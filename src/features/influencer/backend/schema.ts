import { z } from 'zod';

const MIN_CHANNEL_NAME_LENGTH = 1;
const MAX_CHANNEL_NAME_LENGTH = 100;
const MIN_CHANNELS_COUNT = 1;

export const ChannelSchema = z.object({
  platform: z.enum(['naver', 'youtube', 'instagram', 'threads'], {
    errorMap: () => ({ message: '채널 유형을 선택해주세요' }),
  }),
  name: z
    .string()
    .min(
      MIN_CHANNEL_NAME_LENGTH,
      `채널명은 최소 ${MIN_CHANNEL_NAME_LENGTH}자 이상이어야 합니다`,
    )
    .max(
      MAX_CHANNEL_NAME_LENGTH,
      `채널명은 ${MAX_CHANNEL_NAME_LENGTH}자 이하여야 합니다`,
    ),
  url: z.string().url('올바른 URL 형식을 입력해주세요'),
});

export type Channel = z.infer<typeof ChannelSchema>;

export const ProfileSubmitRequestSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: '올바른 날짜 형식을 입력해주세요 (YYYY-MM-DD)',
  }),
  channels: z
    .array(ChannelSchema)
    .min(
      MIN_CHANNELS_COUNT,
      `최소 ${MIN_CHANNELS_COUNT}개 이상의 채널을 등록해주세요`,
    ),
  status: z.enum(['draft', 'submitted'], {
    errorMap: () => ({ message: '상태를 선택해주세요' }),
  }),
});

export type ProfileSubmitRequest = z.infer<typeof ProfileSubmitRequestSchema>;

export const ChannelResponseSchema = z.object({
  id: z.string().uuid(),
  platform: z.enum(['naver', 'youtube', 'instagram', 'threads']),
  name: z.string(),
  url: z.string(),
  status: z.enum(['pending', 'verified', 'failed']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ChannelResponse = z.infer<typeof ChannelResponseSchema>;

export const ProfileSubmitResponseSchema = z.object({
  profileId: z.string().uuid(),
  userId: z.string().uuid(),
  birthDate: z.string(),
  channels: z.array(
    z.object({
      id: z.string().uuid(),
      status: z.enum(['pending', 'verified', 'failed']),
    }),
  ),
  profileStatus: z.enum(['draft', 'submitted']),
});

export type ProfileSubmitResponse = z.infer<
  typeof ProfileSubmitResponseSchema
>;

export const ProfileQueryResponseSchema = z.object({
  profile: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    birthDate: z.string(),
    status: z.enum(['draft', 'submitted']),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
  channels: z.array(ChannelResponseSchema),
});

export type ProfileQueryResponse = z.infer<typeof ProfileQueryResponseSchema>;

export const ChannelUpdateRequestSchema = z.object({
  name: z
    .string()
    .min(
      MIN_CHANNEL_NAME_LENGTH,
      `채널명은 최소 ${MIN_CHANNEL_NAME_LENGTH}자 이상이어야 합니다`,
    )
    .max(
      MAX_CHANNEL_NAME_LENGTH,
      `채널명은 ${MAX_CHANNEL_NAME_LENGTH}자 이하여야 합니다`,
    ),
  url: z.string().url('올바른 URL 형식을 입력해주세요'),
});

export type ChannelUpdateRequest = z.infer<typeof ChannelUpdateRequestSchema>;

export const InfluencerProfileRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  birth_date: z.string(),
  status: z.enum(['draft', 'submitted']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type InfluencerProfileRow = z.infer<typeof InfluencerProfileRowSchema>;

export const InfluencerChannelRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  platform: z.enum(['naver', 'youtube', 'instagram', 'threads']),
  channel_name: z.string(),
  channel_url: z.string(),
  status: z.enum(['pending', 'verified', 'failed']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type InfluencerChannelRow = z.infer<typeof InfluencerChannelRowSchema>;