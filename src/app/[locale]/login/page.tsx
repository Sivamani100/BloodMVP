'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { normalizePhone, isValidIndianMobile } from '@/server/security/allowlist';
import { RaktKhojLogo } from '@/components/ui/RaktKhojLogo';
import { KeyRound, Loader2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

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
    <div className="w-full min-h-screen bg-white flex flex-col justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <RaktKhojLogo className="w-14 h-14" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            {step === 'phone' ? 'Sign in to RaktKhoj' : 'Enter verification code'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto">
            {step === 'phone'
              ? 'Enter your mobile number to receive a secure login code via WhatsApp'
              : 'Enter the 6-digit code sent to your WhatsApp'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-[#F9FAFB] p-6 rounded-3xl border border-gray-200/80 shadow-xs">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone.replace(/^\+?91/, '')}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98494 97911"
                    className="w-full pl-14 pr-4 py-3.5 text-base bg-white border border-gray-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-red-500 font-bold tracking-wider text-gray-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.replace(/\D/g, '').length < 10}
                className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  6-Digit OTP
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-11 pr-4 py-3.5 text-center text-2xl font-mono tracking-widest bg-white border border-gray-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-red-500 font-bold text-gray-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Verify and Sign In</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                }}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-800 font-medium pt-1"
              >
                Change mobile number
              </button>
            </form>
          )}

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Secure passwordless authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
