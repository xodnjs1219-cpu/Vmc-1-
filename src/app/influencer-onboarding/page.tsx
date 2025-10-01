'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

export default function InfluencerOnboardingPage() {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/influencer/profile');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">인플루언서 온보딩</h1>
            <p className="text-sm text-slate-500">
              인플루언서 정보를 등록하려면 먼저 로그인이 필요합니다.
            </p>
          </div>
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              홈으로 돌아가기
            </Link>
          </Button>
        </header>

        <EmptyState
          title="로그인이 필요합니다"
          description="인플루언서 정보를 등록하려면 먼저 로그인해주세요. 계정이 없다면 회원가입을 진행해주세요."
          action={
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  로그인하기
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signup">회원가입하기</Link>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return null;
}