'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/db';
import { 
  LayoutDashboard, 
  Store, 
  Tag, 
  Plus, 
  Eye, 
  Trash2, 
  LogOut, 
  User, 
  Phone, 
  Mail,
  Bike
} from 'lucide-react';

export default function UserDashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('businesses'); // 'businesses' | 'classifieds'
  const [userBusinesses, setUserBusinesses] = useState([]);
  const [userClassifieds, setUserClassifieds] = useState([]);
  const [fetchingContent, setFetchingContent] = useState(true);
  const [message, setMessage] = useState(null);

  const loadUserContent = async () => {
    if (!user) return;
    setFetchingContent(true);
    try {
      const { businesses, classifieds } = await db.getMyContent();
      setUserBusinesses(businesses);
      setUserClassifieds(classifieds);
    } catch (error) {
      console.error('Error al cargar contenido del usuario:', error);
    } finally {
      setFetchingContent(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard');
    } else if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadUserContent();
    }
  }, [user, loading, router]);

  const handleDeleteBusiness = async (id) => {
    if (!window.confirm('¿Estás seguro de que querés eliminar este comercio de la guía?')) return;
    try {
      await db.deleteBusiness(id);
      setMessage({ type: 'success', text: 'Comercio eliminado correctamente.' });
      loadUserContent();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar el comercio.' });
    }
  };

  const handleDeleteClassified = async (id) => {
    if (!window.confirm('¿Estás seguro de que querés borrar este aviso clasificado?')) return;
    try {
      await db.deleteClassified(id);
      setMessage({ type: 'success', text: 'Anuncio eliminado correctamente.' });
      loadUserContent();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar el anuncio.' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || (!user && !loading)) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cargando panel de control...</h2>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
      
      {/* HEADER PANEL */}
      <header style={{ padding: '3rem 0 2rem 0', borderBottom: '1px solid var(--border-glass)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LayoutDashboard size={32} style={{ color: 'var(--primary)' }} />
            <div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Panel de Control</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Administrá tus comercios publicados y anuncios activos</p>
            </div>
          </div>
          
          <button onClick={handleSignOut} className="btn btn-secondary" style={{ gap: '0.5rem' }}>
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </header>

      {/* CUADRO DE PERFIL */}
      <div className="glass" style={{ padding: '1.5rem 2rem', borderRadius: '12px', display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2.5rem', alignItems: 'center' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={30} style={{ color: 'white', margin: 'auto' }} />
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Hola, {user.full_name || 'Vecino'}!</h2>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={14} /> {user.email}</span>
            {user.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={14} /> {user.phone}</span>
            )}
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
          <Link href="/guia/nuevo" className="btn btn-secondary" style={{ gap: '0.35rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            <Plus size={16} /> Nuevo Comercio
          </Link>
          <Link href="/clasificados/nuevo" className="btn btn-secondary" style={{ gap: '0.35rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            <Plus size={16} /> Nuevo Clasificado
          </Link>
        </div>
      </div>

      {/* MENSAJES DE ESTADO */}
      {message && (
        <div 
          style={{ 
            padding: '1rem', 
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            color: message.type === 'success' ? 'var(--color-open)' : 'var(--color-closed)', 
            borderRadius: '8px', 
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, 
            marginBottom: '2rem', 
            fontSize: '0.9rem',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* PESTAÑAS DE CONTENIDO */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('businesses')}
          className="btn"
          style={{ 
            background: 'none', 
            color: activeTab === 'businesses' ? 'white' : 'var(--text-muted)',
            borderBottom: activeTab === 'businesses' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
            padding: '0.5rem 1rem',
            fontWeight: 700,
            gap: '0.5rem'
          }}
        >
          <Store size={18} /> Mis Comercios ({userBusinesses.length})
        </button>
        
        <button 
          onClick={() => setActiveTab('classifieds')}
          className="btn"
          style={{ 
            background: 'none', 
            color: activeTab === 'classifieds' ? 'white' : 'var(--text-muted)',
            borderBottom: activeTab === 'classifieds' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
            padding: '0.5rem 1rem',
            fontWeight: 700,
            gap: '0.5rem'
          }}
        >
          <Tag size={18} /> Mis Clasificados ({userClassifieds.length})
        </button>
      </div>

      {/* LISTADOS */}
      {fetchingContent ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h4>Cargando tus publicaciones...</h4>
        </div>
      ) : activeTab === 'businesses' ? (
        userBusinesses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {userBusinesses.map(biz => (
              <div key={biz.id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <img src={biz.image_url} alt={biz.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{biz.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📍 {biz.neighborhood} - {biz.address} | Categoría: <strong>{biz.category}</strong></p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {biz.delivery_enabled && (
                    <Link href={`/dashboard/delivery/${biz.id}`} className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', gap: '0.25rem' }}>
                      <Bike size={14} /> Delivery
                    </Link>
                  )}
                  <Link href={`/guia/${biz.id}`} className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', gap: '0.25rem' }}>
                    <Eye size={14} /> Ver Ficha
                  </Link>
                  <button 
                    onClick={() => handleDeleteBusiness(biz.id)} 
                    className="btn btn-primary" 
                    style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', background: 'var(--color-closed)', boxShadow: 'none', gap: '0.25rem' }}
                  >
                    <Trash2 size={14} /> Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Store size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3>Aún no registraste ningún comercio</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Publicá tu negocio para que todos los chimberos puedan encontrarte.</p>
            <Link href="/guia/nuevo" className="btn btn-primary">
              <Plus size={16} /> Sumar mi Comercio
            </Link>
          </div>
        )
      ) : (
        userClassifieds.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {userClassifieds.map(ad => (
              <div key={ad.id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <img src={ad.image_url} alt={ad.title} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{ad.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Precio: <strong>${ad.price.toLocaleString('es-AR')}</strong> | Rubro: <strong>{ad.category === 'sale' ? 'Venta' : ad.category === 'rent' ? 'Alquiler' : ad.category === 'service' ? 'Servicio' : 'Empleo'}</strong>
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link href={`/clasificados/${ad.id}`} className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', gap: '0.25rem' }}>
                    <Eye size={14} /> Ver Detalles
                  </Link>
                  <button 
                    onClick={() => handleDeleteClassified(ad.id)} 
                    className="btn btn-primary" 
                    style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', background: 'var(--color-closed)', boxShadow: 'none', gap: '0.25rem' }}
                  >
                    <Trash2 size={14} /> Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Tag size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3>No tenés publicaciones activas</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Publicá de forma gratuita cosas que ya no uses o promocioná tus servicios.</p>
            <Link href="/clasificados/nuevo" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', boxShadow: 'none' }}>
              <Plus size={16} /> Publicar Anuncio
            </Link>
          </div>
        )
      )}

    </div>
  );
}
