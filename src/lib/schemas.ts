import { z } from 'zod';
import { BLOOD_GROUPS, BLOOD_COMPONENTS, URGENCY_LEVELS, MAX_TRAVEL_KM_OPTIONS } from '@/lib/constants';

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+91[6-9]\d{9}$/, 'Must be a valid Indian mobile number (+91 followed by 10 digits starting with 6-9)');

export const consentStepSchema = z
  .object({
    consents: z
      .array(
        z.enum([
          'contact_calls_whatsapp',
          'share_phone_after_yes',
          'data_storage',
          'call_recording',
          'no_money_and_final_check',
          'age_18',
        ])
      )
      .length(6, 'All 6 consent items must be agreed to'),
  })
  .strict();

export const donorBasicSchema = z
  .object({
    full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name must be under 80 characters'),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD'),
    gender: z.enum(['male', 'female', 'other']),
    weight_kg: z.number().min(30).max(250),
    languages: z.array(z.enum(['en', 'te', 'hi'])).min(1, 'Select at least one language'),
  })
  .strict();

export const donorBloodSchema = z
  .object({
    blood_group: z.enum(BLOOD_GROUPS).nullable(),
    group_confidence: z.enum(['self_declared', 'card_seen', 'bank_confirmed']).default('self_declared'),
    last_donation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    also_platelets: z.boolean().default(false),
  })
  .strict();

export const donorHealthSchema = z
  .object({
    answers: z.record(z.boolean()),
  })
  .strict();

export const donorLocationSchema = z
  .object({
    lat: z.number().min(6).max(38),
    lng: z.number().min(68).max(98),
    area: z.string().trim().max(100).optional(),
    city: z.string().trim().max(100).optional(),
    pincode: z.string().regex(/^[0-9]{6}$/, 'Must be a 6-digit pincode'),
    max_travel_km: z.union([
      z.literal(3),
      z.literal(5),
      z.literal(10),
      z.literal(25),
      z.literal(50),
      z.literal(100),
    ]),
    transport: z.enum(['walk', 'bike', 'car', 'bus']).optional(),
  })
  .strict();

export const donorPrefsSchema = z
  .object({
    quiet_start: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
    quiet_end: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
    allow_critical_in_quiet: z.boolean().default(true),
    max_requests_per_month: z.number().min(1).max(20).default(4),
  })
  .strict();

export const donorEmailSchema = z
  .object({
    email: z.string().trim().email('Must be a valid email address'),
  })
  .strict();

export const createRequestSchema = z
  .object({
    requester_name: z.string().trim().min(2).max(60),
    relation: z.enum(['self', 'family', 'friend', 'hospital_staff']),
    patient_first_name: z.string().trim().min(1).max(40),
    patient_age: z.number().int().min(0).max(120).optional().nullable(),
    reason: z.enum(['accident', 'surgery', 'delivery', 'cancer', 'thalassemia', 'dengue', 'other']).optional(),
    blood_group: z.enum(BLOOD_GROUPS),
    component: z.enum(BLOOD_COMPONENTS).default('whole_blood'),
    units_needed: z.number().int().min(1).max(10),
    urgency: z.enum(URGENCY_LEVELS),
    needed_by: z.string().datetime().optional().nullable(),
    hospital_name: z.string().trim().min(2).max(120),
    hospital_area: z.string().trim().max(100).optional().nullable(),
    lat: z.number().min(6).max(38),
    lng: z.number().min(68).max(98),
    ward_info: z.string().trim().max(120).optional().nullable(),
    hospital_phone: z.string().trim().max(30).optional().nullable(),
    allow_compatible: z.boolean().default(false),
    note: z.string().trim().max(300).optional().nullable(),
    slip_path: z.string().optional().nullable(),
  })
  .strict();

export const requestDecisionSchema = z
  .object({
    continue: z.boolean(),
  })
  .strict();

export const donationConfirmSchema = z
  .object({
    code: z.string().trim().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
  })
  .strict();

export const reportAbuseSchema = z
  .object({
    target_type: z.enum(['request', 'donor', 'bank']),
    target_id: z.string().min(1),
    reason: z.string().trim().min(3).max(500),
  })
  .strict();
