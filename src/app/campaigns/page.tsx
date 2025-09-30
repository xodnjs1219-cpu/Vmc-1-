import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CampaignList } from "@/features/campaigns/components/campaign-list";

export default function CampaignsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">모집 중인 체험단</h1>
          <p className="text-sm text-slate-500">
            관심 있는 캠페인을 찾아 지원하세요. 필터와 정렬을 활용해 원하는 체험단을 빠르게 찾을 수 있습니다.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로 돌아가기
        </Link>
      </header>

      <CampaignList />
    </div>
  );
}
