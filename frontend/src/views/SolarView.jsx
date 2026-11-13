import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Sun,
  Zap,
  TrendingUp,
  Sliders,
  CheckCircle,
  CloudSun,
  ShieldAlert,
  ArrowRight,
  Info,
  DollarSign,
  Leaf,
} from 'lucide-react';

export default function SolarView({ userLocation, vehicle, solarData, onRefreshSolar }) {
  const [mode, setMode] = useState('MODE_A_POTENTIAL'); // MODE_A_POTENTIAL or MODE_B_INSTALLED
  const [capacityKw, setCapacityKw] = useState(5.0);
  const [efficiencyPct, setEfficiencyPct] = useState(19.5);
  const [localData, setLocalData] = useState(solarData);
  const [loading, setLoading] = useState(false);

  const fetchSolarData = async (m, cap, eff) => {
    setLoading(true);
    try {
      const res = await api.getSolar({
        lat: userLocation.lat,
        lon: userLocation.lon,
        mode: m,
        capacity: cap,
        efficiency: eff,
      });
      setLocalData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolarData(mode, capacityKw, efficiencyPct);
  }, [mode, userLocation.lat, userLocation.lon]);

  const handleUpdateInstalledSystem = (e) => {
    e.preventDefault();
    fetchSolarData('MODE_B_INSTALLED', capacityKw, efficiencyPct);
  };

  const data = localData || solarData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sun className="w-6 h-6 text-amber-500" />
            <span>Solar Irradiance & Photovoltaic Generation Analytics</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time solar irradiance telemetry, PV power potential, and intelligent green charging alignment.
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setMode('MODE_A_POTENTIAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'MODE_A_POTENTIAL'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode A: Local Potential
          </button>
          <button
            onClick={() => setMode('MODE_B_INSTALLED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'MODE_B_INSTALLED'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode B: Installed System
          </button>
        </div>
      </div>

      {/* Main Irradiance & Power Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Global Solar Irradiance</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {data?.currentIrradianceWm2 || 620}{' '}
            <span className="text-xs font-normal text-slate-500">W/m²</span>
          </div>
          <span className="text-[10px] text-amber-700 font-bold block mt-1">
            {data?.sunlightIntensity || 'High Sunlight Intensity'}
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Estimated PV Output</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {data?.currentPowerKw || 3.4}{' '}
            <span className="text-xs font-normal text-slate-500">kW</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            {mode === 'MODE_A_POTENTIAL' ? '5 kW regional reference' : `System: ${capacityKw} kW`}
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Generation Today</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700 font-mono">
            {data?.energyGeneratedTodayKwh || 18.6}{' '}
            <span className="text-xs font-normal text-slate-500">kWh</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Peak power: {data?.peakPowerTodayKw || 4.2} kW
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Daylight Window</span>
            <CloudSun className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-sm font-black text-slate-900 font-mono mt-1">
            {data?.sunriseTime || '06:15'} → {data?.sunsetTime || '18:20'}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Cloud cover: {data?.cloudCoverPercentage || 15}%
          </span>
        </div>
      </div>

      {/* Solar-Aware EV Charging Recommendation Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 relative overflow-hidden shadow-sm">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Sun className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-900">Intelligent Solar-Aware Charging Window</h3>
          </div>

          <p className="text-sm text-slate-700 max-w-2xl leading-relaxed">
            {data?.recommendation?.advice ||
              'Charge your vehicle between 11:00 AM and 03:30 PM. Peak solar irradiance ensures over 78% of your battery charge is powered entirely by zero-emission renewable energy.'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 block font-medium">Optimal Window:</span>
              <span className="text-sm font-black text-amber-700 font-mono">
                {data?.recommendation?.optimalWindowStart || '11:00 AM'} - {data?.recommendation?.optimalWindowEnd || '03:30 PM'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 block font-medium">Solar Share:</span>
              <span className="text-base font-black text-emerald-700 font-mono">
                {data?.recommendation?.solarSharePercentage || 78.5}% Green
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 block font-medium">Estimated Savings:</span>
              <span className="text-base font-black text-slate-900 font-mono flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                ₹{data?.recommendation?.estimatedSavings || 165}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 block font-medium">CO₂ Abated:</span>
              <span className="text-base font-black text-teal-700 font-mono flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                {data?.recommendation?.estimatedCo2SavedKg || 12.4} kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode B: System Configuration */}
      {mode === 'MODE_B_INSTALLED' && (
        <form
          onSubmit={handleUpdateInstalledSystem}
          className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>Installed Solar Panel Parameters</span>
            </h4>
            <span className="text-xs text-slate-500">Custom System Tuning</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                System Capacity (kW)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="100"
                value={capacityKw}
                onChange={(e) => setCapacityKw(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Panel Efficiency (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="12"
                max="25"
                value={efficiencyPct}
                onChange={(e) => setEfficiencyPct(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-teal-500"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                Recalculate Generation
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 24-Hour Solar Generation Curve Visualizer */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">24-Hour Solar Generation & Irradiance Curve</h4>
          <span className="text-xs text-slate-500">Diurnal Sunlight Trajectory</span>
        </div>

        <div className="h-48 flex items-end gap-1 sm:gap-2 pt-6 pb-2 overflow-x-auto">
          {data?.hourlyForecast?.map((hf, i) => {
            const heightPct = Math.min(100, (hf.irradianceWm2 / 900) * 100);
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end h-full min-w-[20px] group relative"
              >
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap z-20 pointer-events-none shadow-md">
                  {hf.time}: {hf.irradianceWm2} W/m² • {hf.estimatedPowerKw} kW
                </div>

                {/* Bar */}
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-amber-400 via-amber-300 to-amber-200 transition-all duration-200 group-hover:brightness-95"
                  style={{ height: `${Math.max(4, heightPct)}%` }}
                />

                {/* Hour label */}
                <span className="text-[9px] text-slate-400 mt-2 font-mono">
                  {i % 3 === 0 ? hf.time.split(':')[0] : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Methodological Transparency Note */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {data?.measurementDistinction ||
            'Meteorological solar irradiance and photovoltaic power generation estimates are modeled from open satellite radiation sensors. Physical output from roof-installed systems may vary depending on inverter efficiency, panel tilt, azimuth orientation, and environmental dust.'}
        </p>
      </div>
    </div>
  );
}
