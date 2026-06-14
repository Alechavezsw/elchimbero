'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
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

export default function ColectivosPage() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedBus, setSelectedBus] = useState(null);

  useEffect(() => {
    async function loadBuses() {
      try {
        const data = await db.getBuses();
        setBuses(data);
        // Seleccionar la primera por defecto
        if (data.length > 0) {
          setSelectedBus(data[0]);
        }
      } catch (err) {
        console.error('Error al cargar colectivos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBuses();
  }, []);

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = 
      bus.line.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.stops.some(stop => stop.toLowerCase().includes(searchQuery.toLowerCase())) ||
      bus.neighborhoods.some(n => n.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesFilter = filterType === 'all' || bus.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleSelectBus = (bus) => {
    setSelectedBus(bus);
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'capital_conexion': return 'Conexión Capital';
      case 'interno_chimbas': return 'Interno Chimbas';
      case 'salud_universidad': return 'Salud y Universidades';
      default: return 'RedTulum';
    }
  };

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-open" style={{ marginBottom: '0.5rem', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--secondary)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
          Transporte Público
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="gradient-text-teal">
          Guía de Colectivos - RedTulum
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Encontrá los recorridos, frecuencias y paradas de las líneas de colectivos que circulan por Chimbas.
        </p>
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
          <button 
            className={`${styles.filterTab} ${filterType === 'all' ? styles.activeTab : ''}`}
            onClick={() => setFilterType('all')}
          >
            Todos
          </button>
          <button 
            className={`${styles.filterTab} ${filterType === 'capital_conexion' ? styles.activeTab : ''}`}
            onClick={() => setFilterType('capital_conexion')}
          >
            Conexión Capital
          </button>
          <button 
            className={`${styles.filterTab} ${filterType === 'interno_chimbas' ? styles.activeTab : ''}`}
            onClick={() => setFilterType('interno_chimbas')}
          >
            Internos Chimbas
          </button>
          <button 
            className={`${styles.filterTab} ${filterType === 'salud_universidad' ? styles.activeTab : ''}`}
            onClick={() => setFilterType('salud_universidad')}
          >
            Salud / Univ.
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass" style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', animation: 'pulse 1.5s infinite' }}>Cargando información de RedTulum...</span>
        </div>
      ) : (
        <div className={styles.mainLayout}>
          
          {/* COLUMNA IZQUIERDA: LISTADO DE LÍNEAS */}
          <div className={styles.listSection}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Líneas Disponibles ({filteredBuses.length})
            </h3>
            
            {filteredBuses.length === 0 ? (
              <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No se encontraron líneas para tu búsqueda.
              </div>
            ) : (
              <div className={styles.busList}>
                {filteredBuses.map((bus) => (
                  <div 
                    key={bus.id} 
                    className={`${styles.busCard} glass ${selectedBus?.id === bus.id ? `${styles.selectedBusCard} ${styles['selected_' + bus.type]}` : ''}`}
                    onClick={() => handleSelectBus(bus)}
                  >
                    <div className={styles.busCardHeader}>
                      <div className={styles.busBadge}>
                        <Bus size={18} />
                        <span>{bus.line}</span>
                      </div>
                      <span className={`${styles.typeTag} ${styles[bus.type]}`}>
                        {getTypeName(bus.type)}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                      {bus.description}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      <span>🕒 {bus.frequency}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--secondary)', fontWeight: 600 }}>
                        Ver Recorrido <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: RECORRIDO DETALLADO */}
          <div className={styles.detailSection}>
            {selectedBus ? (
              <div className={`${styles.detailCard} glass`}>
                <div className={styles.detailHeader}>
                  <div className={styles.busBigBadge}>
                    <Bus size={28} />
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
                    <span>Unidad: <strong>Coche RT-{selectedBus.line.match(/\d+/)?.[0] || '400'}-{Math.floor(Math.random() * 20) + 10}</strong></span>
                    <span>Accesibilidad: ♿ Rampa / ❄️ Aire</span>
                  </div>
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
                    Estaciones y Paradas Clave
                  </h4>
                  
                  <div className={styles.timeline}>
                    {selectedBus.stops.map((stop, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === selectedBus.stops.length - 1;
                      return (
                        <div key={idx} className={styles.timelineItem}>
                          <div className={`${styles.timelineDot} ${isFirst ? styles.firstDot : isLast ? styles.lastDot : ''}`}>
                            <div className={styles.dotInside} />
                          </div>
                          <div className={styles.timelineContent}>
                            <span className={styles.stopNumber}>
                              {isFirst ? '🟢 Terminal de Origen' : isLast ? '🔴 Terminal de Destino' : `Parada ${idx + 1}`}
                            </span>
                            <p className={styles.stopName}>{stop}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

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
