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
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="grid w-full gap-12 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center">
          <SignupForm />
          <p className="mt-6 text-sm text-slate-500">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="font-medium text-slate-700 underline hover:text-slate-900"
            >
              로그인으로 이동
            </Link>
          </p>
        </div>
        <figure className="hidden overflow-hidden rounded-xl border border-slate-200 md:block">
          <Image
            src="https://picsum.photos/seed/signup/800/800"
            alt="회원가입"
            width={800}
            height={800}
            className="h-full w-full object-cover"
            priority
          />
        </figure>
      </div>
    </div>
  );
}
