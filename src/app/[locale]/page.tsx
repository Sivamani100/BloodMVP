'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BloodBagVisual } from '@/components/ui/BloodBagVisual';
import {
  Heart,
  MapPin,
  Info,
  ChevronRight,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="w-full min-h-screen bg-[#F2F2F7] pb-12 pt-3">
      <div className="max-w-md mx-auto px-4 space-y-3.5">
        {/* Apple Editorial Hero Card: Crimson to Ruby Squircle */}
        <div className="relative overflow-hidden rounded-[26px] sm:rounded-[28px] bg-gradient-to-br from-[#E11D48] via-[#DC2626] to-[#881337] p-6 text-white shadow-ios-card">
          <div className="relative z-10 max-w-[64%] space-y-2.5 pt-1">
            <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.025em] leading-[1.12] text-white">
              Need blood right now?
            </h1>

            <p className="text-[14px] sm:text-[15px] font-normal text-white/90 leading-snug">
              Get in touch with donors and blood centers near you, in minutes.
            </p>

            <div className="pt-2.5">
              <Link
                href="/need-blood"
                className="inline-flex items-center gap-2 bg-white text-[#DC2626] font-semibold text-[15px] py-3 px-5 rounded-[12px] shadow-sm ios-press select-none"
              >
                <Zap className="w-4 h-4 fill-[#DC2626] text-[#DC2626]" strokeWidth={2} />
                <span>Find Blood Now</span>
              </Link>
            </div>
          </div>

          {/* 3D IV Blood Bag Hanging on Right Side */}
          <div className="absolute -top-4 -right-3 w-44 sm:w-48 h-full flex items-center justify-center pointer-events-none">
            <BloodBagVisual className="w-44 h-72 translate-y-2 scale-105" />
          </div>
        </div>

        {/* Dual Action Inset Grouped Cards */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Card 1: Become a Donor */}
          <Link
            href="/become-donor"
            className="flex flex-col justify-between p-4 rounded-[22px] bg-white border border-black/[0.06] shadow-ios-floating hover:bg-[#F9F9FB] ios-press min-h-[148px]"
          >
            <div className="w-9 h-9 rounded-full bg-[#34C759]/12 flex items-center justify-center text-[#34C759] mb-3">
              <Heart className="w-4 h-4 text-[#34C759] fill-[#34C759]/20" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-semibold text-[16px] text-gray-900 tracking-tight leading-tight">
                Become a Donor
              </h2>
              <p className="text-[12px] text-[#8E8E93] mt-1 leading-snug">
                Match to nearby urgent requests
              </p>
            </div>
          </Link>

          {/* Card 2: Find Blood Camps */}
          <Link
            href="/need-blood"
            className="flex flex-col justify-between p-4 rounded-[22px] bg-white border border-black/[0.06] shadow-ios-floating hover:bg-[#F9F9FB] ios-press min-h-[148px]"
          >
            <div className="w-9 h-9 rounded-full bg-[#007AFF]/12 flex items-center justify-center text-[#007AFF] mb-3">
              <MapPin className="w-4 h-4 text-[#007AFF]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-semibold text-[16px] text-gray-900 tracking-tight leading-tight">
                Blood Centers
              </h2>
              <p className="text-[12px] text-[#8E8E93] mt-1 leading-snug">
                Upcoming drives & bank stock
              </p>
            </div>
          </Link>
        </div>

        {/* Demo Notice Banner Pill (iOS Callout) */}
        <Link
          href="/how-it-works"
          className="flex items-center justify-between p-4 rounded-[20px] bg-white border border-black/[0.06] shadow-ios-floating hover:bg-[#F9F9FB] ios-press-subtle text-[13px] text-gray-700"
        >
          <div className="flex items-center gap-2.5 pr-2">
            <div className="w-6 h-6 rounded-full bg-[#FF9500]/15 flex items-center justify-center text-[#FF9500] shrink-0">
              <Info className="w-3.5 h-3.5 text-[#FF9500]" strokeWidth={2} />
            </div>
            <span className="leading-snug text-gray-600">
              <strong className="font-semibold text-gray-900">RaktKhoj Pilot:</strong> Connects rapid emergency blood requests across verified networks.
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#C7C7CC] shrink-0" strokeWidth={2} />
        </Link>

        {/* 3-Column Stats Row (iOS Widgets) */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-[22px] bg-white border border-black/[0.06] text-center shadow-ios-floating">
            <div className="text-[20px] sm:text-[22px] font-bold text-gray-900 tracking-tight">
              56 L
            </div>
            <div className="text-[11px] text-[#8E8E93] mt-0.5 font-medium leading-tight">
              Registered Donors
            </div>
          </div>

          <div className="p-4 rounded-[22px] bg-white border border-black/[0.06] text-center shadow-ios-floating">
            <div className="text-[20px] sm:text-[22px] font-bold text-gray-900 tracking-tight">
              4.7 K
            </div>
            <div className="text-[11px] text-[#8E8E93] mt-0.5 font-medium leading-tight">
              Blood Centers
            </div>
          </div>

          <div className="p-4 rounded-[22px] bg-white border border-black/[0.06] text-center shadow-ios-floating">
            <div className="text-[20px] sm:text-[22px] font-bold text-gray-900 tracking-tight">
              2.7 L
            </div>
            <div className="text-[11px] text-[#8E8E93] mt-0.5 font-medium leading-tight">
              Drives Organised
            </div>
          </div>
        </div>

        {/* Voluntary Blood Donation Celebration Card */}
        <div className="overflow-hidden rounded-[22px] border border-black/[0.06] bg-white p-4 text-center space-y-1 shadow-ios-floating">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse" />
            <span>National Voluntary Blood Mission</span>
          </div>
          <p className="text-[13px] text-gray-700 font-medium">
            Every drop counts. Give blood, give plasma, share life.
          </p>
        </div>
      </div>
    </div>
  );
}
