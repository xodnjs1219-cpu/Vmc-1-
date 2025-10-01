import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { CampaignList } from "@/features/campaigns/components/campaign-list";

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 배너 */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            홈으로 돌아가기
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-yellow-300" />
            <span className="text-sm font-semibold text-white/90">Campaigns</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            모집 중인 체험단
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            관심 있는 캠페인을 찾아 지원하세요. 필터와 정렬을 활용해 원하는 체험단을 빠르게 찾을 수 있습니다.
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <CampaignList />
      </div>
    </div>
  );
}
