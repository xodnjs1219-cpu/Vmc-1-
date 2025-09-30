'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  ApplicantsListResponseSchema,
  type ApplicantsListResponse,
} from '@/features/campaigns/lib/dto';

const buildQueryKey = (campaignId: string) => ['campaign', campaignId, 'applicants'] as const;

export const useCampaignApplicantsQuery = (
  campaignId: string,
  options?: Pick<
    UseQueryOptions<ApplicantsListResponse, Error, ApplicantsListResponse, ReturnType<typeof buildQueryKey>>,
    'enabled'
  >,
) =>
  useQuery({
    queryKey: buildQueryKey(campaignId),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ApplicantsListResponse>(
          `/campaigns/${campaignId}/applicants`,
        );
        return ApplicantsListResponseSchema.parse(data);
      } catch (error) {
        throw new Error(extractApiErrorMessage(error, '지원자 정보를 불러오지 못했습니다.'));
      }
    },
    ...options,
  });
