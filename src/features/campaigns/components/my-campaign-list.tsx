'use client';

import { useAdvertiserCampaignsQuery } from '@/features/campaigns/hooks/useCampaignsQuery';
import { MyCampaignCard } from './my-campaign-card';
import { Loader2 } from 'lucide-react';

export const MyCampaignList = () => {
  const { data, isLoading, error } = useAdvertiserCampaignsQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500">체험단 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 max-w-md">
          <p className="text-red-600 font-semibold mb-2">오류가 발생했습니다</p>
          <p className="text-sm text-red-500">
            {error instanceof Error ? error.message : '체험단 목록을 불러오는데 실패했습니다'}
          </p>
        </div>
      </div>
    );
  }

  if (!data?.campaigns || data.campaigns.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center py-12">
          <div className="rounded-full bg-slate-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            등록한 체험단이 없습니다
          </h3>
          <p className="text-sm text-slate-500">
            우측 상단의 &quot;신규 체험단 등록&quot; 버튼을 클릭하여 체험단을 등록해보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500">
            총 <span className="font-semibold text-indigo-600">{data.campaigns.length}</span>개의 체험단
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.campaigns.map((campaign) => (
          <MyCampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
};
