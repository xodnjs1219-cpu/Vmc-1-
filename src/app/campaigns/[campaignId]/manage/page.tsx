'use client';

import React from 'react';
import { CampaignDetailAdvertiser } from '@/features/campaigns/components/campaign-detail-advertiser';

type CampaignManagePageProps = {
  params: Promise<{ campaignId: string }>;
};

export default function CampaignManagePage({ params }: CampaignManagePageProps) {
  const unwrappedParams = React.use(params);
  return <CampaignDetailAdvertiser campaignId={unwrappedParams.campaignId} />;
}
