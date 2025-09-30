const BUSINESS_NUMBER_REGEX = /^\d{3}-\d{2}-\d{5}$/;

export const validateBusinessNumber = (number: string): boolean => {
  return BUSINESS_NUMBER_REGEX.test(number);
};

export const formatBusinessNumber = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');

  if (cleaned.length !== 10) {
    return number;
  }

  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
};

export const cleanBusinessNumber = (number: string): string => {
  return number.replace(/\D/g, '');
};