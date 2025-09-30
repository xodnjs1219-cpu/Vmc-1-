import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  bannerErrorCodes,
  type BannerErrorCode,
} from '@/features/banners/backend/error';
import {
  BannerListResponseSchema,
  type BannerListResponse,
  type BannerRow,
} from '@/features/banners/backend/schema';

const BANNERS_TABLE = 'banners';

export const getActiveBanners = async (
  client: SupabaseClient,
): Promise<
  HandlerResult<BannerListResponse, BannerErrorCode, unknown>
> => {
  const { data: bannersData, error: bannersError } = await client
    .from(BANNERS_TABLE)
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (bannersError) {
    return failure(
      500,
      bannerErrorCodes.bannerFetchFailed,
      '배너 목록을 가져오는데 실패했습니다',
    );
  }

  const banners = (bannersData as BannerRow[]) || [];

  const response: BannerListResponse = {
    banners: banners.map((b) => ({
      id: b.id,
      title: b.title,
      imageUrl: b.image_url,
      linkUrl: b.link_url || undefined,
      displayOrder: b.display_order,
      isActive: b.is_active,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    })),
    totalCount: banners.length,
  };

  const parsed = BannerListResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      bannerErrorCodes.validationError,
      '응답 데이터 검증에 실패했습니다',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 200);
};
