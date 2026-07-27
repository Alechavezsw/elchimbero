'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { initialBuses } from '@/lib/mockData';
import { 
  Bus, 
  ArrowLeft, 
  Search, 
  MapPin, 
  Clock, 
  ArrowRight,
  Route,
  Navigation
} from 'lucide-react';
import styles from './colectivos.module.css';
import BusMap from '@/components/BusMap';

export default function ColectivosPage() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedBus, setSelectedBus] = useState(null);
  const [direction, setDirection] = useState('ida'); // 'ida' | 'vuelta'

  useEffect(() => {
    async function loadBuses() {
      let data = [];
      try {
        data = await db.getBuses();
      } catch (err) {
        console.error('Error al cargar colectivos, usando datos locales:', err);
      }
      // Si Supabase falla o no tiene datos, usamos el listado local
      if (!data || data.length === 0) {
        data = [...initialBuses].sort((a, b) => a.line.localeCompare(b.line));
      }
      setBuses(data);
      if (data.length > 0) {
        setSelectedBus(data[0]);
        setDirection('ida');
      }
      setLoading(false);
    }
    loadBuses();
  }, []);

  const filteredBuses = buses.filter(bus => {
    const q = searchQuery.toLowerCase();
    const stops = Array.isArray(bus.stops) ? bus.stops : [];
    const neighborhoods = Array.isArray(bus.neighborhoods) ? bus.neighborhoods : [];
    const matchesSearch =
      (bus.line || '').toLowerCase().includes(q) ||
      (bus.description || '').toLowerCase().includes(q) ||
      stops.some(stop => String(stop).toLowerCase().includes(q)) ||
      neighborhoods.some(n => String(n).toLowerCase().includes(q));

    const matchesFilter = filterType === 'all' || bus.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const handleSelectBus = (bus) => {
    setSelectedBus(bus);
    setDirection('ida');
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'capital_conexion': return 'Conexión Capital';
      case 'interno_chimbas': return 'Interno Chimbas';
      case 'salud_universidad': return 'Salud y Universidades';
      default: return 'RedTulum';
    }
  };

  // "Línea 400" -> "400", "Troncal TNS" -> "TNS", "Corredor B" -> "B"
  const getLineCode = (line) => line.replace(/^(Línea|Troncal|Corredor)\s+/i, '');

  const typeCounts = {
    all: buses.length,
    capital_conexion: buses.filter(b => b.type === 'capital_conexion').length,
    interno_chimbas: buses.filter(b => b.type === 'interno_chimbas').length,
    salud_universidad: buses.filter(b => b.type === 'salud_universidad').length,
  };

  const totalStops = buses.reduce((acc, b) => acc + (b.stops?.length || 0), 0);
  const totalNeighborhoods = new Set(buses.flatMap(b => b.neighborhoods || [])).size;

  const filterTabs = [
    { key: 'all', label: 'Todos' },
    { key: 'capital_conexion', label: 'Conexión Capital' },
    { key: 'interno_chimbas', label: 'Internos Chimbas' },
    { key: 'salud_universidad', label: 'Salud / Univ.' },
  ];

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>
      </div>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <span className={styles.heroBadge}>
              <Bus size={14} />
              RedTulum · Chimbas
            </span>
            <h1 className={styles.heroTitle}>
              Guía de <span className="gradient-text">Colectivos</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Elegí una línea, mirá el recorrido y las paradas en el mapa.
            </p>
          </div>
          {!loading && (
            <div className={styles.heroStats}>
              <div className={styles.statChip}>
                <strong>{buses.length}</strong>
                <span>Líneas</span>
              </div>
              <div className={styles.statChip}>
                <strong>{totalStops}</strong>
                <span>Paradas</span>
              </div>
              <div className={styles.statChip}>
                <strong>{totalNeighborhoods}</strong>
                <span>Barrios</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className={`${styles.filterBar} glass`} style={{ padding: '1rem', marginBottom: '2rem' }}>
        <div className={styles.searchBox}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar línea, barrio o parada (ej: Plaza de Chimbas, Hospital Rawson)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterTabs}>
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.filterTab} ${filterType === tab.key ? styles.activeTab : ''}`}
              onClick={() => setFilterType(tab.key)}
            >
              {tab.key !== 'all' && <span className={`${styles.tabDot} ${styles['dot_' + tab.key]}`} />}
              {tab.label}
              {!loading && <span className={styles.tabCount}>{typeCounts[tab.key]}</span>}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.mainLayout}>
          <div className={styles.listSection}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonCard} style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
          <div className={styles.skeletonDetail} />
        </div>
      ) : (
        <div className={styles.mainLayout}>
          
          {/* COLUMNA IZQUIERDA: LISTADO DE LÍNEAS */}
          <div className={styles.listSection}>
            <div className={styles.listHeader}>
              <h3 className={styles.listTitle}>Líneas</h3>
              <span className={styles.listCount}>{filteredBuses.length}</span>
            </div>
            
            {filteredBuses.length === 0 ? (
              <div className={`glass ${styles.emptyState}`}>
                <Bus size={36} />
                <p>No se encontraron líneas para tu búsqueda.</p>
                <span>Probá con otro barrio, parada o número de línea.</span>
              </div>
            ) : (
              <div className={styles.busList}>
                {filteredBuses.map((bus, idx) => {
                  const stops = Array.isArray(bus.stops) ? bus.stops : [];
                  const firstStop = stops[0] || 'Origen';
                  const lastStop = stops[stops.length - 1] || 'Destino';
                  const isSelected = selectedBus?.id === bus.id;

                  return (
                    <button
                      key={bus.id}
                      type="button"
                      className={`${styles.busCard} ${isSelected ? `${styles.selectedBusCard} ${styles['selected_' + bus.type]}` : ''}`}
                      onClick={() => handleSelectBus(bus)}
                      style={{ animationDelay: `${Math.min(idx, 10) * 40}ms` }}
                    >
                      <div className={styles.busCardHeader}>
                        <span className={`${styles.linePlate} ${styles['plate_' + bus.type]}`}>
                          {getLineCode(bus.line)}
                        </span>
                        <div className={styles.busIdentityText}>
                          <span className={styles.busLineName}>{bus.line}</span>
                          <span className={`${styles.typeTag} ${styles[bus.type]}`}>
                            {getTypeName(bus.type)}
                          </span>
                        </div>
                        {isSelected && (
                          <span className={styles.selectedMark} aria-hidden>
                            <ArrowRight size={16} />
                          </span>
                        )}
                      </div>

                      <div className={styles.routePreview}>
                        <div className={styles.routeRow}>
                          <span className={`${styles.routeDot} ${styles.routeDotStart}`} />
                          <span className={styles.routeStop}>{firstStop}</span>
                        </div>
                        <div className={styles.routeRow}>
                          <span className={`${styles.routeDot} ${styles.routeDotEnd}`} />
                          <span className={styles.routeStop}>{lastStop}</span>
                        </div>
                      </div>

                      <div className={styles.busCardFooter}>
                        <span className={styles.freqChip}>
                          <Clock size={12} /> {bus.frequency}
                        </span>
                        <span className={styles.viewRouteLink}>
                          {isSelected ? 'En mapa' : 'Ver recorrido'}
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: RECORRIDO DETALLADO */}
          <div className={styles.detailSection}>
            {selectedBus ? (
              <div className={`${styles.detailCard} glass`}>
                <div className={styles.detailHeader}>
                  <div className={styles.busBigBadge}>
                    <span className={`${styles.linePlate} ${styles.linePlateLg} ${styles['plate_' + selectedBus.type]}`}>
                      {getLineCode(selectedBus.line)}
                    </span>
                    <div>
                      <h2>{selectedBus.line}</h2>
                      <span className={`${styles.typeTag} ${styles[selectedBus.type]}`}>
                        {getTypeName(selectedBus.type)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.detailMeta}>
                    <span className={styles.metaItem}>🕒 Frecuencia: <strong>{selectedBus.frequency}</strong></span>
                  </div>
                </div>

                <div style={{ margin: '1.5rem 0' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descripción del Servicio</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>{selectedBus.description}</p>
                </div>

                {/* BARRIOS QUE RECORRE */}
                <div style={{ margin: '1.5rem 0' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Barrios de Cobertura</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedBus.neighborhoods.map((n, i) => (
                      <span key={i} className={styles.neighborhoodTag}>
                        📍 {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* SIMULADOR DE ARRIBO EN TIEMPO REAL */}
                <div style={{ margin: '1.5rem 0', background: 'rgba(0, 240, 255, 0.02)', border: '1px solid rgba(0, 240, 255, 0.1)', padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', margin: 0, fontWeight: 700 }}>
                      <Clock size={16} style={{ color: 'var(--secondary)' }} /> Estado de Frecuencia (En Vivo)
                    </h4>
                    <span className="badge badge-open" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.725rem', padding: '0.2rem 0.6rem', fontWeight: 700 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1.5s infinite' }} /> En Servicio
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
                    <div className="glass" style={{ padding: '0.75rem', borderRadius: '8px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)' }}>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Próximo Colectivo</span>
                      <strong style={{ fontSize: '1.35rem', color: 'var(--secondary)', textShadow: '0 0 12px rgba(0,240,255,0.4)' }}>
                        {/* Generamos un tiempo ficticio basado en el minuto actual */}
                        {typeof window !== 'undefined' ? `${(new Date().getMinutes() % 12) + 3} min` : '7 min'}
                      </strong>
                    </div>
                    <div className="glass" style={{ padding: '0.75rem', borderRadius: '8px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)' }}>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Frecuencia Promedio</span>
                      <strong style={{ fontSize: '1.35rem', color: 'white' }}>{selectedBus.frequency.replace('Cada ', '')}</strong>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                    <span>Unidad: <strong>Coche RT-{selectedBus.line.match(/\d+/)?.[0] || '400'}-{(selectedBus.line.charCodeAt(0) || 0) % 20 + 10}</strong></span>
                    <span>Accesibilidad: ♿ Rampa / ❄️ Aire</span>
                  </div>
                </div>

                {/* SELECTOR DE SENTIDO (IDA / VUELTA) */}
                <div style={{ margin: '1.5rem 0' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sentido del Recorrido</h4>
                  <div className="glass" style={{ display: 'flex', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                    <button 
                      onClick={() => setDirection('ida')}
                      className="btn"
                      style={{ 
                        flex: 1, 
                        background: direction === 'ida' ? 'var(--primary-gradient)' : 'none',
                        color: direction === 'ida' ? 'white' : 'var(--text-secondary)',
                        padding: '0.5rem', 
                        fontSize: '0.85rem', 
                        fontWeight: 700, 
                        borderRadius: '6px',
                        border: 'none',
                        boxShadow: 'none',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      🟢 Ida
                    </button>
                    <button 
                      onClick={() => setDirection('vuelta')}
                      className="btn"
                      style={{ 
                        flex: 1, 
                        background: direction === 'vuelta' ? 'var(--primary-gradient)' : 'none',
                        color: direction === 'vuelta' ? 'white' : 'var(--text-secondary)',
                        padding: '0.5rem', 
                        fontSize: '0.85rem', 
                        fontWeight: 700, 
                        borderRadius: '6px',
                        border: 'none',
                        boxShadow: 'none',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      🔄 Vuelta
                    </button>
                  </div>
                </div>

                {/* MAPA DE RECORRIDO DE OPENSTREETMAP */}
                {(() => {
                  const displayedStops = direction === 'ida' 
                    ? selectedBus.stops 
                    : (selectedBus.stops_vuelta && selectedBus.stops_vuelta.length > 0 ? selectedBus.stops_vuelta : [...selectedBus.stops].reverse());
                  return (
                    <>
                      <div style={{ margin: '1.5rem 0' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Mapa de Recorrido ({direction === 'ida' ? 'Ida' : 'Vuelta'})
                        </h4>
                        <BusMap 
                          lineName={selectedBus.line} 
                          stops={displayedStops} 
                          busType={selectedBus.type} 
                        />
                      </div>

                      {/* CRONOGRAMA DE HORARIOS */}
                      <div style={{ margin: '1.5rem 0', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '1rem', borderRadius: '8px' }}>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={16} /> Horarios de Operación
                        </h4>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{selectedBus.schedule}</p>
                      </div>

                      {/* CRONOGRAMA DE PARADAS (TIMELINE) */}
                      <div style={{ marginTop: '2rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <Route size={18} style={{ color: 'var(--secondary)' }} />
                          Estaciones y Paradas Clave ({direction === 'ida' ? 'Sentido de Ida' : 'Sentido de Vuelta'})
                        </h4>
                        
                        <div className={styles.timeline}>
                          {displayedStops.map((stop, idx) => {
                            const isFirst = idx === 0;
                            const isLast = idx === displayedStops.length - 1;
                            return (
                              <div key={idx} className={styles.timelineItem}>
                                <div className={`${styles.timelineDot} ${isFirst ? styles.firstDot : isLast ? styles.lastDot : ''}`}>
                                  <div className={styles.dotInside} />
                                </div>
                                <div className={styles.timelineContent}>
                                  <span className={styles.stopNumber}>
                                    {isFirst ? '🟢 Terminal de Origen' : isLast ? '🔴 Terminal de Destino' : `Parada ${idx + 1}`}
                                  </span>
                                  <p style={{ margin: 0 }} className={styles.stopName}>{stop}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* ENLACE GOOGLE MAPS SIMULADO */}
                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=Chimbas+San+Juan+RedTulum+${encodeURIComponent(selectedBus.line)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-teal"
                    style={{ flex: 1 }}
                  >
                    <Navigation size={18} />
                    Ver en Google Maps
                  </a>
                </div>

              </div>
            ) : (
              <div className="glass" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Seleccioná una línea para ver su recorrido detallado.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
