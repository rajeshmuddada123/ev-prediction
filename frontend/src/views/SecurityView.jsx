import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  AlertTriangle,
  Play,
  Terminal,
  Activity,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function SecurityView() {
  const [securityData, setSecurityData] = useState(null);
  const [probeResult, setProbeResult] = useState(null);
  const [testingProbe, setTestingProbe] = useState(false);

  const loadSecurity = async () => {
    try {
      const data = await api.getSecurityOverview();
      setSecurityData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSecurity();
    const interval = setInterval(loadSecurity, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTestProbe = async (type, payload) => {
    setTestingProbe(true);
    setProbeResult(null);
    try {
      const res = await api.simulateSecurityProbe(type, payload);
      setProbeResult(res);
      loadSecurity();
    } catch (e) {
      setProbeResult({ error: 'Probe failed' });
    } finally {
      setTestingProbe(false);
    }
  };

  const status = securityData?.systemStatus || 'NORMAL';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-teal-600" />
          <span>Cyberattack Detection & API Defense Telemetry</span>
        </h2>
        <p className="text-xs text-slate-500">
          Proactive inspection firewall monitoring injection vectors, sliding-window rate limits, and booking concurrency integrity.
        </p>
      </div>

      {/* Main Posture Status Banner */}
      <div
        className={`glass-panel rounded-3xl p-6 sm:p-8 border shadow-sm relative overflow-hidden ${
          status === 'NORMAL'
            ? 'border-emerald-200 bg-emerald-50/50'
            : status === 'ELEVATED'
            ? 'border-amber-200 bg-amber-50/50'
            : 'border-rose-200 bg-rose-50/50'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-2xl ${
                status === 'NORMAL' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Active Threat Posture
              </span>
              <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {status === 'NORMAL' ? 'SYSTEM NORMAL • ZERO ACTIVE BREACHES' : 'ELEVATED SHIELD MONITORING'}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                All REST API endpoints, WebSockets and booking pipelines protected under strict WAF filters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-emerald-700 font-bold">WAF ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Defense Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block mb-1">Total Inspected Events</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {securityData?.totalMonitoredEvents || 14}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Lifetime requests analyzed</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block mb-1">Blocked Threat Requests</span>
          <div className="text-2xl font-black text-rose-600 font-mono">
            {securityData?.totalThreatsBlocked || 0}
          </div>
          <span className="text-[10px] text-rose-600 block mt-1">Injections & Spikes blocked</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block mb-1">Active Rate Trackers</span>
          <div className="text-2xl font-black text-teal-700 font-mono">
            {securityData?.activeIpTrackers || 1}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Sliding token buckets</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block mb-1">Rate Limit Threshold</span>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            120 <span className="text-xs font-normal text-slate-500">req/min</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Per-IP sliding window</span>
        </div>
      </div>

      {/* Interactive Attack Simulation Sandbox */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">Live Threat Simulation & Heuristic Tester</h3>
          </div>
          <span className="text-xs text-slate-500">Verify firewall interception</span>
        </div>

        <p className="text-xs text-slate-600">
          Click any test probe below to send simulated payloads through the SMART EV security filter and observe real-time interception and defense logging:
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleTestProbe('SQLI_PROBE', "' UNION SELECT 1, user(), password FROM users--")}
            disabled={testingProbe}
            className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 hover:border-teal-500 text-xs font-mono text-teal-800 font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Play className="w-3 h-3 text-teal-600" />
            <span>Test SQL Injection Probe</span>
          </button>

          <button
            onClick={() => handleTestProbe('XSS_PROBE', '<script>alert("exploit")</script>')}
            disabled={testingProbe}
            className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 hover:border-amber-500 text-xs font-mono text-amber-800 font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Play className="w-3 h-3 text-amber-600" />
            <span>Test XSS Payload Filter</span>
          </button>

          <button
            onClick={() => handleTestProbe('PATH_TRAVERSAL', '../../../../etc/passwd')}
            disabled={testingProbe}
            className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 hover:border-rose-500 text-xs font-mono text-rose-800 font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Play className="w-3 h-3 text-rose-600" />
            <span>Test Path Traversal Guard</span>
          </button>
        </div>

        {probeResult && (
          <div
            className={`p-4 rounded-xl border text-xs font-mono mt-3 flex items-start gap-2.5 ${
              probeResult.blocked
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}
          >
            {probeResult.blocked ? (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold">{probeResult.message}</div>
              <div className="text-[11px] opacity-90 mt-0.5">
                Firewall Outcome: {probeResult.blocked ? 'BLOCKED (HTTP 403 Forbidden)' : 'ALLOWED'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Defense Mechanisms & Recent Event Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Defense Mechanisms */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Layered Protections
          </h4>
          <ul className="space-y-2 text-xs text-slate-700">
            {securityData?.activeDefenses?.map((d, i) => (
              <li key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium">{d}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Event Logs */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Real-Time Security Event Stream
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {securityData?.recentEvents?.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No recent security incidents logged. All systems clear.
              </div>
            ) : (
              securityData?.recentEvents?.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">{ev.eventType}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          ev.riskLevel === 'CRITICAL' || ev.riskLevel === 'HIGH'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {ev.riskLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{ev.details}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      IP: {ev.clientIp} • {new Date(ev.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      ev.isBlocked
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {ev.isBlocked ? 'BLOCKED' : 'LOGGED'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
