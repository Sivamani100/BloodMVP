'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Heart,
  Calendar,
  Zap,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Users,
  Building2,
  Award,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="w-full min-h-screen bg-[#F2F2F7] pb-16 font-sans">
      <div className="max-w-md mx-auto px-4 pt-3.5 space-y-4">
        {/* ==================================================================== */}
        {/* 1. PRIMARY HERO CARD: "I NEED BLOOD" (Sketched Main Emergency Focus) */}
        {/* ==================================================================== */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#FF2D55] via-[#E11D48] to-[#9F1239] p-6 text-white shadow-[0_16px_36px_-6px_rgba(225,29,72,0.38)]">
          {/* Ambient iOS liquid glass reflections */}
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-20 w-64 h-64 rounded-full bg-black/15 blur-2xl pointer-events-none" />

          {/* Concentric radar rings background effect */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-64 h-64 pointer-events-none opacity-20">
            <div className="w-full h-full rounded-full border border-white animate-ping" />
            <div className="absolute inset-4 rounded-full border border-white/60" />
            <div className="absolute inset-12 rounded-full border border-white/40" />
          </div>

          <div className="relative z-10 space-y-4">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-white">
                Live 24/7 Dispatch · Within 5 km
              </span>
            </div>

            {/* Headline & Description */}
            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-[34px] font-black tracking-tight leading-[1.1] text-white">
                Need Blood Right Now?
              </h1>
              <p className="text-sm font-medium text-white/90 leading-relaxed pr-2">
                Connects directly with verified nearby donors and hospital blood centers in minutes.
              </p>
            </div>

            {/* Micro Feature Assurance Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs text-[11px] font-bold text-white border border-white/10">
                ⚡ 10-Min Fast Waves
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs text-[11px] font-bold text-white border border-white/10">
                📍 GPS Match
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs text-[11px] font-bold text-white border border-white/10">
                🛡️ 100% Free
              </span>
            </div>

            {/* Primary Action Button (Tactile iOS Pill) */}
            <div className="pt-2">
              <Link
                href="/need-blood"
                className="w-full py-4 px-6 rounded-2xl bg-white text-[#E11D48] font-black text-base shadow-lg shadow-black/15 flex items-center justify-center gap-2.5 hover:bg-rose-50 active:scale-[0.98] transition-all group"
              >
                <Zap className="w-5 h-5 fill-[#E11D48] text-[#E11D48] group-hover:scale-110 transition-transform" />
                <span>Find Blood Donors Now</span>
                <ArrowRight className="w-4 h-4 text-[#E11D48] group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </Link>
            </div>

            {/* Secondary Link Inside Hero */}
            <div className="text-center pt-0.5">
              <Link
                href="/need-blood"
                className="inline-flex items-center gap-1 text-xs font-semibold text-white/80 hover:text-white transition-colors"
              >
                <span>Or check live blood bank stock near you</span>
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.2} />
              </Link>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 2. DUAL ACTION SQUARE BOXES: "DONATE >" & "CAMPS >" (No Matter/Text) */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Square Box 1: Donate */}
          <Link
            href="/become-donor"
            className="group relative aspect-square rounded-[30px] p-5 bg-white border border-black/[0.04] shadow-xs hover:shadow-md active:scale-[0.96] transition-all flex flex-col justify-between overflow-hidden"
          >
            {/* Background Icon Watermark */}
            <Heart
              className="absolute -right-4 -bottom-4 w-32 h-32 text-rose-500/[0.08] pointer-events-none group-hover:scale-110 group-hover:text-rose-500/[0.12] transition-all duration-300"
              strokeWidth={1.5}
            />

            {/* Top iOS App Squircle */}
            <div className="w-12 h-12 rounded-[18px] bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] shadow-2xs group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 fill-[#E11D48] text-[#E11D48]" strokeWidth={2} />
            </div>

            {/* Bottom: "Donate >" */}
            <div className="relative z-10 flex items-center justify-between w-full pt-2">
              <span className="text-xl font-black tracking-tight text-gray-950 group-hover:text-[#E11D48] transition-colors">
                Donate
              </span>
              <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#E11D48] group-hover:bg-[#E11D48] group-hover:text-white group-hover:translate-x-1 transition-all">
                <ChevronRight className="w-4 h-4" strokeWidth={2.8} />
              </div>
            </div>
          </Link>

          {/* Square Box 2: Camps */}
          <Link
            href="/how-it-works"
            className="group relative aspect-square rounded-[30px] p-5 bg-white border border-black/[0.04] shadow-xs hover:shadow-md active:scale-[0.96] transition-all flex flex-col justify-between overflow-hidden"
          >
            {/* Background Icon Watermark */}
            <Calendar
              className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-500/[0.08] pointer-events-none group-hover:scale-110 group-hover:text-amber-500/[0.12] transition-all duration-300"
              strokeWidth={1.5}
            />

            {/* Top iOS App Squircle */}
            <div className="w-12 h-12 rounded-[18px] bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6 text-amber-600" strokeWidth={2.2} />
            </div>

            {/* Bottom: "Camps >" */}
            <div className="relative z-10 flex items-center justify-between w-full pt-2">
              <span className="text-xl font-black tracking-tight text-gray-950 group-hover:text-amber-600 transition-colors">
                Camps
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white group-hover:translate-x-1 transition-all">
                <ChevronRight className="w-4 h-4" strokeWidth={2.8} />
              </div>
            </div>
          </Link>
        </div>

        {/* ==================================================================== */}
        {/* 3. FEATURE BANNER: "NATIONAL BLOOD DAY" (Sketched Horizontal Banner) */}
        {/* ==================================================================== */}
        <Link
          href="/how-it-works"
          className="group block relative overflow-hidden rounded-[26px] bg-gradient-to-r from-rose-50/90 via-amber-50/70 to-rose-50/90 p-4.5 border border-rose-200/60 shadow-xs hover:shadow-md active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white shadow-xs border border-rose-100 flex items-center justify-center text-[#E11D48] shrink-0 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5 text-[#E11D48]" strokeWidth={2.2} />
            </div>

            <div className="grow min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700">
                  National Voluntary Blood Donation Day
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-gray-900 leading-tight truncate">
                One Drop of Humanity. Give Blood, Save Lives.
              </h3>
              <p className="text-[11px] text-gray-500 font-medium leading-tight">
                Honoring voluntary lifesavers across India.
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all shrink-0" strokeWidth={2.5} />
          </div>
        </Link>

        {/* ==================================================================== */}
        {/* 4. METRICS / STATS ROW: "56 LAKH" / "4.7K" / "2.7L" (Sketched 3 Boxes)*/}
        {/* ==================================================================== */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Stat 1: 56 L Registered Donors */}
          <div className="p-4 rounded-[24px] bg-white border border-black/[0.04] shadow-xs text-center flex flex-col items-center justify-center space-y-1">
            <div className="w-7 h-7 rounded-full bg-rose-50 text-[#E11D48] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" strokeWidth={2.4} />
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none pt-0.5">
              56 L+
            </div>
            <div className="text-[10px] text-gray-500 font-semibold leading-tight">
              Registered Donors
            </div>
          </div>

          {/* Stat 2: 4.7 K Blood Centers */}
          <div className="p-4 rounded-[24px] bg-white border border-black/[0.04] shadow-xs text-center flex flex-col items-center justify-center space-y-1">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" strokeWidth={2.4} />
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none pt-0.5">
              4.7 K
            </div>
            <div className="text-[10px] text-gray-500 font-semibold leading-tight">
              Blood Centers
            </div>
          </div>

          {/* Stat 3: 2.7 L Camps Organised */}
          <div className="p-4 rounded-[24px] bg-white border border-black/[0.04] shadow-xs text-center flex flex-col items-center justify-center space-y-1">
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2.4} />
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none pt-0.5">
              2.7 L
            </div>
            <div className="text-[10px] text-gray-500 font-semibold leading-tight">
              Camps Held
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 5. TRUST & SAFETY ASSURANCE PILL (iOS Clean Health Footer)           */}
        {/* ==================================================================== */}
        <div className="p-3.5 rounded-[22px] bg-white/80 backdrop-blur-xs border border-black/[0.04] text-center shadow-2xs">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.4} />
            <span>
              <strong className="text-gray-900 font-bold">100% Voluntary & Free:</strong> Blood is a gift of life and is never sold.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
