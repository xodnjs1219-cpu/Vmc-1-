'use client';

import { useQuery } from '@tanstack/react-query';

export const useAdvertiserProfileQuery = () => {
  return useQuery({
    queryKey: ['advertiser-profile'],
    queryFn: async () => {
      const response = await fetch('/api/advertiser/profile');

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '프로필 조회에 실패했습니다');
      }

      const result = await response.json();
      return result.data?.profile;
    },
  });
};