import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import NotificationDrawer from './components/NotificationDrawer';
import ActiveSessionBar from './components/ActiveSessionBar';

import HomeView from './views/HomeView';
import BatteryView from './views/BatteryView';
import RangePredictionView from './views/RangePredictionView';
import StationsView from './views/StationsView';
import BookingView from './views/BookingView';
import TrackingView from './views/TrackingView';
import SolarView from './views/SolarView';
import WeatherView from './views/WeatherView';
import SecurityView from './views/SecurityView';
import HistoryView from './views/HistoryView';

import { api } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // User live GPS location state
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lon: 77.2090 });
  const [locationName, setLocationName] = useState('New Delhi NCR');
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('SEEKING'); // ACTIVE, SEEKING, DENIED, UNAVAILABLE

  // Core entities
  const [vehicle, setVehicle] = useState({
    brand: 'Tata Motors',
    model: 'Nexon EV Max',
    batteryCapacityKwh: 40.5,
    currentSocPercentage: 75.0,
    efficiencyKmPerKwh: 7.2,
    connectorType: 'CCS2',
    registrationNumber: 'DL-01-EV-2026',
  });

  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState(null);
  const [activeChargingSession, setActiveChargingSession] = useState(null);
  const [activeTracking, setActiveTracking] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);

  const [solarData, setSolarData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const lastFetchedLocationRef = useRef({ lat: 0, lon: 0 });

  // 1. REAL-TIME USER GPS TRACKING using navigator.geolocation.watchPosition()
  useEffect(() => {
    let watchId = null;

    if ('geolocation' in navigator) {
      setGpsStatus('SEEKING');

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;

          setUserLocation({ lat, lon });
          setGpsAccuracy(accuracy);
          setGpsStatus('ACTIVE');
          setLocationName(`GPS Live (±${Math.round(accuracy)}m)`);
        },
        (err) => {
          console.warn('Geolocation watch error:', err.message);
          if (err.code === 1) {
            setGpsStatus('DENIED');
            setLocationName('GPS Permission Denied (Manual Mode)');
          } else {
            setGpsStatus('UNAVAILABLE');
            setLocationName('GPS Unavailable (Using Regional Mode)');
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 15000,
          timeout: 20000,
        }
      );
    } else {
      setGpsStatus('UNAVAILABLE');
    }

    return () => {
      if (watchId !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Recenter GPS Trigger
  const handleRecenterGps = () => {
    if ('geolocation' in navigator) {
      setGpsStatus('SEEKING');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;

          setUserLocation({ lat, lon });
          setGpsAccuracy(accuracy);
          setGpsStatus('ACTIVE');
          setLocationName(`GPS Live (±${Math.round(accuracy)}m)`);
        },
        (err) => {
          if (err.code === 1) setGpsStatus('DENIED');
          else setGpsStatus('UNAVAILABLE');
        },
        { enableHighAccuracy: true, timeout: 12000 }
      );
    }
  };

  // 2. Fetch Nearby Stations & Overpass Data when user moves significantly (>1km)
  const fetchNearbyData = async (lat, lon) => {
    setLoadingStations(true);
    try {
      // Fetch stations (combines local database + OpenStreetMap Overpass live chargers)
      const stList = await api.getStations({ lat, lon, radius: 30 });
      setStations(stList);
      if (stList.length > 0 && !selectedStation) {
        setSelectedStation(stList[0]);
      }

      // Fetch Solar & Weather
      const sol = await api.getSolar({ lat, lon });
      if (sol) setSolarData(sol);

      const w = await api.getWeather(lat, lon);
      if (w) setWeatherData(w);

      lastFetchedLocationRef.current = { lat, lon };
    } catch (e) {
      console.error('Error fetching station/solar/weather telemetry:', e);
    } finally {
      setLoadingStations(false);
    }
  };

  useEffect(() => {
    const prev = lastFetchedLocationRef.current;
    const distanceMoved = Math.sqrt(
      Math.pow((userLocation.lat - prev.lat) * 111, 2) +
      Math.pow((userLocation.lon - prev.lon) * 111, 2)
    );

    // Initial fetch or if user moved > 1 km
    if (prev.lat === 0 || distanceMoved > 1.0) {
      fetchNearbyData(userLocation.lat, userLocation.lon);
    }
  }, [userLocation.lat, userLocation.lon]);

  // Initial user settings & notifications
  useEffect(() => {
    const initData = async () => {
      const v = await api.getVehicle();
      if (v) setVehicle(v);

      const notifs = await api.getNotifications();
      setNotifications(notifs);

      const chg = await api.getActiveCharging();
      setActiveChargingSession(chg);
    };
    initData();
  }, []);

  // Periodic active charging polling
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const chg = await api.getActiveCharging();
        setActiveChargingSession(chg);
      } catch (e) {}
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle Manual City Switch
  const handleChangeLocation = (lat, lon, name) => {
    setUserLocation({ lat, lon });
    setLocationName(name);
    setGpsStatus('ACTIVE');
  };

  // Handle Vehicle Save
  const handleSaveVehicle = async (data) => {
    const saved = await api.saveVehicle(data);
    if (saved) setVehicle(saved);
  };

  const handleUpdateVehicleSoc = (val) => {
    setVehicle((prev) => ({ ...prev, currentSocPercentage: val }));
  };

  // Cross-Navigation Actions
  const handleSelectStation = async (st) => {
    setSelectedStation(st);
    if (st) {
      const route = await api.fetchRoute(userLocation.lat, userLocation.lon, st.latitude, st.longitude);
      setRouteCoordinates(route.coordinates);
    }
  };

  const handleBookStation = (st) => {
    setSelectedStation(st);
    setActiveTab('booking');
  };

  const handleTrackToStation = (st) => {
    setSelectedStation(st);
    setActiveTab('tracking');
  };

  const handleStopCharging = async (sessionId) => {
    try {
      await api.stopCharging(sessionId);
      setActiveChargingSession(null);
      const notifs = await api.getNotifications();
      setNotifications(notifs);
    } catch (e) {
      console.error(e);
    }
  };

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        unreadNotifications={unreadNotifCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          userLocation={userLocation}
          locationName={locationName}
          onChangeLocation={handleChangeLocation}
          onRecenterGps={handleRecenterGps}
          gpsStatus={gpsStatus}
          vehicle={vehicle}
          onOpenNotifications={() => setNotificationDrawerOpen(true)}
          unreadCount={unreadNotifCount}
          activeChargingSession={activeChargingSession}
          activeTracking={activeTracking}
          solarSummary={solarData}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28">
          {activeTab === 'home' && (
            <HomeView
              vehicle={vehicle}
              onUpdateVehicleSoc={handleUpdateVehicleSoc}
              userLocation={userLocation}
              gpsAccuracy={gpsAccuracy}
              gpsStatus={gpsStatus}
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={handleSelectStation}
              onNavigateTab={setActiveTab}
              onRecenterGps={handleRecenterGps}
              solarData={solarData}
              weatherData={weatherData}
              onBookStation={handleBookStation}
              loadingStations={loadingStations}
            />
          )}

          {activeTab === 'battery' && (
            <BatteryView
              vehicle={vehicle}
              onSaveVehicle={handleSaveVehicle}
            />
          )}

          {activeTab === 'range' && (
            <RangePredictionView
              vehicle={vehicle}
              weatherData={weatherData}
              onSelectStation={handleSelectStation}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'stations' && (
            <StationsView
              stations={stations}
              userLocation={userLocation}
              gpsAccuracy={gpsAccuracy}
              gpsStatus={gpsStatus}
              selectedStation={selectedStation}
              onSelectStation={handleSelectStation}
              onBookStation={handleBookStation}
              onTrackToStation={handleTrackToStation}
              onRecenterGps={handleRecenterGps}
              routeCoordinates={routeCoordinates}
              loadingStations={loadingStations}
              vehicle={vehicle}
            />
          )}

          {activeTab === 'booking' && (
            <BookingView
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={handleSelectStation}
              vehicle={vehicle}
            />
          )}

          {activeTab === 'tracking' && (
            <TrackingView
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={handleSelectStation}
              userLocation={userLocation}
              gpsAccuracy={gpsAccuracy}
              gpsStatus={gpsStatus}
              onRecenterGps={handleRecenterGps}
              vehicle={vehicle}
            />
          )}

          {activeTab === 'solar' && (
            <SolarView
              userLocation={userLocation}
              vehicle={vehicle}
              solarData={solarData}
              onRefreshSolar={setSolarData}
            />
          )}

          {activeTab === 'weather' && (
            <WeatherView
              userLocation={userLocation}
              weatherData={weatherData}
              onRefreshWeather={setWeatherData}
            />
          )}

          {activeTab === 'security' && (
            <SecurityView />
          )}

          {activeTab === 'history' && (
            <HistoryView />
          )}
        </main>

        {/* Floating Active Charging HUD bar */}
        <ActiveSessionBar
          session={activeChargingSession}
          onStopCharging={handleStopCharging}
        />

        {/* Slide-out Notification Drawer */}
        <NotificationDrawer
          isOpen={notificationDrawerOpen}
          onClose={() => setNotificationDrawerOpen(false)}
          notifications={notifications}
          onMarkRead={async (id) => {
            await api.markNotificationRead(id);
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
          }}
          onMarkAllRead={async () => {
            await api.markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          }}
        />
      </div>
    </div>
  );
}
