'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BloodGroup } from '@/lib/constants';
import {
  Heart,
  Zap,
  PhoneCall,
  MessageSquare,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  Info,
  Users,
  Activity,
  Sparkles,
  Radio,
  Building2,
  Droplet,
  Flame,
  Check,
  X,
  Phone,
  Search,
} from 'lucide-react';

const BLOOD_GROUPS: BloodGroup[] = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

interface CompatibilityInfo {
  canReceive: string[];
  canGive: string[];
  prevalenceIndia: string;
  tagline: string;
  isUniversal?: boolean;
}

const COMPATIBILITY_DATA: Record<BloodGroup, CompatibilityInfo> = {
  'O+': {
    canReceive: ['O+', 'O-'],
    canGive: ['O+', 'A+', 'B+', 'AB+'],
    prevalenceIndia: '38% of population (Most common)',
    tagline: 'Critical lifeline for emergency rooms nationwide.',
  },
  'O-': {
    canReceive: ['O-'],
    canGive: ['All Blood Groups (Universal Red Cell Donor)'],
    prevalenceIndia: '1.4% of population (Ultra rare)',
    tagline: 'Universal Donor — used immediately when patient blood type is unknown.',
    isUniversal: true,
  },
  'A+': {
    canReceive: ['A+', 'A-', 'O+', 'O-'],
    canGive: ['A+', 'AB+'],
    prevalenceIndia: '21% of population',
    tagline: 'Widely needed for planned surgeries and trauma cases.',
  },
  'A-': {
    canReceive: ['A-', 'O-'],
    canGive: ['A+', 'A-', 'AB+', 'AB-'],
    prevalenceIndia: '0.6% of population (Rare)',
    tagline: 'Crucial for rare patient matches.',
  },
  'B+': {
    canReceive: ['B+', 'B-', 'O+', 'O-'],
    canGive: ['B+', 'AB+'],
    prevalenceIndia: '32% of population',
    tagline: 'Second most common group in India; vital for emergency reserves.',
  },
  'B-': {
    canReceive: ['B-', 'O-'],
    canGive: ['B+', 'B-', 'AB+', 'AB-'],
    prevalenceIndia: '1.1% of population (Rare)',
    tagline: 'Urgent demand in trauma units.',
  },
  'AB+': {
    canReceive: ['All Blood Groups (Universal Recipient)'],
    canGive: ['AB+'],
    prevalenceIndia: '6.5% of population',
    tagline: 'Universal Recipient for red blood cells; universal plasma donor.',
    isUniversal: true,
  },
  'AB-': {
    canReceive: ['AB-', 'A-', 'B-', 'O-'],
    canGive: ['AB+', 'AB-'],
    prevalenceIndia: '0.4% of population (Extremely rare)',
    tagline: 'Rarest blood group in India.',
  },
};

export default function HomePage() {
  const t = useTranslations('home');
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O+');
  const [activeSimulatorTab, setActiveSimulatorTab] = useState<'wa' | 'call' | 'radar'>('wa');

  const compat = COMPATIBILITY_DATA[selectedGroup];

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] text-gray-900 antialiased selection:bg-rose-500 selection:text-white pb-20">
      {/* 1. TOP TICKER: Live Emergency Dispatch Network Status */}
      <div className="bg-gradient-to-r from-gray-950 via-slate-900 to-rose-950 text-white border-b border-rose-950/40 text-xs py-2.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <span className="font-bold tracking-wide uppercase text-rose-300 text-[11px]">
              Live Emergency Network:
            </span>
            <span className="text-gray-200 text-xs">
              Autonomous Ring Wave Dispatch Active Across 4,700+ Centers
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-gray-300 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>Avg Contact: &lt; 12 Mins</span>
            </span>
            <span className="hidden md:inline-block text-gray-600">•</span>
            <span className="hidden md:inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Free Public Good</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HERO SECTION — Modern Command Center Style */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 bg-gradient-to-b from-white via-rose-50/20 to-white">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-10 -z-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* LEFT COLUMN: The Primary Mission & Quick 1-Tap Trigger */}
            <div className="lg:col-span-7 space-y-6">
              {/* Emergency Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100/80 border border-rose-200/80 text-rose-800 text-xs font-bold tracking-wide shadow-xs">
                <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                <span>Urgent Medical Protocol</span>
                <span className="w-1 h-1 rounded-full bg-rose-400" />
                <span className="text-rose-900 font-black">Fastest in India</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-gray-950 leading-[1.12]">
                  Need blood right now? <br />
                  <span className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 bg-clip-text text-transparent">
                    Connect directly to donors
                  </span>{' '}
                  in minutes.
                </h1>
                <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed max-w-xl">
                  RaktKhoj scans nearest hospitals, checks live blood bank refrigerators, and automatically{' '}
                  <strong className="text-gray-900 font-semibold">calls & WhatsApps verified donors</strong>{' '}
                  in concentric rings around the patient.
                </p>
              </div>

              {/* THE PRIMARY EMERGENCY BLOOD STATION (Card) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-rose-200 shadow-xl shadow-rose-900/5 space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-0 pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-rose-600">
                      Step 1 • Select Required Blood Group
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-gray-950">
                      Who needs blood?
                    </h3>
                  </div>
                  <span className="text-xs text-gray-600 font-medium bg-gray-100 px-2.5 py-1 rounded-lg">
                    Instant 1-Tap Trigger
                  </span>
                </div>

                {/* Blood Group Grid Buttons */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 relative z-10">
                  {BLOOD_GROUPS.map((bg) => {
                    const isSelected = selectedGroup === bg;
                    return (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setSelectedGroup(bg)}
                        className={`h-12 rounded-2xl font-black text-sm transition-all duration-200 flex flex-col items-center justify-center border ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30 scale-105 ring-2 ring-rose-400/50'
                            : 'bg-gray-50/80 text-gray-800 border-gray-200 hover:border-rose-300 hover:bg-rose-50/40 active:scale-95'
                        }`}
                      >
                        <span>{bg}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Group Quick Insight Pill */}
                <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-rose-600 fill-rose-600 shrink-0" />
                    <span>
                      <strong>{selectedGroup}</strong> can receive from:{' '}
                      <span className="font-bold text-rose-700">
                        {compat.canReceive.join(', ')}
                      </span>
                    </span>
                  </div>
                  <span className="text-[11px] text-rose-600/90 font-medium">
                    {compat.prevalenceIndia}
                  </span>
                </div>

                {/* Big Primary Action: Find Blood Now */}
                <div className="pt-1 flex flex-col sm:flex-row items-stretch gap-3 relative z-10">
                  <Link
                    href={`/need-blood?bg=${encodeURIComponent(selectedGroup)}`}
                    className="flex-1 inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-base py-4 px-6 rounded-2xl shadow-lg shadow-rose-600/25 active:scale-[0.98] transition-all group"
                  >
                    <Zap className="w-5 h-5 fill-white text-white group-hover:animate-pulse" />
                    <span>Find {selectedGroup} Blood Right Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href={`/need-blood?bg=${encodeURIComponent(selectedGroup)}`}
                    className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm py-3.5 px-4 rounded-2xl transition-colors active:scale-95"
                    title="Browse 4,700+ Certified Blood Centers"
                  >
                    <Building2 className="w-4 h-4 text-gray-600" />
                    <span className="whitespace-nowrap">Blood Banks Stock</span>
                  </Link>
                </div>
              </div>

              {/* Trust & Reassurance Badges */}
              <div className="grid grid-cols-3 gap-3 pt-1 text-xs text-gray-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No login needed to search</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>GPS 1km-15km wave radius</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified 6-digit hospital code</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: The Interactive Live Dispatch Simulator */}
            <div className="lg:col-span-5">
              <div className="rounded-[32px] bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white p-6 shadow-2xl shadow-rose-950/20 border border-slate-800 relative overflow-hidden">
                {/* Background Radar Rings */}
                <div className="absolute -top-12 -right-12 w-64 h-64 border border-rose-500/10 rounded-full animate-ping pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-88 h-88 border border-rose-500/5 rounded-full pointer-events-none" />

                {/* Simulator Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-black tracking-wider uppercase text-gray-300">
                      RaktKhoj Autonomous Engine
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-rose-400 font-bold bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-800/40">
                    Live Demo Preview
                  </span>
                </div>

                {/* Tab Switcher */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 my-4">
                  <button
                    type="button"
                    onClick={() => setActiveSimulatorTab('wa')}
                    className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      activeSimulatorTab === 'wa'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSimulatorTab('call')}
                    className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      activeSimulatorTab === 'call'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Voice Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSimulatorTab('radar')}
                    className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      activeSimulatorTab === 'radar'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Wave Radar</span>
                  </button>
                </div>

                {/* SIMULATOR TAB CONTENT */}
                <div className="min-h-[280px] flex flex-col justify-center">
                  {/* TAB 1: WhatsApp Interactive Message */}
                  {activeSimulatorTab === 'wa' && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="rounded-2xl bg-[#0b141a] p-4 text-left border border-emerald-950/60 shadow-inner">
                        <div className="flex items-center justify-between text-[11px] text-gray-400 pb-2 border-b border-gray-800">
                          <span className="font-semibold text-emerald-400">
                            +1 (555) 207-6308 • RaktKhoj Bot
                          </span>
                          <span>Just now</span>
                        </div>

                        <div className="pt-2.5 space-y-2 text-xs text-gray-200">
                          <div className="inline-flex items-center gap-1 font-black text-rose-400 text-xs">
                            <Flame className="w-3.5 h-3.5 fill-rose-500" />
                            <span>URGENT BLOOD REQUEST</span>
                          </div>

                          <div className="space-y-1 font-mono text-[11px] bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                            <p><strong className="text-gray-400">Patient:</strong> Siva (Trauma Emergency)</p>
                            <p><strong className="text-gray-400">Blood:</strong> <span className="text-rose-400 font-bold">O+ Positive</span> (4 units)</p>
                            <p><strong className="text-gray-400">Hospital:</strong> Govt. General Hospital, Rajahmundry</p>
                            <p><strong className="text-gray-400">Distance:</strong> <span className="text-emerald-400 font-semibold">0.69 km away</span></p>
                          </div>

                          <p className="text-[11px] text-gray-300 pt-1">
                            Are you available and willing to donate blood now?
                          </p>

                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="py-2.5 px-3 rounded-xl bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-bold text-center text-xs flex items-center justify-center gap-1.5 shadow-xs">
                              <Check className="w-3.5 h-3.5" />
                              <span>Yes, I can</span>
                            </div>
                            <div className="py-2.5 px-3 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 font-bold text-center text-xs flex items-center justify-center gap-1.5 opacity-70">
                              <X className="w-3.5 h-3.5" />
                              <span>No, unable</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-center text-gray-400">
                        Donors tap one button on WhatsApp &bull; Live hospital map & ETA opens instantly.
                      </p>
                    </div>
                  )}

                  {/* TAB 2: Automated Keypad Voice Call */}
                  {activeSimulatorTab === 'call' && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="rounded-2xl bg-slate-900 p-4 border border-rose-950/60 shadow-inner text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/40 animate-pulse">
                          <PhoneCall className="w-6 h-6" />
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-white">
                            Incoming Emergency Hotline
                          </h4>
                          <p className="text-xs text-rose-400 font-mono">
                            +1 (276) 624-8204
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-gray-300 leading-relaxed text-left font-mono">
                          &ldquo;Urgent alert from RaktKhoj. A patient urgently needs O+ blood at Rajahmundry GH Blood Centre. Press 1 to accept. Press 2 if unavailable.&rdquo;
                        </div>

                        <div className="flex justify-center gap-4 text-xs font-bold pt-1">
                          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Dial [1] = Accepted
                          </span>
                          <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-gray-400 border border-slate-700">
                            Dial [2] = Next Donor
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-center text-gray-400">
                        Twilio automated IVR rings phones simultaneously with Telugu, English, & Hindi speech.
                      </p>
                    </div>
                  )}

                  {/* TAB 3: Concentric Wave Radar */}
                  {activeSimulatorTab === 'radar' && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="rounded-2xl bg-slate-900 p-4 border border-indigo-950/60 space-y-3">
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40">
                            <span className="font-bold text-indigo-300">
                              Wave 1 (0 to 1 km)
                            </span>
                            <span className="font-mono text-emerald-400 font-semibold">
                              Immediate Alert
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
                            <span className="font-bold text-gray-300">
                              Wave 2 (1 to 3 km)
                            </span>
                            <span className="font-mono text-gray-400">
                              +3 mins if unanswered
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
                            <span className="font-bold text-gray-300">
                              Wave 3 (3 to 5 km)
                            </span>
                            <span className="font-mono text-gray-400">
                              +6 mins automatic expansion
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950 text-[11px] text-gray-300 font-mono">
                          📍 PostGIS Geofence: Nearest donor matched at <strong>0.00 km</strong>.
                        </div>
                      </div>
                      <p className="text-[11px] text-center text-gray-400">
                        Concentric wave scheduling ensures zero donor fatigue while guaranteeing rapid response.
                      </p>
                    </div>
                  )}
                </div>

                {/* Live Try Link */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Want to see how it works in depth?</span>
                  <Link
                    href="/how-it-works"
                    className="text-rose-400 font-bold hover:text-rose-300 flex items-center gap-1 group"
                  >
                    <span>Read Architecture</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. CORE ACTION PILLARS: 3 High-Impact Cards (Different Layout & Style!) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-rose-600">
            Emergency Ecosystem
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Everything you need in a critical blood shortage
          </h2>
          <p className="text-sm text-gray-500">
            Choose your action below to connect instantly with the nearest lifelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Find Blood Right Now (Primary) */}
          <Link
            href="/need-blood"
            className="group relative p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-rose-50 via-white to-rose-50/30 border-2 border-rose-200 hover:border-rose-400 hover:shadow-xl hover:shadow-rose-900/10 active:scale-[0.99] transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 fill-white" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                  <span>Priority 1</span>
                  <span>•</span>
                  <span>Emergency</span>
                </div>
                <h3 className="text-xl font-black text-gray-950 tracking-tight">
                  I Need Blood Now
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Post hospital emergency request. Dials and WhatsApps matching donors within 1km to 15km in waves.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between text-rose-600 font-extrabold text-sm border-t border-rose-100/80 mt-6">
              <span>Start Emergency Search</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Become a Verified Donor */}
          <Link
            href="/become-donor"
            className="group relative p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/20 border border-gray-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 active:scale-[0.99] transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                  <span>Join Network</span>
                  <span>•</span>
                  <span>Life Saver</span>
                </div>
                <h3 className="text-xl font-black text-gray-950 tracking-tight">
                  Become a Donor
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Register your blood group and radius. Receive phone and WhatsApp pings only when someone is in critical need.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between text-emerald-700 font-extrabold text-sm border-t border-emerald-100/80 mt-6">
              <span>Register in 2 Mins</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Blood Banks & Stock Directory */}
          <Link
            href="/need-blood"
            className="group relative p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-50/50 via-white to-blue-50/20 border border-gray-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 active:scale-[0.99] transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  <span>Verified Stock</span>
                  <span>•</span>
                  <span>Government Mapped</span>
                </div>
                <h3 className="text-xl font-black text-gray-950 tracking-tight">
                  Nearest Blood Centers
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Scan 4,700+ e-RaktKosh licensed blood centers, check direct telephone numbers and component availability.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between text-blue-700 font-extrabold text-sm border-t border-blue-100/80 mt-6">
              <span>View Certified Centers</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* 4. INTERACTIVE BLOOD COMPATIBILITY MATRIX WIDGET */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="rounded-3xl bg-white border border-gray-200/80 p-6 sm:p-8 shadow-lg shadow-gray-200/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-rose-600">
                Medical Compatibility Guide
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
                Can you receive or donate blood?
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Tap any blood group to view compatible donors and recipients.
              </p>
            </div>

            {/* Quick Blood Group Badges */}
            <div className="flex flex-wrap gap-1.5">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setSelectedGroup(bg)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    selectedGroup === bg
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-start">
            {/* Box 1: Can Receive From */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Patient with {selectedGroup} Can Receive:</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {compat.canReceive.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-950 font-black text-xs shadow-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Box 2: Can Donate To */}
            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <Heart className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Donor with {selectedGroup} Can Give To:</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {compat.canGive.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-lg bg-white border border-rose-200 text-rose-950 font-black text-xs shadow-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Box 3: Medical Insight */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Clinical Significance
              </div>
              <p className="text-xs text-gray-700 font-medium leading-relaxed">
                {compat.tagline}
              </p>
              <div className="pt-2">
                <Link
                  href={`/need-blood?bg=${encodeURIComponent(selectedGroup)}`}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
                >
                  <span>Request {selectedGroup} Units Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY RAKTKHOJ IS 10X FASTER: Problem vs Solution Card */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="rounded-3xl bg-slate-950 text-white p-6 sm:p-10 border border-slate-800 shadow-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-rose-400">
              The Critical Life Difference
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Why WhatsApp Statuses & Messages Fail in Emergencies
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              In trauma or surgery, patients lose critical hours waiting for social media shares. RaktKhoj solves this autonomously.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Old Way */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-red-950/40 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-300 font-bold text-xs">
                <X className="w-3.5 h-3.5 text-red-400" />
                <span>Traditional Method (Statuses & Group Chats)</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-gray-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-black">✕</span>
                  <span><strong>4 to 8 hours delayed:</strong> Relies on people opening their phone and happening to read your story.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-black">✕</span>
                  <span><strong>Endless fake forwards:</strong> Distraught family receives dozens of random calls from wrong blood groups.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-black">✕</span>
                  <span><strong>No location filtering:</strong> Someone 200 km away calls, unable to arrive in time.</span>
                </li>
              </ul>
            </div>

            {/* The RaktKhoj Way */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-emerald-950/30 border border-rose-500/40 space-y-4 shadow-lg shadow-rose-950/30">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>RaktKhoj Autonomous Ring Waves</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-gray-200">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-black">✓</span>
                  <span><strong>Under 15 minutes:</strong> Automated phone calls and interactive WhatsApp cards alert donors simultaneously.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-black">✓</span>
                  <span><strong>PostGIS Spatial Geofence:</strong> Only verified donors within 1km–15km of the hospital are contacted.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-black">✓</span>
                  <span><strong>Digital Handshake Code:</strong> A secure 6-digit hospital verification code guarantees direct bedside donation.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED NATIONAL PLATFORM STATS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-xs text-center space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-rose-600">
              56 Lakh+
            </div>
            <div className="text-xs font-bold text-gray-900">
              Registered Donors
            </div>
            <p className="text-[11px] text-gray-500">
              Nationwide e-RaktKosh integration network
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-xs text-center space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-gray-950">
              4,700+
            </div>
            <div className="text-xs font-bold text-gray-900">
              Licensed Blood Centers
            </div>
            <p className="text-[11px] text-gray-500">
              Mapped with telephone & component stock
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-xs text-center space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-emerald-600">
              &lt; 15 Mins
            </div>
            <div className="text-xs font-bold text-gray-900">
              Average First Response
            </div>
            <p className="text-[11px] text-gray-500">
              Real-time multi-channel automated dispatch
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-xs text-center space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-rose-600">
              ₹ 0.00
            </div>
            <div className="text-xs font-bold text-gray-900">
              100% Free Public Utility
            </div>
            <p className="text-[11px] text-gray-500">
              Blood is a gift of life, never for commercial sale
            </p>
          </div>
        </div>
      </section>

      {/* 7. VOLUNTARY DONOR CELEBRATION & EMERGENCY HELPLINE CALLOUT */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-emerald-500/10 border border-rose-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>National Voluntary Blood Donation Initiative</span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-gray-950">
              One Drop of Humanity. Give Blood. Save Lives.
            </h4>
            <p className="text-xs text-gray-600 max-w-xl">
              In immediate life-or-death trauma emergencies, also dial the National Ambulance Helpline at{' '}
              <strong className="text-gray-900">108</strong> or the Central Blood Helpline at{' '}
              <strong className="text-gray-900">1910</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/become-donor"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Register as Donor</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
