'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { db } from '@/lib/db';
import styles from './detail.module.css';
import { ArrowLeft, MapPin, Phone, MessageCircle, Clock, Calendar, User, Store } from 'lucide-react';

// Cargar el mapa de forma dinámica (solo en cliente) para evitar errores de SSR
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

export default function BusinessDetail({ params }) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusiness() {
      try {
        const resolvedParams = await params;
        const data = await db.getBusinessById(resolvedParams.id);
        setBusiness(data);
      } catch (error) {
        console.error('Error al cargar comercio:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, [params]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cargando Ficha Comercial...</h2>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <Store size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Comercio no encontrado</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>El comercio que estás buscando no existe o fue dado de baja.</p>
        <Link href="/guia" className="btn btn-primary">
          Volver a la Guía Comercial
        </Link>
      </div>
    );
  }

  // Preparar coordenadas para el mapa
  const mapPoints = [
    {
      latitude: business.latitude,
      longitude: business.longitude,
      name: business.name,
      address: business.address,
      phone: business.phone,
      type: 'business'
    }
  ];

  // Formatear los horarios para mostrarlos de forma elegante
  const formatHours = (hoursObj) => {
    if (!hoursObj || typeof hoursObj !== 'object') {
      return [{ day: 'Lunes a Sábado', time: 'Consultar Horarios' }];
    }
    
    return Object.entries(hoursObj).map(([key, val]) => {
      // Reemplazar guiones bajos por espacios y capitalizar
      const day = key.replace(/_/g, ' ');
      return { day, time: val };
    });
  };

  const hoursList = formatHours(business.hours);

  return (
    <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
      
      {/* BOTÓN VOLVER */}
      <Link href="/guia" className={styles.backLink}>
        <ArrowLeft size={16} /> Volver al Directorio
      </Link>

      <div className={styles.mainGrid}>
        
        {/* COLUMNA IZQUIERDA: INFORMACIÓN PRINCIPAL */}
        <div className={`${styles.profileCard} glass`}>
          <div className={styles.imageBanner}>
            <img 
              src={business.image_url} 
              alt={business.name}
            />
            <span className={`${styles.categoryBadge} badge badge-open`}>
              {business.category}
            </span>
          </div>

          <div className={styles.profileInfo}>
            <h1 className={styles.businessName}>{business.name}</h1>
            
            <div className={styles.addressRow}>
              <MapPin size={18} style={{ color: 'var(--secondary)' }} />
              <span>{business.neighborhood} - {business.address}</span>
            </div>

            {/* BOTONES DE ACCIÓN RÁPIDA */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              {business.whatsapp && (
                <a 
                  href={`https://wa.me/${business.whatsapp}?text=Hola!%20Vi%20tu%20comercio%20"${encodeURIComponent(business.name)}"%20en%20El%20Chimbero.%20Te%20quería%20hacer%20una%20consulta.`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-teal"
                  style={{ gap: '0.5rem', flex: 1, minWidth: '180px' }}
                >
                  <MessageCircle size={20} />
                  Enviar WhatsApp
                </a>
              )}
              {business.phone && (
                <a 
                  href={`tel:${business.phone}`} 
                  className="btn btn-secondary"
                  style={{ gap: '0.5rem', flex: 1, minWidth: '180px' }}
                >
                  <Phone size={20} />
                  Llamar por Teléfono
                </a>
              )}
            </div>

            {/* SECCIÓN DESCRIPCIÓN */}
            <div className={styles.descriptionSection}>
              <h3 className={styles.sectionTitle}>Sobre Nosotros</h3>
              <p className={styles.descriptionText}>{business.description || 'Sin descripción disponible.'}</p>
            </div>

            {/* INFORMACIÓN DE CONTACTO DETALLADA */}
            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)' }}>
              <h3 className={styles.sectionTitle}>Detalles de Contacto</h3>
              <div className={styles.contactGrid}>
                
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Dirección</span>
                  <span className={styles.contactValue}>{business.address}</span>
                </div>

                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Barrio</span>
                  <span className={styles.contactValue}>{business.neighborhood}</span>
                </div>

                {business.phone && (
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>Teléfono</span>
                    <span className={styles.contactValue}>{business.phone}</span>
                  </div>
                )}

                {business.whatsapp && (
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>WhatsApp</span>
                    <span className={styles.contactValue}>{business.whatsapp}</span>
                  </div>
                )}

              </div>
            </div>
            
            {/* PROPIETARIO */}
            {business.profiles && (
              <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <User size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Comercio administrado por: <strong style={{ color: 'var(--text-primary)' }}>{business.profiles.full_name}</strong>
                </span>
              </div>
            )}

          </div>
        </div>

        {/* COLUMNA DERECHA: SIDEBAR CON MAPA Y HORARIOS */}
        <aside className={styles.sidebar}>
          
          {/* HORARIOS */}
          <div className={`${styles.hoursCard} glass`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Clock size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Horarios de Atención</h3>
            </div>
            
            <ul className={styles.hoursList}>
              {hoursList.map((item, idx) => (
                <li key={idx} className={styles.hoursItem}>
                  <span className={styles.dayName}>{item.day}</span>
                  <span className={styles.dayTime}>{item.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* MAPA */}
          <div className={`${styles.mapCard} glass`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <MapPin size={20} style={{ color: 'var(--secondary)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Ubicación</h3>
            </div>
            
            <div className={styles.mapWrapper}>
              <Map 
                points={mapPoints} 
                center={[business.latitude, business.longitude]} 
                zoom={15} 
              />
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
