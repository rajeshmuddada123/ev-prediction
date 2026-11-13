import React from 'react';
import { Zap, BatteryCharging, BatteryMedium, ShieldAlert, Cpu } from 'lucide-react';

export default function BatteryVisualizer({
  soc = 75,
  capacity = 40,
  efficiency = 7.0,
  brand = 'Tata Motors',
  model = 'Nexon EV Max',
  onSocChange,
  interactive = false,
  isCharging = false,
}) {
  const remainingEnergy = Math.round(((capacity * soc) / 100) * 10) / 10;
  const estimatedRange = Math.round(remainingEnergy * efficiency);

  // Dynamic color depending on SOC
  const getColor = () => {
    if (soc <= 15) return { stroke: '#EF4444', fill: 'from-rose-500 to-red-500', text: 'text-rose-600', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
    if (soc <= 30) return { stroke: '#F59E0B', fill: 'from-amber-500 to-amber-600', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { stroke: '#0D9488', fill: 'from-teal-500 to-emerald-500', text: 'text-teal-700', badge: 'bg-teal-50 text-teal-700 border-teal-200' };
  };

  const theme = getColor();

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden bg-white shadow-sm border border-slate-200">
      {/* Background subtle tint */}
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />

      {/* Vehicle details & status badge */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">{brand}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-medium">Configured EV</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">{model}</h3>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${theme.badge}`}>
          {isCharging ? (
            <>
              <BatteryCharging className="w-3.5 h-3.5 animate-pulse text-teal-600" />
              <span>Charging Active</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>{soc <= 20 ? 'Low Battery' : 'Drive Ready'}</span>
            </>
          )}
        </div>
      </div>

      {/* Main visualization grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Animated Battery Graphic */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-44 h-24 bg-slate-100 rounded-2xl border-2 border-slate-300 p-2 shadow-inner flex items-center">
            {/* Battery Positive Terminal */}
            <div className="absolute -right-3 w-2.5 h-10 bg-slate-300 rounded-r-md top-1/2 -translate-y-1/2" />

            {/* Inner cell container */}
            <div className="w-full h-full rounded-xl bg-white relative overflow-hidden p-1 flex items-center border border-slate-200">
              {/* Fill bar */}
              <div
                className={`h-full rounded-lg bg-gradient-to-r ${theme.fill} transition-all duration-700 relative`}
                style={{ width: `${Math.max(6, soc)}%` }}
              >
                {/* Subtle shine / wave reflection */}
                <div className="absolute inset-0 bg-white/25 opacity-40 animate-pulse rounded-lg" />
              </div>

              {/* Centered Big Percentage */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] font-mono">
                  {Math.round(soc)}%
                </span>
              </div>
            </div>
          </div>

          {interactive && (
            <div className="w-full mt-4">
              <div className="flex justify-between text-xs text-slate-600 font-semibold mb-1">
                <span>Battery SOC Slider</span>
                <span className="text-teal-700 font-mono font-bold">{soc}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={soc}
                onChange={(e) => onSocChange && onSocChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>
          )}
        </div>

        {/* Real Computed Metrics */}
        <div className="md:col-span-7 grid grid-cols-2 gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-xs text-slate-500 font-medium block mb-1">Estimated Range</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black ${theme.text} font-mono tracking-tight`}>
                {estimatedRange}
              </span>
              <span className="text-xs text-slate-500">km</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">At {efficiency} km/kWh</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-xs text-slate-500 font-medium block mb-1">Remaining Energy</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {remainingEnergy}
              </span>
              <span className="text-xs text-slate-500">/ {capacity} kWh</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Pack usable energy</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-xs text-slate-500 font-medium block mb-1">Vehicle Efficiency</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900 font-mono">
                {efficiency}
              </span>
              <span className="text-xs text-slate-500">km/kWh</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">~{Math.round((1000 / efficiency))} Wh/km</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-xs text-slate-500 font-medium block mb-1">Safe Reserve Buffer</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900 font-mono">
                {Math.round(remainingEnergy * 0.15 * 10) / 10}
              </span>
              <span className="text-xs text-slate-500">kWh (15%)</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Emergency depot reserve</span>
          </div>
        </div>
      </div>
    </div>
  );
}
