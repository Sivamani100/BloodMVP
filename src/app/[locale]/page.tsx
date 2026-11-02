'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Heart,
  ShieldCheck,
  ChevronRight,
  Zap,
  Building2,
  Sparkles,
  Radio,
  Droplet,
  ArrowUpRight,
  CreditCard,
  Wifi,
} from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="w-full px-5 pt-3 pb-8 space-y-5">
      {/* 1. Header Balance/Status Area (Exact match to reference "My Balance / $27,120.45") */}
      <div className="space-y-0.5">
        <div className="text-xs font-semibold text-slate-500 tracking-tight flex items-center gap-1.5">
          <span>Live Emergency Network</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
        </div>
        <div className="text-[32px] font-black text-slate-950 tracking-tight leading-none">
          Emergency Ready
        </div>
      </div>

      {/* 2. The Glowing Credit-Card Style Hero Card (Exact match to reference green gradient card) */}
      <div className="space-y-2.5">
        <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-tr from-[#FF2D55] via-[#E11D48] to-[#FF453A] p-5 text-white shadow-[0_16px_36px_rgba(225,29,72,0.28)] border border-white/20 select-none">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-white/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-black/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top Row: Contactless Wave + Card Number / ID */}
          <div className="relative z-10 flex items-center justify-between text-white/90">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 rotate-90" />
              <span className="font-mono text-xs tracking-widest text-white/90">
                &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 108
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
              Priority 1
            </span>
          </div>

          {/* Middle: Blood Group Badge & Tagline */}
          <div className="relative z-10 py-5">
            <div className="text-xs font-medium text-rose-100">Fastest 10-Min Wave Dispatch</div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              O+ &bull; A+ &bull; B+ &bull; AB- All Groups
            </div>
          </div>

          {/* Bottom Row: ETA Stats + Black Pill Button (Match reference "Pay now" pill button!) */}
          <div className="relative z-10 flex items-end justify-between pt-1">
            <div>
              <div className="text-[11px] text-rose-100 font-medium">Response estimate</div>
              <div className="text-sm font-extrabold text-white tracking-tight">
                Under 15 Minutes
              </div>
            </div>

            <Link
              href="/need-blood"
              className="bg-slate-950 text-white hover:bg-black active:scale-95 text-xs font-black py-2.5 px-4 rounded-full shadow-lg transition-transform flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-white text-white" />
              <span>Request now</span>
            </Link>
          </div>
        </div>

        {/* 3 Pagination Indicator Dots (Exact match to reference • • •) */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <div className="w-4 h-1.5 bg-slate-900 rounded-full" />
          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
        </div>
      </div>

      {/* 3. Services Grouped List (Exact match to reference "Accounts >" with icon rows!) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-slate-900 font-bold text-sm px-1">
          <span>Services</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div className="bg-white rounded-[24px] p-2 border border-black/[0.05] shadow-xs space-y-0.5">
          {/* Row 1: Need Blood */}
          <Link
            href="/need-blood"
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900 leading-tight">
                  Find Blood Donors
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Instant 10-minute wave dispatch
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-slate-900 font-bold text-xs">
              <span className="text-rose-600 font-extrabold">Instant</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </Link>

          {/* Row 2: Become a Donor */}
          <Link
            href="/become-donor"
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Heart className="w-4 h-4 fill-white text-white" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900 leading-tight">
                  Become a Donor
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Verified life-saver registry
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-slate-900 font-bold text-xs">
              <span className="text-emerald-700 font-extrabold">Life Saver</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </Link>

          {/* Row 3: Blood Centers Stock */}
          <Link
            href="/need-blood"
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-xs">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900 leading-tight">
                  Blood Centers
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  14+ verified banks &amp; hotlines
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-slate-900 font-bold text-xs">
              <span className="text-slate-600 font-bold">14+ Banks</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </Link>

          {/* Row 4: How It Works */}
          <Link
            href="/how-it-works"
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900 leading-tight">
                  Protocol &amp; Rules
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Zero spam &bull; Confidential code
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-slate-900 font-bold text-xs">
              <span className="text-slate-600 font-bold">How it works</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Recent Activity Section (Exact match to reference "Recent activity") */}
      <div className="space-y-2">
        <div className="text-slate-900 font-bold text-sm px-1">
          Recent Activity
        </div>

        <div className="bg-white rounded-[24px] p-2 border border-black/[0.05] shadow-xs space-y-1">
          {/* Activity 1 */}
          <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <Droplet className="w-4 h-4 fill-rose-600 text-rose-600" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900 leading-tight">
                  Emergency O+ Wave Alert
                </div>
                <div className="text-[10px] text-slate-400">
                  Government General Hospital, Rajahmundry
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-emerald-600">&lt; 12m</div>
              <div className="text-[9px] text-slate-400">Response</div>
            </div>
          </div>

          {/* Activity 2 */}
          <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900 leading-tight">
                  Verified Donor Enrolled
                </div>
                <div className="text-[10px] text-slate-400">
                  Diwancheruvu &bull; Ready on call
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-slate-800">Verified</div>
              <div className="text-[9px] text-slate-400">OTP Confirmed</div>
            </div>
          </div>

          {/* Activity 3 */}
          <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900 leading-tight">
                  GSL Trust Blood Centre
                </div>
                <div className="text-[10px] text-slate-400">
                  Stock verification updated
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-slate-800">Checked</div>
              <div className="text-[9px] text-slate-400">Today</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
