import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Users, Gift, MapPin, Building2, CheckCircle2, Target } from "lucide-react";
import {
  CampaignDetailResponseSchema,
  type CampaignDetailResponse,
} from "@/features/campaigns/lib/dto";
import { ApplicationForm } from "@/features/applications/components/application-form";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getCampaignDetail } from "@/features/campaigns/backend/service";

const fetchCampaignDetail = async (campaignId: string): Promise<CampaignDetailResponse> => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await getCampaignDetail(supabase, campaignId, user?.id);

  if (!result.ok) {
    console.error('[CampaignDetailPage] Failed to fetch campaign:', {
      campaignId,
      error: result.error,
    });
    notFound();
  }

  return result.data;
};

export default async function CampaignDetailPage({
  params
}: {
  params: Promise<{ campaignId: string }>
}) {
  const { campaignId } = await params;
  const detail = await fetchCampaignDetail(campaignId);
  const { campaign, canApply, hasApplied, applicationStatus } = detail;

  console.log('[CampaignDetailPage] Render data:', {
    campaignId: campaign.id,
    canApply,
    hasApplied,
    applicationStatus,
  });

  const getStatusBadge = () => {
    switch (campaign.status) {
      case 'recruiting':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5">
            모집중
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="secondary" className="bg-slate-200 text-slate-700 px-4 py-1.5">
            모집종료
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="border-indigo-300 text-indigo-700 px-4 py-1.5">
            선정완료
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 배너 이미지 */}
      <div className="relative h-80 w-full overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <Image
          src={`https://picsum.photos/seed/${campaign.id}/1920/600`}
          alt={campaign.title}
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />

        {/* 브레드크럼 & 뒤로가기 */}
        <div className="absolute top-6 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              목록으로 돌아가기
            </Link>
          </div>
        </div>

        {/* 타이틀 영역 */}
        <div className="absolute bottom-0 left-0 right-0 pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                {getStatusBadge()}
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  {campaign.title}
                </h1>
                {campaign.advertiser && (
                  <div className="flex flex-wrap gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm font-medium">{campaign.advertiser.companyName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">
                        {campaign.advertiser.category} · {campaign.advertiser.location}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* 왼쪽 콘텐츠 */}
          <div className="space-y-6">
            {/* 핵심 정보 카드 */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">체험단 정보</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">모집기간</p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {campaign.recruitmentStart}
                    </p>
                    <p className="text-xs text-slate-600">~ {campaign.recruitmentEnd}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">모집인원</p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {campaign.maxParticipants}명
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 제공 혜택 */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="h-5 w-5 text-pink-600" />
                <h2 className="text-lg font-bold text-slate-900">제공 혜택</h2>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 p-5">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {campaign.benefits}
                </p>
              </div>
            </div>

            {/* 미션 */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">미션</h2>
              </div>
              <div className="rounded-xl bg-indigo-50 p-5">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {campaign.mission}
                </p>
              </div>
            </div>

            {/* 매장 정보 */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">매장 정보</h2>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {campaign.storeInfo}
                  </p>
                </div>
                {campaign.advertiser && (
                  <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/50 p-5">
                    <p className="text-base font-bold text-slate-900 mb-2">
                      {campaign.advertiser.companyName}
                    </p>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>카테고리: {campaign.advertiser.category}</p>
                      <p>위치: {campaign.advertiser.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽 사이드바 */}
          <aside className="space-y-6">
            {/* 지원 현황 */}
            <div className="sticky top-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">지원 현황</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className={`h-5 w-5 mt-0.5 ${
                        canApply ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {canApply ? '지원 가능' : '지원 불가'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {canApply
                          ? '아래 양식을 작성하여 체험단에 지원하세요'
                          : '조건을 충족하지 못했습니다'}
                      </p>
                    </div>
                  </div>
                  {hasApplied && (
                    <div className="rounded-lg bg-indigo-50 p-3 mt-3">
                      <p className="text-xs font-medium text-indigo-900 mb-1">지원 상태</p>
                      <p className="text-sm font-bold text-indigo-700">
                        {applicationStatus ?? '신청완료'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 지원 폼 또는 안내 메시지 */}
              {canApply ? (
                <ApplicationForm campaignId={campaign.id} />
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <div className="text-center text-sm text-slate-600 space-y-2">
                    <p className="font-medium">체험단 지원 조건</p>
                    <ul className="text-xs space-y-1 text-left">
                      <li>✓ 로그인이 필요합니다</li>
                      <li>✓ 인플루언서 프로필 등록이 필요합니다</li>
                      <li>✓ SNS 채널 인증이 필요합니다</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
