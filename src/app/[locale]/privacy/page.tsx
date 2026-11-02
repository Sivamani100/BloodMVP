import React from 'react';
import { Shield, Lock, EyeOff } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-950">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mt-2">Last updated: October 2026 · Compliant with India DPDP Act standards</p>
      </div>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blood-600" />
            <span>1. What We Collect and How It Is Protected</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Phone Number:</strong> Stored securely to deliver login OTPs and emergency matching alerts.</li>
            <li><strong>Health Answers:</strong> Stored with military-grade <strong>AES-256-GCM encryption</strong>. No requester, staff, or browser user can read your health answers.</li>
            <li><strong>Home Location:</strong> Stored as a coordinate to calculate distance. Only distance bands (e.g. &quot;3 to 5 km&quot;) are shown to families. Your exact home address is never revealed.</li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-blood-600" />
            <span>2. Strict Privacy Matrix (Who Sees What)</span>
          </h2>
          <p>
            Requesters never see a donor&apos;s phone number, email, address, date of birth, or health answers. A donor&apos;s phone number is revealed <strong>only after the donor explicitly accepts a request and gives consent</strong> to share their number with the family.
          </p>
          <p>
            Donors never see the requester&apos;s phone number or the exact hospital ward pin until they accept.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blood-600" />
            <span>3. Account Deletion and Opt-Out</span>
          </h2>
          <p>
            You can reply <strong>STOP</strong> to any WhatsApp message to immediately cease all alerts. You can also delete your account at any time from your donor dashboard. Account deletion permanently erases all profile, location, and health records instantly.
          </p>
        </div>
      </div>
    </div>
  );
}

