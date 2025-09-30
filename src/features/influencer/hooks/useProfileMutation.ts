'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type {
  ProfileSubmitRequest,
  ProfileSubmitResponse,
} from '@/features/influencer/lib/dto';

const submitProfile = async (
  data: ProfileSubmitRequest,
): Promise<ProfileSubmitResponse> => {
  const response = await apiClient.post<ProfileSubmitResponse>(
    '/influencer/profile',
    data,
  );
  return response.data;
};

export const useProfileMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['influencer', 'profile'] });

      if (data.profileStatus === 'submitted') {
        router.push('/');
      }
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(
        error,
        '프로필 저장 중 오류가 발생했습니다',
      );
      console.error('Profile submission failed:', message);
    },
  });
};