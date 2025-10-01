import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  applicationErrorCodes,
  type ApplicationErrorCode,
} from '@/features/applications/backend/error';
import {
  ApplicationSubmitResponseSchema,
  ApplicationListResponseSchema,
  type ApplicationSubmitRequest,
  type ApplicationSubmitResponse,
  type ApplicationListQuery,
  type ApplicationListResponse,
  type ApplicationRow,
} from '@/features/applications/backend/schema';
import { validateVisitDate } from './validation';
import { isRecruitmentActive } from '@/features/campaigns/backend/validation';

const formatDateToString = (dateString: string): string => {
  return dateString.split('T')[0];
};

const APPLICATIONS_TABLE = 'applications';
const CAMPAIGNS_TABLE = 'campaigns';
const INFLUENCER_PROFILES_TABLE = 'influencer_profiles';
const INFLUENCER_CHANNELS_TABLE = 'influencer_channels';

export const createApplication = async (
  client: SupabaseClient,
  userId: string,
  request: ApplicationSubmitRequest,
): Promise<
  HandlerResult<ApplicationSubmitResponse, ApplicationErrorCode, unknown>
> => {
  const { campaignId, message, visitDate } = request;

  const { data: influencerProfile, error: profileError } = await client
    .from(INFLUENCER_PROFILES_TABLE)
    .select('status')
    .eq('user_id', userId)
    .single();

  if (profileError || !influencerProfile) {
    return failure(
      404,
      applicationErrorCodes.influencerProfileNotFound,
      '인플루언서 프로필을 찾을 수 없습니다',
    );
  }

  if (influencerProfile.status !== 'submitted') {
    return failure(
      403,
      applicationErrorCodes.influencerNotVerified,
      '제출된 인플루언서 프로필이 필요합니다',
    );
  }

  const { data: verifiedChannels, error: channelsError } = await client
    .from(INFLUENCER_CHANNELS_TABLE)
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'verified');

  if (channelsError || !verifiedChannels || verifiedChannels.length === 0) {
    return failure(
      403,
      applicationErrorCodes.noVerifiedChannels,
      '최소 1개 이상의 검증된 채널이 필요합니다',
    );
  }

  const { data: campaign, error: campaignError } = await client
    .from(CAMPAIGNS_TABLE)
    .select('*')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    return failure(
      404,
      applicationErrorCodes.campaignNotFound,
      '체험단을 찾을 수 없습니다',
    );
  }

  if (campaign.status !== 'recruiting') {
    return failure(
      400,
      applicationErrorCodes.campaignNotRecruiting,
      '모집 중인 체험단만 지원 가능합니다',
    );
  }

  if (
    !isRecruitmentActive(
      formatDateToString(campaign.recruitment_start),
      formatDateToString(campaign.recruitment_end)
    )
  ) {
    return failure(
      400,
      applicationErrorCodes.recruitmentPeriodEnded,
      '모집 기간이 아닙니다',
    );
  }

  if (!validateVisitDate(visitDate, formatDateToString(campaign.recruitment_end))) {
    return failure(
      400,
      applicationErrorCodes.invalidVisitDate,
      '방문 예정일은 모집 종료일 이후여야 합니다',
    );
  }

  const { data: existingApplication } = await client
    .from(APPLICATIONS_TABLE)
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('user_id', userId)
    .single();

  if (existingApplication) {
    return failure(
      409,
      applicationErrorCodes.duplicateApplication,
      '이미 지원한 체험단입니다',
    );
  }

  const { count: applicantsCount, error: countError } = await client
    .from(APPLICATIONS_TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId);

  if (countError) {
    return failure(
      500,
      applicationErrorCodes.applicationCreationFailed,
      '지원자 수 확인 중 오류가 발생했습니다',
    );
  }

  if (applicantsCount !== null && applicantsCount >= campaign.max_participants) {
    return failure(
      400,
      applicationErrorCodes.maxParticipantsReached,
      '모집 인원이 마감되었습니다',
    );
  }

  const { data: applicationData, error: applicationError } = await client
    .from(APPLICATIONS_TABLE)
    .insert({
      campaign_id: campaignId,
      user_id: userId,
      message,
      visit_date: visitDate,
      status: 'pending',
    })
    .select()
    .single();

  if (applicationError || !applicationData) {
    return failure(
      500,
      applicationErrorCodes.applicationCreationFailed,
      applicationError?.message || '지원 신청에 실패했습니다',
    );
  }

  const application = applicationData as ApplicationRow;

  const response: ApplicationSubmitResponse = {
    applicationId: application.id,
    campaignId: application.campaign_id,
    userId: application.user_id,
    message: application.message,
    visitDate: application.visit_date,
    status: application.status,
    createdAt: application.created_at,
  };

  const parsed = ApplicationSubmitResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      applicationErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 201);
};

export const getApplicationsByUser = async (
  client: SupabaseClient,
  userId: string,
  query: ApplicationListQuery,
): Promise<
  HandlerResult<ApplicationListResponse, ApplicationErrorCode, unknown>
> => {
  const { status, page, limit } = query;

  let queryBuilder = client
    .from(APPLICATIONS_TABLE)
    .select(
      `
      *,
      campaigns!inner(title, recruitment_end, benefits, status)
    `,
      { count: 'exact' },
    )
    .eq('user_id', userId);

  if (status) {
    queryBuilder = queryBuilder.eq('status', status);
  }

  queryBuilder = queryBuilder.order('created_at', { ascending: false });

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  queryBuilder = queryBuilder.range(from, to);

  const { data: applicationsData, error: applicationsError, count } = await queryBuilder;

  if (applicationsError) {
    return failure(
      500,
      applicationErrorCodes.applicationCreationFailed,
      '지원 목록을 가져오는데 실패했습니다',
    );
  }

  const applications = applicationsData || [];
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  const response: ApplicationListResponse = {
    applications: applications.map((app: any) => ({
      id: app.id,
      campaignId: app.campaign_id,
      userId: app.user_id,
      message: app.message,
      visitDate: app.visit_date,
      status: app.status,
      createdAt: app.created_at,
      updatedAt: app.updated_at,
      campaign: {
        title: app.campaigns.title,
        recruitmentEnd: app.campaigns.recruitment_end,
        benefits: app.campaigns.benefits,
        status: app.campaigns.status,
      },
    })),
    totalCount,
    page,
    limit,
    totalPages,
  };

  const parsed = ApplicationListResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      applicationErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 200);
};
