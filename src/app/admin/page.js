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
  HeartPulse, 
  Clock, 
  Calendar, 
  Briefcase, 
  Bus, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Users, 
  MapPin, 
  Phone, 
  DollarSign, 
  AlertTriangle,
  Info
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !(user.is_admin || user.email === 'admin@elchimbero.com'))) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Tab activo: 'stats' | 'businesses' | 'classifieds' | 'pharmacies' | 'kiosks' | 'buses' | 'events' | 'jobs'
  const [activeTab, setActiveTab] = useState('stats');

  // Datos del dashboard
  const [businesses, setBusinesses] = useState([]);
  const [classifieds, setClassifieds] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [kiosks, setKiosks] = useState([]);
  const [buses, setBuses] = useState([]);
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Mensaje de feedback
  const [message, setMessage] = useState(null);

  // Modales
  const [showModal, setShowModal] = useState(null); // 'pharmacy' | 'kiosk' | 'bus' | 'event' | 'job' | 'business' | null
  
  // Estados para formularios de creación
  const [pharmacyForm, setPharmacyForm] = useState({ name: '', address: '', phone: '', latitude: '', longitude: '', duty_dates: '', is_open_24h: false });
  const [kioskForm, setKioskForm] = useState({ name: '', address: '', neighborhood: '', phone: '', latitude: '', longitude: '', is_open_24h: true, hours_description: '' });
  const [busForm, setBusForm] = useState({ line: '', description: '', type: 'interno_chimbas', frequency: '', neighborhoods: '', stops: '', stops_vuelta: '', schedule: '' });
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', time: '', location: '', category: 'Cultura', image_url: '', price: '0' });
  const [jobForm, setJobForm] = useState({ title: '', description: '', type: 'oferta_laboral', category: '', price: '0', company: '', contact_name: '', whatsapp: '' });
  const [businessForm, setBusinessForm] = useState({ name: '', description: '', category: 'Gastronomía', address: '', neighborhood: '', phone: '', whatsapp: '', latitude: '', longitude: '', image_url: '', hours_lunes_viernes: '09:00 - 13:00, 17:00 - 21:00', hours_sabado_domingo: 'Cerrado' });

  // Cargar todos los datos del portal
  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const bizData = await db.getAllBusinessesAdmin();
      const adsData = await db.getClassifieds();
      const pharData = await db.getPharmacies();
      const kiosData = await db.getKiosks();
      const busData = await db.getBuses();
      const eveData = await db.getEvents();
      const jobData = await db.getJobs();

      setBusinesses(bizData || []);
      setClassifieds(adsData || []);
      setPharmacies(pharData || []);
      setKiosks(kiosData || []);
      setBuses(busData || []);
      setEvents(eveData || []);
      setJobs(jobData || []);
    } catch (error) {
      console.error('Error al cargar datos del administrador:', error);
      setMessage({ type: 'error', text: 'Error al conectar con la base de datos.' });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAllData();
  }, []);

  // Mostrar mensaje de éxito/error temporal
  const showFeedback = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // --- ACCIONES DE GESTIÓN ---

  // Aprobar/Rechazar Comercio
  const handleUpdateBusinessStatus = async (id, status) => {
    try {
      await db.updateBusinessStatus(id, status);
      showFeedback('success', `Comercio ${status === 'approved' ? 'aprobado' : 'rechazado'} correctamente.`);
      loadAllData();
    } catch (error) {
      showFeedback('error', 'Error al actualizar el estado del comercio.');
    }
  };

  // Eliminar Comercio
  const handleDeleteBusiness = async (id) => {
    if (!window.confirm('¿Estás seguro de que querés borrar este comercio permanentemente?')) return;
    try {
      await db.deleteBusiness(id);
      showFeedback('success', 'Comercio eliminado correctamente.');
      loadAllData();
    } catch (error) {
      showFeedback('error', 'Error al eliminar el comercio.');
    }
  };

  // Eliminar Clasificado
  const handleDeleteClassified = async (id) => {
    if (!window.confirm('¿Estás seguro de que querés borrar este aviso clasificado?')) return;
    try {
      await db.deleteClassified(id);
      showFeedback('success', 'Aviso clasificado eliminado.');
      loadAllData();
    } catch (error) {
      showFeedback('error', 'Error al borrar el clasificado.');
    }
  };

  // Eliminar Farmacia
  const handleDeletePharmacy = async (id) => {
    if (!window.confirm('¿Estás seguro de que querés eliminar esta farmacia de turno?')) return;
    try {
      await db.deletePharmacy(id);
      showFeedback('success', 'Farmacia eliminada.');
      loadAllData();
    } catch (error) {
      showFeedback('error', 'Error al borrar la farmacia.');
    }
  };

  // Eliminar Kiosco
  const handleDeleteKiosk = async (id) => {
    if (!window.confirm('¿Estás seguro de que querés eliminar este kiosco?')) return;
    try {
      await db.deleteKiosk(id);
      showFeedback('success', 'Kiosco eliminado.');
      loadAllData();
    } catch (error) {
      showFeedback('error', 'Error al borrar el kiosco.');
    }
  };

  // Eliminar Colectivo
  const handleDeleteBus = async (id) => {
    if (!window.confirm('¿Estás seguro de que querés borrar este colectivo?')) return;
    try {
      await db.deleteBus(id);
      showFeedback('success', 'Línea de colectivo eliminada.');
      loadAllData();
    } catch (error) {
      showFeedback('error', 'Error al borrar el colectivo.');
    }
  };

  // Eliminar Evento
  const handleDeleteEvent = async (id) => {
    if (!window.confirm('¿Estás seguro de que querés borrar este evento de la agenda?')) return;
    try {
      await db.deleteEvent(id);
      showFeedback('success', 'Evento eliminado.');
      loadAllData();
    } catch (error) {
      showFeedback('error', 'Error al borrar el evento.');
    }
  };

  // Eliminar Empleo
  const handleDeleteJob = async (id) => {
    if (!window.confirm('¿Estás seguro de que querés borrar esta oferta de empleo?')) return;
    try {
      await db.deleteJob(id);
      showFeedback('success', 'Publicación de empleo eliminada.');
      loadAllData();
    } catch (error) {
      showFeedback('error', 'Error al borrar el empleo.');
    }
  };

  // --- ENVÍO DE FORMULARIOS (CREACIÓN) ---

  const handleCreatePharmacy = async (e) => {
    e.preventDefault();
    try {
      // Separar fechas por comas
      const datesArray = pharmacyForm.duty_dates
        .split(',')
        .map(d => d.trim())
        .filter(d => d.match(/^\d{4}-\d{2}-\d{2}$/));

      await db.createPharmacy({
        ...pharmacyForm,
        duty_dates: datesArray
      });
      showFeedback('success', 'Farmacia creada exitosamente.');
      setShowModal(null);
      setPharmacyForm({ name: '', address: '', phone: '', latitude: '', longitude: '', duty_dates: '', is_open_24h: false });
      loadAllData();
    } catch (error) {
      showFeedback('error', 'Error al crear la farmacia.');
    }
  };

  const handleCreateKiosk = async (e) => {
    e.preventDefault();
    try {
      await db.createKiosk(kioskForm);
      showFeedback('success', 'Kiosco agregado correctamente.');
      setShowModal(null);
      setKioskForm({ name: '', address: '', neighborhood: '', phone: '', latitude: '', longitude: '', is_open_24h: true, hours_description: '' });
      loadAllData();
    } catch (error) {
      showFeedback('error', 'Error al registrar el kiosco.');
    }
  };

  const handleCreateBus = async (e) => {
    e.preventDefault();
    try {
      // Formatear barrios y paradas
      const neighborhoodsArray = busForm.neighborhoods.split(',').map(n => n.trim()).filter(Boolean);
      const stopsArray = busForm.stops.split(',').map(s => s.trim()).filter(Boolean);
      const stopsVueltaArray = busForm.stops_vuelta.split(',').map(s => s.trim()).filter(Boolean);

      await db.createBus({
        ...busForm,
        neighborhoods: neighborhoodsArray,
        stops: stopsArray,
        stops_vuelta: stopsVueltaArray
      });
      showFeedback('success', 'Línea de colectivo registrada.');
      setShowModal(null);
      setBusForm({ line: '', description: '', type: 'interno_chimbas', frequency: '', neighborhoods: '', stops: '', stops_vuelta: '', schedule: '' });
      loadAllData();
    } catch (error) {
      showFeedback('error', 'Error al registrar la línea de colectivo.');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await db.createEvent({
        ...eventForm,
        price: parseFloat(eventForm.price) || 0
      });
      showFeedback('success', 'Evento programado exitosamente.');
      setShowModal(null);
      setEventForm({ title: '', description: '', date: '', time: '', location: '', category: 'Cultura', image_url: '', price: '0' });
      loadAllData();
    } catch (error) {
      showFeedback('error', 'Error al registrar el evento.');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await db.createJob({
        ...jobForm,
        price: parseFloat(jobForm.price) || 0
      });
      showFeedback('success', 'Puesto de trabajo / servicio vecinal agregado.');
      setShowModal(null);
      setJobForm({ title: '', description: '', type: 'oferta_laboral', category: '', price: '0', company: '', contact_name: '', whatsapp: '' });
      loadAllData();
    } catch (error) {
      showFeedback('error', 'Error al publicar en la bolsa de empleo.');
    }
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    try {
      await db.createBusiness({
        name: businessForm.name,
        description: businessForm.description,
        category: businessForm.category,
        address: businessForm.address,
        neighborhood: businessForm.neighborhood,
        phone: businessForm.phone,
        whatsapp: businessForm.whatsapp,
        latitude: businessForm.latitude,
        longitude: businessForm.longitude,
        image_url: businessForm.image_url,
        hours: {
          lunes_a_viernes: businessForm.hours_lunes_viernes,
          sabado_y_domingo: businessForm.hours_sabado_domingo
        }
      });
      showFeedback('success', 'Comercio agregado y auto-aprobado exitosamente.');
      setShowModal(null);
      setBusinessForm({ name: '', description: '', category: 'Gastronomía', address: '', neighborhood: '', phone: '', whatsapp: '', latitude: '', longitude: '', image_url: '', hours_lunes_viernes: '09:00 - 13:00, 17:00 - 21:00', hours_sabado_domingo: 'Cerrado' });
      loadAllData();
    } catch (error) {
      showFeedback('error', 'Error al registrar el comercio.');
    }
  };

  // --- FILTROS DE CONTENIDO ---
  const pendingBusinesses = businesses.filter(b => b.status === 'pending');
  const approvedBusinesses = businesses.filter(b => b.status === 'approved');

  if (loading || !user || !(user.is_admin || user.email === 'admin@elchimbero.com')) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cargando administrador...</h2>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
      
      {/* HEADER */}
      <header style={{ padding: '3.5rem 0 2rem 0', borderBottom: '1px solid var(--border-glass)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <LayoutDashboard size={36} className="text-glow" style={{ color: 'var(--accent-pink)' }} />
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }} className="gradient-text">Panel de Administración</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Portal de control global de contenido para **El Chimbero**
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              Volver al Inicio
            </Link>
            <button onClick={loadAllData} className="btn btn-primary" style={{ fontSize: '0.85rem', background: 'var(--primary-gradient)', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }}>
              Sincronizar Datos
            </button>
          </div>
        </div>
      </header>

      {/* FEEDBACK POPUP */}
      {message && (
        <div 
          className="glass fade-in"
          style={{ 
            padding: '1.25rem', 
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
            color: message.type === 'success' ? '#34d399' : '#f87171', 
            borderRadius: '12px', 
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, 
            marginBottom: '2rem', 
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={18} />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 800 }}>✕</button>
        </div>
      )}

      {/* TABS PRINCIPALES */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '2.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
        {[
          { id: 'stats', label: 'Estadísticas', icon: <LayoutDashboard size={16} /> },
          { id: 'businesses', label: `Comercios (${businesses.length})`, icon: <Store size={16} /> },
          { id: 'classifieds', label: `Clasificados (${classifieds.length})`, icon: <Tag size={16} /> },
          { id: 'pharmacies', label: `Farmacias (${pharmacies.length})`, icon: <HeartPulse size={16} /> },
          { id: 'kiosks', label: `Kioscos (${kiosks.length})`, icon: <Clock size={16} /> },
          { id: 'buses', label: `Colectivos (${buses.length})`, icon: <Bus size={16} /> },
          { id: 'events', label: `Eventos (${events.length})`, icon: <Calendar size={16} /> },
          { id: 'jobs', label: `Empleos (${jobs.length})`, icon: <Briefcase size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="btn"
            style={{
              background: activeTab === tab.id ? 'var(--primary-gradient)' : 'none',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? 'none' : 'none',
              padding: '0.6rem 1.2rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-smooth)'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* DETALLES DE CARGA */}
      {loadingData ? (
        <div style={{ padding: '6rem 0', textAlign: 'center' }}>
          <h2 style={{ animation: 'pulse 1.5s infinite', color: 'var(--text-secondary)' }}>Cargando base de datos completa del portal...</h2>
        </div>
      ) : (
        <>
          {/* TAB 1: ESTADÍSTICAS */}
          {activeTab === 'stats' && (
            <div className="fade-in">
              {/* ALERTA DE PENDIENTES */}
              {pendingBusinesses.length > 0 && (
                <div className="glass" style={{ padding: '1.25rem 2rem', background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <AlertTriangle size={24} />
                    <div>
                      <strong style={{ color: 'white' }}>Solicitudes Pendientes:</strong> Hay {pendingBusinesses.length} comercio(s) esperando aprobación.
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('businesses')} className="btn btn-primary" style={{ background: '#f59e0b', color: 'black', fontWeight: 700, fontSize: '0.85rem' }}>
                    Ver Solicitudes
                  </button>
                </div>
              )}

              {/* GRILLA DE ESTADÍSTICAS */}
              <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                  { title: 'Comercios Totales', value: businesses.length, desc: `${approvedBusinesses.length} aprobados / ${pendingBusinesses.length} pendientes`, icon: <Store size={22} />, color: 'var(--primary)' },
                  { title: 'Clasificados Activos', value: classifieds.length, desc: 'Publicaciones de vecinos', icon: <Tag size={22} />, color: 'var(--accent-pink)' },
                  { title: 'Farmacias Turno', value: pharmacies.length, desc: 'Guardias en Chimbas', icon: <HeartPulse size={22} />, color: 'var(--color-open)' },
                  { title: 'Kioscos 24h/Tarde', value: kiosks.length, desc: 'Kioscos cargados', icon: <Clock size={22} />, color: 'var(--secondary)' },
                  { title: 'Eventos Agenda', value: events.length, desc: 'Actividades programadas', icon: <Calendar size={22} />, color: '#ec4899' },
                  { title: 'Ofertas Laborales', value: jobs.length, desc: 'Bolsa de trabajo activa', icon: <Briefcase size={22} />, color: '#a78bfa' },
                  { title: 'Líneas Colectivo', value: buses.length, desc: 'Recorridos RedTulum', icon: <Bus size={22} />, color: '#10b981' },
                ].map((stat, i) => (
                  <div key={i} className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.title}</span>
                      <div style={{ color: stat.color }}>{stat.icon}</div>
                    </div>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>{stat.value}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.desc}</span>
                    {/* Decoración de fondo */}
                    <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.03, transform: 'scale(2.5)', color: stat.color }}>
                      {stat.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* ACCIONES RÁPIDAS EN PANEL */}
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Agregar nuevo contenido al portal</h2>
              <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                {[
                  { title: 'Registrar Comercio', desc: 'Suma un negocio o servicio a la guía.', action: () => setShowModal('business'), icon: <Store /> },
                  { title: 'Programar Farmacia', desc: 'Asigna fechas de guardia de turno.', action: () => setShowModal('pharmacy'), icon: <HeartPulse /> },
                  { title: 'Registrar Kiosco 24h', desc: 'Suma un maxikiosco al mapa nocturno.', action: () => setShowModal('kiosk'), icon: <Clock /> },
                  { title: 'Sumar Recorrido Colectivo', desc: 'Configura una línea de RedTulum.', action: () => setShowModal('bus'), icon: <Bus /> },
                  { title: 'Agenda de Eventos', desc: 'Promociona festivales o talleres.', action: () => setShowModal('event'), icon: <Calendar /> },
                  { title: 'Publicar Vacante / Servicio', desc: 'Agrega a la bolsa de empleo.', action: () => setShowModal('job'), icon: <Briefcase /> }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="glass glass-hover" 
                    onClick={item.action} 
                    style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem', transition: 'all 0.3s ease' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
                      {item.icon}
                      <h3>{item.title}</h3>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
                    <span className="gradient-text" style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Plus size={16} /> Abrir Formulario
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: COMERCIOS */}
          {activeTab === 'businesses' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Listado de Comercios</h2>
                <button onClick={() => setShowModal('business')} className="btn btn-primary" style={{ gap: '0.35rem', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Agregar Comercio
                </button>
              </div>

              {businesses.length === 0 ? (
                <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay comercios registrados.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {businesses.map(biz => (
                    <div key={biz.id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <img src={biz.image_url} alt={biz.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{biz.name}</h3>
                            {biz.status === 'pending' ? (
                              <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Pendiente</span>
                            ) : biz.status === 'approved' ? (
                              <span className="badge badge-open" style={{ fontSize: '0.7rem' }}>Aprobado</span>
                            ) : (
                              <span className="badge badge-closed" style={{ fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>Rechazado</span>
                            )}
                            {biz.is_featured && <span className="badge badge-open" style={{ fontSize: '0.7rem', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', borderColor: '#a78bfa' }}>Destacado</span>}
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            📍 {biz.neighborhood} - {biz.address} | Categoría: <strong>{biz.category}</strong>
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {biz.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleUpdateBusinessStatus(biz.id, 'approved')} 
                              className="btn btn-teal" 
                              style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', gap: '0.25rem' }}
                            >
                              <Check size={14} /> Aprobar
                            </button>
                            <button 
                              onClick={() => handleUpdateBusinessStatus(biz.id, 'rejected')} 
                              className="btn btn-secondary" 
                              style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)', gap: '0.25rem' }}
                            >
                              <X size={14} /> Rechazar
                            </button>
                          </>
                        )}
                        <Link href={`/guia/${biz.id}`} className="btn btn-secondary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}>
                          Ficha
                        </Link>
                        <button 
                          onClick={() => handleDeleteBusiness(biz.id)} 
                          className="btn btn-primary" 
                          style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', background: 'var(--color-closed)', boxShadow: 'none' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLASIFICADOS */}
          {activeTab === 'classifieds' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Clasificados Activos</h2>

              {classifieds.length === 0 ? (
                <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay avisos clasificados publicados.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {classifieds.map(ad => (
                    <div key={ad.id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <img src={ad.image_url} alt={ad.title} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{ad.title}</h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Precio: <strong>${ad.price.toLocaleString('es-AR')}</strong> | Rubro: <strong>{ad.category}</strong> | Contacto: {ad.whatsapp}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link href={`/clasificados/${ad.id}`} className="btn btn-secondary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}>
                          Ver Detalle
                        </Link>
                        <button 
                          onClick={() => handleDeleteClassified(ad.id)} 
                          className="btn btn-primary" 
                          style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', background: 'var(--color-closed)', boxShadow: 'none' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FARMACIAS */}
          {activeTab === 'pharmacies' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Farmacias y Calendario de Guardia</h2>
                <button onClick={() => setShowModal('pharmacy')} className="btn btn-primary" style={{ gap: '0.35rem', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Programar Turno
                </button>
              </div>

              {pharmacies.length === 0 ? (
                <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay farmacias cargadas.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pharmacies.map(phar => (
                    <div key={phar.id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{phar.name}</h3>
                          {phar.is_open_24h && <span className="badge badge-open" style={{ fontSize: '0.7rem' }}>24 Horas</span>}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          📍 {phar.address} | 📞 {phar.phone || 'Sin teléfono'}
                        </p>
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Fechas de turno:</span>
                          {phar.duty_dates.map((date, idx) => (
                            <span key={idx} className="badge badge-open" style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: 'none' }}>{date}</span>
                          ))}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDeletePharmacy(phar.id)} 
                        className="btn btn-primary" 
                        style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', background: 'var(--color-closed)', boxShadow: 'none' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: KIOSCOS */}
          {activeTab === 'kiosks' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Kioscos de Turno Nocturno / 24h</h2>
                <button onClick={() => setShowModal('kiosk')} className="btn btn-primary" style={{ gap: '0.35rem', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Agregar Kiosco
                </button>
              </div>

              {kiosks.length === 0 ? (
                <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay kioscos cargados.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {kiosks.map(kio => (
                    <div key={kio.id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{kio.name}</h3>
                          {kio.is_open_24h ? (
                            <span className="badge badge-open" style={{ fontSize: '0.7rem' }}>Abierto 24hs</span>
                          ) : (
                            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Tarde/Noche</span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          📍 {kio.neighborhood} - {kio.address} | 📞 {kio.phone || 'Sin teléfono'}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          _{kio.hours_description}_
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteKiosk(kio.id)} 
                        className="btn btn-primary" 
                        style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', background: 'var(--color-closed)', boxShadow: 'none' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: COLECTIVOS */}
          {activeTab === 'buses' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Colectivos RedTulum</h2>
                <button onClick={() => setShowModal('bus')} className="btn btn-primary" style={{ gap: '0.35rem', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Registrar Colectivo
                </button>
              </div>

              {buses.length === 0 ? (
                <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay líneas registradas.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {buses.map(bus => (
                    <div key={bus.id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{bus.line}</h3>
                          <span className="badge badge-open" style={{ fontSize: '0.7rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderColor: '#60a5fa' }}>
                            {bus.type === 'capital_conexion' ? 'Conexión Capital' : bus.type === 'interno_chimbas' ? 'Interno Chimbas' : 'Universidad/Salud'}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🕒 Frecuencia: {bus.frequency}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{bus.description}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          <strong>Zonas:</strong> {bus.neighborhoods.join(', ')}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <strong>Paradas clave (Ida):</strong> {bus.stops.join(' ➔ ')}
                        </p>
                        {bus.stops_vuelta && bus.stops_vuelta.length > 0 && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <strong>Paradas clave (Vuelta):</strong> {bus.stops_vuelta.join(' ➔ ')}
                          </p>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteBus(bus.id)} 
                        className="btn btn-primary" 
                        style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', background: 'var(--color-closed)', boxShadow: 'none' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: EVENTOS */}
          {activeTab === 'events' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Agenda de Eventos</h2>
                <button onClick={() => setShowModal('event')} className="btn btn-primary" style={{ gap: '0.35rem', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Crear Evento
                </button>
              </div>

              {events.length === 0 ? (
                <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay eventos agendados.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {events.map(eve => (
                    <div key={eve.id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <img src={eve.image_url} alt={eve.title} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{eve.title}</h3>
                            <span className="badge badge-open" style={{ fontSize: '0.7rem', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent-pink)' }}>{eve.category}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            📅 {eve.date} a las {eve.time || 'Horario a confirmar'} | 📍 {eve.location}
                          </p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Entrada: <strong>{eve.price > 0 ? `$${eve.price.toLocaleString('es-AR')}` : 'Gratis'}</strong></p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteEvent(eve.id)} 
                        className="btn btn-primary" 
                        style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', background: 'var(--color-closed)', boxShadow: 'none' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: EMPLEOS */}
          {activeTab === 'jobs' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Bolsa de Empleo y Servicios</h2>
                <button onClick={() => setShowModal('job')} className="btn btn-primary" style={{ gap: '0.35rem', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Publicar Empleo/Servicio
                </button>
              </div>

              {jobs.length === 0 ? (
                <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay ofertas de empleo cargadas.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {jobs.map(job => (
                    <div key={job.id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{job.title}</h3>
                          <span className="badge badge-open" style={{ fontSize: '0.7rem', background: job.type === 'oferta_laboral' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)', color: job.type === 'oferta_laboral' ? '#34d399' : '#a78bfa', borderColor: 'transparent' }}>
                            {job.type === 'oferta_laboral' ? 'Oferta Laboral' : 'Servicio Vecinal'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          Empresa/Particular: <strong>{job.company}</strong> | Contacto: {job.contact_name} (💬 {job.whatsapp})
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Categoría: {job.category}</p>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteJob(job.id)} 
                        className="btn btn-primary" 
                        style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', background: 'var(--color-closed)', boxShadow: 'none' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* --- MODALES DE CREACIÓN DE CONTENIDO --- */}

      {showModal && (
        <div 
          onClick={() => setShowModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
            overflowY: 'auto'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="glass"
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '2.5rem',
              borderRadius: '16px',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Botón Cerrar */}
            <button 
              onClick={() => setShowModal(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>

            {/* FORMULARIO 1: COMERCIO */}
            {showModal === 'business' && (
              <form onSubmit={handleCreateBusiness} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="gradient-text">
                  <Store /> Registrar Nuevo Comercio
                </h2>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Nombre del Comercio *</label>
                  <input required type="text" placeholder="Ej: Verdulería La Chimbera" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={businessForm.name} onChange={e => setBusinessForm({...businessForm, name: e.target.value})} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Descripción *</label>
                  <textarea required placeholder="¿Qué vende o qué servicios ofrece?" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', height: '80px', resize: 'none' }} value={businessForm.description} onChange={e => setBusinessForm({...businessForm, description: e.target.value})} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Categoría *</label>
                    <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(15,23,42,0.9)', border: '1px solid var(--border-glass)', color: 'white' }} value={businessForm.category} onChange={e => setBusinessForm({...businessForm, category: e.target.value})}>
                      <option value="Gastronomía">Gastronomía</option>
                      <option value="Almacén y Comestibles">Almacén y Comestibles</option>
                      <option value="Construcción y Ferretería">Construcción y Ferretería</option>
                      <option value="Automotores y Servicios">Automotores y Servicios</option>
                      <option value="Indumentaria y Calzado">Indumentaria y Calzado</option>
                      <option value="Salud y Belleza">Salud y Belleza</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Barrio / Zona *</label>
                    <input required type="text" placeholder="Ej: Villa Paula" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={businessForm.neighborhood} onChange={e => setBusinessForm({...businessForm, neighborhood: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Dirección *</label>
                    <input required type="text" placeholder="Ej: Mendoza 1220 (Norte)" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={businessForm.address} onChange={e => setBusinessForm({...businessForm, address: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>WhatsApp *</label>
                    <input required type="text" placeholder="Ej: 542644112233" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={businessForm.whatsapp} onChange={e => setBusinessForm({...businessForm, whatsapp: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Horarios Lun a Vie</label>
                    <input type="text" placeholder="Ej: 09:00 - 13:00" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={businessForm.hours_lunes_viernes} onChange={e => setBusinessForm({...businessForm, hours_lunes_viernes: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Horarios Sáb y Dom</label>
                    <input type="text" placeholder="Ej: Cerrado" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={businessForm.hours_sabado_domingo} onChange={e => setBusinessForm({...businessForm, hours_sabado_domingo: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>URL de Imagen</label>
                  <input type="text" placeholder="URL de Unsplash o similar" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={businessForm.image_url} onChange={e => setBusinessForm({...businessForm, image_url: e.target.value})} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', fontWeight: 700, marginTop: '0.5rem', background: 'var(--primary-gradient)' }}>
                  Registrar Comercio
                </button>
              </form>
            )}

            {/* FORMULARIO 2: FARMACIA */}
            {showModal === 'pharmacy' && (
              <form onSubmit={handleCreatePharmacy} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="gradient-text">
                  <HeartPulse /> Programar Guardia de Farmacia
                </h2>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Nombre de la Farmacia *</label>
                  <input required type="text" placeholder="Ej: Farmacia San Cayetano" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={pharmacyForm.name} onChange={e => setPharmacyForm({...pharmacyForm, name: e.target.value})} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Dirección *</label>
                  <input required type="text" placeholder="Ej: Tucumán 1320 (Norte) - Villa Paula" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={pharmacyForm.address} onChange={e => setPharmacyForm({...pharmacyForm, address: e.target.value})} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Teléfono</label>
                    <input type="text" placeholder="Ej: 264-4315566" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={pharmacyForm.phone} onChange={e => setPharmacyForm({...pharmacyForm, phone: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <input type="checkbox" id="open24" style={{ transform: 'scale(1.3)' }} checked={pharmacyForm.is_open_24h} onChange={e => setPharmacyForm({...pharmacyForm, is_open_24h: e.target.checked})} />
                    <label htmlFor="open24" style={{ fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>¿Abierto 24 horas?</label>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Fechas de guardia de turno *</label>
                  <input required type="text" placeholder="Formato: AAAA-MM-DD, AAAA-MM-DD (separadas por coma)" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={pharmacyForm.duty_dates} onChange={e => setPharmacyForm({...pharmacyForm, duty_dates: e.target.value})} />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginTop: '0.25rem' }}>
                    Ingresa las fechas separadas por comas. Ejemplo: 2026-06-14, 2026-06-16
                  </small>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Latitud (Opcional)</label>
                    <input type="text" placeholder="-31.4951" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={pharmacyForm.latitude} onChange={e => setPharmacyForm({...pharmacyForm, latitude: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Longitud (Opcional)</label>
                    <input type="text" placeholder="-68.5345" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={pharmacyForm.longitude} onChange={e => setPharmacyForm({...pharmacyForm, longitude: e.target.value})} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', fontWeight: 700, marginTop: '0.5rem', background: 'var(--primary-gradient)' }}>
                  Registrar Turno de Farmacia
                </button>
              </form>
            )}

            {/* FORMULARIO 3: KIOSCO */}
            {showModal === 'kiosk' && (
              <form onSubmit={handleCreateKiosk} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="gradient-text">
                  <Clock /> Sumar Kiosco Abierto Tarde/24hs
                </h2>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Nombre del Kiosco *</label>
                  <input required type="text" placeholder="Ej: Kiosco El Trébol 24hs" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={kioskForm.name} onChange={e => setKioskForm({...kioskForm, name: e.target.value})} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Dirección *</label>
                    <input required type="text" placeholder="Ej: Mendoza y Chubut" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={kioskForm.address} onChange={e => setKioskForm({...kioskForm, address: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Barrio *</label>
                    <input required type="text" placeholder="Ej: Villa Paula" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={kioskForm.neighborhood} onChange={e => setKioskForm({...kioskForm, neighborhood: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Teléfono</label>
                    <input type="text" placeholder="Ej: 264-4098712" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={kioskForm.phone} onChange={e => setKioskForm({...kioskForm, phone: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <input type="checkbox" id="kiosk24" style={{ transform: 'scale(1.3)' }} checked={kioskForm.is_open_24h} onChange={e => setKioskForm({...kioskForm, is_open_24h: e.target.checked})} />
                    <label htmlFor="kiosk24" style={{ fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>¿Abierto 24hs completo?</label>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Detalle de horario / Oferta *</label>
                  <input required type="text" placeholder="Ej: Carga sube, bebidas frías, cigarrillos, golosinas..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={kioskForm.hours_description} onChange={e => setKioskForm({...kioskForm, hours_description: e.target.value})} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', fontWeight: 700, marginTop: '0.5rem', background: 'var(--primary-gradient)' }}>
                  Registrar Kiosco
                </button>
              </form>
            )}

            {/* FORMULARIO 4: COLECTIVO */}
            {showModal === 'bus' && (
              <form onSubmit={handleCreateBus} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="gradient-text">
                  <Bus /> Configurar Línea de Colectivo (RedTulum)
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Línea *</label>
                    <input required type="text" placeholder="Ej: Línea 400" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={busForm.line} onChange={e => setBusForm({...busForm, line: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Tipo de Servicio *</label>
                    <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(15,23,42,0.9)', border: '1px solid var(--border-glass)', color: 'white' }} value={busForm.type} onChange={e => setBusForm({...busForm, type: e.target.value})}>
                      <option value="interno_chimbas">Interno Chimbas</option>
                      <option value="capital_conexion">Conexión Capital</option>
                      <option value="salud_universidad">Universidad / Salud</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Descripción de ruta *</label>
                  <input required type="text" placeholder="Ej: Conexión entre Chimbas Oeste y el centro de San Juan" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={busForm.description} onChange={e => setBusForm({...busForm, description: e.target.value})} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Frecuencia *</label>
                    <input required type="text" placeholder="Ej: Cada 12 minutos" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={busForm.frequency} onChange={e => setBusForm({...busForm, frequency: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Horarios *</label>
                    <input required type="text" placeholder="Ej: Lun a Vie 05:00 a 23:45" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={busForm.schedule} onChange={e => setBusForm({...busForm, schedule: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Barrios / Distritos de paso *</label>
                  <input required type="text" placeholder="Ej: Villa Paula, B° Los Tamarindos, Villa Obrera (separados por coma)" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={busForm.neighborhoods} onChange={e => setBusForm({...busForm, neighborhoods: e.target.value})} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Paradas Clave (Ida) *</label>
                  <input required type="text" placeholder="Ej: Plaza de Chimbas, Calle Benavidez, Hospital Rawson (separados por coma)" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={busForm.stops} onChange={e => setBusForm({...busForm, stops: e.target.value})} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Paradas de Vuelta (Opcional)</label>
                  <input type="text" placeholder="Ej: Hospital Rawson, Terminal de Ómnibus, Plaza de Chimbas (vacío para invertir Ida)" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={busForm.stops_vuelta} onChange={e => setBusForm({...busForm, stops_vuelta: e.target.value})} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', fontWeight: 700, marginTop: '0.5rem', background: 'var(--primary-gradient)' }}>
                  Registrar Línea
                </button>
              </form>
            )}

            {/* FORMULARIO 5: EVENTO */}
            {showModal === 'event' && (
              <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="gradient-text">
                  <Calendar /> Programar Evento en Agenda
                </h2>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Título del Evento *</label>
                  <input required type="text" placeholder="Ej: Fiesta Provincial de la Empanada Sanjuanina" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Descripción / Detalles *</label>
                  <textarea required placeholder="Artistas invitados, actividades, academias de baile..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', height: '80px', resize: 'none' }} value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Fecha *</label>
                    <input required type="date" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Hora (Opcional)</label>
                    <input type="time" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={eventForm.time} onChange={e => setEventForm({...eventForm, time: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Lugar / Ubicación *</label>
                    <input required type="text" placeholder="Ej: Plaza Centenario de Chimbas" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Categoría *</label>
                    <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(15,23,42,0.9)', border: '1px solid var(--border-glass)', color: 'white' }} value={eventForm.category} onChange={e => setEventForm({...eventForm, category: e.target.value})}>
                      <option value="Cultura">Cultura</option>
                      <option value="Gastronomía">Gastronomía</option>
                      <option value="Deportes">Deportes</option>
                      <option value="Talleres">Talleres</option>
                      <option value="Social">Social</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Precio de entrada (AR$)</label>
                    <input type="number" placeholder="Ej: 0 para gratis" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={eventForm.price} onChange={e => setEventForm({...eventForm, price: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Imagen (Opcional)</label>
                    <input type="text" placeholder="URL de la imagen" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={eventForm.image_url} onChange={e => setEventForm({...eventForm, image_url: e.target.value})} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', fontWeight: 700, marginTop: '0.5rem', background: 'var(--primary-gradient)' }}>
                  Registrar Evento
                </button>
              </form>
            )}

            {/* FORMULARIO 6: EMPLEO */}
            {showModal === 'job' && (
              <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="gradient-text">
                  <Briefcase /> Registrar Oferta de Trabajo / Servicio
                </h2>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Título de la Publicación *</label>
                  <input required type="text" placeholder="Ej: Mozo para Pizzería local" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Descripción / Requisitos *</label>
                  <textarea required placeholder="Horarios, tareas a realizar, zona, requisitos del puesto..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', height: '80px', resize: 'none' }} value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Tipo de publicación *</label>
                    <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(15,23,42,0.9)', border: '1px solid var(--border-glass)', color: 'white' }} value={jobForm.type} onChange={e => setJobForm({...jobForm, type: e.target.value})}>
                      <option value="oferta_laboral">Oferta Laboral</option>
                      <option value="servicio_vecinal">Servicio Vecinal (Ofrecido)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Rubro / Categoría *</label>
                    <input required type="text" placeholder="Ej: Gastronomía, Construcción, Limpieza..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={jobForm.category} onChange={e => setJobForm({...jobForm, category: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Empresa / Empleador *</label>
                    <input required type="text" placeholder="Ej: Particular o nombre de negocio" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={jobForm.company} onChange={e => setJobForm({...jobForm, company: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Sueldo / Valor (Opcional)</label>
                    <input type="number" placeholder="Ej: 0 si es a convenir" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={jobForm.price} onChange={e => setJobForm({...jobForm, price: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Nombre de Contacto *</label>
                    <input required type="text" placeholder="Ej: Laura Fernández" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={jobForm.contact_name} onChange={e => setJobForm({...jobForm, contact_name: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>WhatsApp *</label>
                    <input required type="text" placeholder="Ej: 542645112233" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white' }} value={jobForm.whatsapp} onChange={e => setJobForm({...jobForm, whatsapp: e.target.value})} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', fontWeight: 700, marginTop: '0.5rem', background: 'var(--primary-gradient)' }}>
                  Publicar
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
