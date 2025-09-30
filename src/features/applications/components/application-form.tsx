'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  ApplicationSubmitRequestSchema,
  type ApplicationSubmitRequest,
} from '@/features/applications/lib/dto';
import { useApplicationMutation } from '@/features/applications/hooks/useApplicationMutation';

interface ApplicationFormProps {
  campaignId: string;
  onSuccess?: () => void;
}

export const ApplicationForm = ({ campaignId, onSuccess }: ApplicationFormProps) => {
  const { toast } = useToast();
  const applicationMutation = useApplicationMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationSubmitRequest>({
    resolver: zodResolver(ApplicationSubmitRequestSchema),
    defaultValues: {
      campaignId,
      message: '',
      visitDate: '',
    },
  });

  const onSubmit = (data: ApplicationSubmitRequest) => {
    applicationMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: '지원 완료',
          description: '체험단 지원이 완료되었습니다.',
        });
        onSuccess?.();
      },
      onError: (error) => {
        toast({
          title: '오류 발생',
          description:
            error instanceof Error ? error.message : '지원 중 오류가 발생했습니다',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>체험단 지원하기</CardTitle>
        <CardDescription>
          각오 한마디와 방문 예정일을 입력해주세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="message">각오 한마디 (1~500자)</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="체험단에 지원하는 이유와 각오를 작성해주세요"
              rows={5}
              maxLength={500}
            />
            {errors.message && (
              <p className="text-sm text-destructive mt-1">
                {errors.message.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="visitDate">방문 예정일</Label>
            <Input id="visitDate" type="date" {...register('visitDate')} />
            {errors.visitDate && (
              <p className="text-sm text-destructive mt-1">
                {errors.visitDate.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              모집 종료일 이후 날짜를 선택해주세요
            </p>
          </div>

          <Button
            type="submit"
            disabled={applicationMutation.isPending}
            className="w-full"
          >
            {applicationMutation.isPending ? '지원 중...' : '지원하기'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};