"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase, NotebookPen } from "lucide-react";
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
  const role = (user?.appMetadata?.role as string | undefined) ?? "unknown";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">대시보드</h1>
        <p className="text-slate-500">
          {user?.email ?? "알 수 없는 사용자"} 님, 환영합니다.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <Image
          alt="대시보드"
          src="https://picsum.photos/seed/dashboard/1200/480"
          width={1200}
          height={480}
          className="h-auto w-full object-cover"
        />
      </div>

      <DashboardGrid>
        <DashboardCard
          title="현재 세션"
          description="Supabase 미들웨어가 세션 쿠키를 자동으로 동기화합니다."
        >
          <ul className="space-y-2 text-sm text-slate-500">
            <li>• 로그인 세션은 서버와 클라이언트 모두에서 안전하게 유지됩니다.</li>
            <li>• 보호된 페이지 접근 시 자동으로 검증이 수행됩니다.</li>
          </ul>
        </DashboardCard>

        <DashboardCard
          title="보안 체크"
          description="App Router 기반 보호 구역으로 인증이 필요합니다."
        >
          <ul className="space-y-2 text-sm text-slate-500">
            <li>• 민감한 데이터는 서버 컴포넌트에서만 조회합니다.</li>
            <li>• Hono + Supabase 조합으로 모든 API가 보호됩니다.</li>
          </ul>
        </DashboardCard>
      </DashboardGrid>

      {role === "advertiser" && (
        <DashboardCard
          title="광고주 온보딩"
          description="체험단을 등록하려면 광고주 정보를 제출해야 합니다."
          action={
            <Link
              href="/dashboard/advertiser"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline"
            >
              정보 등록하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="rounded-full bg-indigo-100 p-3 text-indigo-600">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <p>사업자 정보, 카테고리, 위치 등 필수 정보를 제출해주세요.</p>
              <p>검증이 완료되면 체험단을 등록하고 지원자를 관리할 수 있습니다.</p>
            </div>
          </div>
        </DashboardCard>
      )}

      {role === "influencer" && (
        <DashboardCard
          title="인플루언서 온보딩"
          description="프로필을 완료하고 체험단에 지원해보세요."
          action={
            <Link
              href="/influencer/profile"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline"
            >
              프로필 등록하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
              <NotebookPen className="h-6 w-6" />
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <p>생년월일과 SNS 채널을 등록하고 검증을 완료해주세요.</p>
              <p>검증된 채널이 있어야 체험단 지원이 가능합니다.</p>
            </div>
          </div>
        </DashboardCard>
      )}

      {role !== "advertiser" && role !== "influencer" && (
        <EmptyState
          title="역할 정보가 필요합니다"
          description="회원가입 시 선택한 역할이 확인되지 않습니다. 다시 로그인해주세요."
          action={
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline"
            >
              로그인 페이지로 이동
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      )}
    </div>
  );
}
