import React from 'react';
import { useTranslations } from 'next-intl';
import { PhoneCall, ShieldCheck, Heart, Radio, MapPin, CheckCircle2 } from 'lucide-react';

export default function HowItWorksPage() {
  const t = useTranslations('home');

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-950">How Blood Works</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Connecting families in urgent need with willing, verified donors near the hospital within minutes.
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blood-100 text-blood-700 font-bold flex items-center justify-center">1</div>
            <h2 className="text-lg font-bold text-gray-900">Immediate Blood Bank Check</h2>
          </div>
          <p className="text-sm text-gray-600 pl-11">
            When you pick a blood group and location, Blood first displays nearby licensed blood banks with their latest verified stock. If a bank has the required units in stock, you can go or call directly.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blood-100 text-blood-700 font-bold flex items-center justify-center">2</div>
            <h2 className="text-lg font-bold text-gray-900">Simultaneous Call + WhatsApp Alert</h2>
          </div>
          <p className="text-sm text-gray-600 pl-11">
            Pressing &quot;Search donors&quot; activates our matching engine. Registered donors in widening distance rings (0.5 km up to 100 km) receive an automated phone call and a WhatsApp alert at the exact same time in Telugu, Hindi or English.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blood-100 text-blood-700 font-bold flex items-center justify-center">3</div>
            <h2 className="text-lg font-bold text-gray-900">Deterministic Eligibility Rules</h2>
          </div>
          <p className="text-sm text-gray-600 pl-11">
            Donors answer a few quick questions (recent donations, fever, medications, travel). A deterministic rules engine ensures medical eligibility. Those who answer YES and pass appear live on the requester&apos;s screen.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blood-100 text-blood-700 font-bold flex items-center justify-center">4</div>
            <h2 className="text-lg font-bold text-gray-900">Donation Code Verification</h2>
          </div>
          <p className="text-sm text-gray-600 pl-11">
            Accepted donors receive a secret 6-digit Donation Code. When the donor arrives at the hospital, they share this code to verify the donation happened.
          </p>
        </div>
      </div>

      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <span>Blood never asks for money or OTP. The doctor at the blood bank does the final medical exam.</span>
      </div>
    </div>
  );
}

