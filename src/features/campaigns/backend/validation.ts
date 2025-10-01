import { isDateRangeValid, getTodayString } from '@/lib/validation/date';

export const validateRecruitmentPeriod = (
  startDate: string,
  endDate: string,
): boolean => {
  if (!isDateRangeValid(startDate, endDate)) {
    return false;
  }

  const today = getTodayString();
  return endDate >= today;
};

export const isRecruitmentActive = (
  startDate: string,
  endDate: string,
): boolean => {
  const today = getTodayString();
  const result = startDate <= today && today <= endDate;
  console.log('[isRecruitmentActive]', {
    today,
    startDate,
    endDate,
    result,
    comparison: {
      startDateOk: startDate <= today,
      endDateOk: today <= endDate,
    },
  });
  return result;
};