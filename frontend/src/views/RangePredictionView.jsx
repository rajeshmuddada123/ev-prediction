import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Thermometer,
  Wind,
  Compass,
  Zap,
  ShieldAlert,
  Car,
  MapPin,
} from 'lucide-react';

export default function RangePredictionView({ vehicle, weatherData, onSelectStation, onNavigateTab }) {
  const [params, setParams] = useState({
    batteryPercentage: vehicle?.currentSocPercentage || 75.0,
    batteryCapacityKwh: vehicle?.batteryCapacityKwh || 40.5,
    vehicleEfficiencyKmPerKwh: vehicle?.efficiencyKmPerKwh || 7.2,
    journeyDistanceKm: 75.0,
    ambientTemperatureC: weatherData?.temperature || 26.0,
    trafficCondition: 'NORMAL',
    roadTerrain: 'FLAT',
    acOn: true,
    windSpeedKmh: weatherData?.windSpeedKmh || 12.0,
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const runPrediction = async () => {
    setLoading(true);
    try {
      const res = await api.predictRange(params);
      setPrediction(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrediction();
  }, [params.batteryPercentage, params.journeyDistanceKm, params.trafficCondition, params.roadTerrain, params.acOn, params.ambientTemperatureC]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-teal-600" />
          <span>AI-Powered EV Dynamic Range Prediction</span>
        </h2>
        <p className="text-xs text-slate-500">
          Kinetic, thermal & aerodynamic energy simulation taking ambient temperature, traffic, and topography into account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Sliders & Driving Scenario */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-sm space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Journey & Environmental Parameters
          </h3>

          {/* Journey Distance */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">Planned Journey Distance</span>
              <span className="text-teal-700 font-mono text-sm font-bold">{params.journeyDistanceKm} km</span>
            </div>
            <input
              type="range"
              min="10"
              max="350"
              value={params.journeyDistanceKm}
              onChange={(e) => setParams({ ...params, journeyDistanceKm: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>

          {/* Battery SOC */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">Initial Battery SOC</span>
              <span className="text-emerald-700 font-mono text-sm font-bold">{params.batteryPercentage}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={params.batteryPercentage}
              onChange={(e) => setParams({ ...params, batteryPercentage: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>

          {/* Ambient Temperature */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                Ambient Temperature
              </span>
              <span className="text-amber-600 font-mono text-sm font-bold">{params.ambientTemperatureC}°C</span>
            </div>
            <input
              type="range"
              min="-10"
              max="50"
              value={params.ambientTemperatureC}
              onChange={(e) => setParams({ ...params, ambientTemperatureC: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Optimal electrochemical window is 20°C - 26°C
            </span>
          </div>

          {/* Traffic conditions */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Traffic Conditions</label>
            <div className="grid grid-cols-4 gap-1.5">
              {['LIGHT', 'NORMAL', 'HEAVY', 'CONGESTED'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setParams({ ...params, trafficCondition: t })}
                  className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                    params.trafficCondition === t
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Road Terrain */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Road Profile & Terrain</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'FLAT', label: 'Flat City' },
                { id: 'HIGHWAY', label: 'Highway (>90km/h)' },
                { id: 'HILLY', label: 'Hilly / Elevation' },
              ].map((ter) => (
                <button
                  key={ter.id}
                  type="button"
                  onClick={() => setParams({ ...params, roadTerrain: ter.id })}
                  className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all ${
                    params.roadTerrain === ter.id
                      ? 'bg-teal-50 border-teal-500 text-teal-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {ter.label}
                </button>
              ))}
            </div>
          </div>

          {/* HVAC AC Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Cabin AC / Climate Control</span>
              <span className="text-[10px] text-slate-500">Adds ~1.5 kW continuous thermal load</span>
            </div>
            <button
              type="button"
              onClick={() => setParams({ ...params, acOn: !params.acOn })}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                params.acOn
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {params.acOn ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Right Column: AI Prediction Results */}
        <div className="lg:col-span-7 space-y-5">
          {prediction ? (
            <>
              {/* Reachability Banner */}
              <div
                className={`p-5 rounded-2xl border flex items-center justify-between gap-4 shadow-sm ${
                  prediction.isDestinationReachable
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-rose-50 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {prediction.isDestinationReachable ? (
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {prediction.isDestinationReachable
                        ? 'Destination is Safely Reachable'
                        : 'Charging Stop Required Before Destination!'}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {prediction.isDestinationReachable
                        ? `Safety buffer margin: ${prediction.safetyMarginKm} km remaining after trip.`
                        : `Energy deficit detected! Vehicle will deplete charge before reaching destination.`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Est. Arrival SOC</span>
                  <span
                    className={`text-2xl font-black font-mono ${
                      prediction.predictedSocAfterJourney > 15 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {prediction.predictedSocAfterJourney}%
                  </span>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1">Max Travel Distance</span>
                  <div className="text-xl font-black text-slate-900 font-mono">{prediction.maxTravelDistanceKm} km</div>
                  <span className="text-[10px] text-slate-400">At current conditions</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1">Predicted Energy Used</span>
                  <div className="text-xl font-black text-teal-700 font-mono">{prediction.predictedConsumptionKwh} kWh</div>
                  <span className="text-[10px] text-slate-400">Trip consumption</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1">Energy After Trip</span>
                  <div className="text-xl font-black text-emerald-700 font-mono">{prediction.predictedRemainingEnergyKwh} kWh</div>
                  <span className="text-[10px] text-slate-400">Remaining in pack</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1">Safety Margin</span>
                  <div
                    className={`text-xl font-black font-mono ${
                      prediction.safetyMarginKm > 20 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {prediction.safetyMarginKm} km
                  </div>
                  <span className="text-[10px] text-slate-400">Buffer above reserve</span>
                </div>
              </div>

              {/* Environmental Loss Factors Breakdown */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Dynamic Degradation Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(prediction.lossFactors || {}).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <span className="text-slate-600">{key}</span>
                      <span className="font-mono font-bold text-slate-900">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended charging stations if needed */}
              {prediction.recommendedStations && prediction.recommendedStations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Recommended En-Route Charging Stations</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {prediction.recommendedStations.map((st) => (
                      <div
                        key={st.id}
                        className="p-3 rounded-xl bg-white border border-slate-200 hover:border-teal-500 shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-xs mb-1 line-clamp-1">{st.name}</div>
                          <div className="text-[11px] text-slate-500 mb-2 font-mono">⚡ {st.maxPowerKw} kW DC</div>
                        </div>
                        <button
                          onClick={() => {
                            onSelectStation(st);
                            onNavigateTab('stations');
                          }}
                          className="w-full py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold hover:bg-teal-100 transition-colors"
                        >
                          Route to Station
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transparency, Assumptions and Limitations */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <span className="font-bold text-slate-700 block mb-1">
                  Model Assumptions & Accuracy Limitations:
                </span>
                {prediction.assumptionsAndLimitations?.map((a, idx) => (
                  <p key={idx} className="leading-relaxed">• {a}</p>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-400 text-sm">
              Calculating AI Range Model...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
