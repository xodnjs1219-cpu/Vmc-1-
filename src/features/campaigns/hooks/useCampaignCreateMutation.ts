'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CampaignCreateRequest,
  CampaignCreateResponseSchema,
} from '@/features/campaigns/lib/dto';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';

export const useCampaignCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CampaignCreateRequest) => {
      try {
        const response = await apiClient.post('/campaigns', data);
        return CampaignCreateResponseSchema.parse(response.data);
      } catch (error) {
        throw new Error(extractApiErrorMessage(error, '체험단 생성에 실패했습니다'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertiser-campaigns'] });
    },
  });
};