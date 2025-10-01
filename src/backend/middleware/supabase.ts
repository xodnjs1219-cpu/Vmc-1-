import { createMiddleware } from 'hono/factory';
import {
  contextKeys,
  type AppEnv,
} from '@/backend/hono/context';
import { createAuthenticatedClient } from '@/backend/supabase/client';

export const withSupabase = () =>
  createMiddleware<AppEnv>(async (c, next) => {
    const config = c.get(
      contextKeys.config,
    ) as AppEnv['Variables']['config'] | undefined;

    if (!config) {
      throw new Error('Application configuration is not available.');
    }

    // 쿠키에서 사용자 세션을 읽어오는 인증된 클라이언트 생성
    const client = await createAuthenticatedClient(c, config.supabase);

    c.set(contextKeys.supabase, client);

    await next();
  });
