'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  Check,
} from 'lucide-react';

export default function LiveRequestPage() {
  const params = useParams();
  const requestId = params.requestId as string;
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
        const res = await fetch(`/api/requests/${requestId}/progress`);
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
  }, [requestId]);

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
        alert(data.error || 'Could not reveal donor phone number');
      }
    } catch (err: any) {
      alert(err.message || 'Call error');
    } finally {
      setRevealingPhone(null);
    }
  }

  function handleWhatsApp(donor: any) {
    const phone = phoneMap[donor.contact_id];
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const text = encodeURIComponent(
        `Hello ${donor.first_name || 'Donor'}, thank you for agreeing to donate blood on RaktKhoj! We are at ${
          request?.hospital_name || 'hospital'
        }.`
      );
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    } else {
      handleCallDonor(donor.contact_id);
    }
  }

  async function handleConfirmDonation(contactId: string) {
    const code = (confirmCodeInput[contactId] || '').trim();
    if (code.length !== 6) {
      alert('Please enter the 6-digit donation code provided by the donor.');
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
        setToastNotification('Donation confirmed successfully!');
        setTimeout(() => setToastNotification(null), 4000);
        // Refresh progress immediately
        const progRes = await fetch(`/api/requests/${requestId}/progress`);
        if (progRes.ok) {
          const progData = await progRes.json();
          if (progData.request) setRequest(progData.request);
          if (progData.donorCards) setDonorCards(progData.donorCards);
          if (progData.allContacts) setAllContacts(progData.allContacts);
        }
      } else {
        alert(data.error || 'Failed to confirm donation with this code.');
      }
    } catch (err: any) {
      alert(err.message || 'Confirmation error');
    } finally {
      setConfirmingContact(null);
    }
  }

  async function handleCloseRequest(reason: string) {
    try {
      const res = await fetch(`/api/requests/${requestId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setShowCloseDrawer(false);
        router.push('/');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to cancel request');
      }
    } catch (err: any) {
      alert(err.message || 'Cancellation error');
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF3B30]" strokeWidth={2.2} />
        <p className="text-[15px] font-medium text-[#8E8E93]">Connecting to live radar...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="w-full min-h-screen bg-[#F2F2F7] flex flex-col justify-center px-4 py-8">
        <div className="max-w-md w-full mx-auto text-center space-y-3">
          <h1 className="text-[24px] font-bold text-gray-950">Request Not Found</h1>
          <p className="text-[15px] text-[#8E8E93]">
            This blood emergency request was closed or does not exist.
          </p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="h-11 px-5 rounded-[12px] bg-[#007AFF] text-white font-semibold text-[15px] shadow-sm ios-press"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const targetUnits = request.units_needed || 2;
  const acceptedCount = request.accepted_count || 0;
  const ringRadius = request.current_ring_km || 1;
  const waveNumber = request.wave_no || 1;

  // Wave 10-minute expiry calculation
  let remainingSec = 0;
  if (request.wave_expires_at) {
    const expireMs = new Date(request.wave_expires_at).getTime();
    remainingSec = Math.max(0, Math.floor((expireMs - currentTime) / 1000));
  }
  const timerMinutes = Math.floor(remainingSec / 60);
  const timerSeconds = remainingSec % 60;
  const timerDisplay = `${timerMinutes}:${timerSeconds < 10 ? '0' : ''}${timerSeconds}`;

  return (
    <div className="w-full min-h-screen bg-[#F2F2F7] pb-32 text-gray-950 font-sans">
      <WizardHeader
        title={`${request.blood_group} Live Radar`}
        onBack={() => router.push('/')}
        showClose={true}
        onClose={() => setShowCloseDrawer(true)}
      />

      {/* Live Concentric Radar Map Visual */}
      <div className="relative w-full h-56 bg-slate-900 overflow-hidden select-none">
        {/* Radar Rings Grid */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outermost Ring */}
            <div className="absolute w-56 h-56 rounded-full border border-emerald-500/20" />
            {/* Wave 2 Ring */}
            <div className="absolute w-40 h-40 rounded-full border border-emerald-500/30" />
            {/* Immediate Ring */}
            <div className="absolute w-24 h-24 rounded-full border border-emerald-500/40 animate-ping duration-1000" />
            <div className="absolute w-24 h-24 rounded-full border border-emerald-500/50" />

            {/* Crosshair guidelines */}
            <div className="absolute w-full h-[1px] bg-emerald-500/10" />
            <div className="absolute h-full w-[1px] bg-emerald-500/10" />

            {/* Center Hospital Pin */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#FF3B30] text-white flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="w-4 h-4 fill-white" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full mt-1 border border-white/20 truncate max-w-[140px]">
                {request.hospital_name || 'Hospital'}
              </span>
            </div>

            {/* Candidate Donors Dots */}
            {allContacts.slice(0, 5).map((c, i) => {
              const offsets = [
                { top: '24%', left: '22%' },
                { top: '30%', right: '20%' },
                { bottom: '26%', left: '30%' },
                { bottom: '22%', right: '26%' },
                { top: '15%', left: '50%' },
              ];
              const pos = offsets[i % offsets.length];
              const isAccepted = c.status === 'accepted';
              return (
                <div
                  key={c.id || i}
                  style={pos as any}
                  className="absolute z-10 flex flex-col items-center"
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 border-white shadow-md transition-all ${
                      isAccepted
                        ? 'bg-[#34C759] ring-2 ring-[#34C759]/40 scale-125'
                        : 'bg-[#007AFF] animate-pulse'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Top Status Capsule on Map */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          {toastNotification ? (
            <div className="bg-black/85 text-white backdrop-blur-md rounded-full px-3.5 py-1.5 shadow-md flex items-center gap-2 text-[12px] font-semibold animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-[#34C759] animate-ping" />
              <span>{toastNotification}</span>
            </div>
          ) : (
            <div className="ios-glass rounded-full px-3.5 py-1 shadow-sm border border-black/[0.08] text-[12px] font-semibold text-gray-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
              <span>{acceptedCount} of {targetUnits} Donors Confirmed</span>
            </div>
          )}
        </div>

        {/* Map info icon */}
        <button
          type="button"
          onClick={() => alert(`Searching registered ${request.blood_group} donors near hospital.`)}
          className="absolute bottom-3 right-4 w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-gray-700"
          aria-label="Radar Info"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Wave Banner Callout */}
        <div className="p-3.5 rounded-[16px] bg-white border border-black/[0.06] shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-gray-900">
                Wave {waveNumber} · {ringRadius} km Radius
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-pulse" />
            </div>
            <p className="text-[12px] text-[#8E8E93]">
              Automated calls &amp; WhatsApp alerts active
            </p>
          </div>
          {remainingSec > 0 && (
            <div className="flex items-center gap-1 text-[13px] font-mono font-bold text-[#FF3B30] bg-[#FF3B30]/10 px-2.5 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" strokeWidth={2.2} />
              <span>{timerDisplay}</span>
            </div>
          )}
        </div>

        {/* Donors who have accepted Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[17px] font-bold text-gray-950 tracking-tight">
              Confirmed Donors ({donorCards.length})
            </h2>
            <span className="text-[12px] text-[#8E8E93] font-medium">
              Target: {targetUnits} units
            </span>
          </div>

          {donorCards.length === 0 ? (
            <div className="p-5 rounded-[16px] bg-white border border-black/[0.06] shadow-2xs text-center space-y-1.5">
              <p className="text-[15px] font-semibold text-gray-900">Awaiting donor response...</p>
              <p className="text-[12px] text-[#8E8E93]">
                Candidate phones in Wave {waveNumber} are being contacted right now.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {donorCards.map((donor, idx) => (
                <div
                  key={donor.contact_id || idx}
                  className="p-4 rounded-[16px] bg-white border border-black/[0.06] shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-[#34C759]/15 flex items-center justify-center text-[15px] font-bold text-[#34C759]">
                          {donor.first_name ? donor.first_name.slice(0, 2).toUpperCase() : 'DN'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#34C759] border-2 border-white flex items-center justify-center text-white text-[9px] font-bold">
                          ✓
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-[16px] text-gray-950">
                            {donor.first_name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] text-[11px] font-bold">
                            {donor.blood_group || request.blood_group}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#8E8E93]">
                          {donor.distance_band || 'Nearby'} · Verified Donor
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCallDonor(donor.contact_id)}
                      disabled={revealingPhone === donor.contact_id}
                      className="grow h-10 rounded-[10px] bg-[#34C759] text-white font-semibold text-[14px] flex items-center justify-center gap-1.5 shadow-xs ios-press select-none"
                    >
                      {revealingPhone === donor.contact_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Phone className="w-4 h-4" strokeWidth={2} />
                          <span>{phoneMap[donor.contact_id] ? 'Call Now' : 'Call Donor'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWhatsApp(donor)}
                      className="grow h-10 rounded-[10px] bg-[#007AFF] text-white font-semibold text-[14px] flex items-center justify-center gap-1.5 shadow-xs ios-press select-none"
                    >
                      <MessageCircle className="w-4 h-4" strokeWidth={2} />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {/* Code Verification Row */}
                  <div className="pt-2.5 border-t border-black/[0.05] flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit Code"
                      value={confirmCodeInput[donor.contact_id] || ''}
                      onChange={(e) =>
                        setConfirmCodeInput({ ...confirmCodeInput, [donor.contact_id]: e.target.value })
                      }
                      className="grow py-1.5 px-3 text-[13px] bg-[#767680]/[0.08] rounded-[8px] font-mono tracking-widest text-center focus:outline-hidden focus:ring-1 focus:ring-[#007AFF]"
                    />
                    <button
                      type="button"
                      onClick={() => handleConfirmDonation(donor.contact_id)}
                      disabled={confirmingContact === donor.contact_id}
                      className="h-8 px-3.5 bg-gray-950 text-white rounded-[8px] text-[12px] font-semibold ios-press select-none"
                    >
                      {confirmingContact === donor.contact_id ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Outreach Queue List */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[14px] font-semibold text-[#8E8E93] uppercase tracking-wider">
              Live Outreach Feed
            </h3>
            <button
              type="button"
              onClick={() => setHideUnavailable(!hideUnavailable)}
              className="text-[12px] text-[#007AFF] font-medium"
            >
              {hideUnavailable ? 'Show All' : 'Hide Passed'}
            </button>
          </div>

          <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-2xs divide-y divide-black/[0.06] overflow-hidden">
            {allContacts
              .filter((c) => !hideUnavailable || c.status !== 'no_answer')
              .slice(0, 6)
              .map((contact, i) => {
                const isCalling = contact.call_status === 'dialing' || contact.call_status === 'ringing';
                const isAccepted = contact.status === 'accepted';
                const isNoAnswer = contact.status === 'no_answer' || contact.status === 'declined';

                return (
                  <div key={contact.id || i} className="p-3 flex items-center justify-between text-[14px]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#767680]/10 flex items-center justify-center text-gray-700">
                        {isAccepted ? (
                          <Check className="w-3.5 h-3.5 text-[#34C759]" strokeWidth={3} />
                        ) : isCalling ? (
                          <PhoneCall className="w-3.5 h-3.5 text-[#007AFF] animate-pulse" strokeWidth={2} />
                        ) : isNoAnswer ? (
                          <PhoneMissed className="w-3.5 h-3.5 text-[#8E8E93]" strokeWidth={2} />
                        ) : (
                          <MessageCircle className="w-3.5 h-3.5 text-[#34C759]" strokeWidth={2} />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 block leading-tight">
                          Donor #{i + 1}
                        </span>
                        <span className="text-[11px] text-[#8E8E93]">
                          {contact.ring_km ? `${contact.ring_km} km away` : 'Matching distance'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${
                        isAccepted
                          ? 'bg-[#34C759]/15 text-[#34C759]'
                          : isCalling
                          ? 'bg-[#007AFF]/15 text-[#007AFF]'
                          : isNoAnswer
                          ? 'bg-gray-100 text-[#8E8E93]'
                          : 'bg-amber-500/15 text-amber-700'
                      }`}
                    >
                      {isAccepted
                        ? 'Accepted'
                        : isCalling
                        ? 'Dialing...'
                        : isNoAnswer
                        ? 'Passed'
                        : 'Alert Sent'}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Cancel / Close Request Button */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setShowCloseDrawer(true)}
            className="text-[13px] font-semibold text-[#FF3B30] hover:underline"
          >
            Cancel this emergency request
          </button>
        </div>
      </div>

      {/* iOS Modal Bottom Sheet for Cancellation */}
      {showCloseDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs animate-in fade-in"
            onClick={() => setShowCloseDrawer(false)}
          />

          <div className="relative w-full max-w-md mx-auto bg-white rounded-t-[28px] p-5 space-y-4 z-50 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />

            <div className="text-center space-y-1">
              <h3 className="text-[18px] font-bold text-gray-950">Cancel Request</h3>
              <p className="text-[13px] text-[#8E8E93]">
                Why would you like to close this blood request?
              </p>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Blood arranged from donor / bank', reason: 'blood_found' },
                { label: 'Patient discharged or stabilized', reason: 'patient_stabilized' },
                { label: 'Testing / Demonstration completed', reason: 'test_demo' },
                { label: 'Other reason', reason: 'other' },
              ].map((item) => (
                <button
                  key={item.reason}
                  type="button"
                  onClick={() => handleCloseRequest(item.reason)}
                  className="w-full text-left p-3.5 rounded-[12px] bg-[#F2F2F7] hover:bg-gray-200 text-[15px] font-semibold text-gray-900 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowCloseDrawer(false)}
              className="w-full h-11 rounded-[12px] bg-gray-100 text-gray-700 font-semibold text-[15px] ios-press"
            >
              Keep Searching
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
