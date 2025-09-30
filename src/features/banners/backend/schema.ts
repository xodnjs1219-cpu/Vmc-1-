import { z } from 'zod';

export const BannerResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  imageUrl: z.string(),
  linkUrl: z.string().optional(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BannerResponse = z.infer<typeof BannerResponseSchema>;

export const BannerListResponseSchema = z.object({
  banners: z.array(BannerResponseSchema),
  totalCount: z.number(),
});

export type BannerListResponse = z.infer<typeof BannerListResponseSchema>;

export const BannerRowSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  image_url: z.string(),
  link_url: z.string().nullable(),
  display_order: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type BannerRow = z.infer<typeof BannerRowSchema>;