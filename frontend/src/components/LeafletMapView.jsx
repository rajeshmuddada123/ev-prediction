import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  Compass,
  Zap,
  Locate,
  AlertCircle,
  CheckCircle,
  Loader2,
  CalendarCheck,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export default function LeafletMapView({
  userLocation = { lat: 28.6139, lon: 77.2090 },
  gpsAccuracy = null,
  gpsStatus = 'ACTIVE', // ACTIVE, SEEKING, DENIED, UNAVAILABLE
  stations = [],
  selectedStation = null,
  routeCoordinates = null,
  onSelectStation,
  onBookSlot,
  onRecenter,
  height = '500px',
  interactive = true,
  trackingPosition = null,
  loading = false,
  vehicle = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const trackingMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map centered on user location
    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lon],
      zoom: 13,
      zoomControl: false, // We add custom positioned zoom control
      attributionControl: true,
    });

    // Add standard OpenStreetMap raster tiles - NO API KEY REQUIRED
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Zoom control in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Create layer group for station markers
    markersLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update user GPS location marker & accuracy circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const lat = userLocation.lat;
    const lon = userLocation.lon;

    // Create/update user location pulse marker
    const userIcon = L.divIcon({
      className: 'user-gps-marker',
      html: `
        <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(59, 130, 246, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 16px; height: 16px; border-radius: 50%; background: #2563EB; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lon]);
    } else {
      userMarkerRef.current = L.marker([lat, lon], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
      userMarkerRef.current.bindTooltip('<b>Your Current Location</b>', { direction: 'top', offset: [0, -10] });
    }

    // Create/update accuracy circle
    if (gpsAccuracy && gpsAccuracy > 0) {
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([lat, lon]);
        accuracyCircleRef.current.setRadius(gpsAccuracy);
      } else {
        accuracyCircleRef.current = L.circle([lat, lon], {
          radius: gpsAccuracy,
          color: '#3B82F6',
          fillColor: '#93C5FD',
          fillOpacity: 0.15,
          weight: 1,
        }).addTo(map);
      }
    }
  }, [userLocation.lat, userLocation.lon, gpsAccuracy]);

  // Update live vehicle tracking navigation position
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (trackingPosition) {
      const trackingIcon = L.divIcon({
        className: 'vehicle-nav-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(13, 148, 136, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #0D9488; border: 2px solid #FFFFFF; box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">
              EV
            </div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      if (trackingMarkerRef.current) {
        trackingMarkerRef.current.setLatLng([trackingPosition.lat, trackingPosition.lon]);
      } else {
        trackingMarkerRef.current = L.marker([trackingPosition.lat, trackingPosition.lon], {
          icon: trackingIcon,
          zIndexOffset: 1200,
        }).addTo(map);
      }
      map.panTo([trackingPosition.lat, trackingPosition.lon], { animate: true, duration: 1 });
    } else if (trackingMarkerRef.current) {
      trackingMarkerRef.current.remove();
      trackingMarkerRef.current = null;
    }
  }, [trackingPosition]);

  // Update Charging Station Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    stations.forEach((st) => {
      const isSelected = selectedStation && (selectedStation.id === st.id || selectedStation.stationCode === st.stationCode);
      const isAvailable = st.availableChargers > 0;
      const isOsm = st.stationCode && st.stationCode.startsWith('OSM-');

      // Custom HTML Pin
      const pinHtml = `
        <div style="
          cursor: pointer;
          transition: transform 0.2s ease;
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 3px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: ${isSelected ? '2px solid #0D9488' : '1.5px solid #FFFFFF'};
          background: ${
            isSelected
              ? '#0D9488'
              : isAvailable
              ? '#FFFFFF'
              : '#F1F5F9'
          };
          color: ${isSelected ? '#FFFFFF' : isAvailable ? '#0F766E' : '#64748B'};
          ${isSelected ? 'transform: scale(1.15); box-shadow: 0 0 15px rgba(13, 148, 136, 0.5);' : ''}
        ">
          <svg style="width: 12px; height: 12px;" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>${st.maxPowerKw ? st.maxPowerKw + 'kW' : 'EV'}</span>
          ${isOsm ? '<span style="font-size: 8px; opacity: 0.8;">OSM</span>' : `<span style="font-size: 9px; opacity: 0.85;">(${st.availableChargers}/${st.totalChargers})</span>`}
        </div>
      `;

      const stationIcon = L.divIcon({
        className: 'station-marker-pin',
        html: pinHtml,
        iconSize: [65, 24],
        iconAnchor: [32, 12],
      });

      const marker = L.marker([st.latitude, st.longitude], { icon: stationIcon });

      // Build Rich Leaflet Popup
      const connectorLabels = st.connectors && st.connectors.length > 0
        ? st.connectors.map(c => `${c.connectorType} (${c.powerKw}kW ${c.currentType})`).join(', ')
        : 'CCS2, Type 2 AC';

      // Estimate battery drain to this station
      let batteryEstHtml = '';
      if (vehicle && st.distanceKm != null) {
        const requiredEnergyKwh = Math.round((st.distanceKm / (vehicle.efficiencyKmPerKwh || 7.0)) * 10) / 10;
        const currentEnergyKwh = Math.round(((vehicle.batteryCapacityKwh * vehicle.currentSocPercentage) / 100) * 10) / 10;
        const isReachable = currentEnergyKwh >= requiredEnergyKwh * 1.1;

        batteryEstHtml = `
          <div style="margin-top: 8px; padding: 6px 8px; border-radius: 8px; background: ${isReachable ? '#ECFDF5' : '#FFF1F2'}; border: 1px solid ${isReachable ? '#A7F3D0' : '#FECDD3'}; font-size: 11px;">
            <div style="font-weight: 600; color: ${isReachable ? '#047857' : '#BE123C'};">
              ${isReachable ? '✓ Battery Sufficient' : '⚠️ Low Battery Warning'}
            </div>
            <div style="color: #475569; font-size: 10px; margin-top: 2px;">
              Requires ~${requiredEnergyKwh} kWh • You have ${currentEnergyKwh} kWh available
            </div>
          </div>
        `;
      }

      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '220px';
      popupContent.innerHTML = `
        <div style="padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #0D9488; background: #F0FDFA; padding: 2px 6px; border-radius: 6px;">
              ${st.operatorName || 'EV Station'}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: #0F172A; font-family: monospace;">
              ${st.distanceKm != null ? st.distanceKm + ' km' : ''}
            </span>
          </div>

          <h4 style="font-size: 13px; font-weight: 700; color: #0F172A; margin: 4px 0 2px 0;">${st.name}</h4>
          <p style="font-size: 11px; color: #64748B; margin: 0 0 6px 0;">${st.address}</p>

          <div style="font-size: 11px; color: #334155; line-height: 1.4; border-top: 1px solid #E2E8F0; padding-top: 6px;">
            <div>⚡ <b>Speed:</b> ${st.maxPowerKw} kW DC Fast Charger</div>
            <div>🔌 <b>Connectors:</b> ${connectorLabels}</div>
            <div>⏱️ <b>Hours:</b> ${st.operatingHours || '24/7'}</div>
            <div style="color: ${st.availableChargers > 0 ? '#059669' : '#DC2626'}; font-weight: 600; margin-top: 2px;">
              ● ${st.isLiveStatus ? `${st.availableChargers} of ${st.totalChargers} Available (Live)` : 'OpenStreetMap Listed Public Station'}
            </div>
          </div>

          ${batteryEstHtml}

          <div style="display: flex; gap: 6px; margin-top: 10px;">
            <button id="btn-directions-${st.id}" style="flex: 1; padding: 6px; border-radius: 8px; background: #F1F5F9; border: 1px solid #CBD5E1; color: #334155; font-size: 11px; font-weight: 600; cursor: pointer;">
              Directions
            </button>
            <button id="btn-book-${st.id}" style="flex: 1; padding: 6px; border-radius: 8px; background: #0D9488; border: none; color: white; font-size: 11px; font-weight: 700; cursor: pointer;">
              Book Slot
            </button>
          </div>
        </div>
      `;

      // Handle buttons inside Leaflet popup safely
      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btnDir = document.getElementById(`btn-directions-${st.id}`);
        if (btnDir) {
          btnDir.onclick = () => {
            if (onSelectStation) onSelectStation(st);
          };
        }
        const btnBook = document.getElementById(`btn-book-${st.id}`);
        if (btnBook) {
          btnBook.onclick = () => {
            if (onBookSlot) onBookSlot(st);
          };
        }
      });

      marker.on('click', () => {
        if (onSelectStation) onSelectStation(st);
      });

      markersLayer.addLayer(marker);
    });
  }, [stations, selectedStation, vehicle]);

  // Update Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (routeCoordinates && routeCoordinates.length > 0) {
      // routeCoordinates is [[lon, lat], [lon, lat]...] from GeoJSON, Leaflet needs [lat, lon]
      const leafletCoords = routeCoordinates.map((c) => [c[1], c[0]]);

      routePolylineRef.current = L.polyline(leafletCoords, {
        color: '#0D9488',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
      }).addTo(map);

      map.fitBounds(routePolylineRef.current.getBounds(), { padding: [50, 50], maxZoom: 15 });
    }
  }, [routeCoordinates]);

  // Center on user position function
  const handleRecenterClick = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setView([userLocation.lat, userLocation.lon], 14, { animate: true });
    if (onRecenter) onRecenter();
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white" style={{ height }}>
      {/* Leaflet map div */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left: OpenStreetMap Attribution & Status Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-xs shadow-sm font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>OpenStreetMap • Leaflet</span>
        </div>

        {/* GPS Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs shadow-sm font-semibold ${
            gpsStatus === 'ACTIVE'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : gpsStatus === 'SEEKING'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {gpsStatus === 'ACTIVE' ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>GPS Active</span>
            </>
          ) : gpsStatus === 'SEEKING' ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span>Acquiring GPS...</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>{gpsStatus === 'DENIED' ? 'Permission Denied' : 'Location Unavailable'}</span>
            </>
          )}
        </div>
      </div>

      {/* Recenter to My Location Float Button */}
      <button
        onClick={handleRecenterClick}
        className="absolute bottom-6 right-3 z-10 p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-teal-600 border border-slate-200 shadow-md transition-all hover:scale-105 flex items-center gap-1.5 text-xs font-bold"
        title="Recenter to My Location"
      >
        <Locate className="w-4 h-4 text-teal-600" />
        <span className="hidden sm:inline">My Location</span>
      </button>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
          <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-lg flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
            <span>Finding real nearby EV stations...</span>
          </div>
        </div>
      )}
    </div>
  );
}
