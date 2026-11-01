'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { BLOOD_GROUPS, BloodGroup, BLOOD_COMPONENTS, BloodComponent, URGENCY_LEVELS, UrgencyLevel } from '@/lib/constants';
import { LocationPicker } from '@/components/map/LocationPicker';
import { ArrowRight, Phone, Navigation, ShieldCheck, AlertCircle, Building2 } from 'lucide-react';

export default function NeedBloodWizard() {
  const t = useTranslations('req');
  const tBanks = useTranslations('banks');
  const router = useRouter();

  // Wizard state
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | 'unknown'>('O+');
  const [component, setComponent] = useState<BloodComponent>('whole_blood');
  const [units, setUnits] = useState<number>(1);
  const [urgency, setUrgency] = useState<UrgencyLevel>('now');

  // Location state
  const [lat, setLat] = useState<number>(17.0005);
  const [lng, setLng] = useState<number>(81.804);
  const [hospitalName, setHospitalName] = useState<string>('Government General Hospital');
  const [hospitalArea, setHospitalArea] = useState<string>('Rajahmundry');

  // Nearby banks
  const [banks, setBanks] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState<boolean>(false);

  useEffect(() => {
    async function fetchBanks() {
      setLoadingBanks(true);
      try {
        const bgParam = bloodGroup === 'unknown' ? 'O+' : bloodGroup;
        const res = await fetch(`/api/banks?lat=${lat}&lng=${lng}&group=${encodeURIComponent(bgParam)}&component=${component}`);
        if (res.ok) {
          const data = await res.json();
          setBanks(data);
        }
      } catch (err) {
        console.error('Failed to fetch blood banks:', err);
      } finally {
        setLoadingBanks(false);
      }
    }

    fetchBanks();
  }, [lat, lng, bloodGroup, component]);

  function handleContinueToDetails() {
    if (bloodGroup === 'unknown') {
      alert(t('dont_know_help'));
      return;
    }

    // Save wizard draft into sessionStorage
    const draft = {
      blood_group: bloodGroup,
      component,
      units_needed: units,
      urgency,
      hospital_name: hospitalName,
      hospital_area: hospitalArea,
      lat,
      lng,
    };
    sessionStorage.setItem('blood_request_draft', JSON.stringify(draft));
    router.push('/need-blood/details');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
          Find Blood Donors
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Select blood details and location to check local blood banks and alert nearby donors.
        </p>
      </div>

      {/* 1. Blood Group */}
      <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <label className="block text-sm font-bold text-gray-900">
          {t('blood_group')}
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => setBloodGroup(bg)}
              className={`py-3 rounded-xl font-black text-lg transition-all ${
                bloodGroup === bg
                  ? 'bg-blood-600 text-white shadow-md shadow-blood-600/30 ring-2 ring-blood-600 ring-offset-2'
                  : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {bg}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setBloodGroup('unknown')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
            bloodGroup === 'unknown'
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'text-gray-500 hover:text-gray-700 border-gray-200'
          }`}
        >
          {t('dont_know_group')}
        </button>
        {bloodGroup === 'unknown' && (
          <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t('dont_know_help')}</span>
          </p>
        )}
      </div>

      {/* 2. Component & Units */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <label className="block text-sm font-bold text-gray-900">
            {t('component')}
          </label>
          <select
            value={component}
            onChange={(e) => setComponent(e.target.value as BloodComponent)}
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-blood-500"
          >
            <option value="whole_blood">{t('component_whole_blood')}</option>
            <option value="red_cells">{t('component_red_cells')}</option>
            <option value="platelets">{t('component_platelets')}</option>
            <option value="plasma">{t('component_plasma')}</option>
          </select>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <label className="block text-sm font-bold text-gray-900">
            {t('units')} ({units})
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setUnits(num)}
                className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                  units === num
                    ? 'bg-blood-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Urgency */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <label className="block text-sm font-bold text-gray-900">
          {t('urgency')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {URGENCY_LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setUrgency(lvl)}
              className={`p-3 rounded-xl font-semibold text-xs sm:text-sm text-center transition-all ${
                urgency === lvl
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {t(`urgency_${lvl}` as any)}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Location Picker */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <label className="block text-sm font-bold text-gray-900">
          {t('hospital')} Location
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
          <input
            type="text"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            placeholder="Hospital name (required)"
            className="p-2.5 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500 font-medium"
          />
          <input
            type="text"
            value={hospitalArea}
            onChange={(e) => setHospitalArea(e.target.value)}
            placeholder="Area / landmark"
            className="p-2.5 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500 font-medium"
          />
        </div>
        <LocationPicker
          initialLat={lat}
          initialLng={lng}
          onLocationSelect={(newLat, newLng, placeName) => {
            setLat(newLat);
            setLng(newLng);
            if (placeName && !hospitalName) {
              setHospitalName(placeName.split(',')[0]);
            }
          }}
        />
      </div>

      {/* 5. Nearest Blood Banks directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blood-600" />
            <h2 className="text-lg font-bold text-gray-900">{tBanks('title')}</h2>
          </div>
          <span className="text-xs text-gray-500">Call before going</span>
        </div>

        <div className="space-y-3">
          {banks.map((b) => (
            <div
              key={b.id}
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-sm">{b.name}</h3>
                  {b.is_24x7 && (
                    <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-sm">
                      24×7
                    </span>
                  )}
                  {b.trust_score >= 80 && (
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-sm">
                      Reliable
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{b.address || b.city}</p>

                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span className="font-semibold text-gray-800">
                    {b.units !== null ? `${b.units} units (${bloodGroup})` : 'Stock: Call to verify'}
                  </span>
                  <span className="text-gray-400">·</span>
                  <span
                    className={`font-medium ${
                      b.freshness === 'green'
                        ? 'text-emerald-700'
                        : b.freshness === 'yellow'
                        ? 'text-amber-700'
                        : 'text-gray-500'
                    }`}
                  >
                    {b.minutes_ago ? `${b.minutes_ago} min ago` : 'Freshness: call'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {b.phones?.[0] && (
                  <a
                    href={`tel:${b.phones[0]}`}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.name + ' ' + b.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Map</span>
                </a>
              </div>
            </div>
          ))}
          {banks.length === 0 && !loadingBanks && (
            <p className="text-sm text-gray-500 text-center py-4">No blood banks recorded within 100 km.</p>
          )}
        </div>
      </div>

      {/* Continue CTA */}
      <div className="pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleContinueToDetails}
          disabled={bloodGroup === 'unknown' || !hospitalName.trim()}
          className="w-full flex items-center justify-center gap-2 bg-blood-600 hover:bg-blood-700 text-white font-extrabold text-lg py-4 px-6 rounded-2xl shadow-lg shadow-blood-600/30 transition-all disabled:opacity-50"
        >
          <span>{t('search_donors')}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
