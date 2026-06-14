'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/db';
import { ArrowLeft, Tag, Save, LogIn } from 'lucide-react';

const categories = [
  { label: 'Venta', value: 'sale' },
  { label: 'Alquiler', value: 'rent' },
  { label: 'Servicio', value: 'service' },
  { label: 'Búsqueda Laboral', value: 'job' },
  { label: 'Otros', value: 'other' }
];

export default function NuevoClasificado() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('sale');
  const [condition, setCondition] = useState('used');
  const [imageUrl, setImageUrl] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!title || !description || !category) {
      setError('Por favor completá los campos obligatorios: Título, Descripción y Rubro.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const created = await db.createClassified({
        title,
        description,
        price: parseFloat(price) || 0,
        category,
        condition,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', // imagen genérica si está vacía
        whatsapp: whatsapp ? whatsapp.replace(/[^0-9]/g, '') : user.phone || '542645123456'
      });

      router.push(`/clasificados/${created.id}`);
    } catch (err) {
      console.error('Error al guardar clasificado:', err);
      setError(err.message || 'Hubo un error al guardar tu publicación. Reintentá por favor.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Verificando autenticación...</h2>
      </div>
    );
  }

  // Si no está logueado, pedir que inicie sesión
  if (!user) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', display: 'flex', justifyContent: 'center' }}>
        <div className="glass" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
          <Tag size={48} style={{ color: 'var(--accent-pink)', marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Iniciá sesión para publicar</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Para publicar un aviso clasificado en la cartelera de El Chimbero, debés ingresar a tu cuenta primero.
          </p>
          <Link href="/login?redirect=/clasificados/nuevo" className="btn btn-primary" style={{ width: '100%', gap: '0.5rem', background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' }}>
            <LogIn size={18} /> Iniciar Sesión / Registrarse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
      
      <Link href="/clasificados" className="backLink" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', marginTop: '2rem', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Volver a Clasificados
      </Link>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="glass" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Tag size={28} style={{ color: 'var(--accent-pink)' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Publicar un Clasificado</h1>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Publicá tu venta, alquiler o servicio de forma 100% gratuita. Los interesados verán tu anuncio e iniciarán contacto directo con vos por WhatsApp.
          </p>

          {error && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-closed)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Título del Anuncio *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Vendo Smart TV 42'' LG, Alquilo Cochera, Plomero Urgencias"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={70}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción *</label>
              <textarea
                className="form-input"
                rows={5}
                placeholder="Detalla las características del producto, estado de uso, formas de entrega o el tipo de servicio que brindás..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Rubro *</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estado del Producto</label>
                <select
                  className="form-select"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  disabled={category === 'service' || category === 'job'}
                >
                  <option value="used">Usado</option>
                  <option value="new">Nuevo</option>
                  <option value="not_applicable">No Aplica (Servicios/Empleos)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Precio ($) *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ej: 45000 (0 para consultar)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp de Contacto</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: 2645123456"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">URL de Imagen (Opcional)</label>
              <input
                type="url"
                className="form-input"
                placeholder="Pega un enlace de foto o dejalo vacío para usar una genérica"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem', gap: '0.5rem', background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', boxShadow: '0 4px 14px rgba(236, 72, 153, 0.3)' }}
              disabled={submitting}
            >
              <Save size={18} />
              {submitting ? 'Publicando...' : 'Publicar Anuncio'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
