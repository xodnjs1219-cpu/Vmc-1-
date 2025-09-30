import {
  isValidBirthDate as isValidBirthDateUtil,
  calculateAge as calculateAgeUtil,
  validateAge as validateAgeUtil,
} from '@/lib/validation/date';
import { validateChannelUrl as validateChannelUrlUtil } from '@/lib/validation/url';

const MIN_AGE = 14;

export const isValidBirthDate = isValidBirthDateUtil;

export const calculateAge = calculateAgeUtil;

export const isValidAge = (birthDate: string): boolean => {
  return validateAgeUtil(birthDate, MIN_AGE);
};

export const isValidChannelUrl = (
  platform: 'instagram' | 'youtube' | 'naver' | 'threads',
  url: string,
): boolean => {
  return validateChannelUrlUtil(platform, url);
};