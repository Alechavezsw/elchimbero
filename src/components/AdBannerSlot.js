'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';

export default function AdBannerSlot({ placement = 'home_mid', style }) {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    let active = true;
    db.getActiveBanners(placement)
      .then((data) => {
        if (active) setBanners(data || []);
      })
      .catch(() => {
        if (active) setBanners([]);
      });
    return () => {
      active = false;
    };
  }, [placement]);

  if (!banners.length) return null;

  return (
    <section style={{ margin: '1.5rem 0', ...style }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {banners.map((b) => {
          const inner = (
            <img
              src={b.image_url}
              alt={b.title}
              style={{
                width: '100%',
                maxHeight: 140,
                objectFit: 'cover',
                borderRadius: 12,
                border: '1px solid var(--border-glass)',
                display: 'block',
              }}
            />
          );
          return b.link_url ? (
            <a
              key={b.id}
              href={b.link_url}
              target="_blank"
              rel="noopener noreferrer"
              title={b.title}
              style={{ display: 'block' }}
            >
              {inner}
            </a>
          ) : (
            <div key={b.id} title={b.title}>{inner}</div>
          );
        })}
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right', margin: 0 }}>
          Publicidad · El Chimbero
        </p>
      </div>
    </section>
  );
}
