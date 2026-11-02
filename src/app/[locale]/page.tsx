'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Heart,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Zap,
  Activity,
  Building2,
  Clock,
  PhoneCall,
  Sparkles,
  ArrowRight,
  Radio,
  Droplet,
} from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="w-full px-4 pt-3 pb-8 space-y-4">
      {/* 1. Apple-Style Large Title & Subtitle */}
      <div className="pt-1 pb-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>Live Emergency Network</span>
        </div>
        <h1 className="text-[32px] font-black tracking-tight text-slate-900 leading-none">
          Blood<span className="text-[#E11D48]">MVP</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
          Fast-response blood donor dispatch for Rajahmundry &amp; East Godavari.
        </p>
      </div>

      {/* 2. Apple Fitness/Health Style Emergency Radar Hero Card */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#E11D48] via-[#BE123C] to-[#881337] p-5 sm:p-6 text-white shadow-xl shadow-rose-950/20 border border-white/20">
        {/* Soft background ambient blurs */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-rose-400/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-red-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold text-white tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>Priority 1 Alert</span>
            </span>

            <span className="text-[11px] text-rose-100 font-semibold bg-black/15 px-2 py-0.5 rounded-full">
              Wave 1 &bull; 0.5-5 km
            </span>
          </div>

          <div className="max-w-[75%] space-y-1">
            <h2 className="text-[22px] font-black tracking-tight leading-tight text-white">
              Need blood in an emergency?
            </h2>
            <p className="text-xs text-rose-100/90 leading-relaxed font-normal">
              Alert verified nearby donors and local blood centers in 10-minute waves.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/need-blood"
              className="inline-flex items-center gap-2 bg-white text-[#BE123C] hover:bg-rose-50 active:scale-95 font-black text-xs py-3 px-5 rounded-full shadow-lg shadow-black/20 transition-all"
            >
              <Zap className="w-4 h-4 fill-[#BE123C] text-[#BE123C]" />
              <span>Request Blood Now</span>
            </Link>

            <span className="text-[11px] text-rose-100/80 font-medium">
              &lt; 15m response
            </span>
          </div>
        </div>

        {/* Apple Style Radar Wave Animation on the Right */}
        <div className="absolute top-1/2 -right-6 -translate-y-1/2 w-36 h-36 pointer-events-none flex items-center justify-center opacity-40">
          <div className="absolute w-32 h-32 rounded-full border border-white/25 animate-ping duration-1000" />
          <div className="absolute w-24 h-24 rounded-full border border-white/40 animate-pulse" />
          <div className="absolute w-16 h-16 rounded-full border border-white/60" />
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#BE123C] shadow-md">
            <Droplet className="w-4 h-4 fill-[#BE123C] text-[#BE123C]" />
          </div>
        </div>
      </div>

      {/* 3. Apple Health Harmonious 2x2 Summary Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Tile 1: Emergency Request */}
        <Link
          href="/need-blood"
          className="group p-4 rounded-[24px] bg-white border border-black/[0.05] shadow-xs hover:shadow-sm active:scale-[0.98] transition-all flex flex-col justify-between min-h-[135px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
              <Zap className="w-4 h-4 fill-rose-600 text-rose-600" />
            </div>
            <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50/80 px-2 py-0.5 rounded-full">
              Instant
            </span>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
              Emergency Need
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Find matching donors
            </p>
          </div>
        </Link>

        {/* Tile 2: Become a Donor */}
        <Link
          href="/become-donor"
          className="group p-4 rounded-[24px] bg-white border border-black/[0.05] shadow-xs hover:shadow-sm active:scale-[0.98] transition-all flex flex-col justify-between min-h-[135px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
              <Heart className="w-4 h-4 fill-pink-600 text-pink-600" />
            </div>
            <span className="text-[10px] font-extrabold text-pink-700 bg-pink-50/80 px-2 py-0.5 rounded-full">
              Life Saver
            </span>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
              Join as Donor
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Stand by for local alerts
            </p>
          </div>
        </Link>

        {/* Tile 3: Blood Centers */}
        <Link
          href="/need-blood"
          className="group p-4 rounded-[24px] bg-white border border-black/[0.05] shadow-xs hover:shadow-sm active:scale-[0.98] transition-all flex flex-col justify-between min-h-[135px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-full">
              14+ Banks
            </span>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
              Blood Banks
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Stock &amp; hotlines
            </p>
          </div>
        </Link>

        {/* Tile 4: How It Works */}
        <Link
          href="/how-it-works"
          className="group p-4 rounded-[24px] bg-white border border-black/[0.05] shadow-xs hover:shadow-sm active:scale-[0.98] transition-all flex flex-col justify-between min-h-[135px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-full">
              Protocol
            </span>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
              How It Works
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              10-min wave matching
            </p>
          </div>
        </Link>
      </div>

      {/* 4. Apple Inset Grouped Telemetry Card */}
      <div className="p-4 rounded-[26px] bg-white border border-black/[0.05] shadow-xs space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Network Performance Telemetry
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Active
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-2xl bg-[#F2F2F7]/60 text-center">
            <div className="text-base font-black text-slate-900">&lt; 15m</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Response Time</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F2F2F7]/60 text-center">
            <div className="text-base font-black text-slate-900">PostGIS</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Radar Radius</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F2F2F7]/60 text-center">
            <div className="text-base font-black text-slate-900">Dual Alert</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Twilio + WA</div>
          </div>
        </div>
      </div>

      {/* 5. iOS Settings-style Grouped Safety Row */}
      <div className="p-3.5 rounded-[22px] bg-white border border-black/[0.05] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">100% Free Public Service</div>
            <div className="text-[11px] text-slate-500 leading-tight">
              BloodMVP never asks for money, processing fees, or OTPs.
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
      </div>
    </div>
  );
}
