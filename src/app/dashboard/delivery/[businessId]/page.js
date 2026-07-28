'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bike,
  Check,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import ImageUploadField from '@/components/ImageUploadField';
import { db } from '@/lib/db';
import styles from './delivery-panel.module.css';

const STATUS_LABELS = {
  pending: 'Nuevo',
  accepted: 'Aceptado',
  preparing: 'Preparando',
  on_the_way: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const NEXT_STATUS = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['on_the_way', 'cancelled'],
  on_the_way: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const emptyItemForm = {
  name: '',
  description: '',
  price: '',
  category_id: '',
  image_url: '',
  is_available: true,
};

export default function DeliveryPanelPage({ params }) {
  const { businessId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState('orders');
  const [business, setBusiness] = useState(null);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [itemModal, setItemModal] = useState(null); // null | 'create' | item
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [config, setConfig] = useState({
    delivery_min_order: '0',
    delivery_fee: '0',
    delivery_eta_minutes: '45',
    delivery_zones: '',
    delivery_plan: 'active',
  });

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const biz = await db.getBusinessById(businessId);
      setBusiness(biz);
      setConfig({
        delivery_min_order: String(biz.delivery_min_order ?? 0),
        delivery_fee: String(biz.delivery_fee ?? 0),
        delivery_eta_minutes: String(biz.delivery_eta_minutes ?? 45),
        delivery_zones: biz.delivery_zones || '',
        delivery_plan: biz.delivery_plan === 'paused' ? 'paused' : biz.delivery_plan || 'active',
      });

      if (biz.delivery_enabled) {
        const [menu, orderList] = await Promise.all([
          db.getMenu(businessId),
          db.getOrdersForBusiness(businessId),
        ]);
        setCategories(menu.categories || []);
        setItems(menu.items || []);
        setOrders(orderList || []);
      }
    } catch (err) {
      console.error(err);
      showMsg('error', err.message || 'Error al cargar el panel');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/dashboard/delivery/${businessId}`);
      return;
    }
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadAll();
    }
  }, [authLoading, user, businessId, router, loadAll]);

  const handleStatus = async (orderId, status) => {
    try {
      await db.updateOrderStatus(orderId, businessId, status);
      showMsg('success', `Pedido → ${STATUS_LABELS[status]}`);
      loadAll();
    } catch (err) {
      showMsg('error', err.message || 'No se pudo actualizar el estado');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await db.createMenuCategory(businessId, { name: newCategory, sort_order: categories.length });
      setNewCategory('');
      showMsg('success', 'Categoría creada');
      loadAll();
    } catch (err) {
      showMsg('error', err.message || 'Error al crear categoría');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Borrar esta categoría?')) return;
    try {
      await db.deleteMenuCategory(id, businessId);
      showMsg('success', 'Categoría eliminada');
      loadAll();
    } catch (err) {
      showMsg('error', err.message || 'Error al borrar categoría');
    }
  };

  const openCreateItem = () => {
    setItemForm({
      ...emptyItemForm,
      category_id: categories[0]?.id || '',
    });
    setItemModal('create');
  };

  const openEditItem = (item) => {
    setItemForm({
      name: item.name || '',
      description: item.description || '',
      price: String(item.price ?? ''),
      category_id: item.category_id || '',
      image_url: item.image_url || '',
      is_available: item.is_available !== false,
    });
    setItemModal(item);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (itemModal === 'create') {
        await db.createMenuItem(businessId, itemForm);
        showMsg('success', 'Producto agregado');
      } else {
        await db.updateMenuItem(itemModal.id, businessId, itemForm);
        showMsg('success', 'Producto actualizado');
      }
      setItemModal(null);
      loadAll();
    } catch (err) {
      showMsg('error', err.message || 'Error al guardar producto');
    }
  };

  const handleToggleAvailable = async (item) => {
    try {
      await db.toggleItemAvailable(item.id, businessId, !item.is_available);
      loadAll();
    } catch (err) {
      showMsg('error', err.message || 'Error al cambiar disponibilidad');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('¿Borrar este producto?')) return;
    try {
      await db.deleteMenuItem(id, businessId);
      showMsg('success', 'Producto eliminado');
      loadAll();
    } catch (err) {
      showMsg('error', err.message || 'Error al borrar');
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      const updated = await db.updateDeliveryConfig(businessId, config);
      setBusiness(updated);
      showMsg('success', 'Configuración guardada');
    } catch (err) {
      showMsg('error', err.message || 'Error al guardar config');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Cargando panel de delivery…</h2>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Comercio no encontrado</h2>
        <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>Volver</Link>
      </div>
    );
  }

  if (!business.delivery_enabled) {
    return (
      <div className="container fade-in" style={{ padding: '3rem 0' }}>
        <Link href="/dashboard" className="btn btn-secondary" style={{ marginBottom: '1.5rem', gap: '0.35rem' }}>
          <ArrowLeft size={16} /> Panel
        </Link>
        <div className="modal-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <Bike size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Delivery no activado</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Pedile a El Chimbero que active el plan Delivery para <strong>{business.name}</strong>.
          </p>
        </div>
      </div>
    );
  }

  const openOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const closedOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  return (
    <div className="container fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ padding: '2rem 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <ArrowLeft size={14} /> Panel de control
          </Link>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bike style={{ color: 'var(--primary)' }} /> Delivery · {business.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Plan: <strong>{business.delivery_plan || '—'}</strong>
            {db.isDeliveryOpen(business) ? ' · Recibiendo pedidos' : ' · Pausado'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/guia/${businessId}/pedir`} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            Ver tienda
          </Link>
          <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem', gap: '0.35rem' }} onClick={loadAll}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.85rem 1rem',
            borderRadius: 8,
            background: message.type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(74,222,128,0.12)',
            color: message.type === 'error' ? '#f87171' : '#4ade80',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {message.text}
        </div>
      )}

      <div className={styles.tabs}>
        {[
          { id: 'orders', label: `Pedidos (${openOrders.length})` },
          { id: 'menu', label: `Carta (${items.length})` },
          { id: 'config', label: 'Configuración' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Cola activa</h2>
          {openOrders.length === 0 ? (
            <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No hay pedidos pendientes.
            </div>
          ) : (
            <div className={styles.orderBoard}>
              {openOrders.map((order) => (
                <div key={order.id} className={`modal-panel ${styles.orderCard}`}>
                  <div className={styles.orderHead}>
                    <div>
                      <strong>{order.customer_name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(order.created_at).toLocaleString('es-AR')}
                      </div>
                    </div>
                    <span className={styles.statusBadge}>{STATUS_LABELS[order.status]}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    📍 {order.customer_address}
                    {order.neighborhood ? ` (${order.neighborhood})` : ''}
                    <br />
                    📞 {order.customer_phone}
                    <br />
                    💳 {order.payment_method === 'transferencia' ? 'Transferencia' : 'Efectivo'}
                  </div>
                  <div className={styles.orderItems}>
                    {(order.items || []).map((i) => (
                      <div key={i.id || `${i.name}-${i.qty}`}>
                        {i.qty}x {i.name} — ${(i.unit_price * i.qty).toLocaleString('es-AR')}
                      </div>
                    ))}
                    {order.notes ? <em>Notas: {order.notes}</em> : null}
                    <strong style={{ color: 'var(--primary)', marginTop: 4 }}>
                      Total ${Number(order.total).toLocaleString('es-AR')}
                    </strong>
                  </div>
                  <div className={styles.actions}>
                    {(NEXT_STATUS[order.status] || []).map((st) => (
                      <button
                        key={st}
                        type="button"
                        className="btn btn-primary"
                        style={{
                          padding: '0.4rem 0.7rem',
                          fontSize: '0.75rem',
                          background: st === 'cancelled' ? 'var(--color-closed)' : undefined,
                          boxShadow: 'none',
                        }}
                        onClick={() => handleStatus(order.id, st)}
                      >
                        {STATUS_LABELS[st]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {closedOrders.length > 0 && (
            <>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '2rem 0 1rem' }}>Historial reciente</h2>
              <div className={styles.orderBoard}>
                {closedOrders.slice(0, 12).map((order) => (
                  <div key={order.id} className={`glass ${styles.orderCard}`} style={{ opacity: 0.85 }}>
                    <div className={styles.orderHead}>
                      <strong>{order.customer_name}</strong>
                      <span className={styles.statusBadge}>{STATUS_LABELS[order.status]}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      ${Number(order.total).toLocaleString('es-AR')} · {new Date(order.created_at).toLocaleString('es-AR')}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'menu' && (
        <div>
          <div className={styles.menuToolbar}>
            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nueva categoría (ej: Pizzas)"
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 8,
                  border: '1px solid var(--border-glass)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  minWidth: 220,
                }}
              />
              <button type="submit" className="btn btn-secondary" style={{ gap: '0.35rem', fontSize: '0.85rem' }}>
                <Plus size={14} /> Categoría
              </button>
            </form>
            <button type="button" className="btn btn-primary" style={{ gap: '0.35rem', fontSize: '0.85rem' }} onClick={openCreateItem}>
              <Plus size={14} /> Producto
            </button>
          </div>

          {categories.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-glass)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {cat.name}
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0 }}
                    title="Borrar categoría"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {items.length === 0 ? (
            <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Todavía no cargaste productos. Creá una categoría y sumá tu carta.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className={`glass ${styles.menuItem}`}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className={styles.menuThumb} />
                ) : (
                  <div className={styles.menuThumb} />
                )}
                <div style={{ flex: 1 }}>
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    ${Number(item.price).toLocaleString('es-AR')}
                    {!item.is_available ? ' · Agotado' : ''}
                    {item.category_id
                      ? ` · ${categories.find((c) => c.id === item.category_id)?.name || ''}`
                      : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.65rem' }} onClick={() => handleToggleAvailable(item)}>
                    {item.is_available ? 'Pausar' : 'Activar'}
                  </button>
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.65rem' }} onClick={() => openEditItem(item)}>
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.65rem', background: 'var(--color-closed)', boxShadow: 'none' }}
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'config' && (
        <form className={`modal-panel ${styles.configForm}`} style={{ padding: '1.75rem' }} onSubmit={handleSaveConfig}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Configuración de delivery</h2>
          <div className={styles.field}>
            <label>Pedido mínimo ($)</label>
            <input
              type="number"
              min="0"
              value={config.delivery_min_order}
              onChange={(e) => setConfig({ ...config, delivery_min_order: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label>Costo de envío ($)</label>
            <input
              type="number"
              min="0"
              value={config.delivery_fee}
              onChange={(e) => setConfig({ ...config, delivery_fee: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label>Tiempo estimado (minutos)</label>
            <input
              type="number"
              min="10"
              value={config.delivery_eta_minutes}
              onChange={(e) => setConfig({ ...config, delivery_eta_minutes: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label>Zonas de entrega</label>
            <textarea
              rows={2}
              value={config.delivery_zones}
              onChange={(e) => setConfig({ ...config, delivery_zones: e.target.value })}
              placeholder="Villa Paula, Chimbas Centro, …"
            />
          </div>
          <div className={styles.field}>
            <label>Estado de recepción</label>
            <select
              value={config.delivery_plan === 'paused' ? 'paused' : 'active'}
              onChange={(e) =>
                setConfig({
                  ...config,
                  delivery_plan: e.target.value === 'paused' ? 'paused' : (business.delivery_plan === 'trial' ? 'trial' : 'active'),
                })
              }
            >
              <option value="active">Recibiendo pedidos</option>
              <option value="paused">Pausado (no reciben pedidos)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ fontWeight: 700, gap: '0.35rem' }}>
            <Check size={16} /> Guardar configuración
          </button>
        </form>
      )}

      {itemModal && (
        <div className={styles.modalOverlay} onClick={() => setItemModal(null)}>
          <div className={`modal-panel ${styles.modalBody}`} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.35rem' }}>
                {itemModal === 'create' ? 'Nuevo producto' : 'Editar producto'}
              </h2>
              <button type="button" onClick={() => setItemModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className={styles.field}>
                <label>Nombre *</label>
                <input required value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label>Descripción</label>
                <textarea rows={2} value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label>Precio *</label>
                <input required type="number" min="0" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label>Categoría</label>
                <select value={itemForm.category_id} onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}>
                  <option value="">Sin categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <ImageUploadField
                label="Foto del producto"
                folder="menu"
                value={itemForm.image_url}
                onChange={(url) => setItemForm({ ...itemForm, image_url: url })}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={itemForm.is_available}
                  onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                />
                Disponible para pedir
              </label>
              <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
