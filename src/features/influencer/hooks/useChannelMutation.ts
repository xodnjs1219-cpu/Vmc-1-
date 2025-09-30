'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type {
  ChannelUpdateRequest,
  ChannelResponse,
} from '@/features/influencer/lib/dto';

type UpdateChannelParams = {
  channelId: string;
  data: ChannelUpdateRequest;
};

type DeleteChannelParams = {
  channelId: string;
};

const updateChannel = async ({
  channelId,
  data,
}: UpdateChannelParams): Promise<ChannelResponse> => {
  const response = await apiClient.put<ChannelResponse>(
    `/influencer/channels/${channelId}`,
    data,
  );
  return response.data;
};

const deleteChannel = async ({
  channelId,
}: DeleteChannelParams): Promise<void> => {
  await apiClient.delete(`/influencer/channels/${channelId}`);
};

export const useChannelUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer', 'profile'] });
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(
        error,
        '채널 수정 중 오류가 발생했습니다',
      );
      console.error('Channel update failed:', message);
    },
  });
};

export const useChannelDeleteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer', 'profile'] });
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(
        error,
        '채널 삭제 중 오류가 발생했습니다',
      );
      console.error('Channel deletion failed:', message);
    },
  });
};