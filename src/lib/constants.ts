export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const BLOOD_COMPONENTS = ['whole_blood', 'red_cells', 'platelets', 'plasma'] as const;
export type BloodComponent = (typeof BLOOD_COMPONENTS)[number];

export const URGENCY_LEVELS = ['now', 'six_hours', 'twenty_four_hours', 'planned'] as const;
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];

export const DONOR_STATES = ['draft', 'pending', 'active', 'suspended', 'deleted'] as const;
export type DonorState = (typeof DONOR_STATES)[number];

export const REQUEST_STATUSES = [
  'searching',
  'waiting_requester',
  'enough_donors',
  'completed',
  'stopped',
  'cancelled',
  'expired',
  'frozen',
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const CONTACT_STATUSES = [
  'queued',
  'contacting',
  'accepted',
  'declined',
  'not_eligible',
  'no_answer',
  'needs_human',
  'cancelled',
  'on_the_way',
  'arrived',
  'donated',
  'no_show',
] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const RINGS_KM = [0.5, 1, 2, 3, 5, 10, 15, 20, 30, 40, 50, 70, 90, 100] as const;
export const GATES_KM = [70, 90, 100] as const;

export const WAVE_MINUTES: Record<UrgencyLevel, number> = {
  now: 3,
  six_hours: 8,
  twenty_four_hours: 20,
  planned: 60,
};

export const CONTACT_MULTIPLIER = 3;
export const MAX_CONTACTS_PER_REQUEST = 30;
export const CALL_RETRY_SECONDS = 120;
export const WA_WINDOW_HOURS = 23;

export const MAX_TRAVEL_KM_OPTIONS = [3, 5, 10, 25, 50, 100] as const;

export const MONEY_WORDS = [
  'pay',
  'paid',
  'rupee',
  'rupees',
  'rs',
  '₹',
  'money',
  'cash',
  'upi',
  'gpay',
  'phonepe',
  'paytm',
  'bank transfer',
  'డబ్బు',
  'రూపాయి',
  'పైసలు',
  'పేమెంట్',
  'पैसे',
  'रुपये',
  'पेमेंट',
  'कैश',
];

export const LOCALES = ['en', 'te', 'hi'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
