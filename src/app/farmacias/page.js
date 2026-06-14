'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { db } from '@/lib/db';
import styles from './farmacias.module.css';
import { HeartPulse, MapPin, Phone, Calendar, Navigation, Info } from 'lucide-react';

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

export default function FarmaciasDeTurno() {
  const [pharmacies, setPharmacies] = useState([]);
  const [onDutyList, setOnDutyList] = useState([]);
  const [regularList, setRegularList] = useState([]);
  const [mapCenter, setMapCenter] = useState([-31.4958, -68.5352]);
  const [mapZoom, setMapZoom] = useState(14);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPharmacies() {
      try {
        const data = await db.getPharmacies();
        setPharmacies(data);

        // Obtener fecha actual en formato local AAAA-MM-DD
        const today = new Date();
        const localYear = today.getFullYear();
        const localMonth = String(today.getMonth() + 1).padStart(2, '0');
        const localDay = String(today.getDate()).padStart(2, '0');
        const todayStr = `${localYear}-${localMonth}-${localDay}`;

        // Clasificar farmacias de turno hoy
        const onDuty = [];
        const regular = [];

        data.forEach(pharmacy => {
          // Si las fechas del turno incluyen la de hoy
          const isOnDuty = pharmacy.duty_dates && pharmacy.duty_dates.includes(todayStr);
          if (isOnDuty) {
            onDuty.push(pharmacy);
          } else {
            regular.push(pharmacy);
          }
        });

        setOnDutyList(onDuty);
        setRegularList(regular);

        // Si hay alguna de turno, centrar el mapa ahí
        if (onDuty.length > 0) {
          setMapCenter([parseFloat(onDuty[0].latitude), parseFloat(onDuty[0].longitude)]);
          setMapZoom(15);
        }
      } catch (error) {
        console.error('Error al obtener farmacias:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPharmacies();
  }, []);

  const handleCardClick = (lat, lon) => {
    setMapCenter([parseFloat(lat), parseFloat(lon)]);
    setMapZoom(16);
  };

  // Preparar pines para el mapa
  const allMapPoints = pharmacies.map(ph => {
    const today = new Date();
    const localYear = today.getFullYear();
    const localMonth = String(today.getMonth() + 1).padStart(2, '0');
    const localDay = String(today.getDate()).padStart(2, '0');
    const todayStr = `${localYear}-${localMonth}-${localDay}`;
    const isOnDuty = ph.duty_dates && ph.duty_dates.includes(todayStr);

    return {
      latitude: ph.latitude,
      longitude: ph.longitude,
      name: ph.name,
      address: ph.address,
      phone: ph.phone,
      type: isOnDuty ? 'pharmacy' : 'business', // Emerald para turno, violeta para las demás
    };
  });

  return (
    <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <HeartPulse size={36} style={{ color: 'var(--secondary)' }} />
          <div>
            <h1 className={styles.title}>Farmacias de Turno</h1>
            <p className={styles.subtitle}>Encontrá las farmacias abiertas hoy en el departamento de Chimbas</p>
          </div>
        </div>
      </header>

      {/* INFO ADVERTENCIA */}
      <div className="glass" style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(20, 184, 166, 0.2)', background: 'rgba(20, 184, 166, 0.03)', marginBottom: '2.5rem', alignItems: 'center' }}>
        <Info size={20} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          Las farmacias de turno atienden las <strong>24 horas</strong> a partir de las 08:30 AM del día indicado hasta las 08:30 AM del día siguiente. Recordá llevar tu receta y documento de identidad.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Cargando Cronograma de Farmacias...</h2>
        </div>
      ) : (
        <div className={styles.layoutGrid}>
          
          {/* COLUMNA IZQUIERDA: LISTADOS */}
          <div className={styles.listSection}>
            
            {/* SECCIÓN: DE TURNO HOY */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                De Turno Hoy
              </h3>
              
              {onDutyList.length > 0 ? (
                onDutyList.map(ph => (
                  <div 
                    key={ph.id} 
                    className={`${styles.pharmacyCard} ${styles.activeCard} glass pulse-glow card-emerald`}
                    onClick={() => handleCardClick(ph.latitude, ph.longitude)}
                    style={{ marginBottom: '1rem' }}
                  >
                    <div className={styles.cardHeader}>
                      <h4 className={styles.pharmacyName}>{ph.name}</h4>
                      <span className={styles.dutyBadge}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-open)', display: 'inline-block', animation: 'ping 1s infinite' }} />
                        De Turno Ahora
                      </span>
                    </div>

                    <div className={styles.addressRow}>
                      <MapPin size={16} />
                      <span>{ph.address}</span>
                    </div>

                    {ph.phone && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        📞 Teléfono: <strong style={{ color: 'var(--text-primary)' }}>{ph.phone}</strong>
                      </p>
                    )}

                    <div className={styles.contactRow}>
                      <button className="btn btn-teal" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', gap: '0.35rem' }}>
                        <Navigation size={14} /> Cómo llegar
                      </button>
                      {ph.phone && (
                        <a href={`tel:${ph.phone}`} className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                          Llamar
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay farmacias de turno registradas para hoy en el cronograma.
                </div>
              )}
            </div>

            {/* SECCIÓN: OTRAS FARMACIAS */}
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Otras Farmacias en Chimbas
              </h3>
              
              {regularList.map(ph => (
                <div 
                  key={ph.id} 
                  className={`${styles.pharmacyCard} glass card-emerald`}
                  onClick={() => handleCardClick(ph.latitude, ph.longitude)}
                  style={{ marginBottom: '1rem' }}
                >
                  <div className={styles.cardHeader}>
                    <h4 className={styles.pharmacyName} style={{ fontSize: '1.15rem' }}>{ph.name}</h4>
                    {ph.is_open_24h && <span className="badge badge-warning">24 Horas</span>}
                  </div>

                  <div className={styles.addressRow}>
                    <MapPin size={14} />
                    <span>{ph.address}</span>
                  </div>

                  {ph.phone && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      📞 Teléfono: {ph.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>

          </div>

          {/* COLUMNA DERECHA: MAPA */}
          <div className={`${styles.mapSection} glass`}>
            <Map 
              points={allMapPoints} 
              center={mapCenter} 
              zoom={mapZoom} 
            />
          </div>

        </div>
      )}
    </div>
  );
}
