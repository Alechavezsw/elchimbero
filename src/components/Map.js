'use client';

import { useEffect, useRef } from 'react';

export default function Map({ points = [], center = [-31.4958, -68.5352], zoom = 14 }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    let active = true;

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      // Importar Leaflet dinámicamente para que no corra en el servidor
      const L = (await import('leaflet')).default;

      if (!active) return;

      // Resolver problemas de rutas de iconos por defecto en Next.js
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Si el mapa ya estaba inicializado, no recrearlo, solo re-centrar
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(center, zoom);
        updateMarkers(L);
        return;
      }

      // Crear instancia de mapa centrado en Chimbas
      const map = L.map(mapContainerRef.current).setView(center, zoom);

      // Usar mapa de fondo oscuro (Dark Matter de CartoDB - gratuito y muy estético)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      mapInstanceRef.current = map;
      updateMarkers(L);
    };

    const updateMarkers = (L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Eliminar marcadores anteriores para no duplicar
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Cargar nuevos pines
      points.forEach((point) => {
        if (!point.latitude || !point.longitude) return;

        // Definir color de pin por tipo
        let pinColorClass = 'violet-pin';
        if (point.type === 'pharmacy') pinColorClass = 'emerald-pin';
        if (point.type === 'kiosk') pinColorClass = 'amber-pin';

        // Crear elemento HTML personalizado para el marcador
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="marker-pin ${pinColorClass}"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const marker = L.marker([point.latitude, point.longitude], { icon: customIcon }).addTo(map);

        // Diseñar ventana emergente al hacer click en el pin
        const popupContent = `
          <div style="font-family: 'Outfit', sans-serif; color: white; padding: 4px; line-height: 1.4;">
            <h4 style="margin: 0 0 4px 0; font-weight: 700; font-size: 0.95rem; color: #f8fafc;">${point.name}</h4>
            <p style="margin: 0 0 6px 0; font-size: 0.8rem; color: #94a3b8;">📍 ${point.address}</p>
            ${point.phone ? `<p style="margin: 0 0 6px 0; font-size: 0.8rem; color: #14b8a6; font-weight: 500;">📞 ${point.phone}</p>` : ''}
            ${point.url ? `<a href="${point.url}" style="display: inline-block; margin-top: 4px; font-size: 0.8rem; color: #8b5cf6; font-weight: 600; text-decoration: underline;">Ver ficha comercial →</a>` : ''}
          </div>
        `;
        
        marker.bindPopup(popupContent);
      });
    };

    initMap();

    return () => {
      active = false;
    };
  }, [points, center, zoom]);

  // Limpieza al desmontar el componente
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ width: '100%', height: '100%', minHeight: '350px', borderRadius: '12px' }} 
    />
  );
}
