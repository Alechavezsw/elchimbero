'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Trash2, 
  AlertOctagon, 
  HeartPulse, 
  ShieldAlert, 
  Calendar, 
  MapPin, 
  Droplet, 
  Zap, 
  CheckCircle,
  Clock
} from 'lucide-react';
import styles from './servicios.module.css';

export default function ServiciosPage() {
  const [activeTab, setActiveTab] = useState('recoleccion');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('villa_paula');

  const neighborhoodsCollection = {
    villa_paula: {
      days: 'Lunes, Miércoles y Viernes',
      hours: '20:00 a 22:00 hs',
      status: 'Normal',
      notes: 'Sacar los residuos en bolsa bien cerrada en el canasto domiciliario.'
    },
    villa_obrera: {
      days: 'Martes, Jueves y Sábados',
      hours: '20:00 a 22:00 hs',
      status: 'Normal',
      notes: 'Colocar bolsas fuera del alcance de animales callejeros.'
    },
    tamarindos: {
      days: 'Lunes, Miércoles y Viernes',
      hours: '22:00 a 00:00 hs',
      status: 'Normal',
      notes: 'Servicio nocturno. Respetar los horarios de recolección.'
    },
    observatorio: {
      days: 'Martes, Jueves y Sábados',
      hours: '08:00 a 10:00 hs',
      status: 'Normal',
      notes: 'Servicio matutino. Sacar la basura a primera hora.'
    },
    santo_domingo: {
      days: 'Lunes a Sábados',
      hours: '21:00 a 23:00 hs',
      status: 'Normal',
      notes: 'Servicio de alta frecuencia por avenida principal.'
    }
  };

  const outages = [
    {
      id: 1,
      type: 'water',
      provider: 'OSSE',
      title: 'Mantenimiento en red distribuidora Chimbas Centro',
      description: 'Corte preventivo de agua potable por empalme de cañería en calle Mendoza y Chubut. Se aconseja cuidar la reserva del tanque domiciliario.',
      neighborhoods: ['Villa Paula', 'Villa El Salvador'],
      status: 'En progreso',
      time: 'Hasta las 18:00 hs de hoy'
    },
    {
      id: 2,
      type: 'electricity',
      provider: 'Energía San Juan',
      title: 'Corte Programado por Mejoras en Línea de Media Tensión',
      description: 'Mantenimiento preventivo en transformadores de calle Benavidez. Afectará el suministro eléctrico de forma intermitente.',
      neighborhoods: ['Barrio Los Tamarindos', 'Villa Observatorio'],
      status: 'Programado',
      time: 'Mañana Domingo de 08:00 a 12:00 hs'
    }
  ];

  const campaigns = [
    {
      id: 1,
      title: 'Campaña de Vacunación Antirrábica y Castración de Mascotas',
      organizer: 'Zoonosis Chimbas',
      date: 'Lunes 15 de Junio al Viernes 19 de Junio',
      time: '09:00 a 12:30 hs (Por orden de llegada)',
      location: 'Unión Vecinal de Villa Obrera',
      description: 'Servicio gratuito para perros y gatos mayores de 3 meses. Los perros deben ir con correa y bozal de ser necesario; los gatos en bolso o transportadora.',
      status: 'Activa'
    },
    {
      id: 2,
      title: 'Operativo Salud Móvil y Prevención del Dengue',
      organizer: 'Ministerio de Salud / Muni Chimbas',
      date: 'Miércoles 17 de Junio',
      time: '08:30 a 13:00 hs',
      location: 'Plaza Centenario de Chimbas',
      description: 'Atención primaria pediátrica y de adultos, control de presión, vacunación de calendario y entrega de folletos y repelentes para descacharrado.',
      status: 'Programada'
    }
  ];

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>
      </div>

      {/* TÍTULO */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-open" style={{ marginBottom: '0.5rem' }}>Portal de Servicios</span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="gradient-text">
          Servicios Municipales e Información Útil
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Mantente al tanto del cronograma de recolección de basura, campañas de salud y alertas de servicios básicos en Chimbas.
        </p>
      </div>

      {/* TABS DE SELECCIÓN */}
      <div className={styles.tabContainer} style={{ marginBottom: '2.5rem' }}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'recoleccion' ? styles.activeTabBtn : ''}`}
          onClick={() => setActiveTab('recoleccion')}
        >
          <Trash2 size={18} />
          Recolección de Residuos
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'cortes' ? styles.activeTabBtn : ''}`}
          onClick={() => setActiveTab('cortes')}
        >
          <AlertOctagon size={18} />
          Alertas de Cortes ({outages.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'salud' ? styles.activeTabBtn : ''}`}
          onClick={() => setActiveTab('salud')}
        >
          <HeartPulse size={18} />
          Campañas de Salud y Mascotas ({campaigns.length})
        </button>
      </div>

      {/* CONTENIDO DE TABS */}
      <div className={styles.tabContent}>
        
        {/* TAB 1: RECOLECCIÓN */}
        {activeTab === 'recoleccion' && (
          <div className={styles.recoleccionLayout}>
            
            <div className={`${styles.selectorCard} glass`}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Consultar Cronograma por Zona</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Seleccioná tu barrio o zona más cercana para conocer los días y horarios en que pasa el camión recolector.
              </p>
              
              <div className="form-group">
                <label className="form-label">Barrio / Villa / Loteo</label>
                <select 
                  className="form-select" 
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  style={{ background: 'rgba(9, 10, 15, 0.8)' }}
                >
                  <option value="villa_paula">Villa Paula (Centro)</option>
                  <option value="villa_obrera">Villa Obrera</option>
                  <option value="tamarindos">Barrio Los Tamarindos</option>
                  <option value="observatorio">Villa Observatorio / Costanera Oeste</option>
                  <option value="santo_domingo">Barrio Santo Domingo / Loteo Hogar</option>
                </select>
              </div>

              <div className={styles.scheduleInfo} style={{ marginTop: '2rem' }}>
                <div className={styles.scheduleRow}>
                  <Calendar size={18} style={{ color: 'var(--primary)' }} />
                  <div>
                    <span className={styles.scheduleLabel}>Días de Recolección</span>
                    <span className={styles.scheduleVal}>{neighborhoodsCollection[selectedNeighborhood].days}</span>
                  </div>
                </div>
                <div className={styles.scheduleRow} style={{ marginTop: '1rem' }}>
                  <Clock size={18} style={{ color: 'var(--secondary)' }} />
                  <div>
                    <span className={styles.scheduleLabel}>Franja Horaria</span>
                    <span className={styles.scheduleVal}>{neighborhoodsCollection[selectedNeighborhood].hours}</span>
                  </div>
                </div>
                <div className={styles.scheduleRow} style={{ marginTop: '1rem' }}>
                  <CheckCircle size={18} style={{ color: 'var(--primary)' }} />
                  <div>
                    <span className={styles.scheduleLabel}>Estado del Servicio</span>
                    <span className={`${styles.serviceStatus} badge badge-open`}>
                      {neighborhoodsCollection[selectedNeighborhood].status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.tipsCard} glass`}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} style={{ color: 'var(--color-warning)' }} />
                Consejos para una comunidad más limpia
              </h3>
              
              <ul className={styles.tipsList}>
                <li>
                  <strong>Respeta la franja horaria:</strong> Saca la basura como máximo una hora antes del inicio de la recolección para evitar que animales rompan las bolsas.
                </li>
                <li>
                  <strong>Bolsas resistentes:</strong> Utiliza bolsas de plástico resistentes y bien atadas. No uses cajas de cartón sueltas para residuos húmedos.
                </li>
                <li>
                  <strong>Materiales peligrosos:</strong> Si tiras vidrios rotos, agujas o latas abiertas, envolvelos previamente en papel de diario y rotulá la bolsa para proteger a los recolectores.
                </li>
                <li>
                  <strong>Escombros y Ramas:</strong> No coloques ramas grandes ni escombros en los canastos domiciliarios. Para estos residuos debés solicitar el servicio especial de contenedores al municipio.
                </li>
              </ul>
            </div>

          </div>
        )}

        {/* TAB 2: CORTES DE SERVICIO */}
        {activeTab === 'cortes' && (
          <div className={styles.cortesLayout}>
            {outages.map((outage) => (
              <div key={outage.id} className={`${styles.outageCard} glass`}>
                <div className={styles.outageHeader}>
                  <div className={styles.providerBadge}>
                    {outage.type === 'water' ? (
                      <Droplet size={20} style={{ color: 'var(--secondary)' }} />
                    ) : (
                      <Zap size={20} style={{ color: 'var(--primary)' }} />
                    )}
                    <div>
                      <span className={styles.providerName}>{outage.provider}</span>
                      <h3 className={styles.outageTitle}>{outage.title}</h3>
                    </div>
                  </div>
                  <span className={`badge ${outage.status === 'En progreso' ? 'badge-closed' : 'badge-warning'}`}>
                    {outage.status}
                  </span>
                </div>

                <p className={styles.outageDesc}>{outage.description}</p>

                <div style={{ marginTop: '1.25rem' }}>
                  <span className={styles.outageMetaLabel}>Zonas Afectadas:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                    {outage.neighborhoods.map((n, idx) => (
                      <span key={idx} className={styles.outageZoneTag}>
                        📍 {n}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.outageTime} style={{ marginTop: '1.25rem' }}>
                  <Clock size={16} />
                  <span><strong>Duración estimada:</strong> {outage.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: CAMPAÑAS DE SALUD */}
        {activeTab === 'salud' && (
          <div className={styles.campaniasLayout}>
            {campaigns.map((camp) => (
              <div key={camp.id} className={`${styles.campaignCard} glass`}>
                <div className={styles.campaignHeader}>
                  <div>
                    <span className={styles.campaignOrganizer}>{camp.organizer}</span>
                    <h3 className={styles.campaignTitle}>{camp.title}</h3>
                  </div>
                  <span className={`badge ${camp.status === 'Activa' ? 'badge-open' : 'badge-warning'}`}>
                    {camp.status}
                  </span>
                </div>

                <p className={styles.campaignDesc}>{camp.description}</p>

                <div className={styles.campaignMetaGrid} style={{ marginTop: '1.5rem' }}>
                  <div className={styles.campMetaItem}>
                    <Calendar size={16} style={{ color: 'var(--accent-pink)' }} />
                    <div>
                      <span>Fecha</span>
                      <strong>{camp.date}</strong>
                    </div>
                  </div>
                  <div className={styles.campMetaItem}>
                    <Clock size={16} style={{ color: 'var(--secondary)' }} />
                    <div>
                      <span>Horario</span>
                      <strong>{camp.time}</strong>
                    </div>
                  </div>
                  <div className={styles.campMetaItem}>
                    <MapPin size={16} style={{ color: 'var(--primary)' }} />
                    <div>
                      <span>Lugar</span>
                      <strong>{camp.location}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
