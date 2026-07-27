'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { db } from '@/lib/db';
import styles from './mapa.module.css';
import { Map, Layers, Store, HeartPulse, Clock, MapPin, Compass } from 'lucide-react';

// Cargar mapa dinámicamente
const LeafletMap = dynamic(() => import('@/components/Map'), {
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

export default function MapaUnificado() {
  const [businesses, setBusinesses] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [kiosks, setKiosks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de capas activas
  const [layerBusinesses, setLayerBusinesses] = useState(true);
  const [layerPharmacies, setLayerPharmacies] = useState(true);
  const [layerKiosks, setLayerKiosks] = useState(true);

  useEffect(() => {
    async function loadAllData() {
      try {
        const [bizData, phData, kData] = await Promise.all([
          db.getBusinesses(),
          db.getPharmacies(),
          db.getKiosks()
        ]);

        setBusinesses(bizData);
        setPharmacies(phData);
        setKiosks(kData);
      } catch (error) {
        console.error('Error al cargar datos del mapa unificado:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  // Construir pines filtrados en base a las capas activas
  const getFilteredPoints = () => {
    const points = [];

    // 1. Capa Comercios (Violeta)
    if (layerBusinesses) {
      businesses.forEach(b => {
        points.push({
          latitude: b.latitude,
          longitude: b.longitude,
          name: b.name,
          address: `${b.neighborhood} - ${b.address}`,
          phone: b.whatsapp || b.phone,
          type: 'business', // Violeta
          url: `/guia/${b.id}`
        });
      });
    }

    // 2. Capa Farmacias (Esmeralda para turno de hoy, regular de lo contrario)
    if (layerPharmacies) {
      // Obtener fecha de hoy
      const today = new Date();
      const localYear = today.getFullYear();
      const localMonth = String(today.getMonth() + 1).padStart(2, '0');
      const localDay = String(today.getDate()).padStart(2, '0');
      const todayStr = `${localYear}-${localMonth}-${localDay}`;

      pharmacies.forEach(ph => {
        const isOnDuty = ph.duty_dates && ph.duty_dates.includes(todayStr);
        points.push({
          latitude: ph.latitude,
          longitude: ph.longitude,
          name: ph.name + (isOnDuty ? ' (DE TURNO HOY)' : ''),
          address: ph.address,
          phone: ph.phone,
          type: isOnDuty ? 'pharmacy' : 'business', // Emerald para turno hoy, Violeta para farmacia común
          url: '/farmacias'
        });
      });
    }

    // 3. Capa Kioscos (Ámbar)
    if (layerKiosks) {
      kiosks.forEach(k => {
        points.push({
          latitude: k.latitude,
          longitude: k.longitude,
          name: k.name,
          address: `${k.neighborhood} - ${k.address}`,
          phone: k.phone,
          type: 'kiosk', // Ámbar
          url: '/kioscos'
        });
      });
    }

    return points;
  };

  const filteredPoints = getFilteredPoints();

  return (
    <div className="container fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Layers size={32} style={{ color: 'var(--primary)' }} />
          <div>
            <h1 className={styles.title}>Mapa Interactivo</h1>
            <p className={styles.subtitle}>Explorá Chimbas de forma visual y filtrá las capas que te interesan</p>
          </div>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <h2>Cargando Mapa Unificado...</h2>
        </div>
      ) : (
        <div className={styles.layout}>
          
          {/* SIDEBAR PANEL */}
          <div className={`${styles.panel} glass`}>
            <div>
              <h3 className={styles.panelTitle}>Capas del Mapa</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Habilitá o deshabilitá marcadores para limpiar la visualización.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              {/* CAPA COMERCIOS */}
              <div 
                className={styles.layerOption} 
                onClick={() => setLayerBusinesses(!layerBusinesses)}
              >
                <input 
                  type="checkbox" 
                  className={styles.layerCheckbox}
                  checked={layerBusinesses}
                  onChange={() => {}} // Manejado por onClick del contenedor
                />
                <span className={`${styles.dot} ${styles.dotViolet}`} />
                <span className={styles.layerLabel}>Comercios ({businesses.length})</span>
              </div>

              {/* CAPA FARMACIAS */}
              <div 
                className={styles.layerOption} 
                onClick={() => setLayerPharmacies(!layerPharmacies)}
              >
                <input 
                  type="checkbox" 
                  className={styles.layerCheckbox}
                  checked={layerPharmacies}
                  onChange={() => {}}
                />
                <span className={`${styles.dot} ${styles.dotEmerald}`} />
                <span className={styles.layerLabel}>Farmacias ({pharmacies.length})</span>
              </div>

              {/* CAPA KIOSCOS */}
              <div 
                className={styles.layerOption} 
                onClick={() => setLayerKiosks(!layerKiosks)}
              >
                <input 
                  type="checkbox" 
                  className={styles.layerCheckbox}
                  checked={layerKiosks}
                  onChange={() => {}}
                />
                <span className={`${styles.dot} ${styles.dotAmber}`} />
                <span className={styles.layerLabel}>Kioscos ({kiosks.length})</span>
              </div>

            </div>

            {/* ESTADÍSTICAS */}
            <div className={styles.statsText}>
              <p>📍 Mostrando un total de <strong>{filteredPoints.length}</strong> puntos de interés en Chimbas, San Juan.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                Hacé click en cualquier pin para ver la dirección, el teléfono y abrir su ficha detallada.
              </p>
            </div>
          </div>

          {/* MAPA FULL */}
          <div className={styles.mapWrapper}>
            <LeafletMap 
              points={filteredPoints} 
              center={[-31.4958, -68.5352]} 
              zoom={14} 
            />
          </div>

        </div>
      )}
    </div>
  );
}
