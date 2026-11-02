'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { normalizePhone, isValidIndianMobile } from '@/server/security/allowlist';
import { BloodMVPLogo } from '@/components/ui/BloodMVPLogo';
import {
  KeyRound,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const router = useRouter();

  const [phone, setPhone] = useState('9849497911');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const normalized = normalizePhone(phone);
    if (!isValidIndianMobile(normalized)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (+91)');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalized,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setStep('otp');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (otp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const normalized = normalizePhone(phone);
      const { data, error } = await supabase.auth.verifyOtp({
        phone: normalized,
        token: otp.trim(),
        type: 'sms',
      });

      if (error || !data.session) {
        setErrorMsg(error?.message || 'Invalid verification code');
      } else {
        router.push(next as any);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-[85vh] bg-white flex flex-col justify-center px-4 py-6">
      <div className="max-w-md w-full mx-auto space-y-5">
        {/* Top Brand & Header */}
        <div className="text-center space-y-2.5">
          <div className="flex justify-center">
            <BloodMVPLogo className="w-16 h-16" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {step === 'phone' ? (
                <>
                  Sign in to Blood<span className="text-rose-600">MVP</span>
                </>
              ) : (
                'Enter Verification Code'
              )}
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
              {step === 'phone'
                ? 'Enter your mobile number to receive a secure login code via WhatsApp and SMS'
                : `We sent a 6-digit verification code to +91 ${phone.replace(/^\+?91/, '')}`}
            </p>
          </div>
        </div>

        {/* Error Notification Pill */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="font-medium leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Main Card with Premium Mobile Feel */}
        <div className="bg-[#FAFBFD] p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-md shadow-slate-900/5 space-y-4">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 font-black text-xs bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone.replace(/^\+?91/, '')}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98494 97911"
                    className="w-full pl-20 pr-4 py-3.5 text-base bg-white border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-bold tracking-wider text-slate-900 shadow-xs"
                  />
                </div>
              </div>

              {/* Delivery Channels Info Pill */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-rose-600" />
                  <span>Carrier SMS</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Cloud</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.replace(/\D/g, '').length < 10}
                className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-lg shadow-rose-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 text-center">
                  Enter 6-Digit Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full py-4 text-center text-3xl font-mono tracking-[0.5em] bg-white border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-black text-slate-900 shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-lg shadow-rose-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </div>
                )}
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
                >
                  ← Edit number
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-xs text-rose-600 hover:text-rose-700 font-black"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          {/* Security Guarantee */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>BloodMVP Privacy Shield • Passwordless Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
