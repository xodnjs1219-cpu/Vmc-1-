export const isValidBirthDate = (birthDate: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(birthDate)) return false;

  const date = new Date(birthDate);
  return !isNaN(date.getTime());
};

export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const validateAge = (birthDate: string, minAge: number): boolean => {
  if (!isValidBirthDate(birthDate)) return false;
  const age = calculateAge(birthDate);
  return age >= minAge;
};