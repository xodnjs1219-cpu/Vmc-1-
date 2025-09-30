'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  SignupResponseSchema,
  type SignupRequest,
  type SignupResponse,
} from '@/features/auth/lib/dto';
import { useToast } from '@/hooks/use-toast';

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
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      toast({
        title: '회원가입 성공',
        description: '이메일 인증을 완료해주세요',
      });

      if (data.role === 'advertiser') {
        router.push('/advertiser-onboarding');
      } else if (data.role === 'influencer') {
        router.push('/influencer-onboarding');
      }
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