"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Megaphone, ArrowRight, LogOut } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export default function Home() {
  const { user, isAuthenticated, isLoading, refresh } = useCurrentUser();
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
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
          >
            대시보드
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
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
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
        >
          회원가입
        </Link>
      </div>
    );
  }, [handleSignOut, isAuthenticated, isLoading, user]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">블로그 체험단</h1>
          {authActions}
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center text-white">
        <h2 className="text-5xl font-bold tracking-tight md:text-6xl">
          블로그 체험단 모집
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 md:text-xl">
          브랜드와 인플루언서를 연결하는 가장 쉬운 방법
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/influencer-onboarding"
            className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-lg font-semibold text-indigo-600 transition hover:bg-slate-100"
          >
            인플루언서 시작하기
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/advertiser-onboarding"
            className="flex items-center gap-2 rounded-lg border-2 border-white px-6 py-3 text-lg font-semibold text-white transition hover:bg-white/10"
          >
            광고주 시작하기
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-white">인플루언서</h3>
            <p className="mt-3 text-white/80">
              다양한 캠페인에 지원하고 제품을 체험하며 수익을 창출하세요
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
              <Megaphone className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-white">광고주</h3>
            <p className="mt-3 text-white/80">
              효과적인 인플루언서 마케팅으로 브랜드를 성장시키세요
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
