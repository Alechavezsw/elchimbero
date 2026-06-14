'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Search, 
  ArrowLeft, 
  X, 
  Ticket,
  ExternalLink,
  Plus
} from 'lucide-react';
import styles from './eventos.module.css';

export default function EventosPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await db.getEvents();
        setEvents(data);
      } catch (err) {
        console.error('Error al cargar eventos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const categories = ['all', 'Cultura', 'Gastronomía', 'Deportes', 'Talleres'];

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddToCalendar = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>
      </div>

      {/* TÍTULO */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-warning" style={{ marginBottom: '0.5rem', background: 'rgba(255, 0, 127, 0.1)', color: 'var(--accent-pink)', border: '1px solid rgba(255, 0, 127, 0.2)' }}>
          Cartelera Departamental
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="gradient-text">
          Agenda de Eventos y Deportes
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Descubrí las actividades culturales, ferias, talleres y encuentros deportivos organizados en Chimbas.
        </p>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className={`${styles.filterBar} glass`} style={{ padding: '1rem', marginBottom: '2.5rem' }}>
        <div className={styles.searchBox}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar eventos por nombre, palabra clave o lugar..." 
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
              style={{ textTransform: 'capitalize' }}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE EVENTOS */}
      {loading ? (
        <div className="grid-cards">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass" style={{ height: '350px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No hay eventos programados que coincidan con tu búsqueda en esta categoría.
        </div>
      ) : (
        <div className="grid-cards">
          {filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className="glass glass-hover card-pink" 
              style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => setSelectedEvent(event)}
            >
              <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                <div className="zoom-container">
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span className="badge badge-open" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(9, 10, 15, 0.8)', color: 'var(--accent-pink)', borderColor: 'rgba(255, 0, 127, 0.3)' }}>
                  {event.category}
                </span>
              </div>

              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.50rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-pink)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} />
                  <span style={{ textTransform: 'capitalize' }}>{formatDate(event.date)}</span>
                </span>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.2rem 0' }}>{event.title}</h3>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} /> {event.location}
                </p>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0.25rem 0 1rem 0' }}>
                  {event.description}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {event.price === 0 ? 'Gratuito' : `$${event.price.toLocaleString('es-AR')}`}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-pink)' }}>
                    Ver más info &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NOTIFICACIÓN AL AGREGAR AL CALENDARIO */}
      {showNotification && (
        <div className={styles.notification}>
          📅 ¡Agregado a tu agenda chimbera local! Te avisaremos antes del inicio.
        </div>
      )}

      {/* MODAL DE DETALLE DEL EVENTO */}
      {selectedEvent && (
        <div className={styles.modalOverlay} onClick={() => setSelectedEvent(null)}>
          <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedEvent(null)}>
              <X size={20} />
            </button>

            <div className={styles.modalHero}>
              <img src={selectedEvent.image_url} alt={selectedEvent.title} className={styles.modalImage} />
              <div className={styles.modalHeroOverlay} />
              <span className={styles.modalCategoryBadge}>{selectedEvent.category}</span>
            </div>

            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>{selectedEvent.title}</h2>
              
              <div className={styles.modalMetaGrid}>
                <div className={styles.metaBox}>
                  <Calendar size={18} />
                  <div>
                    <span className={styles.metaBoxLabel}>Fecha</span>
                    <span className={styles.metaBoxVal} style={{ textTransform: 'capitalize' }}>{formatDate(selectedEvent.date)}</span>
                  </div>
                </div>
                <div className={styles.metaBox}>
                  <Clock size={18} />
                  <div>
                    <span className={styles.metaBoxLabel}>Hora</span>
                    <span className={styles.metaBoxVal}>{selectedEvent.time} hs</span>
                  </div>
                </div>
                <div className={styles.metaBox}>
                  <MapPin size={18} />
                  <div>
                    <span className={styles.metaBoxLabel}>Ubicación</span>
                    <span className={styles.metaBoxVal}>{selectedEvent.location}</span>
                  </div>
                </div>
                <div className={styles.metaBox}>
                  <Ticket size={18} />
                  <div>
                    <span className={styles.metaBoxLabel}>Entrada</span>
                    <span className={styles.metaBoxVal} style={{ fontWeight: 700, color: 'var(--accent-pink)' }}>
                      {selectedEvent.price === 0 ? 'Gratuito' : `$${selectedEvent.price.toLocaleString('es-AR')}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.modalDescriptionArea}>
                <h3>Acerca del Evento</h3>
                <p>{selectedEvent.description}</p>
              </div>

              <div className={styles.modalActions}>
                <button onClick={handleAddToCalendar} className="btn btn-primary" style={{ flex: 1 }}>
                  <Plus size={18} /> Agregar a mi Agenda
                </button>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location + ', Chimbas, San Juan, Argentina')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', gap: '0.35rem' }}
                >
                  <ExternalLink size={16} /> Ver ubicación
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
