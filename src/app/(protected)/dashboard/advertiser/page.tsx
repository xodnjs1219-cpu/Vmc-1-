'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Loader2, ArrowLeft } from 'lucide-react';
import { AdvertiserProfileForm } from '@/features/advertiser/components/profile-form';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function AdvertiserProfilePage() {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const router = useRouter();

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
      <div className="container mx-auto py-16 px-4 max-w-3xl">
        <EmptyState
          title="로그인이 필요합니다"
          description="광고주 프로필을 등록하려면 먼저 로그인해주세요."
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          대시보드로 돌아가기
        </Link>
      </div>
      <AdvertiserProfileForm />
    </div>
  );
}
