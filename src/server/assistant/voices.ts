import { Locale } from '@/lib/constants';

export interface VoiceConfig {
  voice: string;
  language: string;
}

export const TWILIO_VOICES: Record<Locale, VoiceConfig> = {
  en: {
    voice: 'Google.en-IN-Standard-E',
    language: 'en-IN',
  },
  hi: {
    voice: 'Google.hi-IN-Standard-E',
    language: 'hi-IN',
  },
  te: {
    voice: 'Google.te-IN-Standard-C',
    language: 'te-IN',
  },
};

export const FALLBACK_VOICE: VoiceConfig = {
  voice: 'Polly.Aditi',
  language: 'en-IN',
};

export function getVoiceForLocale(locale: Locale): VoiceConfig {
  return TWILIO_VOICES[locale] || TWILIO_VOICES.en;
}

