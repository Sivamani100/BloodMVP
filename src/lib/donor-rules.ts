export interface DonorValidationInput {
  dob: string | Date;
  weight_kg: number;
  gender: 'male' | 'female' | 'other';
  last_donation_date?: string | Date | null;
  email_verified?: boolean;
  phone_verified?: boolean;
  consents?: string[];
  health_ok?: boolean;
  blood_group?: string | null;
  has_location?: boolean;
}

export const REQUIRED_CONSENTS = [
  'contact_calls_whatsapp',
  'share_phone_after_yes',
  'data_storage',
  'call_recording',
  'no_money_and_final_check',
  'age_18',
] as const;

export function getAge(dob: string | Date): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function isAgeValid(dob: string | Date): boolean {
  const age = getAge(dob);
  return age >= 18 && age <= 65;
}

export function isWeightValid(weightKg: number): boolean {
  return weightKg >= 45 && weightKg <= 250;
}

export function gapMonths(gender: 'male' | 'female' | 'other'): number {
  return gender === 'male' ? 3 : 4;
}

export function computeNextEligibleDate(
  lastDonationDate: string | Date | null | undefined,
  gender: 'male' | 'female' | 'other'
): Date | null {
  if (!lastDonationDate) return null;
  const d = new Date(lastDonationDate);
  const months = gapMonths(gender);
  d.setMonth(d.getMonth() + months);
  return d;
}

export interface ActivationChecklist {
  isEligible: boolean;
  checks: {
    ageOk: boolean;
    weightOk: boolean;
    phoneVerified: boolean;
    emailVerified: boolean;
    consentsComplete: boolean;
    healthOk: boolean;
    bloodGroupKnown: boolean;
    locationSaved: boolean;
  };
  missingReasons: string[];
}

export function checkActivation(input: DonorValidationInput): ActivationChecklist {
  const ageOk = isAgeValid(input.dob);
  const weightOk = isWeightValid(input.weight_kg);
  const phoneVerified = !!input.phone_verified;
  const emailVerified = !!input.email_verified;
  const consentsComplete = REQUIRED_CONSENTS.every((c) => input.consents?.includes(c));
  const healthOk = !!input.health_ok;
  const bloodGroupKnown = !!input.blood_group && input.blood_group !== '';
  const locationSaved = !!input.has_location;

  const missingReasons: string[] = [];
  if (!ageOk) missingReasons.push('age_out_of_bounds');
  if (!weightOk) missingReasons.push('weight_under_45');
  if (!phoneVerified) missingReasons.push('phone_not_verified');
  if (!emailVerified) missingReasons.push('email_not_verified');
  if (!consentsComplete) missingReasons.push('consents_incomplete');
  if (!healthOk) missingReasons.push('health_check_pending_or_blocked');
  if (!bloodGroupKnown) missingReasons.push('blood_group_unknown');
  if (!locationSaved) missingReasons.push('location_missing');

  const isEligible = missingReasons.length === 0;

  return {
    isEligible,
    checks: {
      ageOk,
      weightOk,
      phoneVerified,
      emailVerified,
      consentsComplete,
      healthOk,
      bloodGroupKnown,
      locationSaved,
    },
    missingReasons,
  };
}

