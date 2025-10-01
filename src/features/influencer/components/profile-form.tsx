'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ProfileSubmitRequestSchema } from '@/features/influencer/lib/dto';
import type {
  ProfileSubmitRequest,
  Channel,
} from '@/features/influencer/lib/dto';
import { useProfileMutation } from '@/features/influencer/hooks/useProfileMutation';
import { useProfileQuery } from '@/features/influencer/hooks/useProfileQuery';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { ChannelItem } from './channel-item';

const platformOptions = [
  {
    value: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/username',
    example: 'https://instagram.com/myaccount'
  },
  {
    value: 'youtube',
    label: 'YouTube',
    placeholder: 'https://youtube.com/@channelname',
    example: 'https://youtube.com/@mychannel'
  },
  {
    value: 'naver',
    label: '네이버 블로그',
    placeholder: 'https://blog.naver.com/blogid',
    example: 'https://blog.naver.com/myblog'
  },
  {
    value: 'threads',
    label: 'Threads',
    placeholder: 'https://threads.net/@username',
    example: 'https://threads.net/@myaccount'
  },
] as const;

export const ProfileForm = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useCurrentUser();
  const profileMutation = useProfileMutation();
  const { data: profileData, isLoading, error } = useProfileQuery(isAuthenticated);
  const [existingChannels, setExistingChannels] = useState<
    Array<{ id: string; platform: string; name: string; url: string; status: string }>
  >([]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileSubmitRequest>({
    resolver: zodResolver(ProfileSubmitRequestSchema),
    defaultValues: {
      birthDate: '',
      channels: [
        {
          platform: 'instagram',
          name: '',
          url: '',
        },
      ],
      status: 'submitted',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'channels',
  });

  useEffect(() => {
    if (profileData) {
      setValue('birthDate', profileData.profile.birthDate);
      setExistingChannels(
        profileData.channels.map((c) => ({
          id: c.id,
          platform: c.platform,
          name: c.name,
          url: c.url,
          status: c.status,
        })),
      );
      if (profileData.channels.length === 0) {
        setValue('channels', [
          {
            platform: 'instagram',
            name: '',
            url: '',
          },
        ]);
      }
    }
  }, [profileData, setValue]);

  const onSubmit = (data: ProfileSubmitRequest) => {
    profileMutation.mutate(data, {
      onSuccess: (response) => {
        if (response.profileStatus === 'submitted') {
          toast({
            title: '프로필 등록 완료',
            description: '인플루언서 정보가 성공적으로 등록되었습니다. 채널 검증이 진행 중입니다.',
          });
        } else {
          toast({
            title: '임시저장 완료',
            description: '프로필 정보가 임시저장되었습니다.',
          });
        }
      },
      onError: (error) => {
        let errorMessage = '프로필 저장 중 오류가 발생했습니다';
        let errorDetails = '';

        if (error instanceof Error) {
          errorMessage = error.message;

          // 특정 에러 타입에 대한 상세 안내 추가
          if (error.message.includes('URL 형식')) {
            errorDetails = '각 플랫폼별 URL 형식을 확인해주세요. 예시를 참고하여 정확히 입력해주세요.';
          } else if (error.message.includes('만 14세')) {
            errorDetails = '인플루언서로 등록하려면 만 14세 이상이어야 합니다.';
          } else if (error.message.includes('이미 등록')) {
            errorDetails = '동일한 채널 URL이 이미 등록되어 있습니다. 다른 채널을 입력해주세요.';
          }
        }

        toast({
          title: '프로필 등록 실패',
          description: (
            <div className="space-y-2">
              <p className="font-medium">{errorMessage}</p>
              {errorDetails && (
                <p className="text-sm text-muted-foreground">{errorDetails}</p>
              )}
            </div>
          ),
          variant: 'destructive',
        });
      },
    });
  };

  const handleDraft = () => {
    setValue('status', 'draft');
    handleSubmit(onSubmit)();
  };

  const handleSubmitForm = () => {
    setValue('status', 'submitted');
    handleSubmit(onSubmit)();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>인플루언서 정보 등록</CardTitle>
          <CardDescription>
            생년월일과 SNS 채널 정보를 입력해주세요. 최소 1개 이상의 채널이 필요합니다.
          </CardDescription>
          <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">📌 URL 입력 시 주의사항</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>https://</strong> 를 포함한 전체 URL을 입력해주세요</li>
              <li>• 각 플랫폼별 형식에 맞게 정확히 입력해주세요</li>
              <li>• URL 입력란 아래 예시를 참고해주세요</li>
            </ul>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div>
              <Label htmlFor="birthDate">생년월일</Label>
              <Input
                id="birthDate"
                type="date"
                {...register('birthDate')}
                placeholder="YYYY-MM-DD"
              />
              {errors.birthDate && (
                <p className="text-sm text-destructive mt-1">
                  {errors.birthDate.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>SNS 채널</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      platform: 'instagram',
                      name: '',
                      url: '',
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  채널 추가
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label htmlFor={`channels.${index}.platform`}>
                        플랫폼
                      </Label>
                      <Select
                        value={watch(`channels.${index}.platform`)}
                        onValueChange={(value) =>
                          setValue(
                            `channels.${index}.platform`,
                            value as Channel['platform'],
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="플랫폼 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {platformOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.channels?.[index]?.platform && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.channels[index]?.platform?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`channels.${index}.name`}>채널명</Label>
                      <Input
                        id={`channels.${index}.name`}
                        {...register(`channels.${index}.name`)}
                        placeholder="채널명을 입력하세요"
                      />
                      {errors.channels?.[index]?.name && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.channels[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`channels.${index}.url`}>URL</Label>
                      <Input
                        id={`channels.${index}.url`}
                        {...register(`channels.${index}.url`)}
                        placeholder={
                          platformOptions.find(
                            (opt) => opt.value === watch(`channels.${index}.platform`)
                          )?.placeholder || 'https://...'
                        }
                      />
                      {errors.channels?.[index]?.url && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.channels[index]?.url?.message}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        예시: {
                          platformOptions.find(
                            (opt) => opt.value === watch(`channels.${index}.platform`)
                          )?.example || 'https://...'
                        }
                      </p>
                    </div>

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        삭제
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}

              {errors.channels?.root && (
                <p className="text-sm text-destructive">
                  {errors.channels.root.message}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleDraft}
                disabled={profileMutation.isPending}
                className="flex-1"
              >
                임시저장
              </Button>
              <Button
                type="button"
                onClick={handleSubmitForm}
                disabled={profileMutation.isPending}
                className="flex-1"
              >
                {profileMutation.isPending ? '저장 중...' : '제출'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {existingChannels.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">등록된 채널</h3>
          {existingChannels.map((channel) => (
            <ChannelItem
              key={channel.id}
              channel={{
                id: channel.id,
                platform: channel.platform as 'instagram' | 'youtube' | 'naver' | 'threads',
                name: channel.name,
                url: channel.url,
                status: channel.status as 'pending' | 'verified' | 'failed',
                createdAt: '',
                updatedAt: '',
              }}
              onDelete={() => {
                setExistingChannels((prev) =>
                  prev.filter((c) => c.id !== channel.id),
                );
                toast({
                  title: '채널 삭제 완료',
                  description: '채널이 삭제되었습니다.',
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};