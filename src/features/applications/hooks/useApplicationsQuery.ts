'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApplicationListQuery } from '@/features/applications/lib/dto';

export const useApplicationsQuery = (query: ApplicationListQuery) => {
  return useQuery({
    queryKey: ['applications', query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.status) params.append('status', query.status);
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());

      const response = await fetch(`/api/applications?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '지원 목록 조회에 실패했습니다');
      }

      const result = await response.json();
      return result.data;
    },
  });
};