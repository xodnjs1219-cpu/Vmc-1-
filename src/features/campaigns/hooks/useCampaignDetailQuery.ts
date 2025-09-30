'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  CampaignDetailResponseSchema,
  type CampaignDetailResponse,
} from '@/features/campaigns/lib/dto';

const buildQueryKey = (campaignId: string) => ['campaign', 'detail', campaignId] as const;

export const useCampaignDetailQuery = (
  campaignId: string,
  options?: Pick<
    UseQueryOptions<CampaignDetailResponse, Error, CampaignDetailResponse, ReturnType<typeof buildQueryKey>>,
    'enabled'
  >,
) =>
  useQuery({
    queryKey: buildQueryKey(campaignId),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<CampaignDetailResponse>(`/campaigns/${campaignId}`);
        return CampaignDetailResponseSchema.parse(data);
      } catch (error) {
        throw new Error(extractApiErrorMessage(error, '체험단 상세 정보를 불러오지 못했습니다.'));
      }
    },
    ...options,
  });
