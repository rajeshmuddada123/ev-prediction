import React, { useState } from 'react';
import {
  Menu,
  MapPin,
  BatteryMedium,
  Bell,
  Sun,
  ChevronDown,
  Navigation,
  Locate,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function Header({
  onOpenMobileMenu,
  userLocation,
  locationName,
  onChangeLocation,
  onRecenterGps,
  gpsStatus = 'ACTIVE',
  vehicle,
  onOpenNotifications,
  unreadCount = 0,
  activeChargingSession,
  activeTracking,
  solarSummary,
}) {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const presetCities = [
    { name: 'New Delhi NCR', lat: 28.6139, lon: 77.2090 },
    { name: 'Bengaluru IT Hub', lat: 12.9716, lon: 77.5946 },
    { name: 'Mumbai BKC', lat: 19.0760, lon: 72.8777 },
    { name: 'Hyderabad HITEC', lat: 17.3850, lon: 78.4867 },
    { name: 'Chennai Central', lat: 13.0827, lon: 80.2707 },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-sm">
      {/* Left: Mobile hamburger & location picker */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Location selector pill with dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500/50 text-xs font-semibold text-slate-800 transition-colors shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span className="max-w-[140px] sm:max-w-[200px] truncate">{locationName || 'Select Location'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showLocationDropdown && (
            <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Select City / Coordinates</span>
              </div>

              {/* Action to trigger live browser GPS */}
              <button
                onClick={() => {
                  if (onRecenterGps) onRecenterGps();
                  setShowLocationDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-teal-700 bg-teal-50/70 hover:bg-teal-100 flex items-center gap-2 border-b border-slate-100 transition-colors"
              >
                <Locate className="w-3.5 h-3.5 text-teal-600" />
                <span>Use Actual Browser GPS</span>
              </button>

              {presetCities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    onChangeLocation(city.lat, city.lon, city.name);
                    setShowLocationDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">{city.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {city.lat.toFixed(1)}, {city.lon.toFixed(1)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GPS Live Status Tag */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          {gpsStatus === 'ACTIVE' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live GPS Active</span>
            </>
          ) : gpsStatus === 'SEEKING' ? (
            <>
              <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
              <span>Acquiring GPS...</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 text-rose-500" />
              <span>GPS Manual Mode</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Quick indicators */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Charging session pill */}
        {activeChargingSession && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-300 text-teal-700 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span>Charging: {activeChargingSession.currentSoc}%</span>
          </div>
        )}

        {/* Active Tracking session pill */}
        {activeTracking && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Navigation className="w-3 h-3 text-blue-600 animate-spin" />
            <span>Nav Active</span>
          </div>
        )}

        {/* Battery SOC Pill */}
        {vehicle && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-sm">
            <BatteryMedium className="w-4 h-4 text-emerald-600" />
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-slate-900 font-mono">{vehicle.currentSocPercentage}%</span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                ({Math.round(((vehicle.batteryCapacityKwh * vehicle.currentSocPercentage) / 100) * vehicle.efficiencyKmPerKwh)}km)
              </span>
            </div>
          </div>
        )}

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors shadow-sm"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
