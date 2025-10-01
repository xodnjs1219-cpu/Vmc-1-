import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  campaignErrorCodes,
  type CampaignErrorCode,
} from '@/features/campaigns/backend/error';
import {
  CampaignCreateResponseSchema,
  CampaignListResponseSchema,
  CampaignDetailResponseSchema,
  CampaignDetailAdvertiserResponseSchema,
  CampaignResponseSchema,
  ApplicantsListResponseSchema,
  type CampaignCreateRequest,
  type CampaignCreateResponse,
  type CampaignUpdateRequest,
  type CampaignListQuery,
  type CampaignListResponse,
  type CampaignDetailResponse,
  type CampaignDetailAdvertiserResponse,
  type CampaignResponse,
  type CampaignStatusUpdateRequest,
  type SelectApplicantsRequest,
  type ApplicantsListResponse,
  type CampaignRow,
} from '@/features/campaigns/backend/schema';
import { validateRecruitmentPeriod, isRecruitmentActive } from './validation';

const formatDateToString = (dateString: string): string => {
  return dateString.split('T')[0];
};

const CAMPAIGNS_TABLE = 'campaigns';
const ADVERTISER_PROFILES_TABLE = 'advertiser_profiles';
const APPLICATIONS_TABLE = 'applications';
const PROFILES_TABLE = 'profiles';
const INFLUENCER_PROFILES_TABLE = 'influencer_profiles';
const INFLUENCER_CHANNELS_TABLE = 'influencer_channels';

export const createCampaign = async (
  client: SupabaseClient,
  advertiserId: string,
  request: CampaignCreateRequest,
): Promise<
  HandlerResult<CampaignCreateResponse, CampaignErrorCode, unknown>
> => {
  const {
    title,
    recruitmentStart,
    recruitmentEnd,
    maxParticipants,
    benefits,
    storeInfo,
    mission,
  } = request;

  if (!validateRecruitmentPeriod(recruitmentStart, recruitmentEnd)) {
    return failure(
      400,
      campaignErrorCodes.invalidDateRange,
      '모집 시작일은 종료일보다 이전이어야 하며, 종료일은 오늘 이후여야 합니다',
    );
  }

  const { data: advertiserProfile, error: advertiserError } = await client
    .from(ADVERTISER_PROFILES_TABLE)
    .select('verification_status')
    .eq('user_id', advertiserId)
    .single();

  if (advertiserError || !advertiserProfile) {
    return failure(
      404,
      campaignErrorCodes.advertiserProfileNotFound,
      '광고주 프로필을 찾을 수 없습니다',
    );
  }

  if (advertiserProfile.verification_status !== 'verified') {
    return failure(
      403,
      campaignErrorCodes.advertiserNotVerified,
      '검증된 광고주만 체험단을 등록할 수 있습니다',
    );
  }

  const { data: campaignData, error: campaignError } = await client
    .from(CAMPAIGNS_TABLE)
    .insert({
      advertiser_id: advertiserId,
      title,
      recruitment_start: `${recruitmentStart}T00:00:00Z`,
      recruitment_end: `${recruitmentEnd}T23:59:59Z`,
      max_participants: maxParticipants,
      benefits,
      store_info: storeInfo,
      mission,
      status: 'recruiting',
    })
    .select()
    .single();

  if (campaignError || !campaignData) {
    return failure(
      500,
      campaignErrorCodes.campaignCreationFailed,
      campaignError?.message || '체험단 생성에 실패했습니다',
    );
  }

  const campaign = campaignData as CampaignRow;

  const response: CampaignCreateResponse = {
    campaignId: campaign.id,
    advertiserId: campaign.advertiser_id,
    title: campaign.title,
    recruitmentStart: formatDateToString(campaign.recruitment_start),
    recruitmentEnd: formatDateToString(campaign.recruitment_end),
    maxParticipants: campaign.max_participants,
    benefits: campaign.benefits,
    storeInfo: campaign.store_info,
    mission: campaign.mission,
    status: campaign.status,
    createdAt: campaign.created_at,
    updatedAt: campaign.updated_at,
  };

  const parsed = CampaignCreateResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      campaignErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 201);
};

export const getCampaignsByAdvertiser = async (
  client: SupabaseClient,
  advertiserId: string,
): Promise<
  HandlerResult<CampaignListResponse, CampaignErrorCode, unknown>
> => {
  const { data: campaignsData, error: campaignsError } = await client
    .from(CAMPAIGNS_TABLE)
    .select('*')
    .eq('advertiser_id', advertiserId)
    .order('created_at', { ascending: false });

  if (campaignsError) {
    return failure(
      500,
      campaignErrorCodes.campaignFetchFailed,
      '체험단 목록을 가져오는데 실패했습니다',
    );
  }

  const campaigns = (campaignsData as CampaignRow[]) || [];

  const response: CampaignListResponse = {
    campaigns: campaigns.map((c) => ({
      id: c.id,
      advertiserId: c.advertiser_id,
      title: c.title,
      recruitmentStart: formatDateToString(c.recruitment_start),
      recruitmentEnd: formatDateToString(c.recruitment_end),
      maxParticipants: c.max_participants,
      benefits: c.benefits,
      storeInfo: c.store_info,
      mission: c.mission,
      status: c.status,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    })),
    totalCount: campaigns.length,
    page: 1,
    limit: campaigns.length,
    totalPages: 1,
  };

  const parsed = CampaignListResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      campaignErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 200);
};

export const getPublicCampaigns = async (
  client: SupabaseClient,
  query: CampaignListQuery,
  userId?: string,
): Promise<
  HandlerResult<CampaignListResponse, CampaignErrorCode, unknown>
> => {
  const { status, category, region, sort, page, limit } = query;

  let queryBuilder = client
    .from(CAMPAIGNS_TABLE)
    .select(
      `
      *,
      profiles!campaigns_advertiser_id_fkey(
        advertiser_profiles(company_name, location, category)
      )
    `,
      { count: 'exact' },
    );

  if (status) {
    queryBuilder = queryBuilder.eq('status', status);
  } else {
    queryBuilder = queryBuilder.eq('status', 'recruiting');
  }

  if (category) {
    queryBuilder = queryBuilder.eq('profiles.advertiser_profiles.category', category);
  }

  if (region) {
    queryBuilder = queryBuilder.ilike('profiles.advertiser_profiles.location', `%${region}%`);
  }

  if (sort === 'latest') {
    queryBuilder = queryBuilder.order('created_at', { ascending: false });
  } else if (sort === 'deadline') {
    queryBuilder = queryBuilder.order('recruitment_end', { ascending: true });
  } else if (sort === 'popular') {
    queryBuilder = queryBuilder.order('created_at', { ascending: false });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  queryBuilder = queryBuilder.range(from, to);

  const { data: campaignsData, error: campaignsError, count } = await queryBuilder;

  if (campaignsError) {
    console.error('[getPublicCampaigns] Supabase query error:', {
      message: campaignsError.message,
      details: campaignsError.details,
      hint: campaignsError.hint,
      code: campaignsError.code,
    });
    return failure(
      500,
      campaignErrorCodes.campaignFetchFailed,
      `체험단 목록을 가져오는데 실패했습니다: ${campaignsError.message}`,
    );
  }

  const campaigns = campaignsData || [];
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  const response: CampaignListResponse = {
    campaigns: campaigns.map((c: any) => ({
      id: c.id,
      advertiserId: c.advertiser_id,
      title: c.title,
      recruitmentStart: formatDateToString(c.recruitment_start),
      recruitmentEnd: formatDateToString(c.recruitment_end),
      maxParticipants: c.max_participants,
      benefits: c.benefits,
      storeInfo: c.store_info,
      mission: c.mission,
      status: c.status,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      advertiser: c.profiles?.advertiser_profiles
        ? {
            companyName: c.profiles.advertiser_profiles.company_name,
            location: c.profiles.advertiser_profiles.location,
            category: c.profiles.advertiser_profiles.category,
          }
        : undefined,
    })),
    totalCount,
    page,
    limit,
    totalPages,
  };

  const parsed = CampaignListResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      campaignErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 200);
};

export const getCampaignDetail = async (
  client: SupabaseClient,
  campaignId: string,
  userId?: string,
): Promise<
  HandlerResult<CampaignDetailResponse, CampaignErrorCode, unknown>
> => {
  const { data: campaignData, error: campaignError } = await client
    .from(CAMPAIGNS_TABLE)
    .select(
      `
      *,
      profiles!campaigns_advertiser_id_fkey(
        advertiser_profiles(company_name, location, category)
      )
    `,
    )
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaignData) {
    return failure(
      404,
      campaignErrorCodes.campaignNotFound,
      '체험단을 찾을 수 없습니다',
    );
  }

  const campaign: CampaignResponse = {
    id: campaignData.id,
    advertiserId: campaignData.advertiser_id,
    title: campaignData.title,
    recruitmentStart: formatDateToString(campaignData.recruitment_start),
    recruitmentEnd: formatDateToString(campaignData.recruitment_end),
    maxParticipants: campaignData.max_participants,
    benefits: campaignData.benefits,
    storeInfo: campaignData.store_info,
    mission: campaignData.mission,
    status: campaignData.status,
    createdAt: campaignData.created_at,
    updatedAt: campaignData.updated_at,
    advertiser: campaignData.profiles?.advertiser_profiles
      ? {
          companyName: campaignData.profiles.advertiser_profiles.company_name,
          location: campaignData.profiles.advertiser_profiles.location,
          category: campaignData.profiles.advertiser_profiles.category,
        }
      : undefined,
  };

  let canApply = false;
  let hasApplied = false;
  let applicationStatus = undefined;

  if (userId) {
    const { data: influencerProfile } = await client
      .from(INFLUENCER_PROFILES_TABLE)
      .select('status')
      .eq('user_id', userId)
      .single();

    const { data: verifiedChannels } = await client
      .from(INFLUENCER_CHANNELS_TABLE)
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'verified');

    const { data: existingApplication } = await client
      .from(APPLICATIONS_TABLE)
      .select('status')
      .eq('campaign_id', campaignId)
      .eq('user_id', userId)
      .single();

    if (existingApplication) {
      hasApplied = true;
      applicationStatus = existingApplication.status;
    }

    const { count: applicantsCount } = await client
      .from(APPLICATIONS_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId);

    const isRecruiting =
      campaignData.status === 'recruiting' &&
      isRecruitmentActive(
        formatDateToString(campaignData.recruitment_start),
        formatDateToString(campaignData.recruitment_end),
      );

    console.log('[canApply Debug]', {
      userId,
      campaignId,
      hasApplied,
      isRecruiting,
      campaignStatus: campaignData.status,
      recruitmentStart: formatDateToString(campaignData.recruitment_start),
      recruitmentEnd: formatDateToString(campaignData.recruitment_end),
      influencerProfileStatus: influencerProfile?.status,
      verifiedChannelsCount: verifiedChannels?.length || 0,
      applicantsCount: applicantsCount || 0,
      maxParticipants: campaignData.max_participants,
    });

    canApply =
      !hasApplied &&
      isRecruiting &&
      influencerProfile?.status === 'submitted' &&
      verifiedChannels &&
      verifiedChannels.length > 0 &&
      (applicantsCount || 0) < campaignData.max_participants;
  }

  const response: CampaignDetailResponse = {
    campaign,
    canApply,
    hasApplied,
    applicationStatus,
  };

  const parsed = CampaignDetailResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      campaignErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 200);
};

export const getCampaignDetailForAdvertiser = async (
  client: SupabaseClient,
  campaignId: string,
  advertiserId: string,
): Promise<
  HandlerResult<CampaignDetailAdvertiserResponse, CampaignErrorCode, unknown>
> => {
  const { data: campaignData, error: campaignError } = await client
    .from(CAMPAIGNS_TABLE)
    .select(
      `
      *,
      profiles!campaigns_advertiser_id_fkey(
        advertiser_profiles(company_name, location, category)
      )
    `,
    )
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaignData) {
    return failure(
      404,
      campaignErrorCodes.campaignNotFound,
      '체험단을 찾을 수 없습니다',
    );
  }

  const isOwner = campaignData.advertiser_id === advertiserId;

  if (!isOwner) {
    return failure(
      403,
      campaignErrorCodes.unauthorizedAccess,
      '본인이 등록한 체험단만 관리할 수 있습니다',
    );
  }

  const campaign: CampaignResponse = {
    id: campaignData.id,
    advertiserId: campaignData.advertiser_id,
    title: campaignData.title,
    recruitmentStart: formatDateToString(campaignData.recruitment_start),
    recruitmentEnd: formatDateToString(campaignData.recruitment_end),
    maxParticipants: campaignData.max_participants,
    benefits: campaignData.benefits,
    storeInfo: campaignData.store_info,
    mission: campaignData.mission,
    status: campaignData.status,
    createdAt: campaignData.created_at,
    updatedAt: campaignData.updated_at,
    advertiser: campaignData.profiles?.advertiser_profiles
      ? {
          companyName: campaignData.profiles.advertiser_profiles.company_name,
          location: campaignData.profiles.advertiser_profiles.location,
          category: campaignData.profiles.advertiser_profiles.category,
        }
      : undefined,
  };

  const { data: applicationsData, error: applicationsError } = await client
    .from(APPLICATIONS_TABLE)
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });

  if (applicationsError) {
    console.error('[getCampaignDetailForAdvertiser] Applications fetch error:', {
      error: applicationsError,
      message: applicationsError.message,
      details: applicationsError.details,
      hint: applicationsError.hint,
    });
    return failure(
      500,
      campaignErrorCodes.campaignFetchFailed,
      `지원자 목록을 가져오는데 실패했습니다: ${applicationsError.message}`,
    );
  }

  const applications = applicationsData || [];

  const applicantsWithChannels = await Promise.all(
    applications.map(async (app: any) => {
      const { data: profileData } = await client
        .from(PROFILES_TABLE)
        .select('name, email')
        .eq('user_id', app.user_id)
        .single();

      const { data: influencerData } = await client
        .from(INFLUENCER_PROFILES_TABLE)
        .select('birth_date')
        .eq('user_id', app.user_id)
        .single();

      const { data: channelsData } = await client
        .from(INFLUENCER_CHANNELS_TABLE)
        .select('platform, channel_name, channel_url, status')
        .eq('user_id', app.user_id);

      return {
        id: app.id,
        userId: app.user_id,
        userName: profileData?.name || 'Unknown',
        userEmail: profileData?.email || 'unknown@email.com',
        birthDate: influencerData?.birth_date || '1990-01-01',
        message: app.message,
        visitDate: app.visit_date,
        status: app.status,
        createdAt: app.created_at,
        channels: (channelsData || []).map((ch: any) => ({
          platform: ch.platform,
          name: ch.channel_name,
          url: ch.channel_url,
          status: ch.status,
        })),
      };
    }),
  );

  const response: CampaignDetailAdvertiserResponse = {
    campaign,
    applicants: applicantsWithChannels,
    isOwner,
  };

  const parsed = CampaignDetailAdvertiserResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      campaignErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 200);
};

export const updateCampaign = async (
  client: SupabaseClient,
  campaignId: string,
  advertiserId: string,
  request: CampaignUpdateRequest,
): Promise<HandlerResult<CampaignResponse, CampaignErrorCode, unknown>> => {
  const { data: existingCampaign, error: fetchError } = await client
    .from(CAMPAIGNS_TABLE)
    .select('*')
    .eq('id', campaignId)
    .eq('advertiser_id', advertiserId)
    .single();

  if (fetchError || !existingCampaign) {
    return failure(
      404,
      campaignErrorCodes.campaignNotFound,
      '체험단을 찾을 수 없습니다',
    );
  }

  if (request.recruitmentStart && request.recruitmentEnd) {
    if (!validateRecruitmentPeriod(request.recruitmentStart, request.recruitmentEnd)) {
      return failure(
        400,
        campaignErrorCodes.invalidDateRange,
        '모집 시작일은 종료일보다 이전이어야 하며, 종료일은 오늘 이후여야 합니다',
      );
    }
  }

  const updateData: any = {};
  if (request.title !== undefined) updateData.title = request.title;
  if (request.recruitmentStart !== undefined)
    updateData.recruitment_start = `${request.recruitmentStart}T00:00:00Z`;
  if (request.recruitmentEnd !== undefined)
    updateData.recruitment_end = `${request.recruitmentEnd}T23:59:59Z`;
  if (request.maxParticipants !== undefined)
    updateData.max_participants = request.maxParticipants;
  if (request.benefits !== undefined) updateData.benefits = request.benefits;
  if (request.storeInfo !== undefined) updateData.store_info = request.storeInfo;
  if (request.mission !== undefined) updateData.mission = request.mission;

  const { data: updatedData, error: updateError } = await client
    .from(CAMPAIGNS_TABLE)
    .update(updateData)
    .eq('id', campaignId)
    .select()
    .single();

  if (updateError || !updatedData) {
    return failure(
      500,
      campaignErrorCodes.campaignUpdateFailed,
      updateError?.message || '체험단 수정에 실패했습니다',
    );
  }

  const campaign = updatedData as CampaignRow;

  const response: CampaignResponse = {
    id: campaign.id,
    advertiserId: campaign.advertiser_id,
    title: campaign.title,
    recruitmentStart: formatDateToString(campaign.recruitment_start),
    recruitmentEnd: formatDateToString(campaign.recruitment_end),
    maxParticipants: campaign.max_participants,
    benefits: campaign.benefits,
    storeInfo: campaign.store_info,
    mission: campaign.mission,
    status: campaign.status,
    createdAt: campaign.created_at,
    updatedAt: campaign.updated_at,
  };

  const parsed = CampaignResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      campaignErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 200);
};

export const updateCampaignStatus = async (
  client: SupabaseClient,
  campaignId: string,
  advertiserId: string,
  request: CampaignStatusUpdateRequest,
): Promise<HandlerResult<CampaignResponse, CampaignErrorCode, unknown>> => {
  const { data: existingCampaign, error: fetchError } = await client
    .from(CAMPAIGNS_TABLE)
    .select('*')
    .eq('id', campaignId)
    .eq('advertiser_id', advertiserId)
    .single();

  if (fetchError || !existingCampaign) {
    return failure(
      404,
      campaignErrorCodes.campaignNotFound,
      '체험단을 찾을 수 없습니다',
    );
  }

  const campaign = existingCampaign as CampaignRow;
  const currentStatus = campaign.status;
  const newStatus = request.status;

  if (currentStatus === 'recruiting' && newStatus === 'completed') {
    return failure(
      400,
      campaignErrorCodes.invalidStatusTransition,
      '모집 중에서 선정 완료로 바로 변경할 수 없습니다',
    );
  }

  if (currentStatus === 'completed' && newStatus !== 'completed') {
    return failure(
      400,
      campaignErrorCodes.invalidStatusTransition,
      '선정 완료 상태는 변경할 수 없습니다',
    );
  }

  const { data: updatedData, error: updateError } = await client
    .from(CAMPAIGNS_TABLE)
    .update({ status: newStatus })
    .eq('id', campaignId)
    .select()
    .single();

  if (updateError || !updatedData) {
    return failure(
      500,
      campaignErrorCodes.campaignUpdateFailed,
      updateError?.message || '상태 변경에 실패했습니다',
    );
  }

  const updatedCampaign = updatedData as CampaignRow;

  const response: CampaignResponse = {
    id: updatedCampaign.id,
    advertiserId: updatedCampaign.advertiser_id,
    title: updatedCampaign.title,
    recruitmentStart: formatDateToString(updatedCampaign.recruitment_start),
    recruitmentEnd: formatDateToString(updatedCampaign.recruitment_end),
    maxParticipants: updatedCampaign.max_participants,
    benefits: updatedCampaign.benefits,
    storeInfo: updatedCampaign.store_info,
    mission: updatedCampaign.mission,
    status: updatedCampaign.status,
    createdAt: updatedCampaign.created_at,
    updatedAt: updatedCampaign.updated_at,
  };

  const parsed = CampaignResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      campaignErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 200);
};

export const getApplicantsByCampaign = async (
  client: SupabaseClient,
  campaignId: string,
  advertiserId: string,
): Promise<
  HandlerResult<ApplicantsListResponse, CampaignErrorCode, unknown>
> => {
  const { data: campaign, error: campaignError } = await client
    .from(CAMPAIGNS_TABLE)
    .select('advertiser_id')
    .eq('id', campaignId)
    .eq('advertiser_id', advertiserId)
    .single();

  if (campaignError || !campaign) {
    return failure(
      404,
      campaignErrorCodes.campaignNotFound,
      '체험단을 찾을 수 없습니다',
    );
  }

  const { data: applicationsData, error: applicationsError } = await client
    .from(APPLICATIONS_TABLE)
    .select(
      `
      *,
      profiles!inner(name, email),
      influencer_profiles!inner(birth_date)
    `,
    )
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });

  if (applicationsError) {
    return failure(
      500,
      campaignErrorCodes.campaignFetchFailed,
      '지원자 목록을 가져오는데 실패했습니다',
    );
  }

  const applications = applicationsData || [];

  const applicantsWithChannels = await Promise.all(
    applications.map(async (app: any) => {
      const { data: channelsData } = await client
        .from(INFLUENCER_CHANNELS_TABLE)
        .select('platform, channel_name, channel_url, status')
        .eq('user_id', app.user_id);

      return {
        id: app.id,
        userId: app.user_id,
        userName: app.profiles.name,
        userEmail: app.profiles.email,
        birthDate: app.influencer_profiles.birth_date,
        message: app.message,
        visitDate: app.visit_date,
        status: app.status,
        createdAt: app.created_at,
        channels: (channelsData || []).map((ch: any) => ({
          platform: ch.platform,
          name: ch.channel_name,
          url: ch.channel_url,
          status: ch.status,
        })),
      };
    }),
  );

  const response: ApplicantsListResponse = {
    applicants: applicantsWithChannels,
    totalCount: applicantsWithChannels.length,
  };

  const parsed = ApplicantsListResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      campaignErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 200);
};

export const selectApplicants = async (
  client: SupabaseClient,
  campaignId: string,
  advertiserId: string,
  request: SelectApplicantsRequest,
): Promise<HandlerResult<null, CampaignErrorCode, unknown>> => {
  const { data: campaign, error: campaignError } = await client
    .from(CAMPAIGNS_TABLE)
    .select('advertiser_id, max_participants, status')
    .eq('id', campaignId)
    .eq('advertiser_id', advertiserId)
    .single();

  if (campaignError || !campaign) {
    return failure(
      404,
      campaignErrorCodes.campaignNotFound,
      '체험단을 찾을 수 없습니다',
    );
  }

  if (campaign.status !== 'closed') {
    return failure(
      400,
      campaignErrorCodes.invalidStatusTransition,
      '모집 종료 상태에서만 선정할 수 있습니다',
    );
  }

  if (request.selectedIds.length === 0) {
    return failure(
      400,
      campaignErrorCodes.selectionCountMismatch,
      '최소 1명 이상 선정해야 합니다',
    );
  }

  if (request.selectedIds.length > campaign.max_participants) {
    return failure(
      400,
      campaignErrorCodes.selectionCountMismatch,
      `선정 인원은 최대 모집 인원(${campaign.max_participants}명) 이하여야 합니다`,
    );
  }

  const { error: updateSelectedError } = await client
    .from(APPLICATIONS_TABLE)
    .update({ status: 'selected' })
    .eq('campaign_id', campaignId)
    .in('id', request.selectedIds);

  if (updateSelectedError) {
    return failure(
      500,
      campaignErrorCodes.campaignUpdateFailed,
      '선정 처리에 실패했습니다',
    );
  }

  const { error: updateRejectedError } = await client
    .from(APPLICATIONS_TABLE)
    .update({ status: 'rejected' })
    .eq('campaign_id', campaignId)
    .not('id', 'in', `(${request.selectedIds.join(',')})`);

  if (updateRejectedError) {
    return failure(
      500,
      campaignErrorCodes.campaignUpdateFailed,
      '미선정 처리에 실패했습니다',
    );
  }

  const { error: updateCampaignError } = await client
    .from(CAMPAIGNS_TABLE)
    .update({ status: 'completed' })
    .eq('id', campaignId);

  if (updateCampaignError) {
    return failure(
      500,
      campaignErrorCodes.campaignUpdateFailed,
      '체험단 상태 업데이트에 실패했습니다',
    );
  }

  return success(null, 200);
};
