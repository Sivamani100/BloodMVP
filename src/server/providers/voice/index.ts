import { VoiceProvider } from './types';
import { TwilioVoiceProvider } from './twilio';
import { getEnv } from '@/server/env';

export function getVoiceProvider(): VoiceProvider {
  const env = getEnv();
  switch (env.VOICE_PROVIDER) {
    case 'twilio':
    default:
      return new TwilioVoiceProvider();
  }
}
