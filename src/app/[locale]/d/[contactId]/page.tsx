'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { WizardHeader } from '@/components/ui/WizardHeader';
import {
  MapPin,
  Building2,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Navigation,
} from 'lucide-react';

export default function DonorContactViewPage() {
  const params = useParams();
  const contactId = params.contactId as string;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: view, error } = await supabase.rpc('get_donor_request_view', {
        p_contact_id: contactId,
      });

      if (!error && view) {
        setData(view);
      }
      setLoading(false);
    }

    loadData();
  }, [contactId, supabase]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="text-sm font-semibold text-gray-700">Loading emergency details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col justify-center px-4 py-8">
        <div className="max-w-md w-full mx-auto text-center space-y-3">
          <h1 className="text-xl font-bold text-gray-900">Request Expired or Closed</h1>
          <p className="text-xs text-gray-500">
            Emergency request not found or access has expired.
          </p>
          <button
            onClick={() => router.push('/')}
            className="py-3 px-6 bg-red-600 text-white font-bold rounded-2xl text-xs"
          >
            Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F2F2F7] pb-24 text-gray-900">
      <WizardHeader
        title="Donation Details"
        onBack={() => router.push('/donor')}
        showClose={false}
      />

      <div className="max-w-md mx-auto px-4 pt-3 space-y-3.5">
        {/* Confirmed Banner (Floating Squircle) */}
        <div className="p-5 rounded-[22px] bg-[#34C759]/10 border border-[#34C759]/20 shadow-ios-floating text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#34C759] text-white flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7 stroke-[2.3]" />
          </div>
          <h1 className="text-[20px] font-bold text-gray-950 tracking-tight">
            You are Confirmed to Donate
          </h1>
          <p className="text-[13px] text-[#1C7430] leading-relaxed max-w-xs mx-auto font-medium">
            Thank you for stepping up! Please proceed to the hospital and present your official Donation Code.
          </p>
        </div>

        {/* Donation Code Card (Floating Squircle) */}
        {data.donation_code && (
          <div className="p-5 rounded-[22px] bg-white border border-[#FF3B30]/30 shadow-ios-floating text-center space-y-2">
            <span className="text-[11px] font-bold text-[#FF3B30] uppercase tracking-widest">
              Your Official Donation Code
            </span>
            <div className="font-mono text-4xl sm:text-5xl font-black text-[#FF3B30] tracking-widest py-1">
              {data.donation_code}
            </div>
            <p className="text-[12px] text-[#8E8E93]">
              Show this 6-digit code to the patient&apos;s family or blood bank desk when you arrive.
            </p>
          </div>
        )}

        {/* Hospital Details Card (Floating Squircle) */}
        <div className="p-4 rounded-[22px] bg-white border border-black/[0.06] shadow-ios-floating space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#FF3B30]" />
            <h2 className="font-semibold text-[15px] text-gray-950">Hospital Location</h2>
          </div>

          <div>
            <h3 className="font-bold text-[17px] text-gray-950 tracking-tight">{data.hospital_name}</h3>
            {data.hospital_area && (
              <p className="text-[13px] text-[#8E8E93] mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#8E8E93]" />
                <span>{data.hospital_area}</span>
              </p>
            )}
          </div>

          {data.ward_info && (
            <div className="p-3 bg-[#767680]/8 rounded-[12px] border border-black/[0.04] text-[13px] font-medium text-gray-800">
              Ward / Room: {data.ward_info}
            </div>
          )}

          {data.hospital_lat && data.hospital_lng && (
            <div className="pt-1">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${data.hospital_lat},${data.hospital_lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-gray-950 hover:bg-black text-white text-[14px] font-semibold rounded-[12px] flex items-center justify-center gap-2 transition-colors shadow-sm ios-press"
              >
                <Navigation className="w-4 h-4" />
                <span>Open Directions in Google Maps</span>
              </a>
            </div>
          )}
        </div>

        {/* Family Contact Card (Floating Squircle) */}
        {data.requester_phone && (
          <div className="p-4 rounded-[22px] bg-white border border-black/[0.06] shadow-ios-floating flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-[15px] text-gray-950">{data.requester_name}</p>
              <p className="text-[12px] text-[#8E8E93] capitalize">{data.relation || 'Patient Family'}</p>
            </div>

            <a
              href={`tel:${data.requester_phone}`}
              className="py-2.5 px-4 bg-[#34C759] hover:bg-[#28A745] text-white text-[13px] font-semibold rounded-[12px] flex items-center gap-1.5 shadow-sm transition-colors ios-press"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Family</span>
            </a>
          </div>
        )}

        {/* Safety Reminder (Floating Capsule) */}
        <div className="p-4 rounded-[20px] bg-white border border-black/[0.06] shadow-ios-floating text-gray-700 text-[12px] flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#34C759] shrink-0" />
          <span>Blood donation is 100% voluntary. The medical officer performs the final pre-donation test.</span>
        </div>
      </div>
    </div>
  );
}
