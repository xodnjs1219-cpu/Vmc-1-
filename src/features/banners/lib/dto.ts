import { z } from 'zod';
import { BannerListResponseSchema } from '@/features/banners/backend/schema';

export type BannerListResponse = z.infer<typeof BannerListResponseSchema>;

export { BannerListResponseSchema };

