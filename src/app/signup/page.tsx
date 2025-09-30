'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { SignupForm } from '@/features/auth/components/signup-form';

type SignupPageProps = {
  params: Promise<Record<string, never>>;
};

export default function SignupPage({ params }: SignupPageProps) {
  void params;
  const router = useRouter();
  const { isAuthenticated } = useCurrentUser();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <div className="flex w-full max-w-5xl flex-col gap-12 md:flex-row md:items-center md:justify-between">
        <section className="max-w-xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            체험단 플랫폼에 합류하세요
          </h1>
          <p className="text-lg text-slate-600">
            광고주와 인플루언서를 연결하는 통합 솔루션입니다. 회원가입 후 역할에 맞는
            온보딩을 진행하세요.
          </p>
          <ul className="space-y-3 text-sm text-slate-500">
            <li>• 광고주: 체험단을 등록하고 지원자를 관리하세요</li>
            <li>• 인플루언서: 다양한 캠페인에 지원하고 활동 내역을 관리하세요</li>
            <li>• Supabase Auth 기반으로 안전하게 관리됩니다</li>
          </ul>
        </section>
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
