'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ArrowLeft, Calendar, Users, Gift, Target, Store, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ApplicantTable } from './applicant-table';
import { useCampaignManageQuery } from '@/features/campaigns/hooks/useCampaignManageQuery';
import { useCampaignCloseMutation } from '@/features/campaigns/hooks/useCampaignCloseMutation';
import { useCampaignSelectMutation } from '@/features/campaigns/hooks/useCampaignSelectMutation';
import { Loader2 } from 'lucide-react';

const STATUS_MAP = {
  recruiting: { label: '모집중', color: 'bg-indigo-100 text-indigo-700' },
  closed: { label: '모집종료', color: 'bg-amber-100 text-amber-700' },
  completed: { label: '선정완료', color: 'bg-emerald-100 text-emerald-700' },
} as const;

type CampaignDetailAdvertiserProps = {
  campaignId: string;
};

export const CampaignDetailAdvertiser = ({
  campaignId,
}: CampaignDetailAdvertiserProps) => {
  const { data, isLoading, error } = useCampaignManageQuery(campaignId);
  const closeMutation = useCampaignCloseMutation(campaignId);
  const selectMutation = useCampaignSelectMutation(campaignId);

  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-3xl">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6">
          <p className="text-red-600 font-semibold mb-2">오류가 발생했습니다</p>
          <p className="text-sm text-red-500">
            {error instanceof Error ? error.message : '체험단 정보를 불러오는데 실패했습니다'}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { campaign, applicants } = data;
  const status = STATUS_MAP[campaign.status];

  const handleCloseRecruitment = () => {
    closeMutation.mutate(undefined, {
      onSuccess: () => {
        setIsCloseDialogOpen(false);
        alert('모집이 종료되었습니다');
      },
      onError: (error) => {
        alert(error.message);
      },
    });
  };

  const handleSelectApplicants = (ids: string[]) => {
    setSelectedIds(ids);
    setIsSelectDialogOpen(true);
  };

  const handleConfirmSelection = () => {
    selectMutation.mutate(selectedIds, {
      onSuccess: () => {
        setIsSelectDialogOpen(false);
        setSelectedIds([]);
        alert('체험단 선정이 완료되었습니다');
      },
      onError: (error) => {
        alert(error.message);
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/dashboard/my-campaigns"
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로 돌아가기
          </Link>

          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {campaign.title}
                </h1>
                <Badge className={status.color}>{status.label}</Badge>
              </div>
              {campaign.advertiser && (
                <p className="text-lg text-white/90">
                  {campaign.advertiser.companyName} · {campaign.advertiser.category} · {campaign.advertiser.location}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {campaign.status === 'recruiting' && (
                <Button
                  onClick={() => setIsCloseDialogOpen(true)}
                  variant="secondary"
                  className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                >
                  모집 종료
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* 체험단 정보 */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-indigo-100 p-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900">모집 기간</h3>
            </div>
            <p className="text-sm text-slate-600">
              {format(new Date(campaign.recruitmentStart), 'yyyy년 M월 d일', { locale: ko })} ~{' '}
              {format(new Date(campaign.recruitmentEnd), 'yyyy년 M월 d일', { locale: ko })}
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-emerald-100 p-2">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900">모집 현황</h3>
            </div>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-emerald-600">{applicants.length}명</span> 지원 /{' '}
              <span className="font-semibold text-slate-900">{campaign.maxParticipants}명</span> 모집
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-pink-100 p-2">
                <Gift className="h-5 w-5 text-pink-600" />
              </div>
              <h3 className="font-semibold text-slate-900">제공 혜택</h3>
            </div>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{campaign.benefits}</p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-purple-100 p-2">
                <Store className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900">매장 정보</h3>
            </div>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{campaign.storeInfo}</p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-amber-100 p-2">
                <Target className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900">미션</h3>
            </div>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{campaign.mission}</p>
          </div>
        </div>

        {/* 지원자 관리 */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">지원자 관리</h2>
          <ApplicantTable
            applicants={applicants}
            campaignStatus={campaign.status}
            maxParticipants={campaign.maxParticipants}
            onSelect={handleSelectApplicants}
          />
        </div>
      </div>

      {/* 모집 종료 확인 다이얼로그 */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>모집을 종료하시겠습니까?</DialogTitle>
            <DialogDescription>
              모집을 종료하면 더 이상 지원을 받을 수 없습니다. 모집 종료 후 체험단을 선정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleCloseRecruitment}
              disabled={closeMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {closeMutation.isPending ? '처리 중...' : '모집 종료'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 선정 확정 다이얼로그 */}
      <Dialog open={isSelectDialogOpen} onOpenChange={setIsSelectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              선정을 확정하시겠습니까?
            </DialogTitle>
            <DialogDescription>
              선정을 확정하면 변경할 수 없습니다. 선정된 인플루언서에게 알림이 전송되며, 선정되지 않은 지원자는 자동으로 반려 처리됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">
              선정 인원: <strong className="text-emerald-600">{selectedIds.length}명</strong> / {campaign.maxParticipants}명
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSelectDialogOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleConfirmSelection}
              disabled={selectMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {selectMutation.isPending ? '처리 중...' : '선정 확정'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
