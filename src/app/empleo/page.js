'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/components/AuthProvider';
import { 
  ArrowLeft, 
  Search, 
  Briefcase, 
  User, 
  Plus, 
  MessageCircle, 
  X, 
  DollarSign, 
  Building,
  Tag
} from 'lucide-react';
import styles from './empleo.module.css';

function EmpleoContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialType = searchParams.get('type') || 'oferta_laboral';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState(initialType);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    type: 'oferta_laboral',
    category: 'Gastronomía',
    price: '',
    company: '',
    contact_name: '',
    whatsapp: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  async function loadJobs() {
    try {
      const data = await db.getJobs();
      setJobs(data);
    } catch (err) {
      console.error('Error al cargar bolsa de empleo:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadJobs();
  }, []);

  const categories = ['all', 'Gastronomía', 'Construcción y Mantenimiento', 'Ventas y Atención al Cliente', 'Educación', 'Otros'];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.company && job.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.contact_name && job.contact_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesTab = job.type === activeTab;
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    
    return matchesSearch && matchesTab && matchesCategory;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!newJob.title || !newJob.description || !newJob.contact_name || !newJob.whatsapp) {
      setFormError('Por favor completa los campos obligatorios (*).');
      return;
    }

    try {
      // Formatear whatsapp para sacarle espacios y símbolos extraños
      const cleanWhatsapp = newJob.whatsapp.replace(/\D/g, '');
      
      const payload = {
        ...newJob,
        whatsapp: cleanWhatsapp.startsWith('54') ? cleanWhatsapp : `54${cleanWhatsapp}`
      };

      await db.createJob(payload);
      setFormSuccess(true);
      
      // Limpiar formulario
      setNewJob({
        title: '',
        description: '',
        type: activeTab, // Mantener la pestaña activa
        category: 'Gastronomía',
        price: '',
        company: '',
        contact_name: '',
        whatsapp: ''
      });

      // Recargar bolsa
      await loadJobs();

      // Cerrar modal tras un delay
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(false);
      }, 1500);

    } catch (error) {
      setFormError(error.message || 'Error al guardar la publicación.');
    }
  };

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>
      </div>

      {/* TÍTULO Y BOTÓN DE PUBLICAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
          <span className="badge badge-warning" style={{ marginBottom: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            Oportunidades Locales
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="gradient-text">
            Bolsa de Empleo y Oficios
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Conectá de vecino a vecino: encontrá ofertas laborales en comercios de Chimbas o contratá oficios de la zona.
          </p>
        </div>

        {user ? (
          <button 
            onClick={() => {
              setNewJob(prev => ({ ...prev, type: activeTab }));
              setIsModalOpen(true);
            }} 
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Plus size={18} />
            Publicar Oferta / Oficio
          </button>
        ) : (
          <Link 
            href="/login?redirect=/empleo" 
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', borderColor: 'var(--primary)' }}
          >
            <Plus size={18} style={{ color: 'var(--primary)' }} />
            Ingresá para Publicar
          </Link>
        )}
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className={`${styles.filterBar} glass`} style={{ padding: '1rem', marginBottom: '2.5rem' }}>
        <div className={styles.searchBox}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por puesto, descripción, empresa o vecino..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterTabs}>
          {categories.map((cat) => (
            <button 
              key={cat}
              className={`${styles.filterTab} ${selectedCategory === cat ? styles.activeTab : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'Todos los Rubros' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* TABS DE TIPO DE PUBLICACIÓN */}
      <div className={styles.typeTabs} style={{ marginBottom: '2rem' }}>
        <button 
          className={`${styles.typeTab} ${activeTab === 'oferta_laboral' ? styles.activeTypeTab : ''}`}
          onClick={() => {
            setActiveTab('oferta_laboral');
            setSelectedCategory('all');
          }}
        >
          <Briefcase size={18} />
          Ofertas Laborales de Comercios
        </button>
        <button 
          className={`${styles.typeTab} ${activeTab === 'servicio_vecinal' ? styles.activeTypeTab : ''}`}
          onClick={() => {
            setActiveTab('servicio_vecinal');
            setSelectedCategory('all');
          }}
        >
          <User size={18} />
          Oficios y Servicios de Vecinos
        </button>
      </div>

      {/* LISTADO DE PUBLICACIONES */}
      {loading ? (
        <div className={styles.jobsList}>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass" style={{ height: '180px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No hay publicaciones que coincidan con los filtros seleccionados.
          {user && (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              ¡Sé el primero en publicar una oferta o servicio hoy haciendo clic en &quot;Publicar&quot;!
            </p>
          )}
        </div>
      ) : (
        <div className={styles.jobsList}>
          {filteredJobs.map((job) => (
            <div key={job.id} className={`${styles.jobCard} glass`}>
              <div className={styles.jobInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className={`${styles.categoryBadge} badge badge-open`} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                    {job.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    🕒 {new Date(job.created_at).toLocaleDateString('es-AR')}
                  </span>
                </div>

                <h3 className={styles.jobTitle}>{job.title}</h3>
                
                <div className={styles.jobCompanyRow}>
                  {job.type === 'oferta_laboral' ? (
                    <>
                      <Building size={14} style={{ color: 'var(--primary)' }} />
                      <span>{job.company}</span>
                    </>
                  ) : (
                    <>
                      <User size={14} style={{ color: 'var(--secondary)' }} />
                      <span>Ofrecido por: {job.contact_name}</span>
                    </>
                  )}
                </div>

                <p className={styles.jobDesc}>{job.description}</p>
              </div>

              <div className={styles.jobActions}>
                <div className={styles.priceArea}>
                  <DollarSign size={18} style={{ color: 'var(--primary)' }} />
                  <strong>
                    {job.price > 0 ? `${job.price.toLocaleString('es-AR')}` : 'A convenir / Sueldo'}
                  </strong>
                </div>

                <a 
                  href={`https://wa.me/${job.whatsapp}?text=Hola%20${encodeURIComponent(job.contact_name)},%20te%20escribo%20por%20tu%20publicacion%20de%20"${encodeURIComponent(job.title)}"%20en%20El%20Chimbero!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-teal whatsapp-pulse"
                  style={{ display: 'flex', gap: '0.5rem', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                >
                  <MessageCircle size={18} />
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM MODAL DE NUEVA PUBLICACIÓN */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>

            <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-glass)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Crear Nueva Publicación</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Completa los datos para publicar tu búsqueda laboral o tus servicios profesionales.
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {formError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-closed)', padding: '0.75rem 1rem', borderRadius: '8px', color: 'red', fontSize: '0.85rem', fontWeight: 600 }}>
                  ⚠️ {formError}
                </div>
              )}
              {formSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--primary)', padding: '0.75rem 1rem', borderRadius: '8px', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✅ ¡Publicación creada con éxito!
                </div>
              )}

              <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: 0 }}>
                <div className="form-group">
                  <label className="form-label">Tipo de Publicación *</label>
                  <select 
                    className="form-select" 
                    name="type" 
                    value={newJob.type}
                    onChange={handleInputChange}
                  >
                    <option value="oferta_laboral">Oferta Laboral (Busco Empleado)</option>
                    <option value="servicio_vecinal">Oficio / Servicio (Ofrezco mis servicios)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Rubro / Categoría *</label>
                  <select 
                    className="form-select" 
                    name="category" 
                    value={newJob.category}
                    onChange={handleInputChange}
                  >
                    <option value="Gastronomía">Gastronomía</option>
                    <option value="Construcción y Mantenimiento">Construcción y Mantenimiento</option>
                    <option value="Ventas y Atención al Cliente">Ventas y Atención al Cliente</option>
                    <option value="Educación">Educación</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Título de la Publicación *</label>
                <input 
                  type="text" 
                  name="title"
                  className="form-input"
                  placeholder="Ej: Busco Ayudante de Cocina o Pintor Gasista Matriculado..."
                  value={newJob.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: 0 }}>
                <div className="form-group">
                  <label className="form-label">
                    {newJob.type === 'oferta_laboral' ? 'Nombre del Comercio/Empresa' : 'Nombre de la Fantasía/Particular'}
                  </label>
                  <input 
                    type="text" 
                    name="company"
                    className="form-input"
                    placeholder="Ej: Pizzería La Chimbera o Servicios Carlos..."
                    value={newJob.company}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Remuneración / Precio Estimado (Opcional)</label>
                  <input 
                    type="number" 
                    name="price"
                    className="form-input"
                    placeholder="Ej: 180000 o 1500 (vacío para a convenir)"
                    value={newJob.price}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: 0 }}>
                <div className="form-group">
                  <label className="form-label">Nombre del Contacto *</label>
                  <input 
                    type="text" 
                    name="contact_name"
                    className="form-input"
                    placeholder="Ej: Juan Pérez"
                    value={newJob.contact_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp de Contacto *</label>
                  <input 
                    type="text" 
                    name="whatsapp"
                    className="form-input"
                    placeholder="Ej: 2645123456"
                    value={newJob.whatsapp}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descripción de las Tareas / Requisitos / Servicio *</label>
                <textarea 
                  name="description"
                  className="form-textarea"
                  rows={4}
                  placeholder="Detalla lo más posible las tareas, horarios, requisitos de experiencia o el servicio que realizas..."
                  value={newJob.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Publicar Ahora
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function EmpleoPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cargando Bolsa de Empleo...</h2>
      </div>
    }>
      <EmpleoContent />
    </Suspense>
  );
}
