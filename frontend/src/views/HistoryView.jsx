import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  History,
  TrendingUp,
  Zap,
  CalendarCheck,
  Leaf,
  Sun,
  BatteryMedium,
  CheckCircle,
} from 'lucide-react';

export default function HistoryView() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getHistoryAnalytics();
      setAnalytics(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-teal-600" />
          <span>Mobility History & Renewable Analytics</span>
        </h2>
        <p className="text-xs text-slate-500">
          Complete archive of charging sessions, slot reservations, energy consumption and carbon offset records.
        </p>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-sm">
          <span className="text-xs text-slate-500 font-medium block mb-1">Total Reservations</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {analytics?.totalBookings || 0}
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block mt-1">
            {analytics?.activeBookings || 0} Active / Upcoming
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-sm">
          <span className="text-xs text-slate-500 font-medium block mb-1">Charging Sessions</span>
          <div className="text-2xl font-black text-teal-700 font-mono">
            {analytics?.totalChargingSessions || 0}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Completed fast charges</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-sm">
          <span className="text-xs text-slate-500 font-medium block mb-1">Energy Delivered</span>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {analytics?.totalEnergyDeliveredKwh || 0} <span className="text-xs font-normal text-slate-400">kWh</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Total kWh dispensed</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-sm">
          <span className="text-xs text-slate-500 font-medium block mb-1">CO₂ Abated</span>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {analytics?.totalCo2OffsetKg || 0} <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block mt-1">Direct environmental benefit</span>
        </div>
      </div>

      {/* 7-Day Energy Consumption vs Solar Trend Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">7-Day Energy Consumed vs Solar Generation</h4>
            <span className="text-xs text-slate-500">Energy audit and self-consumption ratio</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-teal-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-600" />
              EV Consumed (kWh)
            </span>
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              Solar Generated (kWh)
            </span>
          </div>
        </div>

        <div className="h-52 flex items-end gap-3 sm:gap-6 pt-6 pb-2 overflow-x-auto">
          {analytics?.weeklyTrend?.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-[40px]">
              <div className="w-full flex items-end justify-center gap-1 h-full">
                {/* Consumed Bar */}
                <div
                  className="w-1/2 max-w-[16px] rounded-t bg-teal-600 transition-all hover:brightness-110 shadow-sm"
                  style={{ height: `${Math.min(100, (item.energyConsumedKwh / 25) * 100)}%` }}
                  title={`${item.date}: Consumed ${item.energyConsumedKwh} kWh`}
                />
                {/* Solar Bar */}
                <div
                  className="w-1/2 max-w-[16px] rounded-t bg-amber-400 transition-all hover:brightness-110 shadow-sm"
                  style={{ height: `${Math.min(100, (item.solarGeneratedKwh / 25) * 100)}%` }}
                  title={`${item.date}: Solar ${item.solarGeneratedKwh} kWh`}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-2 font-mono font-medium">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Sessions & Bookings Dual Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Booking Reservations
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {analytics?.bookings?.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No booking records found.</div>
            ) : (
              analytics?.bookings?.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono text-teal-700 font-bold block">{b.bookingId}</span>
                    <span className="text-slate-900 font-bold">{b.stationName}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {b.slotDate} ({b.slotTime}) • {b.connectorType}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {b.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 block mt-1">₹{b.estimatedCost}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Charging Sessions */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Charging Session Logs
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {analytics?.sessions?.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No charging sessions logged yet.</div>
            ) : (
              analytics?.sessions?.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono text-emerald-700 font-bold block">{s.sessionId}</span>
                    <span className="text-slate-900 font-bold">{s.stationName}</span>
                    <span className="text-[10px] text-slate-500 block">
                      SOC {s.startSoc}% → {s.currentSoc}% • {s.powerKw} kW DC
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-teal-700 block">
                      {s.energyDeliveredKwh} kWh
                    </span>
                    <span className="text-[10px] text-slate-500 block">{s.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
