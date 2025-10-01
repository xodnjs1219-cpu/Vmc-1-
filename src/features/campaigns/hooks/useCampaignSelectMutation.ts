'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';

export const useCampaignSelectMutation = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (selectedIds: string[]) => {
      try {
        await apiClient.post(`/campaigns/${campaignId}/select`, {
          selectedIds,
        });
      } catch (error) {
        throw new Error(extractApiErrorMessage(error, '체험단 선정에 실패했습니다'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', campaignId, 'manage'] });
      queryClient.invalidateQueries({ queryKey: ['advertiser-campaigns'] });
    },
  });
};
