'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage, isAxiosError } from '@/lib/remote/api-client';
import {
  AdvertiserProfileResponseSchema,
  type AdvertiserProfileResponse,
} from '@/features/advertiser/lib/dto';

export const useAdvertiserProfileQuery = () =>
  useQuery<AdvertiserProfileResponse | null>({
    queryKey: ['advertiser-profile'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<AdvertiserProfileResponse>('/advertiser/profile');
        return AdvertiserProfileResponseSchema.parse(data);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw new Error(extractApiErrorMessage(error, '프로필 조회에 실패했습니다'));
      }
    },
  });