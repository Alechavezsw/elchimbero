'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import styles from './clasificados.module.css';
import { Search, Tag, Plus, MessageCircle, Info } from 'lucide-react';

const categories = [
  { label: 'Todos', value: 'Todos' },
  { label: 'Venta', value: 'sale' },
  { label: 'Alquiler', value: 'rent' },
  { label: 'Servicios', value: 'service' },
  { label: 'Empleo', value: 'job' },
  { label: 'Otros', value: 'other' }
];

function ClasificadosContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'Todos';

  const [ads, setAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCondition, setSelectedCondition] = useState('Todos');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAds() {
      try {
        const data = await db.getClassifieds();
        setAds(data);
      } catch (error) {
        console.error('Error al obtener clasificados:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAds();
  }, []);

  // Filtrar y ordenar anuncios
  useEffect(() => {
    let result = [...ads];

    // Filtrar por categoría
    if (selectedCategory !== 'Todos') {
      result = result.filter(ad => ad.category === selectedCategory);
    }

    // Filtrar por condición
    if (selectedCondition !== 'Todos') {
      result = result.filter(ad => ad.condition === selectedCondition);
    }

    // Filtrar por precio máximo
    if (maxPrice.trim() !== '') {
      const priceLimit = parseFloat(maxPrice);
      if (!isNaN(priceLimit)) {
        result = result.filter(ad => ad.price <= priceLimit);
      }
    }

    // Filtrar por consulta de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ad => 
        ad.title.toLowerCase().includes(query) ||
        ad.description.toLowerCase().includes(query)
      );
    }

    // Ordenar resultados
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredAds(result);
  }, [ads, searchQuery, selectedCategory, selectedCondition, maxPrice, sortBy]);

  const getCategoryLabel = (val) => {
    const cat = categories.find(c => c.value === val);
    return cat ? cat.label : 'Clasificado';
  };

  const getConditionLabel = (val) => {
    if (val === 'new') return 'Nuevo';
    if (val === 'used') return 'Usado';
    return 'Servicio/Otro';
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className={styles.title}>Clasificados</h1>
            <p className={styles.subtitle}>Comprá y vendé a vecinos de Chimbas de forma directa y sin comisiones</p>
          </div>
          
          <Link href="/clasificados/nuevo" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', boxShadow: '0 4px 14px rgba(236, 72, 153, 0.3)' }}>
            <Plus size={18} /> Publicar Anuncio
          </Link>
        </div>

        {/* CONTROLES DE BÚSQUEDA Y FILTRADO */}
        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar productos o servicios..."
              className="form-input styles.searchInput"
              style={{ paddingLeft: '2.75rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
          >
            <option value="Todos">Todas las condiciones</option>
            <option value="new">Nuevo</option>
            <option value="used">Usado</option>
            <option value="not_applicable">No aplica (Servicios/Empleo)</option>
          </select>

          <input
            type="number"
            placeholder="Precio máximo ($)"
            className="form-input"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Más recientes</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
          </select>
        </div>
      </header>

      {/* CATEGORY CHIPS */}
      <div className={styles.categoriesContainer}>
        <h4 className={styles.categoriesTitle}>Filtrar por Rubro</h4>
        <div className={styles.categoriesList}>
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`${styles.categoryChip} ${selectedCategory === cat.value ? styles.activeChip : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
              style={selectedCategory === cat.value ? { background: 'var(--primary-gradient)' } : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* AVISO IMPORTANTE */}
      <div className="glass" style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', background: 'rgba(245, 158, 11, 0.03)', marginBottom: '2.5rem', alignItems: 'center' }}>
        <Info size={20} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          <strong>Trato Directo:</strong> Los acuerdos de compra/venta se realizan directamente entre vecinos de Chimbas. Recordá pactar los encuentros en lugares concurridos (como plazas o avenidas transitadas) por seguridad.
        </p>
      </div>

      {/* LISTADO DE ANUNCIOS */}
      {loading ? (
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="glass" style={{ height: '320px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filteredAds.length > 0 ? (
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {filteredAds.map((ad) => (
            <div key={ad.id} className="glass glass-hover card-pink" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
                <div className="zoom-container">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                
                <span className={styles.priceTag}>
                  {ad.price > 0 ? `$${ad.price.toLocaleString('es-AR')}` : 'Consultar'}
                </span>

                <span
                  className="badge badge-warning"
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(8, 12, 20, 0.85)', color: 'var(--text-primary)', border: 'none' }}
                >
                  {getConditionLabel(ad.condition)}
                </span>
              </div>

              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-pink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {getCategoryLabel(ad.category)}
                </span>
                
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {ad.title}
                </h3>

                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  margin: '0.25rem 0 0.75rem 0'
                }}>
                  {ad.description}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <Link href={`/clasificados/${ad.id}`} className="btn btn-secondary" style={{ flex: 1, padding: '0.45rem', fontSize: '0.85rem' }}>
                    Ver Detalles
                  </Link>
                  {ad.whatsapp && (
                    <a
                      href={`https://wa.me/${ad.whatsapp}?text=Hola%20vi%20tu%20anuncio%20de%20"${encodeURIComponent(ad.title)}"%20en%20El%20Chimbero.%20Sigue%20disponible?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-teal"
                      style={{ padding: '0.45rem 0.8rem', background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', boxShadow: 'none' }}
                      title="Contactar vendedor"
                    >
                      <MessageCircle size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${styles.noResults} glass`}>
          <Tag size={48} style={{ color: 'var(--text-muted)' }} />
          <h3 className={styles.noResultsTitle}>No se encontraron anuncios</h3>
          <p className={styles.noResultsDesc}>
            No encontramos publicaciones con los filtros actuales. Intentá buscando con otros términos o limpiando los filtros de precio.
          </p>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Todos');
              setSelectedCondition('Todos');
              setMaxPrice('');
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
}

export default function ClasificadosPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cargando Clasificados...</h2>
      </div>
    }>
      <ClasificadosContent />
    </Suspense>
  );
}
