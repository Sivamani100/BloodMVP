'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { WizardHeader } from '@/components/ui/WizardHeader';
import {
  Share2,
  Phone,
  PhoneOff,
  PhoneCall,
  PhoneForwarded,
  PhoneMissed,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  MapPin,
  X,
  Info,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function LiveRequestPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const requestId = params.requestId as string;
  const token = searchParams.get('token');
  const router = useRouter();

  const [request, setRequest] = useState<any>(null);
  const [donorCards, setDonorCards] = useState<any[]>([]);
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealingPhone, setRevealingPhone] = useState<string | null>(null);
  const [phoneMap, setPhoneMap] = useState<Record<string, string>>({});
  const [confirmCodeInput, setConfirmCodeInput] = useState<Record<string, string>>({});
  const [confirmingContact, setConfirmingContact] = useState<string | null>(null);

  // Bottom drawer & filtering state
  const [showCloseDrawer, setShowCloseDrawer] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [dismissedContactIds, setDismissedContactIds] = useState<string[]>([]);
  const [hideUnavailable, setHideUnavailable] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  const supabase = createClient();

  // 1-second clock ticker for live 10m countdown
  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    async function loadProgress() {
      try {
        const progressUrl = `/api/requests/${requestId}/progress${token ? `?token=${encodeURIComponent(token)}` : ''}`;
        const res = await fetch(progressUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.request) setRequest(data.request);
          if (data.donorCards) {
            setDonorCards(data.donorCards);
          }
          if (data.allContacts) {
            setAllContacts(data.allContacts);
          }
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();

    // Fast 3-second polling for real-time contact & ringing status updates
    const interval = setInterval(loadProgress, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [requestId, token]);

  async function handleCallDonor(contactId: string) {
    if (phoneMap[contactId]) {
      window.location.href = `tel:${phoneMap[contactId]}`;
      return;
    }

    setRevealingPhone(contactId);
    try {
      const res = await fetch(`/api/contacts/${contactId}/reveal-phone`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.phone) {
        setPhoneMap((prev) => ({ ...prev, [contactId]: data.phone }));
        window.location.href = `tel:${data.phone}`;
      } else {
        alert(data.message || 'Cannot reveal phone number. The donor will call you directly.');
      }
    } catch (err) {
      console.error('Reveal phone error:', err);
    } finally {
      setRevealingPhone(null);
    }
  }

  function handleWhatsApp(donor: any) {
    const text = encodeURIComponent(
      `Hello ${donor.first_name}, thank you for accepting my urgent blood request for patient ${
        request?.patient_first_name || ''
      } at ${request?.hospital_name || 'the hospital'}. Could you please let us know your ETA?`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  async function handleConfirmDonation(contactId: string) {
    const code = confirmCodeInput[contactId];
    if (!code || code.length !== 6) {
      alert('Please enter the 6-digit Donation Code given by the donor.');
      return;
    }

    setConfirmingContact(contactId);
    try {
      const res = await fetch(`/api/contacts/${contactId}/confirm-donation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Donation confirmed successfully! Thank you for saving lives.');
      } else {
        alert(data.error === 'code_wrong' ? 'Wrong Donation Code. Please check with the donor.' : 'Error confirming code.');
      }
    } catch (err) {
      console.error('Confirm donation error:', err);
    } finally {
      setConfirmingContact(null);
    }
  }

  async function handleCancelOrClose(reason: string) {
    try {
      await fetch(`/api/requests/${requestId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      setShowCloseDrawer(false);
      router.push('/');
    } catch (err) {
      console.error('Cancel request error:', err);
    }
  }

  async function handleExpandSearch() {
    try {
      await fetch(`/api/requests/${requestId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ continue: true }),
      });
      setShowCloseDrawer(false);
      alert('Search radius expanded to notify more donors!');
    } catch (err) {
      console.error('Expand search error:', err);
    }
  }

  if (loading || !request) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="text-sm font-semibold text-gray-700">Connecting to live matching engine...</p>
      </div>
    );
  }

  const acceptedCount = donorCards.length || request.accepted_count || 0;
  const targetUnits = request.units_needed || 2;
  const isComplete = acceptedCount >= targetUnits;

  return (
    <div className="w-full min-h-screen bg-white pb-24 text-gray-900">
      {/* Top Wizard Header */}
      <WizardHeader
        title="Request sent"
        onBack={() => router.push('/')}
        onClose={() => setShowCloseDrawer(true)}
      />

      {/* Top Map View */}
      <div className="relative w-full h-52 bg-slate-100 border-b border-gray-100 overflow-hidden">
        {/* Map Grid / stylised layout */}
        <div className="absolute inset-0 opacity-70 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
          <svg className="w-full h-full opacity-40" viewBox="0 0 400 220">
            <path d="M-20 40 Q 120 70 240 30 T 420 100" stroke="#94A3B8" strokeWidth="4" fill="none" />
            <path d="M40 -10 Q 110 110 190 160 T 350 220" stroke="#94A3B8" strokeWidth="3" fill="none" />
            <path d="M160 60 Q 230 130 310 90" stroke="#94A3B8" strokeWidth="5" fill="none" />
          </svg>
        </div>

        {/* Center Hospital Pin & Donor Pins */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-56 h-32">
            {/* Hospital Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600" />
              </div>
              <span className="text-[10px] font-bold text-gray-700 bg-white/90 px-1.5 py-0.5 rounded-md shadow-xs mt-1">
                {request.hospital_area || 'Hospital'}
              </span>
            </div>

            {/* Donor Accepted Pin */}
            {acceptedCount > 0 && (
              <div className="absolute top-4 right-8 flex flex-col items-center animate-bounce">
                <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-white text-[9px] font-black">
                  ✓
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Notification or Status Pill on Map */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          {toastNotification ? (
            <div className="bg-gray-900/90 text-white backdrop-blur-xs rounded-full px-4 py-2 shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{toastNotification}</span>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-xs rounded-full px-4 py-1.5 shadow-md border border-gray-200 text-xs font-bold text-gray-900">
              {acceptedCount} of {targetUnits} accepted
            </div>
          )}
        </div>

        {/* Map info icon */}
        <button
          type="button"
          onClick={() => alert(`Searching registered donors within Rajahmundry. Live updates enabled.`)}
          className="absolute bottom-3 right-4 w-7 h-7 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-md mx-auto px-5 pt-5 space-y-4">
        {/* Section Heading with Counter Badge */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight">
              Donors who&apos;ve accepted
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {request.blood_group} and compatible types
            </p>
          </div>
          <div className="px-3 py-1 bg-gray-100 rounded-full font-bold text-xs text-gray-700">
            {acceptedCount}/{targetUnits}
          </div>
        </div>

        {/* Donors Cards List */}
        <div className="space-y-3 pt-1">
          {donorCards.map((donor, idx) => (
            <div
              key={donor.contact_id || idx}
              className="p-4 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar with Verified Check Overlay */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-base font-extrabold text-gray-800">
                      {donor.first_name ? donor.first_name.slice(0, 2).toUpperCase() : 'DN'}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[9px] font-black">
                      ✓
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-base text-gray-950">
                        {donor.first_name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-bold">
                        {donor.blood_group || request.blood_group}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {donor.distance_band || '0.5 km away'} · Male, 30
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row: Share, Call, WhatsApp */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Donor Accepted',
                        text: `Donor ${donor.first_name} has accepted to donate ${request.blood_group} blood!`,
                      });
                    } else {
                      alert('Donor information copied!');
                    }
                  }}
                  className="w-11 h-11 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 shrink-0"
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleCallDonor(donor.contact_id)}
                  disabled={revealingPhone === donor.contact_id}
                  className="grow h-11 rounded-2xl border border-gray-200 bg-white font-bold text-sm text-gray-900 flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-[0.99] transition-all"
                >
                  {revealingPhone === donor.contact_id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Phone className="w-4 h-4 text-gray-700" />
                      <span>{phoneMap[donor.contact_id] ? 'Call Now' : 'Call'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleWhatsApp(donor)}
                  className="grow h-11 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.99] shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp</span>
                </button>
              </div>

              {/* Donation Code Verification Field (For when donor arrives) */}
              <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Donation Code"
                  value={confirmCodeInput[donor.contact_id] || ''}
                  onChange={(e) =>
                    setConfirmCodeInput({ ...confirmCodeInput, [donor.contact_id]: e.target.value })
                  }
                  className="grow py-2 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono tracking-widest text-center focus:outline-hidden focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => handleConfirmDonation(donor.contact_id)}
                  disabled={confirmingContact === donor.contact_id}
                  className="py-2 px-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors shrink-0"
                >
                  {confirmingContact === donor.contact_id ? 'Confirming...' : 'Verify'}
                </button>
              </div>
            </div>
          ))}

          {/* Candidate Donors Being Contacted Now (Live Outreach Feed) */}
          {(() => {
            // Filter out contacts dismissed by user
            const nonDismissedContacts = allContacts.filter(
              (c) => !dismissedContactIds.includes(c.contact_id)
            );

            // Count unavailable/declined contacts
            const declinedContacts = nonDismissedContacts.filter((c) =>
              ['declined', 'not_eligible', 'cancelled'].includes(c.status)
            );
            const declinedCount = declinedContacts.length;

            // Filter based on hideUnavailable toggle
            const visibleContacts = nonDismissedContacts.filter((c) => {
              if (hideUnavailable && ['declined', 'not_eligible', 'cancelled'].includes(c.status)) {
                return false;
              }
              return true;
            });

            // Calculate 10-minute wave timer from the earliest created contact
            const activeContacts = nonDismissedContacts.filter(
              (c) => !['accepted', 'declined', 'not_eligible', 'cancelled'].includes(c.status)
            );
            const waveEarliestCreated =
              activeContacts.length > 0 && activeContacts[0].created_at
                ? new Date(activeContacts[0].created_at).getTime()
                : allContacts.length > 0 && allContacts[0].created_at
                ? new Date(allContacts[0].created_at).getTime()
                : null;

            const elapsedWaveSec = waveEarliestCreated
              ? Math.max(0, Math.floor((currentTime - waveEarliestCreated) / 1000))
              : 0;
            const TEN_MIN_SEC = 600;
            const remainingWaveSec = Math.max(0, TEN_MIN_SEC - elapsedWaveSec);
            const waveMins = Math.floor(remainingWaveSec / 60);
            const waveSecs = remainingWaveSec % 60;

            return (
              <div className="pt-2 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
                      Nearby Donors Contacted ({visibleContacts.length})
                    </h3>
                    {remainingWaveSec > 0 ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {waveMins}:{waveSecs < 10 ? '0' : ''}{waveSecs} left
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-amber-600" />
                        10m window ended
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {declinedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setHideUnavailable(!hideUnavailable)}
                        className="text-[10px] font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-2 py-0.5 rounded-full transition-colors"
                      >
                        {hideUnavailable ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {hideUnavailable ? `Show unable (${declinedCount})` : `Hide unable`}
                      </button>
                    )}
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                      Live Dispatch
                    </span>
                  </div>
                </div>

                {visibleContacts.length > 0 ? (
                  <div className="space-y-2">
                    {visibleContacts.map((contact, idx) => {
                      const isAccepted = contact.status === 'accepted';
                      const isDeclined = ['declined', 'not_eligible', 'cancelled'].includes(contact.status);
                      const isTimedOut =
                        contact.created_at &&
                        currentTime - new Date(contact.created_at).getTime() > 10 * 60 * 1000 &&
                        !isAccepted;
                      const isNoAnswer =
                        contact.status === 'no_answer' ||
                        ['no_answer', 'busy'].includes(contact.call_status) ||
                        contact.call_status === 'failed';
                      const isCallEnded = contact.call_status === 'completed' && !isAccepted && !isDeclined;
                      const isOnCall = contact.call_status === 'answered' && !isAccepted && !isDeclined;
                      const isCalling = ['dialing', 'ringing'].includes(contact.call_status);
                      const isWaSent = ['sent', 'delivered', 'read'].includes(contact.wa_status);
                      const isWaRead = contact.wa_status === 'read';

                      return (
                        <div
                          key={contact.contact_id || idx}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isAccepted
                              ? 'bg-emerald-50/60 border-emerald-200 shadow-2xs'
                              : isDeclined
                              ? 'bg-rose-50/20 border-rose-100 opacity-80 hover:opacity-100'
                              : isCalling
                              ? 'bg-blue-50/50 border-blue-200 shadow-xs'
                              : isOnCall
                              ? 'bg-indigo-50/40 border-indigo-200'
                              : isCallEnded
                              ? 'bg-slate-50/60 border-slate-200'
                              : isNoAnswer
                              ? 'bg-amber-50/20 border-amber-100'
                              : 'bg-white border-gray-100 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-full border flex items-center justify-center font-black text-xs shrink-0 ${
                                  isAccepted
                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                                    : isDeclined
                                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                                    : 'bg-gray-100 border-gray-200 text-gray-800'
                                }`}
                              >
                                {contact.first_name?.[0] || 'D'}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-sm text-gray-950 truncate">
                                    {contact.first_name}
                                  </h4>
                                  <span className="px-1.5 py-0.5 text-[10px] font-black rounded-md bg-red-100 text-red-700 shrink-0">
                                    {contact.blood_group}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-500 font-medium truncate">
                                  {contact.distance_km ? `${contact.distance_km} km away` : 'Nearby in Rajahmundry'}
                                </p>
                              </div>
                            </div>

                            {/* Real-time Status Badge & Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Primary Status Badge */}
                              {isAccepted ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2.5 py-1 rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Accepted
                                </span>
                              ) : isDeclined ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  Can&apos;t Donate
                                </span>
                              ) : isTimedOut ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  Timed Out (10m)
                                </span>
                              ) : isCalling ? (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full animate-pulse">
                                  <Phone className="w-3.5 h-3.5 animate-bounce text-blue-600" />
                                  Calling...
                                </span>
                              ) : isOnCall ? (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full animate-pulse">
                                  <PhoneForwarded className="w-3.5 h-3.5 text-indigo-600" />
                                  On Call...
                                </span>
                              ) : isCallEnded ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                                  <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                                  Call Ended
                                </span>
                              ) : isNoAnswer ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                                  <PhoneOff className="w-3.5 h-3.5 text-amber-600" />
                                  No Answer
                                </span>
                              ) : isWaSent ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/60 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                                  {isWaRead ? 'WhatsApp Seen' : 'WhatsApp Sent'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                  <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                                  Contacting...
                                </span>
                              )}

                              {/* Dismiss / Remove button for unavailable donors */}
                              {isDeclined && (
                                <button
                                  type="button"
                                  onClick={() => setDismissedContactIds((prev) => [...prev, contact.contact_id])}
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                                  title="Remove from list"
                                  aria-label="Remove from list"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* WhatsApp Delivery indicator if call is also ongoing */}
                          {!isAccepted && !isDeclined && isWaSent && (isCalling || isOnCall || isCallEnded || isNoAnswer) && (
                            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                              <span className="text-gray-500 flex items-center gap-1">
                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                                WhatsApp Alert:
                              </span>
                              <span className="font-semibold text-emerald-700">
                                {isWaRead ? 'Seen by donor' : 'Delivered to phone'}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-[#F9FAFB] rounded-3xl border border-dashed border-gray-200 space-y-3">
                    <Loader2 className="w-6 h-6 animate-spin text-red-600 mx-auto" />
                    <h3 className="font-bold text-gray-900 text-sm">
                      Ringing nearby donors now...
                    </h3>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                      Automated phone calls and WhatsApp alerts are being sent to registered donors in widening distance rings.
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Pulsing Status: Waiting for more, please be patient */}
        <div className="py-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </span>
            <span>Waiting for more, please be patient</span>
          </div>
        </div>

        {/* Footer trigger to open bottom sheet */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowCloseDrawer(true)}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline decoration-gray-300"
          >
            Finished or need to expand search?
          </button>
        </div>
      </div>

      {/* Bottom Sheet Drawer: Did you find a donor? */}
      {showCloseDrawer && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowCloseDrawer(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-md mx-auto bg-white rounded-t-[32px] p-6 pb-8 shadow-2xl z-50 animate-in slide-in-from-bottom duration-200 space-y-4">
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2" />

            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-gray-950">
                Did you find a donor?
              </h3>
              <p className="text-xs text-gray-500">
                If you found help, we shall close the request.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleCancelOrClose('got_donor')}
                className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 active:scale-[0.99] transition-all"
              >
                Found donor
              </button>

              <button
                type="button"
                onClick={handleExpandSearch}
                className="w-full py-3 rounded-2xl font-semibold text-sm text-gray-700 hover:bg-gray-100 active:scale-[0.99] transition-all"
              >
                Expand search
              </button>

              <button
                type="button"
                onClick={() => setShowCloseDrawer(false)}
                className="w-full py-2 text-xs font-medium text-gray-400 hover:text-gray-600"
              >
                Keep waiting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
