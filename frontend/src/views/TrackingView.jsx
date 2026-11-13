import React, { useState, useEffect } from 'react';
import LeafletMapView from '../components/LeafletMapView';
import { api } from '../api/client';
import {
  Navigation,
  Play,
  Square,
  Compass,
  Clock,
  Gauge,
  BatteryMedium,
  CheckCircle,
  AlertCircle,
  MapPin,
  Locate,
} from 'lucide-react';

export default function TrackingView({
  stations = [],
  selectedStation,
  onSelectStation,
  userLocation,
  gpsAccuracy,
  gpsStatus,
  onRecenterGps,
  vehicle,
}) {
  const [targetStationId, setTargetStationId] = useState(selectedStation ? selectedStation.id : (stations[0]?.id || 1));
  const [isTracking, setIsTracking] = useState(false);
  const [trackingPos, setTrackingPos] = useState(userLocation);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [heading, setHeading] = useState(45);
  const [remainingKm, setRemainingKm] = useState(0);
  const [etaMins, setEtaMins] = useState(0);
  const [routeCoords, setRouteCoords] = useState([]);
  const [batterySoc, setBatterySoc] = useState(vehicle?.currentSocPercentage || 75);

  const targetStation = stations.find((s) => s.id === Number(targetStationId)) || stations[0];

  // Fetch route when target changes or tracking starts
  useEffect(() => {
    if (!targetStation) return;
    const fetchRoute = async () => {
      const res = await api.fetchRoute(
        trackingPos.lat,
        trackingPos.lon,
        targetStation.latitude,
        targetStation.longitude
      );
      setRouteCoords(res.coordinates);
      setRemainingKm(res.distanceKm);
      setEtaMins(res.durationMinutes);
    };
    fetchRoute();
  }, [targetStationId]);

  // Live simulation / GPS tick loop when tracking is active
  useEffect(() => {
    let interval = null;
    if (isTracking && targetStation && routeCoords.length > 0) {
      let stepIndex = 0;
      setCurrentSpeed(42);

      interval = setInterval(() => {
        if (stepIndex < routeCoords.length) {
          const [lon, lat] = routeCoords[stepIndex];
          setTrackingPos({ lat, lon });
          stepIndex++;

          // Distance decay
          const fractionRemaining = 1.0 - (stepIndex / routeCoords.length);
          const rem = Math.max(0.1, Math.round(remainingKm * fractionRemaining * 10) / 10);
          setRemainingKm(rem);
          setEtaMins(Math.max(1, Math.round((rem / 40) * 60)));

          // Tiny battery consumption
          setBatterySoc((prev) => Math.max(5, Math.round((prev - 0.05) * 10) / 10));

          // Post update to backend
          api.updateTracking({
            targetStationId: targetStation.id,
            latitude: lat,
            longitude: lon,
            speedKmh: 42.0,
            heading: 65.0,
            batteryPercentage: batterySoc,
          }).catch(() => {});
        } else {
          // Arrived
          setIsTracking(false);
          setCurrentSpeed(0);
          alert('You have safely arrived at ' + targetStation.name + '!');
        }
      }, 2000);
    } else {
      setCurrentSpeed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, routeCoords]);

  const handleToggleTracking = () => {
    if (isTracking) {
      setIsTracking(false);
      api.stopTracking().catch(() => {});
    } else {
      setIsTracking(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Navigation className="w-6 h-6 text-teal-600" />
            <span>Real-Time Vehicle Navigation & Route Telemetry</span>
          </h2>
          <p className="text-xs text-slate-500">
            Live GPS route tracking, distance countdown, arrival ETA, and battery drain rate.
          </p>
        </div>

        <button
          onClick={handleToggleTracking}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
            isTracking
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 animate-pulse'
              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
          }`}
        >
          {isTracking ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Active Tracking</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Start Navigation Simulation</span>
            </>
          )}
        </button>
      </div>

      {/* Target Selector Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="text-xs font-bold text-slate-700 shrink-0">Destination Charger:</span>
          <select
            value={targetStationId}
            disabled={isTracking}
            onChange={(e) => {
              setTargetStationId(e.target.value);
              const st = stations.find((s) => s.id === Number(e.target.value));
              if (st && onSelectStation) onSelectStation(st);
            }}
            className="w-full max-w-md px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-500"
          >
            {stations.map((st) => (
              <option key={st.id || st.stationCode} value={st.id}>
                {st.name} — {st.address} ({st.maxPowerKw} kW)
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Requires active browser tab and GPS permission.
        </div>
      </div>

      {/* Live Telemetry Gauges Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Vehicle Speed</span>
            <Gauge className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {currentSpeed} <span className="text-xs font-normal text-slate-500">km/h</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Urban cruise velocity</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Remaining Distance</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {remainingKm} <span className="text-xs font-normal text-slate-500">km</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Direct route distance</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Estimated Arrival (ETA)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {etaMins} <span className="text-xs font-normal text-slate-500">mins</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Based on current road path</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Live Battery SOC</span>
            <BatteryMedium className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {Math.round(batterySoc)}%
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block mt-1">Normal consumption</span>
        </div>
      </div>

      {/* Leaflet OpenStreetMap Navigation View */}
      <div className="relative">
        <LeafletMapView
          userLocation={userLocation}
          gpsAccuracy={gpsAccuracy}
          gpsStatus={gpsStatus}
          trackingPosition={isTracking ? trackingPos : null}
          stations={stations}
          selectedStation={targetStation}
          routeCoordinates={routeCoords}
          onRecenter={onRecenterGps}
          vehicle={vehicle}
          height="520px"
        />

        {isTracking && (
          <div className="absolute bottom-5 left-5 z-10 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-teal-500/50 text-xs flex items-center gap-3 shadow-lg">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <div className="font-bold text-slate-900">Live GPS Navigation Active</div>
              <div className="text-[11px] text-slate-600 font-mono">
                Heading towards {targetStation?.name}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
