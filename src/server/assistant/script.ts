export type StepKey =
  | 'identity'
  | 'willing'
  | 'donated_recently'
  | 'unwell_today'
  | 'recent_procedure'
  | 'alcohol_24h'
  | 'eta'
  | 'share_phone';

export const STEPS: StepKey[] = [
  'identity',
  'willing',
  'donated_recently',
  'unwell_today',
  'recent_procedure',
  'alcohol_24h',
  'eta',
  'share_phone',
];

export interface ContactAnswers {
  identity_confirmed?: boolean;
  willing?: boolean;
  donated_recently?: boolean;
  unwell_today?: boolean;
  recent_procedure?: boolean;
  alcohol_24h?: boolean;
  eta_minutes?: number;
  share_phone?: boolean;
  _last_inbound_at?: string;
  _wa_step?: StepKey;
  _call_step?: StepKey;
  _call_retry?: boolean;
  [key: string]: unknown;
}

