'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { MONEY_WORDS } from '@/lib/constants';
import { ShieldCheck, Send, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function RequestDetailsPage() {
  const t = useTranslations('req');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [draft, setDraft] = useState<any>(null);
  const [patientFirstName, setPatientFirstName] = useState('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [requesterName, setRequesterName] = useState('');
  const [relation, setRelation] = useState<'family' | 'self' | 'friend' | 'hospital_staff'>('family');
  const [reason, setReason] = useState<string>('surgery');
  const [note, setNote] = useState('');
  const [wardInfo, setWardInfo] = useState('');
  const [hospitalPhone, setHospitalPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('blood_request_draft');
    if (!raw) {
      router.push('/need-blood');
      return;
    }
    try {
      setDraft(JSON.parse(raw));
    } catch {
      router.push('/need-blood');
    }
  }, [router]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setErrorMsg(null);

    // Validate note for money words / phone numbers
    if (note) {
      const hasPhone = /\d{5,}/.test(note.replace(/\s+/g, ''));
      const lower = note.toLowerCase();
      const hasMoney = MONEY_WORDS.some((w) => lower.includes(w.toLowerCase()));
      if (hasPhone || hasMoney) {
        setErrorMsg('Note cannot contain phone numbers or money words. Blood never asks for money.');
        return;
      }
    }

    setSubmitting(true);
    try {
      // 1. Create request
      const createRes = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester_name: requesterName,
          relation,
          patient_first_name: patientFirstName,
          patient_age: patientAge ? parseInt(patientAge, 10) : null,
          reason,
          blood_group: draft.blood_group,
          component: draft.component,
          units_needed: draft.units_needed,
          urgency: draft.urgency,
          hospital_name: draft.hospital_name,
          hospital_area: draft.hospital_area,
          lat: draft.lat,
          lng: draft.lng,
          ward_info: wardInfo || null,
          hospital_phone: hospitalPhone || null,
          note: note || null,
          allow_compatible: false,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        setErrorMsg(createData.message || createData.error || 'Failed to create request');
        setSubmitting(false);
        return;
      }

      const requestId = createData.id;

      // 2. Trigger first wave
      await fetch(`/api/requests/${requestId}/start`, {
        method: 'POST',
      });

      // Clear draft
      sessionStorage.removeItem('blood_request_draft');

      // Redirect to live screen
      router.push(`/r/${requestId}`);
    } catch (err: any) {
      console.error('Request creation error:', err);
      setErrorMsg(err.message || 'Network error');
      setSubmitting(false);
    }
  }

  if (!draft) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading draft...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{tCommon('back')}</span>
      </button>

      <div>
        <h1 className="text-2xl font-black text-gray-950">Patient &amp; Contact Details</h1>
        <p className="text-sm text-gray-600 mt-1">
          {draft.blood_group} · {draft.units_needed} units · {draft.hospital_name}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-800 flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSend} className="space-y-4">
        {/* Patient first name */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="font-bold text-gray-900 text-base">Patient Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('patient_first_name')} *
              </label>
              <input
                type="text"
                required
                value={patientFirstName}
                onChange={(e) => setPatientFirstName(e.target.value)}
                placeholder="First name only"
                className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('patient_age')}
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="Age in years"
                className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Medical Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blood-500"
            >
              <option value="surgery">Surgery</option>
              <option value="accident">Accident / Trauma</option>
              <option value="delivery">Childbirth / Delivery</option>
              <option value="dengue">Dengue / Platelets</option>
              <option value="thalassemia">Thalassemia</option>
              <option value="cancer">Cancer care</option>
              <option value="other">Other emergency</option>
            </select>
          </div>
        </div>

        {/* Requester Info */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="font-bold text-gray-900 text-base">Your Contact Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('requester_name')} *
              </label>
              <input
                type="text"
                required
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="Full name"
                className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('relation')} *
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value as any)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blood-500"
              >
                <option value="family">{t('relation_family')}</option>
                <option value="self">{t('relation_self')}</option>
                <option value="friend">{t('relation_friend')}</option>
                <option value="hospital_staff">{t('relation_hospital_staff')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ward & Hospital phone (shown only after donor accepts) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div>
            <h2 className="font-bold text-gray-900 text-base">Hospital Room Details</h2>
            <p className="text-xs text-gray-500">Only shown to donors after they accept and agree to come.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ward / Room / Floor
              </label>
              <input
                type="text"
                value={wardInfo}
                onChange={(e) => setWardInfo(e.target.value)}
                placeholder="e.g. ICU 2nd floor, Bed 12"
                className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Hospital Helpdesk Phone
              </label>
              <input
                type="text"
                value={hospitalPhone}
                onChange={(e) => setHospitalPhone(e.target.value)}
                placeholder="Optional hospital phone"
                className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500"
              />
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <label className="block text-xs font-bold text-gray-700">
            {t('note')}
          </label>
          <textarea
            maxLength={300}
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Special instructions for donors (no payment details allowed)..."
            className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500"
          />
        </div>

        {/* Safety notice */}
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-900 text-xs rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Blood never asks for money or OTP. The doctor does the final check.</span>
        </div>

        <button
          type="submit"
          disabled={submitting || !patientFirstName.trim() || !requesterName.trim()}
          className="w-full flex items-center justify-center gap-2 bg-blood-600 hover:bg-blood-700 text-white font-extrabold text-lg py-4 px-6 rounded-2xl shadow-lg shadow-blood-600/30 transition-all disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>{t('send')}</span>
              <Send className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

