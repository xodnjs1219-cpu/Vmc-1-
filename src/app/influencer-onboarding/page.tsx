'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function InfluencerOnboardingPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">인플루언서 온보딩</h1>
          <p className="text-sm text-slate-500">
            인플루언서 정보 등록 페이지로 이동해 프로필을 완료해주세요.
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
        title="온보딩 안내"
        description="인플루언서 정보 등록 페이지에서 생년월일과 SNS 채널 정보를 입력해주세요."
        action={
          <Button asChild>
            <Link href="/influencer/profile">인플루언서 정보 등록하러 가기</Link>
          </Button>
        }
      />
    </div>
  );
}