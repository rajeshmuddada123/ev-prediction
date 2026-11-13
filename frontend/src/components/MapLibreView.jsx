import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Navigation, Zap, Clock, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function MapLibreView({
  userLocation = { lat: 28.6139, lon: 77.2090 },
  stations = [],
  selectedStation = null,
  routeCoordinates = null,
  onSelectStation,
  onBookSlot,
  height = '500px',
  interactive = true,
  trackingPosition = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const trackingMarkerRef = useRef(null);

  // Initialize MapLibre GL instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Dark OpenStreetMap Carto Style definition
    const mapStyle = {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO',
        },
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [userLocation.lon, userLocation.lat],
      zoom: 12,
      attributionControl: false,
      interactive: interactive,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      // Add GeoJSON Route source and layer
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
        },
      });

      // Neon Cyan route glow casing
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#06B6D4',
          'line-width': 8,
          'line-opacity': 0.4,
          'line-blur': 3,
        },
      });

      // Sharp Emerald center route line
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#10B981',
          'line-width': 4,
          'line-opacity': 0.95,
        },
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update user marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Custom pulse GPS marker element
    const el = document.createElement('div');
    el.className = 'relative flex items-center justify-center';
    el.innerHTML = `
      <div class="absolute w-8 h-8 rounded-full bg-cyan-500/30 animate-ping"></div>
      <div class="relative w-5 h-5 rounded-full bg-cyan-500 border-2 border-white shadow-lg flex items-center justify-center">
        <div class="w-2 h-2 rounded-full bg-slate-950"></div>
      </div>
    `;

    userMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([userLocation.lon, userLocation.lat])
      .addTo(map);

    // Only pan if initial or explicitly needed
  }, [userLocation.lat, userLocation.lon]);

  // Update live vehicle tracking position marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !trackingPosition) {
      if (trackingMarkerRef.current) trackingMarkerRef.current.remove();
      return;
    }

    if (trackingMarkerRef.current) {
      trackingMarkerRef.current.setLngLat([trackingPosition.lon, trackingPosition.lat]);
    } else {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center';
      el.innerHTML = `
        <div class="absolute w-9 h-9 rounded-full bg-emerald-500/40 animate-ping"></div>
        <div class="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-bold">
          EV
        </div>
      `;
      trackingMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([trackingPosition.lon, trackingPosition.lat])
        .addTo(map);
    }

    map.easeTo({
      center: [trackingPosition.lon, trackingPosition.lat],
      zoom: 14,
      duration: 1000,
    });
  }, [trackingPosition]);

  // Update charging station markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    stations.forEach((st) => {
      const isSelected = selectedStation && selectedStation.id === st.id;
      const isAvailable = st.availableChargers > 0;

      const el = document.createElement('div');
      el.className = 'cursor-pointer transition-transform duration-200 hover:scale-110';
      el.innerHTML = `
        <div class="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold shadow-2xl border ${
          isSelected
            ? 'bg-cyan-500 text-slate-950 border-white ring-4 ring-cyan-500/30'
            : isAvailable
            ? 'bg-slate-900/95 text-emerald-400 border-emerald-500/50 hover:border-emerald-400'
            : 'bg-slate-900/95 text-rose-400 border-rose-500/50'
        }">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>${st.maxPowerKw}kW</span>
          <span class="text-[9px] opacity-80">(${st.availableChargers}/${st.totalChargers})</span>
        </div>
      `;

      el.addEventListener('click', () => {
        if (onSelectStation) onSelectStation(st);
      });

      const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="min-width: 200px;">
          <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; margin-bottom: 4px;">${st.name}</div>
          <div style="font-size: 11px; color: #9CA3AF; margin-bottom: 6px;">${st.address}</div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
            <span style="color: #06B6D4;">${st.operatorName}</span>
            <span style="color: #10B981; font-weight: 600;">${st.availableChargers} Available</span>
          </div>
          <div style="font-size: 11px; color: #E5E7EB; margin-bottom: 8px;">
            ⚡ ${st.maxPowerKw} kW DC Fast • ₹${st.costPerKwh}/kWh
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([st.longitude, st.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [stations, selectedStation]);

  // Update route polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('route');
    if (!source) return;

    if (routeCoordinates && routeCoordinates.length > 0) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates,
        },
      });

      // Fit bounds to show both user and target station nicely
      const bounds = routeCoordinates.reduce(
        (b, coord) => b.extend(coord),
        new maplibregl.LngLatBounds(routeCoordinates[0], routeCoordinates[0])
      );
      map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 1200 });
    } else {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [],
        },
      });
    }
  }, [routeCoordinates]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl" style={{ height }}>
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map watermark badge */}
      <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-300 font-medium">OpenStreetMap • MapLibre GL</span>
      </div>
    </div>
  );
}
