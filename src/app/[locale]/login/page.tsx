'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { normalizePhone, isValidIndianMobile } from '@/server/security/allowlist';
import { Phone, KeyRound, Loader2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const router = useRouter();

  const [phone, setPhone] = useState('');
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
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-blood-50 text-blood-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Phone className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-950">
            {step === 'phone' ? t('enter_phone') : t('enter_code')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {step === 'phone'
              ? 'We will send a 6-digit login code to your WhatsApp'
              : t('otp_sent')}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-3 text-sm font-bold text-gray-400">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone.replace(/^\+?91/, '')}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Mobile number (10 digits)"
                className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500 font-semibold tracking-wider"
              />
            </div>

            <button
              type="submit"
              disabled={loading || phone.replace(/\D/g, '').length < 10}
              className="w-full flex items-center justify-center gap-2 bg-blood-600 hover:bg-blood-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blood-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{t('send_code')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="relative">
              <KeyRound className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit OTP"
                className="w-full pl-11 pr-4 py-3 text-center text-xl font-mono tracking-widest border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500 font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-blood-600 hover:bg-blood-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blood-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>{t('verify_and_login')}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtp('');
              }}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-800 font-medium"
            >
              Change phone number
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>No passwords. Safe OTP delivered via WhatsApp.</span>
        </div>
      </div>
    </div>
  );
}

