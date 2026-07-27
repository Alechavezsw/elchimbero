'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  ArrowLeft,
  Clock,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import styles from './clima.module.css';

const FALLBACK_RECS = [
  'Seguí las actualizaciones del Servicio Meteorológico Nacional y Protección Civil.',
  'Asegurá objetos sueltos que puedan ser arrastrados por el viento.',
  'Evitá salir si las condiciones son adversas.',
  'Conducí con precaución y luces encendidas si hay polvo en suspensión.',
  'No enciendas fuego al aire libre con viento fuerte o alerta de Zonda.',
];

export default function ClimaPage() {
  const [currentDate, setCurrentDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('es-AR', options));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/weather');
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'No se pudo cargar el clima');
        }
        if (cancelled) return;
        setWeather(json.weather);
        setAlerts(json.alerts || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Error al cargar clima');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const primaryAlert = alerts[0] || null;
  const recommendations =
    primaryAlert?.recommendations?.length > 0
      ? primaryAlert.recommendations
      : FALLBACK_RECS;

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-warning" style={{ marginBottom: '0.5rem' }}>Monitoreo Climático</span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="gradient-text">Clima y Alertas de Chimbas</h1>
        <p style={{ color: 'var(--text-secondary)', textTransform: 'capitalize', marginTop: '0.25rem' }}>
          📍 Chimbas, San Juan | {currentDate}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
          Clima: Open-Meteo · Alertas: Servicio Meteorológico Nacional (SMN)
        </p>
      </div>

      {loading && (
        <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando datos meteorológicos reales…
        </div>
      )}

      {error && !loading && (
        <div className="glass" style={{ padding: '1.25rem', borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
          <strong>No se pudo actualizar el clima.</strong>
          <p style={{ marginTop: '0.35rem', color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      )}

      {!loading && weather && (
        <>
          <div className={styles.gridContainer}>
            <div className={`${styles.currentWeatherCard} glass`}>
              <div className={styles.currentHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Estado Actual</h2>
                  <p className={styles.subtitle}>
                    Actualizado {weather.updatedAt
                      ? new Date(weather.updatedAt).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
                      : 'hace unos minutos'}
                  </p>
                </div>
                <span className={styles.mainIcon}>{weather.icon}</span>
              </div>

              <div className={styles.tempArea}>
                <span className={styles.temperature}>{weather.temp}°C</span>
                <div className={styles.statusBadge}>
                  <span className={styles.statusText}>{weather.status}</span>
                </div>
              </div>

              <div className={styles.weatherMetrics}>
                <div className={styles.metricItem}>
                  <Wind size={20} style={{ color: 'var(--primary)' }} />
                  <div>
                    <span className={styles.metricLabel}>Viento</span>
                    <span className={styles.metricValue}>
                      {weather.windDirection} a {weather.windSpeed} km/h
                      {weather.windGusts ? ` (ráfagas ${weather.windGusts} km/h)` : ''}
                    </span>
                  </div>
                </div>

                <div className={styles.metricItem}>
                  <Droplets size={20} style={{ color: 'var(--secondary)' }} />
                  <div>
                    <span className={styles.metricLabel}>Humedad</span>
                    <span className={styles.metricValue}>{weather.humidity}%</span>
                  </div>
                </div>

                <div className={styles.metricItem}>
                  <Thermometer size={20} style={{ color: 'var(--color-warning)' }} />
                  <div>
                    <span className={styles.metricLabel}>Sensación térmica</span>
                    <span className={styles.metricValue}>{weather.feelsLike}°C</span>
                  </div>
                </div>
              </div>
            </div>

            {primaryAlert ? (
              <div
                className={`${styles.alertCard} glass`}
                style={{
                  background: primaryAlert.colors?.bg,
                  borderColor: primaryAlert.colors?.border,
                }}
              >
                <div className={styles.alertHeader}>
                  <AlertTriangle size={28} className="urgency-pulse" style={{ color: primaryAlert.colors?.color }} />
                  <div>
                    <h2 className={styles.alertTitle} style={{ color: primaryAlert.colors?.color }}>
                      Alerta {primaryAlert.severityLabel}: {primaryAlert.event}
                    </h2>
                    <p className={styles.alertScope}>Validez: {primaryAlert.validity}</p>
                  </div>
                </div>

                <p className={styles.alertDescription}>{primaryAlert.description}</p>

                <div className={styles.alertBox}>
                  <Clock size={16} />
                  <span>
                    <strong>Fuente SMN.</strong> Cobertura confirmada para el área de Chimbas.
                  </span>
                </div>

                {primaryAlert.sourceUrl && (
                  <a
                    href={primaryAlert.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ marginTop: '1rem', display: 'inline-flex', fontSize: '0.85rem' }}
                  >
                    Ver aviso oficial <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ) : (
              <div className={`${styles.alertCard} glass`}>
                <div className={styles.alertHeader}>
                  <CloudSun size={28} style={{ color: 'var(--color-open)' }} />
                  <div>
                    <h2 className={styles.alertTitle} style={{ color: 'var(--color-open)' }}>
                      Sin alertas activas para Chimbas
                    </h2>
                    <p className={styles.alertScope}>Consultamos el feed CAP del SMN</p>
                  </div>
                </div>
                <p className={styles.alertDescription}>
                  No hay avisos meteorológicos vigentes que cubran Chimbas en este momento.
                  El banner de inicio solo aparece cuando el SMN publica una alerta real para la zona.
                </p>
              </div>
            )}
          </div>

          {alerts.length > 1 && (
            <div className="glass" style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Otras alertas que afectan Chimbas</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', listStyle: 'none' }}>
                {alerts.slice(1).map((alert) => (
                  <li key={`${alert.event}-${alert.onset}-${alert.expires}`} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <strong style={{ color: alert.colors?.color }}>{alert.severityLabel}</strong> · {alert.event} — {alert.validity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.bottomGrid} style={{ marginTop: '2.5rem' }}>
            <div className={`${styles.recommendationsCard} glass`}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} style={{ color: 'var(--color-warning)' }} />
                {primaryAlert ? `Recomendaciones — ${primaryAlert.event}` : 'Recomendaciones generales'}
              </h3>
              <ul className={styles.recList}>
                {recommendations.map((rec, i) => (
                  <li key={i} className={styles.recItem}>
                    <span className={styles.recNumber}>{i + 1}</span>
                    <p className={styles.recText}>{rec}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`${styles.forecastCard} glass`}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Pronóstico de 5 Días
              </h3>
              <div className={styles.forecastList}>
                {(weather.forecast || []).map((f) => (
                  <div key={f.date} className={styles.forecastItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 120px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
                      <div>
                        <span style={{ fontWeight: 600, display: 'block' }}>{f.day}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {f.status}
                          {f.gustMax ? ` · ráfagas ${f.gustMax} km/h` : ''}
                        </span>
                      </div>
                    </div>
                    <div className={styles.forecastTemps}>
                      <span className={styles.maxTemp}>{f.tempMax}°C</span>
                      <span className={styles.minTemp}>{f.tempMin}°C</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
