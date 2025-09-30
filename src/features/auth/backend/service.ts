import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  SignupResponseSchema,
  type SignupRequest,
  type SignupResponse,
} from '@/features/auth/backend/schema';
import {
  authErrorCodes,
  type AuthServiceError,
} from '@/features/auth/backend/error';

const PROFILES_TABLE = 'profiles';

export const createUserWithProfile = async (
  client: SupabaseClient,
  request: SignupRequest,
): Promise<HandlerResult<SignupResponse, AuthServiceError, unknown>> => {
  const { name, phone, email, password, role, termsAgreed } = request;

  if (!termsAgreed) {
    return failure(400, authErrorCodes.termsNotAgreed, '약관에 동의해주세요');
  }

  const { data: authData, error: authError } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        role,
      },
    },
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      return failure(
        409,
        authErrorCodes.emailAlreadyExists,
        '이미 사용 중인 이메일입니다',
      );
    }

    return failure(
      500,
      authErrorCodes.authCreationFailed,
      authError.message || '사용자 계정 생성에 실패했습니다',
    );
  }

  if (!authData.user) {
    return failure(
      500,
      authErrorCodes.authCreationFailed,
      '사용자 정보를 가져올 수 없습니다',
    );
  }

  const userId = authData.user.id;

  const { error: profileError } = await client.from(PROFILES_TABLE).insert({
    id: userId,
    name,
    phone,
    email,
    role,
    terms_agreed_at: new Date().toISOString(),
  });

  if (profileError) {
    return failure(
      500,
      authErrorCodes.profileCreationFailed,
      profileError.message || '프로필 생성에 실패했습니다',
    );
  }

  const response: SignupResponse = {
    userId,
    email,
    role,
    emailSent: true,
  };

  const parsed = SignupResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      authErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 201);
};