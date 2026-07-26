// Abstracción de Base de Datos y Autenticación
// Conecta con Supabase si las credenciales existen, de lo contrario cae en un Mock local persistente en localStorage.

import { createClient } from '@supabase/supabase-js';
import { initialBusinesses, initialClassifieds, initialPharmacies, initialKiosks, initialProfiles, initialEvents, initialBuses, initialJobs } from './mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validar si tenemos claves reales de Supabase
const hasRealSupabase = 
  supabaseUrl && 
  supabaseUrl !== 'https://placeholder-url.supabase.co' && 
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'placeholder-anon-key' &&
  supabaseAnonKey.trim() !== '';

let supabaseClient = null;
if (hasRealSupabase) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error inicializando Supabase Client:', error);
  }
}

export const isMock = !supabaseClient;
export { supabaseClient };

// --- FUNCIONES MOCK (LocalStorage para persistencia en el browser) ---
const getStorageItem = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setStorageItem = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error al guardar en localStorage:', e);
  }
};

// Inicializar localStorage si no existe
const initMockDB = () => {
  if (typeof window === 'undefined') return;
  if (!window.localStorage.getItem('chimbero_businesses')) {
    setStorageItem('chimbero_businesses', initialBusinesses);
  }
  if (!window.localStorage.getItem('chimbero_classifieds')) {
    setStorageItem('chimbero_classifieds', initialClassifieds);
  }
  if (!window.localStorage.getItem('chimbero_pharmacies')) {
    setStorageItem('chimbero_pharmacies', initialPharmacies);
  }
  if (!window.localStorage.getItem('chimbero_kiosks')) {
    setStorageItem('chimbero_kiosks', initialKiosks);
  }
  if (!window.localStorage.getItem('chimbero_profiles')) {
    setStorageItem('chimbero_profiles', initialProfiles);
  }
  if (!window.localStorage.getItem('chimbero_events')) {
    setStorageItem('chimbero_events', initialEvents);
  }
  const storedBuses = getStorageItem('chimbero_buses', []);
  const needsStopsUpdate = storedBuses[0] && (!storedBuses[0].stops || storedBuses[0].stops.length < 20 || !storedBuses[0].hasOwnProperty('stops_vuelta'));
  if (!window.localStorage.getItem('chimbero_buses') || storedBuses.length < initialBuses.length || needsStopsUpdate) {
    setStorageItem('chimbero_buses', initialBuses);
  }
  if (!window.localStorage.getItem('chimbero_jobs')) {
    setStorageItem('chimbero_jobs', initialJobs);
  }
};

// Ejecutar inicialización del mock
if (isMock) {
  initMockDB();
}

// Helper para obtener datos mock
const getMockData = (key, fallback) => {
  return getStorageItem(key, fallback);
};

// Helper para guardar datos mock
const saveMockData = (key, data) => {
  setStorageItem(key, data);
};

// Mock Session State
let mockCurrentUser = null;
if (typeof window !== 'undefined' && isMock) {
  const savedUser = window.localStorage.getItem('chimbero_session');
  if (savedUser) {
    mockCurrentUser = JSON.parse(savedUser);
  }
}

// --- API DE LA APLICACIÓN (EXPORTADA) ---

export const db = {
  // 1. COMERCIOS (GUÍA COMERCIAL)
  async getBusinesses() {
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('businesses')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      return getMockData('chimbero_businesses', initialBusinesses)
        .filter(b => b.status === 'approved')
        .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || new Date(b.created_at) - new Date(a.created_at));
    }
  },

  async getBusinessById(id) {
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('businesses')
        .select('*, profiles(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } else {
      const businesses = getMockData('chimbero_businesses', initialBusinesses);
      const business = businesses.find(b => b.id === id);
      if (!business) return null;
      
      const profiles = getMockData('chimbero_profiles', initialProfiles);
      const profile = profiles.find(p => p.id === business.owner_id);
      
      return {
        ...business,
        profiles: profile || null
      };
    }
  },

  async createBusiness(businessData) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Debes estar autenticado para registrar un comercio');
    const isAdmin = !!(user.is_admin || user.email === 'admin@elchimbero.com');

    const newBusiness = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      owner_id: user.id,
      name: businessData.name,
      description: businessData.description,
      category: businessData.category,
      address: businessData.address,
      neighborhood: businessData.neighborhood,
      phone: businessData.phone,
      whatsapp: businessData.whatsapp,
      latitude: parseFloat(businessData.latitude) || -31.4958,
      longitude: parseFloat(businessData.longitude) || -68.5352,
      image_url: businessData.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      hours: businessData.hours || { lunes_a_viernes: '09:00 - 13:00, 17:00 - 21:00' },
      // En Supabase: vecinos quedan pendientes; admin publica aprobado
      status: isAdmin ? 'approved' : (isMock ? 'approved' : 'pending'),
      is_featured: false,
      created_at: new Date().toISOString()
    };

    if (!isMock) {
      const { id, created_at, ...payload } = newBusiness;
      const { data, error } = await supabaseClient
        .from('businesses')
        .insert([payload])
        .select();
      if (error) throw error;
      return data[0];
    } else {
      const businesses = getMockData('chimbero_businesses', initialBusinesses);
      businesses.unshift(newBusiness);
      saveMockData('chimbero_businesses', businesses);
      return newBusiness;
    }
  },

  // 2. CLASIFICADOS
  async getClassifieds() {
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('classifieds')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      return getMockData('chimbero_classifieds', initialClassifieds)
        .filter(c => c.status === 'active')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  async getClassifiedById(id) {
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('classifieds')
        .select('*, profiles(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } else {
      const classifieds = getMockData('chimbero_classifieds', initialClassifieds);
      const ad = classifieds.find(c => c.id === id);
      if (!ad) return null;

      const profiles = getMockData('chimbero_profiles', initialProfiles);
      const profile = profiles.find(p => p.id === ad.user_id);

      return {
        ...ad,
        profiles: profile || null
      };
    }
  },

  async createClassified(adData) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Debes estar autenticado para crear un clasificado');

    const newAd = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      user_id: user.id,
      title: adData.title,
      description: adData.description,
      price: parseFloat(adData.price) || 0,
      category: adData.category,
      condition: adData.condition,
      image_url: adData.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      whatsapp: adData.whatsapp || user.phone || '542645123456',
      status: 'active',
      created_at: new Date().toISOString()
    };

    if (!isMock) {
      const { id, created_at, ...payload } = newAd;
      const { data, error } = await supabaseClient
        .from('classifieds')
        .insert([payload])
        .select();
      if (error) throw error;
      return data[0];
    } else {
      const ads = getMockData('chimbero_classifieds', initialClassifieds);
      ads.unshift(newAd);
      saveMockData('chimbero_classifieds', ads);
      return newAd;
    }
  },

  // 3. FARMACIAS DE TURNO
  async getPharmacies() {
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('pharmacies')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      return getMockData('chimbero_pharmacies', initialPharmacies);
    }
  },

  // 4. KIOSCOS
  async getKiosks() {
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('kiosks')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      return getMockData('chimbero_kiosks', initialKiosks);
    }
  },

  // 5. AUTENTICACIÓN
  async getCurrentUser() {
    if (!isMock) {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) return null;
      
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      return {
        id: session.user.id,
        email: session.user.email,
        ...profile
      };
    } else {
      return mockCurrentUser;
    }
  },

  async signUp(email, password, fullName, phone) {
    if (!isMock) {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });
      if (error) throw error;
      return data.user;
    } else {
      const profiles = getMockData('chimbero_profiles', initialProfiles);
      const existingUser = profiles.find(p => p.email === email);
      if (existingUser) throw new Error('El usuario ya existe');

      const newUserId = typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString();
      const newProfile = {
        id: newUserId,
        full_name: fullName,
        phone: phone,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        created_at: new Date().toISOString()
      };

      profiles.push(newProfile);
      saveMockData('chimbero_profiles', profiles);

      const sessionUser = {
        id: newUserId,
        email,
        full_name: fullName,
        phone,
        avatar_url: newProfile.avatar_url,
        is_admin: false
      };

      mockCurrentUser = sessionUser;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('chimbero_session', JSON.stringify(sessionUser));
      }
      return sessionUser;
    }
  },

  async signIn(email, password) {
    if (!isMock) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        id: data.user.id,
        email: data.user.email,
        ...profile
      };
    } else {
      // Para mock, si es test@elchimbero.com o admin@elchimbero.com, buscamos sus respectivos perfiles
      const profiles = getMockData('chimbero_profiles', initialProfiles);
      
      let profile;
      if (email === 'admin@elchimbero.com') {
        profile = profiles.find(p => p.email === 'admin@elchimbero.com');
      } else if (email === 'test@elchimbero.com') {
        profile = profiles.find(p => p.email === 'test@elchimbero.com');
      } else {
        // Buscar si hay otro perfil con ese correo, o creamos uno nuevo rápido para no trabar
        profile = profiles.find(p => p.email === email) || {
          id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
          full_name: email.split('@')[0],
          phone: '264111222',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          is_admin: false,
          email: email
        };
        
        if (!profiles.some(p => p.id === profile.id)) {
          profiles.push(profile);
          saveMockData('chimbero_profiles', profiles);
        }
      }

      const sessionUser = {
        id: profile.id,
        email,
        full_name: profile.full_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        is_admin: !!profile.is_admin
      };

      mockCurrentUser = sessionUser;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('chimbero_session', JSON.stringify(sessionUser));
      }
      return sessionUser;
    }
  },

  async signOut() {
    if (!isMock) {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
    } else {
      mockCurrentUser = null;
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('chimbero_session');
      }
    }
  },

  // Obtener mis comercios y clasificados creados
  async getMyContent() {
    const user = await this.getCurrentUser();
    if (!user) return { businesses: [], classifieds: [] };

    if (!isMock) {
      const { data: businesses } = await supabaseClient
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id);
      
      const { data: classifieds } = await supabaseClient
        .from('classifieds')
        .select('*')
        .eq('user_id', user.id);

      return {
        businesses: businesses || [],
        classifieds: classifieds || []
      };
    } else {
      const businesses = getMockData('chimbero_businesses', initialBusinesses)
        .filter(b => b.owner_id === user.id);
      
      const classifieds = getMockData('chimbero_classifieds', initialClassifieds)
        .filter(c => c.user_id === user.id);

      return { businesses, classifieds };
    }
  },

  async deleteBusiness(id) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('No autorizado');
    const isAdmin = !!(user.is_admin || user.email === 'admin@elchimbero.com');

    if (!isMock) {
      let query = supabaseClient.from('businesses').delete().eq('id', id);
      // Dueños solo borran lo suyo; admin borra cualquiera (RLS lo valida)
      if (!isAdmin) query = query.eq('owner_id', user.id);
      const { data, error } = await query.select('id');
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo eliminar el comercio (sin permisos o no existe)');
    } else {
      const businesses = getMockData('chimbero_businesses', initialBusinesses);
      const updated = businesses.filter(b =>
        !(b.id === id && (isAdmin || b.owner_id === user.id))
      );
      if (updated.length === businesses.length) throw new Error('No autorizado');
      saveMockData('chimbero_businesses', updated);
    }
  },

  async deleteClassified(id) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('No autorizado');
    const isAdmin = !!(user.is_admin || user.email === 'admin@elchimbero.com');

    if (!isMock) {
      let query = supabaseClient.from('classifieds').delete().eq('id', id);
      if (!isAdmin) query = query.eq('user_id', user.id);
      const { data, error } = await query.select('id');
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo eliminar el clasificado (sin permisos o no existe)');
    } else {
      const classifieds = getMockData('chimbero_classifieds', initialClassifieds);
      const updated = classifieds.filter(c =>
        !(c.id === id && (isAdmin || c.user_id === user.id))
      );
      if (updated.length === classifieds.length) throw new Error('No autorizado');
      saveMockData('chimbero_classifieds', updated);
    }
  },

  // 6. EVENTOS
  async getEvents() {
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      return getMockData('chimbero_events', initialEvents)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  },

  async createEvent(eventData) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Debes estar autenticado para crear un evento');

    const newEvent = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      category: eventData.category,
      image_url: eventData.image_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
      price: parseFloat(eventData.price) || 0,
      created_at: new Date().toISOString()
    };

    if (!isMock) {
      const { id, created_at, ...payload } = newEvent;
      const { data, error } = await supabaseClient
        .from('events')
        .insert([payload])
        .select();
      if (error) throw error;
      return data[0];
    } else {
      const events = getMockData('chimbero_events', initialEvents);
      events.push(newEvent);
      saveMockData('chimbero_events', events);
      return newEvent;
    }
  },

  // 7. COLECTIVOS
  async getBuses() {
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('buses')
        .select('*')
        .order('line', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      return getMockData('chimbero_buses', initialBuses)
        .sort((a, b) => a.line.localeCompare(b.line));
    }
  },

  // 8. BOLSA DE EMPLEO
  async getJobs() {
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      return getMockData('chimbero_jobs', initialJobs)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  async createJob(jobData) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Debes estar autenticado para publicar un empleo/servicio');

    const newJob = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      user_id: user.id,
      title: jobData.title,
      description: jobData.description,
      type: jobData.type || 'oferta_laboral',
      category: jobData.category,
      price: parseFloat(jobData.price) || 0,
      company: jobData.company || 'Particular',
      contact_name: jobData.contact_name || user.full_name || 'Vecino',
      whatsapp: jobData.whatsapp || user.phone || '542645123456',
      created_at: new Date().toISOString()
    };

    if (!isMock) {
      const { id, created_at, ...payload } = newJob;
      const { data, error } = await supabaseClient
        .from('jobs')
        .insert([payload])
        .select();
      if (error) throw error;
      return data[0];
    } else {
      const jobs = getMockData('chimbero_jobs', initialJobs);
      jobs.unshift(newJob);
      saveMockData('chimbero_jobs', jobs);
      return newJob;
    }
  },

  async deleteJob(id) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('No autorizado');
    const isAdmin = !!(user.is_admin || user.email === 'admin@elchimbero.com');

    if (!isMock) {
      let query = supabaseClient.from('jobs').delete().eq('id', id);
      if (!isAdmin) query = query.eq('user_id', user.id);
      const { data, error } = await query.select('id');
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo eliminar el empleo (sin permisos o no existe)');
    } else {
      const jobs = getMockData('chimbero_jobs', initialJobs);
      const updated = jobs.filter(j => !(j.id === id && (isAdmin || j.user_id === user.id || !j.user_id)));
      if (updated.length === jobs.length) throw new Error('No autorizado');
      saveMockData('chimbero_jobs', updated);
    }
  },

  // --- FUNCIONES ADICIONALES DE ADMINISTRACIÓN ---

  async getAllBusinessesAdmin() {
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      return getMockData('chimbero_businesses', initialBusinesses)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  async updateBusinessStatus(id, status) {
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('businesses')
        .update({ status })
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo actualizar el comercio (sin permisos o no existe)');
      return data[0];
    } else {
      const businesses = getMockData('chimbero_businesses', initialBusinesses);
      const idx = businesses.findIndex(b => b.id === id);
      if (idx !== -1) {
        businesses[idx].status = status;
        saveMockData('chimbero_businesses', businesses);
        return businesses[idx];
      }
      throw new Error('Comercio no encontrado');
    }
  },

  async createPharmacy(pharmacyData) {
    const newPharmacy = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      name: pharmacyData.name,
      address: pharmacyData.address,
      phone: pharmacyData.phone,
      latitude: parseFloat(pharmacyData.latitude) || -31.4951,
      longitude: parseFloat(pharmacyData.longitude) || -68.5345,
      duty_dates: pharmacyData.duty_dates || [],
      is_open_24h: pharmacyData.is_open_24h || false,
      created_at: new Date().toISOString()
    };

    if (!isMock) {
      const { id, created_at, ...payload } = newPharmacy;
      const { data, error } = await supabaseClient
        .from('pharmacies')
        .insert([payload])
        .select();
      if (error) throw error;
      return data[0];
    } else {
      const pharmacies = getMockData('chimbero_pharmacies', initialPharmacies);
      pharmacies.push(newPharmacy);
      saveMockData('chimbero_pharmacies', pharmacies);
      return newPharmacy;
    }
  },

  async deletePharmacy(id) {
    if (!isMock) {
      const { error } = await supabaseClient
        .from('pharmacies')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const pharmacies = getMockData('chimbero_pharmacies', initialPharmacies);
      const updated = pharmacies.filter(p => p.id !== id);
      saveMockData('chimbero_pharmacies', updated);
    }
  },

  async createKiosk(kioskData) {
    const newKiosk = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      name: kioskData.name,
      address: kioskData.address,
      neighborhood: kioskData.neighborhood,
      phone: kioskData.phone,
      latitude: parseFloat(kioskData.latitude) || -31.4965,
      longitude: parseFloat(kioskData.longitude) || -68.5361,
      is_open_24h: kioskData.is_open_24h || false,
      hours_description: kioskData.hours_description || 'Abierto tarde',
      created_at: new Date().toISOString()
    };

    if (!isMock) {
      const { id, created_at, ...payload } = newKiosk;
      const { data, error } = await supabaseClient
        .from('kiosks')
        .insert([payload])
        .select();
      if (error) throw error;
      return data[0];
    } else {
      const kiosks = getMockData('chimbero_kiosks', initialKiosks);
      kiosks.push(newKiosk);
      saveMockData('chimbero_kiosks', kiosks);
      return newKiosk;
    }
  },

  async deleteKiosk(id) {
    if (!isMock) {
      const { error } = await supabaseClient
        .from('kiosks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const kiosks = getMockData('chimbero_kiosks', initialKiosks);
      const updated = kiosks.filter(k => k.id !== id);
      saveMockData('chimbero_kiosks', updated);
    }
  },

  async createBus(busData) {
    const newBus = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      line: busData.line,
      description: busData.description,
      type: busData.type || 'interno_chimbas',
      frequency: busData.frequency || 'Cada 15 minutos',
      neighborhoods: busData.neighborhoods || [],
      stops: busData.stops || [],
      stops_vuelta: busData.stops_vuelta || [],
      schedule: busData.schedule || 'Lunes a Viernes',
      created_at: new Date().toISOString()
    };

    if (!isMock) {
      const { id, created_at, ...payload } = newBus;
      const { data, error } = await supabaseClient
        .from('buses')
        .insert([payload])
        .select();
      if (error) throw error;
      return data[0];
    } else {
      const buses = getMockData('chimbero_buses', initialBuses);
      buses.push(newBus);
      saveMockData('chimbero_buses', buses);
      return newBus;
    }
  },

  async deleteBus(id) {
    if (!isMock) {
      const { error } = await supabaseClient
        .from('buses')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const buses = getMockData('chimbero_buses', initialBuses);
      const updated = buses.filter(b => b.id !== id);
      saveMockData('chimbero_buses', updated);
    }
  },

  async deleteEvent(id) {
    if (!isMock) {
      const { error } = await supabaseClient
        .from('events')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const events = getMockData('chimbero_events', initialEvents);
      const updated = events.filter(e => e.id !== id);
      saveMockData('chimbero_events', updated);
    }
  }
};
