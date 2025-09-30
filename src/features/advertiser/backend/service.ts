import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  advertiserErrorCodes,
  type AdvertiserErrorCode,
} from '@/features/advertiser/backend/error';
import {
  AdvertiserProfileSubmitResponseSchema,
  AdvertiserProfileQueryResponseSchema,
  type AdvertiserProfileSubmitRequest,
  type AdvertiserProfileSubmitResponse,
  type AdvertiserProfileQueryResponse,
  type AdvertiserProfileRow,
} from '@/features/advertiser/backend/schema';
import { isValidBusinessNumber } from './validation';

const ADVERTISER_PROFILES_TABLE = 'advertiser_profiles';

export const createAdvertiserProfile = async (
  client: SupabaseClient,
  userId: string,
  request: AdvertiserProfileSubmitRequest,
): Promise<
  HandlerResult<
    AdvertiserProfileSubmitResponse,
    AdvertiserErrorCode,
    unknown
  >
> => {
  const { companyName, location, category, businessNumber } = request;

  if (!isValidBusinessNumber(businessNumber)) {
    return failure(
      400,
      advertiserErrorCodes.invalidBusinessNumber,
      '올바른 사업자등록번호 형식이 아닙니다',
    );
  }

  const { data: existingBusinessNumber } = await client
    .from(ADVERTISER_PROFILES_TABLE)
    .select('business_number')
    .eq('business_number', businessNumber)
    .single();

  if (existingBusinessNumber) {
    return failure(
      409,
      advertiserErrorCodes.duplicateBusinessNumber,
      '이미 등록된 사업자등록번호입니다',
    );
  }

  const { data: existingProfile } = await client
    .from(ADVERTISER_PROFILES_TABLE)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existingProfile) {
    const { data: updateData, error: updateError } = await client
      .from(ADVERTISER_PROFILES_TABLE)
      .update({
        company_name: companyName,
        location,
        category,
        business_number: businessNumber,
        verification_status: 'pending',
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError || !updateData) {
      return failure(
        500,
        advertiserErrorCodes.profileCreationFailed,
        updateError?.message || '프로필 업데이트에 실패했습니다',
      );
    }

    const profile = updateData as AdvertiserProfileRow;

    const response: AdvertiserProfileSubmitResponse = {
      profileId: profile.id,
      userId: profile.user_id,
      companyName: profile.company_name,
      location: profile.location,
      category: profile.category,
      businessNumber: profile.business_number,
      verificationStatus: profile.verification_status,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

    const parsed = AdvertiserProfileSubmitResponseSchema.safeParse(response);

    if (!parsed.success) {
      return failure(
        500,
        advertiserErrorCodes.validationError,
        '응답 데이터 검증에 실패했습니다',
        parsed.error.format(),
      );
    }

    return success(parsed.data, 200);
  }

  const { data: profileData, error: profileError } = await client
    .from(ADVERTISER_PROFILES_TABLE)
    .insert({
      user_id: userId,
      company_name: companyName,
      location,
      category,
      business_number: businessNumber,
      verification_status: 'pending',
    })
    .select()
    .single();

  if (profileError || !profileData) {
    return failure(
      500,
      advertiserErrorCodes.profileCreationFailed,
      profileError?.message || '프로필 생성에 실패했습니다',
    );
  }

  const profile = profileData as AdvertiserProfileRow;

  const response: AdvertiserProfileSubmitResponse = {
    profileId: profile.id,
    userId: profile.user_id,
    companyName: profile.company_name,
    location: profile.location,
    category: profile.category,
    businessNumber: profile.business_number,
    verificationStatus: profile.verification_status,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };

  const parsed = AdvertiserProfileSubmitResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      advertiserErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 201);
};

export const getAdvertiserProfile = async (
  client: SupabaseClient,
  userId: string,
): Promise<
  HandlerResult<AdvertiserProfileQueryResponse, AdvertiserErrorCode, unknown>
> => {
  const { data: profileData, error: profileError } = await client
    .from(ADVERTISER_PROFILES_TABLE)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profileError || !profileData) {
    return failure(
      404,
      advertiserErrorCodes.profileNotFound,
      '프로필을 찾을 수 없습니다',
    );
  }

  const profile = profileData as AdvertiserProfileRow;

  const response: AdvertiserProfileQueryResponse = {
    profile: {
      id: profile.id,
      userId: profile.user_id,
      companyName: profile.company_name,
      location: profile.location,
      category: profile.category,
      businessNumber: profile.business_number,
      verificationStatus: profile.verification_status,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
  };

  const parsed = AdvertiserProfileQueryResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      advertiserErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 200);
};