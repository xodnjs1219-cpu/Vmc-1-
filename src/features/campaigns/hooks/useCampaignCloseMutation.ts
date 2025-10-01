'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';

export const useCampaignCloseMutation = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.patch(`/campaigns/${campaignId}/status`, {
          status: 'closed',
        });
      } catch (error) {
        throw new Error(extractApiErrorMessage(error, '모집 종료에 실패했습니다'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', campaignId, 'manage'] });
      queryClient.invalidateQueries({ queryKey: ['advertiser-campaigns'] });
    },
  });
};
