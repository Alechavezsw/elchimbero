// Abstracción de Base de Datos y Autenticación
// Conecta con Supabase si las credenciales existen, de lo contrario cae en un Mock local persistente en localStorage.

import { createClient } from '@supabase/supabase-js';
import { initialBusinesses, initialClassifieds, initialPharmacies, initialKiosks, initialProfiles, initialEvents, initialBuses, initialJobs } from './mockData';
import { ROLES, canAccessAdmin, canManageBusiness, normalizeRole, withRoleFlags } from './roles';

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
  {
    const storedProfiles = getStorageItem('chimbero_profiles', null);
    if (!storedProfiles || !Array.isArray(storedProfiles) || storedProfiles.length === 0) {
      setStorageItem('chimbero_profiles', initialProfiles);
    } else {
      // Asegurar cuentas seed (admin/test) aunque el localStorage sea viejo
      let changed = false;
      const merged = [...storedProfiles];
      for (const seed of initialProfiles) {
        const idx = merged.findIndex((p) => p.email === seed.email || p.id === seed.id);
        if (idx === -1) {
          merged.push(seed);
          changed = true;
        } else if (!merged[idx].email) {
          merged[idx] = { ...seed, ...merged[idx], email: seed.email };
          changed = true;
        }
      }
      if (changed) setStorageItem('chimbero_profiles', merged);
    }
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
    if (!canManageBusiness(user)) {
      throw new Error('Solo usuarios de negocio o administración pueden registrar comercios.');
    }
    const isAdmin = canAccessAdmin(user);

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
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      return getMockData('chimbero_classifieds', initialClassifieds)
        .filter(c => c.status === 'active')
        .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || new Date(b.created_at) - new Date(a.created_at));
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
      is_featured: !!adData.is_featured,
      featured_until: adData.featured_until || null,
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
      if (!session?.user?.id) return null;

      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      return withRoleFlags({
        ...(profile || {}),
        id: session.user.id,
        email: session.user.email,
      });
    } else {
      return withRoleFlags(mockCurrentUser);
    }
  },

  async signUp(email, password, fullName, phone, role = ROLES.CLIENT) {
    const signupRole = normalizeRole(role) === ROLES.BUSINESS ? ROLES.BUSINESS : ROLES.CLIENT;

    if (!isMock) {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: signupRole,
          }
        }
      });
      if (error) throw error;

      // Si Supabase exige confirmación de email, no hay sesión todavía
      if (!data.session) {
        return { needsEmailConfirmation: true, email };
      }

      // Asegurar rol en perfil (por si el trigger no corrió aún)
      if (data.user?.id) {
        await supabaseClient
          .from('profiles')
          .update({ role: signupRole, is_admin: false })
          .eq('id', data.user.id);
      }

      return await this.getCurrentUser();
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
        created_at: new Date().toISOString(),
        role: signupRole,
        is_admin: false,
        email,
      };

      profiles.push(newProfile);
      saveMockData('chimbero_profiles', profiles);

      const sessionUser = withRoleFlags({
        id: newUserId,
        email,
        full_name: fullName,
        phone,
        avatar_url: newProfile.avatar_url,
        role: signupRole,
        is_admin: false,
      });

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
      if (!data?.user?.id) {
        throw new Error('No se pudo iniciar sesión. Revisá correo y contraseña.');
      }

      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      return withRoleFlags({
        ...(profile || {}),
        id: data.user.id,
        email: data.user.email,
      });
    } else {
      // Demo local: cualquier contraseña >= 6 chars; cuentas seed siempre disponibles
      if (!password || String(password).length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      }

      const profiles = getMockData('chimbero_profiles', initialProfiles) || [];
      const seed = initialProfiles.find((p) => p.email === email);
      let profile = profiles.find((p) => p.email === email) || seed || null;

      if (!profile && (email === 'admin@elchimbero.com' || email === 'test@elchimbero.com')) {
        profile = seed || initialProfiles.find((p) => p.email === email) || null;
      }

      if (!profile) {
        profile = {
          id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
          full_name: email.split('@')[0],
          phone: '264111222',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          role: ROLES.CLIENT,
          is_admin: false,
          email,
        };
      }

      if (!profiles.some((p) => p.id === profile.id || p.email === profile.email)) {
        profiles.push(profile);
        saveMockData('chimbero_profiles', profiles);
      }

      const sessionUser = withRoleFlags({
        id: profile.id,
        email,
        full_name: profile.full_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        role: profile.role,
        is_admin: !!profile.is_admin || email === 'admin@elchimbero.com',
      });

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
      latitude: parseFloat(eventData.latitude) || -31.4958,
      longitude: parseFloat(eventData.longitude) || -68.5352,
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
      image_url: jobData.image_url || null,
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

  async uploadImage(file, folder = 'misc') {
    if (!file) throw new Error('No se seleccionó ningún archivo');

    if (isMock) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
        reader.readAsDataURL(file);
      });
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

    const { error } = await supabaseClient.storage.from('uploads').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });
    if (error) throw error;

    const { data } = supabaseClient.storage.from('uploads').getPublicUrl(path);
    return data.publicUrl;
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
      image_url: pharmacyData.image_url || null,
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
      image_url: kioskData.image_url || null,
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
  },

  // --- UPDATE / LISTADOS ADMIN ---

  async requireAdmin() {
    const user = await this.getCurrentUser();
    if (!canAccessAdmin(user)) {
      throw new Error('Solo administradores');
    }
    return user;
  },

  async getAllClassifiedsAdmin() {
    await this.requireAdmin();
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('classifieds')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return getMockData('chimbero_classifieds', initialClassifieds)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async updateBusiness(id, businessData) {
    await this.requireAdmin();
    const payload = {
      name: businessData.name,
      description: businessData.description,
      category: businessData.category,
      address: businessData.address,
      neighborhood: businessData.neighborhood,
      phone: businessData.phone,
      whatsapp: businessData.whatsapp,
      latitude: parseFloat(businessData.latitude) || -31.4958,
      longitude: parseFloat(businessData.longitude) || -68.5352,
      image_url: businessData.image_url,
      hours: businessData.hours,
    };
    if (businessData.status) payload.status = businessData.status;
    if (typeof businessData.is_featured === 'boolean') payload.is_featured = businessData.is_featured;

    if (!isMock) {
      const { data, error } = await supabaseClient.from('businesses').update(payload).eq('id', id).select();
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo actualizar el comercio');
      return data[0];
    }
    const businesses = getMockData('chimbero_businesses', initialBusinesses);
    const idx = businesses.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Comercio no encontrado');
    businesses[idx] = { ...businesses[idx], ...payload };
    saveMockData('chimbero_businesses', businesses);
    return businesses[idx];
  },

  async updateClassified(id, adData) {
    await this.requireAdmin();
    const payload = {
      title: adData.title,
      description: adData.description,
      price: parseFloat(adData.price) || 0,
      category: adData.category,
      condition: adData.condition,
      image_url: adData.image_url,
      whatsapp: adData.whatsapp,
      status: adData.status || 'active',
    };
    if (adData.is_featured != null) payload.is_featured = !!adData.is_featured;
    if (adData.featured_until !== undefined) payload.featured_until = adData.featured_until || null;

    if (!isMock) {
      const { data, error } = await supabaseClient.from('classifieds').update(payload).eq('id', id).select();
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo actualizar el clasificado');
      return data[0];
    }
    const ads = getMockData('chimbero_classifieds', initialClassifieds);
    const idx = ads.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Clasificado no encontrado');
    ads[idx] = { ...ads[idx], ...payload };
    saveMockData('chimbero_classifieds', ads);
    return ads[idx];
  },

  /** Destacar / quitar destacado + generar cobro en contaduría */
  async setClassifiedFeatured(id, featured = true, { create_charge = true, days = 30 } = {}) {
    await this.requireAdmin();
    const until = featured
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      : null;

    let ad;
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('classifieds')
        .update({ is_featured: !!featured, featured_until: until })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      ad = data;
    } else {
      const ads = getMockData('chimbero_classifieds', initialClassifieds);
      const idx = ads.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error('Clasificado no encontrado');
      ads[idx] = { ...ads[idx], is_featured: !!featured, featured_until: until };
      saveMockData('chimbero_classifieds', ads);
      ad = ads[idx];
    }

    let charge = null;
    if (featured && create_charge) {
      const result = await this.enrollPaidService({
        product_code: 'clasificado_destacado',
        client_name: ad.title,
        client_phone: ad.whatsapp || null,
        entity_type: 'classified',
        entity_id: ad.id,
        create_charge: true,
      });
      charge = result.charge;
    } else if (!featured) {
      try {
        const subs = await this.getBillingSubscriptions();
        const sub = subs.find(
          (s) => s.product_code === 'clasificado_destacado' && s.entity_id === id && s.status === 'active'
        );
        if (sub) await this.updateBillingSubscription(sub.id, { status: 'cancelled' });
      } catch (e) {
        console.warn('Billing unfeature classified:', e);
      }
    }

    return { ad, charge };
  },

  async updatePharmacy(id, pharmacyData) {
    await this.requireAdmin();
    const payload = {
      name: pharmacyData.name,
      address: pharmacyData.address,
      phone: pharmacyData.phone,
      latitude: parseFloat(pharmacyData.latitude) || -31.4951,
      longitude: parseFloat(pharmacyData.longitude) || -68.5345,
      duty_dates: pharmacyData.duty_dates || [],
      is_open_24h: !!pharmacyData.is_open_24h,
      image_url: pharmacyData.image_url || null,
    };
    if (!isMock) {
      const { data, error } = await supabaseClient.from('pharmacies').update(payload).eq('id', id).select();
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo actualizar la farmacia');
      return data[0];
    }
    const pharmacies = getMockData('chimbero_pharmacies', initialPharmacies);
    const idx = pharmacies.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Farmacia no encontrada');
    pharmacies[idx] = { ...pharmacies[idx], ...payload };
    saveMockData('chimbero_pharmacies', pharmacies);
    return pharmacies[idx];
  },

  async updateKiosk(id, kioskData) {
    await this.requireAdmin();
    const payload = {
      name: kioskData.name,
      address: kioskData.address,
      neighborhood: kioskData.neighborhood,
      phone: kioskData.phone,
      latitude: parseFloat(kioskData.latitude) || -31.4965,
      longitude: parseFloat(kioskData.longitude) || -68.5361,
      is_open_24h: !!kioskData.is_open_24h,
      hours_description: kioskData.hours_description || '',
      image_url: kioskData.image_url || null,
    };
    if (!isMock) {
      const { data, error } = await supabaseClient.from('kiosks').update(payload).eq('id', id).select();
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo actualizar el kiosco');
      return data[0];
    }
    const kiosks = getMockData('chimbero_kiosks', initialKiosks);
    const idx = kiosks.findIndex((k) => k.id === id);
    if (idx === -1) throw new Error('Kiosco no encontrado');
    kiosks[idx] = { ...kiosks[idx], ...payload };
    saveMockData('chimbero_kiosks', kiosks);
    return kiosks[idx];
  },

  async updateBus(id, busData) {
    await this.requireAdmin();
    const payload = {
      line: busData.line,
      description: busData.description,
      type: busData.type || 'interno_chimbas',
      frequency: busData.frequency || 'Cada 15 minutos',
      neighborhoods: busData.neighborhoods || [],
      stops: busData.stops || [],
      stops_vuelta: busData.stops_vuelta || [],
      schedule: busData.schedule || 'Lunes a Viernes',
    };
    if (!isMock) {
      const { data, error } = await supabaseClient.from('buses').update(payload).eq('id', id).select();
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo actualizar el colectivo');
      return data[0];
    }
    const buses = getMockData('chimbero_buses', initialBuses);
    const idx = buses.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Colectivo no encontrado');
    buses[idx] = { ...buses[idx], ...payload };
    saveMockData('chimbero_buses', buses);
    return buses[idx];
  },

  async updateEvent(id, eventData) {
    await this.requireAdmin();
    const payload = {
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      category: eventData.category,
      image_url: eventData.image_url,
      price: parseFloat(eventData.price) || 0,
      latitude: parseFloat(eventData.latitude) || -31.4958,
      longitude: parseFloat(eventData.longitude) || -68.5352,
    };
    if (!isMock) {
      const { data, error } = await supabaseClient.from('events').update(payload).eq('id', id).select();
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo actualizar el evento');
      return data[0];
    }
    const events = getMockData('chimbero_events', initialEvents);
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Evento no encontrado');
    events[idx] = { ...events[idx], ...payload };
    saveMockData('chimbero_events', events);
    return events[idx];
  },

  async updateJob(id, jobData) {
    await this.requireAdmin();
    const payload = {
      title: jobData.title,
      description: jobData.description,
      type: jobData.type,
      category: jobData.category,
      price: parseFloat(jobData.price) || 0,
      company: jobData.company,
      contact_name: jobData.contact_name,
      whatsapp: jobData.whatsapp,
      image_url: jobData.image_url || null,
    };
    if (!isMock) {
      const { data, error } = await supabaseClient.from('jobs').update(payload).eq('id', id).select();
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo actualizar el empleo');
      return data[0];
    }
    const jobs = getMockData('chimbero_jobs', initialJobs);
    const idx = jobs.findIndex((j) => j.id === id);
    if (idx === -1) throw new Error('Empleo no encontrado');
    jobs[idx] = { ...jobs[idx], ...payload };
    saveMockData('chimbero_jobs', jobs);
    return jobs[idx];
  },

  async getProfilesAdmin() {
    await this.requireAdmin();
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return getMockData('chimbero_profiles', initialProfiles);
  },

  async updateProfileAdmin(id, profileData) {
    await this.requireAdmin();
    const role = normalizeRole(profileData.role, { isAdmin: !!profileData.is_admin });
    const payload = {
      full_name: profileData.full_name,
      phone: profileData.phone,
      role,
      is_admin: role === ROLES.ADMIN,
      avatar_url: profileData.avatar_url || null,
    };
    if (!isMock) {
      const { data, error } = await supabaseClient.from('profiles').update(payload).eq('id', id).select();
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo actualizar el usuario');
      return withRoleFlags(data[0]);
    }
    const profiles = getMockData('chimbero_profiles', initialProfiles);
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Usuario no encontrado');
    profiles[idx] = { ...profiles[idx], ...payload };
    saveMockData('chimbero_profiles', profiles);
    return withRoleFlags(profiles[idx]);
  },

  async deleteProfileAdmin(id) {
    const admin = await this.requireAdmin();
    if (admin.id === id) throw new Error('No podés eliminar tu propio usuario');
    if (!isMock) {
      const { error } = await supabaseClient.from('profiles').delete().eq('id', id);
      if (error) throw error;
    } else {
      const profiles = getMockData('chimbero_profiles', initialProfiles);
      saveMockData('chimbero_profiles', profiles.filter((p) => p.id !== id));
    }
  },

  // --- DELIVERY CHIMBERO ---

  isDeliveryOpen(business) {
    if (!business) return false;
    return (
      business.status === 'approved' &&
      !!business.delivery_enabled &&
      (business.delivery_plan === 'trial' || business.delivery_plan === 'active')
    );
  },

  async getDeliveryBusinesses() {
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('businesses')
        .select('*')
        .eq('status', 'approved')
        .eq('delivery_enabled', true)
        .in('delivery_plan', ['trial', 'active'])
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    }
    return getMockData('chimbero_businesses', initialBusinesses)
      .filter((b) => this.isDeliveryOpen(b))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async adminSetDeliveryPlan(businessId, { delivery_enabled, delivery_plan }) {
    await this.requireAdmin();
    const payload = {
      delivery_enabled: !!delivery_enabled,
      delivery_plan: delivery_enabled
        ? (delivery_plan || 'trial')
        : (delivery_plan || 'paused'),
    };
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('businesses')
        .update(payload)
        .eq('id', businessId)
        .select();
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo actualizar el plan de delivery');
      return data[0];
    }
    const businesses = getMockData('chimbero_businesses', initialBusinesses);
    const idx = businesses.findIndex((b) => b.id === businessId);
    if (idx === -1) throw new Error('Comercio no encontrado');
    businesses[idx] = { ...businesses[idx], ...payload };
    saveMockData('chimbero_businesses', businesses);
    return businesses[idx];
  },

  async updateDeliveryConfig(businessId, config) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Debes iniciar sesión');
    const isAdmin = !!(user.is_admin || user.email === 'admin@elchimbero.com');

    const payload = {
      delivery_min_order: parseFloat(config.delivery_min_order) || 0,
      delivery_fee: parseFloat(config.delivery_fee) || 0,
      delivery_eta_minutes: parseInt(config.delivery_eta_minutes, 10) || 45,
      delivery_zones: config.delivery_zones || '',
    };
    if (config.delivery_plan === 'paused' || config.delivery_plan === 'active' || config.delivery_plan === 'trial') {
      payload.delivery_plan = config.delivery_plan;
    }

    if (!isMock) {
      if (!isAdmin) {
        const { data: biz, error: bizErr } = await supabaseClient
          .from('businesses')
          .select('owner_id, delivery_enabled')
          .eq('id', businessId)
          .single();
        if (bizErr) throw bizErr;
        if (biz.owner_id !== user.id) throw new Error('No sos dueño de este comercio');
        if (!biz.delivery_enabled) throw new Error('Este comercio no tiene Delivery Chimbero activado');
      }
      const { data, error } = await supabaseClient
        .from('businesses')
        .update(payload)
        .eq('id', businessId)
        .select();
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo guardar la configuración');
      return data[0];
    }

    const businesses = getMockData('chimbero_businesses', initialBusinesses);
    const idx = businesses.findIndex((b) => b.id === businessId);
    if (idx === -1) throw new Error('Comercio no encontrado');
    if (!isAdmin && businesses[idx].owner_id !== user.id) {
      throw new Error('No sos dueño de este comercio');
    }
    businesses[idx] = { ...businesses[idx], ...payload };
    saveMockData('chimbero_businesses', businesses);
    return businesses[idx];
  },

  async assertBusinessAccess(businessId) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Debes iniciar sesión');
    const isAdmin = !!(user.is_admin || user.email === 'admin@elchimbero.com');
    if (isAdmin) return user;

    if (!isMock) {
      const { data: biz, error } = await supabaseClient
        .from('businesses')
        .select('owner_id, delivery_enabled')
        .eq('id', businessId)
        .single();
      if (error) throw error;
      if (biz.owner_id !== user.id) throw new Error('No sos dueño de este comercio');
      return user;
    }
    const businesses = getMockData('chimbero_businesses', initialBusinesses);
    const biz = businesses.find((b) => b.id === businessId);
    if (!biz || biz.owner_id !== user.id) throw new Error('No sos dueño de este comercio');
    return user;
  },

  async getMenu(businessId) {
    if (!isMock) {
      const [{ data: categories, error: catErr }, { data: items, error: itemErr }] = await Promise.all([
        supabaseClient
          .from('menu_categories')
          .select('*')
          .eq('business_id', businessId)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true }),
        supabaseClient
          .from('menu_items')
          .select('*')
          .eq('business_id', businessId)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true }),
      ]);
      if (catErr) throw catErr;
      if (itemErr) throw itemErr;
      return { categories: categories || [], items: items || [] };
    }

    const categories = getMockData('chimbero_menu_categories', []).filter((c) => c.business_id === businessId);
    const items = getMockData('chimbero_menu_items', []).filter((i) => i.business_id === businessId);
    return {
      categories: categories.sort((a, b) => a.sort_order - b.sort_order),
      items: items.sort((a, b) => a.sort_order - b.sort_order),
    };
  },

  async createMenuCategory(businessId, { name, sort_order = 0 }) {
    await this.assertBusinessAccess(businessId);
    const row = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      business_id: businessId,
      name: name.trim(),
      sort_order: sort_order || 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    if (!isMock) {
      const { id, created_at, ...payload } = row;
      const { data, error } = await supabaseClient.from('menu_categories').insert([payload]).select();
      if (error) throw error;
      return data[0];
    }
    const categories = getMockData('chimbero_menu_categories', []);
    categories.push(row);
    saveMockData('chimbero_menu_categories', categories);
    return row;
  },

  async updateMenuCategory(id, businessId, updates) {
    await this.assertBusinessAccess(businessId);
    const payload = {};
    if (updates.name != null) payload.name = updates.name.trim();
    if (updates.sort_order != null) payload.sort_order = updates.sort_order;
    if (updates.is_active != null) payload.is_active = !!updates.is_active;

    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('menu_categories')
        .update(payload)
        .eq('id', id)
        .eq('business_id', businessId)
        .select();
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo actualizar la categoría');
      return data[0];
    }
    const categories = getMockData('chimbero_menu_categories', []);
    const idx = categories.findIndex((c) => c.id === id && c.business_id === businessId);
    if (idx === -1) throw new Error('Categoría no encontrada');
    categories[idx] = { ...categories[idx], ...payload };
    saveMockData('chimbero_menu_categories', categories);
    return categories[idx];
  },

  async deleteMenuCategory(id, businessId) {
    await this.assertBusinessAccess(businessId);
    if (!isMock) {
      const { error } = await supabaseClient
        .from('menu_categories')
        .delete()
        .eq('id', id)
        .eq('business_id', businessId);
      if (error) throw error;
      return;
    }
    const categories = getMockData('chimbero_menu_categories', []);
    saveMockData(
      'chimbero_menu_categories',
      categories.filter((c) => !(c.id === id && c.business_id === businessId))
    );
  },

  async createMenuItem(businessId, itemData) {
    await this.assertBusinessAccess(businessId);
    const row = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      business_id: businessId,
      category_id: itemData.category_id || null,
      name: itemData.name.trim(),
      description: itemData.description || '',
      price: parseFloat(itemData.price) || 0,
      image_url: itemData.image_url || null,
      is_available: itemData.is_available !== false,
      sort_order: itemData.sort_order || 0,
      created_at: new Date().toISOString(),
    };
    if (!isMock) {
      const { id, created_at, ...payload } = row;
      const { data, error } = await supabaseClient.from('menu_items').insert([payload]).select();
      if (error) throw error;
      return data[0];
    }
    const items = getMockData('chimbero_menu_items', []);
    items.push(row);
    saveMockData('chimbero_menu_items', items);
    return row;
  },

  async updateMenuItem(id, businessId, itemData) {
    await this.assertBusinessAccess(businessId);
    const payload = {
      category_id: itemData.category_id || null,
      name: itemData.name.trim(),
      description: itemData.description || '',
      price: parseFloat(itemData.price) || 0,
      image_url: itemData.image_url || null,
      is_available: itemData.is_available !== false,
      sort_order: itemData.sort_order || 0,
    };
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('menu_items')
        .update(payload)
        .eq('id', id)
        .eq('business_id', businessId)
        .select();
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo actualizar el producto');
      return data[0];
    }
    const items = getMockData('chimbero_menu_items', []);
    const idx = items.findIndex((i) => i.id === id && i.business_id === businessId);
    if (idx === -1) throw new Error('Producto no encontrado');
    items[idx] = { ...items[idx], ...payload };
    saveMockData('chimbero_menu_items', items);
    return items[idx];
  },

  async toggleItemAvailable(id, businessId, isAvailable) {
    await this.assertBusinessAccess(businessId);
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('menu_items')
        .update({ is_available: !!isAvailable })
        .eq('id', id)
        .eq('business_id', businessId)
        .select();
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo actualizar disponibilidad');
      return data[0];
    }
    const items = getMockData('chimbero_menu_items', []);
    const idx = items.findIndex((i) => i.id === id && i.business_id === businessId);
    if (idx === -1) throw new Error('Producto no encontrado');
    items[idx].is_available = !!isAvailable;
    saveMockData('chimbero_menu_items', items);
    return items[idx];
  },

  async deleteMenuItem(id, businessId) {
    await this.assertBusinessAccess(businessId);
    if (!isMock) {
      const { error } = await supabaseClient
        .from('menu_items')
        .delete()
        .eq('id', id)
        .eq('business_id', businessId);
      if (error) throw error;
      return;
    }
    const items = getMockData('chimbero_menu_items', []);
    saveMockData(
      'chimbero_menu_items',
      items.filter((i) => !(i.id === id && i.business_id === businessId))
    );
  },

  async createOrder(orderData) {
    const business = await this.getBusinessById(orderData.business_id);
    if (!this.isDeliveryOpen(business)) {
      throw new Error('Este comercio no está recibiendo pedidos de delivery ahora');
    }

    const items = (orderData.items || []).filter((i) => i.qty > 0);
    if (!items.length) throw new Error('El carrito está vacío');

    const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.unit_price) || 0) * (parseInt(i.qty, 10) || 0), 0);
    const minOrder = parseFloat(business.delivery_min_order) || 0;
    if (subtotal < minOrder) {
      throw new Error(`El pedido mínimo es $${minOrder.toLocaleString('es-AR')}`);
    }

    const deliveryFee = parseFloat(business.delivery_fee) || 0;
    const total = subtotal + deliveryFee;

    const order = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      business_id: orderData.business_id,
      customer_name: orderData.customer_name.trim(),
      customer_phone: orderData.customer_phone.replace(/\D/g, ''),
      customer_address: orderData.customer_address.trim(),
      neighborhood: orderData.neighborhood || '',
      notes: orderData.notes || '',
      payment_method: orderData.payment_method === 'transferencia' ? 'transferencia' : 'efectivo',
      status: 'pending',
      subtotal,
      delivery_fee: deliveryFee,
      total,
      created_at: new Date().toISOString(),
    };

    const lineItems = items.map((i) => ({
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      order_id: order.id,
      menu_item_id: i.menu_item_id || null,
      name: i.name,
      unit_price: parseFloat(i.unit_price) || 0,
      qty: parseInt(i.qty, 10) || 1,
    }));

    if (!isMock) {
      const { data, error } = await supabaseClient.rpc('create_delivery_order', {
        p_business_id: orderData.business_id,
        p_customer_name: order.customer_name,
        p_customer_phone: order.customer_phone,
        p_customer_address: order.customer_address,
        p_neighborhood: order.neighborhood,
        p_notes: order.notes,
        p_payment_method: order.payment_method,
        p_items: lineItems.map((i) => ({
          menu_item_id: i.menu_item_id,
          name: i.name,
          unit_price: i.unit_price,
          qty: i.qty,
        })),
      });
      if (error) throw error;
      return { ...data, business };
    }

    const orders = getMockData('chimbero_orders', []);
    orders.unshift(order);
    saveMockData('chimbero_orders', orders);
    const allItems = getMockData('chimbero_order_items', []);
    saveMockData('chimbero_order_items', [...allItems, ...lineItems]);
    return { ...order, items: lineItems, business };
  },

  async getOrdersForBusiness(businessId) {
    await this.assertBusinessAccess(businessId);
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*, order_items(*)')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((o) => ({
        ...o,
        items: o.order_items || [],
      }));
    }
    const orders = getMockData('chimbero_orders', [])
      .filter((o) => o.business_id === businessId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const allItems = getMockData('chimbero_order_items', []);
    return orders.map((o) => ({
      ...o,
      items: allItems.filter((i) => i.order_id === o.id),
    }));
  },

  async updateOrderStatus(orderId, businessId, status) {
    await this.assertBusinessAccess(businessId);
    const allowed = ['pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) throw new Error('Estado inválido');

    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .eq('business_id', businessId)
        .select();
      if (error) throw error;
      if (!data?.length) throw new Error('No se pudo actualizar el pedido');
      return data[0];
    }
    const orders = getMockData('chimbero_orders', []);
    const idx = orders.findIndex((o) => o.id === orderId && o.business_id === businessId);
    if (idx === -1) throw new Error('Pedido no encontrado');
    orders[idx].status = status;
    saveMockData('chimbero_orders', orders);
    return orders[idx];
  },

  buildOrderWhatsAppUrl(order) {
    const business = order.business;
    const phone = (business?.whatsapp || '').replace(/\D/g, '');
    if (!phone) return null;

    const lines = [
      `🛒 *Nuevo pedido Delivery Chimbero*`,
      `Comercio: ${business.name}`,
      `Cliente: ${order.customer_name}`,
      `Tel: ${order.customer_phone}`,
      `Dirección: ${order.customer_address}${order.neighborhood ? ` (${order.neighborhood})` : ''}`,
      `Pago: ${order.payment_method === 'transferencia' ? 'Transferencia' : 'Efectivo'}`,
      '',
      '*Detalle:*',
      ...(order.items || []).map(
        (i) => `• ${i.qty}x ${i.name} — $${(i.unit_price * i.qty).toLocaleString('es-AR')}`
      ),
      '',
      `Subtotal: $${Number(order.subtotal).toLocaleString('es-AR')}`,
      `Envío: $${Number(order.delivery_fee).toLocaleString('es-AR')}`,
      `*Total: $${Number(order.total).toLocaleString('es-AR')}*`,
    ];
    if (order.notes) lines.push('', `Notas: ${order.notes}`);

    return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
  },

  // --- CONTADURÍA / COBROS ---

  async getBillingProducts() {
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('billing_products')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    }
    return getMockData('chimbero_billing_products', [
      { code: 'guia_comercial', name: 'Guía Comercial', default_price: 15000, billing_period: 'monthly', is_active: true },
      { code: 'delivery', name: 'Delivery Chimbero', default_price: 35000, billing_period: 'monthly', is_active: true },
      { code: 'farmacia_turno', name: 'Farmacia de Turno', default_price: 12000, billing_period: 'monthly', is_active: true },
      { code: 'kiosco_abierto', name: 'Kiosco Abierto / 24hs', default_price: 10000, billing_period: 'monthly', is_active: true },
      { code: 'turnos', name: 'Sistema de Turnos', default_price: 25000, billing_period: 'monthly', is_active: true },
      { code: 'banner', name: 'Publicidad Banner (Hacele Banners)', default_price: 20000, billing_period: 'monthly', is_active: true },
      { code: 'clasificado_destacado', name: 'Clasificado Destacado', default_price: 8000, billing_period: 'monthly', is_active: true },
    ]);
  },

  async updateBillingProduct(code, updates) {
    await this.requireAdmin();
    const payload = {};
    if (updates.default_price != null) payload.default_price = parseFloat(updates.default_price) || 0;
    if (updates.name != null) payload.name = updates.name;
    if (updates.description != null) payload.description = updates.description;
    if (updates.is_active != null) payload.is_active = !!updates.is_active;

    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('billing_products')
        .update(payload)
        .eq('code', code)
        .select();
      if (error) throw error;
      return data[0];
    }
    const products = getMockData('chimbero_billing_products', []);
    const idx = products.findIndex((p) => p.code === code);
    if (idx === -1) throw new Error('Producto no encontrado');
    products[idx] = { ...products[idx], ...payload };
    saveMockData('chimbero_billing_products', products);
    return products[idx];
  },

  async getBillingClients() {
    await this.requireAdmin();
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('billing_clients')
        .select('*, businesses(id, name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return getMockData('chimbero_billing_clients', []);
  },

  async createBillingClient(clientData) {
    await this.requireAdmin();
    const row = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      name: clientData.name.trim(),
      email: clientData.email || null,
      phone: clientData.phone || null,
      whatsapp: clientData.whatsapp || null,
      business_id: clientData.business_id || null,
      notes: clientData.notes || null,
      created_at: new Date().toISOString(),
    };
    if (!isMock) {
      const { id, created_at, ...payload } = row;
      const { data, error } = await supabaseClient.from('billing_clients').insert([payload]).select();
      if (error) throw error;
      return data[0];
    }
    const clients = getMockData('chimbero_billing_clients', []);
    clients.unshift(row);
    saveMockData('chimbero_billing_clients', clients);
    return row;
  },

  async updateBillingClient(id, clientData) {
    await this.requireAdmin();
    const payload = {
      name: clientData.name.trim(),
      email: clientData.email || null,
      phone: clientData.phone || null,
      whatsapp: clientData.whatsapp || null,
      business_id: clientData.business_id || null,
      notes: clientData.notes || null,
    };
    if (!isMock) {
      const { data, error } = await supabaseClient.from('billing_clients').update(payload).eq('id', id).select();
      if (error) throw error;
      return data[0];
    }
    const clients = getMockData('chimbero_billing_clients', []);
    const idx = clients.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Cliente no encontrado');
    clients[idx] = { ...clients[idx], ...payload };
    saveMockData('chimbero_billing_clients', clients);
    return clients[idx];
  },

  async deleteBillingClient(id) {
    await this.requireAdmin();
    if (!isMock) {
      const { error } = await supabaseClient.from('billing_clients').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    saveMockData(
      'chimbero_billing_clients',
      getMockData('chimbero_billing_clients', []).filter((c) => c.id !== id)
    );
  },

  async ensureClientForBusiness(business) {
    await this.requireAdmin();
    if (!isMock) {
      const { data: existing } = await supabaseClient
        .from('billing_clients')
        .select('*')
        .eq('business_id', business.id)
        .limit(1);
      if (existing?.length) return existing[0];
      return this.createBillingClient({
        name: business.name,
        phone: business.phone || null,
        whatsapp: business.whatsapp || null,
        business_id: business.id,
        notes: `Auto: ${business.neighborhood || ''}`,
      });
    }
    const clients = getMockData('chimbero_billing_clients', []);
    const found = clients.find((c) => c.business_id === business.id);
    if (found) return found;
    return this.createBillingClient({
      name: business.name,
      phone: business.phone || null,
      whatsapp: business.whatsapp || null,
      business_id: business.id,
    });
  },

  async getBillingSubscriptions() {
    await this.requireAdmin();
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('billing_subscriptions')
        .select('*, billing_clients(id, name, phone, whatsapp), billing_products(code, name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return getMockData('chimbero_billing_subscriptions', []);
  },

  async createBillingSubscription(subData) {
    await this.requireAdmin();
    const products = await this.getBillingProducts();
    const product = products.find((p) => p.code === subData.product_code);
    if (!product) throw new Error('Producto cobrable no encontrado');

    const amount = subData.amount != null ? parseFloat(subData.amount) : parseFloat(product.default_price) || 0;
    const start = subData.start_date || new Date().toISOString().slice(0, 10);
    const next = subData.next_billing_date || start;

    const row = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      client_id: subData.client_id,
      product_code: subData.product_code,
      business_id: subData.business_id || null,
      entity_type: subData.entity_type || null,
      entity_id: subData.entity_id || null,
      amount,
      status: subData.status || 'active',
      start_date: start,
      next_billing_date: next,
      notes: subData.notes || null,
      created_at: new Date().toISOString(),
    };

    if (!isMock) {
      const { id, created_at, ...payload } = row;
      const { data, error } = await supabaseClient.from('billing_subscriptions').insert([payload]).select();
      if (error) throw error;
      return data[0];
    }
    const subs = getMockData('chimbero_billing_subscriptions', []);
    subs.unshift(row);
    saveMockData('chimbero_billing_subscriptions', subs);
    return row;
  },

  async updateBillingSubscription(id, updates) {
    await this.requireAdmin();
    const payload = {};
    if (updates.amount != null) payload.amount = parseFloat(updates.amount) || 0;
    if (updates.status != null) payload.status = updates.status;
    if (updates.next_billing_date != null) payload.next_billing_date = updates.next_billing_date;
    if (updates.notes != null) payload.notes = updates.notes;

    if (!isMock) {
      const { data, error } = await supabaseClient.from('billing_subscriptions').update(payload).eq('id', id).select();
      if (error) throw error;
      return data[0];
    }
    const subs = getMockData('chimbero_billing_subscriptions', []);
    const idx = subs.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Suscripción no encontrada');
    subs[idx] = { ...subs[idx], ...payload };
    saveMockData('chimbero_billing_subscriptions', subs);
    return subs[idx];
  },

  /** Alta rápida: cliente (por comercio o nombre) + suscripción + cobro del mes */
  async enrollPaidService({
    product_code,
    business = null,
    client_name = null,
    client_phone = null,
    entity_type = null,
    entity_id = null,
    amount = null,
    create_charge = true,
  }) {
    await this.requireAdmin();
    let client;
    if (business?.id) {
      client = await this.ensureClientForBusiness(business);
    } else {
      if (!client_name?.trim()) throw new Error('Nombre de cliente requerido');
      client = await this.createBillingClient({
        name: client_name,
        phone: client_phone,
        whatsapp: client_phone,
      });
    }

    const products = await this.getBillingProducts();
    const product = products.find((p) => p.code === product_code);
    if (!product) throw new Error('Producto no encontrado');

    const existing = (await this.getBillingSubscriptions()).find(
      (s) =>
        s.client_id === client.id &&
        s.product_code === product_code &&
        s.status === 'active' &&
        (!entity_id || s.entity_id === entity_id)
    );
    if (existing) return { client, subscription: existing, charge: null, already: true };

    const subscription = await this.createBillingSubscription({
      client_id: client.id,
      product_code,
      business_id: business?.id || null,
      entity_type,
      entity_id,
      amount: amount != null ? amount : product.default_price,
    });

    let charge = null;
    if (create_charge) {
      charge = await this.createBillingCharge({
        client_id: client.id,
        subscription_id: subscription.id,
        product_code,
        description: `${product.name} — ${client.name}`,
        amount: subscription.amount,
      });
    }

    return { client, subscription, charge, already: false };
  },

  async getBillingCharges() {
    await this.requireAdmin();
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('billing_charges')
        .select('*, billing_clients(id, name, phone, whatsapp)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return getMockData('chimbero_billing_charges', []);
  },

  async createBillingCharge(chargeData) {
    await this.requireAdmin();
    const due = chargeData.due_date || (() => {
      const d = new Date();
      d.setDate(d.getDate() + 10);
      return d.toISOString().slice(0, 10);
    })();
    const period = chargeData.period_label || new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

    const row = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      client_id: chargeData.client_id,
      subscription_id: chargeData.subscription_id || null,
      product_code: chargeData.product_code,
      description: chargeData.description,
      amount: parseFloat(chargeData.amount) || 0,
      period_label: period,
      status: chargeData.status || 'pending',
      due_date: due,
      paid_at: null,
      payment_method: null,
      created_at: new Date().toISOString(),
    };

    if (!isMock) {
      const { id, created_at, ...payload } = row;
      const { data, error } = await supabaseClient.from('billing_charges').insert([payload]).select();
      if (error) throw error;
      return data[0];
    }
    const charges = getMockData('chimbero_billing_charges', []);
    charges.unshift(row);
    saveMockData('chimbero_billing_charges', charges);
    return row;
  },

  async markChargePaid(id, payment_method = 'transferencia') {
    await this.requireAdmin();
    const payload = {
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_method,
    };
    if (!isMock) {
      const { data, error } = await supabaseClient.from('billing_charges').update(payload).eq('id', id).select();
      if (error) throw error;
      return data[0];
    }
    const charges = getMockData('chimbero_billing_charges', []);
    const idx = charges.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Cobro no encontrado');
    charges[idx] = { ...charges[idx], ...payload };
    saveMockData('chimbero_billing_charges', charges);
    return charges[idx];
  },

  async updateChargeStatus(id, status) {
    await this.requireAdmin();
    const payload = { status };
    if (status !== 'paid') {
      payload.paid_at = null;
      payload.payment_method = null;
    }
    if (!isMock) {
      const { data, error } = await supabaseClient.from('billing_charges').update(payload).eq('id', id).select();
      if (error) throw error;
      return data[0];
    }
    const charges = getMockData('chimbero_billing_charges', []);
    const idx = charges.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Cobro no encontrado');
    charges[idx] = { ...charges[idx], ...payload };
    saveMockData('chimbero_billing_charges', charges);
    return charges[idx];
  },

  /** Genera cobros del mes para todas las suscripciones activas (evita duplicar period_label) */
  async generateMonthlyCharges(periodLabel = null) {
    await this.requireAdmin();
    const label = periodLabel || new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    const subs = (await this.getBillingSubscriptions()).filter((s) => s.status === 'active');
    const existing = await this.getBillingCharges();
    const created = [];

    for (const sub of subs) {
      const already = existing.some(
        (c) => c.subscription_id === sub.id && c.period_label === label && c.status !== 'cancelled'
      );
      if (already) continue;
      const clientName = sub.billing_clients?.name || 'Cliente';
      const productName = sub.billing_products?.name || sub.product_code;
      const charge = await this.createBillingCharge({
        client_id: sub.client_id,
        subscription_id: sub.id,
        product_code: sub.product_code,
        description: `${productName} — ${clientName}`,
        amount: sub.amount,
        period_label: label,
      });
      created.push(charge);
    }
    return created;
  },

  async syncOverdueCharges() {
    await this.requireAdmin();
    const today = new Date().toISOString().slice(0, 10);
    const charges = await this.getBillingCharges();
    const toMark = charges.filter((c) => c.status === 'pending' && c.due_date && c.due_date < today);
    for (const c of toMark) {
      try {
        await this.updateChargeStatus(c.id, 'overdue');
      } catch (e) {
        console.warn('No se pudo marcar vencido', c.id, e);
      }
    }
    return toMark.length;
  },

  async getBillingSummary() {
    await this.requireAdmin();
    await this.syncOverdueCharges();
    const charges = await this.getBillingCharges();
    const subs = await this.getBillingSubscriptions();
    const today = new Date().toISOString().slice(0, 10);
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    const in7Str = in7.toISOString().slice(0, 10);
    const month = new Date().getMonth();
    const year = new Date().getFullYear();

    const unpaid = charges.filter((c) => c.status === 'pending' || c.status === 'overdue');
    const overdue = unpaid.filter((c) => c.status === 'overdue' || (c.due_date && c.due_date < today));
    const dueSoon = unpaid.filter(
      (c) => c.status === 'pending' && c.due_date && c.due_date >= today && c.due_date <= in7Str
    );
    const paidThisMonth = charges.filter((c) => {
      if (c.status !== 'paid' || !c.paid_at) return false;
      const d = new Date(c.paid_at);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    const paidAll = charges.filter((c) => c.status === 'paid');

    const mapChargeAlert = (c) => ({
      id: c.id,
      description: c.description,
      client: c.billing_clients?.name || 'Cliente',
      amount: parseFloat(c.amount) || 0,
      due_date: c.due_date,
      status: c.status,
      product_code: c.product_code,
    });

    return {
      // Totales principales
      to_collect_total: unpaid.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0),
      to_collect_count: unpaid.length,
      pending_count: unpaid.filter((c) => c.status === 'pending').length,
      pending_total: unpaid.filter((c) => c.status === 'pending').reduce((s, c) => s + (parseFloat(c.amount) || 0), 0),
      overdue_count: overdue.length,
      overdue_total: overdue.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0),
      due_soon_count: dueSoon.length,
      due_soon_total: dueSoon.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0),
      paid_month_count: paidThisMonth.length,
      paid_month_total: paidThisMonth.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0),
      paid_all_total: paidAll.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0),
      paid_all_count: paidAll.length,
      active_subscriptions: subs.filter((s) => s.status === 'active').length,
      mrr: subs.filter((s) => s.status === 'active').reduce((s, c) => s + (parseFloat(c.amount) || 0), 0),
      // Listas para alertas
      overdue_alerts: overdue
        .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''))
        .map(mapChargeAlert),
      due_soon_alerts: dueSoon
        .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''))
        .map(mapChargeAlert),
    };
  },

  async getActiveBanners(placement = null) {
    if (!isMock) {
      let query = supabaseClient
        .from('ad_banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (placement) query = query.eq('placement', placement);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
    const all = getMockData('chimbero_ad_banners', []).filter((b) => b.is_active);
    return placement ? all.filter((b) => b.placement === placement) : all;
  },

  async getAllBannersAdmin() {
    await this.requireAdmin();
    if (!isMock) {
      const { data, error } = await supabaseClient
        .from('ad_banners')
        .select('*, billing_clients(id, name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return getMockData('chimbero_ad_banners', []);
  },

  async createBanner(bannerData) {
    await this.requireAdmin();
    const row = {
      id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(),
      client_id: bannerData.client_id || null,
      subscription_id: bannerData.subscription_id || null,
      title: bannerData.title.trim(),
      image_url: bannerData.image_url,
      link_url: bannerData.link_url || null,
      placement: bannerData.placement || 'home_mid',
      is_active: bannerData.is_active !== false,
      starts_at: bannerData.starts_at || null,
      ends_at: bannerData.ends_at || null,
      sort_order: bannerData.sort_order || 0,
      created_at: new Date().toISOString(),
    };
    if (!isMock) {
      const { id, created_at, ...payload } = row;
      const { data, error } = await supabaseClient.from('ad_banners').insert([payload]).select();
      if (error) throw error;
      return data[0];
    }
    const banners = getMockData('chimbero_ad_banners', []);
    banners.unshift(row);
    saveMockData('chimbero_ad_banners', banners);
    return row;
  },

  async updateBanner(id, bannerData) {
    await this.requireAdmin();
    const payload = {
      title: bannerData.title.trim(),
      image_url: bannerData.image_url,
      link_url: bannerData.link_url || null,
      placement: bannerData.placement || 'home_mid',
      is_active: bannerData.is_active !== false,
      starts_at: bannerData.starts_at || null,
      ends_at: bannerData.ends_at || null,
      sort_order: bannerData.sort_order || 0,
      client_id: bannerData.client_id || null,
    };
    if (!isMock) {
      const { data, error } = await supabaseClient.from('ad_banners').update(payload).eq('id', id).select();
      if (error) throw error;
      return data[0];
    }
    const banners = getMockData('chimbero_ad_banners', []);
    const idx = banners.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Banner no encontrado');
    banners[idx] = { ...banners[idx], ...payload };
    saveMockData('chimbero_ad_banners', banners);
    return banners[idx];
  },

  async deleteBanner(id) {
    await this.requireAdmin();
    if (!isMock) {
      const { error } = await supabaseClient.from('ad_banners').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    saveMockData(
      'chimbero_ad_banners',
      getMockData('chimbero_ad_banners', []).filter((b) => b.id !== id)
    );
  },
};
