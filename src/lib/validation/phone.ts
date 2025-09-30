const PHONE_REGEX = /^010-\d{4}-\d{4}$/;

export const isValidPhoneNumber = (phone: string): boolean => {
  return PHONE_REGEX.test(phone);
};

export const formatPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('010')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  return phone;
};