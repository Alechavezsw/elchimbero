'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import styles from './page.module.css';
import { 
  Search, 
  Store, 
  Tag, 
  HeartPulse, 
  Clock, 
  ArrowRight, 
  Phone, 
  CloudSun, 
  Calendar,
  AlertTriangle,
  X,
  MessageCircle
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const [searchIndex, setSearchIndex] = useState({ businesses: [], classifieds: [], jobs: [] });
  const [indexLoaded, setIndexLoaded] = useState(false);
  const [isDropdownFocused, setIsDropdownFocused] = useState(false);

  // Clic fuera del buscador para cerrar
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsDropdownFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar índice cuando el usuario empieza a escribir (2 o más caracteres)
  useEffect(() => {
    if (searchQuery.trim().length >= 2 && !indexLoaded) {
      db.getBusinesses().then(biz => {
        db.getClassifieds().then(ads => {
          db.getJobs().then(jobs => {
            setSearchIndex({
              businesses: biz || [],
              classifieds: ads || [],
              jobs: jobs || []
            });
            setIndexLoaded(true);
          });
        });
      });
    }
  }, [searchQuery, indexLoaded]);

  // Filtrar resultados en caliente mediante useMemo (100% puro y óptimo)
  const liveResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length < 2) {
      return { businesses: [], classifieds: [], jobs: [], totalCount: 0 };
    }

    const filteredBiz = searchIndex.businesses.filter(b => 
      b.name.toLowerCase().includes(query) ||
      b.category.toLowerCase().includes(query) ||
      (b.description && b.description.toLowerCase().includes(query))
    ).slice(0, 3);

    const filteredAds = searchIndex.classifieds.filter(ad => 
      ad.title.toLowerCase().includes(query) ||
      ad.category.toLowerCase().includes(query) ||
      ad.description.toLowerCase().includes(query)
    ).slice(0, 3);

    const filteredJobs = searchIndex.jobs.filter(j => 
      j.title.toLowerCase().includes(query) ||
      j.category.toLowerCase().includes(query) ||
      j.description.toLowerCase().includes(query)
    ).slice(0, 3);

    return {
      businesses: filteredBiz,
      classifieds: filteredAds,
      jobs: filteredJobs,
      totalCount: filteredBiz.length + filteredAds.length + filteredJobs.length
    };
  }, [searchQuery, searchIndex]);

  const showDropdown = isDropdownFocused && searchQuery.trim().length >= 2;
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [recentClassifieds, setRecentClassifieds] = useState([]);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(true);
  const [weatherAlert, setWeatherAlert] = useState(null);

  // Estados para noticias de El Chimbero
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(false);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [weather, setWeather] = useState({ temp: '—', status: 'Cargando clima…', icon: '🌡️' });
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Formatear fecha local
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentDate(new Date().toLocaleDateString('es-AR', options));

    // Reloj digital en vivo
    const updateTime = () => {
      const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      setCurrentTime(new Date().toLocaleTimeString('es-AR', timeOptions));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Cargar datos
    async function loadData() {
      try {
        const allBusinesses = await db.getBusinesses();
        const featured = allBusinesses.filter(b => b.is_featured).slice(0, 3);
        // Si no hay destacados, tomamos los primeros 3
        setFeaturedBusinesses(featured.length > 0 ? featured : allBusinesses.slice(0, 3));

        const allClassifieds = await db.getClassifieds();
        setRecentClassifieds(allClassifieds.slice(0, 4));

        // Cargar noticias desde API
        try {
          const res = await fetch('/api/news');
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              setNews(json.data.slice(0, 6)); // Tomamos las últimas 6 noticias
            } else {
              setNewsError(true);
            }
          } else {
            setNewsError(true);
          }
        } catch (err) {
          console.error('Error al cargar noticias:', err);
          setNewsError(true);
        } finally {
          setNewsLoading(false);
        }

        // Clima y alertas reales (SMN + Open-Meteo)
        try {
          const weatherRes = await fetch('/api/weather');
          if (weatherRes.ok) {
            const weatherJson = await weatherRes.json();
            if (weatherJson.weather) {
              const w = weatherJson.weather;
              setWeather({
                temp: `${w.temp}°C`,
                status: w.status,
                icon: w.icon,
              });
            }
            if (weatherJson.primaryAlert) {
              setWeatherAlert(weatherJson.primaryAlert);
              setShowAlert(true);
            } else {
              setWeatherAlert(null);
              setShowAlert(false);
            }
          }
        } catch (err) {
          console.error('Error al cargar clima:', err);
        }

      } catch (error) {
        console.error('Error al cargar datos de portada:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    return () => clearInterval(interval);
  }, []);

  // Autoplay para el carrusel de noticias
  useEffect(() => {
    if (news.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setActiveNewsIndex((prevIndex) => (prevIndex + 1) % news.length);
    }, 6000); // 6 segundos por noticia

    return () => clearInterval(timer);
  }, [news.length, isPaused]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/guia?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const emergencyNumbers = [
    { name: 'Comisaría 17ª (Chimbas Centro)', phone: '264-4311022' },
    { name: 'Comisaría 26ª (Barrio Los Tamarindos)', phone: '264-4282200' },
    { name: 'Comisaría 30ª (Villa Observatorio)', phone: '264-4312600' },
    { name: 'Bomberos de Chimbas', phone: '911 / 264-4318000' },
    { name: 'Hospital Doctor Rizo Esparza', phone: '264-4901050' },
    { name: 'Urgencias Médicas Municipal', phone: '0800-222-7799' }
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* ALERT BANNER — datos reales SMN */}
      {showAlert && weatherAlert && (
        <div className="container" style={{ marginTop: '1.5rem', marginBottom: '-1rem' }}>
          <div
            className="glass"
            style={{
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              background: weatherAlert.colors?.bg || 'rgba(234, 179, 8, 0.12)',
              borderColor: weatherAlert.colors?.border || 'rgba(234, 179, 8, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <AlertTriangle size={20} className="urgency-pulse" style={{ color: weatherAlert.colors?.color || '#eab308', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  ALERTA {weatherAlert.severityLabel?.toUpperCase()}: {weatherAlert.event}
                </strong>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                  {weatherAlert.description}
                  {weatherAlert.validity ? ` · ${weatherAlert.validity}` : ''}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                  Fuente: Servicio Meteorológico Nacional
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                href="/clima"
                className="btn btn-primary"
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  background: weatherAlert.colors?.color || 'var(--primary)',
                  boxShadow: `0 4px 14px ${weatherAlert.colors?.bg || 'rgba(248, 120, 0, 0.25)'}`,
                  color: '#140800',
                }}
              >
                Ver detalles
              </Link>
              <button
                onClick={() => setShowAlert(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem' }}
                aria-label="Cerrar alerta"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            ¡Todo <span className="gradient-text font-black">Chimbas</span> en <br />
            un solo lugar!
          </h1>
          <p className={styles.heroSubtitle}>
            Encontrá los comercios de tu barrio, clasificados de vecinos, farmacias de turno activas y mucho más.
          </p>

          <div className={styles.searchWrapper} ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className={`${styles.searchContainer} search-glow`}>
              <Search size={22} className={styles.searchIcon} style={{ color: 'var(--text-muted)', marginLeft: '1rem' }} />
              <input 
                type="text" 
                placeholder="¿Qué comercio, servicio o producto estás buscando hoy?" 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsDropdownFocused(true)}
              />
              <button type="submit" className="btn btn-primary">
                Buscar
              </button>
            </form>

            {showDropdown && (
              <div className={styles.searchResults}>
                {liveResults.totalCount === 0 ? (
                  <div className={styles.noResultsMessage}>
                    No se encontraron resultados para &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <>
                    {liveResults.businesses.length > 0 && (
                      <>
                        <div className={styles.searchGroupTitle}>Comercios</div>
                        {liveResults.businesses.map(b => (
                          <Link 
                            key={b.id} 
                            href={`/guia/${b.id}`} 
                            className={styles.searchResultItem}
                            onClick={() => setIsDropdownFocused(false)}
                          >
                            <span className={styles.searchResultTitle}>{b.name}</span>
                            <span className={styles.searchResultSub}>📍 {b.neighborhood} - {b.category}</span>
                          </Link>
                        ))}
                      </>
                    )}

                    {liveResults.classifieds.length > 0 && (
                      <>
                        <div className={styles.searchGroupTitle}>Clasificados</div>
                        {liveResults.classifieds.map(ad => (
                          <Link 
                            key={ad.id} 
                            href={`/clasificados/${ad.id}`} 
                            className={styles.searchResultItem}
                            onClick={() => setIsDropdownFocused(false)}
                          >
                            <span className={styles.searchResultTitle}>{ad.title}</span>
                            <span className={styles.searchResultSub}>
                              💰 {ad.price > 0 ? `$${ad.price.toLocaleString('es-AR')}` : 'Consultar'} - {ad.category === 'sale' ? 'Venta' : ad.category === 'rent' ? 'Alquiler' : ad.category === 'service' ? 'Servicio' : 'Empleo'}
                            </span>
                          </Link>
                        ))}
                      </>
                    )}

                    {liveResults.jobs.length > 0 && (
                      <>
                        <div className={styles.searchGroupTitle}>Empleos</div>
                        {liveResults.jobs.map(j => (
                          <Link 
                            key={j.id} 
                            href={`/empleo?search=${encodeURIComponent(j.title)}&type=${j.type}`} 
                            className={styles.searchResultItem}
                            onClick={() => setIsDropdownFocused(false)}
                          >
                            <span className={styles.searchResultTitle}>{j.title}</span>
                            <span className={styles.searchResultSub}>🏢 {j.company || 'Particular'} - {j.category}</span>
                          </Link>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* INFO BAR */}
      <section className="container">
        <div className={`${styles.infoBar} glass`}>
          <div className={styles.infoItem}>
            <Calendar size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <span className={styles.infoLabel}>Fecha y Hora: </span>
              <span className={styles.infoValue} style={{ textTransform: 'capitalize' }}>
                {currentDate} {currentTime && `| 🕒 ${currentTime}`}
              </span>
            </div>
          </div>

          <Link href="/clima" className={styles.infoItem} style={{ textDecoration: 'none', transition: 'var(--transition-smooth)' }}>
            <span style={{ fontSize: '1.2rem' }}>{weather.icon}</span>
            <div>
              <span className={styles.infoLabel}>Chimbas: </span>
              <span className={styles.infoValue} style={{ borderBottom: '1px dotted var(--text-secondary)' }}>{weather.temp} ({weather.status})</span>
            </div>
          </Link>

          <div className={styles.infoItem}>
            <button 
              className={`${styles.emergencyLink} urgency-pulse`} 
              onClick={() => setShowEmergencyModal(true)}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '8px' }}
            >
              <AlertTriangle size={18} />
              Teléfonos de Urgencia Chimbas
            </button>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS GRID */}
      <section className="container">
        <div className={styles.actionsGrid}>
          
          <Link href="/guia" className={`${styles.actionCard} glass glass-hover card-violet`}>
            <div className={`${styles.actionIcon} ${styles.iconViolet}`}>
              <Store size={24} />
            </div>
            <h3 className={styles.actionTitle}>Guía Comercial</h3>
            <p className={styles.actionDesc}>
              Buscá y contactá a los locales, profesionales y prestadores de servicios del departamento.
            </p>
            <span className={styles.actionArrow}>
              Ingresar <ArrowRight size={16} />
            </span>
          </Link>

          <Link href="/clasificados" className={`${styles.actionCard} glass glass-hover card-pink`}>
            <div className={`${styles.actionIcon} ${styles.iconPink}`}>
              <Tag size={24} />
            </div>
            <h3 className={styles.actionTitle}>Clasificados</h3>
            <p className={styles.actionDesc}>
              Comprá, vendé o alquilá productos y servicios directamente con vecinos de la zona.
            </p>
            <span className={styles.actionArrow}>
              Ingresar <ArrowRight size={16} />
            </span>
          </Link>

          <Link href="/farmacias" className={`${styles.actionCard} glass glass-hover card-emerald`}>
            <div className={`${styles.actionIcon} ${styles.iconEmerald}`}>
              <HeartPulse size={24} />
            </div>
            <h3 className={styles.actionTitle}>Farmacias de Turno</h3>
            <p className={styles.actionDesc}>
              Revisá qué farmacias están abiertas ahora mismo para atender tus recetas o urgencias.
            </p>
            <span className={styles.actionArrow}>
              Ver mapa <ArrowRight size={16} />
            </span>
          </Link>

          <Link href="/kioscos" className={`${styles.actionCard} glass glass-hover card-amber`}>
            <div className={`${styles.actionIcon} ${styles.iconAmber}`}>
              <Clock size={24} />
            </div>
            <h3 className={styles.actionTitle}>Kioscos Abiertos</h3>
            <p className={styles.actionDesc}>
              ¿Te faltó algo a última hora? Encontrá los maxikioscos y drugstores 24h más cercanos.
            </p>
            <span className={styles.actionArrow}>
              Ver mapa <ArrowRight size={16} />
            </span>
          </Link>

        </div>
      </section>

      {/* GEN-Z MARQUEE TICKER */}
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeContent}>
          <div className={styles.marqueeTrack}>
            <span>Todo Chimbas en un solo lugar</span>
            <span className={styles.marqueeDot}></span>
            <span>Guía Comercial</span>
            <span className={styles.marqueeDot}></span>
            <span>Clasificados de Vecinos</span>
            <span className={styles.marqueeDot}></span>
            <span>Farmacias de Turno 24h</span>
            <span className={styles.marqueeDot}></span>
            <span>Kioscos Abiertos Tarde</span>
            <span className={styles.marqueeDot}></span>
            <span>Noticias al Instante</span>
            <span className={styles.marqueeDot}></span>
          </div>
          <div className={styles.marqueeTrack}>
            <span>Todo Chimbas en un solo lugar</span>
            <span className={styles.marqueeDot}></span>
            <span>Guía Comercial</span>
            <span className={styles.marqueeDot}></span>
            <span>Clasificados de Vecinos</span>
            <span className={styles.marqueeDot}></span>
            <span>Farmacias de Turno 24h</span>
            <span className={styles.marqueeDot}></span>
            <span>Kioscos Abiertos Tarde</span>
            <span className={styles.marqueeDot}></span>
            <span>Noticias al Instante</span>
            <span className={styles.marqueeDot}></span>
          </div>
        </div>
      </div>

      {/* CAROUSEL DE NOTICIAS */}
      <section className={`${styles.newsSection} container`}>
        <div className={styles.sectionHeader}>
          <div>
            <span className="badge badge-open" style={{ marginBottom: '0.5rem', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent-pink)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
              Diario Local
            </span>
            <h2 className={styles.sectionTitle}>Novedades y Actualidad</h2>
          </div>
          <a href="https://elchimbero.com.ar" target="_blank" rel="noopener noreferrer" className={styles.sectionLink}>
            Ir al Diario El Chimbero <ArrowRight size={16} />
          </a>
        </div>

        {newsLoading ? (
          <div className="glass" style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.5s infinite' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Cargando últimas noticias...</span>
          </div>
        ) : newsError || news.length === 0 ? (
          <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No se pudieron cargar las noticias en este momento.
          </div>
        ) : (
          <div 
            className={`${styles.carouselContainer} glass`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Contenido del slide */}
            <div className={styles.carouselSlide}>
              <div className={styles.carouselImageArea}>
                <img 
                  src={news[activeNewsIndex].image_url} 
                  alt={news[activeNewsIndex].title} 
                  className={styles.carouselImage}
                />
                <div className={styles.carouselImageOverlay} />
              </div>
              <div className={styles.carouselTextArea}>
                <div className={styles.carouselMeta}>
                  <span className={styles.newsCategory}>
                    {news[activeNewsIndex].categories[0] || 'Actualidad'}
                  </span>
                  <span className={styles.newsDate}>
                    🕒 {new Date(news[activeNewsIndex].pubDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className={styles.carouselTitle}>{news[activeNewsIndex].title}</h3>
                <p className={styles.carouselDescription}>{news[activeNewsIndex].description}</p>
                <a 
                  href={news[activeNewsIndex].link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary"
                  style={{ marginTop: 'auto', alignSelf: 'flex-start', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                >
                  Leer Noticia Completa <ArrowRight size={16} />
                </a>
              </div>
            </div>

            {/* Controles de navegación */}
            <button 
              className={`${styles.carouselControl} ${styles.controlPrev}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveNewsIndex((prevIndex) => (prevIndex - 1 + news.length) % news.length);
              }}
              aria-label="Noticia anterior"
            >
              &#10094;
            </button>
            <button 
              className={`${styles.carouselControl} ${styles.controlNext}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveNewsIndex((prevIndex) => (prevIndex + 1) % news.length);
              }}
              aria-label="Siguiente noticia"
            >
              &#10095;
            </button>

            {/* Indicadores (dots) */}
            <div className={styles.carouselIndicators}>
              {news.map((_, idx) => (
                <button
                  key={idx}
                  className={`${styles.carouselIndicator} ${idx === activeNewsIndex ? styles.activeIndicator : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNewsIndex(idx);
                  }}
                  aria-label={`Ir a noticia ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* FEATURED BUSINESSES */}
      <section className={`${styles.section} container`}>
        <div className={styles.sectionHeader}>
          <div>
            <span className="badge badge-open" style={{ marginBottom: '0.5rem' }}>Destacados</span>
            <h2 className={styles.sectionTitle}>Comercios Recomendados</h2>
          </div>
          <Link href="/guia" className={styles.sectionLink}>
            Ver todos los comercios <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid-cards">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass" style={{ height: '320px', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : (
          <div className="grid-cards">
            {featuredBusinesses.map((biz) => (
              <div key={biz.id} className="glass glass-hover card-violet" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
                  <div className="zoom-container">
                    <img 
                      src={biz.image_url} 
                      alt={biz.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <span 
                    className="badge badge-open" 
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(15, 23, 42, 0.8)' }}
                  >
                    {biz.category}
                  </span>
                </div>
                
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{biz.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📍 {biz.neighborhood} - {biz.address}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineBreak: 'anywhere', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {biz.description}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <Link href={`/guia/${biz.id}`} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                      Ver Ficha
                    </Link>
                    {biz.whatsapp && (
                      <a 
                        href={`https://wa.me/${biz.whatsapp}?text=Hola,%20vi%20tu%20comercio%20en%20El%20Chimbero!`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-teal whatsapp-pulse"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <MessageCircle size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RECENT CLASSIFIEDS */}
      <section className={`${styles.section} container`}>
        <div className={styles.sectionHeader}>
          <div>
            <span className="badge badge-warning" style={{ marginBottom: '0.5rem' }}>Novedades</span>
            <h2 className={styles.sectionTitle}>Últimos Clasificados</h2>
          </div>
          <Link href="/clasificados" className={styles.sectionLink}>
            Explorar mercado <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid-cards">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass" style={{ height: '300px', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : (
          <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {recentClassifieds.map((ad) => (
              <div key={ad.id} className="glass glass-hover card-pink" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
                  <div className="zoom-container">
                    <img 
                      src={ad.image_url} 
                      alt={ad.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <span 
                    style={{ 
                      position: 'absolute', 
                      bottom: '0.5rem', 
                      left: '0.5rem', 
                      background: 'rgba(139, 92, 246, 0.95)',
                      color: 'white',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem'
                    }}
                  >
                    {ad.price > 0 ? `$${ad.price.toLocaleString('es-AR')}` : 'Consultar'}
                  </span>
                </div>
                
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>
                    {ad.category === 'sale' ? 'Venta' : ad.category === 'rent' ? 'Alquiler' : ad.category === 'service' ? 'Servicio' : 'Empleo'}
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ad.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ad.description}
                  </p>
                  
                  <Link href={`/clasificados/${ad.id}`} className="btn btn-secondary" style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', marginTop: 'auto' }}>
                    Ver Detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* EMERGENCY MODAL */}
      {showEmergencyModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEmergencyModal(false)}>
          <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowEmergencyModal(false)}>
              <X size={20} />
            </button>
            
            <h3 className={styles.modalTitle}>
              <Phone size={22} style={{ color: 'var(--accent-pink)' }} />
              Teléfonos Útiles de Chimbas
            </h3>

            <div className={styles.emergencyList}>
              {emergencyNumbers.map((num, i) => (
                <div key={i} className={styles.emergencyItem}>
                  <span className={styles.emergencyName}>{num.name}</span>
                  <a href={`tel:${num.phone.replace(/\s+/g, '')}`} className={styles.emergencyNumber}>
                    {num.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
