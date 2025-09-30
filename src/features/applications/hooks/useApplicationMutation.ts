'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApplicationSubmitRequest } from '@/features/applications/lib/dto';

export const useApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApplicationSubmitRequest) => {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '지원 신청에 실패했습니다');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};