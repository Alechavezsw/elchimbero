'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bike, Minus, Plus, ShoppingBag } from 'lucide-react';
import { db } from '@/lib/db';
import styles from './pedir.module.css';

export default function PedirDeliveryPage({ params }) {
  const { id } = use(params);
  const [business, setBusiness] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [doneOrder, setDoneOrder] = useState(null);
  const [checkout, setCheckout] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    neighborhood: '',
    payment_method: 'efectivo',
    notes: '',
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const biz = await db.getBusinessById(id);
        if (!active) return;
        setBusiness(biz);
        if (db.isDeliveryOpen(biz)) {
          const menu = await db.getMenu(id);
          if (!active) return;
          setCategories(menu.categories || []);
          setItems(menu.items || []);
        }
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la tienda.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const cartLines = useMemo(() => {
    return Object.values(cart).filter((l) => l.qty > 0);
  }, [cart]);

  const subtotal = cartLines.reduce((s, l) => s + l.unit_price * l.qty, 0);
  const deliveryFee = parseFloat(business?.delivery_fee) || 0;
  const minOrder = parseFloat(business?.delivery_min_order) || 0;
  const total = subtotal + (cartLines.length ? deliveryFee : 0);

  const addItem = (item) => {
    setCart((prev) => {
      const existing = prev[item.id];
      const qty = (existing?.qty || 0) + 1;
      return {
        ...prev,
        [item.id]: {
          menu_item_id: item.id,
          name: item.name,
          unit_price: parseFloat(item.price) || 0,
          qty,
        },
      };
    });
  };

  const changeQty = (itemId, delta) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      const qty = existing.qty + delta;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: { ...existing, qty } };
    });
  };

  const grouped = useMemo(() => {
    const activeCats = (categories || []).filter((c) => c.is_active !== false);
    const available = (items || []).filter((i) => i.is_available !== false);
    const byCat = activeCats.map((cat) => ({
      category: cat,
      items: available.filter((i) => i.category_id === cat.id),
    })).filter((g) => g.items.length > 0);

    const uncategorized = available.filter(
      (i) => !i.category_id || !activeCats.some((c) => c.id === i.category_id)
    );
    if (uncategorized.length) {
      byCat.push({ category: { id: 'otros', name: 'Otros' }, items: uncategorized });
    }
    return byCat;
  }, [categories, items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!cartLines.length) {
      setError('Agregá al menos un producto al carrito.');
      return;
    }
    if (subtotal < minOrder) {
      setError(`El pedido mínimo es $${minOrder.toLocaleString('es-AR')}.`);
      return;
    }
    setSubmitting(true);
    try {
      const order = await db.createOrder({
        business_id: id,
        ...checkout,
        items: cartLines,
      });
      setDoneOrder(order);
      const wa = db.buildOrderWhatsAppUrl(order);
      if (wa) window.open(wa, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error(err);
      setError(err.message || 'No se pudo crear el pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Cargando carta…</h2>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Comercio no encontrado</h2>
        <Link href="/delivery" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Volver a Delivery
        </Link>
      </div>
    );
  }

  if (!db.isDeliveryOpen(business)) {
    return (
      <div className="container fade-in">
        <Link href={`/guia/${id}`} className={styles.backLink}>
          <ArrowLeft size={16} /> Volver a la ficha
        </Link>
        <div className={`glass ${styles.unavailable}`}>
          <Bike size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Delivery no disponible</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Este comercio no está recibiendo pedidos por Delivery Chimbero en este momento.
          </p>
          <Link href={`/guia/${id}`} className="btn btn-secondary" style={{ marginTop: '1.25rem' }}>
            Ver ficha del comercio
          </Link>
        </div>
      </div>
    );
  }

  if (doneOrder) {
    return (
      <div className="container fade-in" style={{ padding: '3rem 0' }}>
        <div className={`modal-panel ${styles.successBox}`}>
          <h2 className="gradient-text" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            ¡Pedido enviado!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            El comercio recibió tu pedido{business.whatsapp ? ' (también se abrió WhatsApp con el detalle)' : ''}.
            Total: <strong>${Number(doneOrder.total).toLocaleString('es-AR')}</strong>
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/delivery" className="btn btn-primary">Seguir pidiendo</Link>
            <Link href={`/guia/${id}`} className="btn btn-secondary">Volver a la ficha</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      <Link href={`/guia/${id}`} className={styles.backLink}>
        <ArrowLeft size={16} /> Volver a {business.name}
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <Bike size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: 'var(--primary)' }} />
          Pedir en {business.name}
        </h1>
        <p className={styles.meta}>
          ~{business.delivery_eta_minutes || 45} min · Envío ${deliveryFee.toLocaleString('es-AR')}
          {minOrder > 0 ? ` · Mínimo $${minOrder.toLocaleString('es-AR')}` : ''}
          {business.delivery_zones ? ` · Zonas: ${business.delivery_zones}` : ''}
        </p>
      </header>

      <div className={styles.layout}>
        <section>
          {grouped.length === 0 ? (
            <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Este comercio todavía no cargó su carta.
            </div>
          ) : (
            grouped.map(({ category, items: catItems }) => (
              <div key={category.id} className={styles.categoryBlock}>
                <h2 className={styles.categoryTitle}>{category.name}</h2>
                <div className={styles.itemGrid}>
                  {catItems.map((item) => (
                    <div key={item.id} className={`glass ${styles.item}`}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className={styles.itemImg} />
                      ) : (
                        <div className={styles.itemImg} />
                      )}
                      <div className={styles.itemBody}>
                        <div className={styles.itemName}>{item.name}</div>
                        {item.description ? <div className={styles.itemDesc}>{item.description}</div> : null}
                        <div className={styles.itemPrice}>
                          ${Number(item.price || 0).toLocaleString('es-AR')}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`btn btn-primary ${styles.addBtn}`}
                        style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', gap: '0.25rem' }}
                        onClick={() => addItem(item)}
                      >
                        <Plus size={14} /> Agregar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        <aside className={styles.cartAside}>
          <div className={`modal-panel ${styles.cartPanel}`}>
            <h3 className={styles.cartTitle}>
              <ShoppingBag size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
              Tu pedido
            </h3>

            {cartLines.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>El carrito está vacío.</p>
            ) : (
              cartLines.map((line) => (
                <div key={line.menu_item_id} className={styles.cartLine}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{line.name}</div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      ${line.unit_price.toLocaleString('es-AR')} c/u
                    </div>
                  </div>
                  <div className={styles.qtyControls}>
                    <button type="button" className={styles.qtyBtn} onClick={() => changeQty(line.menu_item_id, -1)}>
                      <Minus size={12} />
                    </button>
                    <span style={{ fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{line.qty}</span>
                    <button type="button" className={styles.qtyBtn} onClick={() => changeQty(line.menu_item_id, 1)}>
                      <Plus size={12} />
                    </button>
                  </div>
                  <strong>${(line.unit_price * line.qty).toLocaleString('es-AR')}</strong>
                </div>
              ))
            )}

            <div className={styles.totals}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-AR')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Envío</span>
                <span>${cartLines.length ? deliveryFee.toLocaleString('es-AR') : '0'}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Total</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label>Nombre *</label>
                <input
                  required
                  value={checkout.customer_name}
                  onChange={(e) => setCheckout({ ...checkout, customer_name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>
              <div className={styles.field}>
                <label>WhatsApp / Teléfono *</label>
                <input
                  required
                  value={checkout.customer_phone}
                  onChange={(e) => setCheckout({ ...checkout, customer_phone: e.target.value })}
                  placeholder="2645123456"
                />
              </div>
              <div className={styles.field}>
                <label>Dirección de entrega *</label>
                <input
                  required
                  value={checkout.customer_address}
                  onChange={(e) => setCheckout({ ...checkout, customer_address: e.target.value })}
                  placeholder="Calle y número"
                />
              </div>
              <div className={styles.field}>
                <label>Barrio</label>
                <input
                  value={checkout.neighborhood}
                  onChange={(e) => setCheckout({ ...checkout, neighborhood: e.target.value })}
                  placeholder="Ej: Villa Paula"
                />
              </div>
              <div className={styles.field}>
                <label>Forma de pago *</label>
                <select
                  value={checkout.payment_method}
                  onChange={(e) => setCheckout({ ...checkout, payment_method: e.target.value })}
                >
                  <option value="efectivo">Efectivo al recibir</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Notas</label>
                <textarea
                  rows={2}
                  value={checkout.notes}
                  onChange={(e) => setCheckout({ ...checkout, notes: e.target.value })}
                  placeholder="Sin cebolla, timbre, etc."
                />
              </div>

              {error ? <p className={styles.error}>{error}</p> : null}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !cartLines.length}
                style={{ width: '100%', fontWeight: 700, marginTop: '0.25rem' }}
              >
                {submitting ? 'Enviando…' : 'Confirmar pedido'}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
