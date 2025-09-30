'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CampaignCreateRequestSchema,
  type CampaignCreateRequest,
} from '@/features/campaigns/lib/dto';
import { useCampaignCreateMutation } from '@/features/campaigns/hooks/useCampaignCreateMutation';

const buildDefaultValues = (): CampaignCreateRequest => {
  const today = new Date();
  const defaultEndDate = new Date(today);
  defaultEndDate.setDate(today.getDate() + 7);

  return {
    title: '',
    recruitmentStart: format(today, 'yyyy-MM-dd'),
    recruitmentEnd: format(defaultEndDate, 'yyyy-MM-dd'),
    maxParticipants: 5,
    benefits: '',
    storeInfo: '',
    mission: '',
  } satisfies CampaignCreateRequest;
};

export type CampaignCreateFormProps = {
  onSuccess?: () => void;
};

export const CampaignCreateForm = ({ onSuccess }: CampaignCreateFormProps) => {
  const { toast } = useToast();
  const campaignMutation = useCampaignCreateMutation();

  const form = useForm<CampaignCreateRequest>({
    resolver: zodResolver(CampaignCreateRequestSchema),
    defaultValues: buildDefaultValues(),
  });

  const handleSubmitForm = (values: CampaignCreateRequest) => {
    campaignMutation.mutate(values, {
      onSuccess: () => {
        toast({
          title: '체험단 등록 완료',
          description: '체험단이 정상적으로 등록되었습니다.',
        });
        onSuccess?.();
      },
      onError: (error) => {
        toast({
          title: '등록 실패',
          description: error instanceof Error ? error.message : '체험단 등록에 실패했습니다.',
          variant: 'destructive',
        });
      },
    });
  };

  const { register, handleSubmit, formState } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle>체험단 정보</CardTitle>
        <CardDescription>모집 정보를 입력해주세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">체험단명</Label>
            <Input id="title" placeholder="예: 신제품 카페 체험" {...register('title')} />
            {formState.errors.title && (
              <p className="text-sm text-destructive">{formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recruitmentStart">모집 시작일</Label>
              <Input id="recruitmentStart" type="date" {...register('recruitmentStart')} />
              {formState.errors.recruitmentStart && (
                <p className="text-sm text-destructive">
                  {formState.errors.recruitmentStart.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="recruitmentEnd">모집 종료일</Label>
              <Input id="recruitmentEnd" type="date" {...register('recruitmentEnd')} />
              {formState.errors.recruitmentEnd && (
                <p className="text-sm text-destructive">
                  {formState.errors.recruitmentEnd.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants">모집 인원</Label>
            <Input
              id="maxParticipants"
              type="number"
              min={1}
              {...register('maxParticipants', { valueAsNumber: true })}
            />
            {formState.errors.maxParticipants && (
              <p className="text-sm text-destructive">
                {formState.errors.maxParticipants.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">제공 혜택</Label>
            <Textarea
              id="benefits"
              rows={4}
              placeholder="제공되는 혜택을 상세히 입력해주세요"
              {...register('benefits')}
            />
            {formState.errors.benefits && (
              <p className="text-sm text-destructive">{formState.errors.benefits.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeInfo">매장 정보</Label>
            <Textarea
              id="storeInfo"
              rows={4}
              placeholder="매장 주소, 운영 시간 등"
              {...register('storeInfo')}
            />
            {formState.errors.storeInfo && (
              <p className="text-sm text-destructive">{formState.errors.storeInfo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mission">미션</Label>
            <Textarea
              id="mission"
              rows={4}
              placeholder="인플루언서가 수행할 활동을 입력해주세요"
              {...register('mission')}
            />
            {formState.errors.mission && (
              <p className="text-sm text-destructive">{formState.errors.mission.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => form.reset(buildDefaultValues())}>
              초기화
            </Button>
            <Button type="submit" disabled={campaignMutation.isPending}>
              {campaignMutation.isPending ? '등록 중...' : '등록하기'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
