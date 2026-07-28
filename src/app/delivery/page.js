'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bike, Clock, MapPin } from 'lucide-react';
import { db } from '@/lib/db';
import styles from './delivery.module.css';

export default function DeliveryDirectoryPage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await db.getDeliveryBusinesses();
        if (active) setBusinesses(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="container fade-in">
      <header className={styles.hero}>
        <h1 className={`${styles.heroTitle} gradient-text`}>
          <Bike size={32} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
          Delivery Chimbero
        </h1>
        <p className={styles.heroSub}>
          Pedí a comercios de Chimbas con carta digital. Pagás al recibir en efectivo o transferencia.
        </p>
      </header>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', padding: '2rem 0' }}>Cargando comercios con delivery…</p>
      ) : businesses.length === 0 ? (
        <div className={`glass ${styles.empty}`}>
          <h3>Todavía no hay comercios con delivery activo</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Pronto vas a poder pedir desde acá. Mientras tanto explorá la{' '}
            <Link href="/guia" style={{ color: 'var(--primary)', fontWeight: 700 }}>Guía Comercial</Link>.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {businesses.map((biz) => (
            <Link key={biz.id} href={`/guia/${biz.id}/pedir`} className={`glass ${styles.card}`}>
              <img
                src={biz.image_url || '/logo-el-chimbero.png'}
                alt={biz.name}
                className={styles.cardImg}
              />
              <div className={styles.cardBody}>
                <h2 className={styles.cardName}>{biz.name}</h2>
                <p className={styles.cardMeta}>
                  <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
                  {biz.neighborhood} · {biz.category}
                </p>
                <div className={styles.badgeRow}>
                  <span className={styles.pill}>
                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                    ~{biz.delivery_eta_minutes || 45} min
                  </span>
                  <span className={styles.pill}>
                    Envío ${Number(biz.delivery_fee || 0).toLocaleString('es-AR')}
                  </span>
                  {Number(biz.delivery_min_order) > 0 && (
                    <span className={styles.pill}>
                      Mín. ${Number(biz.delivery_min_order).toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
