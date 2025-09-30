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
  ProfileSubmitRequestSchema,
  ChannelUpdateRequestSchema,
} from '@/features/influencer/backend/schema';
import {
  createInfluencerProfile,
  getInfluencerProfile,
  updateChannel,
  deleteChannel,
} from '@/features/influencer/backend/service';
import {
  influencerErrorCodes,
  type InfluencerServiceError,
} from '@/features/influencer/backend/error';

export const registerInfluencerRoutes = (app: Hono<AppEnv>) => {
  app.post('/influencer/profile', async (c) => {
    const body = await c.req.json();
    const parsedBody = ProfileSubmitRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          influencerErrorCodes.validationError,
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
          influencerErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
        ),
      );
    }

    const result = await createInfluencerProfile(
      supabase,
      user.id,
      parsedBody.data,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<InfluencerServiceError, unknown>;

      if (errorResult.error.code === influencerErrorCodes.ageRestriction) {
        logger.warn('Age restriction violation', { userId: user.id });
      } else if (
        errorResult.error.code === influencerErrorCodes.duplicateChannel
      ) {
        logger.warn('Duplicate channel detected', { userId: user.id });
      } else if (
        errorResult.error.code === influencerErrorCodes.invalidChannelUrl
      ) {
        logger.warn('Invalid channel URL', { userId: user.id });
      } else {
        logger.error('Profile creation failed', errorResult.error.message);
      }

      return respond(c, result);
    }

    logger.info('Influencer profile created', {
      userId: user.id,
      profileId: result.data.profileId,
    });

    return respond(c, result);
  });

  app.get('/influencer/profile', async (c) => {
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
          influencerErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
        ),
      );
    }

    const result = await getInfluencerProfile(supabase, user.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<InfluencerServiceError, unknown>;

      if (errorResult.error.code === influencerErrorCodes.profileNotFound) {
        logger.info('Profile not found', { userId: user.id });
      } else {
        logger.error('Profile fetch failed', errorResult.error.message);
      }

      return respond(c, result);
    }

    logger.info('Influencer profile fetched', { userId: user.id });

    return respond(c, result);
  });

  app.put('/influencer/channels/:id', async (c) => {
    const channelId = c.req.param('id');
    const body = await c.req.json();
    const parsedBody = ChannelUpdateRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          influencerErrorCodes.validationError,
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
          influencerErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
        ),
      );
    }

    const result = await updateChannel(
      supabase,
      channelId,
      user.id,
      parsedBody.data,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<InfluencerServiceError, unknown>;

      if (errorResult.error.code === influencerErrorCodes.channelNotFound) {
        logger.warn('Channel not found', { channelId, userId: user.id });
      } else if (
        errorResult.error.code === influencerErrorCodes.duplicateChannel
      ) {
        logger.warn('Duplicate channel URL', { channelId, userId: user.id });
      } else {
        logger.error('Channel update failed', errorResult.error.message);
      }

      return respond(c, result);
    }

    logger.info('Channel updated', { channelId, userId: user.id });

    return respond(c, result);
  });

  app.delete('/influencer/channels/:id', async (c) => {
    const channelId = c.req.param('id');

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
          influencerErrorCodes.unauthorizedAccess,
          '인증이 필요합니다',
        ),
      );
    }

    const result = await deleteChannel(supabase, channelId, user.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<InfluencerServiceError, unknown>;

      if (errorResult.error.code === influencerErrorCodes.channelNotFound) {
        logger.warn('Channel not found', { channelId, userId: user.id });
      } else if (
        errorResult.error.code === influencerErrorCodes.minChannelRequired
      ) {
        logger.warn('Cannot delete last channel', { channelId, userId: user.id });
      } else {
        logger.error('Channel deletion failed', errorResult.error.message);
      }

      return respond(c, result);
    }

    logger.info('Channel deleted', { channelId, userId: user.id });

    return c.body(null, 204);
  });
};