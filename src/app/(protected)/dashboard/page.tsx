"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Home } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { EmptyState } from "@/components/ui/empty-state";
import { InfluencerDashboard } from "@/features/influencer/components/influencer-dashboard";
import { AdvertiserDashboard } from "@/features/advertiser/components/advertiser-dashboard";

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function DashboardPage({ params }: DashboardPageProps) {
  void params;
  const { user } = useCurrentUser();
  // role은 userMetadata 또는 appMetadata에 저장될 수 있음
  const role = ((user?.userMetadata?.role || user?.appMetadata?.role) as string | undefined) ?? "unknown";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 배너 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0">
          <Image
            alt="나의 프로필 배경"
            src="https://picsum.photos/seed/dashboard/1920/400"
            fill
            className="object-cover opacity-10"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-300" />
              <span className="text-sm font-semibold text-white/90">Dashboard</span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              <Home className="h-4 w-4" />
              홈으로
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            안녕하세요, {user?.email?.split('@')[0] ?? "사용자"}님!
          </h1>
          <p className="text-lg text-white/90">
            {role === "advertiser" && "체험단을 등록하고 효과적으로 관리하세요"}
            {role === "influencer" && "다양한 체험단에 지원하고 특별한 혜택을 경험하세요"}
            {role !== "advertiser" && role !== "influencer" && "환영합니다"}
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* 인플루언서 대시보드 */}
        {role === "influencer" && <InfluencerDashboard />}

        {/* 광고주 대시보드 */}
        {role === "advertiser" && <AdvertiserDashboard />}

        {role !== "advertiser" && role !== "influencer" && (
          <div className="mt-8">
            <EmptyState
              title="역할 정보가 필요합니다"
              description="회원가입 시 선택한 역할이 확인되지 않습니다. 다시 로그인해주세요."
              action={
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 transition-colors"
                >
                  로그인 페이지로 이동
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
