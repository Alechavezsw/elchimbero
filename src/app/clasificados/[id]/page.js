'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import styles from './detail.module.css';
import { ArrowLeft, Tag, MessageCircle, Phone, AlertOctagon, User, Calendar, ShieldCheck } from 'lucide-react';

export default function ClassifiedDetail({ params }) {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAd() {
      try {
        const resolvedParams = await params;
        const data = await db.getClassifiedById(resolvedParams.id);
        setAd(data);
      } catch (error) {
        console.error('Error al obtener clasificado:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAd();
  }, [params]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cargando detalles del clasificado...</h2>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <Tag size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Anuncio no encontrado</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>El anuncio que buscas no existe o fue retirado por su vendedor.</p>
        <Link href="/clasificados" className="btn btn-primary">
          Volver a Clasificados
        </Link>
      </div>
    );
  }

  const getCategoryLabel = (val) => {
    if (val === 'sale') return 'Venta';
    if (val === 'rent') return 'Alquiler';
    if (val === 'service') return 'Servicio';
    if (val === 'job') return 'Búsqueda Laboral';
    return 'Otros';
  };

  const getConditionLabel = (val) => {
    if (val === 'new') return 'Nuevo';
    if (val === 'used') return 'Usado';
    return 'No Aplica';
  };

  const formattedDate = new Date(ad.created_at).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
      
      {/* BOTÓN VOLVER */}
      <Link href="/clasificados" className={styles.backLink}>
        <ArrowLeft size={16} /> Volver a Clasificados
      </Link>

      <div className={styles.grid}>
        
        {/* COLUMNA IZQUIERDA: DETALLE DEL ANUNCIO */}
        <div className={`${styles.adCard} glass`}>
          <div className={styles.imageWrapper}>
            <img 
              src={ad.image_url} 
              alt={ad.title} 
            />
          </div>

          <div className={styles.adInfo}>
            <span className={styles.category}>{getCategoryLabel(ad.category)}</span>
            <h1 className={styles.title}>{ad.title}</h1>
            
            <div className={styles.price}>
              {ad.price > 0 ? `$${ad.price.toLocaleString('es-AR')}` : 'Precio a Consultar'}
            </div>

            {/* CONDICIONES */}
            <div className={styles.conditionRow}>
              <div className={styles.conditionItem}>
                <span className={styles.label}>Estado del producto</span>
                <span className={styles.value}>{getConditionLabel(ad.condition)}</span>
              </div>
              <div className={styles.conditionItem}>
                <span className={styles.label}>Publicado el</span>
                <span className={styles.value}>{formattedDate}</span>
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div className={styles.descriptionSection}>
              <h3 className={styles.sectionTitle}>Descripción de la publicación</h3>
              <p className={styles.description}>{ad.description}</p>
            </div>

          </div>
        </div>

        {/* COLUMNA DERECHA: SIDEBAR VENDEDOR Y SEGURIDAD */}
        <aside className={styles.sidebar}>
          
          {/* TARJETA VENDEDOR */}
          <div className={`${styles.sellerCard} glass`}>
            <div className={styles.sellerHeader}>
              <div className={styles.avatar}>
                {ad.profiles?.avatar_url ? (
                  <img src={ad.profiles.avatar_url} alt={ad.profiles.full_name} />
                ) : (
                  ad.profiles?.full_name?.charAt(0) || 'U'
                )}
              </div>
              <div>
                <span className={styles.sellerMuted}>Vendedor</span>
                <h4 className={styles.sellerName}>{ad.profiles?.full_name || 'Vecino de Chimbas'}</h4>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {ad.whatsapp && (
                <a 
                  href={`https://wa.me/${ad.whatsapp}?text=Hola!%20Vi%20tu%20anuncio%20de%20"${encodeURIComponent(ad.title)}"%20en%20El%20Chimbero.%20Sigue%20disponible?`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-teal"
                  style={{ gap: '0.5rem', background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', boxShadow: '0 4px 14px rgba(236, 72, 153, 0.3)' }}
                >
                  <MessageCircle size={18} />
                  Contactar por WhatsApp
                </a>
              )}
              
              {ad.profiles?.phone && (
                <a 
                  href={`tel:${ad.profiles.phone}`} 
                  className="btn btn-secondary"
                  style={{ gap: '0.5rem' }}
                >
                  <Phone size={18} />
                  Llamar al vendedor ({ad.profiles.phone})
                </a>
              )}
            </div>
          </div>

          {/* ADVERTENCIA DE SEGURIDAD */}
          <div className={`${styles.warningCard} glass`}>
            <div className={styles.warningHeader}>
              <AlertOctagon size={18} />
              Consejos de Seguridad
            </div>
            <ul className={styles.warningList}>
              <li className={styles.warningItem}>
                <strong>Nunca transfieras dinero</strong> por adelantado sin haber visto el producto en persona.
              </li>
              <li className={styles.warningItem}>
                Pactá el punto de encuentro en un <strong>lugar público y transitado</strong> (ej: Plaza de Chimbas, frente a la Comisaría, etc.).
              </li>
              <li className={styles.warningItem}>
                Revisá el estado y funcionamiento del producto antes de pagarlo.
              </li>
              <li className={styles.warningItem}>
                Sospechá de precios excesivamente bajos o promesas dudosas.
              </li>
            </ul>
          </div>

        </aside>

      </div>
    </div>
  );
}
