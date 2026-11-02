'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { normalizePhone, isValidIndianMobile } from '@/server/security/allowlist';
import { RaktKhojLogo } from '@/components/ui/RaktKhojLogo';
import { KeyRound, Loader2, ArrowRight, ShieldCheck, AlertCircle, ChevronLeft } from 'lucide-react';

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
    <div className="w-full min-h-screen bg-[#F2F2F7] flex flex-col justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto space-y-5">
        {/* iOS Back Button if in OTP step */}
        {step === 'otp' && (
          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setOtp('');
              setErrorMsg(null);
            }}
            className="-ml-1 inline-flex items-center gap-0.5 text-[#007AFF] hover:opacity-80 active:opacity-50 transition-all select-none"
          >
            <ChevronLeft className="w-5 h-5 -mr-1" strokeWidth={2.5} />
            <span className="text-[17px] font-normal leading-none tracking-[-0.01em]">Change Number</span>
          </button>
        )}

        {/* Header Icon & Title */}
        <div className="text-center space-y-2 pt-2">
          <div className="flex justify-center">
            <RaktKhojLogo className="w-16 h-16 rounded-[16px] shadow-sm" />
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-gray-950 tracking-[-0.02em] leading-tight">
            {step === 'phone' ? 'Sign in to RaktKhoj' : 'Verification Code'}
          </h1>
          <p className="text-[15px] text-[#8E8E93] max-w-xs mx-auto leading-snug">
            {step === 'phone'
              ? 'Enter your mobile number to receive a secure login code via WhatsApp & SMS'
              : `Enter the 6-digit code sent to +91 ${phone.replace(/\D/g, '')}`}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-[14px] text-[13px] text-[#FF3B30] flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#FF3B30]" strokeWidth={2} />
            <span className="font-medium leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Inset Grouped Container */}
        <div className="bg-white p-5 rounded-[20px] border border-black/[0.06] shadow-ios-card">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                {/* iOS Settings Grouped Input Row */}
                <div className="relative flex items-center bg-[#767680]/[0.08] rounded-[12px] px-3.5 py-3 border border-transparent focus-within:border-[#007AFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#007AFF]/15 transition-all">
                  <span className="text-[17px] font-semibold text-[#8E8E93] mr-2 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone.replace(/^\+?91/, '')}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98494 97911"
                    className="w-full bg-transparent text-[17px] font-semibold text-gray-900 focus:outline-hidden tracking-wide"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.replace(/\D/g, '').length < 10}
                className="w-full h-12 rounded-[12px] font-semibold text-[17px] bg-[#FF3B30] text-white shadow-sm ios-press flex items-center justify-center gap-2 disabled:opacity-40 transition-all select-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.2} />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 text-center">
                  6-Digit OTP Code
                </label>
                <div className="relative flex items-center justify-center bg-[#767680]/[0.08] rounded-[12px] px-3.5 py-3 border border-transparent focus-within:border-[#007AFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#007AFF]/15 transition-all">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center text-[28px] font-mono tracking-[0.4em] bg-transparent font-bold text-gray-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-12 rounded-[12px] font-semibold text-[17px] bg-[#34C759] text-white shadow-sm ios-press flex items-center justify-center gap-2 disabled:opacity-40 transition-all select-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.2} />
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
                className="w-full text-center text-[13px] text-[#007AFF] hover:underline font-medium pt-1"
              >
                Change mobile number
              </button>
            </form>
          )}

          <div className="pt-3.5 mt-3.5 border-t border-black/[0.06] flex items-center justify-center gap-1.5 text-[12px] text-[#8E8E93]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34C759] shrink-0" strokeWidth={2} />
            <span>Encrypted passwordless authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
