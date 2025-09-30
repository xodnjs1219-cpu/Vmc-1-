'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { SignupRequestSchema } from '@/features/auth/lib/dto';
import { useSignupMutation } from '@/features/auth/hooks/useSignupMutation';
import { formatPhoneNumber } from '@/features/auth/lib/validation';

const SignupFormSchema = SignupRequestSchema.extend({
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof SignupFormSchema>;

export const SignupForm = () => {
  const router = useRouter();
  const signupMutation = useSignupMutation();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
      termsAgreed: undefined,
    },
  });

  const onSubmit = (values: SignupFormValues) => {
    const { confirmPassword, ...signupData } = values;
    void confirmPassword;
    signupMutation.mutate(signupData, {
      onSuccess: (payload) => {
        router.push(payload.onboardingPath);
      },
    });
  };

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (...event: unknown[]) => void,
  ) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full max-w-md flex-col gap-6"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">회원가입</h1>
          <p className="text-sm text-slate-500">
            체험단 플랫폼에 가입하고 다양한 혜택을 받아보세요
          </p>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input placeholder="홍길동" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>휴대폰번호</FormLabel>
              <FormControl>
                <Input
                  placeholder="010-0000-0000"
                  {...field}
                  onChange={(e) => handlePhoneChange(e, field.onChange)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호 확인</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>역할 선택</FormLabel>
              <FormControl>
                <div className="flex gap-4">
                  <Label
                    htmlFor="role-advertiser"
                    className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      id="role-advertiser"
                      value="advertiser"
                      checked={field.value === 'advertiser'}
                      onChange={() => field.onChange('advertiser')}
                      className="h-4 w-4"
                    />
                    <div>
                      <div className="font-medium">광고주</div>
                      <div className="text-xs text-slate-500">
                        체험단 등록 및 관리
                      </div>
                    </div>
                  </Label>
                  <Label
                    htmlFor="role-influencer"
                    className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      id="role-influencer"
                      value="influencer"
                      checked={field.value === 'influencer'}
                      onChange={() => field.onChange('influencer')}
                      className="h-4 w-4"
                    />
                    <div>
                      <div className="font-medium">인플루언서</div>
                      <div className="text-xs text-slate-500">
                        체험단 지원 및 활동
                      </div>
                    </div>
                  </Label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="termsAgreed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  서비스 이용약관 및 개인정보 처리방침에 동의합니다
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={signupMutation.isPending}
          className="w-full"
        >
          {signupMutation.isPending ? '가입 중...' : '회원가입'}
        </Button>
      </form>
    </Form>
  );
};