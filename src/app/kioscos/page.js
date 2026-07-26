'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { db } from '@/lib/db';
import styles from './kioscos.module.css';
import { Clock, MapPin, Phone, Compass, Navigation } from 'lucide-react';

// Cargar mapa dinámicamente
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-dark)',
      color: 'var(--text-secondary)'
    }}>
      Cargando Mapa...
    </div>
  )
});

export default function KioscosAbiertos() {
  const [kiosks, setKiosks] = useState([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Todos');
  const [only24h, setOnly24h] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState(['Todos']);
  const [mapCenter, setMapCenter] = useState([-31.4958, -68.5352]);
  const [mapZoom, setMapZoom] = useState(14);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKiosks() {
      try {
        const data = await db.getKiosks();
        setKiosks(data);

        // Extraer barrios únicos
        const uniqueBarrios = ['Todos', ...new Set(data.map(k => k.neighborhood).filter(Boolean))];
        setNeighborhoods(uniqueBarrios);
      } catch (error) {
        console.error('Error al obtener kioscos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadKiosks();
  }, []);

  // Filtrar kioscos
  const filteredKiosks = useMemo(() => {
    let result = [...kiosks];

    if (selectedNeighborhood !== 'Todos') {
      result = result.filter(k => k.neighborhood === selectedNeighborhood);
    }

    if (only24h) {
      result = result.filter(k => k.is_open_24h);
    }

    return result;
  }, [kiosks, selectedNeighborhood, only24h]);

  const handleCardClick = (lat, lon) => {
    setMapCenter([parseFloat(lat), parseFloat(lon)]);
    setMapZoom(16);
  };

  // Preparar pines para el mapa (tipo 'kiosk' renderiza en color amber)
  const mapPoints = filteredKiosks.map(k => ({
    latitude: k.latitude,
    longitude: k.longitude,
    name: k.name,
    address: k.address,
    phone: k.phone,
    type: 'kiosk'
  }));

  return (
    <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock size={36} style={{ color: 'var(--color-warning)' }} />
          <div>
            <h1 className={styles.title}>Kioscos Abiertos</h1>
            <p className={styles.subtitle}>Maxikioscos, drugstores y almacenes express con horarios extendidos</p>
          </div>
        </div>
      </header>

      {/* FILTROS */}
      <div className={`${styles.filters} glass`} style={{ padding: '1.25rem 2rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Filtrar por Barrio:</span>
          </div>
          
          <select
            className="form-select"
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
            style={{ maxWidth: '250px', background: 'var(--bg-deep)' }}
          >
            <option value="Todos">Todos los barrios</option>
            {neighborhoods.filter(n => n !== 'Todos').map(barrio => (
              <option key={barrio} value={barrio}>{barrio}</option>
            ))}
          </select>
        </div>

        <div className={styles.toggleContainer} onClick={() => setOnly24h(!only24h)}>
          <input 
            type="checkbox" 
            className={styles.toggleInput} 
            checked={only24h}
            onChange={() => {}} // Manejado por onClick del contenedor
          />
          <span style={{ fontWeight: 600 }}>Mostrar sólo Kioscos 24hs</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Cargando listado de kioscos...</h2>
        </div>
      ) : (
        <div className={styles.layoutGrid}>
          
          {/* COLUMNA IZQUIERDA: LISTADO */}
          <div className={styles.listSection}>
            {filteredKiosks.length > 0 ? (
              filteredKiosks.map(k => (
                <div 
                  key={k.id} 
                  className={`${styles.kioskCard} glass card-amber`}
                  onClick={() => handleCardClick(k.latitude, k.longitude)}
                >
                  <div className={styles.cardHeader}>
                    <h4 className={styles.kioskName}>{k.name}</h4>
                    <span className={`badge ${k.is_open_24h ? 'badge-open' : 'badge-warning'}`} style={k.is_open_24h ? {} : { color: 'var(--color-warning)', borderColor: 'rgba(245,158,11,0.2)' }}>
                      {k.is_open_24h ? 'Abierto 24hs' : 'Abierto Tarde'}
                    </span>
                  </div>

                  <div className={styles.addressRow}>
                    <MapPin size={16} style={{ color: 'var(--color-warning)' }} />
                    <span>{k.neighborhood} - {k.address}</span>
                  </div>

                  <p className={styles.description}>{k.hours_description}</p>

                  <div className={styles.contactRow}>
                    <button className="btn btn-teal" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', gap: '0.35rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: 'none' }}>
                      <Navigation size={14} /> Cómo llegar
                    </button>
                    {k.phone && (
                      <a href={`tel:${k.phone}`} className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                        Llamar ({k.phone})
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No encontramos ningún kiosco abierto que cumpla con los filtros seleccionados.
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: MAPA */}
          <div className={`${styles.mapSection} glass`}>
            <Map 
              points={mapPoints} 
              center={mapCenter} 
              zoom={mapZoom} 
            />
          </div>

        </div>
      )}
    </div>
  );
}
