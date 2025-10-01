'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Users, Gift, Settings } from 'lucide-react';
import type { CampaignResponse } from '@/features/campaigns/lib/dto';

const STATUS_CONFIG = {
  recruiting: { label: '모집중', color: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm' },
  closed: { label: '모집종료', color: 'bg-amber-500 text-white shadow-sm' },
  completed: { label: '선정완료', color: 'bg-indigo-500 text-white shadow-sm' },
} as const;

interface MyCampaignCardProps {
  campaign: CampaignResponse;
}

export const MyCampaignCard = ({ campaign }: MyCampaignCardProps) => {
  const statusConfig = STATUS_CONFIG[campaign.status];
  const applicantsCount = campaign.applicantsCount ?? 0;

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200">
      {/* 썸네일 이미지 */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
        <Image
          src={`https://picsum.photos/seed/${campaign.id}/800/400`}
          alt={campaign.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3">
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-slate-900 line-clamp-2 leading-tight">
          {campaign.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-slate-700">모집기간</span>
              <p className="text-xs mt-0.5">
                {campaign.recruitmentStart} ~ {campaign.recruitmentEnd}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-4 w-4 text-indigo-600 flex-shrink-0" />
            <span>
              <span className="font-medium text-emerald-600">{applicantsCount}명</span> 지원 /{' '}
              <span className="font-medium text-slate-700">{campaign.maxParticipants}명</span> 모집
            </span>
          </div>

          <div className="flex items-start gap-2 text-sm text-slate-600">
            <Gift className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium text-slate-700 block mb-1">제공혜택</span>
              <p className="text-xs line-clamp-2 text-slate-600 leading-relaxed">
                {campaign.benefits}
              </p>
            </div>
          </div>
        </div>

        <Link href={`/campaigns/${campaign.id}/manage`} className="block">
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all duration-200 group-hover:shadow-md"
          >
            <Settings className="h-4 w-4 mr-2" />
            관리하기
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
