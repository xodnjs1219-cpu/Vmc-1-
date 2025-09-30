import { validateBusinessNumber } from '@/lib/validation/business-number';

export const isValidBusinessNumber = (businessNumber: string): boolean => {
  return validateBusinessNumber(businessNumber);
};