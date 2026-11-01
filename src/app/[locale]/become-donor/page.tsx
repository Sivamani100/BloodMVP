'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { BLOOD_GROUPS, MAX_TRAVEL_KM_OPTIONS } from '@/lib/constants';
import { HEALTH_QUESTIONS } from '@/lib/health-questions';
import { LocationPicker } from '@/components/map/LocationPicker';
import { REQUIRED_CONSENTS } from '@/lib/donor-rules';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Heart,
} from 'lucide-react';

export default function BecomeDonorWizard() {
  const tDonor = useTranslations('donor');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('2000-01-01');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [weightKg, setWeightKg] = useState('65');
  const [languages, setLanguages] = useState<string[]>(['en']);

  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [alsoPlatelets, setAlsoPlatelets] = useState(false);

  const [healthAnswers, setHealthAnswers] = useState<Record<string, boolean>>({});

  const [lat, setLat] = useState(17.0005);
  const [lng, setLng] = useState(81.804);
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Rajahmundry');
  const [pincode, setPincode] = useState('533101');
  const [maxTravelKm, setMaxTravelKm] = useState<number>(10);

  const [quietStart, setQuietStart] = useState('');
  const [quietEnd, setQuietEnd] = useState('');
  const [allowCriticalInQuiet, setAllowCriticalInQuiet] = useState(true);
  const [maxRequestsPerMonth, setMaxRequestsPerMonth] = useState(4);

  const [email, setEmail] = useState('');

  const steps = [
    'Consent',
    'Basic Details',
    'Blood Details',
    'Health Check',
    'Location',
    'Preferences',
    'Email Verification',
  ];

  async function handleNextStep() {
    setErrorMsg(null);
    setLoading(true);

    try {
      let endpoint = '';
      let payload: any = {};

      switch (stepIndex) {
        case 0: {
          const agreed = REQUIRED_CONSENTS.filter((c) => consents[c]);
          if (agreed.length < REQUIRED_CONSENTS.length) {
            setErrorMsg('All 6 consents are required to become a volunteer donor.');
            setLoading(false);
            return;
          }
          endpoint = 'consent';
          payload = { consents: agreed };
          break;
        }

        case 1: {
          const weight = parseFloat(weightKg);
          if (isNaN(weight) || weight < 30 || weight > 250) {
            setErrorMsg('Please enter a valid weight in kg (30 - 250)');
            setLoading(false);
            return;
          }
          endpoint = 'basic';
          payload = {
            full_name: fullName,
            dob,
            gender,
            weight_kg: weight,
            languages,
          };
          break;
        }

        case 2: {
          endpoint = 'blood';
          payload = {
            blood_group: bloodGroup || null,
            group_confidence: 'self_declared',
            last_donation_date: lastDonationDate || null,
            also_platelets: alsoPlatelets,
          };
          break;
        }

        case 3: {
          endpoint = 'health';
          payload = { answers: healthAnswers };
          break;
        }

        case 4: {
          if (!pincode || pincode.length !== 6) {
            setErrorMsg('Please enter a valid 6-digit pincode');
            setLoading(false);
            return;
          }
          endpoint = 'location';
          payload = {
            lat,
            lng,
            area,
            city,
            pincode,
            max_travel_km: maxTravelKm,
          };
          break;
        }

        case 5: {
          endpoint = 'prefs';
          payload = {
            quiet_start: quietStart || null,
            quiet_end: quietEnd || null,
            allow_critical_in_quiet: allowCriticalInQuiet,
            max_requests_per_month: maxRequestsPerMonth,
          };
          break;
        }

        case 6: {
          if (!email || !email.includes('@')) {
            setErrorMsg('Please enter a valid email address');
            setLoading(false);
            return;
          }
          endpoint = 'email';
          payload = { email };
          break;
        }
      }

      const res = await fetch(`/api/donor/register/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save step details');
        setLoading(false);
        return;
      }

      if (stepIndex < steps.length - 1) {
        setStepIndex(stepIndex + 1);
      } else {
        router.push('/donor');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Progress header */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
          <span>
            Step {stepIndex + 1} of {steps.length}: {steps[stepIndex]}
          </span>
          <span>{Math.round(((stepIndex + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blood-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 0: Consent */}
      {stepIndex === 0 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-gray-950">{tDonor('consent_title')}</h2>
          <p className="text-xs text-gray-500">
            Please read and agree to all 6 volunteer standards before registering.
          </p>

          <div className="space-y-3 pt-2">
            {[
              {
                id: 'contact_calls_whatsapp',
                label: 'You may contact me by WhatsApp and automated phone calls about urgent blood requests.',
              },
              {
                id: 'share_phone_after_yes',
                label: "My phone number may be shared with the patient's family only after I say YES to a request.",
              },
              {
                id: 'data_storage',
                label: 'Blood may store the details I enter here to match me with emergency patients.',
              },
              {
                id: 'call_recording',
                label: 'Calls may be monitored or recorded for safety and emergency quality verification.',
              },
              {
                id: 'no_money_and_final_check',
                label: 'I understand Blood never asks for money, and the blood bank doctor performs the final medical check.',
              },
              {
                id: 'age_18',
                label: 'I confirm that I am 18 years of age or older.',
              },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!consents[item.id]}
                  onChange={(e) => setConsents({ ...consents, [item.id]: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-blood-600 rounded-sm focus:ring-blood-500"
                />
                <span className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Basic Details */}
      {stepIndex === 1 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-gray-950">Basic Donor Profile</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="As on official records"
                className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Date of Birth (Age 18-65) *</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blood-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Weight in kg (Min 45 kg) *</label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Preferred Languages *</label>
                <div className="flex gap-2 pt-1">
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'te', label: 'తెలుగు' },
                    { id: 'hi', label: 'हिन्दी' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        if (languages.includes(l.id)) {
                          if (languages.length > 1) setLanguages(languages.filter((x) => x !== l.id));
                        } else {
                          setLanguages([...languages, l.id]);
                        }
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                        languages.includes(l.id)
                          ? 'bg-blood-600 text-white border-blood-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Blood Details */}
      {stepIndex === 2 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-gray-950">Blood Group &amp; History</h2>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Blood Group *</label>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBloodGroup(bg)}
                  className={`py-3 rounded-xl font-black text-lg transition-all ${
                    bloodGroup === bg
                      ? 'bg-blood-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Last Donation Date (Leave empty if first time)
            </label>
            <input
              type="date"
              value={lastDonationDate}
              onChange={(e) => setLastDonationDate(e.target.value)}
              className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500"
            />
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={alsoPlatelets}
              onChange={(e) => setAlsoPlatelets(e.target.checked)}
              className="w-4 h-4 text-blood-600 rounded-sm focus:ring-blood-500"
            />
            <span className="text-xs sm:text-sm text-gray-700 font-medium">
              I am also willing to donate Platelets / Single Donor Platelets (SDP).
            </span>
          </label>
        </div>
      )}

      {/* Step 3: Health Quick-Check */}
      {stepIndex === 3 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-gray-950">Health Quick-Check</h2>
          <p className="text-xs text-gray-500">
            Answers are stored with military-grade encryption (AES-256-GCM) and only used by the matching engine.
          </p>

          <div className="space-y-3">
            {HEALTH_QUESTIONS.filter(
              (q) => !(q.genderFilter === 'female_or_other' && gender === 'male')
            ).map((q) => (
              <div
                key={q.key}
                className="p-3.5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <p className="text-xs sm:text-sm text-gray-800 font-medium">{q.en}</p>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setHealthAnswers({ ...healthAnswers, [q.key]: true })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      healthAnswers[q.key] === true
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setHealthAnswers({ ...healthAnswers, [q.key]: false })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      healthAnswers[q.key] === false
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Location */}
      {stepIndex === 4 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-gray-950">Home Location</h2>
          <p className="text-xs text-gray-500">
            Only distance bands (e.g. &quot;3 to 5 km&quot;) are ever visible to requesters. Your exact pin is never shared.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Area / Colony"
              className="p-2.5 text-sm border border-gray-300 rounded-xl"
            />
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="6-digit Pincode"
              className="p-2.5 text-sm border border-gray-300 rounded-xl"
            />
          </div>

          <LocationPicker
            initialLat={lat}
            initialLng={lng}
            onLocationSelect={(newLat, newLng) => {
              setLat(newLat);
              setLng(newLng);
            }}
          />

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Maximum travel distance willing to travel (km)
            </label>
            <div className="grid grid-cols-6 gap-2">
              {MAX_TRAVEL_KM_OPTIONS.map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setMaxTravelKm(km)}
                  className={`py-2 rounded-xl text-xs font-bold ${
                    maxTravelKm === km
                      ? 'bg-blood-600 text-white'
                      : 'bg-gray-50 text-gray-700 border border-gray-200'
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Preferences */}
      {stepIndex === 5 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-gray-950">Alert Preferences</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Quiet Start Time</label>
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                className="w-full p-2.5 text-sm border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Quiet End Time</label>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                className="w-full p-2.5 text-sm border border-gray-300 rounded-xl"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={allowCriticalInQuiet}
              onChange={(e) => setAllowCriticalInQuiet(e.target.checked)}
              className="w-4 h-4 text-blood-600 rounded-sm focus:ring-blood-500"
            />
            <span className="text-xs sm:text-sm text-gray-700 font-medium">
              Still allow critical (urgency &quot;Right Now&quot;) alerts during quiet hours.
            </span>
          </label>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Max requests per month: {maxRequestsPerMonth}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={maxRequestsPerMonth}
              onChange={(e) => setMaxRequestsPerMonth(parseInt(e.target.value, 10))}
              className="w-full accent-blood-600"
            />
          </div>
        </div>
      )}

      {/* Step 6: Email Verification */}
      {stepIndex === 6 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-gray-950">Email Verification</h2>
          <p className="text-xs text-gray-500">
            A confirmation link will be sent to your email to verify account recovery.
          </p>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500"
            />
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 pt-2">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={() => setStepIndex(stepIndex - 1)}
            disabled={loading}
            className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold rounded-2xl transition-colors"
          >
            {tCommon('back')}
          </button>
        )}

        <button
          type="button"
          onClick={handleNextStep}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-blood-600 hover:bg-blood-700 text-white text-base font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-blood-600/30 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>{stepIndex === steps.length - 1 ? 'Finish Registration' : tCommon('continue')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

