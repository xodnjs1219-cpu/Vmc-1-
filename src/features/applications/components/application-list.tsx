'use client';

import { useState } from 'react';
import { useApplicationsQuery } from '@/features/applications/hooks/useApplicationsQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Calendar, Clock, MessageSquare, FileText, ArrowRight, Loader2 } from 'lucide-react';

export const ApplicationList = () => {
  const [status, setStatus] = useState<'pending' | 'selected' | 'rejected' | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useApplicationsQuery({
    status,
    page,
    limit: 20,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
            대기중
          </Badge>
        );
      case 'selected':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
            선정
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="border-slate-300 text-slate-600">
            미선정
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500">지원 내역을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center max-w-md">
          <p className="text-red-700 font-medium mb-2">오류가 발생했습니다</p>
          <p className="text-sm text-red-600">
            {error instanceof Error ? error.message : '알 수 없는 오류입니다'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 & 필터 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">내 지원 목록</h2>
          <p className="text-sm text-slate-500 mt-1">
            총 {data?.totalCount || 0}개의 지원 내역
          </p>
        </div>
        <Select
          value={status || 'all'}
          onValueChange={(value) => setStatus(value === 'all' ? undefined : (value as any))}
        >
          <SelectTrigger className="w-full sm:w-[180px] border-slate-300">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="pending">대기중</SelectItem>
            <SelectItem value="selected">선정</SelectItem>
            <SelectItem value="rejected">미선정</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 지원 목록 */}
      {data?.applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-900 mb-2">지원 내역이 없습니다</p>
          <p className="text-sm text-slate-500 mb-6">
            관심 있는 체험단에 지원해보세요
          </p>
          <Link href="/campaigns">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              체험단 둘러보기
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.applications.map((application) => (
            <Card key={application.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-3">
                  <CardTitle className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {application.campaign.title}
                  </CardTitle>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                    <span className="font-medium text-slate-700">지원일:</span>
                    <span>{new Date(application.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                    <span className="font-medium text-slate-700">방문 예정일:</span>
                    <span>{application.visitDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-pink-600 flex-shrink-0" />
                    <span className="font-medium text-slate-700">모집 종료일:</span>
                    <span>{application.campaign.recruitmentEnd}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-slate-700">각오 한마디</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {application.message}
                  </p>
                </div>

                <Link href={`/campaigns/${application.campaignId}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 group/button"
                  >
                    체험단 상세보기
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover/button:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 bg-white rounded-2xl border border-slate-200 p-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-slate-300"
          >
            이전
          </Button>
          <span className="px-6 py-2 text-sm font-medium text-slate-700">
            {page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="border-slate-300"
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
};