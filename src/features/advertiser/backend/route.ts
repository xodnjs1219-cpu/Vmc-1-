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
import { AdvertiserProfileSubmitRequestSchema } from '@/features/advertiser/backend/schema';
import {
  createAdvertiserProfile,
  getAdvertiserProfile,
} from '@/features/advertiser/backend/service';
import {
  advertiserErrorCodes,
  type AdvertiserErrorCode,
} from '@/features/advertiser/backend/error';

export const registerAdvertiserRoutes = (app: Hono<AppEnv>) => {
  app.post('/advertiser/profile', async (c) => {
    const body = await c.req.json();
    const parsedBody = AdvertiserProfileSubmitRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          advertiserErrorCodes.validationError,
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
          advertiserErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
        ),
      );
    }

    const result = await createAdvertiserProfile(
      supabase,
      user.id,
      parsedBody.data,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<AdvertiserErrorCode, unknown>;

      if (
        errorResult.error.code === advertiserErrorCodes.duplicateBusinessNumber
      ) {
        logger.warn('Duplicate business number', {
          businessNumber: parsedBody.data.businessNumber,
        });
      } else if (
        errorResult.error.code === advertiserErrorCodes.profileCreationFailed
      ) {
        logger.error('Profile creation failed', errorResult.error.message);
      }

      return respond(c, result);
    }

    logger.info('Advertiser profile created', {
      userId: user.id,
      profileId: result.data.profileId,
    });

    return respond(c, result);
  });

  app.get('/advertiser/profile', async (c) => {
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
          advertiserErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
        ),
      );
    }

    const result = await getAdvertiserProfile(supabase, user.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<AdvertiserErrorCode, unknown>;

      if (errorResult.error.code === advertiserErrorCodes.profileNotFound) {
        logger.warn('Profile not found', { userId: user.id });
      }

      return respond(c, result);
    }

    logger.info('Advertiser profile retrieved', { userId: user.id });

    return respond(c, result);
  });
};