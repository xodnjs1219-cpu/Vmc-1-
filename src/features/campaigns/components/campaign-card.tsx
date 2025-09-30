'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { CampaignResponse } from '@/features/campaigns/lib/dto';

interface CampaignCardProps {
  campaign: CampaignResponse;
}

export const CampaignCard = ({ campaign }: CampaignCardProps) => {
  const getStatusBadge = () => {
    switch (campaign.status) {
      case 'recruiting':
        return <Badge variant="default">모집중</Badge>;
      case 'closed':
        return <Badge variant="secondary">모집종료</Badge>;
      case 'completed':
        return <Badge variant="outline">선정완료</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{campaign.title}</CardTitle>
          {getStatusBadge()}
        </div>
        {campaign.advertiser && (
          <div className="text-sm text-muted-foreground">
            <p>{campaign.advertiser.companyName}</p>
            <p>
              {campaign.advertiser.category} · {campaign.advertiser.location}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-semibold">모집기간:</span>{' '}
            {campaign.recruitmentStart} ~ {campaign.recruitmentEnd}
          </p>
          <p className="text-sm">
            <span className="font-semibold">모집인원:</span> {campaign.maxParticipants}명
          </p>
          <p className="text-sm line-clamp-2">
            <span className="font-semibold">혜택:</span> {campaign.benefits}
          </p>
        </div>
        <Link href={`/campaigns/${campaign.id}`}>
          <Button className="w-full">자세히 보기</Button>
        </Link>
      </CardContent>
    </Card>
  );
};