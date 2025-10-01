'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  CampaignDetailAdvertiserResponseSchema,
  type CampaignDetailAdvertiserResponse,
} from '@/features/campaigns/lib/dto';

export const useCampaignManageQuery = (campaignId: string) =>
  useQuery({
    queryKey: ['campaigns', campaignId, 'manage'],
    queryFn: async (): Promise<CampaignDetailAdvertiserResponse> => {
      try {
        const { data } = await apiClient.get(`/campaigns/${campaignId}/manage`);
        return CampaignDetailAdvertiserResponseSchema.parse(data);
      } catch (error) {
        throw new Error(extractApiErrorMessage(error, '체험단 관리 정보 조회에 실패했습니다'));
      }
    },
    enabled: !!campaignId,
  });
