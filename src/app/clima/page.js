'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CloudSun, 
  Wind, 
  Droplets, 
  Sun, 
  AlertTriangle, 
  ArrowLeft, 
  Clock, 
  ShieldAlert 
} from 'lucide-react';
import styles from './clima.module.css';

export default function ClimaPage() {
  const [currentDate, setCurrentDate] = useState('');
  
  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentDate(new Date().toLocaleDateString('es-AR', options));
  }, []);

  // Simulación de pronóstico de 5 días con entrada de frente frío tras el Zonda
  const forecast = [
    { day: 'Mañana (Dom)', tempMax: '24°C', tempMin: '6°C', status: 'Viento Zonda Fuerte 🌬️', icon: '💨' },
    { day: 'Lunes', tempMax: '13°C', tempMin: '2°C', status: 'Despejado, Frío (Frente Frío) ❄️', icon: '🌌' },
    { day: 'Martes', tempMax: '12°C', tempMin: '1°C', status: 'Algo Nublado, Heladas', icon: '⛅' },
    { day: 'Miércoles', tempMax: '14°C', tempMin: '3°C', status: 'Despejado y Seco', icon: '☀️' },
    { day: 'Jueves', tempMax: '16°C', tempMin: '5°C', status: 'Templado por la tarde', icon: '☀️' },
  ];

  const zondaRecommendations = [
    'Asegurá chapas, macetas, persianas u otros objetos sueltos que puedan ser arrastrados por el viento.',
    'Evitá salir de tu hogar si no es sumamente necesario para prevenir accidentes por caída de ramas o postes.',
    'Mantené puertas y ventanas cerradas herméticamente y colocá toallas húmedas en las rendijas para evitar la entrada de tierra.',
    'Humedecé los ambientes del hogar para contrarrestar la extrema sequedad del aire.',
    'NO enciendas fuego al aire libre bajo ninguna circunstancia. El riesgo de incendios forestales y de interfaces es EXTREMO.',
    'Si debés conducir, hacelo a velocidad muy reducida y con luces encendidas. La visibilidad puede ser nula por tierra en suspensión.',
    'Tené linternas y agua de reserva a mano por posibles cortes de electricidad o de suministro de agua corriente.'
  ];

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      
      {/* HEADER DE NAVEGACIÓN */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>
      </div>

      {/* TÍTULO */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-warning" style={{ marginBottom: '0.5rem' }}>Monitoreo Climático</span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="gradient-text">Clima y Alertas de Chimbas</h1>
        <p style={{ color: 'var(--text-secondary)', textTransform: 'capitalize', marginTop: '0.25rem' }}>📍 Chimbas, San Juan | {currentDate}</p>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className={styles.gridContainer}>
        
        {/* CLIMA ACTUAL */}
        <div className={`${styles.currentWeatherCard} glass`}>
          <div className={styles.currentHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Estado Actual</h2>
              <p className={styles.subtitle}>Actualizado hace unos minutos</p>
            </div>
            <span className={styles.mainIcon}>🌬️</span>
          </div>

          <div className={styles.tempArea}>
            <span className={styles.temperature}>11°C</span>
            <div className={styles.statusBadge}>
              <span className={styles.statusText}>Viento Zonda en desarrollo</span>
            </div>
          </div>

          <div className={styles.weatherMetrics}>
            <div className={styles.metricItem}>
              <Wind size={20} style={{ color: 'var(--primary)' }} />
              <div>
                <span className={styles.metricLabel}>Viento</span>
                <span className={styles.metricValue}>Oeste a 45 km/h (Ráfagas 65 km/h)</span>
              </div>
            </div>

            <div className={styles.metricItem}>
              <Droplets size={20} style={{ color: 'var(--secondary)' }} />
              <div>
                <span className={styles.metricLabel}>Humedad</span>
                <span className={styles.metricValue}>12% (Muy Seco)</span>
              </div>
            </div>

            <div className={styles.metricItem}>
              <Sun size={20} style={{ color: 'var(--color-warning)' }} />
              <div>
                <span className={styles.metricLabel}>UV Máximo</span>
                <span className={styles.metricValue}>3 (Bajo/Medio)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ALERTA METEOROLÓGICA */}
        <div className={`${styles.alertCard} glass`}>
          <div className={styles.alertHeader}>
            <AlertTriangle size={28} className="urgency-pulse" style={{ color: 'var(--accent-pink)' }} />
            <div>
              <h2 className={styles.alertTitle} style={{ color: 'var(--accent-pink)' }}>Alerta Naranja: Viento Zonda</h2>
              <p className={styles.alertScope}>Validez: Hoy Tarde/Noche y Mañana Domingo completo</p>
            </div>
          </div>
          
          <p className={styles.alertDescription}>
            El Servicio Meteorológico Nacional ha emitido alerta naranja para Chimbas y el Gran San Juan. 
            Se esperan ráfagas de viento del sector Oeste con velocidades entre 50 y 70 km/h, y ráfagas que pueden superar los 85 km/h. 
            Este fenómeno puede provocar reducción significativa de la visibilidad, aumento repentino de la temperatura y condiciones de extrema sequedad.
          </p>

          <div className={styles.alertBox}>
            <Clock size={16} />
            <span><strong>Clases Suspendidas:</strong> La Dirección de Protección Civil y el Ministerio de Educación informan la suspensión de actividades escolares presenciales en todos los turnos para el día de mañana en Chimbas.</span>
          </div>
        </div>

      </div>

      {/* PRONÓSTICO EXTENDIDO Y RECOMENDACIONES */}
      <div className={styles.bottomGrid} style={{ marginTop: '2.5rem' }}>
        
        {/* RECOMENDACIONES DE SEGURIDAD */}
        <div className={`${styles.recommendationsCard} glass`}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} style={{ color: 'var(--color-warning)' }} /> 
            Recomendaciones ante Viento Zonda
          </h3>
          <ul className={styles.recList}>
            {zondaRecommendations.map((rec, i) => (
              <li key={i} className={styles.recItem}>
                <span className={styles.recNumber}>{i + 1}</span>
                <p className={styles.recText}>{rec}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* PRONÓSTICO DE 5 DÍAS */}
        <div className={`${styles.forecastCard} glass`}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Pronóstico de 5 Días
          </h3>
          <div className={styles.forecastList}>
            {forecast.map((f, idx) => (
              <div key={idx} className={styles.forecastItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 120px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
                  <div>
                    <span style={{ fontWeight: 600, display: 'block' }}>{f.day}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.status}</span>
                  </div>
                </div>
                <div className={styles.forecastTemps}>
                  <span className={styles.maxTemp}>{f.tempMax}</span>
                  <span className={styles.minTemp}>{f.tempMin}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
