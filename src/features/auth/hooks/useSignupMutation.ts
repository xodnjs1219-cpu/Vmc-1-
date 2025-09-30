'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  SignupResponseSchema,
  type SignupRequest,
  type SignupResponse,
} from '@/features/auth/lib/dto';
import { useToast } from '@/hooks/use-toast';

type SignupSuccessPayload = {
  onboardingPath: '/advertiser-onboarding' | '/influencer-onboarding';
  response: SignupResponse;
};

const signup = async (request: SignupRequest): Promise<SignupResponse> => {
  try {
    const { data } = await apiClient.post('/auth/signup', request);
    return SignupResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(error, '회원가입에 실패했습니다');
    throw new Error(message);
  }
};

export const useSignupMutation = () => {
  const { toast } = useToast();

  return useMutation<SignupSuccessPayload, Error, SignupRequest>({
    mutationFn: async (request) => {
      const response = await signup(request);
      const onboardingPath =
        response.role === 'advertiser'
          ? '/advertiser-onboarding'
          : '/influencer-onboarding';

      return { response, onboardingPath } satisfies SignupSuccessPayload;
    },
    onSuccess: () => {
      toast({
        title: '회원가입 성공',
        description: '이메일 인증을 완료해주세요',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '회원가입 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};