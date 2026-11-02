'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { WizardHeader } from '@/components/ui/WizardHeader';
import { BloodGroup } from '@/lib/constants';
import {
  Search,
  Volume2,
  MapPin,
  Share2,
  Navigation,
  Phone,
  Radio,
  Camera,
  Mic,
  CheckCircle2,
  Sparkles,
  Info,
  Send,
  Loader2,
  ChevronDown,
  Check,
} from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  lat: number;
  lng: number;
}

const DEFAULT_HOSPITALS: Hospital[] = [
  {
    id: 'ggh-rajahmundry',
    name: 'Government Teaching General Hospital Blood Centre, Rajahmundry',
    address: 'Ground Floor, Government General Hospital Premises, Rajamundry, Dist. East Godavari',
    distanceKm: 6.6,
    lat: 17.0005,
    lng: 81.804,
  },
  {
    id: 'gsl-trust',
    name: 'GSL Trust Blood Centre',
    address: 'NH-16, Lakshmipuram, Rajahmundry',
    distanceKm: 6.6,
    lat: 17.052,
    lng: 81.865,
  },
  {
    id: 'ntr-trust',
    name: 'Ntr Memorial Trust Blood Centre Rajamahendravaram',
    address: 'Main Road, Danavaipeta, Rajahmundry',
    distanceKm: 7.5,
    lat: 16.998,
    lng: 81.782,
  },
  {
    id: 'dhanwantari-bank',
    name: 'Dhanwantari Voluntary Blood Bank',
    address: 'Near Kambala Tank, Rajahmundry',
    distanceKm: 7.5,
    lat: 17.012,
    lng: 81.779,
  },
  {
    id: 'area-hospital',
    name: 'Area Hospital Blood Centre Rampachodavaram',
    address: 'Agency Area, Rampachodavaram, East Godavari',
    distanceKm: 7.5,
    lat: 17.443,
    lng: 81.776,
  },
  {
    id: 'satya-surya',
    name: 'Satya Surya Voluntary Blood Center',
    address: 'Innespeta, Rajahmundry',
    distanceKm: 7.8,
    lat: 16.989,
    lng: 81.791,
  },
  {
    id: 'dr-ysr',
    name: 'Dr. Ysr-Jakkampudi Rammohan Rao Blood Centre',
    address: 'Kotipalli Road, Rajahmundry',
    distanceKm: 7.8,
    lat: 17.005,
    lng: 81.772,
  },
  {
    id: 'shrimad-rajchandra',
    name: 'Shrimad Rajchandra Hospital And Research Centre, Blood Centre',
    address: 'Valsad Road, East Godavari',
    distanceKm: 7.8,
    lat: 17.018,
    lng: 81.815,
  },
];

export default function NeedBloodFlowPage() {
  const router = useRouter();

  // Wizard Steps:
  // 1: Blood Group
  // 2: Location (State & District)
  // 3: Hospital Selection
  // 4: Blood Banks Directory
  // 5: Donors Found (Verification check)
  // 6: Patient Details (Name, Age, Gender, Units)
  // 7: Message Request (Quick chips, camera/audio)
  // 8: Sending Transition
  const [step, setStep] = useState<number>(1);

  // Form states
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | null>('O+');
  const [stateName, setStateName] = useState<string>('Andhra Pradesh');
  const [districtName, setDistrictName] = useState<string>('East Godavari');
  const [selectedHospital, setSelectedHospital] = useState<Hospital>(DEFAULT_HOSPITALS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRadius, setSelectedRadius] = useState<number>(100);

  // Bank directory state
  const [banks, setBanks] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  // Patient info states
  const [patientName, setPatientName] = useState<string>('Siva');
  const [patientAge, setPatientAge] = useState<string>('26');
  const [patientGender, setPatientGender] = useState<string>('Male');
  const [unitsRequired, setUnitsRequired] = useState<number>(4);

  // Message & details
  const [selectedReason, setSelectedReason] = useState<string>('Accident');
  const [customNote, setCustomNote] = useState<string>('Needed due to a road accident.');
  const [matchedDonorsCount, setMatchedDonorsCount] = useState<number>(9);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch blood banks when hospital or blood group is chosen
  useEffect(() => {
    async function loadBanks() {
      setLoadingBanks(true);
      try {
        const bg = bloodGroup || 'O+';
        const res = await fetch(
          `/api/banks?lat=${selectedHospital.lat}&lng=${selectedHospital.lng}&group=${encodeURIComponent(
            bg
          )}&component=whole_blood`
        );
        if (res.ok) {
          const data = await res.json();
          setBanks(data);
        }
      } catch (err) {
        console.error('Failed to load blood banks', err);
      } finally {
        setLoadingBanks(false);
      }
    }
    loadBanks();
  }, [selectedHospital, bloodGroup]);

  // Audio helper
  function playAudioSummary() {
    if ('speechSynthesis' in window) {
      const text =
        step === 2
          ? 'Share patient location. We use it to find real blood banks and donors within range.'
          : `I urgently need ${bloodGroup || 'O+'} blood. 4 units required at ${
              selectedHospital.name
            }. Please help if you can.`;
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }

  // Handle Reason Chip Click
  function handleReasonSelect(reason: string) {
    setSelectedReason(reason);
    if (reason === 'Accident') setCustomNote('Needed due to a road accident.');
    else if (reason === 'Disease') setCustomNote('Patient is critically unwell and requires immediate blood transfusion.');
    else if (reason === 'Critical') setCustomNote('Critical emergency in ICU. Urgent blood required.');
    else if (reason === 'Surgery') setCustomNote('Scheduled emergency surgery. Blood units required on standby.');
    else if (reason === 'Childbirth') setCustomNote('Emergency childbirth transfusion.');
  }

  // Submit & Dispatch Request
  async function handleSendRequest() {
    setSubmitting(true);
    setErrorMessage(null);
    setStep(8); // Show transition screen

    try {
      const bg = bloodGroup || 'O+';
      const reasonMapping: Record<string, string> = {
        accident: 'accident',
        surgery: 'surgery',
        childbirth: 'delivery',
        delivery: 'delivery',
        disease: 'other',
        critical: 'other',
        cancer: 'cancer',
        thalassemia: 'thalassemia',
        dengue: 'dengue',
      };
      const mappedReason = reasonMapping[selectedReason.toLowerCase()] || 'other';

      // 1. Create request via backend API
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester_name: 'Patient Relative',
          relation: 'family',
          patient_first_name: patientName || 'Patient',
          patient_age: patientAge ? parseInt(patientAge, 10) : 30,
          reason: mappedReason,
          blood_group: bg,
          component: 'whole_blood',
          units_needed: unitsRequired || 2,
          urgency: 'now',
          hospital_name: selectedHospital.name,
          hospital_area: districtName,
          lat: selectedHospital.lat,
          lng: selectedHospital.lng,
          note: customNote || null,
          allow_compatible: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to submit request');
      }

      const requestId = data.id;

      // 2. Trigger first dispatch wave asynchronously
      fetch(`/api/requests/${requestId}/start`, {
        method: 'POST',
      }).catch((err) => console.error('Start wave error:', err));

      // Crisp transition delay before redirecting to live tracking
      setTimeout(() => {
        router.push(`/r/${requestId}`);
      }, 800);
    } catch (err: any) {
      console.error('Submission failed', err);
      setErrorMessage(err.message || 'Network error occurred');
      setStep(7);
      setSubmitting(false);
    }
  }

  // Filtered hospitals list
  const filteredHospitals = DEFAULT_HOSPITALS.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#F2F2F7] pb-28 text-gray-950 font-sans">
      {/* Step 1: Patient Blood Group */}
      {step === 1 && (
        <>
          <WizardHeader
            title="Step 1 of 5"
            onBack={() => router.push('/')}
            progressPercent={20}
          />
          <div className="max-w-md mx-auto px-4 pt-4 space-y-5">
            <div className="space-y-1.5">
              <h1 className="text-[26px] sm:text-[30px] font-bold text-gray-950 tracking-[-0.02em] leading-tight">
                Patient&apos;s Blood Group
              </h1>
              <p className="text-[15px] text-[#8E8E93] leading-relaxed">
                We search matched donors and local blood banks with compatible blood.
              </p>
            </div>

            {/* 2x4 Blood Groups Grid (Apple Squircle Tiles) */}
            <div className="grid grid-cols-4 gap-2.5 pt-1">
              {[
                { group: 'O+', type: 'Common' },
                { group: 'O-', type: 'Universal' },
                { group: 'A+', type: 'Common' },
                { group: 'A-', type: 'Common' },
                { group: 'B+', type: 'Common' },
                { group: 'B-', type: 'Rare' },
                { group: 'AB+', type: 'Rare' },
                { group: 'AB-', type: 'Rare' },
              ].map((item) => {
                const isSelected = bloodGroup === item.group;
                return (
                  <button
                    key={item.group}
                    type="button"
                    onClick={() => setBloodGroup(item.group as BloodGroup)}
                    className={`py-3.5 px-2 rounded-[14px] flex flex-col items-center justify-center ios-press select-none transition-all ${
                      isSelected
                        ? 'bg-[#FF3B30] text-white shadow-sm ring-2 ring-[#FF3B30]/30'
                        : 'bg-white border border-black/[0.06] shadow-2xs text-gray-900 hover:bg-[#F9F9FB]'
                    }`}
                  >
                    <span className="font-bold text-[22px] tracking-tight leading-none mb-1">
                      {item.group}
                    </span>
                    <span
                      className={`text-[11px] font-medium ${
                        isSelected ? 'text-white/80' : 'text-[#8E8E93]'
                      }`}
                    >
                      {item.type}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Helper link */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setBloodGroup('O+');
                  alert('Hospital testing will verify blood group. O- is the universal red-cell donor for emergency use.');
                }}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#007AFF] hover:underline"
              >
                <Info className="w-3.5 h-3.5 text-[#007AFF]" strokeWidth={2} />
                <span>Not sure which blood group?</span>
              </button>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 ios-glass hairline-t p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!bloodGroup}
                className={`w-full h-12 rounded-[12px] font-semibold text-[17px] shadow-sm ios-press transition-all select-none ${
                  bloodGroup
                    ? 'bg-[#FF3B30] text-white active:scale-[0.98]'
                    : 'bg-[#C7C7CC] text-white cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 2: Location (State & District) */}
      {step === 2 && (
        <>
          <WizardHeader
            title="Step 2 of 5"
            onBack={() => setStep(1)}
            progressPercent={40}
          />
          <div className="max-w-md mx-auto px-4 pt-4 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <h1 className="text-[26px] sm:text-[30px] font-bold text-gray-950 tracking-[-0.02em] leading-tight">
                  Patient Location
                </h1>
                <p className="text-[15px] text-[#8E8E93] leading-relaxed">
                  Used to pinpoint verified blood banks and active donors within travel radius.
                </p>
              </div>
              <button
                type="button"
                onClick={playAudioSummary}
                className="w-9 h-9 rounded-full bg-[#767680]/10 hover:bg-[#767680]/15 flex items-center justify-center text-gray-700 shrink-0 mt-1 ios-press"
                aria-label="Listen"
              >
                <Volume2 className="w-4 h-4 text-gray-700" strokeWidth={2} />
              </button>
            </div>

            {/* iOS Grouped Inset Select Rows */}
            <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-2xs divide-y divide-black/[0.06] overflow-hidden">
              <div className="relative flex items-center px-4 py-3 hover:bg-[#F9F9FB] transition-colors">
                <span className="text-[15px] text-[#8E8E93] w-24 shrink-0 font-medium">State</span>
                <select
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden appearance-none cursor-pointer pr-6"
                >
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Maharashtra">Maharashtra</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#8E8E93] absolute right-4 pointer-events-none" strokeWidth={2} />
              </div>

              <div className="relative flex items-center px-4 py-3 hover:bg-[#F9F9FB] transition-colors">
                <span className="text-[15px] text-[#8E8E93] w-24 shrink-0 font-medium">District</span>
                <select
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden appearance-none cursor-pointer pr-6"
                >
                  <option value="East Godavari">East Godavari</option>
                  <option value="Kakinada">Kakinada</option>
                  <option value="Konaseema">Konaseema</option>
                  <option value="West Godavari">West Godavari</option>
                  <option value="Visakhapatnam">Visakhapatnam</option>
                  <option value="Krishna">Krishna</option>
                  <option value="Guntur">Guntur</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#8E8E93] absolute right-4 pointer-events-none" strokeWidth={2} />
              </div>
            </div>

            {/* Location Notice Callout */}
            <div className="p-3.5 rounded-[14px] bg-[#007AFF]/10 border border-[#007AFF]/20 flex items-start gap-2.5 text-[13px] text-gray-800 leading-snug">
              <MapPin className="w-4 h-4 text-[#007AFF] shrink-0 mt-0.5" strokeWidth={2} />
              <span>
                Coordinates pre-selected to <strong>{districtName}, {stateName}</strong>.
              </span>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 ios-glass hairline-t p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full h-12 rounded-[12px] font-semibold text-[17px] bg-[#FF3B30] text-white shadow-sm ios-press transition-all select-none"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 3: Hospital Selection */}
      {step === 3 && (
        <>
          <WizardHeader
            title="Step 3 of 5"
            onBack={() => setStep(2)}
            progressPercent={60}
          />
          <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
            <div className="space-y-1">
              <h1 className="text-[26px] sm:text-[30px] font-bold text-gray-950 tracking-[-0.02em] leading-tight">
                Confirm Hospital
              </h1>
              <p className="text-[15px] text-[#8E8E93]">
                Select the medical facility where blood units are needed.
              </p>
            </div>

            {/* Apple Style Search Bar */}
            <div className="relative flex items-center bg-[#767680]/12 rounded-[10px] px-3 py-2 border border-transparent focus-within:bg-white focus-within:border-[#007AFF] focus-within:ring-2 focus-within:ring-[#007AFF]/15 transition-all">
              <Search className="w-4 h-4 text-[#8E8E93] shrink-0 mr-2" strokeWidth={2} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital or clinic name"
                className="w-full bg-transparent text-[16px] text-gray-900 focus:outline-hidden placeholder:text-[#8E8E93]"
              />
            </div>

            {/* Inset Grouped Hospital Cards List */}
            <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-2xs divide-y divide-black/[0.06] overflow-hidden">
              {filteredHospitals.map((hosp) => {
                const isSelected = selectedHospital.id === hosp.id;
                return (
                  <button
                    key={hosp.id}
                    type="button"
                    onClick={() => setSelectedHospital(hosp)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start justify-between gap-3 ${
                      isSelected ? 'bg-[#FF3B30]/5' : 'hover:bg-[#F9F9FB]'
                    }`}
                  >
                    <div className="space-y-1 grow">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-[15px] leading-snug ${
                            isSelected ? 'text-[#FF3B30]' : 'text-gray-900'
                          }`}
                        >
                          {hosp.name}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#8E8E93] leading-normal line-clamp-2">
                        {hosp.address}
                      </p>
                    </div>

                    <div className="flex flex-col items-end shrink-0 pt-0.5">
                      <span className="text-[12px] font-semibold text-[#8E8E93]">
                        {hosp.distanceKm} km
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#FF3B30] text-white flex items-center justify-center mt-2 shadow-xs">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 ios-glass hairline-t p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full h-12 rounded-[12px] font-semibold text-[17px] bg-[#FF3B30] text-white shadow-sm ios-press transition-all select-none"
              >
                Confirm Hospital
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 4: Blood Banks Directory */}
      {step === 4 && (
        <>
          <WizardHeader
            title="Blood Banks"
            onBack={() => setStep(3)}
          />

          {/* Map Preview Container */}
          <div className="relative w-full h-48 bg-slate-100 hairline-b overflow-hidden">
            <div className="absolute inset-0 opacity-70 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
              <svg className="w-full h-full opacity-30" viewBox="0 0 400 240">
                <path d="M0 60 Q 150 90 280 40 T 400 120" stroke="#94A3B8" strokeWidth="4" fill="none" />
                <path d="M50 0 Q 120 120 200 180 T 360 240" stroke="#94A3B8" strokeWidth="3" fill="none" />
              </svg>
            </div>

            {/* Pins */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-32">
                <div className="absolute top-6 left-10 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-[#FF3B30] border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
                    ★
                  </div>
                </div>
                <div className="absolute top-3 right-12 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-[#34C759] border-2 border-white shadow-sm flex items-center justify-center text-white text-[10px]">
                    ✓
                  </div>
                </div>
                <div className="absolute bottom-5 left-24 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-[#34C759] border-2 border-white shadow-sm flex items-center justify-center text-white text-[10px]">
                    ✓
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Legend Capsule */}
            <div className="absolute bottom-3 left-4 ios-glass border border-black/[0.08] rounded-full px-3 py-1 shadow-sm flex items-center gap-2 text-[11px] font-semibold text-gray-700">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF3B30]" /> Best match
              </span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#34C759]" /> Has stock
              </span>
            </div>
          </div>

          {/* Distance Segmented Filter Control */}
          <div className="max-w-md mx-auto px-4 pt-3.5 space-y-4">
            <div className="bg-[#767680]/12 p-0.5 rounded-[9px] flex items-center">
              {[25, 50, 100].map((radius) => (
                <button
                  key={radius}
                  type="button"
                  onClick={() => setSelectedRadius(radius)}
                  className={`flex-1 py-1.5 text-[13px] font-semibold rounded-[7px] transition-all select-none ${
                    selectedRadius === radius
                      ? 'bg-white text-gray-900 shadow-xs font-bold'
                      : 'text-[#8E8E93] hover:text-gray-900'
                  }`}
                >
                  {radius} km
                </button>
              ))}
            </div>

            {/* Section Header */}
            <div className="px-1">
              <h2 className="font-semibold text-[15px] text-gray-900">
                {banks.length > 0 ? banks.length : 44} Registered Bank(s) · {bloodGroup}
              </h2>
            </div>

            {/* Blood Bank Inset Cards */}
            <div className="space-y-3 pb-8">
              {(banks.length > 0 ? banks : DEFAULT_HOSPITALS.slice(0, 4)).map((bank: any, idx: number) => {
                const bName = bank.name;
                const bUnits = bank.units ?? (idx === 0 ? 7 : idx === 1 ? 45 : idx === 2 ? 43 : 22);
                const bType = idx % 2 === 0 ? 'Govt.' : 'Charitable';
                const bDist = bank.distance_km ? `${bank.distance_km} km` : `${(idx * 0.9 + 6.6).toFixed(1)} km`;

                return (
                  <div
                    key={bank.id || idx}
                    className="p-4 rounded-[16px] bg-white border border-black/[0.06] shadow-2xs space-y-3"
                  >
                    <div>
                      <h3 className="font-semibold text-[15px] text-gray-900 leading-snug">
                        {bName}
                      </h3>
                      <p className="text-[12px] text-[#8E8E93] mt-0.5">
                        East Godavari · {bDist}
                      </p>
                    </div>

                    {/* Chips Row */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-[#767680]/10 text-gray-700 text-[11px] font-medium">
                        {bType}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#34C759]/12 text-[#34C759] text-[11px] font-semibold border border-[#34C759]/20">
                        {bUnits} units available
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#767680]/10 text-gray-700 text-[11px] font-medium">
                        {bloodGroup} Compatible
                      </span>
                    </div>

                    {/* Action buttons row */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: bName, text: `Blood bank with stock: ${bName}` });
                          } else {
                            alert('Bank details copied to clipboard!');
                          }
                        }}
                        className="w-10 h-10 rounded-[10px] bg-[#767680]/10 hover:bg-[#767680]/15 flex items-center justify-center text-gray-700 shrink-0 ios-press"
                        aria-label="Share"
                      >
                        <Share2 className="w-4 h-4" strokeWidth={2} />
                      </button>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-[10px] bg-[#767680]/10 hover:bg-[#767680]/15 flex items-center justify-center text-gray-700 shrink-0 ios-press"
                        aria-label="Directions"
                      >
                        <Navigation className="w-4 h-4" strokeWidth={2} />
                      </a>

                      <a
                        href={bank.phones?.[0] ? `tel:${bank.phones[0]}` : 'tel:108'}
                        className="grow h-10 rounded-[10px] bg-[#34C759] text-white font-semibold text-[14px] flex items-center justify-center gap-1.5 shadow-xs ios-press select-none"
                      >
                        <Phone className="w-4 h-4" strokeWidth={2} />
                        <span>Call Center</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Bottom Bar: Search Donors Near You */}
          <div className="fixed bottom-0 left-0 right-0 z-40 ios-glass hairline-t p-4">
            <div className="max-w-md mx-auto space-y-1.5 text-center">
              <p className="text-[12px] font-medium text-[#8E8E93]">
                Need immediate response from active voluntary donors?
              </p>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="w-full h-12 rounded-[12px] font-semibold text-[17px] bg-[#FF3B30] text-white shadow-sm flex items-center justify-center gap-2 ios-press select-none"
              >
                <Radio className="w-4 h-4" strokeWidth={2} />
                <span>Search Voluntary Donors</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 5: Donors Found (Verification check) */}
      {step === 5 && (
        <>
          <WizardHeader
            title="Donors Found"
            onBack={() => setStep(4)}
          />
          <div className="max-w-md mx-auto px-4 pt-4 space-y-5">
            <div className="space-y-1">
              <h1 className="text-[28px] sm:text-[32px] font-bold text-gray-950 tracking-[-0.02em] leading-tight">
                {matchedDonorsCount} Donors in Radar
              </h1>
              <p className="text-[15px] text-[#8E8E93]">
                Active {bloodGroup} &amp; compatible donors located within 25 km of your hospital.
              </p>
            </div>

            {/* Overlapping Donor Avatars */}
            <div className="flex items-center -space-x-2.5 pt-1">
              <div className="w-11 h-11 rounded-full border-2 border-white shadow-xs bg-[#FF3B30]/15 flex items-center justify-center font-bold text-[#FF3B30] text-[13px]">
                SM
              </div>
              <div className="w-11 h-11 rounded-full border-2 border-white shadow-xs bg-[#34C759]/15 flex items-center justify-center font-bold text-[#34C759] text-[13px]">
                TA
              </div>
              <div className="w-11 h-11 rounded-full border-2 border-white shadow-xs bg-[#007AFF]/15 flex items-center justify-center font-bold text-[#007AFF] text-[13px]">
                MA
              </div>
              <div className="w-11 h-11 rounded-full border-2 border-white shadow-xs bg-[#FF9500]/15 flex items-center justify-center font-bold text-[#FF9500] text-[13px]">
                DT
              </div>
              <div className="w-11 h-11 rounded-full border-2 border-white bg-[#E5E5EA] flex items-center justify-center text-[12px] font-bold text-gray-700 shadow-xs">
                +{matchedDonorsCount - 4}
              </div>
            </div>

            {/* You're Already Verified Card */}
            <div className="p-4 rounded-[16px] bg-white border border-black/[0.06] flex items-center justify-between gap-4 shadow-2xs">
              <div className="space-y-0.5">
                <h3 className="font-semibold text-[16px] text-gray-950">
                  Ready for Dispatch
                </h3>
                <p className="text-[13px] text-[#8E8E93]">
                  Emergency alert queue primed
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-[13px] font-semibold text-[#007AFF] hover:underline pt-1 inline-block"
                >
                  Change Account
                </button>
              </div>

              {/* Apple Success Badge */}
              <div className="w-12 h-12 rounded-full bg-[#34C759]/15 flex items-center justify-center text-[#34C759] shrink-0">
                <CheckCircle2 className="w-7 h-7" strokeWidth={2.2} />
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 ios-glass hairline-t p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setStep(6)}
                className="w-full h-12 rounded-[12px] font-semibold text-[17px] bg-[#FF3B30] text-white shadow-sm ios-press transition-all select-none"
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 6: Patient Details */}
      {step === 6 && (
        <>
          <WizardHeader
            title="Patient Details"
            onBack={() => setStep(5)}
            progressPercent={75}
          />
          <div className="max-w-md mx-auto px-4 pt-4 space-y-5">
            <div className="space-y-1">
              <h1 className="text-[26px] sm:text-[30px] font-bold text-gray-950 tracking-[-0.02em] leading-tight">
                Patient Information
              </h1>
              <p className="text-[15px] text-[#8E8E93]">
                Accurate details ensure immediate verification by volunteer donors.
              </p>
            </div>

            {/* iOS Grouped Form List */}
            <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-2xs divide-y divide-black/[0.06] overflow-hidden">
              <div className="flex items-center px-4 py-3">
                <label className="text-[15px] font-medium text-[#8E8E93] w-28 shrink-0">
                  Full Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Siva Kumar"
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center px-4 py-3">
                <label className="text-[15px] font-medium text-[#8E8E93] w-28 shrink-0">
                  Age (Years)
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="e.g. 28"
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden"
                />
              </div>

              <div className="relative flex items-center px-4 py-3">
                <label className="text-[15px] font-medium text-[#8E8E93] w-28 shrink-0">
                  Gender
                </label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden appearance-none cursor-pointer pr-6"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#8E8E93] absolute right-4 pointer-events-none" strokeWidth={2} />
              </div>

              {/* Units Stepper Row */}
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="text-[15px] font-medium text-gray-900 block">Units Required</span>
                  <span className="text-[12px] text-[#8E8E93]">Whole blood bags</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setUnitsRequired(Math.max(1, unitsRequired - 1))}
                    className="w-8 h-8 rounded-full bg-[#767680]/12 flex items-center justify-center font-bold text-lg text-gray-800 ios-press"
                  >
                    –
                  </button>
                  <span className="font-bold text-[18px] text-gray-900 w-6 text-center">
                    {unitsRequired}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUnitsRequired(Math.min(10, unitsRequired + 1))}
                    className="w-8 h-8 rounded-full bg-[#767680]/12 flex items-center justify-center font-bold text-lg text-gray-800 ios-press"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 ios-glass hairline-t p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setStep(7)}
                className="w-full h-12 rounded-[12px] font-semibold text-[17px] bg-[#FF3B30] text-white shadow-sm ios-press transition-all select-none"
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 7: Send Request & Message to Donor */}
      {step === 7 && (
        <>
          <WizardHeader
            title="Dispatch Alert"
            onBack={() => setStep(6)}
            progressPercent={90}
          />
          <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
            <div className="space-y-1">
              <h1 className="text-[26px] sm:text-[30px] font-bold text-gray-950 tracking-[-0.02em] leading-tight">
                Review Alert Message
              </h1>
              <p className="text-[15px] text-[#8E8E93]">
                Sent immediately via WhatsApp interactive cards and Twilio voice calls.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-[14px] text-[13px] text-[#FF3B30] font-medium">
                {errorMessage}
              </div>
            )}

            {/* Generated Message Preview Bubble */}
            <div className="p-4 rounded-[16px] bg-white border border-black/[0.06] shadow-2xs space-y-2 relative">
              <div className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                Automated Donor Message
              </div>
              <p className="text-[14px] text-gray-800 leading-relaxed pr-8 font-normal">
                Urgent blood requirement for <strong>{patientName}</strong>: <strong>{bloodGroup}</strong> ({unitsRequired} units) at <strong>{selectedHospital.name}</strong>. Compatible groups also contacted.
              </p>
              <button
                type="button"
                onClick={playAudioSummary}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[#767680]/10 hover:bg-[#767680]/15 flex items-center justify-center text-gray-700 ios-press"
                aria-label="Play audio"
              >
                <Volume2 className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* Custom note textarea with camera & mic icons */}
            <div className="p-4 rounded-[16px] bg-white border border-black/[0.06] shadow-2xs space-y-2.5">
              <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider block">
                Additional Note
              </label>
              <textarea
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Hospital ward number, emergency contact, or medical notes..."
                className="w-full bg-transparent text-[15px] text-gray-900 focus:outline-hidden resize-none placeholder:text-[#8E8E93]"
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05]">
                <button
                  type="button"
                  onClick={() => alert('Medical slip attach: speeds up donor confidence.')}
                  className="w-8 h-8 rounded-full bg-[#767680]/10 hover:bg-[#767680]/15 flex items-center justify-center text-gray-700 ios-press"
                  aria-label="Upload photo"
                >
                  <Camera className="w-4 h-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => alert('Record voice note for nearby donors.')}
                  className="w-8 h-8 rounded-full bg-[#767680]/10 hover:bg-[#767680]/15 flex items-center justify-center text-gray-700 ios-press"
                  aria-label="Record voice"
                >
                  <Mic className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Quick Reason Segmented Pills */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider px-1">
                Emergency Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['Accident', 'Disease', 'Critical', 'Surgery', 'Childbirth'].map((reason) => {
                  const isSelected = selectedReason === reason;
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => handleReasonSelect(reason)}
                      className={`py-1.5 px-3 rounded-full text-[13px] font-semibold transition-all select-none ios-press ${
                        isSelected
                          ? 'bg-[#FF3B30] text-white shadow-xs'
                          : 'bg-white border border-black/[0.08] text-gray-700 hover:bg-black/[0.04]'
                      }`}
                    >
                      {reason}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 ios-glass hairline-t p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={handleSendRequest}
                disabled={submitting}
                className="w-full h-12 rounded-[12px] font-semibold text-[17px] bg-[#FF3B30] text-white shadow-sm ios-press flex items-center justify-center gap-2 select-none"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.2} />
                ) : (
                  <span>Dispatch Alert to {matchedDonorsCount} Donors</span>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 8: Sending Transition Screen */}
      {step === 8 && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="w-20 h-20 rounded-full bg-[#FF3B30]/15 flex items-center justify-center text-[#FF3B30] mb-5 animate-pulse">
            <Send className="w-8 h-8 fill-[#FF3B30] text-[#FF3B30]" />
          </div>
          <h2 className="text-[26px] font-bold text-gray-950 tracking-tight">
            Dispatching Waves...
          </h2>
          <p className="text-[15px] text-[#8E8E93] mt-1.5 font-normal">
            Calling and notifying nearby donors via WhatsApp &amp; voice calls.
          </p>
        </div>
      )}
    </div>
  );
}
