'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AdvertiserProfileSubmitRequest } from '@/features/advertiser/lib/dto';

export const useAdvertiserProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AdvertiserProfileSubmitRequest) => {
      const response = await fetch('/api/advertiser/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '프로필 저장에 실패했습니다');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertiser-profile'] });
    },
  });
};