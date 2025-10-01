'use client';

import { useState } from 'react';
import { ApplicantRow } from './applicant-row';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import type { ApplicantResponse } from '@/features/campaigns/lib/dto';

type ApplicantTableProps = {
  applicants: ApplicantResponse[];
  campaignStatus: 'recruiting' | 'closed' | 'completed';
  maxParticipants: number;
  onSelect: (selectedIds: string[]) => void;
};

export const ApplicantTable = ({
  applicants,
  campaignStatus,
  maxParticipants,
  onSelect,
}: ApplicantTableProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isSelectable = campaignStatus === 'closed';
  const isCompleted = campaignStatus === 'completed';

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingApplicants = applicants
        .filter((a) => a.status === 'pending')
        .slice(0, maxParticipants);
      setSelectedIds(pendingApplicants.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectChange = (id: string, checked: boolean) => {
    if (checked) {
      if (selectedIds.length < maxParticipants) {
        setSelectedIds([...selectedIds, id]);
      }
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleConfirmSelection = () => {
    if (selectedIds.length === 0 || selectedIds.length > maxParticipants) {
      return;
    }
    onSelect(selectedIds);
  };

  const selectionCountExceeded =
    isSelectable && selectedIds.length > maxParticipants;

  const canConfirmSelection =
    isSelectable && selectedIds.length > 0 && selectedIds.length <= maxParticipants;

  if (applicants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-slate-100 w-16 h-16 flex items-center justify-center mb-4">
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          지원자가 없습니다
        </h3>
        <p className="text-sm text-slate-500">
          아직 이 체험단에 지원한 인플루언서가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isSelectable && (
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-900 mb-1">
                선정 안내
              </p>
              <p className="text-sm text-indigo-700">
                최대 모집 인원 <strong>{maxParticipants}명</strong> 이하로 선택해주세요.
                {selectedIds.length > 0 && (
                  <span className="ml-2">
                    현재 선택: <strong>{selectedIds.length}명</strong>
                  </span>
                )}
              </p>
              {selectionCountExceeded && (
                <p className="text-sm text-red-600 mt-2">
                  선정 인원이 최대 모집 인원({maxParticipants}명)을 초과했습니다.
                </p>
              )}
            </div>
            {canConfirmSelection && (
              <Button
                onClick={handleConfirmSelection}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                선정 확정 ({selectedIds.length}명)
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {isSelectable && (
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={
                        selectedIds.length > 0 &&
                        selectedIds.length === Math.min(applicants.filter(a => a.status === 'pending').length, maxParticipants)
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  이름
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  이메일
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  채널
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  지원일시
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  각오 한마디
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  방문 예정일
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((applicant) => (
                <ApplicantRow
                  key={applicant.id}
                  applicant={applicant}
                  isSelectable={isSelectable && applicant.status === 'pending'}
                  isSelected={selectedIds.includes(applicant.id)}
                  onSelectChange={handleSelectChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isCompleted && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-100 p-2">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-900">
                선정이 완료되었습니다
              </p>
              <p className="text-sm text-emerald-700">
                선정된 인플루언서에게 알림이 전송되었습니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
