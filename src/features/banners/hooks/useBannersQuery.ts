'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  BannerListResponseSchema,
  type BannerListResponse,
} from '@/features/banners/lib/dto';

const BANNERS_QUERY_KEY = ['banners'] as const;

export const useBannersQuery = () =>
  useQuery<BannerListResponse>({
    queryKey: BANNERS_QUERY_KEY,
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<BannerListResponse>('/banners');
        return BannerListResponseSchema.parse(data);
      } catch (error) {
        throw new Error(extractApiErrorMessage(error, '배너 정보를 불러오지 못했습니다.'));
      }
    },
    staleTime: 5 * 60 * 1000,
  });
