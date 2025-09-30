'use client';

import { useQuery } from '@tanstack/react-query';
import type { CampaignListQuery } from '@/features/campaigns/lib/dto';

export const useCampaignsQuery = (query: CampaignListQuery) => {
  return useQuery({
    queryKey: ['campaigns', query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.status) params.append('status', query.status);
      if (query.category) params.append('category', query.category);
      if (query.region) params.append('region', query.region);
      if (query.sort) params.append('sort', query.sort);
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());

      const response = await fetch(`/api/campaigns?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '체험단 목록 조회에 실패했습니다');
      }

      const result = await response.json();
      return result.data;
    },
  });
};

export const useAdvertiserCampaignsQuery = () => {
  return useQuery({
    queryKey: ['advertiser-campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/advertiser/campaigns');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '체험단 목록 조회에 실패했습니다');
      }

      const result = await response.json();
      return result.data;
    },
  });
};