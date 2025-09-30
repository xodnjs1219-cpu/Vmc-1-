'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  AdvertiserProfileSubmitRequestSchema,
  type AdvertiserProfileSubmitRequest,
} from '@/features/advertiser/lib/dto';
import { useAdvertiserProfileMutation } from '@/features/advertiser/hooks/useAdvertiserProfileMutation';
import { useAdvertiserProfileQuery } from '@/features/advertiser/hooks/useAdvertiserProfileQuery';
import { formatBusinessNumber } from '@/lib/validation/business-number';

export const AdvertiserProfileForm = () => {
  const { toast } = useToast();
  const profileMutation = useAdvertiserProfileMutation();
  const { data: profileData, isLoading } = useAdvertiserProfileQuery();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdvertiserProfileSubmitRequest>({
    resolver: zodResolver(AdvertiserProfileSubmitRequestSchema),
    defaultValues: {
      companyName: '',
      location: '',
      category: '',
      businessNumber: '',
    },
  });

  useEffect(() => {
    if (profileData?.profile) {
      setValue('companyName', profileData.profile.companyName);
      setValue('location', profileData.profile.location);
      setValue('category', profileData.profile.category);
      setValue('businessNumber', profileData.profile.businessNumber);
    }
  }, [profileData, setValue]);

  const onSubmit = (data: AdvertiserProfileSubmitRequest) => {
    profileMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: '프로필 등록 완료',
          description: '광고주 정보가 성공적으로 등록되었습니다. 검증이 진행 중입니다.',
        });
      },
      onError: (error) => {
        toast({
          title: '오류 발생',
          description:
            error instanceof Error
              ? error.message
              : '프로필 저장 중 오류가 발생했습니다',
          variant: 'destructive',
        });
      },
    });
  };

  const handleBusinessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBusinessNumber(e.target.value);
    setValue('businessNumber', formatted);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>광고주 정보 등록</CardTitle>
        <CardDescription>
          업체 정보와 사업자등록번호를 입력해주세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="companyName">업체명</Label>
            <Input
              id="companyName"
              {...register('companyName')}
              placeholder="업체명을 입력하세요"
            />
            {errors.companyName && (
              <p className="text-sm text-destructive mt-1">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="location">위치</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="주소를 입력하세요"
            />
            {errors.location && (
              <p className="text-sm text-destructive mt-1">
                {errors.location.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="category">카테고리</Label>
            <Input
              id="category"
              {...register('category')}
              placeholder="업종을 입력하세요 (예: 카페, 레스토랑)"
            />
            {errors.category && (
              <p className="text-sm text-destructive mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="businessNumber">사업자등록번호</Label>
            <Input
              id="businessNumber"
              {...register('businessNumber')}
              onChange={handleBusinessNumberChange}
              placeholder="000-00-00000"
              maxLength={12}
            />
            {errors.businessNumber && (
              <p className="text-sm text-destructive mt-1">
                {errors.businessNumber.message}
              </p>
            )}
          </div>

          {profileData?.profile && (
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm">
                <span className="font-semibold">검증 상태:</span>{' '}
                {profileData.profile.verificationStatus === 'pending' && '검증 대기 중'}
                {profileData.profile.verificationStatus === 'verified' && '검증 완료'}
                {profileData.profile.verificationStatus === 'failed' && '검증 실패'}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={profileMutation.isPending}
            className="w-full"
          >
            {profileMutation.isPending ? '저장 중...' : '제출'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};