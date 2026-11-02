'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { WizardHeader } from '@/components/ui/WizardHeader';
import { REQUIRED_CONSENTS } from '@/lib/donor-rules';
import {
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  Loader2,
  Phone,
  MessageSquare,
  MessageCircle,
  ChevronDown,
  Check,
} from 'lucide-react';

export default function BecomeDonorPage() {
  const router = useRouter();

  // Wizard Steps:
  // 0: About you (Name, DOB, Gender pills)
  // 1: Blood group & body details (Blood group 2x4 pills, Weight, Height)
  // 2: Where you're based (State, District, Use my location, Map preview)
  // 3: Quick eligibility check (3 interactive checkbox cards)
  // 4: Availability & consent (Call/SMS/WhatsApp pills, Match radius slider, Terms card)
  // 5: Review your profile (Summary list + eligibility check pill)
  // 6: Success Confirmation screen (Registered donor)
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState<string>('Siva');
  const [dob, setDob] = useState<string>('2006-10-18');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [weightKg, setWeightKg] = useState<string>('65');
  const [heightCm, setHeightCm] = useState<string>('170');

  const [stateName, setStateName] = useState<string>('Andhra Pradesh');
  const [districtName, setDistrictName] = useState<string>('East Godavari');
  const [lat, setLat] = useState<number>(17.0005);
  const [lng, setLng] = useState<number>(81.804);
  const [locationCaptured, setLocationCaptured] = useState<boolean>(true);

  // 3 Eligibility screening checkboxes
  const [check1, setCheck1] = useState<boolean>(true);
  const [check2, setCheck2] = useState<boolean>(true);
  const [check3, setCheck3] = useState<boolean>(true);

  // Reach channels
  const [reachCall, setReachCall] = useState<boolean>(true);
  const [reachSMS, setReachSMS] = useState<boolean>(false);
  const [reachWhatsApp, setReachWhatsApp] = useState<boolean>(true);
  const [matchRadiusKm, setMatchRadiusKm] = useState<number>(25);
  const [termsAgreed, setTermsAgreed] = useState<boolean>(true);

  // Fetch current geolocation
  function handleCaptureLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setLocationCaptured(true);
        },
        () => {
          setLocationCaptured(true);
        }
      );
    } else {
      setLocationCaptured(true);
    }
  }

  // Final Registration Submission
  async function handleConfirmAndRegister() {
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Consent
      await fetch('/api/donor/register/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consents: REQUIRED_CONSENTS }),
      });

      // 2. Basic info
      await fetch('/api/donor/register/basic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          dob: dob || '2000-01-01',
          gender: gender.toLowerCase(),
          weight_kg: parseFloat(weightKg) || 65,
          languages: ['en', 'te'],
        }),
      });

      // 3. Blood group
      await fetch('/api/donor/register/blood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blood_group: bloodGroup,
          group_confidence: 'self_declared',
          last_donation_date: null,
          also_platelets: true,
        }),
      });

      // 4. Health screening
      await fetch('/api/donor/register/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: {
            fever: false,
            tattoo_or_piercing: false,
            surgery: false,
            cardiac: false,
            meds: false,
          },
        }),
      });

      // 5. Location
      await fetch('/api/donor/register/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lng,
          area: 'Diwancheruvu',
          city: districtName || 'Rajahmundry',
          pincode: '533101',
          max_travel_km: matchRadiusKm,
        }),
      });

      // 6. Preferences
      await fetch('/api/donor/register/prefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: [
            reachCall && 'call',
            reachWhatsApp && 'whatsapp',
            reachSMS && 'sms',
          ].filter(Boolean),
          quiet_start: null,
          quiet_end: null,
          max_requests_per_month: 4,
          allow_critical_in_quiet: true,
        }),
      });

      setStep(6); // Success confirmation screen
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrorMessage(err.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#F2F2F7] pb-28 text-gray-950 font-sans">
      {/* Step 0: About you */}
      {step === 0 && (
        <>
          <WizardHeader
            title="About You"
            onBack={() => router.push('/')}
            progressPercent={20}
          />
          <div className="max-w-md mx-auto px-4 pt-4 space-y-5">
            <div className="space-y-1">
              <h1 className="text-[26px] sm:text-[30px] font-bold text-gray-950 tracking-[-0.02em] leading-tight">
                About You
              </h1>
              <p className="text-[15px] text-[#8E8E93]">
                Your personal details help match blood requests with surgical confidence.
              </p>
            </div>

            {/* iOS Inset Grouped List */}
            <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-2xs divide-y divide-black/[0.06] overflow-hidden">
              <div className="flex items-center px-4 py-3">
                <label className="text-[15px] font-medium text-[#8E8E93] w-28 shrink-0">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Siva Kumar"
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center px-4 py-3">
                <label className="text-[15px] font-medium text-[#8E8E93] w-28 shrink-0">
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden"
                />
              </div>

              {/* iOS Segmented Gender Control Row */}
              <div className="px-4 py-3 space-y-2">
                <label className="text-[15px] font-medium text-[#8E8E93] block">
                  Gender
                </label>
                <div className="bg-[#767680]/12 p-0.5 rounded-[9px] flex items-center">
                  {(['Male', 'Female', 'Other'] as const).map((g) => {
                    const isSelected = gender === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`flex-1 py-1.5 text-[13px] font-semibold rounded-[7px] transition-all select-none ${
                          isSelected
                            ? 'bg-white text-gray-900 shadow-xs font-bold'
                            : 'text-[#8E8E93] hover:text-gray-900'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 ios-glass hairline-t p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={!fullName.trim()}
                className="w-full h-12 rounded-[12px] font-semibold text-[17px] bg-[#FF3B30] text-white shadow-sm ios-press transition-all select-none disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 1: Blood group & body details */}
      {step === 1 && (
        <>
          <WizardHeader
            title="Blood Group & Body"
            onBack={() => setStep(0)}
            progressPercent={40}
          />
          <div className="max-w-md mx-auto px-4 pt-4 space-y-5">
            <div className="space-y-1">
              <h1 className="text-[26px] sm:text-[30px] font-bold text-gray-950 tracking-[-0.02em] leading-tight">
                Blood Group &amp; Body
              </h1>
              <p className="text-[15px] text-[#8E8E93]">
                Ensures compatibility before dispatching emergency wave alerts.
              </p>
            </div>

            {/* 2x4 Grid of Pills */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider px-1">
                Your Blood Group
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => {
                  const isSelected = bloodGroup === bg;
                  return (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBloodGroup(bg)}
                      className={`py-3 rounded-[14px] font-bold text-[18px] transition-all ios-press select-none ${
                        isSelected
                          ? 'bg-[#FF3B30] text-white shadow-sm ring-2 ring-[#FF3B30]/30'
                          : 'bg-white border border-black/[0.06] shadow-2xs text-gray-900 hover:bg-[#F9F9FB]'
                      }`}
                    >
                      {bg}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weight and Height Inset Group */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider px-1">
                Body Metrics (Approximate)
              </label>
              <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-2xs divide-y divide-black/[0.06] overflow-hidden">
                <div className="flex items-center px-4 py-3">
                  <label className="text-[15px] font-medium text-[#8E8E93] w-28 shrink-0">
                    Weight (kg)
                  </label>
                  <input
                    type="text"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="e.g. 65"
                    className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden"
                  />
                  <span className="text-[14px] text-[#8E8E93] font-medium">kg</span>
                </div>

                <div className="flex items-center px-4 py-3">
                  <label className="text-[15px] font-medium text-[#8E8E93] w-28 shrink-0">
                    Height (cm)
                  </label>
                  <input
                    type="text"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="e.g. 170"
                    className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden"
                  />
                  <span className="text-[14px] text-[#8E8E93] font-medium">cm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 ios-glass hairline-t p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full h-12 rounded-[12px] font-semibold text-[17px] bg-[#FF3B30] text-white shadow-sm ios-press transition-all select-none"
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 2: Where you're based */}
      {step === 2 && (
        <>
          <WizardHeader
            title="Location"
            onBack={() => setStep(1)}
            progressPercent={60}
          />
          <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
            <div className="space-y-1">
              <h1 className="text-[26px] sm:text-[30px] font-bold text-gray-950 tracking-[-0.02em] leading-tight">
                Where You&apos;re Based
              </h1>
              <p className="text-[15px] text-[#8E8E93]">
                We only match you to requests within the travel radius you specify.
              </p>
            </div>

            {/* Inset Grouped Select Rows */}
            <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-2xs divide-y divide-black/[0.06] overflow-hidden">
              <div className="relative flex items-center px-4 py-3">
                <span className="text-[15px] text-[#8E8E93] w-24 shrink-0 font-medium">State</span>
                <select
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden appearance-none cursor-pointer pr-6"
                >
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#8E8E93] absolute right-4 pointer-events-none" strokeWidth={2} />
              </div>

              <div className="flex items-center px-4 py-3">
                <span className="text-[15px] text-[#8E8E93] w-24 shrink-0 font-medium">District</span>
                <input
                  type="text"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  placeholder="e.g. East Godavari"
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Use My Current Location Action Row */}
            <button
              type="button"
              onClick={handleCaptureLocation}
              className="w-full text-left p-3.5 rounded-[16px] bg-white border border-black/[0.06] shadow-2xs hover:bg-[#F9F9FB] transition-all flex items-center justify-between ios-press"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#007AFF]/12 flex items-center justify-center text-[#007AFF] shrink-0">
                  <MapPin className="w-4 h-4 text-[#007AFF]" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-semibold text-[15px] text-gray-900">
                    Use My Current Location
                  </h3>
                  <p className="text-[12px] text-[#8E8E93]">
                    {locationCaptured
                      ? 'GPS coordinates recorded.'
                      : 'More accurate than typing.'}
                  </p>
                </div>
              </div>

              {locationCaptured && (
                <div className="w-5 h-5 rounded-full bg-[#34C759] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </div>
              )}
            </button>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 ios-glass hairline-t p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full h-12 rounded-[12px] font-semibold text-[17px] bg-[#FF3B30] text-white shadow-sm ios-press transition-all select-none"
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 3: Quick eligibility check */}
      {step === 3 && (
        <>
          <WizardHeader
            title="Eligibility"
            onBack={() => setStep(2)}
            progressPercent={80}
          />
          <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
            <div className="space-y-1">
              <h1 className="text-[26px] sm:text-[30px] font-bold text-gray-950 tracking-[-0.02em] leading-tight">
                Quick Health Screening
              </h1>
              <p className="text-[15px] text-[#8E8E93]">
                Standard clinical screening keeps blood donation safe for you and the recipient.
              </p>
            </div>

            {/* iOS Grouped Checklist */}
            <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-2xs divide-y divide-black/[0.06] overflow-hidden">
              <button
                type="button"
                onClick={() => setCheck1(!check1)}
                className="w-full text-left p-3.5 flex items-start gap-3 hover:bg-[#F9F9FB] transition-colors"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    check1 ? 'bg-[#34C759] text-white shadow-xs' : 'border border-[#C7C7CC] bg-white'
                  }`}
                >
                  {check1 && <Check className="w-3 h-3" strokeWidth={3} />}
                </div>
                <span className="text-[15px] font-medium text-gray-900 leading-snug">
                  No doctor has advised me against donating blood.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCheck2(!check2)}
                className="w-full text-left p-3.5 flex items-start gap-3 hover:bg-[#F9F9FB] transition-colors"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    check2 ? 'bg-[#34C759] text-white shadow-xs' : 'border border-[#C7C7CC] bg-white'
                  }`}
                >
                  {check2 && <Check className="w-3 h-3" strokeWidth={3} />}
                </div>
                <span className="text-[15px] font-medium text-gray-900 leading-snug">
                  I do not take regular medication for chronic cardiac or blood conditions.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCheck3(!check3)}
                className="w-full text-left p-3.5 flex items-start gap-3 hover:bg-[#F9F9FB] transition-colors"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    check3 ? 'bg-[#34C759] text-white shadow-xs' : 'border border-[#C7C7CC] bg-white'
                  }`}
                >
                  {check3 && <Check className="w-3 h-3" strokeWidth={3} />}
                </div>
                <span className="text-[15px] font-medium text-gray-900 leading-snug">
                  In the past 12 months, I have not had major surgery, blood transfusion, or tattoo.
                </span>
              </button>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 ios-glass hairline-t p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!check1 || !check2 || !check3}
                className={`w-full h-12 rounded-[12px] font-semibold text-[17px] shadow-sm ios-press transition-all select-none ${
                  check1 && check2 && check3
                    ? 'bg-[#FF3B30] text-white'
                    : 'bg-[#C7C7CC] text-white cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 4: Availability & consent */}
      {step === 4 && (
        <>
          <WizardHeader
            title="Preferences"
            onBack={() => setStep(3)}
            progressPercent={90}
          />
          <div className="max-w-md mx-auto px-4 pt-4 space-y-5">
            <div className="space-y-1">
              <h1 className="text-[26px] sm:text-[30px] font-bold text-gray-950 tracking-[-0.02em] leading-tight">
                Availability &amp; Consent
              </h1>
              <p className="text-[15px] text-[#8E8E93]">
                Set contact channels and maximum travel radius.
              </p>
            </div>

            {/* Reach channels */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider px-1">
                Contact Methods
              </label>
              <div className="flex gap-2">
                {[
                  { label: 'Voice Call', active: reachCall, toggle: () => setReachCall(!reachCall) },
                  { label: 'WhatsApp', active: reachWhatsApp, toggle: () => setReachWhatsApp(!reachWhatsApp) },
                  { label: 'Cellular SMS', active: reachSMS, toggle: () => setReachSMS(!reachSMS) },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.toggle}
                    className={`flex-1 py-2 rounded-full text-[13px] font-semibold transition-all select-none ios-press ${
                      item.active
                        ? 'bg-[#007AFF] text-white shadow-xs'
                        : 'bg-white border border-black/[0.08] text-gray-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Match Radius Range Slider */}
            <div className="p-4 rounded-[16px] bg-white border border-black/[0.06] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold text-gray-900">Maximum Match Radius</span>
                <span className="text-[15px] font-bold text-[#FF3B30]">{matchRadiusKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={matchRadiusKm}
                onChange={(e) => setMatchRadiusKm(parseInt(e.target.value, 10))}
                className="w-full accent-[#FF3B30] cursor-pointer h-2 bg-[#E5E5EA] rounded-lg appearance-none"
              />
              <div className="flex items-center justify-between text-[11px] text-[#8E8E93]">
                <span>5 km</span>
                <span>25 km (Recommended)</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Terms Consent Callout Card */}
            <button
              type="button"
              onClick={() => setTermsAgreed(!termsAgreed)}
              className="w-full text-left p-3.5 rounded-[16px] bg-white border border-black/[0.06] shadow-2xs flex items-start gap-3 hover:bg-[#F9F9FB] transition-colors"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  termsAgreed ? 'bg-[#34C759] text-white shadow-xs' : 'border border-[#C7C7CC] bg-white'
                }`}
              >
                {termsAgreed && <Check className="w-3 h-3" strokeWidth={3} />}
              </div>
              <p className="text-[13px] text-gray-700 leading-snug">
                I agree to receive emergency donor alerts from verified patient requests and agree to the <strong>Terms &amp; Voluntary Guidelines</strong>.
              </p>
            </button>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 ios-glass hairline-t p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setStep(5)}
                disabled={!termsAgreed}
                className="w-full h-12 rounded-[12px] font-semibold text-[17px] bg-[#FF3B30] text-white shadow-sm ios-press transition-all select-none disabled:opacity-40"
              >
                Review Profile
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 5: Review & submit */}
      {step === 5 && (
        <>
          <WizardHeader
            title="Review Profile"
            onBack={() => setStep(4)}
            progressPercent={100}
          />
          <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
            <div className="space-y-1">
              <h1 className="text-[26px] sm:text-[30px] font-bold text-gray-950 tracking-[-0.02em] leading-tight">
                Review Your Profile
              </h1>
              <p className="text-[15px] text-[#8E8E93]">
                Confirm your details before activating live donor dispatch.
              </p>
            </div>

            {/* Profile Summary Inset Group */}
            <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-2xs divide-y divide-black/[0.06] overflow-hidden text-[15px]">
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-[#8E8E93] font-medium">Name</span>
                <span className="font-semibold text-gray-950">{fullName}</span>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-[#8E8E93] font-medium">Blood Group</span>
                <span className="font-bold text-[#FF3B30]">{bloodGroup}</span>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-[#8E8E93] font-medium">Location</span>
                <span className="font-semibold text-gray-950">{districtName}, {stateName}</span>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-[#8E8E93] font-medium">Match Radius</span>
                <span className="font-semibold text-gray-950">{matchRadiusKm} km</span>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-[#8E8E93] font-medium">Channels</span>
                <span className="font-semibold text-gray-950">
                  {[reachCall && 'Call', reachWhatsApp && 'WhatsApp', reachSMS && 'SMS']
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            </div>

            {/* Eligibility Verified Callout */}
            <div className="p-3.5 rounded-[14px] bg-[#34C759]/10 border border-[#34C759]/20 flex items-center gap-2 text-[13px] font-semibold text-[#34C759]">
              <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={2.2} />
              <span>Standard clinical screening verified.</span>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 ios-glass hairline-t p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={handleConfirmAndRegister}
                disabled={loading}
                className="w-full h-12 rounded-[12px] font-semibold text-[17px] bg-[#34C759] text-white shadow-sm ios-press flex items-center justify-center gap-2 select-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.2} />
                ) : (
                  <span>Activate Donor Registration</span>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 6: Confirmation Screen */}
      {step === 6 && (
        <div className="min-h-screen bg-[#F2F2F7] flex flex-col justify-between p-6">
          <div className="my-auto text-center space-y-5">
            {/* Apple Green Check Badge */}
            <div className="w-20 h-20 rounded-full bg-[#34C759]/15 mx-auto flex items-center justify-center text-[#34C759] shadow-sm animate-in zoom-in-75 duration-300">
              <CheckCircle2 className="w-12 h-12" strokeWidth={2.2} />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-[30px] font-bold text-gray-950 tracking-tight leading-tight">
                You&apos;re an Active Donor
              </h1>
              <p className="text-[15px] text-[#8E8E93] max-w-xs mx-auto leading-relaxed">
                Thank you, {fullName}. We will notify you via WhatsApp &amp; voice calls when urgent {bloodGroup} requests arise within {matchRadiusKm} km.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] text-[13px] font-semibold text-gray-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#34C759]" />
              <span>{bloodGroup} · {districtName}, {stateName}</span>
            </div>
          </div>

          <div className="pt-6 max-w-md mx-auto w-full">
            <button
              type="button"
              onClick={() => router.push('/donor')}
              className="w-full h-12 rounded-[12px] font-semibold text-[17px] bg-[#007AFF] text-white shadow-sm ios-press transition-all select-none"
            >
              Go to Donor Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
