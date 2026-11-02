import React from 'react';
import { Shield, Lock, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function PrivacyPage() {
  return (
    <div className="w-full px-4 py-6 space-y-6">
      <div className="space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-500">BloodMVP Privacy Standard • Compliant with DPDP Act</p>
      </div>

      <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600" />
            <span>1. What We Collect and How It Is Protected</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li><strong>Phone Number:</strong> Stored securely to deliver login OTPs and emergency matching alerts.</li>
            <li><strong>Health Answers:</strong> Stored with <strong>AES-256-GCM encryption</strong>. No requester or external party can read your answers.</li>
            <li><strong>Home Location:</strong> Stored as a coordinate to calculate distance. Only distance bands (e.g. &quot;3 to 5 km&quot;) are shown. Your exact home address is never revealed.</li>
          </ul>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-rose-600" />
            <span>2. Strict Privacy Matrix (Who Sees What)</span>
          </h2>
          <p>
            Requesters never see a donor&apos;s phone number, address, or health answers. A donor&apos;s phone number is revealed <strong>only after the donor explicitly accepts a request and gives consent</strong>.
          </p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-600" />
            <span>3. Account Deletion and Opt-Out</span>
          </h2>
          <p>
            You can reply <strong>STOP</strong> on WhatsApp to immediately cease all alerts. You can also pause or delete your account at any time from your donor dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
