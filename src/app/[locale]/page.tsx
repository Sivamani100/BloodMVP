'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  CupertinoBoltFill,
  CupertinoChevronRight,
  CupertinoHeartFill,
  CupertinoCalendar,
  CupertinoRosette,
  CupertinoPerson2Fill,
  CupertinoCrossCaseFill,
  CupertinoSparkles,
  CupertinoCheckmarkShieldFill,
} from '@/components/ui/CupertinoIcons';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="w-full min-h-screen bg-[#FAFAFC] pb-28 font-sans relative overflow-x-hidden">
      {/* Ambient soft glow matching the iOS reference screenshot */}
      <div className="pointer-events-none absolute -top-24 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-rose-100/40 via-pink-100/30 to-transparent blur-3xl -z-10" />

      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-2 space-y-6">
        {/* ==================================================================== */}
        {/* 1. PRIMARY HERO CARD: "I NEED BLOOD" (Sketched Main Big Focus Card)  */}
        {/* ==================================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF2D55] via-[#E11D48] to-[#9F1239] p-6 sm:p-7 text-white shadow-lg border border-white/20">
          {/* Ambient iOS reflections */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -left-24 w-80 h-80 rounded-full bg-black/20 blur-2xl pointer-events-none" />

          {/* Concentric radar rings */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-80 h-80 pointer-events-none opacity-25">
            <div className="w-full h-full rounded-full border-2 border-white animate-ping" />
            <div className="absolute inset-6 rounded-full border border-white/60" />
            <div className="absolute inset-16 rounded-full border border-white/40" />
          </div>

          <div className="relative z-10 space-y-4">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Live 24/7 Dispatch · Within 5 km
              </span>
            </div>

            {/* Headline & Description */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-white">
                Need Blood Right Now?
              </h1>
              <p className="text-base text-white/95 font-normal leading-relaxed pr-2">
                Connects directly with verified nearby donors &amp; hospital blood centers in minutes.
              </p>
            </div>

            {/* Micro Feature Assurance Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="px-3 py-1 rounded-xl bg-white/15 text-xs font-bold text-white border border-white/20">
                ⚡ 10-Min Fast Waves
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/15 text-xs font-bold text-white border border-white/20">
                📍 PostGIS GPS Match
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/15 text-xs font-bold text-white border border-white/20">
                🛡️ 100% Free
              </span>
            </div>

            {/* Primary Action Button (Tactile Cupertino Pill Button) */}
            <div className="pt-2">
              <Link
                href="/need-blood"
                className="w-full h-14 sm:h-15 rounded-2xl bg-white text-[#E11D48] font-bold text-lg shadow-md flex items-center justify-center gap-3 hover:bg-rose-50 active:scale-[0.98] transition-all group"
              >
                <CupertinoBoltFill className="w-6 h-6 text-[#E11D48] group-hover:scale-110 transition-transform" />
                <span>Find Blood Donors Now</span>
                <CupertinoChevronRight className="w-5 h-5 text-[#E11D48] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Secondary Link Inside Hero */}
            <div className="text-center pt-0.5">
              <Link
                href="/need-blood"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-white/90 hover:text-white transition-colors"
              >
                <span>Or check live blood bank stock near you</span>
                <CupertinoChevronRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 2. DUAL ACTION SQUARE BOXES: "DONATE >" & "CAMPS >" (No Matter/Text) */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-2 gap-4">
          {/* Square Box 1: Donate */}
          <Link
            href="/become-donor"
            className="group relative aspect-square rounded-3xl p-5 sm:p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.96] transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            {/* Background Cupertino Watermark Icon: heart.fill */}
            <CupertinoHeartFill className="absolute -right-5 -bottom-5 w-36 h-36 text-rose-500/[0.08] pointer-events-none group-hover:scale-105 transition-all duration-300" />

            {/* Top Cupertino App Squircle */}
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] shadow-xs group-hover:scale-105 transition-transform">
              <CupertinoHeartFill className="w-7 h-7 text-[#E11D48]" />
            </div>

            {/* Bottom: "Donate >" */}
            <div className="relative z-10 flex items-center justify-between w-full pt-3">
              <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-[#E11D48] transition-colors">
                Donate
              </span>
              <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-[#E11D48] group-hover:bg-[#E11D48] group-hover:text-white group-hover:translate-x-1 transition-all">
                <CupertinoChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Square Box 2: Camps */}
          <Link
            href="/how-it-works"
            className="group relative aspect-square rounded-3xl p-5 sm:p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.96] transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            {/* Background Cupertino Watermark Icon: calendar */}
            <CupertinoCalendar className="absolute -right-5 -bottom-5 w-36 h-36 text-amber-500/[0.08] pointer-events-none group-hover:scale-105 transition-all duration-300" />

            {/* Top Cupertino App Squircle */}
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs group-hover:scale-105 transition-transform">
              <CupertinoCalendar className="w-7 h-7 text-amber-600" />
            </div>

            {/* Bottom: "Camps >" */}
            <div className="relative z-10 flex items-center justify-between w-full pt-3">
              <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-amber-600 transition-colors">
                Camps
              </span>
              <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white group-hover:translate-x-1 transition-all">
                <CupertinoChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>

        {/* ==================================================================== */}
        {/* 3. FEATURE BANNER: "NATIONAL BLOOD DAY" (Sketched Horizontal Banner) */}
        {/* ==================================================================== */}
        <Link
          href="/how-it-works"
          className="group block relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 p-4 sm:p-5 border border-rose-100 shadow-xs hover:shadow-sm active:scale-[0.99] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-xl bg-white shadow-xs border border-rose-100 flex items-center justify-center text-[#E11D48] shrink-0 group-hover:scale-105 transition-transform">
              <CupertinoRosette className="w-7 h-7 text-[#E11D48]" />
            </div>

            <div className="grow min-w-0 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  National Voluntary Blood Donation Day
                </span>
              </div>
              <h3 className="font-bold text-base text-gray-900 leading-tight truncate">
                One Drop of Humanity. Give Blood, Save Lives.
              </h3>
              <p className="text-xs text-gray-500 font-normal leading-tight">
                Honoring voluntary lifesavers and medical heroes across India.
              </p>
            </div>

            <CupertinoChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-800 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </Link>

        {/* ==================================================================== */}
        {/* 4. METRICS / STATS ROW: "56 LAKH" / "4.7K" / "2.7L" (Sketched 3 Boxes)*/}
        {/* ==================================================================== */}
        <div className="grid grid-cols-3 gap-3">
          {/* Stat 1: 56 L Registered Donors */}
          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs text-center flex flex-col items-center justify-center space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#E11D48] flex items-center justify-center">
              <CupertinoPerson2Fill className="w-4 h-4 text-[#E11D48]" />
            </div>
            <div className="text-2xl font-bold text-gray-900 tracking-tight leading-none pt-0.5">
              56 L+
            </div>
            <div className="text-xs text-gray-500 font-normal leading-tight">
              Registered Donors
            </div>
          </div>

          {/* Stat 2: 4.7 K Blood Centers */}
          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs text-center flex flex-col items-center justify-center space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CupertinoCrossCaseFill className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 tracking-tight leading-none pt-0.5">
              4.7 K
            </div>
            <div className="text-xs text-gray-500 font-normal leading-tight">
              Blood Centers
            </div>
          </div>

          {/* Stat 3: 2.7 L Camps Organised */}
          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs text-center flex flex-col items-center justify-center space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CupertinoSparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 tracking-tight leading-none pt-0.5">
              2.7 L
            </div>
            <div className="text-xs text-gray-500 font-normal leading-tight">
              Camps Held
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 5. TRUST & SAFETY ASSURANCE PILL (iOS Clean Health Footer)           */}
        {/* ==================================================================== */}
        <div className="p-4 rounded-2xl bg-white border border-gray-100 text-center shadow-xs">
          <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm text-gray-700 font-normal">
            <CupertinoCheckmarkShieldFill className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              <strong className="text-gray-900 font-bold">100% Voluntary &amp; Free:</strong> Blood is a sacred gift of life and is never sold.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
