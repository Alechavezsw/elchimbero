'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Calculator,
  Check,
  ImagePlus,
  Plus,
  RefreshCw,
  Trash2,
  Wallet,
} from 'lucide-react';
import ImageUploadField from '@/components/ImageUploadField';
import { db } from '@/lib/db';

const PRODUCT_ICONS = {
  guia_comercial: '🏪',
  delivery: '🛵',
  farmacia_turno: '💊',
  kiosco_abierto: '🌙',
  turnos: '📅',
  banner: '📢',
  clasificado_destacado: '⭐',
};

const money = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`;

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const due = new Date(`${dateStr}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((due - today) / (24 * 60 * 60 * 1000));
}

function dueLabel(dateStr) {
  const d = daysUntil(dateStr);
  if (d == null) return 'Sin fecha';
  if (d < 0) return `Vencido hace ${Math.abs(d)} día${Math.abs(d) === 1 ? '' : 's'}`;
  if (d === 0) return 'Vence hoy';
  if (d === 1) return 'Vence mañana';
  return `Vence en ${d} días`;
}

export default function ContaduriaTab({ businesses = [], onFeedback, onAlertCount }) {
  const [subTab, setSubTab] = useState('resumen');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [charges, setCharges] = useState([]);
  const [banners, setBanners] = useState([]);

  const [clientForm, setClientForm] = useState({ name: '', phone: '', whatsapp: '', email: '', business_id: '', notes: '' });
  const [enrollForm, setEnrollForm] = useState({
    product_code: 'guia_comercial',
    business_id: '',
    client_name: '',
    client_phone: '',
    amount: '',
  });
  const [bannerForm, setBannerForm] = useState({
    title: '',
    image_url: '',
    link_url: '',
    placement: 'home_mid',
    client_id: '',
    is_active: true,
  });
  const [showBannerModal, setShowBannerModal] = useState(false);

  const notify = (type, text) => onFeedback?.(type, text);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sum, prods, cls, subs, chs, bans] = await Promise.all([
        db.getBillingSummary(),
        db.getBillingProducts(),
        db.getBillingClients(),
        db.getBillingSubscriptions(),
        db.getBillingCharges(),
        db.getAllBannersAdmin(),
      ]);
      setSummary(sum);
      setProducts(prods);
      setClients(cls);
      setSubscriptions(subs);
      setCharges(chs);
      setBanners(bans);
      onAlertCount?.(Number(sum.overdue_count || 0) + Number(sum.due_soon_count || 0));
    } catch (err) {
      console.error(err);
      onFeedback?.('error', err.message || 'Error al cargar contaduría');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await db.createBillingClient({
        ...clientForm,
        business_id: clientForm.business_id || null,
      });
      setClientForm({ name: '', phone: '', whatsapp: '', email: '', business_id: '', notes: '' });
      notify('success', 'Cliente creado');
      load();
    } catch (err) {
      notify('error', err.message || 'Error al crear cliente');
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      const business = businesses.find((b) => b.id === enrollForm.business_id) || null;
      const result = await db.enrollPaidService({
        product_code: enrollForm.product_code,
        business,
        client_name: business ? null : enrollForm.client_name,
        client_phone: business ? null : enrollForm.client_phone,
        entity_type: business ? 'business' : null,
        entity_id: business?.id || null,
        amount: enrollForm.amount ? parseFloat(enrollForm.amount) : null,
        create_charge: true,
      });
      notify(
        'success',
        result.already
          ? 'Ya tenía esa suscripción activa'
          : `Servicio dado de alta + cobro del mes (${money(result.subscription.amount)})`
      );
      setEnrollForm({ product_code: 'guia_comercial', business_id: '', client_name: '', client_phone: '', amount: '' });
      load();
    } catch (err) {
      notify('error', err.message || 'Error al dar de alta el servicio');
    }
  };

  const handleGenerateMonth = async () => {
    try {
      const created = await db.generateMonthlyCharges();
      notify('success', created.length ? `${created.length} cobro(s) generados` : 'No había suscripciones nuevas para facturar');
      load();
    } catch (err) {
      notify('error', err.message || 'Error al generar cobros');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await db.markChargePaid(id, 'transferencia');
      notify('success', 'Cobro marcado como pagado');
      load();
    } catch (err) {
      notify('error', err.message || 'Error al marcar pago');
    }
  };

  const handleSubStatus = async (id, status) => {
    try {
      await db.updateBillingSubscription(id, { status });
      notify('success', `Suscripción → ${status}`);
      load();
    } catch (err) {
      notify('error', err.message || 'Error al actualizar suscripción');
    }
  };

  const handlePriceSave = async (code, price) => {
    try {
      await db.updateBillingProduct(code, { default_price: price });
      notify('success', 'Precio actualizado');
      load();
    } catch (err) {
      notify('error', err.message || 'Error al guardar precio');
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      if (!bannerForm.image_url) throw new Error('Subí una imagen para el banner');
      await db.createBanner({
        ...bannerForm,
        client_id: bannerForm.client_id || null,
      });
      // Alta cobro banner si hay cliente
      if (bannerForm.client_id) {
        const product = products.find((p) => p.code === 'banner');
        await db.createBillingCharge({
          client_id: bannerForm.client_id,
          product_code: 'banner',
          description: `Banner: ${bannerForm.title}`,
          amount: product?.default_price || 20000,
        });
      }
      setShowBannerModal(false);
      setBannerForm({ title: '', image_url: '', link_url: '', placement: 'home_mid', client_id: '', is_active: true });
      notify('success', 'Banner creado' + (bannerForm.client_id ? ' + cobro generado' : ''));
      load();
    } catch (err) {
      notify('error', err.message || 'Error al crear banner');
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('¿Borrar este banner?')) return;
    try {
      await db.deleteBanner(id);
      notify('success', 'Banner eliminado');
      load();
    } catch (err) {
      notify('error', err.message || 'Error al borrar banner');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Cargando contaduría…
      </div>
    );
  }

  const unpaidCount = charges.filter((c) => c.status === 'pending' || c.status === 'overdue').length;
  const alertCount = (summary?.overdue_count || 0) + (summary?.due_soon_count || 0);

  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'alertas', label: `Alertas${alertCount ? ` (${alertCount})` : ''}` },
    { id: 'cobros', label: `Cobros (${unpaidCount})` },
    { id: 'suscripciones', label: `Suscripciones (${subscriptions.filter((s) => s.status === 'active').length})` },
    { id: 'clientes', label: `Clientes (${clients.length})` },
    { id: 'precios', label: 'Precios' },
    { id: 'banners', label: `Banners (${banners.length})` },
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator style={{ color: 'var(--primary)' }} /> Contaduría
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Cobros de Guía, Delivery, Farmacias, Kioscos, Turnos, Clasificados Destacados y Publicidad (Hacele Banners)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem', gap: 6 }} onClick={load}>
            <RefreshCw size={14} /> Actualizar
          </button>
          <button type="button" className="btn btn-primary" style={{ fontSize: '0.85rem', gap: 6 }} onClick={handleGenerateMonth}>
            <Wallet size={14} /> Generar cobros del mes
          </button>
        </div>
      </div>

      {/* TOTAL A COBRAR — monto sumado */}
      {summary && (
        <div
          className="modal-panel"
          style={{
            padding: '1.5rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'linear-gradient(135deg, rgba(248,120,0,0.18) 0%, rgba(21,24,33,0.95) 55%)',
            border: '1px solid rgba(248,120,0,0.35)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffb020', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total a cobrar (suma)
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'white', lineHeight: 1.1, marginTop: 4 }}>
              {money(summary.to_collect_total)}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              {summary.to_collect_count} factura{summary.to_collect_count === 1 ? '' : 's'} sin pagar
              {summary.overdue_count > 0 ? (
                <span style={{ color: '#f87171', fontWeight: 700 }}>
                  {' '}· {summary.overdue_count} vencida{summary.overdue_count === 1 ? '' : 's'} ({money(summary.overdue_total)})
                </span>
              ) : null}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>COBRADO ESTE MES</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#4ade80' }}>{money(summary.paid_month_total)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Histórico pagado: {money(summary.paid_all_total)}
            </div>
          </div>
        </div>
      )}

      {/* Alertas rápidas siempre visibles */}
      {summary && (summary.overdue_count > 0 || summary.due_soon_count > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {summary.overdue_count > 0 && (
            <button
              type="button"
              onClick={() => setSubTab('alertas')}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                padding: '1rem 1.25rem',
                borderRadius: 12,
                border: '1px solid rgba(248,113,113,0.35)',
                background: 'rgba(239,68,68,0.12)',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontWeight: 700,
              }}
            >
              <AlertTriangle size={20} />
              <span style={{ flex: 1 }}>
                {summary.overdue_count} cobro{summary.overdue_count === 1 ? '' : 's'} vencido{summary.overdue_count === 1 ? '' : 's'}
                {' '}— suman {money(summary.overdue_total)}
              </span>
              <span style={{ fontSize: '0.8rem' }}>Ver alertas →</span>
            </button>
          )}
          {summary.due_soon_count > 0 && (
            <button
              type="button"
              onClick={() => setSubTab('alertas')}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                padding: '1rem 1.25rem',
                borderRadius: 12,
                border: '1px solid rgba(251,191,36,0.35)',
                background: 'rgba(251,191,36,0.1)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontWeight: 700,
              }}
            >
              <Bell size={20} />
              <span style={{ flex: 1 }}>
                {summary.due_soon_count} cobro{summary.due_soon_count === 1 ? '' : 's'} vencen en los próximos 7 días
                {' '}— {money(summary.due_soon_total)}
              </span>
              <span style={{ fontSize: '0.8rem' }}>Ver alertas →</span>
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className="btn"
            style={{
              background: subTab === t.id ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.03)',
              color: subTab === t.id ? 'white' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.5rem 0.9rem',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'alertas' && summary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <AlertList
            title="Vencidos"
            empty="No hay cobros vencidos."
            items={summary.overdue_alerts || []}
            tone="danger"
            onPaid={handleMarkPaid}
          />
          <AlertList
            title="Por vencer (7 días)"
            empty="Nada vence en los próximos 7 días."
            items={summary.due_soon_alerts || []}
            tone="warn"
            onPaid={handleMarkPaid}
          />
        </div>
      )}

      {subTab === 'resumen' && summary && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'A cobrar (suma)', value: money(summary.to_collect_total), sub: `${summary.to_collect_count} facturas`, color: '#ffb020' },
              { label: 'Pendiente a tiempo', value: money(summary.pending_total), sub: `${summary.pending_count} facturas`, color: '#fbbf24' },
              { label: 'Vencido', value: money(summary.overdue_total), sub: `${summary.overdue_count} vencidas`, color: '#f87171' },
              { label: 'Por vencer (7d)', value: money(summary.due_soon_total), sub: `${summary.due_soon_count} alertas`, color: '#fb923c' },
              { label: 'Cobrado este mes', value: money(summary.paid_month_total), sub: `${summary.paid_month_count} pagos`, color: '#4ade80' },
              { label: 'MRR suscripciones', value: money(summary.mrr), sub: `${summary.active_subscriptions} activas`, color: '#a78bfa' },
            ].map((card) => (
              <div key={card.label} className="modal-panel" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{card.label}</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: card.color, marginTop: 6 }}>{card.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{card.sub}</div>
              </div>
            ))}
          </div>

          <div className="modal-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Alta rápida de servicio cobrable</h3>
            <form onSubmit={handleEnroll} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Servicio *</label>
                <select
                  value={enrollForm.product_code}
                  onChange={(e) => setEnrollForm({ ...enrollForm, product_code: e.target.value })}
                  style={inputStyle}
                >
                  {products.map((p) => (
                    <option key={p.code} value={p.code}>
                      {PRODUCT_ICONS[p.code] || '•'} {p.name} ({money(p.default_price)}/mes)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Comercio (opcional)</label>
                <select
                  value={enrollForm.business_id}
                  onChange={(e) => setEnrollForm({ ...enrollForm, business_id: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">— Cliente manual —</option>
                  {businesses.filter((b) => b.status === 'approved').map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              {!enrollForm.business_id && (
                <>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Nombre cliente *</label>
                    <input required style={inputStyle} value={enrollForm.client_name} onChange={(e) => setEnrollForm({ ...enrollForm, client_name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Teléfono</label>
                    <input style={inputStyle} value={enrollForm.client_phone} onChange={(e) => setEnrollForm({ ...enrollForm, client_phone: e.target.value })} />
                  </div>
                </>
              )}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Monto custom</label>
                <input type="number" placeholder="Precio lista" style={inputStyle} value={enrollForm.amount} onChange={(e) => setEnrollForm({ ...enrollForm, amount: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ fontWeight: 700, gap: 6 }}>
                <Plus size={16} /> Dar de alta + cobrar
              </button>
            </form>
          </div>
        </>
      )}

      {subTab === 'cobros' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {summary && unpaidCount > 0 && (
            <div className="modal-panel" style={{ padding: '0.9rem 1.15rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Suma de pendientes + vencidos
              </span>
              <strong style={{ fontSize: '1.25rem', color: '#ffb020' }}>{money(summary.to_collect_total)}</strong>
            </div>
          )}
          {charges.length === 0 ? (
            <Empty>No hay cobros. Usá “Generar cobros del mes” o el alta rápida.</Empty>
          ) : (
            [...charges]
              .sort((a, b) => {
                const rank = (c) => (c.status === 'overdue' ? 0 : c.status === 'pending' ? 1 : 2);
                return rank(a) - rank(b) || (a.due_date || '').localeCompare(b.due_date || '');
              })
              .map((c) => {
                const days = daysUntil(c.due_date);
                const urgent = c.status === 'overdue' || (c.status === 'pending' && days != null && days <= 7);
                return (
                  <div
                    key={c.id}
                    className="glass"
                    style={{
                      padding: '1.1rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      border: urgent
                        ? c.status === 'overdue'
                          ? '1px solid rgba(248,113,113,0.4)'
                          : '1px solid rgba(251,191,36,0.35)'
                        : undefined,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800 }}>{c.description}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        {c.billing_clients?.name || 'Cliente'} · {c.period_label || '—'}
                        {' · '}
                        <StatusPill status={c.status} />
                        {(c.status === 'pending' || c.status === 'overdue') && (
                          <span
                            style={{
                              marginLeft: 8,
                              fontWeight: 800,
                              color: c.status === 'overdue' || (days != null && days < 0) ? '#f87171' : days != null && days <= 7 ? '#fbbf24' : 'var(--text-muted)',
                            }}
                          >
                            {dueLabel(c.due_date)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{money(c.amount)}</strong>
                      {(c.status === 'pending' || c.status === 'overdue') && (
                        <button type="button" className="btn btn-teal" style={{ fontSize: '0.8rem', gap: 4 }} onClick={() => handleMarkPaid(c.id)}>
                          <Check size={14} /> Cobrado
                        </button>
                      )}
                      {c.status === 'pending' && (
                        <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => db.updateChargeStatus(c.id, 'overdue').then(load)}>
                          Vencido
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {subTab === 'suscripciones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {subscriptions.length === 0 ? (
            <Empty>Sin suscripciones activas.</Empty>
          ) : (
            subscriptions.map((s) => (
              <div key={s.id} className="glass" style={{ padding: '1.1rem 1.25rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>
                    {PRODUCT_ICONS[s.product_code] || '•'} {s.billing_products?.name || s.product_code}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    {s.billing_clients?.name} · <StatusPill status={s.status} /> · desde {s.start_date}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <strong>{money(s.amount)}/mes</strong>
                  {s.status === 'active' && (
                    <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => handleSubStatus(s.id, 'paused')}>Pausar</button>
                  )}
                  {s.status === 'paused' && (
                    <button type="button" className="btn btn-primary" style={{ fontSize: '0.75rem' }} onClick={() => handleSubStatus(s.id, 'active')}>Reactivar</button>
                  )}
                  {s.status !== 'cancelled' && (
                    <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', color: '#f87171' }} onClick={() => handleSubStatus(s.id, 'cancelled')}>Cancelar</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'clientes' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.25rem' }}>
          <form className="modal-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: 'fit-content' }} onSubmit={handleCreateClient}>
            <h3 style={{ fontWeight: 800 }}>Nuevo cliente</h3>
            <input required placeholder="Nombre *" style={inputStyle} value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} />
            <input placeholder="Teléfono" style={inputStyle} value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} />
            <input placeholder="WhatsApp" style={inputStyle} value={clientForm.whatsapp} onChange={(e) => setClientForm({ ...clientForm, whatsapp: e.target.value })} />
            <input placeholder="Email" style={inputStyle} value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} />
            <select style={inputStyle} value={clientForm.business_id} onChange={(e) => setClientForm({ ...clientForm, business_id: e.target.value })}>
              <option value="">Sin comercio vinculado</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700, gap: 6 }}>
              <Plus size={16} /> Guardar cliente
            </button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {clients.length === 0 ? <Empty>Sin clientes todavía.</Empty> : clients.map((c) => (
              <div key={c.id} className="glass" style={{ padding: '1rem 1.15rem', display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div>
                  <strong>{c.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {c.phone || c.whatsapp || 'Sin teléfono'}
                    {c.businesses?.name ? ` · ${c.businesses.name}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem', color: '#f87171' }}
                  onClick={async () => {
                    if (!window.confirm('¿Eliminar cliente y sus cobros?')) return;
                    await db.deleteBillingClient(c.id);
                    load();
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'precios' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {products.map((p) => (
            <PriceCard key={`${p.code}-${p.default_price}`} product={p} onSave={handlePriceSave} />
          ))}
        </div>
      )}

      {subTab === 'banners' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 800 }}>Hacele Banners — Publicidad en la app</h3>
            <button type="button" className="btn btn-primary" style={{ fontSize: '0.85rem', gap: 6 }} onClick={() => setShowBannerModal(true)}>
              <ImagePlus size={16} /> Nuevo banner
            </button>
          </div>
          {banners.length === 0 ? (
            <Empty>No hay banners. Creá uno para vender publicidad en home / guía.</Empty>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {banners.map((b) => (
                <div key={b.id} className="glass" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img src={b.image_url} alt={b.title} style={{ width: 120, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <strong>{b.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {b.placement} · {b.is_active ? 'Activo' : 'Inactivo'}
                      {b.billing_clients?.name ? ` · ${b.billing_clients.name}` : ''}
                    </div>
                  </div>
                  <button type="button" className="btn btn-secondary" style={{ color: '#f87171' }} onClick={() => handleDeleteBanner(b.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showBannerModal && (
        <div
          onClick={() => setShowBannerModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
        >
          <form
            className="modal-panel"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveBanner}
            style={{ width: '100%', maxWidth: 520, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <h3 style={{ fontWeight: 800, fontSize: '1.35rem' }}>Nuevo banner publicitario</h3>
            <input required placeholder="Título *" style={inputStyle} value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} />
            <input placeholder="Link al hacer clic" style={inputStyle} value={bannerForm.link_url} onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })} />
            <select style={inputStyle} value={bannerForm.placement} onChange={(e) => setBannerForm({ ...bannerForm, placement: e.target.value })}>
              <option value="home_top">Home — arriba</option>
              <option value="home_mid">Home — medio</option>
              <option value="guia_top">Guía comercial — arriba</option>
            </select>
            <select style={inputStyle} value={bannerForm.client_id} onChange={(e) => setBannerForm({ ...bannerForm, client_id: e.target.value })}>
              <option value="">Cliente (opcional, genera cobro)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ImageUploadField
              label="Imagen del banner"
              folder="banners"
              value={bannerForm.image_url}
              onChange={(url) => setBannerForm({ ...bannerForm, image_url: url })}
            />
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>Publicar banner</button>
          </form>
        </div>
      )}
    </div>
  );
}

function PriceCard({ product, onSave }) {
  const [price, setPrice] = useState(() => String(product.default_price ?? 0));

  return (
    <div className="modal-panel" style={{ padding: '1.25rem' }}>
      <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{PRODUCT_ICONS[product.code] || '•'}</div>
      <strong style={{ fontSize: '1.05rem' }}>{product.name}</strong>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0.85rem' }}>{product.description}</p>
      <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Precio mensual (AR$)</label>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 4 }}>
        <input type="number" min="0" style={inputStyle} value={price} onChange={(e) => setPrice(e.target.value)} />
        <button type="button" className="btn btn-primary" style={{ fontSize: '0.8rem' }} onClick={() => onSave(product.code, price)}>
          Guardar
        </button>
      </div>
    </div>
  );
}

function AlertList({ title, empty, items, tone, onPaid }) {
  const isDanger = tone === 'danger';
  return (
    <div className="modal-panel" style={{ padding: '1.25rem' }}>
      <h3
        style={{
          fontWeight: 800,
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: isDanger ? '#f87171' : '#fbbf24',
        }}
      >
        {isDanger ? <AlertTriangle size={18} /> : <Bell size={18} />}
        {title}
        {items.length > 0 && (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
            · suma {money(items.reduce((s, i) => s + (i.amount || 0), 0))}
          </span>
        )}
      </h3>
      {items.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{empty}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '0.9rem 1rem',
                borderRadius: 10,
                background: isDanger ? 'rgba(239,68,68,0.08)' : 'rgba(251,191,36,0.08)',
                border: `1px solid ${isDanger ? 'rgba(248,113,113,0.25)' : 'rgba(251,191,36,0.25)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontWeight: 800 }}>{item.description}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                  {item.client} · {dueLabel(item.due_date)} ({item.due_date || '—'})
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <strong style={{ color: isDanger ? '#f87171' : '#fbbf24' }}>{money(item.amount)}</strong>
                <button type="button" className="btn btn-teal" style={{ fontSize: '0.75rem', gap: 4 }} onClick={() => onPaid(item.id)}>
                  <Check size={14} /> Cobrado
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', label: 'Pendiente' },
    overdue: { bg: 'rgba(248,113,113,0.15)', color: '#f87171', label: 'Vencido' },
    paid: { bg: 'rgba(74,222,128,0.15)', color: '#4ade80', label: 'Pagado' },
    active: { bg: 'rgba(74,222,128,0.15)', color: '#4ade80', label: 'Activa' },
    paused: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', label: 'Pausada' },
    cancelled: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', label: 'Cancelada' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '0.15rem 0.45rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 800 }}>
      {s.label}
    </span>
  );
}

function Empty({ children }) {
  return (
    <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.75rem',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border-glass)',
  color: 'white',
  fontSize: '0.85rem',
};
