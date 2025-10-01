'use client';

import Link from 'next/link';
import { Plus, Clock, CheckCircle2, Building2 } from 'lucide-react';
import { useAdvertiserCampaignsQuery } from '@/features/campaigns/hooks/useCampaignsQuery';
import { useAdvertiserProfileQuery } from '@/features/advertiser/hooks/useAdvertiserProfileQuery';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export function AdvertiserDashboard() {
  const { data: campaignsData, isLoading: campaignsLoading } = useAdvertiserCampaignsQuery();
  const { data: profileData, isLoading: profileLoading } = useAdvertiserProfileQuery();

  const campaigns = campaignsData?.campaigns || [];
  const hasBusinessInfo = !!profileData;

  // 체험단 상태별 분류
  const recruitingCampaigns = campaigns.filter(c => c.status === 'recruiting');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed' || c.status === 'closed');

  return (
    <div className="space-y-8">
      {/* 사업장 정보 */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">사업장 정보</h2>
            <p className="text-sm text-slate-500 mt-1">광고주 사업장 정보 관리</p>
          </div>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/dashboard/advertiser" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {hasBusinessInfo ? '정보 변경' : '정보 제출'}
            </Link>
          </Button>
        </div>

        {profileLoading ? (
          <div className="text-center py-8 text-slate-500">로딩 중...</div>
        ) : !hasBusinessInfo ? (
          <EmptyState
            title="사업장 정보가 등록되지 않았습니다"
            description="체험단을 등록하려면 먼저 사업장 정보를 제출해주세요."
            action={
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/dashboard/advertiser" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  사업장 정보 제출하기
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-white p-2 border border-slate-200">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-slate-700">업체명: </span>
                    <span className="text-slate-900">{profileData.profile.companyName}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-slate-700">카테고리: </span>
                    <span className="text-slate-900">{profileData.profile.category}</span>
                  </div>
                  {profileData.profile.location && (
                    <div className="text-sm">
                      <span className="font-medium text-slate-700">위치: </span>
                      <span className="text-slate-900">{profileData.profile.location}</span>
                    </div>
                  )}
                  {profileData.profile.businessNumber && (
                    <div className="text-sm">
                      <span className="font-medium text-slate-700">사업자등록번호: </span>
                      <span className="text-slate-900">{profileData.profile.businessNumber}</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge className="bg-emerald-500 text-white">등록완료</Badge>
            </div>
          </div>
        )}
      </div>

      {/* 내 체험단 목록 */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">내 체험단</h2>
            <p className="text-sm text-slate-500 mt-1">등록한 체험단 현황</p>
          </div>
          <Link
            href="/dashboard/my-campaigns"
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            전체 보기
          </Link>
        </div>

        {campaignsLoading ? (
          <div className="text-center py-8 text-slate-500">로딩 중...</div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            title="등록한 체험단이 없습니다"
            description="체험단을 등록하고 인플루언서들의 지원을 받아보세요!"
            action={
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/dashboard/my-campaigns">체험단 등록하기</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {/* 모집중 */}
            {recruitingCampaigns.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-semibold text-slate-900">모집중 ({recruitingCampaigns.length})</h3>
                </div>
                <div className="space-y-2">
                  {recruitingCampaigns.slice(0, 3).map((campaign) => (
                    <Link
                      key={campaign.id}
                      href={`/campaigns/${campaign.id}/manage`}
                      className="block rounded-lg border border-emerald-200 bg-emerald-50 p-4 hover:bg-emerald-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{campaign.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            모집 마감: {campaign.recruitmentEnd}
                          </p>
                          {campaign._count?.applications !== undefined && (
                            <p className="text-xs text-slate-500 mt-1">
                              지원자: {campaign._count.applications}명
                            </p>
                          )}
                        </div>
                        <Badge className="bg-emerald-500 text-white">모집중</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 모집완료 */}
            {completedCampaigns.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-slate-600" />
                  <h3 className="font-semibold text-slate-900">모집완료 ({completedCampaigns.length})</h3>
                </div>
                <div className="space-y-2">
                  {completedCampaigns.slice(0, 3).map((campaign) => (
                    <Link
                      key={campaign.id}
                      href={`/campaigns/${campaign.id}/manage`}
                      className="block rounded-lg border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{campaign.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            모집 종료: {campaign.recruitmentEnd}
                          </p>
                          {campaign._count?.applications !== undefined && (
                            <p className="text-xs text-slate-500 mt-1">
                              지원자: {campaign._count.applications}명
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">완료</Badge>
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
