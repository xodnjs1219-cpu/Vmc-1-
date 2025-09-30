import { z } from 'zod';

const PHONE_REGEX = /^010-\d{4}-\d{4}$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 100;

export const SignupRequestSchema = z
  .object({
    name: z
      .string()
      .min(1, '이름을 입력해주세요')
      .max(MAX_NAME_LENGTH, `이름은 ${MAX_NAME_LENGTH}자 이하여야 합니다`),
    phone: z
      .string()
      .regex(PHONE_REGEX, '휴대폰번호는 010-0000-0000 형식이어야 합니다'),
    email: z.string().email('올바른 이메일 형식이 아닙니다'),
    password: z
      .string()
      .min(
        MIN_PASSWORD_LENGTH,
        `비밀번호는 최소 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다`,
      ),
    role: z.enum(['advertiser', 'influencer'], {
      errorMap: () => ({ message: '역할을 선택해주세요' }),
    }),
    termsAgreed: z.literal(true, {
      errorMap: () => ({ message: '약관에 동의해주세요' }),
    }),
  })
  .strict();

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const SignupResponseSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['advertiser', 'influencer']),
  emailSent: z.boolean(),
});

export type SignupResponse = z.infer<typeof SignupResponseSchema>;

export const ProfileTableRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  role: z.enum(['advertiser', 'influencer']),
  terms_agreed_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProfileRow = z.infer<typeof ProfileTableRowSchema>;