'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { WizardHeader } from '@/components/ui/WizardHeader';
import { MONEY_WORDS } from '@/lib/constants';
import { ShieldCheck, Send, Loader2, AlertCircle } from 'lucide-react';

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
    <div className="w-full min-h-screen bg-white pb-24 text-gray-900">
      <WizardHeader
        title="Patient Details"
        onBack={() => router.back()}
        progressPercent={80}
      />

      <div className="max-w-md mx-auto px-5 pt-4 space-y-5">
        <div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight leading-tight">
            Patient &amp; Contact Details
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {draft.blood_group} · {draft.units_needed} units · {draft.hospital_name}
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          {/* Patient first name */}
          <div className="bg-[#F9FAFB] p-5 rounded-3xl border border-gray-200/80 space-y-3">
            <h2 className="font-bold text-gray-900 text-sm">Patient Information</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  First name *
                </label>
                <input
                  type="text"
                  required
                  value={patientFirstName}
                  onChange={(e) => setPatientFirstName(e.target.value)}
                  placeholder="First name only"
                  className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="Age in years"
                  className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500"
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
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500"
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
          <div className="bg-[#F9FAFB] p-5 rounded-3xl border border-gray-200/80 space-y-3">
            <h2 className="font-bold text-gray-900 text-sm">Your Contact Details</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Your name *
                </label>
                <input
                  type="text"
                  required
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="Full name"
                  className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Relation *
                </label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value as any)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500"
                >
                  <option value="family">{t('relation_family')}</option>
                  <option value="self">{t('relation_self')}</option>
                  <option value="friend">{t('relation_friend')}</option>
                  <option value="hospital_staff">{t('relation_hospital_staff')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ward & Hospital phone */}
          <div className="bg-[#F9FAFB] p-5 rounded-3xl border border-gray-200/80 space-y-3">
            <h2 className="font-bold text-gray-900 text-sm">Hospital Room Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ward / Bed
                </label>
                <input
                  type="text"
                  value={wardInfo}
                  onChange={(e) => setWardInfo(e.target.value)}
                  placeholder="e.g. ICU Bed 12"
                  className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Hospital Phone
                </label>
                <input
                  type="text"
                  value={hospitalPhone}
                  onChange={(e) => setHospitalPhone(e.target.value)}
                  placeholder="Optional phone"
                  className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Safety notice */}
          <div className="flex items-center gap-2 p-3.5 bg-emerald-50 text-emerald-900 text-xs rounded-2xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>RaktKhoj never asks for money or OTP. The doctor conducts final verification.</span>
          </div>

          {/* Sticky footer button */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 p-4">
            <div className="max-w-md mx-auto">
              <button
                type="submit"
                disabled={submitting || !patientFirstName.trim() || !requesterName.trim()}
                className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Send Request to Donors</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
