'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { ApplicantResponse } from '@/features/campaigns/lib/dto';
import { Instagram, Youtube } from 'lucide-react';

const STATUS_MAP = {
  pending: { label: '신청완료', color: 'bg-slate-100 text-slate-700' },
  selected: { label: '선정', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: '반려', color: 'bg-red-100 text-red-700' },
} as const;

const MAX_MESSAGE_LENGTH = 50;

type ApplicantRowProps = {
  applicant: ApplicantResponse;
  isSelectable: boolean;
  isSelected: boolean;
  onSelectChange: (id: string, checked: boolean) => void;
};

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'naver':
      return <span className="text-base">📝</span>;
    case 'youtube':
      return <Youtube className="h-4 w-4 text-red-600" />;
    case 'instagram':
      return <Instagram className="h-4 w-4 text-pink-600" />;
    case 'threads':
      return <span className="text-base">🧵</span>;
    default:
      return <span className="text-base">📱</span>;
  }
};

export const ApplicantRow = ({
  applicant,
  isSelectable,
  isSelected,
  onSelectChange,
}: ApplicantRowProps) => {
  const status = STATUS_MAP[applicant.status];
  const primaryChannel = applicant.channels[0];
  const additionalChannelsCount = applicant.channels.length - 1;

  const truncatedMessage =
    applicant.message.length > MAX_MESSAGE_LENGTH
      ? `${applicant.message.substring(0, MAX_MESSAGE_LENGTH)}...`
      : applicant.message;

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      {isSelectable && (
        <td className="px-4 py-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              onSelectChange(applicant.id, checked as boolean)
            }
          />
        </td>
      )}
      <td className="px-4 py-3 font-medium text-slate-900">{applicant.userName}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{applicant.userEmail}</td>
      <td className="px-4 py-3">
        {primaryChannel ? (
          <div className="flex items-center gap-2">
            {getPlatformIcon(primaryChannel.platform)}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">
                {primaryChannel.name}
              </span>
              {additionalChannelsCount > 0 && (
                <span className="text-xs text-slate-500">
                  외 {additionalChannelsCount}개
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-sm text-slate-400">채널 없음</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {format(new Date(applicant.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 max-w-xs">
        <span className="line-clamp-2">{truncatedMessage}</span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {format(new Date(applicant.visitDate), 'yyyy.MM.dd', { locale: ko })}
      </td>
      <td className="px-4 py-3">
        <Badge className={status.color}>{status.label}</Badge>
      </td>
    </tr>
  );
};
