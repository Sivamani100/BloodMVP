'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { WizardHeader } from '@/components/ui/WizardHeader';
import { MONEY_WORDS } from '@/lib/constants';
import { ShieldCheck, Send, Loader2, AlertCircle, ChevronDown } from 'lucide-react';

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
    return <div className="p-8 text-center text-[15px] text-[#8E8E93]">Loading emergency draft...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-[#F2F2F7] pb-28 text-gray-950 font-sans">
      <WizardHeader
        title="Patient Details"
        onBack={() => router.back()}
        progressPercent={80}
      />

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        <div className="space-y-1">
          <h1 className="text-[26px] sm:text-[30px] font-bold text-gray-950 tracking-[-0.02em] leading-tight">
            Patient &amp; Contact Details
          </h1>
          <p className="text-[13px] text-[#8E8E93]">
            {draft.blood_group} · {draft.units_needed} units · {draft.hospital_name}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-[14px] text-[13px] text-[#FF3B30] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#FF3B30]" strokeWidth={2} />
            <span className="font-medium leading-snug">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          {/* Patient Information Section */}
          <div className="space-y-1.5">
            <div className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider px-1">
              Patient Information
            </div>
            <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-2xs divide-y divide-black/[0.06] overflow-hidden">
              <div className="flex items-center px-4 py-3">
                <label className="text-[15px] font-medium text-[#8E8E93] w-28 shrink-0">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={patientFirstName}
                  onChange={(e) => setPatientFirstName(e.target.value)}
                  placeholder="First name only"
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center px-4 py-3">
                <label className="text-[15px] font-medium text-[#8E8E93] w-28 shrink-0">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="e.g. 32"
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden"
                />
              </div>

              <div className="relative flex items-center px-4 py-3">
                <label className="text-[15px] font-medium text-[#8E8E93] w-28 shrink-0">
                  Medical Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden appearance-none cursor-pointer pr-6"
                >
                  <option value="surgery">Surgery</option>
                  <option value="accident">Accident / Trauma</option>
                  <option value="delivery">Childbirth / Delivery</option>
                  <option value="dengue">Dengue / Platelets</option>
                  <option value="thalassemia">Thalassemia</option>
                  <option value="cancer">Cancer care</option>
                  <option value="other">Other emergency</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#8E8E93] absolute right-4 pointer-events-none" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Requester Contact Section */}
          <div className="space-y-1.5">
            <div className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider px-1">
              Your Contact Details
            </div>
            <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-2xs divide-y divide-black/[0.06] overflow-hidden">
              <div className="flex items-center px-4 py-3">
                <label className="text-[15px] font-medium text-[#8E8E93] w-28 shrink-0">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden"
                />
              </div>

              <div className="relative flex items-center px-4 py-3">
                <label className="text-[15px] font-medium text-[#8E8E93] w-28 shrink-0">
                  Relationship *
                </label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value as any)}
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden appearance-none cursor-pointer pr-6"
                >
                  <option value="family">{t('relation_family')}</option>
                  <option value="self">{t('relation_self')}</option>
                  <option value="friend">{t('relation_friend')}</option>
                  <option value="hospital_staff">{t('relation_hospital_staff')}</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#8E8E93] absolute right-4 pointer-events-none" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Ward & Hospital phone */}
          <div className="space-y-1.5">
            <div className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider px-1">
              Hospital Room Details (Optional)
            </div>
            <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-2xs divide-y divide-black/[0.06] overflow-hidden">
              <div className="flex items-center px-4 py-3">
                <label className="text-[15px] font-medium text-[#8E8E93] w-28 shrink-0">
                  Ward / Bed
                </label>
                <input
                  type="text"
                  value={wardInfo}
                  onChange={(e) => setWardInfo(e.target.value)}
                  placeholder="e.g. ICU Bed 14"
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center px-4 py-3">
                <label className="text-[15px] font-medium text-[#8E8E93] w-28 shrink-0">
                  Phone
                </label>
                <input
                  type="text"
                  value={hospitalPhone}
                  onChange={(e) => setHospitalPhone(e.target.value)}
                  placeholder="Optional direct phone"
                  className="w-full bg-transparent text-[16px] font-semibold text-gray-900 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Safety Notice Callout */}
          <div className="flex items-center gap-2 p-3.5 bg-[#34C759]/10 text-gray-900 text-[12px] rounded-[14px] border border-[#34C759]/20">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#34C759]" strokeWidth={2} />
            <span>RaktKhoj never asks for money or payment. All donations are strictly voluntary.</span>
          </div>

          {/* Sticky footer button */}
          <div className="fixed bottom-0 left-0 right-0 z-40 ios-glass hairline-t p-4">
            <div className="max-w-md mx-auto">
              <button
                type="submit"
                disabled={submitting || !patientFirstName.trim() || !requesterName.trim()}
                className="w-full h-12 rounded-[12px] font-semibold text-[17px] bg-[#FF3B30] text-white shadow-sm ios-press flex items-center justify-center gap-2 disabled:opacity-40 transition-all select-none"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.2} />
                ) : (
                  <>
                    <span>Dispatch Alert to Donors</span>
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
