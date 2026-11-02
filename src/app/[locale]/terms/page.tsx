import React from 'react';
import { AlertCircle, FileCheck, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function TermsPage() {
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
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Terms of Service</h1>
        <p className="text-xs text-slate-500">BloodMVP Emergency Matching Pilot • Rajahmundry, Andhra Pradesh</p>
      </div>

      <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>1. Medical Disclaimer &amp; Emergency Helpline Notice</span>
          </h2>
          <p>
            BloodMVP is an informational volunteer connection platform. <strong>It does not provide medical advice, emergency transport, or blood testing services.</strong>
          </p>
          <p>
            In any life-threatening emergency, families must always contact the <strong>108 Ambulance service</strong> and visit government or licensed blood centres directly.
          </p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-rose-600" />
            <span>2. Strict Anti-Commercial &amp; No-Money Rule</span>
          </h2>
          <p>
            Voluntary blood donation in India is strictly non-remunerated under the Drugs and Cosmetics Act. <strong>BloodMVP never asks for money, processing fees, or financial OTPs.</strong> Any individual attempting to demand money for blood donations will be immediately banned and reported to authorities.
          </p>
        </div>
      </div>
    </div>
  );
}
