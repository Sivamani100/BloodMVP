export interface VoiceProvider {
  name: 'twilio';
  placeCall(args: {
    contactId: string;
    toE164: string;
    lang: 'en' | 'te' | 'hi';
  }): Promise<{ ok: boolean; callSid?: string; errorCode?: string; retryable: boolean }>;
}

