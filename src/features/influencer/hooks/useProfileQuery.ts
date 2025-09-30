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
      'status' in error.response &&
      error.response.status === 404
    ) {
      return null;
    }
    throw error;
  }
};

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ['influencer', 'profile'],
    queryFn: fetchProfile,
    retry: false,
  });
};