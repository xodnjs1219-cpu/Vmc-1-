import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/remote/api-client";
import {
  CampaignDetailResponseSchema,
  type CampaignDetailResponse,
} from "@/features/campaigns/lib/dto";
import { ApplicationForm } from "@/features/applications/components/application-form";

const fetchCampaignDetail = async (campaignId: string): Promise<CampaignDetailResponse> => {
  try {
    const { data } = await apiClient.get<CampaignDetailResponse>(`/campaigns/${campaignId}`);
    return CampaignDetailResponseSchema.parse(data);
  } catch {
    notFound();
  }
};

export default async function CampaignDetailPage({ 
  params 
}: { 
  params: Promise<{ campaignId: string }> 
}) {
  const { campaignId } = await params;
  const detail = await fetchCampaignDetail(campaignId);
  const { campaign, canApply, hasApplied, applicationStatus } = detail;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-indigo-600">Campaign</p>
          <h1 className="text-4xl font-bold text-slate-900">{campaign.title}</h1>
          <div className="text-sm text-slate-500">
            <p>
              모집 기간: {campaign.recruitmentStart} ~ {campaign.recruitmentEnd}
            </p>
            <p>모집 인원: {campaign.maxParticipants}명</p>
          </div>
        </div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로 돌아가기
        </Link>
      </header>

      <section className="grid gap-10 md:grid-cols-[2fr_1fr]">
        <article className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">제공 혜택</h2>
            <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              {campaign.benefits}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">미션</h2>
            <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              {campaign.mission}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">매장 정보</h2>
            <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              {campaign.storeInfo}
            </p>
            {campaign.advertiser && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-700">{campaign.advertiser.companyName}</p>
                <p>{campaign.advertiser.category}</p>
                <p>{campaign.advertiser.location}</p>
              </div>
            )}
          </section>
        </article>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">지원 현황</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>현재 상태: {canApply ? '지원 가능' : '지원 불가'}</p>
              {hasApplied && <p>지원 상태: {applicationStatus ?? '신청완료'}</p>}
            </div>
          </div>

          {canApply ? (
            <ApplicationForm
              campaignId={campaign.id}
              onSuccess={() => {
                // TODO: 지원 완료 후 상태 갱신 로직 추가
              }}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              <p>체험단 지원 조건을 충족하면 지원하기 버튼이 활성화됩니다.</p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
