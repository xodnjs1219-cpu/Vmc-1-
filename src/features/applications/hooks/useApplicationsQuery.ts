'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { ApplicationListResponseSchema, type ApplicationListQuery, type ApplicationListResponse } from '@/features/applications/lib/dto';

export const useApplicationsQuery = (query: ApplicationListQuery) => {
  return useQuery({
    queryKey: ['applications', query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.status) params.append('status', query.status);
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());

      const { data } = await apiClient.get<ApplicationListResponse>(`/applications?${params.toString()}`);
      return ApplicationListResponseSchema.parse(data);
    },
  });
};