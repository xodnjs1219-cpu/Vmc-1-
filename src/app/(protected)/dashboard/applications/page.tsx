"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { ApplicationList } from "@/features/applications/components/application-list";

type ApplicationsPageProps = {
  params: Promise<Record<string, never>>;
};

export default function ApplicationsPage({ params }: ApplicationsPageProps) {
  void params;
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 배너 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500">
        <div className="absolute inset-0">
          <Image
            alt="지원 목록 배경"
            src="https://picsum.photos/seed/applications/1920/400"
            fill
            className="object-cover opacity-10"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            나의 프로필로 돌아가기
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-6 w-6 text-white" />
            <span className="text-sm font-semibold text-white/90">Applications</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            내 지원 목록
          </h1>
          <p className="text-lg text-white/90">
            지원한 체험단의 현황을 확인하고 관리하세요
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <ApplicationList />
      </div>
    </div>
  );
}
