'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function AdvertiserOnboardingPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">광고주 온보딩</h1>
          <p className="text-sm text-slate-500">
            체험단을 등록하기 전에 광고주 정보를 등록해주세요.
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
        title="광고주 정보 등록"
        description="사업자 정보와 업체 정보를 입력하여 승인 절차를 진행해주세요."
        action={
          <Button asChild>
            <Link href="/dashboard">대시보드에서 광고주 정보 등록하기</Link>
          </Button>
        }
      />
    </div>
  );
}