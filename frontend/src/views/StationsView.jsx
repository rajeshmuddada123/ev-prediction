import React, { useState } from 'react';
import LeafletMapView from '../components/LeafletMapView';
import {
  MapPin,
  Search,
  Filter,
  Zap,
  Navigation,
  CalendarCheck,
  Clock,
  BatteryMedium,
  CheckCircle,
  XCircle,
  Locate,
  AlertTriangle,
} from 'lucide-react';

export default function StationsView({
  stations = [],
  userLocation,
  gpsAccuracy,
  gpsStatus,
  selectedStation,
  onSelectStation,
  onBookStation,
  onTrackToStation,
  onRecenterGps,
  routeCoordinates,
  loadingStations,
  vehicle,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConnector, setSelectedConnector] = useState('ALL');
  const [minPower, setMinPower] = useState(0);
  const [maxDistance, setMaxDistance] = useState(50);

  // Filter stations based on user controls
  const filteredStations = stations.filter((st) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = st.name.toLowerCase().includes(q);
      const matchCity = (st.city || '').toLowerCase().includes(q);
      const matchAddress = (st.address || '').toLowerCase().includes(q);
      const matchOp = (st.operatorName || '').toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchAddress && !matchOp) return false;
    }

    // Distance filter
    if (st.distanceKm != null && st.distanceKm > maxDistance) {
      return false;
    }

    // Speed / Power filter
    if (minPower > 0 && st.maxPowerKw < minPower) {
      return false;
    }

    // Connector type filter
    if (selectedConnector !== 'ALL') {
      const hasConnector = st.connectors && st.connectors.some(
        (c) => c.connectorType.toLowerCase() === selectedConnector.toLowerCase()
      );
      if (!hasConnector) return false;
    }

    return true;
  });

  const currentEnergyKwh = vehicle ? (vehicle.batteryCapacityKwh * vehicle.currentSocPercentage) / 100 : 30;

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search charging stations by city, area, or network operator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Connector Dropdown */}
            <select
              value={selectedConnector}
              onChange={(e) => setSelectedConnector(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Connectors</option>
              <option value="CCS2">CCS2 (DC Fast)</option>
              <option value="Type 2">Type 2 (AC)</option>
              <option value="CHAdeMO">CHAdeMO (DC)</option>
              <option value="GB/T">GB/T</option>
            </select>

            {/* Min Speed */}
            <select
              value={minPower}
              onChange={(e) => setMinPower(Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
            >
              <option value="0">All Speeds</option>
              <option value="50">Fast (≥ 50 kW)</option>
              <option value="120">Superfast (≥ 120 kW)</option>
              <option value="180">Hypercharger (≥ 180 kW)</option>
            </select>
          </div>
        </div>

        {/* Distance Range Slider */}
        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span className="whitespace-nowrap font-semibold text-slate-700">
            Radius: <span className="text-teal-700 font-mono font-bold">{maxDistance} km</span>
          </span>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="w-full max-w-xs h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <span className="text-slate-400 text-[11px] ml-auto">
            Showing {filteredStations.length} of {stations.length} stations
          </span>
        </div>
      </div>

      {/* Main Grid: Leaflet Map (Left) + Stations List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map View */}
        <div className="lg:col-span-7 sticky top-20">
          <LeafletMapView
            userLocation={userLocation}
            gpsAccuracy={gpsAccuracy}
            gpsStatus={gpsStatus}
            stations={filteredStations}
            selectedStation={selectedStation}
            routeCoordinates={routeCoordinates}
            onSelectStation={onSelectStation}
            onBookSlot={onBookStation}
            onRecenter={onRecenterGps}
            loading={loadingStations}
            vehicle={vehicle}
            height="560px"
          />
        </div>

        {/* Stations Directory List */}
        <div className="lg:col-span-5 space-y-3 max-h-[560px] overflow-y-auto pr-1">
          {filteredStations.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-slate-500 text-xs bg-white border border-slate-200">
              No charging stations match your current search and filter criteria. Try expanding the radius slider or resetting filters.
            </div>
          ) : (
            filteredStations.map((st) => {
              const isSelected = selectedStation && (selectedStation.id === st.id || selectedStation.stationCode === st.stationCode);
              const hasAvailable = st.availableChargers > 0;
              const isOsm = st.stationCode && st.stationCode.startsWith('OSM-');

              // Battery required estimate
              const requiredKwh = st.distanceKm != null && vehicle
                ? Math.round((st.distanceKm / (vehicle.efficiencyKmPerKwh || 7.0)) * 10) / 10
                : null;
              const isReachable = requiredKwh != null ? currentEnergyKwh >= requiredKwh * 1.1 : true;

              return (
                <div
                  key={st.id || st.stationCode}
                  onClick={() => onSelectStation(st)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        {st.operatorName}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">{st.name}</h4>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-teal-700 font-mono block">
                        {st.distanceKm != null ? `${st.distanceKm} km` : ''}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">₹{st.costPerKwh}/kWh</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-2 line-clamp-1">{st.address}</p>

                  {/* Battery required pill */}
                  {requiredKwh != null && (
                    <div className="flex items-center gap-1.5 text-[11px] mb-2 font-medium">
                      {isReachable ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Requires ~{requiredKwh} kWh (Reachable)</span>
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Needs ~{requiredKwh} kWh (Low Battery!)</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Charger Availability Pill & Connectors */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold">
                      {isOsm ? (
                        <span className="text-slate-600 font-semibold text-[11px]">
                          OpenStreetMap Public Listing
                        </span>
                      ) : hasAvailable ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">
                            {st.availableChargers} of {st.totalChargers} Available
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span className="text-rose-600">All Occupied ({st.totalChargers}/{st.totalChargers})</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700">
                      <span>⚡ {st.maxPowerKw} kW</span>
                      <span className="text-slate-300">•</span>
                      <span>{st.operatingHours || '24/7'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrackToStation(st);
                      }}
                      className="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Navigation className="w-3 h-3 text-teal-600" />
                      <span>Directions</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookStation(st);
                      }}
                      className="py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <CalendarCheck className="w-3 h-3" />
                      <span>Book Slot</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
