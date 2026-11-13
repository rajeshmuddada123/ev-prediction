import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  CloudSun,
  Thermometer,
  Wind,
  Droplets,
  Sun,
  CloudRain,
  Compass,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export default function WeatherView({ userLocation, weatherData, onRefreshWeather }) {
  const [data, setData] = useState(weatherData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (weatherData) setData(weatherData);
  }, [weatherData]);

  const loadWeather = async () => {
    setLoading(true);
    try {
      const res = await api.getWeather(userLocation.lat, userLocation.lon);
      setData(res);
      if (onRefreshWeather) onRefreshWeather(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const w = data || weatherData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-teal-600" />
            <span>Local Meteorological Telemetry & EV Range Impact</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time weather monitoring directly correlated with vehicle range degradation and solar generation models.
          </p>
        </div>

        <button
          onClick={loadWeather}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
        >
          {loading ? 'Refreshing...' : 'Refresh Weather'}
        </button>
      </div>

      {/* Main Big Weather Banner with EV Impact Badge */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              {w?.cityName || 'Current Region'}
            </span>
            <div className="flex items-baseline gap-3">
              <h1 className="text-5xl sm:text-6xl font-black text-slate-900 font-mono">
                {w?.temperature || 26.5}°
              </h1>
              <div className="text-sm text-slate-600">
                <span className="font-bold text-slate-900 block">{w?.weatherDescription || 'Fair & Clear'}</span>
                <span>Feels like {w?.apparentTemperature || 27.5}°C</span>
              </div>
            </div>

            {/* EV Range Impact explanation card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <Zap className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Dynamic EV Battery Efficiency Impact:{' '}
                  <span
                    className={`font-mono font-bold ${
                      (w?.evRangeImpactPercentage || 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {w?.evRangeImpactPercentage > 0 ? `+${w?.evRangeImpactPercentage}%` : `${w?.evRangeImpactPercentage || 0}%`}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {w?.evRangeImpactSummary || 'Optimal operating temperatures minimize pack internal cell resistance.'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Atmospheric Metrics */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Humidity</span>
                <Droplets className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">{w?.relativeHumidity || 55}%</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Wind Velocity</span>
                <Wind className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">{w?.windSpeedKmh || 12} km/h</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Cloud Cover</span>
                <CloudSun className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">{w?.cloudCover || 20}%</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>UV Index</span>
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">{w?.uvIndex || 5.5}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Weather Forecast */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900">Hourly Weather Progression</h4>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 overflow-x-auto">
          {w?.hourly?.slice(0, 8).map((h, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1"
            >
              <span className="text-[11px] text-slate-500 font-mono block">{h.time}</span>
              <span className="text-sm font-bold text-slate-900 font-mono block">{h.temperature}°</span>
              <span className="text-[10px] text-teal-700 font-semibold block">{h.windSpeed} km/h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
