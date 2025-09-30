import type { Hono } from 'hono';
import { respond } from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { getActiveBanners } from '@/features/banners/backend/service';

export const registerBannerRoutes = (app: Hono<AppEnv>) => {
  app.get('/banners', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getActiveBanners(supabase);

    if (!result.ok) {
      logger.error('Failed to fetch banners');
      return respond(c, result);
    }

    logger.info('Banners retrieved', {
      count: result.data.banners.length,
    });

    return respond(c, result);
  });
};