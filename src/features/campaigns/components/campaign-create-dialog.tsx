'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CampaignCreateForm } from '@/features/campaigns/components/campaign-create-form';

export const CampaignCreateDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          신규 체험단 등록
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>신규 체험단 등록</DialogTitle>
        </DialogHeader>
        <CampaignCreateForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
