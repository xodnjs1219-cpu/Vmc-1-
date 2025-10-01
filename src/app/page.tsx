"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Megaphone, ArrowRight, LogOut, Sparkles, TrendingUp } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useUserRole } from "@/features/auth/hooks/useUserRole";
import { CampaignList } from "@/features/campaigns/components/campaign-list";

export default function Home() {
  const { user, isAuthenticated, isLoading, refresh } = useCurrentUser();
  const { role, isAdvertiser, isInfluencer } = useUserRole();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await refresh();
    router.replace("/");
  }, [refresh, router]);

  const authActions = useMemo(() => {
    if (isLoading) {
      return null;
    }

    if (isAuthenticated && user) {
      return (
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            나의 프로필
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
        >
          회원가입
        </Link>
      </div>
    );
  }, [handleSignOut, isAuthenticated, isLoading, user]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-white" />
              <h1 className="text-xl font-bold text-white">review-ad</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/campaigns"
                className="text-sm font-medium text-white/90 transition hover:text-white"
              >
                체험단 둘러보기
              </Link>
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-white/90 transition hover:text-white"
                >
                  나의 프로필
                </Link>
              )}
            </nav>
            {authActions}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center text-white">
        {isInfluencer ? (
          <>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-medium backdrop-blur-sm mb-6">
              <Users className="h-4 w-4" />
              <span>인플루언서 회원</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              다양한 체험단에
              <br />
              <span className="bg-gradient-to-r from-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                지원하고 활동하세요
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-white/90">
              원하는 브랜드의 제품을 체험하고 콘텐츠를 제작해보세요
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/campaigns"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-emerald-600 shadow-lg transition hover:bg-slate-50 hover:scale-105"
              >
                체험단 둘러보기
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard/applications"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/20 hover:scale-105"
              >
                내 지원 현황
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </>
        ) : isAdvertiser ? (
          <>
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/20 px-4 py-2 text-sm font-medium backdrop-blur-sm mb-6">
              <Megaphone className="h-4 w-4" />
              <span>광고주 회원</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              체험단을 모집하고
              <br />
              <span className="bg-gradient-to-r from-pink-200 to-orange-200 bg-clip-text text-transparent">
                인플루언서를 찾으세요
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-white/90">
              효과적인 마케팅으로 브랜드를 성장시키세요
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard/my-campaigns"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-pink-600 shadow-lg transition hover:bg-slate-50 hover:scale-105"
              >
                내 캠페인 관리
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm mb-6">
              <TrendingUp className="h-4 w-4" />
              <span>체험단 매칭 플랫폼</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              브랜드와 인플루언서를
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                연결하는 가장 쉬운 방법
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-white/90">
              체험단 모집부터 선정까지, 모든 과정을 한 곳에서 간편하게 관리하세요
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/influencer-onboarding"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-indigo-600 shadow-lg transition hover:bg-slate-50 hover:scale-105"
              >
                인플루언서 시작하기
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/advertiser-onboarding"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/20 hover:scale-105"
              >
                광고주 시작하기
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Campaign List Section */}
      <section className="bg-slate-50 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              {isAdvertiser ? "다른 광고주의 체험단" : "모집 중인 체험단"}
            </h3>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              {isAdvertiser
                ? "다양한 브랜드의 캠페인을 참고하고 영감을 얻으세요"
                : "다양한 브랜드의 체험단에 지원하고 특별한 혜택을 경험해보세요"}
            </p>
          </div>
          <CampaignList />
          <div className="mt-12 text-center">
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-indigo-700"
            >
              모든 체험단 보기
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features - 비로그인 사용자에게만 표시 */}
      {!isAuthenticated && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="group rounded-3xl bg-white/10 p-8 md:p-10 backdrop-blur-sm border border-white/10 transition hover:bg-white/15 hover:scale-105">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 ring-4 ring-white/20">
                <Users className="h-7 w-7 text-emerald-200" />
              </div>
              <h3 className="mt-8 text-2xl md:text-3xl font-bold text-white">인플루언서</h3>
              <p className="mt-4 text-base text-white/90 leading-relaxed">
                다양한 체험단에 지원하고 제품을 체험하며 수익을 창출하세요.
                블로그, 유튜브, 인스타그램 등 다양한 채널에서 활동할 수 있습니다.
              </p>
              <Link
                href="/influencer-onboarding"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition hover:gap-3"
              >
                자세히 알아보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="group rounded-3xl bg-white/10 p-8 md:p-10 backdrop-blur-sm border border-white/10 transition hover:bg-white/15 hover:scale-105">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/20 ring-4 ring-white/20">
                <Megaphone className="h-7 w-7 text-pink-200" />
              </div>
              <h3 className="mt-8 text-2xl md:text-3xl font-bold text-white">광고주</h3>
              <p className="mt-4 text-base text-white/90 leading-relaxed">
                효과적인 인플루언서 마케팅으로 브랜드를 성장시키세요.
                체험단 등록부터 지원자 관리까지 모든 과정을 간편하게 진행할 수 있습니다.
              </p>
              <Link
                href="/advertiser-onboarding"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-pink-200 transition hover:gap-3"
              >
                자세히 알아보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-sm py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-white" />
              <span className="text-sm font-semibold text-white">review-ad</span>
            </div>
            <p className="text-sm text-white/70">
              © 2025 review-ad. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
