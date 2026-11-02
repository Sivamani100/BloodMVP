import React from 'react';
import { useTranslations } from 'next-intl';
import { PhoneCall, ShieldCheck, Heart, Radio, MapPin, CheckCircle2, Zap, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function HowItWorksPage() {
  const t = useTranslations('home');

  return (
    <div className="w-full px-4 py-6 space-y-6">
      {/* Header with back */}
      <div className="space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          How Blood<span className="text-rose-600">MVP</span> Works
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          Connecting families in critical need with willing, verified donors near the hospital in minutes.
        </p>
      </div>

      <div className="space-y-3.5">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-rose-50 text-rose-600 font-black text-xs flex items-center justify-center border border-rose-100">
              1
            </div>
            <h2 className="text-sm font-bold text-slate-900">Immediate Blood Bank Check</h2>
          </div>
          <p className="text-xs text-slate-600 pl-11 leading-relaxed">
            When you pick a blood group and hospital, BloodMVP first displays nearby licensed blood banks with their latest stock. If units are available, you can call directly.
          </p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-rose-50 text-rose-600 font-black text-xs flex items-center justify-center border border-rose-100">
              2
            </div>
            <h2 className="text-sm font-bold text-slate-900">Simultaneous Call + WhatsApp Alert</h2>
          </div>
          <p className="text-xs text-slate-600 pl-11 leading-relaxed">
            Pressing &quot;Search donors&quot; activates our matching engine. Registered donors in widening PostGIS distance rings receive an automated Twilio voice call and an interactive WhatsApp card simultaneously in Telugu, Hindi or English.
          </p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-rose-50 text-rose-600 font-black text-xs flex items-center justify-center border border-rose-100">
              3
            </div>
            <h2 className="text-sm font-bold text-slate-900">Medical Triage & Verification Code</h2>
          </div>
          <p className="text-xs text-slate-600 pl-11 leading-relaxed">
            Donors confirm quick eligibility questions (alcohol, recent donations, health). Accepted donors receive a confidential 6-digit Donation Code for safe, spam-free hospital arrival.
          </p>
        </div>
      </div>

      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3 text-emerald-950 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <span className="leading-snug">
          <strong>100% Free:</strong> BloodMVP never charges any money and never asks for financial OTPs.
        </span>
      </div>
    </div>
  );
}
