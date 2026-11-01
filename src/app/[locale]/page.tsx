import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Heart, UserPlus, PhoneCall, Shield, Activity, MapPin } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16 flex flex-col items-center">
      {/* Pilot badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blood-50 text-blood-700 border border-blood-200 mb-6">
        <MapPin className="w-3.5 h-3.5" />
        <span>Rajahmundry &amp; East Godavari Pilot</span>
      </div>

      {/* Main Tagline */}
      <h1 className="text-3xl sm:text-5xl font-black text-gray-950 text-center tracking-tight max-w-2xl leading-tight">
        {t('tagline')}
      </h1>

      <p className="mt-4 text-base sm:text-lg text-gray-600 text-center max-w-xl">
        When every minute counts, Blood contacts verified donors in widening rings by phone call and WhatsApp simultaneously.
      </p>

      {/* Primary Actions */}
      <div className="w-full max-w-md mt-10 space-y-4">
        <Link
          href="/need-blood"
          className="w-full flex items-center justify-center gap-3 bg-blood-600 hover:bg-blood-700 active:bg-blood-800 text-white font-extrabold text-xl py-5 px-6 rounded-2xl shadow-xl shadow-blood-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-hidden"
        >
          <Heart className="w-7 h-7 fill-white animate-pulse" />
          <span>{t('need_blood')}</span>
        </Link>

        <Link
          href="/become-donor"
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 font-bold text-lg py-4 px-6 rounded-2xl border-2 border-gray-200 shadow-xs transition-colors"
        >
          <UserPlus className="w-5 h-5 text-gray-600" />
          <span>{t('become_donor')}</span>
        </Link>
      </div>

      {/* How it works cards */}
      <div className="w-full mt-16 sm:mt-24 pt-12 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
          How it works in an emergency
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blood-100 text-blood-700 font-bold flex items-center justify-center mb-3">
              1
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">Enter Blood &amp; Hospital</h3>
            <p className="text-sm text-gray-600">
              Pick the required group and hospital. Instantly check nearest blood banks with live stock.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blood-100 text-blood-700 font-bold flex items-center justify-center mb-3">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">Dual-Channel Contact</h3>
            <p className="text-sm text-gray-600">
              Nearby donors receive an automated phone call and WhatsApp alert simultaneously in Telugu, Hindi or English.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blood-100 text-blood-700 font-bold flex items-center justify-center mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">Confirmed Donors Live</h3>
            <p className="text-sm text-gray-600">
              Donors who answer YES and pass quick health checks appear live on your screen. You call them directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
