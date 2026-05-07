import React, { useEffect, useRef } from 'react';

const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>';

const ZONE_COLORS = {
  theft: '#FF2E3F',
  aggression: '#FF2E3F',
  taxi: '#FFB020',
  crowd: '#FFB020',
  dark: '#FFB020',
  protest: '#FFB020',
  flood: '#3D8BFF',
  other: '#FFB020',
};

const LeafletMap = ({
  lat,
  lng,
  zoom = 15,
  height = 380,
  className = '',
  style = {},
  riskZones = [],
  onZoneClick,
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const ringsRef = useRef([]);
  const zoneLayerRef = useRef(null);

  useEffect(() => {
    const init = () => {
      const L = window.L;
      if (!L || !containerRef.current || mapRef.current) return false;
      const c = [lat ?? 3.848, lng ?? 11.502]; // Yaoundé fallback
      const map = L.map(containerRef.current, {
        center: c,
        zoom,
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
      });
      L.tileLayer(DARK_TILES, {
        maxZoom: 19,
        attribution: ATTRIBUTION,
      }).addTo(map);
      L.control.zoom({ position: 'bottomleft' }).addTo(map);
      mapRef.current = map;
      return true;
    };

    if (!init()) {
      // Wait for Leaflet script (loaded with defer in index.html)
      const id = setInterval(() => {
        if (init()) clearInterval(id);
      }, 60);
      return () => clearInterval(id);
    }
  }, []);

  // Update view + marker when location changes
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map || lat == null || lng == null) return;

    map.setView([lat, lng], zoom, { animate: true });

    if (!markerRef.current) {
      const icon = L.divIcon({
        className: 'sos-user-pin',
        html:
          '<div style="position:relative;width:18px;height:18px;">' +
          '<div style="position:absolute;inset:-14px;border-radius:50%;border:2px solid rgba(61,139,255,.6);animation:pulse-ring 2.4s ease-out infinite;"></div>' +
          '<div style="position:absolute;inset:0;border-radius:50%;background:#3D8BFF;border:3px solid #fff;box-shadow:0 0 18px rgba(61,139,255,.8);"></div>' +
          '</div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }
  }, [lat, lng, zoom]);

  // Render community risk zones
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map) return;

    // Clear previous layer
    if (zoneLayerRef.current) {
      zoneLayerRef.current.clearLayers();
    } else {
      zoneLayerRef.current = L.layerGroup().addTo(map);
    }

    riskZones.forEach((z) => {
      if (z.lat == null || z.lng == null) return;
      const color = ZONE_COLORS[z.type] || '#FFB020';
      // Stronger when more confirmations
      const conf = Math.min(z.confirmations || 1, 10);
      const radius = 80 + conf * 20; // m
      const opacity = Math.min(0.18 + conf * 0.05, 0.55);

      const circle = L.circle([z.lat, z.lng], {
        radius,
        color,
        weight: 1.4,
        fillColor: color,
        fillOpacity: opacity,
      });
      circle.on('click', () => {
        if (typeof onZoneClick === 'function') onZoneClick(z);
      });
      circle.addTo(zoneLayerRef.current);

      // Tooltip
      const label = `${z.note ? z.note.slice(0, 40) : 'Zone signalée'} · ${
        z.confirmations || 1
      } signalement${(z.confirmations || 1) > 1 ? 's' : ''}`;
      circle.bindTooltip(label, { direction: 'top', offset: [0, -8] });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskZones]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height,
        background: '#070A12',
        ...style,
      }}
    />
  );
};

export default LeafletMap;
