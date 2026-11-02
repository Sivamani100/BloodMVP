'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  Users,
  Building2,
  Settings,
  FileText,
  Power,
  RefreshCw,
  Plus,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<'live' | 'needs_human' | 'donors' | 'banks' | 'settings' | 'audit'>('live');
  const [loading, setLoading] = useState(true);

  // Data states
  const [requests, setRequests] = useState<any[]>([]);
  const [abuseReports, setAbuseReports] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const supabase = createClient();

  async function loadData() {
    setLoading(true);
    const [reqRes, repRes, donRes, bnkRes, setRes, audRes] = await Promise.all([
      supabase.from('requests').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('abuse_reports').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('donors').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('blood_banks').select('*').order('name'),
      supabase.from('app_settings').select('*'),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(30),
    ]);

    if (reqRes.data) setRequests(reqRes.data);
    if (repRes.data) setAbuseReports(repRes.data);
    if (donRes.data) setDonors(donRes.data);
    if (bnkRes.data) setBanks(bnkRes.data);
    if (audRes.data) setAuditLogs(audRes.data);

    const sMap: Record<string, any> = {};
    for (const r of (setRes.data as any[]) || []) {
      sMap[r.key] = r.value;
    }
    setSettings(sMap);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function toggleKillSwitch() {
    const current = !!settings.kill_switch?.enabled;
    const nextVal = !current;
    if (
      !confirm(
        nextVal
          ? 'EMERGENCY: Flip Kill Switch ON? All new requests and outbound messages will be instantly blocked.'
          : 'Turn Kill Switch OFF? Normal operations will resume.'
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'kill_switch', value: { enabled: nextVal } as any });

    if (!error) {
      setSettings((prev) => ({ ...prev, kill_switch: { enabled: nextVal } }));
    }
  }

  const killSwitchOn = !!settings.kill_switch?.enabled;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Emergency Red Banner if kill switch is active */}
      {killSwitchOn && (
        <div className="p-4 bg-red-600 text-white rounded-2xl flex items-center justify-between font-black animate-pulse">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" />
            <span>KILL SWITCH IS ACTIVE — All outbound calls and messages are paused</span>
          </div>
          <button
            type="button"
            onClick={toggleKillSwitch}
            className="px-4 py-1.5 bg-white text-red-600 rounded-xl text-xs font-bold"
          >
            Deactivate
          </button>
        </div>
      )}

      {/* Admin header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-950">Blood Admin Control Center</h1>
          <p className="text-xs text-gray-500">Pilot City: Rajahmundry · Live Monitoring &amp; Safety Controls</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={toggleKillSwitch}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs ${
              killSwitchOn
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{killSwitchOn ? 'Resume System' : 'Kill Switch'}</span>
          </button>
        </div>
      </div>

      {/* Tabs (iOS Segmented Control) */}
      <div className="flex gap-1.5 p-1 bg-[#767680]/10 rounded-[16px] overflow-x-auto text-[13px] font-semibold no-scrollbar">
        {[
          { id: 'live', label: 'Live Requests', icon: Activity, count: requests.filter((r) => r.status === 'searching').length },
          { id: 'needs_human', label: 'Needs Human', icon: AlertTriangle, count: abuseReports.length },
          { id: 'donors', label: 'Donors', icon: Users, count: donors.length },
          { id: 'banks', label: 'Blood Banks', icon: Building2, count: banks.length },
          { id: 'settings', label: 'System Settings', icon: Settings },
          { id: 'audit', label: 'Audit Log', icon: FileText },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as any)}
            className={`px-3.5 py-2 rounded-[12px] flex items-center gap-2 whitespace-nowrap transition-all duration-150 ios-press-subtle ${
              tab === t.id
                ? 'bg-white text-gray-950 shadow-sm'
                : 'text-[#8E8E93] hover:text-gray-900'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span>{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                tab === t.id ? 'bg-[#007AFF]/12 text-[#007AFF]' : 'bg-[#767680]/15 text-[#8E8E93]'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Live Requests */}
      {tab === 'live' && (
        <div className="bg-white rounded-[22px] border border-black/[0.06] shadow-ios-floating overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Patient / Group</th>
                  <th className="p-4">Hospital</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Ring / Wave</th>
                  <th className="p-4">Donors</th>
                  <th className="p-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="font-extrabold text-gray-900 text-sm">{r.patient_first_name}</div>
                      <div className="text-blood-700 font-bold">{r.blood_group} ({r.units_needed} units)</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{r.hospital_name}</div>
                      <div className="text-gray-500">{r.hospital_area}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        r.status === 'searching'
                          ? 'bg-blue-50 text-blue-700'
                          : r.status === 'enough_donors'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono">
                      {r.current_ring_km} km (Wave {r.wave_no})
                    </td>
                    <td className="p-4 font-bold">
                      {r.accepted_count} accepted / {r.contacts_count} contacted
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(r.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No active requests right now.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Needs Human */}
      {tab === 'needs_human' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Reports requiring manual intervention: wrong numbers, abuse reports, or exhausted searches.
          </p>
          <div className="bg-white rounded-[22px] border border-black/[0.06] shadow-ios-floating overflow-hidden divide-y divide-black/[0.05]">
            {abuseReports.map((rep) => (
              <div key={rep.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#FF3B30] uppercase mr-2">{rep.target_type}</span>
                  <span className="font-medium text-gray-900">{rep.reason}</span>
                </div>
                <span className="text-[#8E8E93]">{new Date(rep.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {abuseReports.length === 0 && (
              <div className="p-8 text-center text-[#8E8E93] text-xs">No pending human alerts. Queue is clear!</div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Donors */}
      {tab === 'donors' && (
        <div className="bg-white rounded-[22px] border border-black/[0.06] shadow-ios-floating overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Blood Group</th>
                <th className="p-4">State</th>
                <th className="p-4">Donations</th>
                <th className="p-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {donors.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-bold text-gray-900">{d.full_name}</td>
                  <td className="p-4 font-black text-blood-700">{d.blood_group || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      d.state === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {d.state}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">{d.donations_count}</td>
                  <td className="p-4 text-gray-400">{new Date(d.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Banks */}
      {tab === 'banks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-900">Registered Blood Banks ({banks.length})</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {banks.map((b) => (
              <div key={b.id} className="p-4 bg-white rounded-[22px] border border-black/[0.06] shadow-ios-floating text-xs space-y-1">
                <div className="font-bold text-[15px] text-gray-950">{b.name}</div>
                <div className="text-gray-500">{b.city}, {b.state}</div>
                <div className="text-[#8E8E93] text-[11px] font-medium">Trust Score: {b.trust_score} / 100</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Settings */}
      {tab === 'settings' && (
        <div className="bg-white p-5 rounded-[22px] border border-black/[0.06] shadow-ios-floating space-y-4 text-xs">
          <h2 className="font-bold text-base text-gray-900">System Configuration</h2>
          <div className="space-y-3 divide-y divide-black/[0.05]">
            <div className="pt-2 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">WhatsApp Messaging</p>
                <p className="text-gray-500">Meta Cloud API alerts and button replies</p>
              </div>
              <span className="font-bold text-emerald-700">Enabled</span>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">Voice IVR Calls</p>
                <p className="text-gray-500">Twilio automated phone calls in Telugu, Hindi &amp; English</p>
              </div>
              <span className="font-bold text-emerald-700">Enabled</span>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">Last Scheduler Tick</p>
                <p className="text-gray-500">{settings.last_tick?.at ? new Date(settings.last_tick.at).toLocaleString() : 'Running via pg_cron'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Audit Log */}
      {tab === 'audit' && (
        <div className="bg-white rounded-[22px] border border-black/[0.06] shadow-ios-floating overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Action</th>
                <th className="p-4">Target Type</th>
                <th className="p-4">Target ID</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono font-bold text-gray-900">{log.action}</td>
                  <td className="p-4 text-gray-600">{log.target_type || '—'}</td>
                  <td className="p-4 font-mono text-gray-400">{log.target_id || '—'}</td>
                  <td className="p-4 text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
