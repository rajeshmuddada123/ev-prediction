import React from 'react';
import {
  Home,
  BatteryCharging,
  TrendingUp,
  MapPin,
  CalendarCheck,
  Navigation,
  Sun,
  CloudSun,
  ShieldAlert,
  History,
  X,
  Zap,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  unreadNotifications = 0,
}) {
  const navItems = [
    { id: 'home', label: 'Home Dashboard', icon: Home },
    { id: 'battery', label: 'EV Battery', icon: BatteryCharging },
    { id: 'range', label: 'Range Prediction', icon: TrendingUp },
    { id: 'stations', label: 'Find Stations (OSM)', icon: MapPin },
    { id: 'booking', label: 'Slot Booking', icon: CalendarCheck },
    { id: 'tracking', label: 'Live GPS Tracking', icon: Navigation },
    { id: 'solar', label: 'Solar Monitoring', icon: Sun },
    { id: 'weather', label: 'Weather Telemetry', icon: CloudSun },
    { id: 'security', label: 'Security Monitor', icon: ShieldAlert },
    { id: 'history', label: 'History & Analytics', icon: History },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-500 p-0.5 shadow-md shadow-teal-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-teal-600 fill-teal-500/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-900">SMART</span>
                <span className="text-base font-black tracking-tight text-teal-600">
                  EV
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase block">
                Solar & Range AI Platform
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-600'
                  }`}
                />
                <span className="truncate">{item.label}</span>

                {isActive && (
                  <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-teal-600" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Platform Status Badge at bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              OSM & GPS Engine
            </span>
            <span className="font-mono text-emerald-600 font-bold">ONLINE</span>
          </div>
          <div className="text-[10px] text-slate-500 leading-tight">
            Direct Access Active • Light Theme UI
          </div>
        </div>
      </aside>
    </>
  );
}
