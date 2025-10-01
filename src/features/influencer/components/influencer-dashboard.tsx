'use client';

import Link from 'next/link';
import { Plus, CheckCircle2, Clock, XCircle, Youtube, Instagram } from 'lucide-react';
import { useProfileQuery } from '@/features/influencer/hooks/useProfileQuery';
import { useApplicationsQuery } from '@/features/applications/hooks/useApplicationsQuery';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'youtube':
      return <Youtube className="h-4 w-4" />;
    case 'instagram':
      return <Instagram className="h-4 w-4" />;
    case 'naver':
      return <span className="text-xs font-bold">N</span>;
    case 'threads':
      return <span className="text-xs font-bold">@</span>;
    default:
      return null;
  }
};

const getChannelStatusBadge = (status: string) => {
  switch (status) {
    case 'verified':
      return <Badge className="bg-emerald-500 text-white">인증완료</Badge>;
    case 'pending':
      return <Badge variant="secondary">검증중</Badge>;
    case 'failed':
      return <Badge variant="destructive">인증실패</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function InfluencerDashboard() {
  const { data: profileData, isLoading: profileLoading } = useProfileQuery(true);
  const { data: applicationsData, isLoading: applicationsLoading } = useApplicationsQuery({
    page: 1,
    limit: 100
  });

  const channels = profileData?.channels || [];
  const applications = applicationsData?.applications || [];

  // 지원 상태별 분류
  const recruitingApps = applications.filter(app => app.campaign?.status === 'recruiting');
  const rejectedApps = applications.filter(app => app.status === 'rejected');
  const selectedApps = applications.filter(app => app.status === 'selected');

  return (
    <div className="space-y-8">
      {/* SNS 채널 목록 */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">내 SNS 채널</h2>
            <p className="text-sm text-slate-500 mt-1">등록된 SNS 채널 목록</p>
          </div>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/influencer/profile" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              채널 추가하기
            </Link>
          </Button>
        </div>

        {profileLoading ? (
          <div className="text-center py-8 text-slate-500">로딩 중...</div>
        ) : channels.length === 0 ? (
          <EmptyState
            title="등록된 SNS 채널이 없습니다"
            description="체험단에 지원하려면 먼저 SNS 채널을 추가해주세요."
            action={
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/influencer/profile" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  첫 번째 채널 추가하기
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-white p-2 border border-slate-200">
                      {getPlatformIcon(channel.platform)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{channel.name}</h3>
                      <p className="text-xs text-slate-500 capitalize">{channel.platform}</p>
                    </div>
                  </div>
                  {getChannelStatusBadge(channel.status)}
                </div>
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:underline truncate block"
                >
                  {channel.url}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 내 지원 체험단 */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">내 지원 체험단</h2>
            <p className="text-sm text-slate-500 mt-1">지원한 체험단 현황</p>
          </div>
          <Link
            href="/dashboard/applications"
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            전체 보기
          </Link>
        </div>

        {applicationsLoading ? (
          <div className="text-center py-8 text-slate-500">로딩 중...</div>
        ) : applications.length === 0 ? (
          <EmptyState
            title="지원한 체험단이 없습니다"
            description="다양한 체험단에 지원하고 특별한 혜택을 경험해보세요!"
            action={
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/campaigns">체험단 둘러보기</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {/* 모집중 */}
            {recruitingApps.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <h3 className="font-semibold text-slate-900">모집중 ({recruitingApps.length})</h3>
                </div>
                <div className="space-y-2">
                  {recruitingApps.slice(0, 3).map((app) => (
                    <Link
                      key={app.id}
                      href={`/campaigns/${app.campaignId}`}
                      className="block rounded-lg border border-amber-200 bg-amber-50 p-4 hover:bg-amber-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{app.campaign?.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            마감: {app.campaign?.recruitmentEnd}
                          </p>
                        </div>
                        <Badge className="bg-amber-500 text-white">대기중</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 선정 */}
            {selectedApps.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-semibold text-slate-900">선정 ({selectedApps.length})</h3>
                </div>
                <div className="space-y-2">
                  {selectedApps.slice(0, 3).map((app) => (
                    <Link
                      key={app.id}
                      href={`/campaigns/${app.campaignId}`}
                      className="block rounded-lg border border-emerald-200 bg-emerald-50 p-4 hover:bg-emerald-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{app.campaign?.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            마감: {app.campaign?.recruitmentEnd}
                          </p>
                        </div>
                        <Badge className="bg-emerald-500 text-white">선정완료</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 반려 */}
            {rejectedApps.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <h3 className="font-semibold text-slate-900">반려 ({rejectedApps.length})</h3>
                </div>
                <div className="space-y-2">
                  {rejectedApps.slice(0, 3).map((app) => (
                    <Link
                      key={app.id}
                      href={`/campaigns/${app.campaignId}`}
                      className="block rounded-lg border border-rose-200 bg-rose-50 p-4 hover:bg-rose-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{app.campaign?.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            마감: {app.campaign?.recruitmentEnd}
                          </p>
                        </div>
                        <Badge variant="destructive">반려됨</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
