import React from 'react';
import { BatteryCharging, Zap, Square, Clock } from 'lucide-react';

export default function ActiveSessionBar({ session, onStopCharging }) {
  if (!session || session.status !== 'IN_PROGRESS') return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:left-72 lg:right-8 z-40">
      <div className="p-4 rounded-2xl bg-white border-2 border-teal-500 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 animate-pulse">
            <BatteryCharging className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Live Charging Session • {session.isSimulated ? 'Hardware Simulation' : 'Connected'}
              </span>
              <span className="text-xs text-slate-500 font-mono font-semibold">{session.sessionId}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">{session.stationName}</h4>
          </div>
        </div>

        {/* Real-time metrics */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">Current SOC:</span>
            <span className="text-base font-black text-emerald-600">{session.currentSoc}%</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px]">Charging Power:</span>
            <span className="text-base font-black text-teal-600">{session.powerKw} kW</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px]">Energy Delivered:</span>
            <span className="text-base font-black text-slate-900">{session.energyDeliveredKwh} kWh</span>
          </div>

          <button
            onClick={() => onStopCharging(session.sessionId)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Charging</span>
          </button>
        </div>
      </div>
    </div>
  );
}
