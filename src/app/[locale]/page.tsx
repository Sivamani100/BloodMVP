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
    <div className="w-full min-h-screen bg-white pb-12">
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Hero Card: Deep Crimson Card with 3D IV Blood Bag */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#E11D48] via-[#DC2626] to-[#881337] p-6 text-white shadow-xl shadow-rose-900/20">
          <div className="relative z-10 max-w-[62%] space-y-3 pt-2">
            <h1 className="text-3xl sm:text-[32px] font-black tracking-tight leading-[1.15] text-white">
              Need blood right now?
            </h1>

            <p className="text-sm font-normal text-white/90 leading-relaxed">
              Get in touch with donors and blood banks near you, in minutes.
            </p>

            <div className="pt-3">
              <Link
                href="/need-blood"
                className="inline-flex items-center gap-2 bg-white text-rose-600 hover:bg-rose-50 active:scale-95 font-extrabold text-sm py-3.5 px-5 rounded-2xl shadow-lg transition-all"
              >
                <Zap className="w-4 h-4 fill-rose-600 text-rose-600" />
                <span>Find Blood Now</span>
              </Link>
            </div>
          </div>

          {/* 3D IV Blood Bag Hanging on Right Side */}
          <div className="absolute -top-4 -right-3 w-44 sm:w-48 h-full flex items-center justify-center">
            <BloodBagVisual className="w-44 h-72 translate-y-2 scale-105" />
          </div>
        </div>

        {/* Dual Action Cards (Become a Donor & Find Blood Camps) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Card 1: Become a Donor */}
          <Link
            href="/become-donor"
            className="flex flex-col justify-between p-4 rounded-2xl bg-[#FAFAFA] border border-gray-100 hover:border-rose-200 hover:bg-rose-50/20 active:scale-[0.98] transition-all min-h-[148px]"
          >
            <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-3">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
            </div>
            <div>
              <h2 className="font-extrabold text-[15px] text-gray-900 leading-tight">
                Become a Donor
              </h2>
              <p className="text-xs text-gray-500 mt-1 leading-snug">
                Get matched to nearby requests
              </p>
            </div>
          </Link>

          {/* Card 2: Find Blood Camps */}
          <Link
            href="/need-blood"
            className="flex flex-col justify-between p-4 rounded-2xl bg-[#FAFAFA] border border-gray-100 hover:border-rose-200 hover:bg-rose-50/20 active:scale-[0.98] transition-all min-h-[148px]"
          >
            <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-3">
              <MapPin className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <h2 className="font-extrabold text-[15px] text-gray-900 leading-tight">
                Find Blood Camps
              </h2>
              <p className="text-xs text-gray-500 mt-1 leading-snug">
                Upcoming drives near you
              </p>
            </div>
          </Link>
        </div>

        {/* Demo Notice Banner Pill */}
        <Link
          href="/how-it-works"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FBFBFC] border border-gray-100 hover:bg-gray-50 active:scale-[0.99] transition-all text-xs text-gray-700"
        >
          <div className="flex items-center gap-2.5 pr-2">
            <Info className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="leading-snug">
              <strong className="font-semibold text-gray-900">RaktKhoj is a demo site</strong> and should not be used for real emergencies.
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        </Link>

        {/* 3-Column Stats Row */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-3.5 rounded-2xl bg-white border border-gray-100 text-center shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-gray-900">
              56 L
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5 font-medium leading-tight">
              Registered Donors
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-gray-100 text-center shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-gray-900">
              4.7 K
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5 font-medium leading-tight">
              Blood Centers
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-gray-100 text-center shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-gray-900">
              2.7 L
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5 font-medium leading-tight">
              Camps Organised
            </div>
          </div>
        </div>

        {/* Voluntary Blood Donation Day Celebration Card */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-r from-amber-50 via-rose-50/50 to-emerald-50 p-4 text-center space-y-1.5 shadow-xs">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>National Voluntary Blood Donation Day</span>
          </div>
          <p className="text-xs text-gray-600 font-medium">
            One Drop of Humanity. Give Blood. Save Lives.
          </p>
        </div>
      </div>
    </div>
  );
}
