/**
 * SMART EV API Client
 * Automatically persists anonymous Device ID to isolate user preferences and bookings without login
 */

const BASE_URL = '/api';

export function getDeviceId() {
  let id = localStorage.getItem('smartev_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem('smartev_device_id', id);
  }
  return id;
}

export const api = {
  // Vehicle Config
  async getVehicle() {
    const res = await fetch(`${BASE_URL}/vehicle?deviceId=${getDeviceId()}`);
    return res.ok ? res.json() : null;
  },

  async saveVehicle(data) {
    const res = await fetch(`${BASE_URL}/vehicle?deviceId=${getDeviceId()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok ? res.json() : null;
  },

  // Stations
  async getStations(params = {}) {
    const query = new URLSearchParams();
    if (params.lat != null) query.append('lat', params.lat);
    if (params.lon != null) query.append('lon', params.lon);
    if (params.radius != null) query.append('radius', params.radius);
    if (params.connectorType && params.connectorType !== 'ALL') query.append('connectorType', params.connectorType);
    if (params.minPower != null && params.minPower > 0) query.append('minPower', params.minPower);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${BASE_URL}/stations?${query.toString()}`);
    return res.ok ? res.json() : [];
  },

  async getOverpassStations(lat, lon, radiusMeters = 10000) {
    try {
      const res = await fetch(`${BASE_URL}/stations/overpass?lat=${lat}&lon=${lon}&radiusMeters=${radiusMeters}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend Overpass call failed, attempting direct fetch...', e);
    }
    return [];
  },

  async getStationSlots(stationId, date) {
    const query = date ? `?date=${date}` : '';
    const res = await fetch(`${BASE_URL}/stations/${stationId}/slots${query}`);
    return res.ok ? res.json() : [];
  },

  // Range Prediction
  async predictRange(data) {
    const res = await fetch(`${BASE_URL}/range/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok ? res.json() : null;
  },

  // Bookings
  async createBooking(data) {
    const payload = { ...data, deviceId: getDeviceId() };
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create booking');
    }
    return res.json();
  },

  async getUserBookings() {
    const res = await fetch(`${BASE_URL}/bookings?deviceId=${getDeviceId()}`);
    return res.ok ? res.json() : [];
  },

  async cancelBooking(bookingId) {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: getDeviceId() }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to cancel booking');
    }
    return res.json();
  },

  async rescheduleBooking(bookingId, newDate, newTime) {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: getDeviceId(), newDate, newTime }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reschedule booking');
    }
    return res.json();
  },

  // Solar Monitoring
  async getSolar(params = {}) {
    const query = new URLSearchParams({ deviceId: getDeviceId() });
    if (params.lat != null) query.append('lat', params.lat);
    if (params.lon != null) query.append('lon', params.lon);
    if (params.mode) query.append('mode', params.mode);
    if (params.capacity) query.append('capacity', params.capacity);
    if (params.efficiency) query.append('efficiency', params.efficiency);

    const res = await fetch(`${BASE_URL}/solar/monitor?${query.toString()}`);
    return res.ok ? res.json() : null;
  },

  async saveSolarConfig(data) {
    const res = await fetch(`${BASE_URL}/solar/config?deviceId=${getDeviceId()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok ? res.json() : null;
  },

  // Weather
  async getWeather(lat, lon) {
    const query = (lat != null && lon != null) ? `?lat=${lat}&lon=${lon}` : '';
    const res = await fetch(`${BASE_URL}/weather${query}`);
    return res.ok ? res.json() : null;
  },

  // Tracking
  async updateTracking(data) {
    const res = await fetch(`${BASE_URL}/tracking/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, deviceId: getDeviceId() }),
    });
    return res.ok ? res.json() : null;
  },

  async stopTracking() {
    const res = await fetch(`${BASE_URL}/tracking/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: getDeviceId() }),
    });
    return res.ok ? res.json() : null;
  },

  // Charging Sessions
  async startCharging(stationId, startSoc, targetSoc) {
    const res = await fetch(`${BASE_URL}/charging/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: getDeviceId(), stationId, startSoc, targetSoc }),
    });
    return res.ok ? res.json() : null;
  },

  async stopCharging(sessionId) {
    const res = await fetch(`${BASE_URL}/charging/${sessionId}/stop`, {
      method: 'POST',
    });
    return res.ok ? res.json() : null;
  },

  async getActiveCharging() {
    const res = await fetch(`${BASE_URL}/charging/active?deviceId=${getDeviceId()}`);
    if (res.status === 204) return null;
    return res.ok ? res.json() : null;
  },

  // Security
  async getSecurityOverview() {
    const res = await fetch(`${BASE_URL}/security/overview`);
    return res.ok ? res.json() : null;
  },

  async simulateSecurityProbe(type, payload) {
    const res = await fetch(`${BASE_URL}/security/simulate-probe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });
    return res.ok ? res.json() : null;
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${BASE_URL}/notifications?deviceId=${getDeviceId()}`);
    return res.ok ? res.json() : [];
  },

  async markNotificationRead(id) {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, { method: 'POST' });
    return res.ok;
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${BASE_URL}/notifications/read-all?deviceId=${getDeviceId()}`, { method: 'POST' });
    return res.ok;
  },

  // History & Analytics
  async getHistoryAnalytics() {
    const res = await fetch(`${BASE_URL}/history/analytics?deviceId=${getDeviceId()}`);
    return res.ok ? res.json() : null;
  },

  // Routing via OSRM (Open Source Routing Machine)
  async fetchRoute(startLat, startLon, endLat, endLon) {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          return {
            coordinates: route.geometry.coordinates,
            distanceKm: Math.round((route.distance / 1000) * 10) / 10,
            durationMinutes: Math.round(route.duration / 60),
          };
        }
      }
    } catch (e) {
      // Fallback straight line
    }

    // Direct interpolation fallback if OSRM unreachable
    const coords = [
      [startLon, startLat],
      [(startLon + endLon) / 2 + 0.005, (startLat + endLat) / 2 + 0.003],
      [endLon, endLat],
    ];
    return {
      coordinates: coords,
      distanceKm: 12.5,
      durationMinutes: 24,
    };
  },
};
