import { isValidDateString, isDateInRange } from '@/lib/validation/date';

export const validateVisitDate = (
  visitDate: string,
  recruitmentEnd: string,
): boolean => {
  if (!isValidDateString(visitDate)) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const visit = new Date(visitDate);
  const end = new Date(recruitmentEnd);

  return visit > end && visit >= today;
};