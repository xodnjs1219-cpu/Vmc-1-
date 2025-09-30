import {
  calculateAge as calculateAgeUtil,
  isValidBirthDate,
} from '@/lib/validation/date';
import { validateChannelUrl as validateChannelUrlUtil } from '@/lib/validation/url';

const MIN_AGE = 14;

export const calculateAge = calculateAgeUtil;

export const validateAge = (birthDate: string): boolean => {
  if (!isValidBirthDate(birthDate)) return false;
  const age = calculateAge(birthDate);
  return age >= MIN_AGE;
};

export const validateChannelUrl = (
  platform: 'instagram' | 'youtube' | 'naver' | 'threads',
  url: string,
): boolean => {
  return validateChannelUrlUtil(platform, url);
};