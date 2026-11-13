import React, { useState } from 'react';
import BatteryVisualizer from '../components/BatteryVisualizer';
import {
  BatteryCharging,
  Save,
  CheckCircle,
  Car,
  Sliders,
  Zap,
  Info,
  ShieldAlert,
} from 'lucide-react';

export default function BatteryView({ vehicle, onSaveVehicle }) {
  const [formData, setFormData] = useState({
    brand: vehicle?.brand || 'Tata Motors',
    model: vehicle?.model || 'Nexon EV Max',
    batteryCapacityKwh: vehicle?.batteryCapacityKwh || 40.5,
    currentSocPercentage: vehicle?.currentSocPercentage || 75.0,
    efficiencyKmPerKwh: vehicle?.efficiencyKmPerKwh || 7.2,
    connectorType: vehicle?.connectorType || 'CCS2',
    registrationNumber: vehicle?.registrationNumber || 'DL-01-EV-2026',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const presets = [
    { brand: 'Tata Motors', model: 'Nexon EV Max', capacity: 40.5, efficiency: 7.2, connector: 'CCS2' },
    { brand: 'Tata Motors', model: 'Curvv EV 55', capacity: 55.0, efficiency: 7.5, connector: 'CCS2' },
    { brand: 'MG', model: 'ZS EV Long Range', capacity: 50.3, efficiency: 6.8, connector: 'CCS2' },
    { brand: 'Hyundai', model: 'Ioniq 5 AWD', capacity: 72.6, efficiency: 6.5, connector: 'CCS2' },
    { brand: 'Kia', model: 'EV6 GT-Line', capacity: 77.4, efficiency: 6.7, connector: 'CCS2' },
    { brand: 'BYD', model: 'Atto 3', capacity: 60.5, efficiency: 7.0, connector: 'CCS2' },
    { brand: 'Tesla', model: 'Model 3 Long Range', capacity: 78.0, efficiency: 7.8, connector: 'CCS2' },
  ];

  const handleApplyPreset = (p) => {
    setFormData((prev) => ({
      ...prev,
      brand: p.brand,
      model: p.model,
      batteryCapacityKwh: p.capacity,
      efficiencyKmPerKwh: p.efficiency,
      connectorType: p.connector,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await onSaveVehicle(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const remainingKwh = Math.round(((formData.batteryCapacityKwh * formData.currentSocPercentage) / 100) * 10) / 10;
  const estimatedRange = Math.round(remainingKwh * formData.efficiencyKmPerKwh);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BatteryCharging className="w-6 h-6 text-teal-600" />
            <span>EV Battery Management & Calibration</span>
          </h2>
          <p className="text-xs text-slate-500">
            Configure vehicle parameters, pack capacity and battery state-of-charge (SOC).
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium flex items-center gap-2 shadow-sm">
          <Info className="w-3.5 h-3.5 text-teal-600" />
          <span>Manual Entry Mode (No account required)</span>
        </div>
      </div>

      {/* Main Grid: Visualizer + Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Battery Visualizer Component */}
        <div className="lg:col-span-5 space-y-6">
          <BatteryVisualizer
            soc={formData.currentSocPercentage}
            capacity={formData.batteryCapacityKwh}
            efficiency={formData.efficiencyKmPerKwh}
            brand={formData.brand}
            model={formData.model}
            onSocChange={(val) => setFormData((prev) => ({ ...prev, currentSocPercentage: val }))}
            interactive={true}
          />

          {/* Vehicle Presets Selector */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Car className="w-4 h-4 text-teal-600" />
              <span>Select Electric Vehicle Preset</span>
            </h4>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
              {presets.map((p) => {
                const isSelected = formData.model === p.model;
                return (
                  <button
                    key={p.model}
                    onClick={() => handleApplyPreset(p)}
                    className={`text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 text-teal-800 ring-2 ring-teal-500/20'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{p.brand} {p.model}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {p.capacity} kWh • {p.efficiency} km/kWh
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 font-semibold text-slate-700">
                      {p.connector}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Configuration Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSave} className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-600" />
                <span>Vehicle Specifications & Calibration</span>
              </h3>
              {savedSuccess && (
                <span className="text-xs text-emerald-600 flex items-center gap-1 font-bold animate-pulse">
                  <CheckCircle className="w-4 h-4" />
                  <span>Saved to Local Session</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Vehicle Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Model Name</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Pack Capacity (kWh)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="150"
                  value={formData.batteryCapacityKwh}
                  onChange={(e) => setFormData({ ...formData, batteryCapacityKwh: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Efficiency (km / kWh)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="12.0"
                  value={formData.efficiencyKmPerKwh}
                  onChange={(e) => setFormData({ ...formData, efficiencyKmPerKwh: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Primary Connector</label>
                <select
                  value={formData.connectorType}
                  onChange={(e) => setFormData({ ...formData, connectorType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                >
                  <option value="CCS2">CCS2 (Combined Charging System Type 2)</option>
                  <option value="Type 2">Type 2 (Mennekes AC)</option>
                  <option value="CHAdeMO">CHAdeMO (DC Fast)</option>
                  <option value="GB/T">GB/T (China Standard)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Optional Registration No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. DL-01-EV-2026"
                  value={formData.registrationNumber || ''}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Current Battery SOC: <span className="text-teal-700 font-mono">{formData.currentSocPercentage}%</span>
                </label>
                <div className="pt-2">
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={formData.currentSocPercentage}
                    onChange={(e) => setFormData({ ...formData, currentSocPercentage: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Output Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Calculated Telemetry Verification
              </span>
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Usable Energy:</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{remainingKwh} kWh</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Estimated Range:</span>
                  <span className="text-sm font-bold text-teal-700 font-mono">{estimatedRange} km</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Wh / km:</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {Math.round(1000 / (formData.efficiencyKmPerKwh || 7))} Wh/km
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01]"
            >
              <Save className="w-4 h-4" />
              <span>Save Vehicle Configuration</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
