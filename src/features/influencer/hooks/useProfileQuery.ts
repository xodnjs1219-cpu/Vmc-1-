'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { ProfileQueryResponse } from '@/features/influencer/lib/dto';

const fetchProfile = async (): Promise<ProfileQueryResponse | null> => {
  try {
    const response = await apiClient.get<ProfileQueryResponse>(
      '/influencer/profile',
    );
    return response.data;
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'status' in error.response
    ) {
      const status = error.response.status;
      // 404: 프로필 없음 (정상), 401: 인증 오류 (정상 - 로그인 필요)
      if (status === 404 || status === 401) {
        return null;
      }
    }
    throw error;
  }
};

export const useProfileQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['influencer', 'profile'],
    queryFn: fetchProfile,
    retry: false,
    enabled,
  });
};