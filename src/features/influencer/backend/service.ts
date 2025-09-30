import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  influencerErrorCodes,
  type InfluencerServiceError,
} from '@/features/influencer/backend/error';
import {
  ProfileSubmitResponseSchema,
  ProfileQueryResponseSchema,
  type ProfileSubmitRequest,
  type ProfileSubmitResponse,
  type ProfileQueryResponse,
  type Channel,
  type ChannelUpdateRequest,
  type InfluencerProfileRow,
  type InfluencerChannelRow,
  ChannelResponseSchema,
  type ChannelResponse,
} from '@/features/influencer/backend/schema';
import { validateAge, validateChannelUrl } from './validation';

const INFLUENCER_PROFILES_TABLE = 'influencer_profiles';
const INFLUENCER_CHANNELS_TABLE = 'influencer_channels';

export const createInfluencerProfile = async (
  client: SupabaseClient,
  userId: string,
  request: ProfileSubmitRequest,
): Promise<
  HandlerResult<ProfileSubmitResponse, InfluencerServiceError, unknown>
> => {
  const { birthDate, channels, status } = request;

  if (!validateAge(birthDate)) {
    return failure(
      400,
      influencerErrorCodes.ageRestriction,
      '만 14세 이상만 인플루언서로 등록 가능합니다',
    );
  }

  for (const channel of channels) {
    if (!validateChannelUrl(channel.platform, channel.url)) {
      return failure(
        400,
        influencerErrorCodes.invalidChannelUrl,
        `올바른 ${channel.platform} URL 형식이 아닙니다`,
      );
    }
  }

  const { data: existingChannels, error: channelCheckError } = await client
    .from(INFLUENCER_CHANNELS_TABLE)
    .select('channel_url')
    .eq('user_id', userId);

  if (channelCheckError) {
    return failure(
      500,
      influencerErrorCodes.profileCreationFailed,
      '채널 중복 체크 중 오류가 발생했습니다',
    );
  }

  const existingUrls = new Set(
    existingChannels?.map((c) => c.channel_url) || [],
  );
  for (const channel of channels) {
    if (existingUrls.has(channel.url)) {
      return failure(
        409,
        influencerErrorCodes.duplicateChannel,
        '이미 등록된 채널입니다',
      );
    }
  }

  const { data: existingProfile } = await client
    .from(INFLUENCER_PROFILES_TABLE)
    .select('*')
    .eq('user_id', userId)
    .single();

  let profileId: string;

  if (existingProfile) {
    const { error: updateError } = await client
      .from(INFLUENCER_PROFILES_TABLE)
      .update({
        birth_date: birthDate,
        status,
      })
      .eq('user_id', userId);

    if (updateError) {
      return failure(
        500,
        influencerErrorCodes.profileCreationFailed,
        updateError.message || '프로필 업데이트에 실패했습니다',
      );
    }

    profileId = existingProfile.id;
  } else {
    const { data: profileData, error: profileError } = await client
      .from(INFLUENCER_PROFILES_TABLE)
      .insert({
        user_id: userId,
        birth_date: birthDate,
        status,
      })
      .select()
      .single();

    if (profileError || !profileData) {
      return failure(
        500,
        influencerErrorCodes.profileCreationFailed,
        profileError?.message || '프로필 생성에 실패했습니다',
      );
    }

    profileId = profileData.id;
  }

  const channelInserts = channels.map((channel) => ({
    user_id: userId,
    platform: channel.platform,
    channel_name: channel.name,
    channel_url: channel.url,
    status: 'pending' as const,
  }));

  const { data: channelData, error: channelError } = await client
    .from(INFLUENCER_CHANNELS_TABLE)
    .insert(channelInserts)
    .select();

  if (channelError || !channelData) {
    return failure(
      500,
      influencerErrorCodes.channelCreationFailed,
      channelError?.message || '채널 생성에 실패했습니다',
    );
  }

  const response: ProfileSubmitResponse = {
    profileId,
    userId,
    birthDate,
    channels: channelData.map((c: InfluencerChannelRow) => ({
      id: c.id,
      status: c.status,
    })),
    profileStatus: status,
  };

  const parsed = ProfileSubmitResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      influencerErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 201);
};

export const getInfluencerProfile = async (
  client: SupabaseClient,
  userId: string,
): Promise<
  HandlerResult<ProfileQueryResponse, InfluencerServiceError, unknown>
> => {
  const { data: profileData, error: profileError } = await client
    .from(INFLUENCER_PROFILES_TABLE)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profileError || !profileData) {
    return failure(
      404,
      influencerErrorCodes.profileNotFound,
      '프로필을 찾을 수 없습니다',
    );
  }

  const { data: channelsData, error: channelsError } = await client
    .from(INFLUENCER_CHANNELS_TABLE)
    .select('*')
    .eq('user_id', userId);

  if (channelsError) {
    return failure(
      500,
      influencerErrorCodes.profileCreationFailed,
      '채널 정보를 가져오는데 실패했습니다',
    );
  }

  const profile = profileData as InfluencerProfileRow;

  const response: ProfileQueryResponse = {
    profile: {
      id: profile.id,
      userId: profile.user_id,
      birthDate: profile.birth_date,
      status: profile.status,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
    channels: (channelsData as InfluencerChannelRow[]).map((c) => ({
      id: c.id,
      platform: c.platform,
      name: c.channel_name,
      url: c.channel_url,
      status: c.status,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    })),
  };

  const parsed = ProfileQueryResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      influencerErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 200);
};

export const updateChannel = async (
  client: SupabaseClient,
  channelId: string,
  userId: string,
  request: ChannelUpdateRequest,
): Promise<HandlerResult<ChannelResponse, InfluencerServiceError, unknown>> => {
  const { data: existingChannel, error: fetchError } = await client
    .from(INFLUENCER_CHANNELS_TABLE)
    .select('*')
    .eq('id', channelId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !existingChannel) {
    return failure(
      404,
      influencerErrorCodes.channelNotFound,
      '채널을 찾을 수 없습니다',
    );
  }

  const channel = existingChannel as InfluencerChannelRow;

  if (!validateChannelUrl(channel.platform, request.url)) {
    return failure(
      400,
      influencerErrorCodes.invalidChannelUrl,
      `올바른 ${channel.platform} URL 형식이 아닙니다`,
    );
  }

  const { data: duplicateCheck, error: duplicateError } = await client
    .from(INFLUENCER_CHANNELS_TABLE)
    .select('id')
    .eq('user_id', userId)
    .eq('channel_url', request.url)
    .neq('id', channelId);

  if (duplicateError) {
    return failure(
      500,
      influencerErrorCodes.channelCreationFailed,
      '중복 체크 중 오류가 발생했습니다',
    );
  }

  if (duplicateCheck && duplicateCheck.length > 0) {
    return failure(
      409,
      influencerErrorCodes.duplicateChannel,
      '이미 등록된 채널입니다',
    );
  }

  const { data: updateData, error: updateError } = await client
    .from(INFLUENCER_CHANNELS_TABLE)
    .update({
      channel_name: request.name,
      channel_url: request.url,
      status: 'pending',
    })
    .eq('id', channelId)
    .select()
    .single();

  if (updateError || !updateData) {
    return failure(
      500,
      influencerErrorCodes.channelCreationFailed,
      updateError?.message || '채널 업데이트에 실패했습니다',
    );
  }

  const updatedChannel = updateData as InfluencerChannelRow;

  const response: ChannelResponse = {
    id: updatedChannel.id,
    platform: updatedChannel.platform,
    name: updatedChannel.channel_name,
    url: updatedChannel.channel_url,
    status: updatedChannel.status,
    createdAt: updatedChannel.created_at,
    updatedAt: updatedChannel.updated_at,
  };

  const parsed = ChannelResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      influencerErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 200);
};

export const deleteChannel = async (
  client: SupabaseClient,
  channelId: string,
  userId: string,
): Promise<HandlerResult<null, InfluencerServiceError, unknown>> => {
  const { data: existingChannel, error: fetchError } = await client
    .from(INFLUENCER_CHANNELS_TABLE)
    .select('*')
    .eq('id', channelId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !existingChannel) {
    return failure(
      404,
      influencerErrorCodes.channelNotFound,
      '채널을 찾을 수 없습니다',
    );
  }

  const { count, error: countError } = await client
    .from(INFLUENCER_CHANNELS_TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) {
    return failure(
      500,
      influencerErrorCodes.channelCreationFailed,
      '채널 수 확인 중 오류가 발생했습니다',
    );
  }

  if (count !== null && count <= 1) {
    return failure(
      400,
      influencerErrorCodes.minChannelRequired,
      '최소 1개 이상의 채널이 필요합니다',
    );
  }

  const { error: deleteError } = await client
    .from(INFLUENCER_CHANNELS_TABLE)
    .delete()
    .eq('id', channelId);

  if (deleteError) {
    return failure(
      500,
      influencerErrorCodes.channelCreationFailed,
      deleteError.message || '채널 삭제에 실패했습니다',
    );
  }

  return success(null, 200);
};