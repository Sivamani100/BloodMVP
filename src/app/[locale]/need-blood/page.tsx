'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { WizardHeader } from '@/components/ui/WizardHeader';
import { BloodGroup } from '@/lib/constants';
import {
  CupertinoChevronRight,
  CupertinoInfoCircleFill,
  CupertinoDropFill,
  CupertinoCheckmark,
} from '@/components/ui/CupertinoIcons';
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

  // Wizard Step:
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
    <div className="w-full min-h-screen bg-white pb-24 text-gray-900">
      {/* Step 1: Patient Blood Group */}
      {step === 1 && (
        <>
          <WizardHeader
            title="Step 1 of 5"
            onBack={() => router.push('/')}
            progressPercent={20}
          />
          <div className="max-w-md mx-auto px-5 pt-6 pb-28 space-y-6">
            {/* Center Aligned Headline & Subheading */}
            <div className="text-center max-w-sm mx-auto space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200/70 text-xs font-black text-[#E11D48] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
                Emergency Blood Matching
              </div>
              <h1 className="text-2xl sm:text-[30px] font-black text-gray-950 tracking-tight leading-tight">
                What is the blood group of the patient?
              </h1>
              <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed px-1">
                We&apos;ll search banks and donors with a matching or compatible group.
              </p>
            </div>

            {/* Cool Apple Health Squircles: 4x2 Blood Groups Grid */}
            <div className="grid grid-cols-4 gap-3 pt-1">
              {[
                { group: 'O+', type: 'Common', desc: '40% Need' },
                { group: 'O-', type: 'Universal', desc: 'Universal' },
                { group: 'A+', type: 'Common', desc: 'Frequent' },
                { group: 'A-', type: 'Rare', desc: 'High Demand' },
                { group: 'B+', type: 'Common', desc: 'Frequent' },
                { group: 'B-', type: 'Rare', desc: 'High Demand' },
                { group: 'AB+', type: 'Rare', desc: 'Universal Rx' },
                { group: 'AB-', type: 'Rarest', desc: 'Critical Need' },
              ].map((item) => {
                const isSelected = bloodGroup === item.group;
                return (
                  <button
                    key={item.group}
                    type="button"
                    onClick={() => setBloodGroup(item.group as BloodGroup)}
                    className={`group relative min-h-[104px] p-2.5 rounded-[26px] flex flex-col items-center justify-between transition-all duration-200 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#FF2D55] via-[#E11D48] to-[#9F1239] text-white shadow-[0_12px_28px_rgba(225,29,72,0.38)] scale-[1.04] ring-4 ring-rose-500/20'
                        : 'bg-white border-2 border-gray-100 hover:border-rose-200 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md active:scale-95 text-gray-900'
                    }`}
                  >
                    {/* Top status pip */}
                    <div className="w-full flex justify-center">
                      <span
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          isSelected ? 'bg-white scale-125' : 'bg-gray-200 group-hover:bg-rose-300'
                        }`}
                      />
                    </div>

                    {/* Blood Group Letter */}
                    <span
                      className={`text-3xl font-black tracking-tight leading-none my-1 transition-colors ${
                        isSelected ? 'text-white' : 'text-gray-950 group-hover:text-[#E11D48]'
                      }`}
                    >
                      {item.group}
                    </span>

                    {/* Bottom Pill Badge */}
                    <span
                      className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full leading-tight transition-all ${
                        isSelected
                          ? 'bg-white/25 text-white'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-rose-50 group-hover:text-rose-600'
                      }`}
                    >
                      {item.type}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Clinical Compatibility Card */}
            {bloodGroup && (
              <div className="rounded-[24px] bg-gradient-to-r from-rose-50/90 via-rose-50/60 to-white border border-rose-200/80 p-4 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(225,29,72,0.04)] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#E11D48] text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
                    {bloodGroup}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-black text-gray-950">
                      {bloodGroup === 'O-'
                        ? 'Universal Red Cell Donor'
                        : bloodGroup === 'AB+'
                        ? 'Universal Blood Recipient'
                        : `${bloodGroup} Patient Group`}
                    </div>
                    <div className="text-xs text-gray-600 font-medium leading-tight">
                      {bloodGroup === 'O-' && 'Can accept red cells exclusively from O- donors.'}
                      {bloodGroup === 'O+' && 'Compatible donors: O+ and O-'}
                      {bloodGroup === 'A+' && 'Compatible donors: A+, A-, O+, O-'}
                      {bloodGroup === 'A-' && 'Compatible donors: A- and O-'}
                      {bloodGroup === 'B+' && 'Compatible donors: B+, B-, O+, O-'}
                      {bloodGroup === 'B-' && 'Compatible donors: B- and O-'}
                      {bloodGroup === 'AB+' && 'Can accept red cells from any blood group.'}
                      {bloodGroup === 'AB-' && 'Compatible donors: AB-, A-, B-, O-'}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/70">
                  <CupertinoCheckmark className="w-4 h-4 text-emerald-600 stroke-[3]" />
                </div>
              </div>
            )}

            {/* Helper Button */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setBloodGroup('O+');
                  alert(
                    'Hospital and blood bank teams will verify and cross-match before transfusion. If completely unknown, O- is the universal donor group.'
                  );
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/80 hover:bg-gray-200/80 text-xs font-bold text-gray-700 transition-all cursor-pointer active:scale-95"
              >
                <CupertinoInfoCircleFill className="w-4 h-4 text-gray-500" />
                <span>Not sure which group?</span>
              </button>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-black/[0.06] p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!bloodGroup}
                className={`w-full h-15 sm:h-16 rounded-[24px] font-black text-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                  bloodGroup
                    ? 'bg-gradient-to-r from-[#FF2D55] via-[#E11D48] to-[#9F1239] text-white shadow-[0_10px_25px_rgba(225,29,72,0.35)] hover:opacity-95 active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Continue</span>
                <CupertinoChevronRight className="w-5 h-5 text-white stroke-[3.2]" />
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
          <div className="max-w-md mx-auto px-5 pt-4 space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-950 tracking-tight leading-tight">
                  Share patient&apos;s location
                </h1>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  We use it to find real blood banks and donors within range — nothing is stored or shared.
                </p>
              </div>
              <button
                type="button"
                onClick={playAudioSummary}
                className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 shrink-0 mt-1 transition-colors"
                aria-label="Listen"
              >
                <Volume2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Dropdown pickers */}
            <div className="space-y-3 pt-2">
              <div>
                <select
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full py-4 px-4 bg-[#F9FAFB] border border-gray-200/90 rounded-2xl text-base font-semibold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer"
                >
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Maharashtra">Maharashtra</option>
                </select>
              </div>

              <div>
                <select
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  className="w-full py-4 px-4 bg-[#F9FAFB] border border-gray-200/90 rounded-2xl text-base font-semibold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer"
                >
                  <option value="East Godavari">East Godavari</option>
                  <option value="Kakinada">Kakinada</option>
                  <option value="Konaseema">Konaseema</option>
                  <option value="West Godavari">West Godavari</option>
                  <option value="Visakhapatnam">Visakhapatnam</option>
                  <option value="Krishna">Krishna</option>
                  <option value="Guntur">Guntur</option>
                </select>
              </div>
            </div>

            {/* Location Notice Pill */}
            <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-rose-100 flex items-start gap-3 text-xs text-gray-800 leading-relaxed">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>
                We have added state &amp; district based on your shared location
              </span>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 active:scale-[0.99] transition-all"
              >
                Confirm
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
          <div className="max-w-md mx-auto px-5 pt-4 space-y-4">
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-950 tracking-tight leading-tight">
              Confirm the hospital patient is at
            </h1>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital by name"
                className="w-full py-3.5 pl-11 pr-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Hospital Cards List */}
            <div className="space-y-2.5 pt-1">
              {filteredHospitals.map((hosp) => {
                const isSelected = selectedHospital.id === hosp.id;
                return (
                  <button
                    key={hosp.id}
                    type="button"
                    onClick={() => setSelectedHospital(hosp)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${
                      isSelected
                        ? 'bg-[#FFF1F2] border border-rose-300 shadow-xs'
                        : 'bg-[#F9FAFB] border border-gray-200/80 hover:bg-gray-100/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`font-bold text-[15px] leading-snug ${
                          isSelected ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {hosp.name}
                      </span>
                      <span className="text-xs font-semibold text-gray-400 shrink-0 mt-0.5">
                        · ∧ {hosp.distanceKm} km
                      </span>
                    </div>

                    {isSelected && hosp.address && (
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        {hosp.address}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 active:scale-[0.99] transition-all"
              >
                Confirm
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

          {/* Top Interactive Map Preview */}
          <div className="relative w-full h-56 bg-slate-100 border-b border-gray-100 overflow-hidden">
            {/* Visual stylised map background */}
            <div className="absolute inset-0 opacity-80 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
              <svg className="w-full h-full opacity-40" viewBox="0 0 400 240">
                <path d="M0 60 Q 150 90 280 40 T 400 120" stroke="#CBD5E1" strokeWidth="4" fill="none" />
                <path d="M50 0 Q 120 120 200 180 T 360 240" stroke="#CBD5E1" strokeWidth="3" fill="none" />
                <path d="M180 80 Q 240 140 320 110" stroke="#CBD5E1" strokeWidth="6" fill="none" />
              </svg>
            </div>

            {/* Pins */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-36">
                {/* Best match pin */}
                <div className="absolute top-10 left-12 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-black">
                    🔴
                  </div>
                  <div className="w-2 h-1 bg-black/20 rounded-full mt-0.5 blur-xs" />
                </div>

                {/* Has stock pins */}
                <div className="absolute top-4 right-16 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px]">
                    🟢
                  </div>
                </div>

                <div className="absolute bottom-6 left-28 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px]">
                    🟢
                  </div>
                </div>

                <div className="absolute bottom-4 right-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-300 shadow-xs flex items-center justify-center text-[8px]">
                    ⚪
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Legend Pill */}
            <div className="absolute bottom-3 left-4 bg-white/95 backdrop-blur-xs border border-gray-200/80 rounded-full px-3 py-1.5 shadow-md flex items-center gap-2 text-[11px] font-semibold text-gray-700">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-600" /> Best match
              </span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600" /> Has stock
              </span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400" /> No stock
              </span>
            </div>

            <button
              type="button"
              onClick={() => alert('Map showing verified blood centres near Rajahmundry.')}
              className="absolute bottom-3 right-4 w-7 h-7 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Distance Filter Pills */}
          <div className="max-w-md mx-auto px-5 pt-4 space-y-4">
            <div className="flex items-center gap-2.5">
              {[25, 50, 100].map((radius) => (
                <button
                  key={radius}
                  type="button"
                  onClick={() => setSelectedRadius(radius)}
                  className={`py-2 px-5 rounded-full text-xs font-bold transition-all ${
                    selectedRadius === radius
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {radius} km
                </button>
              ))}
            </div>

            {/* Section Header */}
            <div>
              <h2 className="font-extrabold text-[15px] text-gray-900">
                Showing {banks.length > 0 ? banks.length : 44} Bank(s) · {bloodGroup} &amp; Compatible
              </h2>
            </div>

            {/* Blood Bank Cards */}
            <div className="space-y-3 pb-8">
              {(banks.length > 0 ? banks : DEFAULT_HOSPITALS.slice(0, 4)).map((bank: any, idx: number) => {
                const bName = bank.name;
                const bUnits = bank.units ?? (idx === 0 ? 7 : idx === 1 ? 45 : idx === 2 ? 43 : 22);
                const bType = idx % 2 === 0 ? 'Govt.' : 'Charitable/Vol';
                const bDist = bank.distance_km ? `${bank.distance_km} km` : `${(idx * 0.9 + 6.6).toFixed(1)} km`;

                return (
                  <div
                    key={bank.id || idx}
                    className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-3"
                  >
                    <div>
                      <h3 className="font-extrabold text-[15px] text-gray-900 leading-snug">
                        {bName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        East Godavari, {bDist}
                      </p>
                    </div>

                    {/* Chips Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        {bType}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        {bUnits} units
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        {bloodGroup}, {bloodGroup?.startsWith('O') ? 'O-' : 'A-'} +2
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
                        className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 shrink-0"
                        aria-label="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 shrink-0"
                        aria-label="Directions"
                      >
                        <Navigation className="w-4 h-4" />
                      </a>

                      <a
                        href={bank.phones?.[0] ? `tel:${bank.phones[0]}` : 'tel:108'}
                        className="grow h-11 rounded-xl border border-gray-200 bg-white font-bold text-sm text-gray-900 flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-[0.99] transition-all"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Bottom Bar: Search Donors Near You */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4">
            <div className="max-w-md mx-auto space-y-2 text-center">
              <p className="text-xs font-semibold text-gray-700">
                Are the blood banks too far?
              </p>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
              >
                <Radio className="w-5 h-5 animate-pulse" />
                <span>Search Donors Near You</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 5: Donors Found (Verification check) */}
      {step === 5 && (
        <>
          <WizardHeader
            title="Donors found"
            onBack={() => setStep(4)}
          />
          <div className="max-w-md mx-auto px-5 pt-4 space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight leading-tight">
                We found {matchedDonorsCount} donors
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Registered {bloodGroup} &amp; compatible donors within 100 km.
              </p>
            </div>

            {/* Overlapping Donor Avatars */}
            <div className="flex items-center -space-x-3 pt-2">
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm bg-rose-100 flex items-center justify-center font-bold text-rose-700 text-sm">
                SM
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm">
                TA
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">
                MA
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-sm">
                DT
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
                +{matchedDonorsCount - 4}
              </div>
            </div>

            {/* You're Already Verified Card */}
            <div className="p-5 rounded-3xl bg-[#F9FAFB] border border-gray-200/80 flex items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-gray-950">
                  You&apos;re already verified
                </h3>
                <p className="text-xs text-gray-500">
                  Signed in as 9849497911
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-xs font-bold text-red-600 hover:text-red-700 pt-1"
                >
                  Change Number
                </button>
              </div>

              {/* Sparkly Checkmark Badge */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 absolute top-0 right-1" />
                <Sparkles className="w-3 h-3 text-emerald-500 absolute bottom-1 left-0" />
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setStep(6)}
                className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 active:scale-[0.99] transition-all"
              >
                Continue now
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
          <div className="max-w-md mx-auto px-5 pt-4 space-y-5">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-950 tracking-tight leading-tight">
                A few details about the patient
              </h1>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                A detailed request is far more likely to invite a donor.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Patient name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Sahib Singh"
                  className="w-full py-3.5 px-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl text-base font-medium text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="e.g. 34"
                  className="w-full py-3.5 px-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl text-base font-medium text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Gender
                </label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full py-3.5 px-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl text-base font-medium text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Number of units required
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={unitsRequired}
                  onChange={(e) => setUnitsRequired(parseInt(e.target.value, 10) || 1)}
                  placeholder="e.g. 2"
                  className="w-full py-3.5 px-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl text-base font-medium text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setStep(7)}
                className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 active:scale-[0.99] transition-all"
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
            title="Send request"
            onBack={() => setStep(6)}
            progressPercent={90}
          />
          <div className="max-w-md mx-auto px-5 pt-4 space-y-4">
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-950 tracking-tight leading-tight">
              Message request to donor
            </h1>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            {/* Generated Message Card */}
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200/80 space-y-2 relative">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                YOUR MESSAGE
              </div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pr-10">
                I urgently need {bloodGroup} blood (compatible groups also accepted: A-, O+, O-) — {unitsRequired} units required. Patient is at {selectedHospital.name}. Please help if you can.
              </p>
              <button
                type="button"
                onClick={playAudioSummary}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                aria-label="Play audio"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Custom note textarea with camera & mic icons */}
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-200/80 space-y-3">
              <textarea
                rows={3}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="What happened?"
                className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-hidden resize-none"
              />
              <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => alert('Camera upload: You can attach patient requisition slip for faster donor trust.')}
                  className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  aria-label="Upload photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => alert('Microphone recording: Record a quick voice message for nearby donors.')}
                  className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  aria-label="Record voice"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {['Accident', 'Disease', 'Critical', 'Surgery', 'Childbirth'].map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => handleReasonSelect(reason)}
                    className={`py-2 px-4 rounded-full text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                        : 'bg-[#F9FAFB] border border-gray-200/80 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 p-4">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={handleSendRequest}
                disabled={submitting}
                className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Send to {matchedDonorsCount} donors</span>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 8: Sending Transition Screen */}
      {step === 8 && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-6 shadow-sm animate-bounce">
            <Send className="w-9 h-9 fill-rose-600 text-rose-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-950">
            Sending...
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Notifying {matchedDonorsCount} donor(s) near you...
          </p>
        </div>
      )}
    </div>
  );
}
