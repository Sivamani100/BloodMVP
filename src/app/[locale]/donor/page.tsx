'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import {
  Heart,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  Trash2,
  LogOut,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
} from 'lucide-react';

export default function DonorDashboard() {
  const tDonor = useTranslations('donor');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [donor, setDonor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pausing, setPausing] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchDonorData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?next=/donor');
        return;
      }

      const { data } = await supabase.from('donors').select('*').eq('id', user.id).single();
      if (data) {
        setDonor(data);
      }
      setLoading(false);
    }

    fetchDonorData();
  }, [router]);

  async function handlePauseAlerts(days: number | null) {
    setPausing(true);
    try {
      const res = await fetch('/api/donor/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days, resume: days === null }),
      });
      if (res.ok) {
        const { paused_until } = await res.json();
        setDonor((prev: any) => ({ ...prev, paused_until }));
      }
    } catch (err) {
      console.error('Pause error:', err);
    } finally {
      setPausing(false);
    }
  }

  async function handleDeleteAccount() {
    if (
      !confirm(
        'Are you sure you want to delete your donor account? All your personal information, location, and health records will be permanently erased.'
      )
    ) {
      return;
    }

    try {
      const res = await fetch('/api/donor', { method: 'DELETE' });
      if (res.ok) {
        alert('Your account and private data have been completely deleted.');
        router.push('/');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return <div className="p-12 text-center text-sm text-gray-500">Loading donor profile...</div>;
  }

  if (!donor) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Heart className="w-12 h-12 text-gray-300 mx-auto" />
        <h1 className="text-xl font-bold text-gray-900">No Donor Profile Found</h1>
        <p className="text-sm text-gray-600">Register as a volunteer blood donor to start saving lives.</p>
        <button
          onClick={() => router.push('/become-donor')}
          className="px-6 py-3 bg-blood-600 text-white font-bold rounded-2xl shadow-md"
        >
          Register Now
        </button>
      </div>
    );
  }

  const isPaused = donor.paused_until && new Date(donor.paused_until) > new Date();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header status card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                donor.state === 'active' && !isPaused
                  ? 'bg-emerald-500'
                  : isPaused
                  ? 'bg-amber-500'
                  : 'bg-gray-400'
              }`}
            />
            <h1 className="text-2xl font-black text-gray-950">
              {donor.state === 'active' && !isPaused
                ? tDonor('state_active')
                : isPaused
                ? 'Alerts Paused'
                : tDonor('state_pending')}
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            {donor.full_name} · Group:{' '}
            <span className="font-extrabold text-blood-700">{donor.blood_group || 'Not set'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-blood-50 text-blood-700 border border-blood-200 px-3 py-1.5 rounded-xl font-bold text-xs">
            <Award className="w-4 h-4" />
            <span>{donor.donations_count || 0} Donations Verified</span>
          </span>
        </div>
      </div>

      {/* Next eligible date */}
      {donor.next_eligible_date && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
          <Calendar className="w-5 h-5 text-emerald-700 shrink-0" />
          <p className="text-sm font-semibold text-emerald-900">
            {tDonor('next_eligible', { date: donor.next_eligible_date })}
          </p>
        </div>
      )}

      {/* Pause Alerts Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <span>Pause Emergency Alerts</span>
        </h2>
        <p className="text-xs text-gray-500">
          Going on travel or temporarily unwell? Pause alerts anytime. You will not receive calls or WhatsApp requests while paused.
        </p>

        {isPaused ? (
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              Paused until {new Date(donor.paused_until).toLocaleDateString()}
            </span>
            <button
              type="button"
              onClick={() => handlePauseAlerts(null)}
              disabled={pausing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Resume Alerts Now
            </button>
          </div>
        ) : (
          <div className="flex gap-2 pt-1">
            {[
              { label: '7 days', days: 7 },
              { label: '30 days', days: 30 },
              { label: '90 days', days: 90 },
            ].map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => handlePauseAlerts(p.days)}
                disabled={pausing}
                className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold text-xs rounded-xl border border-gray-200 transition-colors"
              >
                Pause {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Account controls */}
      <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900"
        >
          <LogOut className="w-4 h-4" />
          <span>{tCommon('logout')}</span>
        </button>

        <button
          type="button"
          onClick={handleDeleteAccount}
          className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800"
        >
          <Trash2 className="w-4 h-4" />
          <span>{tDonor('delete')}</span>
        </button>
      </div>
    </div>
  );
}

