'use client';

import { useEffect, useRef } from 'react';

const CHIMBAS_CENTER = [-31.4958, -68.5352];

/**
 * Mapa con marcador arrastrable para elegir lat/lng.
 * value: { latitude, longitude } (string o number)
 * onChange: ({ latitude, longitude }) => void  // strings con 6 decimales
 */
export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  height = 240,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let active = true;
    let map;
    let marker;

    const init = async () => {
      if (typeof window === 'undefined' || !containerRef.current) return;

      const L = (await import('leaflet')).default;
      if (!active || !containerRef.current) return;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
      const start = hasCoords ? [lat, lng] : CHIMBAS_CENTER;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }

      map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView(start, hasCoords ? 16 : 14);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd',
      }).addTo(map);

      marker = L.marker(start, { draggable: true, autoPan: true }).addTo(map);

      const emit = (ll) => {
        onChangeRef.current?.({
          latitude: ll.lat.toFixed(6),
          longitude: ll.lng.toFixed(6),
        });
      };

      if (!hasCoords) emit(marker.getLatLng());

      marker.on('dragend', () => emit(marker.getLatLng()));

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        emit(e.latlng);
      });

      // Fix tiles when rendered inside a modal
      setTimeout(() => map.invalidateSize(), 80);
      setTimeout(() => map.invalidateSize(), 300);

      mapRef.current = map;
      markerRef.current = marker;
    };

    init();

    return () => {
      active = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // Solo remount al abrir (key del padre); coords externas se setean al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height,
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid var(--border-glass)',
          zIndex: 1,
        }}
      />
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Arrastrá el pin o hacé clic en el mapa para ubicar el lugar.
        {latitude && longitude ? (
          <span style={{ color: 'var(--text-secondary)' }}>
            {' '}
            ({latitude}, {longitude})
          </span>
        ) : null}
      </p>
    </div>
  );
}
