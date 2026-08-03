'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/db';
import { canManageBusiness } from '@/lib/roles';
import { ArrowLeft, Store, Save, LogIn } from 'lucide-react';

const categories = [
  'Gastronomía',
  'Almacén y Comestibles',
  'Construcción y Ferretería',
  'Automotores y Servicios',
  'Indumentaria y Calzado',
  'Otros'
];

export default function NuevoComercio() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Gastronomía');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [hoursLV, setHoursLV] = useState('09:00 - 13:00, 17:00 - 21:00');
  const [hoursSD, setHoursSD] = useState('09:00 - 13:00');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!name || !address || !neighborhood) {
      setError('Por favor completá los campos obligatorios: Nombre, Dirección y Barrio.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const hours = {
      lunes_a_viernes: hoursLV || 'Cerrado',
      sabado_y_domingo: hoursSD || 'Cerrado'
    };

    try {
      const created = await db.createBusiness({
        name,
        description,
        category,
        address,
        neighborhood,
        phone,
        whatsapp: whatsapp ? whatsapp.replace(/[^0-9]/g, '') : '', // Solo números para link de WA
        image_url: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', // imagen genérica de comercio si está vacía
        hours,
        latitude: -31.4958, // Coordenadas centrales por defecto para Chimbas
        longitude: -68.5352
      });

      router.push(`/guia/${created.id}`);
    } catch (err) {
      console.error('Error al registrar comercio:', err);
      setError(err.message || 'Hubo un problema al guardar el comercio. Intentá nuevamente.');
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
          <Store size={48} style={{ color: 'var(--primary)', marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Iniciá sesión para continuar</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Para registrar tu comercio en la guía comercial de El Chimbero, debés tener una cuenta de usuario de negocio.
          </p>
          <Link href="/login?redirect=/guia/nuevo" className="btn btn-primary" style={{ width: '100%', gap: '0.5rem' }}>
            <LogIn size={18} /> Iniciar Sesión / Registrarse
          </Link>
        </div>
      </div>
    );
  }

  if (!canManageBusiness(user)) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', display: 'flex', justifyContent: 'center' }}>
        <div className="glass" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
          <Store size={48} style={{ color: 'var(--primary)', marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Cuenta de negocio requerida</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Tu usuario es de tipo cliente. Para cargar un comercio, registrate como <strong>Usuario de negocio</strong> o pedile a un admin que te cambie el rol.
          </p>
          <Link href="/dashboard" className="btn btn-secondary" style={{ width: '100%' }}>
            Ir a mi panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
      
      <Link href="/guia" className="backLink" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', marginTop: '2rem', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Volver a la Guía
      </Link>

      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        <div className="glass" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Store size={28} style={{ color: 'var(--primary)' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Sumar mi Comercio</h1>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Registrá tu comercio de forma gratuita. Una vez guardado, aparecerá inmediatamente en el directorio público y los vecinos podrán contactarte directamente por WhatsApp.
          </p>

          {error && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-closed)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nombre del Comercio *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Pizzería La Avenida, Verdulería Don José"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Contanos qué vendés, tus especialidades, zonas de delivery..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Dirección *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Calle Tucumán 1420 (Norte)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Barrio *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Villa Paula, Villa Obrera, etc."
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Teléfono Fijo / Celular</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: 264-4312233"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp (para Mensajes) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: 2645123456 (código de área sin 0 ni 15)"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">URL de Imagen (Opcional)</label>
              <input
                type="url"
                className="form-input"
                placeholder="Pega un enlace de foto (Unsplash, imgur...) o dejalo vacío"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.5rem 0 1rem 0' }}>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Horarios de Atención</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Lunes a Viernes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: 09:00 - 13:00, 17:00 - 21:00"
                  value={hoursLV}
                  onChange={(e) => setHoursLV(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sábados, Domingos y Feriados</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: 09:00 - 13:00 o Cerrado"
                  value={hoursSD}
                  onChange={(e) => setHoursSD(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem', gap: '0.5rem' }}
              disabled={submitting}
            >
              <Save size={18} />
              {submitting ? 'Guardando Comercio...' : 'Registrar Comercio'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
