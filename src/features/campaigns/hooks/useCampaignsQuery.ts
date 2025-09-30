'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  CampaignListQuery,
  CampaignListResponseSchema,
} from '@/features/campaigns/lib/dto';

export const useCampaignsQuery = (query: CampaignListQuery) =>
  useQuery({
    queryKey: ['campaigns', query],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/campaigns', { params: query });
        return CampaignListResponseSchema.parse(data);
      } catch (error) {
        throw new Error(extractApiErrorMessage(error, '체험단 목록 조회에 실패했습니다'));
      }
    },
  });

export const useAdvertiserCampaignsQuery = () =>
  useQuery({
    queryKey: ['advertiser-campaigns'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/advertiser/campaigns');
        return CampaignListResponseSchema.parse(data);
      } catch (error) {
        throw new Error(extractApiErrorMessage(error, '체험단 목록 조회에 실패했습니다'));
      }
    },
  });