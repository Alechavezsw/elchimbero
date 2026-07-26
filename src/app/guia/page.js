'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import styles from './guia.module.css';
import { Search, MapPin, Store, MessageCircle, Plus } from 'lucide-react';

const categories = [
  'Todos',
  'Gastronomía',
  'Almacén y Comestibles',
  'Construcción y Ferretería',
  'Automotores y Servicios',
  'Indumentaria y Calzado',
  'Otros'
];

function GuiaContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [businesses, setBusinesses] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Todos');
  const [loading, setLoading] = useState(true);

  // Obtener barrios únicos de los comercios
  const [neighborhoods, setNeighborhoods] = useState(['Todos']);

  useEffect(() => {
    async function loadBusinesses() {
      try {
        const data = await db.getBusinesses();
        setBusinesses(data);
        
        // Extraer barrios únicos
        const uniqueBarrios = ['Todos', ...new Set(data.map(b => b.neighborhood).filter(Boolean))];
        setNeighborhoods(uniqueBarrios);
      } catch (error) {
        console.error('Error al obtener comercios:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBusinesses();
  }, []);

  // Filtrar comercios en base a búsqueda, categoría y barrio
  const filteredBusinesses = useMemo(() => {
    let result = [...businesses];

    // Filtrar por categoría
    if (selectedCategory !== 'Todos') {
      result = result.filter(b => b.category === selectedCategory || 
        (selectedCategory === 'Otros' && !categories.slice(1, -1).includes(b.category))
      );
    }

    // Filtrar por barrio
    if (selectedNeighborhood !== 'Todos') {
      result = result.filter(b => b.neighborhood === selectedNeighborhood);
    }

    // Filtrar por consulta de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.name.toLowerCase().includes(query) ||
        (b.description && b.description.toLowerCase().includes(query)) ||
        b.address.toLowerCase().includes(query)
      );
    }

    return result;
  }, [businesses, searchQuery, selectedCategory, selectedNeighborhood]);

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className={styles.title}>Guía Comercial</h1>
            <p className={styles.subtitle}>Directorio de comercios, servicios y profesionales de Chimbas</p>
          </div>
          
          <Link href="/guia/nuevo" className="btn btn-primary">
            <Plus size={18} /> Sumar mi Comercio
          </Link>
        </div>

        {/* CONTROLES DE BÚSQUEDA */}
        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o palabra clave..."
              className="form-input styles.searchInput"
              style={{ paddingLeft: '2.75rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
          >
            <option value="Todos">Todos los barrios</option>
            {neighborhoods.filter(n => n !== 'Todos').map(barrio => (
              <option key={barrio} value={barrio}>{barrio}</option>
            ))}
          </select>
        </div>
      </header>

      {/* CATEGORY CHIPS */}
      <div className={styles.categoriesContainer}>
        <h4 className={styles.categoriesTitle}>Filtrar por Categoría</h4>
        <div className={styles.categoriesList}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryChip} ${selectedCategory === cat ? styles.activeChip : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* LISTADO DE COMERCIOS */}
      {loading ? (
        <div className="grid-cards">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass" style={{ height: '350px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filteredBusinesses.length > 0 ? (
        <div className="grid-cards">
          {filteredBusinesses.map((biz) => (
            <div key={biz.id} className="glass glass-hover card-violet" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                <div className="zoom-container">
                  <img
                    src={biz.image_url}
                    alt={biz.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span
                  className="badge badge-open"
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(8, 12, 20, 0.8)' }}
                >
                  {biz.category}
                </span>
                {biz.is_featured && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: '1rem',
                      background: 'var(--primary-gradient)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '50px'
                    }}
                  >
                    Destacado
                  </span>
                )}
              </div>

              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{biz.name}</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} style={{ color: 'var(--secondary)' }} />
                  <span>{biz.neighborhood} - {biz.address}</span>
                </div>

                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  margin: '0.5rem 0'
                }}>
                  {biz.description}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <Link href={`/guia/${biz.id}`} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    Ver Ficha
                  </Link>
                  {biz.whatsapp && (
                    <a
                      href={`https://wa.me/${biz.whatsapp}?text=Hola%20${encodeURIComponent(biz.name)},%20te%20escribo%20desde%20la%20guia%20de%20El%20Chimbero.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-teal"
                      style={{ padding: '0.5rem 1rem' }}
                      title="Contactar por WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${styles.noResults} glass`}>
          <Store size={48} style={{ color: 'var(--text-muted)' }} />
          <h3 className={styles.noResultsTitle}>No se encontraron comercios</h3>
          <p className={styles.noResultsDesc}>
            No pudimos hallar ningún comercio que coincida con tus filtros actuales. Probá ampliando tu búsqueda o seleccionando otra categoría.
          </p>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Todos');
              setSelectedNeighborhood('Todos');
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
}

export default function GuiaPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cargando Guía Comercial...</h2>
      </div>
    }>
      <GuiaContent />
    </Suspense>
  );
}
