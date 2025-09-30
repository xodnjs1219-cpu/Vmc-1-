import { parseISO, isValid, formatISO } from 'date-fns';

export const parseDateForInput = (value: string) => {
  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return value;
  }
  return formatISO(parsed, { representation: 'date' });
};
