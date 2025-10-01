'use client';
import Link from 'next/link';
import { ArrowLeft, LogIn, Loader2, Sparkles } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CampaignCreateDialog } from '@/features/campaigns/components/campaign-create-dialog';
import { MyCampaignList } from '@/features/campaigns/components/my-campaign-list';

export default function MyCampaignsPage() {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const role = ((user?.userMetadata?.role || user?.appMetadata?.role) as string | undefined) ?? "unknown";

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
          description="체험단을 관리하려면 먼저 로그인해주세요."
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

  if (role !== "advertiser") {
    return (
      <div className="container mx-auto py-16 px-4 max-w-3xl">
        <EmptyState
          title="광고주 전용 페이지입니다"
          description="이 페이지는 광고주만 접근할 수 있습니다."
          action={
            <Button asChild>
              <Link href="/dashboard">대시보드로 돌아가기</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 배너 */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            대시보드로 돌아가기
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-yellow-300" />
            <span className="text-sm font-semibold text-white/90">My Campaigns</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                내 체험단 관리
              </h1>
              <p className="text-lg text-white/90 max-w-2xl">
                등록한 체험단을 관리하고 지원자를 확인하세요
              </p>
            </div>
            <CampaignCreateDialog />
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2">📋 관리 안내</h2>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• <strong>신규 체험단 등록</strong>: 우측 상단의 "신규 체험단 등록" 버튼을 클릭하세요</li>
              <li>• <strong>지원자 확인</strong>: 각 체험단 카드를 클릭하여 지원자 목록을 확인할 수 있습니다</li>
              <li>• <strong>모집 관리</strong>: 모집 중인 체험단은 언제든지 모집 종료할 수 있습니다</li>
            </ul>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-2xl font-bold text-slate-900">등록한 체험단</h3>
          <p className="text-sm text-slate-500 mt-1">
            내가 등록한 체험단 목록입니다.
          </p>
        </div>
        <MyCampaignList />
      </div>
    </div>
  );
}
