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
  ApplicationSubmitRequestSchema,
  ApplicationListQuerySchema,
} from '@/features/applications/backend/schema';
import {
  createApplication,
  getApplicationsByUser,
} from '@/features/applications/backend/service';
import {
  applicationErrorCodes,
  type ApplicationErrorCode,
} from '@/features/applications/backend/error';

export const registerApplicationRoutes = (app: Hono<AppEnv>) => {
  app.post('/applications', async (c) => {
    const body = await c.req.json();
    const parsedBody = ApplicationSubmitRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          applicationErrorCodes.validationError,
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
          applicationErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
        ),
      );
    }

    const result = await createApplication(supabase, user.id, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<ApplicationErrorCode, unknown>;

      if (errorResult.error.code === applicationErrorCodes.duplicateApplication) {
        logger.warn('Duplicate application', {
          userId: user.id,
          campaignId: parsedBody.data.campaignId,
        });
      } else {
        logger.error('Application creation failed', errorResult.error.message);
      }

      return respond(c, result);
    }

    logger.info('Application created', {
      userId: user.id,
      applicationId: result.data.applicationId,
      campaignId: result.data.campaignId,
    });

    return respond(c, result);
  });

  app.get('/applications', async (c) => {
    const query = c.req.query();
    const parsedQuery = ApplicationListQuerySchema.safeParse(query);

    if (!parsedQuery.success) {
      return respond(
        c,
        failure(
          400,
          applicationErrorCodes.validationError,
          '쿼리 파라미터가 올바르지 않습니다',
          parsedQuery.error.format(),
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
          applicationErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
        ),
      );
    }

    const result = await getApplicationsByUser(
      supabase,
      user.id,
      parsedQuery.data,
    );

    if (!result.ok) {
      logger.error('Failed to fetch applications', { userId: user.id });
      return respond(c, result);
    }

    logger.info('Applications retrieved', {
      userId: user.id,
      count: result.data.applications.length,
    });

    return respond(c, result);
  });
};
