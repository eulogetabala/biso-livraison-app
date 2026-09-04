/** Valide la saisie locale d'un mobile congolais (+242). */
export function isValidCongoPhoneInput(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return false;
  if (digits.startsWith('0')) {
    return digits.length === 9 && /^06\d{7}$/.test(digits);
  }
  return digits.length === 8 && /^6\d{7}$/.test(digits);
}

export function congoPhoneValidationMessage(): string {
  return 'Numéro invalide. Saisissez 9 chiffres commençant par 06 (ex. 06 XXX XX XX).';
}
