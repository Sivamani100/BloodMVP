'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BloodBagVisual } from '@/components/ui/BloodBagVisual';
import {
  Heart,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Zap,
  Activity,
  Building2,
  Clock,
  CheckCircle2,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="w-full bg-white pb-6">
      <div className="px-4 pt-3 space-y-4">
        {/* 1. Live Beacon Indicator Pill */}
        <div className="flex items-center justify-between px-3.5 py-1.5 rounded-full bg-rose-50/80 border border-rose-200/60 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
            </span>
            <span className="text-[11px] font-black text-rose-900 tracking-wide uppercase">
              BloodMVP Dispatch Network
            </span>
          </div>
          <span className="text-[10px] font-semibold text-rose-700 bg-white/80 px-2 py-0.5 rounded-full border border-rose-100">
            Rajahmundry & EG
          </span>
        </div>

        {/* 2. Primary Hero Card: Ultra-Premium Crimson Gradient */}
        <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#E11D48] via-[#BE123C] to-[#4C0519] p-6 text-white shadow-xl shadow-rose-950/20 border border-white/15">
          {/* Ambient Lighting Circles */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-400/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-[64%] space-y-3 pt-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-white tracking-wide uppercase">
              <Activity className="w-3 h-3 text-rose-200 animate-pulse" />
              <span>Rapid Emergency</span>
            </div>

            <h1 className="text-2xl sm:text-[28px] font-black tracking-tight leading-[1.12] text-white">
              Need blood right now?
            </h1>

            <p className="text-xs font-normal text-rose-100/90 leading-relaxed">
              Alert verified nearby donors and local blood centers within minutes.
            </p>

            <div className="pt-2">
              <Link
                href="/need-blood"
                className="inline-flex items-center gap-2 bg-white text-rose-700 hover:bg-rose-50 active:scale-95 font-extrabold text-xs sm:text-sm py-3.5 px-5 rounded-2xl shadow-lg shadow-black/20 transition-all"
              >
                <Zap className="w-4 h-4 fill-rose-600 text-rose-600" />
                <span>Find Donors Now</span>
              </Link>
            </div>
          </div>

          {/* 3D Visual Floating IV Blood Bag */}
          <div className="absolute -top-3 -right-3 w-40 sm:w-44 h-full flex items-center justify-center pointer-events-none">
            <BloodBagVisual className="w-40 h-68 translate-y-3 scale-105" />
          </div>
        </div>

        {/* 3. Dual Action Cards: Donor Signup & Blood Centers */}
        <div className="grid grid-cols-2 gap-3 pt-0.5">
          {/* Card 1: Become a Donor */}
          <Link
            href="/become-donor"
            className="group flex flex-col justify-between p-4 rounded-3xl bg-slate-900 text-white shadow-md shadow-slate-950/10 hover:bg-slate-800 active:scale-[0.98] transition-all min-h-[155px] border border-slate-800 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-500/20 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-400" />
              </div>
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/60">
                Save Lives
              </span>
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-[15px] text-white leading-tight">
                Become a Donor
              </h2>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Join our verified life-saver roster
              </p>
            </div>
          </Link>

          {/* Card 2: Find Blood Banks */}
          <Link
            href="/need-blood"
            className="group flex flex-col justify-between p-4 rounded-3xl bg-[#FAFAFA] border border-slate-200/80 hover:border-rose-200 hover:bg-rose-50/20 active:scale-[0.98] transition-all min-h-[155px] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700">
                <Building2 className="w-5 h-5 text-slate-700" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                14+ Banks
              </span>
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-[15px] text-slate-900 leading-tight">
                Blood Centers
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Stock & direct hotline verification
              </p>
            </div>
          </Link>
        </div>

        {/* 4. Live Safety & Anti-Fraud Pill */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-950">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="leading-snug">
            <strong className="font-black text-emerald-900">BloodMVP Protection:</strong>{' '}
            Zero charges. No money or OTP is ever requested. Final blood screening is performed by hospital staff.
          </div>
        </div>

        {/* 5. Real-Time Performance Grid */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Emergency Metric Engine
            </span>
            <span className="text-[11px] font-medium text-slate-500">Live Telemetry</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 text-center shadow-xs">
              <div className="flex justify-center mb-1">
                <Clock className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-lg font-black text-slate-900 leading-none">
                &lt; 15m
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-semibold leading-tight">
                Match Speed
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 text-center shadow-xs">
              <div className="flex justify-center mb-1">
                <MapPin className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-lg font-black text-slate-900 leading-none">
                PostGIS
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-semibold leading-tight">
                Ring Geo-Match
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 text-center shadow-xs">
              <div className="flex justify-center mb-1">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-black text-slate-900 leading-none">
                Twilio+WA
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-semibold leading-tight">
                Instant IVR Wave
              </div>
            </div>
          </div>
        </div>

        {/* 6. 3-Step "How It Works" Card */}
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              How BloodMVP Works
            </span>
            <Link
              href="/how-it-works"
              className="text-[11px] font-bold text-rose-600 flex items-center gap-0.5"
            >
              <span>Learn more</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
              <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Post Request</h3>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Choose patient blood group, hospital & units needed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
              <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Automated Wave Dispatch</h3>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Our engine alerts nearest donors via WhatsApp buttons & voice calls.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Direct Hospital Arrival</h3>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Donor arrives with secure verification code; zero public numbers leaked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
