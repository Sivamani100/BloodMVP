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
    <div className="w-full min-h-screen bg-[#F2F2F7] pb-24 text-gray-900">
      <WizardHeader
        title="Donor Profile"
        onBack={() => router.push('/')}
        showClose={false}
      />

      <div className="max-w-md mx-auto px-4 pt-3 space-y-3.5">
        {/* Status Card (Floating Squircle) */}
        <div className="p-4 rounded-[22px] bg-white border border-black/[0.06] shadow-ios-floating space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  donor.state === 'active' && !isPaused
                    ? 'bg-[#34C759] ring-4 ring-[#34C759]/20'
                    : isPaused
                    ? 'bg-[#FF9500] ring-4 ring-[#FF9500]/20'
                    : 'bg-gray-400'
                }`}
              />
              <span className="font-bold text-[17px] text-gray-950 tracking-tight">
                {donor.state === 'active' && !isPaused
                  ? 'Active Donor'
                  : isPaused
                  ? 'Alerts Paused'
                  : 'Pending Verification'}
              </span>
            </div>

            <div className="px-3 py-1 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[12px] font-bold text-[#FF3B30]">
              {donor.blood_group || 'O+'}
            </div>
          </div>

          <div className="pt-0.5">
            <h2 className="font-bold text-[20px] text-gray-950 tracking-tight">{donor.full_name}</h2>
            <p className="text-[13px] text-[#8E8E93] mt-0.5">
              Verified mobile · Rajahmundry, East Godavari
            </p>
          </div>

          <div className="pt-2.5 hairline-t flex items-center justify-between text-[13px]">
            <span className="text-[#8E8E93] font-medium">Donations Verified</span>
            <span className="font-semibold text-gray-950 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#FF9500]" />
              <span>{donor.donations_count || 0} times</span>
            </span>
          </div>
        </div>

        {/* Next Eligible Date (Floating Capsule) */}
        {donor.next_eligible_date && (
          <div className="p-4 rounded-[20px] bg-[#34C759]/10 border border-[#34C759]/20 shadow-ios-floating flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[#34C759] shrink-0" />
            <p className="text-[13px] font-semibold text-[#1C7430] leading-snug">
              Eligible to donate again on {donor.next_eligible_date}
            </p>
          </div>
        )}

        {/* Pause Alerts Card (Floating Squircle) */}
        <div className="p-4 rounded-[22px] bg-white border border-black/[0.06] shadow-ios-floating space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8E8E93]" />
            <h3 className="font-semibold text-[15px] text-gray-950">Pause Emergency Alerts</h3>
          </div>
          <p className="text-[13px] text-[#8E8E93] leading-relaxed">
            Temporarily travelling or unwell? Pause emergency calls and WhatsApp requests anytime.
          </p>

          {isPaused ? (
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#B25E00] bg-[#FF9500]/15 px-3 py-1.5 rounded-[12px] border border-[#FF9500]/25">
                Paused until {new Date(donor.paused_until).toLocaleDateString()}
              </span>
              <button
                type="button"
                onClick={() => handlePauseAlerts(null)}
                disabled={pausing}
                className="py-2 px-4 bg-[#34C759] hover:bg-[#28A745] text-white font-semibold text-[13px] rounded-[12px] shadow-sm transition-colors ios-press"
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
                  className="flex-1 py-2.5 px-3 bg-[#767680]/8 hover:bg-[#767680]/15 text-gray-900 font-semibold text-[13px] rounded-[12px] border border-black/[0.05] transition-colors ios-press"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Account controls (Grouped Inset List) */}
        <div className="p-1 rounded-[22px] bg-white border border-black/[0.06] shadow-ios-floating divide-y divide-black/[0.06] overflow-hidden text-[15px]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-4 py-3 flex items-center justify-between text-gray-900 hover:bg-black/[0.02] font-medium transition-colors ios-press-subtle"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-[8px] bg-[#8E8E93]/15 text-gray-700 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <span>Sign Out</span>
            </div>
            <span className="text-[#C7C7CC]">›</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="w-full px-4 py-3 flex items-center justify-between text-[#FF3B30] hover:bg-red-50/50 font-medium transition-colors ios-press-subtle"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-[8px] bg-[#FF3B30]/12 text-[#FF3B30] flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <span>Delete Donor Account</span>
            </div>
            <span className="text-[#FF3B30]/40">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
