import { z } from 'zod';

const envSchema = z.object({
  APP_ENV: z.enum(['local', 'staging', 'production']).default('local'),
  PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_DB_URL: z.string().optional(),
  SEND_SMS_HOOK_SECRET: z.string().optional(),

  CRON_SECRET: z.string().min(1).default('blood_cron_secret_default_change_in_prod'),
  DATA_ENCRYPTION_KEY: z.string().min(32).default('k8w3Z8j1+x7M2y9W0p4Q5r6T1u3V5x7Z9a1B3c5E7g9='),

  OUTBOUND_ALLOWLIST: z.string().default(''),

  WHATSAPP_GRAPH_VERSION: z.string().default('v23.0'),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_APP_SECRET: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().default('blood_verify_token_default'),

  VOICE_PROVIDER: z.enum(['twilio']).default('twilio'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),

  DEV_TEST_DONORS: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env | null = null;

export function getEnv(): Env {
  if (parsedEnv) return parsedEnv;

  const result = envSchema.safeParse({
    APP_ENV: process.env.APP_ENV,
    PUBLIC_APP_URL: process.env.PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
    SEND_SMS_HOOK_SECRET: process.env.SEND_SMS_HOOK_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
    DATA_ENCRYPTION_KEY: process.env.DATA_ENCRYPTION_KEY,
    OUTBOUND_ALLOWLIST: process.env.OUTBOUND_ALLOWLIST,
    WHATSAPP_GRAPH_VERSION: process.env.WHATSAPP_GRAPH_VERSION,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET,
    WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
    VOICE_PROVIDER: process.env.VOICE_PROVIDER,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,
    DEV_TEST_DONORS: process.env.DEV_TEST_DONORS,
    SENTRY_DSN: process.env.SENTRY_DSN,
  });

  if (!result.success) {
    console.error('Environment validation failed:', result.error.format());
    throw new Error('Invalid environment configuration');
  }

  parsedEnv = result.data;
  return parsedEnv;
}

