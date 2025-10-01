import type { Hono } from 'hono';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import {
  CampaignCreateRequestSchema,
  CampaignUpdateRequestSchema,
  CampaignListQuerySchema,
  CampaignStatusUpdateRequestSchema,
  SelectApplicantsRequestSchema,
} from '@/features/campaigns/backend/schema';
import {
  createCampaign,
  getCampaignsByAdvertiser,
  getPublicCampaigns,
  getCampaignDetail,
  getCampaignDetailForAdvertiser,
  updateCampaign,
  updateCampaignStatus,
  getApplicantsByCampaign,
  selectApplicants,
} from '@/features/campaigns/backend/service';
import {
  campaignErrorCodes,
  type CampaignErrorCode,
} from '@/features/campaigns/backend/error';

export const registerCampaignRoutes = (app: Hono<AppEnv>) => {
  app.post('/campaigns', async (c) => {
    const body = await c.req.json();
    const parsedBody = CampaignCreateRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          campaignErrorCodes.validationError,
          '입력값이 올바르지 않습니다',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(
          401,
          campaignErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
        ),
      );
    }

    const result = await createCampaign(supabase, user.id, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<CampaignErrorCode, unknown>;
      logger.error('Campaign creation failed', errorResult.error.message);
      return respond(c, result);
    }

    logger.info('Campaign created', {
      userId: user.id,
      campaignId: result.data.campaignId,
    });

    return respond(c, result);
  });

  app.get('/campaigns', async (c) => {
    const query = c.req.query();
    const parsedQuery = CampaignListQuerySchema.safeParse(query);

    if (!parsedQuery.success) {
      return respond(
        c,
        failure(
          400,
          campaignErrorCodes.validationError,
          '쿼리 파라미터가 올바르지 않습니다',
          parsedQuery.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      logger.info('Fetching campaigns', { query: parsedQuery.data, userId: user?.id });

      const result = await getPublicCampaigns(
        supabase,
        parsedQuery.data,
        user?.id,
      );

      if (!result.ok) {
        logger.error('Failed to fetch campaigns');
        return respond(c, result);
      }

      logger.info('Campaigns retrieved', {
        count: result.data.campaigns.length,
      });

      return respond(c, result);
    } catch (error) {
      logger.error('Unexpected error fetching campaigns', { error });
      return respond(
        c,
        failure(
          500,
          campaignErrorCodes.campaignFetchFailed,
          error instanceof Error ? error.message : '체험단 조회 중 오류가 발생했습니다',
        ),
      );
    }
  });

  app.get('/campaigns/:id', async (c) => {
    const campaignId = c.req.param('id');
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const result = await getCampaignDetail(supabase, campaignId, user?.id);

    if (!result.ok) {
      logger.error('Failed to fetch campaign detail', { campaignId });
      return respond(c, result);
    }

    logger.info('Campaign detail retrieved', { campaignId });

    return respond(c, result);
  });

  app.get('/campaigns/:id/manage', async (c) => {
    const campaignId = c.req.param('id');
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(
          401,
          campaignErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
        ),
      );
    }

    const result = await getCampaignDetailForAdvertiser(supabase, campaignId, user.id);

    if (!result.ok) {
      logger.error('Failed to fetch campaign detail for advertiser', { campaignId, userId: user.id });
      return respond(c, result);
    }

    logger.info('Campaign detail for advertiser retrieved', { campaignId, userId: user.id });

    return respond(c, result);
  });

  app.get('/advertiser/campaigns', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(
          401,
          campaignErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
        ),
      );
    }

    const result = await getCampaignsByAdvertiser(supabase, user.id);

    if (!result.ok) {
      logger.error('Failed to fetch advertiser campaigns', { userId: user.id });
      return respond(c, result);
    }

    logger.info('Advertiser campaigns retrieved', {
      userId: user.id,
      count: result.data.campaigns.length,
    });

    return respond(c, result);
  });

  app.patch('/campaigns/:id', async (c) => {
    const campaignId = c.req.param('id');
    const body = await c.req.json();
    const parsedBody = CampaignUpdateRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          campaignErrorCodes.validationError,
          '입력값이 올바르지 않습니다',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(
          401,
          campaignErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
        ),
      );
    }

    const result = await updateCampaign(
      supabase,
      campaignId,
      user.id,
      parsedBody.data,
    );

    if (!result.ok) {
      logger.error('Campaign update failed', { campaignId });
      return respond(c, result);
    }

    logger.info('Campaign updated', { campaignId });

    return respond(c, result);
  });

  app.patch('/campaigns/:id/status', async (c) => {
    const campaignId = c.req.param('id');
    const body = await c.req.json();
    const parsedBody = CampaignStatusUpdateRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          campaignErrorCodes.validationError,
          '입력값이 올바르지 않습니다',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(
          401,
          campaignErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
        ),
      );
    }

    const result = await updateCampaignStatus(
      supabase,
      campaignId,
      user.id,
      parsedBody.data,
    );

    if (!result.ok) {
      logger.error('Campaign status update failed', { campaignId });
      return respond(c, result);
    }

    logger.info('Campaign status updated', { campaignId, status: parsedBody.data.status });

    return respond(c, result);
  });

  app.get('/campaigns/:id/applicants', async (c) => {
    const campaignId = c.req.param('id');
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(
          401,
          campaignErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
        ),
      );
    }

    const result = await getApplicantsByCampaign(supabase, campaignId, user.id);

    if (!result.ok) {
      logger.error('Failed to fetch applicants', { campaignId });
      return respond(c, result);
    }

    logger.info('Applicants retrieved', {
      campaignId,
      count: result.data.applicants.length,
    });

    return respond(c, result);
  });

  app.post('/campaigns/:id/select', async (c) => {
    const campaignId = c.req.param('id');
    const body = await c.req.json();
    const parsedBody = SelectApplicantsRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          campaignErrorCodes.validationError,
          '입력값이 올바르지 않습니다',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(
          401,
          campaignErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
        ),
      );
    }

    const result = await selectApplicants(
      supabase,
      campaignId,
      user.id,
      parsedBody.data,
    );

    if (!result.ok) {
      logger.error('Applicant selection failed', { campaignId });
      return respond(c, result);
    }

    logger.info('Applicants selected', {
      campaignId,
      selectedCount: parsedBody.data.selectedIds.length,
    });

    return respond(c, result);
  });
};
