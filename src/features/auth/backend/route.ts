import type { Hono } from 'hono';
import {
  failure,
  respond,
  success,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { SignupRequestSchema } from '@/features/auth/backend/schema';
import { createUserWithProfile } from '@/features/auth/backend/service';
import {
  authErrorCodes,
  type AuthServiceError,
} from '@/features/auth/backend/error';

export const registerAuthRoutes = (app: Hono<AppEnv>) => {
  app.get('/auth/profile', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return respond(
        c,
        failure(401, authErrorCodes.validationError, '인증되지 않은 사용자입니다'),
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      logger.error('Profile fetch failed', profileError);
      return respond(
        c,
        failure(404, authErrorCodes.validationError, '프로필을 찾을 수 없습니다'),
      );
    }

    return respond(c, success({ role: profile.role }, 200));
  });

  app.post('/auth/signup', async (c) => {
    const body = await c.req.json();
    const parsedBody = SignupRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          authErrorCodes.validationError,
          '입력값이 올바르지 않습니다',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await createUserWithProfile(supabase, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<AuthServiceError, unknown>;

      if (errorResult.error.code === authErrorCodes.emailAlreadyExists) {
        logger.warn('Email already exists', { email: parsedBody.data.email });
      } else if (errorResult.error.code === authErrorCodes.authCreationFailed) {
        logger.error('Auth creation failed', errorResult.error.message);
      } else if (
        errorResult.error.code === authErrorCodes.profileCreationFailed
      ) {
        logger.error('Profile creation failed', errorResult.error.message);
      }

      return respond(c, result);
    }

    logger.info('User signup successful', {
      userId: result.data.userId,
      role: result.data.role,
    });

    return respond(c, result);
  });
};