'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { WizardHeader } from '@/components/ui/WizardHeader';
import {
  Heart,
  Clock,
  Award,
  Calendar,
  LogOut,
  Trash2,
  CheckCircle2,
  Loader2,
  ShieldCheck,
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
  }, [router, supabase]);

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
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="text-sm font-semibold text-gray-700">Loading donor profile...</p>
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col justify-center px-4 py-8">
        <div className="max-w-md w-full mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <Heart className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-950">No Donor Profile Found</h1>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Register as a volunteer blood donor to start saving lives in your community.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push('/become-donor')}
              className="py-4 px-8 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/25 active:scale-[0.99] transition-all"
            >
              Register Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPaused = donor.paused_until && new Date(donor.paused_until) > new Date();

  return (
    <div className="w-full min-h-screen bg-white pb-20 text-gray-900">
      <WizardHeader
        title="Donor Profile"
        onBack={() => router.push('/')}
        showClose={false}
      />

      <div className="max-w-md mx-auto px-5 pt-4 space-y-5">
        {/* Status Card */}
        <div className="p-5 rounded-3xl bg-[#F9FAFB] border border-gray-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  donor.state === 'active' && !isPaused
                    ? 'bg-emerald-500 ring-4 ring-emerald-100'
                    : isPaused
                    ? 'bg-amber-500 ring-4 ring-amber-100'
                    : 'bg-gray-400'
                }`}
              />
              <span className="font-black text-lg text-gray-950">
                {donor.state === 'active' && !isPaused
                  ? 'Active Donor'
                  : isPaused
                  ? 'Alerts Paused'
                  : 'Pending Verification'}
              </span>
            </div>

            <div className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-black text-red-600">
              {donor.blood_group || 'O+'}
            </div>
          </div>

          <div className="pt-1">
            <h2 className="font-extrabold text-xl text-gray-950">{donor.full_name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified mobile · Rajahmundry, East Godavari
            </p>
          </div>

          <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Donations Verified</span>
            <span className="font-bold text-gray-950 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{donor.donations_count || 0} times</span>
            </span>
          </div>
        </div>

        {/* Next Eligible Date */}
        {donor.next_eligible_date && (
          <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-200 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-emerald-700 shrink-0" />
            <p className="text-xs font-bold text-emerald-900 leading-snug">
              Eligible to donate again on {donor.next_eligible_date}
            </p>
          </div>
        )}

        {/* Pause Alerts Card */}
        <div className="p-5 rounded-3xl bg-[#F9FAFB] border border-gray-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <h3 className="font-bold text-sm text-gray-900">Pause Emergency Alerts</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Temporarily travelling or unwell? Pause emergency calls and WhatsApp requests anytime.
          </p>

          {isPaused ? (
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                Paused until {new Date(donor.paused_until).toLocaleDateString()}
              </span>
              <button
                type="button"
                onClick={() => handlePauseAlerts(null)}
                disabled={pausing}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Resume Now
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
                  className="flex-1 py-2.5 px-3 bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs rounded-xl border border-gray-200 transition-colors shadow-2xs"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Account controls */}
        <div className="p-5 rounded-3xl bg-[#F9FAFB] border border-gray-200/80 divide-y divide-gray-100 text-xs">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 flex items-center justify-between text-gray-700 hover:text-gray-900 font-bold transition-colors"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-gray-500" />
              <span>Sign Out</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="w-full py-3 flex items-center justify-between text-red-600 hover:text-red-700 font-bold transition-colors"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Delete Donor Account</span>
            </div>
            <span className="text-red-300">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
