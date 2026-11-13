import React from 'react';
import BatteryVisualizer from '../components/BatteryVisualizer';
import LeafletMapView from '../components/LeafletMapView';
import {
  Zap,
  Sun,
  TrendingUp,
  MapPin,
  CalendarCheck,
  ShieldCheck,
  ArrowRight,
  BatteryMedium,
  Compass,
  AlertTriangle,
  CheckCircle,
  Locate,
} from 'lucide-react';

export default function HomeView({
  vehicle,
  onUpdateVehicleSoc,
  userLocation,
  gpsAccuracy,
  gpsStatus,
  stations = [],
  selectedStation,
  onSelectStation,
  onNavigateTab,
  onRecenterGps,
  solarData,
  weatherData,
  onBookStation,
  loadingStations,
}) {
  // Battery and station distance analysis
  const currentEnergyKwh = vehicle ? (vehicle.batteryCapacityKwh * vehicle.currentSocPercentage) / 100 : 30;
  const currentEstimatedRangeKm = vehicle ? Math.round(currentEnergyKwh * vehicle.efficiencyKmPerKwh) : 210;

  const isSelectedStationReachable = selectedStation && selectedStation.distanceKm != null
    ? currentEstimatedRangeKm >= (selectedStation.distanceKm * 1.15) // 15% safety margin
    : true;

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Quick Stats */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-white border border-slate-200 shadow-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-teal-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time OpenStreetMap & Solar AI Platform</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              AI-Powered EV Range Prediction & Solar-Aware Charging
            </h1>

            <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
              Standard OpenStreetMap tiles rendered via Leaflet.js with live browser GPS tracking, real nearby charging stations, and intelligent solar irradiance charging predictions.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigateTab('stations')}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
              >
                <MapPin className="w-4 h-4" />
                <span>Find Nearby Chargers</span>
              </button>
              <button
                onClick={() => onNavigateTab('range')}
                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 hover:bg-slate-100 transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span>Simulate Range</span>
              </button>
              <button
                onClick={() => onNavigateTab('solar')}
                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 hover:bg-slate-100 transition-colors"
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Solar Potential</span>
              </button>
            </div>
          </div>

          {/* Quick Snapshot Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
                <span>Solar Irradiance</span>
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {solarData?.currentIrradianceWm2 || 620} <span className="text-xs font-normal text-slate-500">W/m²</span>
              </div>
              <span className="text-[10px] text-amber-700 font-bold mt-1 block">
                {solarData?.sunlightIntensity || 'Optimal Sunshine'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
                <span>Local Weather</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  {weatherData?.weatherDescription || 'Fair'}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {weatherData?.temperature || 26.5}°C
              </div>
              <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                Range Impact: {weatherData?.evRangeImpactPercentage > 0 ? `+${weatherData?.evRangeImpactPercentage}%` : `${weatherData?.evRangeImpactPercentage || 0}%`}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
                <span>Nearby Chargers</span>
                <Zap className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {stations.length}{' '}
                <span className="text-xs font-normal text-slate-500">stations</span>
              </div>
              <span className="text-[10px] text-teal-700 font-bold mt-1 block">
                {stations.reduce((acc, s) => acc + (s.availableChargers || 0), 0)} ports available
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
                <span>Optimal Solar Time</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="text-sm font-black text-slate-900 font-mono mt-1">
                {solarData?.recommendation?.optimalWindowStart || '11:00 AM'} - {solarData?.recommendation?.optimalWindowEnd || '03:30 PM'}
              </div>
              <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                {solarData?.recommendation?.solarSharePercentage || 78}% Solar-derived
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Row: Battery visualizer + Leaflet Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Battery state & Range Integration Check */}
        <div className="lg:col-span-5 space-y-6">
          <BatteryVisualizer
            soc={vehicle?.currentSocPercentage || 75}
            capacity={vehicle?.batteryCapacityKwh || 40.5}
            efficiency={vehicle?.efficiencyKmPerKwh || 7.2}
            brand={vehicle?.brand || 'Tata Motors'}
            model={vehicle?.model || 'Nexon EV Max'}
            onSocChange={onUpdateVehicleSoc}
            interactive={true}
          />

          {/* Map & Battery Integration Warning / Confirmation Box */}
          {selectedStation && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isSelectedStationReachable
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-rose-50/80 border-rose-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {isSelectedStationReachable ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {isSelectedStationReachable
                      ? `Reachable with Safe Margin (${selectedStation.distanceKm} km away)`
                      : `Warning: Low Battery for Target Station!`}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Target: <b>{selectedStation.name}</b>. Estimated trip consumption: ~
                    {Math.round(((selectedStation.distanceKm || 10) / (vehicle?.efficiencyKmPerKwh || 7.0)) * 10) / 10} kWh.
                    Current range is {currentEstimatedRangeKm} km.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Solar Recommendation Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Solar-Aware EV Charging Advice
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {solarData?.recommendation?.advice ||
                'Charge your EV between 11:00 AM and 03:30 PM to harness peak solar generation. Over 75% of your battery pack can be filled directly from green solar energy.'}
            </p>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span className="text-slate-500">Est. Solar Savings:</span>
              <span className="font-bold text-emerald-700 font-mono">
                ₹{solarData?.recommendation?.estimatedSavings || 185} • {solarData?.recommendation?.estimatedCo2SavedKg || 12.4} kg CO₂ saved
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Leaflet OpenStreetMap Map */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-600" />
                <span>Live OpenStreetMap Charging Stations</span>
              </h3>
              <span className="text-xs text-slate-500">
                Standard OSM tiles • Centered on your actual GPS coordinates
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('stations')}
              className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <LeafletMapView
            userLocation={userLocation}
            gpsAccuracy={gpsAccuracy}
            gpsStatus={gpsStatus}
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={onSelectStation}
            onBookSlot={onBookStation}
            onRecenter={onRecenterGps}
            loading={loadingStations}
            vehicle={vehicle}
            height="440px"
          />
        </div>
      </div>

      {/* Nearby Charging Stations Horizontal Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-600" />
            <span>Nearby High-Speed Charging Hubs</span>
          </h3>
          <span className="text-xs text-slate-500">Real-time availability & distance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stations.slice(0, 3).map((st) => (
            <div
              key={st.id || st.stationCode}
              className="bg-white border border-slate-200 hover:border-teal-500 rounded-2xl p-4 transition-all hover:shadow-md flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    {st.operatorName}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    {st.distanceKm != null ? `${st.distanceKm} km` : 'Nearby'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{st.name}</h4>
                <p className="text-xs text-slate-500 mb-3 line-clamp-1">{st.address}</p>

                <div className="flex items-center gap-2 text-xs text-slate-700 mb-3">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-semibold text-slate-800">
                    ⚡ {st.maxPowerKw} kW DC
                  </span>
                  <span className="text-emerald-700 font-bold text-[11px]">
                    {st.availableChargers}/{st.totalChargers} Available
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    onSelectStation(st);
                    onNavigateTab('stations');
                  }}
                  className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Directions
                </button>
                <button
                  onClick={() => onBookStation(st)}
                  className="flex-1 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
