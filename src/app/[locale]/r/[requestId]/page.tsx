'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import {
  Phone,
  Heart,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldAlert,
  UserCheck,
  XCircle,
} from 'lucide-react';

export default function LiveRequestPage() {
  const params = useParams();
  const requestId = params.requestId as string;
  const tLive = useTranslations('live');
  const tGate = useTranslations('gate');
  const tExhausted = useTranslations('exhausted');

  const [request, setRequest] = useState<any>(null);
  const [donorCards, setDonorCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealingPhone, setRevealingPhone] = useState<string | null>(null);
  const [phoneMap, setPhoneMap] = useState<Record<string, string>>({});
  const [confirmCodeInput, setConfirmCodeInput] = useState<Record<string, string>>({});
  const [confirmingContact, setConfirmingContact] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadInitial() {
      const [reqRes, cardsRes] = await Promise.all([
        supabase.from('requests').select('*').eq('id', requestId).single(),
        supabase.from('request_donor_cards').select('*').eq('request_id', requestId),
      ]);

      if (reqRes.data) setRequest(reqRes.data);
      if (cardsRes.data) setDonorCards(cardsRes.data);
      setLoading(false);
    }

    loadInitial();

    // Set up Realtime subscriptions
    const channel = supabase
      .channel(`live-req-${requestId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests', filter: `id=eq.${requestId}` },
        (payload: any) => {
          if (payload.new) setRequest(payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'request_donor_cards', filter: `request_id=eq.${requestId}` },
        async () => {
          const { data } = await supabase
            .from('request_donor_cards')
            .select('*')
            .eq('request_id', requestId);
          if (data) setDonorCards(data);
        }
      )
      .subscribe();

    // 15-second polling fallback
    const interval = setInterval(async () => {
      const [reqRes, cardsRes] = await Promise.all([
        supabase.from('requests').select('*').eq('id', requestId).single(),
        supabase.from('request_donor_cards').select('*').eq('request_id', requestId),
      ]);
      if (reqRes.data) setRequest(reqRes.data);
      if (cardsRes.data) setDonorCards(cardsRes.data);
    }, 15000);

    return () => {
      supabase.removeChannel(channel);
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
        alert(data.message || 'Cannot reveal phone number. The donor will call you.');
      }
    } catch (err) {
      console.error('Reveal phone error:', err);
    } finally {
      setRevealingPhone(null);
    }
  }

  async function handleGateDecision(decision: boolean) {
    try {
      await fetch(`/api/requests/${requestId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ continue: decision }),
      });
    } catch (err) {
      console.error('Gate decision error:', err);
    }
  }

  async function handleCancelRequest() {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    try {
      await fetch(`/api/requests/${requestId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'requester_cancelled' }),
      });
    } catch (err) {
      console.error('Cancel request error:', err);
    }
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

  if (loading || !request) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blood-600 mx-auto" />
        <p className="text-sm font-semibold text-gray-600">Connecting to live matching engine...</p>
      </div>
    );
  }

  const isClosed = ['completed', 'cancelled', 'stopped', 'expired'].includes(request.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Status banner */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blood-600 animate-ping" />
              <h1 className="text-xl sm:text-2xl font-black text-gray-950">
                {request.status === 'enough_donors'
                  ? 'Enough Donors Confirmed!'
                  : request.status === 'waiting_requester'
                  ? 'Widening Search Gate'
                  : isClosed
                  ? `Request Closed (${request.close_reason || 'Finished'})`
                  : `Searching within ${request.current_ring_km || 0.5} km`}
              </h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Patient: <span className="font-bold text-gray-900">{request.patient_first_name}</span> ·{' '}
              {request.blood_group} · {request.units_needed} unit(s)
            </p>
          </div>

          <div className="text-left sm:text-right bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
            <div className="text-2xl font-black text-blood-600">
              {request.accepted_count} / {request.units_needed}
            </div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              Donors Confirmed
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-blood-600 h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (request.accepted_count / (request.units_needed || 1)) * 100)}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{request.contacts_count || 0} donors contacted</span>
          <span>Hospital: {request.hospital_name}</span>
        </div>
      </div>

      {/* Gate modal when waiting_requester */}
      {request.status === 'waiting_requester' && (
        <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-3xl space-y-4 animate-in fade-in">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-lg">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <span>Search further around hospital?</span>
          </div>
          <p className="text-sm text-amber-800 leading-relaxed">
            {request.pending_gate_km >= 100
              ? tGate('body_100')
              : `We searched up to ${request.approved_up_to_km} km. Would you like to continue searching further to ${request.pending_gate_km} km?`}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleGateDecision(true)}
              className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition-colors shadow-xs"
            >
              {tGate('yes')}
            </button>
            <button
              type="button"
              onClick={() => handleGateDecision(false)}
              className="py-3 px-4 bg-white hover:bg-gray-100 text-gray-800 font-bold text-sm rounded-xl border border-gray-300 transition-colors"
            >
              {tGate('no')}
            </button>
          </div>
        </div>
      )}

      {/* Exhausted notice */}
      {request.exhausted_at && (
        <div className="p-6 bg-gray-900 text-white rounded-3xl space-y-3">
          <div className="flex items-center gap-2 font-bold text-base text-red-400">
            <ShieldAlert className="w-5 h-5" />
            <span>{tExhausted('title')}</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {tExhausted('body')}
          </p>
        </div>
      )}

      {/* Confirmed Donors Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blood-600" />
          <span>Responding Donors ({donorCards.length})</span>
        </h2>

        {donorCards.map((card) => (
          <div
            key={card.contact_id}
            className={`p-5 rounded-3xl border transition-all ${
              card.is_standby
                ? 'bg-amber-50/50 border-amber-200'
                : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-gray-900 text-lg">{card.first_name}</h3>
                  <span className="px-2 py-0.5 bg-blood-50 text-blood-700 border border-blood-200 text-xs font-black rounded-lg">
                    {card.blood_group}
                  </span>
                  {card.is_standby && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg">
                      Standby
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {card.distance_band}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ETA: ~{card.eta_minutes || 30} mins
                  </span>
                </div>
              </div>

              {/* Call button */}
              <div>
                <button
                  type="button"
                  onClick={() => handleCallDonor(card.contact_id)}
                  disabled={revealingPhone === card.contact_id}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                >
                  {revealingPhone === card.contact_id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Phone className="w-4 h-4" />
                      <span>{phoneMap[card.contact_id] ? 'Call Now' : 'Call'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Donation Code Confirmation section */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit code from donor"
                value={confirmCodeInput[card.contact_id] || ''}
                onChange={(e) =>
                  setConfirmCodeInput({ ...confirmCodeInput, [card.contact_id]: e.target.value })
                }
                className="w-full sm:w-64 p-2 text-xs border border-gray-300 rounded-xl font-mono tracking-widest text-center"
              />
              <button
                type="button"
                onClick={() => handleConfirmDonation(card.contact_id)}
                disabled={confirmingContact === card.contact_id}
                className="w-full sm:w-auto px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
              >
                {confirmingContact === card.contact_id ? 'Confirming...' : 'Confirm Donation'}
              </button>
            </div>
          </div>
        ))}

        {donorCards.length === 0 && !isClosed && (
          <div className="p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-blood-600 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">{tLive('waiting_answers')}</p>
            <p className="text-xs text-gray-500">
              WhatsApp alerts and automated calls are ringing nearby registered donors right now.
            </p>
          </div>
        )}
      </div>

      {/* Close and cancel actions */}
      {!isClosed && (
        <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
          <button
            type="button"
            onClick={handleCancelRequest}
            className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
          >
            Cancel Request
          </button>

          <span className="text-xs text-gray-400">Request ID: {requestId.slice(0, 8)}...</span>
        </div>
      )}
    </div>
  );
}

