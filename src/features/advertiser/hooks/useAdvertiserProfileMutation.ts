'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AdvertiserProfileSubmitRequest,
  AdvertiserProfileSubmitResponseSchema,
} from '@/features/advertiser/lib/dto';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';

export const useAdvertiserProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AdvertiserProfileSubmitRequest) => {
      try {
        const response = await apiClient.post('/advertiser/profile', data);
        return AdvertiserProfileSubmitResponseSchema.parse(response.data);
      } catch (error) {
        throw new Error(extractApiErrorMessage(error, '프로필 저장에 실패했습니다'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertiser-profile'] });
    },
  });
};