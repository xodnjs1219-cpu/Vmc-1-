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
        return <Badge variant="secondary">대기중</Badge>;
      case 'selected':
        return <Badge variant="default">선정</Badge>;
      case 'rejected':
        return <Badge variant="outline">미선정</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-destructive">
          {error instanceof Error ? error.message : '오류가 발생했습니다'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">내 지원 목록</h2>
        <Select
          value={status || 'all'}
          onValueChange={(value) => setStatus(value === 'all' ? undefined : (value as any))}
        >
          <SelectTrigger className="w-[180px]">
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

      {data?.applications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          지원 내역이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {data?.applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {application.campaign.title}
                  </CardTitle>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">지원일:</span>{' '}
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">방문 예정일:</span>{' '}
                  {application.visitDate}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">모집 종료일:</span>{' '}
                  {application.campaign.recruitmentEnd}
                </p>
                <p className="text-sm line-clamp-2">
                  <span className="font-semibold">각오 한마디:</span>{' '}
                  {application.message}
                </p>
                <Link href={`/campaigns/${application.campaignId}`}>
                  <Button variant="outline" size="sm" className="mt-2">
                    체험단 상세보기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            이전
          </Button>
          <span className="px-4 py-2">
            {page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
};