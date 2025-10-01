"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase, NotebookPen, Sparkles, TrendingUp, Users, FileText, Home } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { DashboardGrid } from "@/components/ui/dashboard-grid";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";

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
            alt="대시보드 배경"
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
        {/* 빠른 액션 카드 */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Link
            href="/campaigns"
            className="group rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-indigo-100 p-3">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  체험단 둘러보기
                </h3>
                <p className="text-sm text-slate-500 mt-1">모집 중인 캠페인 확인</p>
              </div>
            </div>
          </Link>

          {role === "influencer" && (
            <Link
              href="/dashboard/applications"
              className="group rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-emerald-100 p-3">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    내 지원 목록
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">지원 현황 확인</p>
                </div>
              </div>
            </Link>
          )}

          {role === "advertiser" && (
            <Link
              href="/dashboard/my-campaigns"
              className="group rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-pink-100 p-3">
                  <Users className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-pink-600 transition-colors">
                    체험단 관리
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">내 체험단 확인 및 관리</p>
                </div>
              </div>
            </Link>
          )}

          <Link
            href={role === "advertiser" ? "/dashboard/advertiser" : "/influencer/profile"}
            className="group rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-purple-100 p-3">
                <NotebookPen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                  프로필 설정
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {role === "advertiser" ? "광고주 정보 관리" : "인플루언서 정보 관리"}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* 시스템 정보 */}
        <DashboardGrid>
          <DashboardCard
            title="현재 세션"
            description="Supabase 미들웨어가 세션 쿠키를 자동으로 동기화합니다."
          >
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">✓</span>
                <span>로그인 세션은 서버와 클라이언트 모두에서 안전하게 유지됩니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">✓</span>
                <span>보호된 페이지 접근 시 자동으로 검증이 수행됩니다.</span>
              </li>
            </ul>
          </DashboardCard>

          <DashboardCard
            title="보안 체크"
            description="App Router 기반 보호 구역으로 인증이 필요합니다."
          >
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">✓</span>
                <span>민감한 데이터는 서버 컴포넌트에서만 조회합니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">✓</span>
                <span>Hono + Supabase 조합으로 모든 API가 보호됩니다.</span>
              </li>
            </ul>
          </DashboardCard>
        </DashboardGrid>

        {/* 역할별 온보딩 안내 */}
        {role === "advertiser" && (
          <div className="mt-8">
            <DashboardCard
              title="광고주 온보딩"
              description="체험단을 등록하려면 광고주 정보를 제출해야 합니다."
              action={
                <Link
                  href="/dashboard/advertiser"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:gap-3 transition-all"
                >
                  정보 등록하기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            >
              <div className="flex items-start gap-4 rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
                <div className="rounded-2xl bg-indigo-600 p-4 text-white shadow-lg">
                  <Briefcase className="h-7 w-7" />
                </div>
                <div className="flex-1 space-y-2 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">필수 정보를 제출해주세요</p>
                  <ul className="space-y-1">
                    <li>• 사업자 정보, 카테고리, 위치 등 필수 정보 입력</li>
                    <li>• 검증 완료 후 체험단 등록 및 지원자 관리 가능</li>
                  </ul>
                </div>
              </div>
            </DashboardCard>
          </div>
        )}

        {role === "influencer" && (
          <div className="mt-8">
            <DashboardCard
              title="인플루언서 온보딩"
              description="프로필을 완료하고 체험단에 지원해보세요."
              action={
                <Link
                  href="/influencer/profile"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:gap-3 transition-all"
                >
                  프로필 등록하기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            >
              <div className="flex items-start gap-4 rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
                <div className="rounded-2xl bg-emerald-600 p-4 text-white shadow-lg">
                  <NotebookPen className="h-7 w-7" />
                </div>
                <div className="flex-1 space-y-2 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">프로필을 완성하세요</p>
                  <ul className="space-y-1">
                    <li>• 생년월일과 SNS 채널을 등록하고 검증 완료</li>
                    <li>• 검증된 채널이 있어야 체험단 지원 가능</li>
                  </ul>
                </div>
              </div>
            </DashboardCard>
          </div>
        )}

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
