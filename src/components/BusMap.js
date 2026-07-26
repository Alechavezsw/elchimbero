'use client';

import { useEffect, useRef } from 'react';

// Diccionario de coordenadas para puntos de parada reales y cruces viales en Chimbas/San Juan
const stopCoordinates = {
  "Plaza Centenario de Chimbas (Calle Mendoza)": [
    -31.4965,
    -68.5361
  ],
  "Plaza Centenario de Chimbas": [
    -31.4965,
    -68.5361
  ],
  "Plaza Centenario de Chimbas (Villa Paula)": [
    -31.4965,
    -68.5361
  ],
  "Municipalidad de Chimbas (Calle Mendoza)": [
    -31.496,
    -68.5361
  ],
  "Municipalidad de Chimbas": [
    -31.496,
    -68.5361
  ],
  "Plaza Centenario de Chimbas (Municipalidad)": [
    -31.4965,
    -68.5361
  ],
  "Plaza de Villa Observatorio (Calle Pellegrini)": [
    -31.5058,
    -68.5591
  ],
  "Plaza de Villa Observatorio": [
    -31.5058,
    -68.5591
  ],
  "Chimbas Oeste (Villa Observatorio)": [
    -31.5058,
    -68.5591
  ],
  "Plaza de Villa Obrera (Calle Dorrego)": [
    -31.4845,
    -68.5298
  ],
  "Plaza de Villa Obrera": [
    -31.4845,
    -68.5298
  ],
  "Estación de Transbordo Córdoba": [
    -31.5365,
    -68.525
  ],
  "Plaza de Villa Krause (Rawson)": [
    -31.577,
    -68.537
  ],
  "Escuela de Policía (Chimbas)": [
    -31.503,
    -68.568
  ],
  "Plaza de Santa Lucía": [
    -31.532,
    -68.495
  ],
  "Hospital Dr. Marcial Quiroga": [
    -31.528,
    -68.585
  ],
  "Villa Villicum (Albardón)": [
    -31.43,
    -68.52
  ],
  "Teatro del Bicentenario (Las Heras)": [
    -31.532,
    -68.527
  ],
  "Teatro del Bicentenario": [
    -31.532,
    -68.527
  ],
  "Centro Cívico de San Juan (Avenida España)": [
    -31.5309,
    -68.5286
  ],
  "Centro Cívico de San Juan": [
    -31.5309,
    -68.5286
  ],
  "Centro Cívico de San Juan (Terminus)": [
    -31.5309,
    -68.5286
  ],
  "Hospital Dr. Guillermo Rawson (Avenida Rawson)": [
    -31.535,
    -68.514
  ],
  "Hospital Dr. Guillermo Rawson": [
    -31.535,
    -68.514
  ],
  "Hospital Guillermo Rawson (Capital)": [
    -31.535,
    -68.514
  ],
  "Terminal de Ómnibus de San Juan": [
    -31.533,
    -68.519
  ],
  "Parque de Mayo (Avenida Libertador)": [
    -31.528,
    -68.535
  ],
  "Avenida Libertador (Parque de Mayo)": [
    -31.528,
    -68.535
  ],
  "Plaza 25 de Mayo (Capital)": [
    -31.5375,
    -68.525
  ],
  "CUIM - UNSJ (Rivadavia)": [
    -31.5395,
    -68.578
  ],
  "Lote Hogar 59": [
    -31.511,
    -68.542
  ],
  "Barrio Pedregal (Calle Rodríguez)": [
    -31.472,
    -68.532
  ],
  "Barrio Pedregal": [
    -31.472,
    -68.532
  ],
  "Barrio Las Calandrias (Calle Oro)": [
    -31.465,
    -68.552
  ],
  "Costanera Alta (Frente a Río San Juan)": [
    -31.468,
    -68.555
  ],
  "Complejo Ferial Costanera": [
    -31.4785,
    -68.5451
  ],
  "Barrio Natania VIII": [
    -31.505,
    -68.522
  ],
  "Villa Mariano Moreno (Calle Pellegrini)": [
    -31.465,
    -68.52
  ],
  "El Mogote (Calle Rodríguez)": [
    -31.468,
    -68.508
  ],
  "Portal de El Mogote": [
    -31.47,
    -68.51
  ],
  "Delegación Municipal Este": [
    -31.488,
    -68.525
  ],
  "San Juan Shopping (Avenida Benavídez)": [
    -31.5012,
    -68.5245
  ],
  "Calle Mendoza y Rivero": [
    -31.465,
    -68.5338
  ],
  "Calle Mendoza y Oro": [
    -31.47,
    -68.5338
  ],
  "Calle Mendoza y Saavedra": [
    -31.475,
    -68.5338
  ],
  "Calle Mendoza y Rodríguez": [
    -31.478,
    -68.5338
  ],
  "Calle Mendoza y Sabatini": [
    -31.48,
    -68.5338
  ],
  "Calle Mendoza y San Martín": [
    -31.485,
    -68.5338
  ],
  "Calle Mendoza y Neuquén": [
    -31.488,
    -68.5338
  ],
  "Calle Mendoza y Jorge Newbery": [
    -31.49,
    -68.5338
  ],
  "Calle Mendoza y Pellegrini": [
    -31.492,
    -68.5338
  ],
  "Calle Mendoza y Cabildo": [
    -31.494,
    -68.5338
  ],
  "Calle Mendoza y Chubut": [
    -31.4955,
    -68.5338
  ],
  "Calle Mendoza y Centenario": [
    -31.4965,
    -68.5338
  ],
  "Calle Mendoza y 9 de Julio": [
    -31.4985,
    -68.5338
  ],
  "Calle Mendoza y Benavídez": [
    -31.501,
    -68.5338
  ],
  "Calle Rodríguez y Mendoza": [
    -31.478,
    -68.5338
  ],
  "Calle Pellegrini y Mendoza": [
    -31.492,
    -68.5338
  ],
  "Calle Neuquén y Mendoza": [
    -31.488,
    -68.5338
  ],
  "Calle Centenario y Mendoza": [
    -31.4965,
    -68.5338
  ],
  "Calle Tucumán y Rivero": [
    -31.465,
    -68.518
  ],
  "Calle Tucumán y Oro": [
    -31.47,
    -68.518
  ],
  "Calle Tucumán y Saavedra": [
    -31.475,
    -68.518
  ],
  "Calle Tucumán y Rodríguez": [
    -31.478,
    -68.518
  ],
  "Calle Tucumán y San Martín": [
    -31.485,
    -68.518
  ],
  "Calle Tucumán y Neuquén": [
    -31.488,
    -68.518
  ],
  "Calle Tucumán y Jorge Newbery": [
    -31.49,
    -68.518
  ],
  "Calle Tucumán y Centenario": [
    -31.495,
    -68.518
  ],
  "Calle Tucumán y Benavídez": [
    -31.501,
    -68.518
  ],
  "Calle Tucumán y Chaco": [
    -31.51,
    -68.518
  ],
  "Calle Tucumán y Corrientes": [
    -31.518,
    -68.518
  ],
  "Calle Tucumán y 25 de Mayo": [
    -31.527,
    -68.518
  ],
  "Calle Tucumán y Libertador": [
    -31.5295,
    -68.518
  ],
  "Calle Tucumán y Santa Fe": [
    -31.534,
    -68.518
  ],
  "Calle Tucumán y Córdoba": [
    -31.5365,
    -68.518
  ],
  "Calle Salta y Oro": [
    -31.47,
    -68.55
  ],
  "Calle Salta y Rodríguez": [
    -31.478,
    -68.55
  ],
  "Calle Salta y San Martín": [
    -31.485,
    -68.55
  ],
  "Calle Salta y Neuquén": [
    -31.488,
    -68.55
  ],
  "Calle Salta y Centenario": [
    -31.4965,
    -68.55
  ],
  "Calle Salta y Centenario (Comisaría 30ª)": [
    -31.503,
    -68.555
  ],
  "Calle Salta y Benavídez": [
    -31.5015,
    -68.55
  ],
  "Calle Salta y Sargento Cabral": [
    -31.515,
    -68.55
  ],
  "Calle Salta y 25 de Mayo": [
    -31.527,
    -68.55
  ],
  "Calle Salta y Libertador": [
    -31.5295,
    -68.55
  ],
  "Calle Salta y Córdoba": [
    -31.5365,
    -68.55
  ],
  "Calle Salta y San Isidro": [
    -31.51,
    -68.55
  ],
  "Calle Salta y Pellegrini": [
    -31.504,
    -68.555
  ],
  "Calle Pellegrini y Salta": [
    -31.504,
    -68.555
  ],
  "Avenida Benavídez y Salta": [
    -31.5015,
    -68.55
  ],
  "Avenida Benavídez y Salta (Walmart)": [
    -31.5015,
    -68.55
  ],
  "Avenida Benavídez y España": [
    -31.5013,
    -68.53
  ],
  "Avenida Benavídez y Mendoza": [
    -31.501,
    -68.5338
  ],
  "Avenida Benavídez y Rioja": [
    -31.501,
    -68.522
  ],
  "Avenida Benavídez y Tucumán": [
    -31.501,
    -68.518
  ],
  "Avenida Benavídez y Ruta 40": [
    -31.5012,
    -68.5305
  ],
  "Avenida Benavídez y Necochea": [
    -31.5012,
    -68.498
  ],
  "Avenida Benavídez y Colón": [
    -31.5012,
    -68.49
  ],
  "Calle Mendoza y Chile": [
    -31.515,
    -68.5338
  ],
  "Calle Mendoza y San Isidro": [
    -31.518,
    -68.5338
  ],
  "Calle Mendoza y 25 de Mayo": [
    -31.527,
    -68.5338
  ],
  "Calle Mendoza y Libertador": [
    -31.5295,
    -68.5338
  ],
  "Calle Mendoza y Santa Fe": [
    -31.534,
    -68.5338
  ],
  "Calle Mendoza y Córdoba": [
    -31.5365,
    -68.5338
  ],
  "Avenida Rioja y Chile": [
    -31.515,
    -68.522
  ],
  "Avenida Rioja y San Isidro": [
    -31.518,
    -68.522
  ],
  "Avenida Rioja y Corrientes": [
    -31.518,
    -68.523
  ],
  "Avenida Rioja y Benavídez": [
    -31.501,
    -68.522
  ],
  "Avenida Rioja y 25 de Mayo": [
    -31.528,
    -68.522
  ],
  "Avenida Rioja y Libertador": [
    -31.5295,
    -68.522
  ],
  "Avenida Rioja y Libertador General San Martín y Rioja": [
    -31.5295,
    -68.522
  ],
  "Avenida Libertador General San Martín y Rioja": [
    -31.5295,
    -68.522
  ],
  "Avenida Rioja y Santa Fe": [
    -31.5335,
    -68.522
  ],
  "Avenida Rioja y Mitre": [
    -31.532,
    -68.521
  ],
  "Avenida Rioja y Córdoba": [
    -31.5365,
    -68.522
  ],
  "Avenida España y Chile": [
    -31.515,
    -68.53
  ],
  "Avenida España y San Isidro": [
    -31.518,
    -68.53
  ],
  "Avenida España y 25 de Mayo": [
    -31.527,
    -68.53
  ],
  "Avenida España y Libertador": [
    -31.53,
    -68.529
  ],
  "Avenida España y Córdoba": [
    -31.5365,
    -68.53
  ],
  "Avenida España y Arenales": [
    -31.545,
    -68.53
  ],
  "Avenida España y Benavídez": [
    -31.5015,
    -68.53
  ],
  "Calle Las Heras y Córdoba": [
    -31.532,
    -68.527
  ],
  "Calle Las Heras y Libertador": [
    -31.5295,
    -68.527
  ],
  "Calle Las Heras y 25 de Mayo": [
    -31.527,
    -68.527
  ],
  "Avenida Rawson y Córdoba": [
    -31.532,
    -68.514
  ],
  "Avenida Rawson y Santa Fe": [
    -31.534,
    -68.514
  ],
  "Avenida 25 de Mayo y Rawson": [
    -31.528,
    -68.514
  ],
  "Avenida Libertador y General Acha": [
    -31.5295,
    -68.524
  ],
  "Avenida Libertador y Mendoza": [
    -31.5295,
    -68.5338
  ],
  "Avenida Libertador y España": [
    -31.5295,
    -68.53
  ],
  "Avenida Libertador y Rioja": [
    -31.5295,
    -68.522
  ],
  "Calle Dorrego y Neuquén": [
    -31.485,
    -68.5298
  ],
  "Calle Dorrego y Centenario": [
    -31.4965,
    -68.5298
  ],
  "Calle Dorrego y Benavídez": [
    -31.501,
    -68.5298
  ],
  "Calle Ruta 40 y Neuquén": [
    -31.4852,
    -68.5305
  ],
  "Calle Ruta 40 y Centenario": [
    -31.4965,
    -68.5305
  ],
  "Calle Pellegrini y Centenario": [
    -31.4965,
    -68.559
  ],
  "Calle Pellegrini y Rodríguez": [
    -31.478,
    -68.559
  ],
  "Calle Tomás Edison y Colón": [
    -31.518,
    -68.49
  ],
  "Calle Tomás Edison y Benavídez": [
    -31.5012,
    -68.49
  ],
  "Calle Colón y Centenario": [
    -31.4965,
    -68.485
  ],
  "Calle Necochea y Centenario": [
    -31.4965,
    -68.498
  ],
  "Calle Necochea y Rodríguez": [
    -31.478,
    -68.498
  ],
  "Bº Valle Grande": [
    -31.558,
    -68.582
  ],
  "Complejo El Palomar": [
    -31.5315,
    -68.5375
  ],
  "Bº CGT Chimbas": [
    -31.472,
    -68.54
  ],
  "Colonia Gutiérrez (Chimbas)": [
    -31.455,
    -68.518
  ],
  "Campo Afuera (Albardón)": [
    -31.42,
    -68.51
  ],
  "Hospital Dr. José Giordano (Albardón)": [
    -31.432,
    -68.53
  ],
  "San José de Jáchal": [
    -30.24,
    -68.59
  ],
  "Rodeo (Iglesia)": [
    -30.21,
    -69.13
  ],
  "Barreal (Calingasta)": [
    -31.65,
    -69.47
  ]
};

// Obtener la coordenada de una parada o simularla de manera determinista y estable
const getCoordinatesForStop = (stopName) => {
  // Buscar coincidencia exacta en el diccionario
  const trimmed = stopName.trim();
  if (stopCoordinates.hasOwnProperty(trimmed)) {
    return stopCoordinates[trimmed];
  }

  // Fallback con advertencia en consola si falta en el diccionario de paradas
  console.warn(`[RedTulum] Parada sin coordenada exacta en el diccionario: "${stopName}"`);

  // Si no está, generar una coordenada determinista estable basada en el nombre
  // para que no cambie de posición al alternar la dirección (ida/vuelta)
  const baseLat = -31.4958;
  const baseLng = -68.5352;
  
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = trimmed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
  const radius = 0.01 + ((Math.abs(hash) % 100) / 100) * 0.02; // radio entre 0.01 y 0.03 grados
  return [baseLat + Math.sin(angle) * radius, baseLng + Math.cos(angle) * radius];
};


export default function BusMap({ lineName = '', stops = [], busType = 'interno_chimbas' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);

  // Mapear paradas a coordenadas geográficas
  const routePoints = stops.map((stop, index) => {
    const coords = getCoordinatesForStop(stop);
    return {
      name: stop,
      coords: coords,
      isFirst: index === 0,
      isLast: index === stops.length - 1
    };
  });

  useEffect(() => {
    let active = true;

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current || routePoints.length === 0) return;

      const L = (await import('leaflet')).default;
      if (!active) return;

      // Resolver icon paths en Leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Si el mapa no existe, inicializarlo
      if (!mapInstanceRef.current) {
        const centerCoords = routePoints[Math.floor(routePoints.length / 2)]?.coords || [-31.4958, -68.5352];
        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          scrollWheelZoom: false
        }).setView(centerCoords, 13);

        // Capa oscura súper estética
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(map);

        mapInstanceRef.current = map;
        layersGroupRef.current = L.featureGroup().addTo(map);
      }

      drawRoute(L);
    };

    const drawRoute = (L) => {
      const map = mapInstanceRef.current;
      const layersGroup = layersGroupRef.current;
      if (!map || !layersGroup) return;

      // Limpiar capas previas
      layersGroup.clearLayers();

      const latlngs = routePoints.map(p => p.coords);

      // Elegir color de línea por tipo de colectivo
      let routeColor = '#00f0ff'; // salud_universidad (teal)
      if (busType === 'capital_conexion') routeColor = '#a78bfa'; // violeta
      if (busType === 'interno_chimbas') routeColor = '#10b981'; // verde esmeralda

      // 1. Dibujar Polyline principal
      const polyline = L.polyline(latlngs, {
        color: routeColor,
        weight: 4,
        opacity: 0.85,
        lineJoin: 'round'
      }).addTo(layersGroup);

      // 2. Dibujar Polyline de sombra para efecto resplandor (glow)
      L.polyline(latlngs, {
        color: routeColor,
        weight: 10,
        opacity: 0.2,
        lineJoin: 'round'
      }).addTo(layersGroup);

      // 3. Dibujar marcadores de paradas
      routePoints.forEach((point, idx) => {
        let pinClass = 'bus-intermediate-pin';
        let pinSize = [10, 10];
        let pinAnchor = [5, 5];
        let popupTitle = `Parada ${idx + 1}`;

        if (point.isFirst) {
          pinClass = 'bus-origin-pin';
          pinSize = [16, 16];
          pinAnchor = [8, 8];
          popupTitle = '🟢 Terminal de Origen';
        } else if (point.isLast) {
          pinClass = 'bus-destination-pin';
          pinSize = [16, 16];
          pinAnchor = [8, 8];
          popupTitle = '🔴 Terminal de Destino';
        }

        const customIcon = L.divIcon({
          className: 'bus-custom-icon',
          html: `<div class="${pinClass}" style="
            width: ${pinSize[0]}px; 
            height: ${pinSize[1]}px; 
            border-radius: 50%; 
            border: 2px solid #fff;
            box-shadow: 0 0 8px rgba(0,0,0,0.5);
            background: ${point.isFirst ? '#10b981' : point.isLast ? '#ef4444' : routeColor};
            animation: ${point.isFirst || point.isLast ? 'pulse 2s infinite' : 'none'};
          "></div>`,
          iconSize: pinSize,
          iconAnchor: pinAnchor
        });

        const marker = L.marker(point.coords, { icon: customIcon }).addTo(layersGroup);
        
        const popupContent = `
          <div style="font-family: 'Outfit', sans-serif; color: white; padding: 4px; line-height: 1.4;">
            <strong style="display: block; font-size: 0.8rem; color: ${point.isFirst ? '#34d399' : point.isLast ? '#f87171' : routeColor}; text-transform: uppercase;">
              ${popupTitle}
            </strong>
            <span style="font-size: 0.9rem; font-weight: 600; color: #f1f5f9;">${point.name}</span>
          </div>
        `;
        
        marker.bindPopup(popupContent);
      });

      // Centrar mapa ajustándolo a los límites del recorrido
      try {
        map.fitBounds(layersGroup.getBounds(), {
          padding: [30, 30]
        });
      } catch (e) {
        console.error('Error fitting bounds:', e);
      }
    };

    initMap();

    return () => {
      active = false;
    };
  }, [stops, lineName, busType]);

  // Remover mapa al desmontar
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-glass)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' }}>
      {/* Contenedor del Mapa Leaflet */}
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%', background: '#090b10' }} 
      />
      
      {/* Indicador de mapa interactivo */}
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(9, 11, 16, 0.85)', backdropFilter: 'blur(4px)', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem', color: 'var(--text-muted)', zIndex: 1000, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <span>🗺️ Mapa Interactivo de Recorrido</span>
      </div>
    </div>
  );
}
