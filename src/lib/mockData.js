// Datos semilla mockeados en JavaScript para desarrollo local sin Supabase
// Se inicializan con datos de Chimbas, San Juan

export const initialProfiles = [
  {
    id: 'd3b07384-d113-4ec5-a581-2292d3b2e591',
    full_name: 'Juan Pérez',
    phone: '2645123456',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    created_at: new Date().toISOString()
  }
];

export const initialBusinesses = [
  {
    id: 'a1b07384-d113-4ec5-a581-2292d3b2e001',
    owner_id: 'd3b07384-d113-4ec5-a581-2292d3b2e591',
    name: 'Pizzería La Chimbera',
    description: 'Las mejores pizzas a la piedra de Chimbas. Empanadas sanjuaninas hechas en horno de barro y lomos gigantes. ¡Envío a domicilio sin cargo en Villa Paula!',
    category: 'Gastronomía',
    address: 'Tucumán 1450 (Norte)',
    neighborhood: 'Villa Paula',
    phone: '264-4901234',
    whatsapp: '542644901234',
    latitude: -31.4958,
    longitude: -68.5352,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    hours: { lunes_a_viernes: '19:00 - 00:30', sabado_y_domingo: '19:00 - 01:30' },
    status: 'approved',
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'a1b07384-d113-4ec5-a581-2292d3b2e002',
    owner_id: null,
    name: 'Ferretería El Caldén',
    description: 'Todo para la construcción, electricidad, plomería y herramientas. Pinturas nacionales e importadas. Atención personalizada y presupuestos para obras.',
    category: 'Construcción y Ferretería',
    address: 'Benavidez 2100 (Oeste)',
    neighborhood: 'Barrio Los Tamarindos',
    phone: '264-4288765',
    whatsapp: '542644288765',
    latitude: -31.5012,
    longitude: -68.5245,
    image_url: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80',
    hours: { lunes_a_sabado: '08:30 - 13:00, 16:30 - 20:30' },
    status: 'approved',
    is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'a1b07384-d113-4ec5-a581-2292d3b2e003',
    owner_id: 'd3b07384-d113-4ec5-a581-2292d3b2e591',
    name: 'El Rey de la Costanera',
    description: 'Parrillada completa los fines de semana. Chivito, costillares y el mejor vacío al asador en un ambiente familiar único cerca del río San Juan.',
    category: 'Gastronomía',
    address: 'Av. Costanera s/n (frente al Complejo Ferial)',
    neighborhood: 'Costanera',
    phone: '264-4776655',
    whatsapp: '542644776655',
    latitude: -31.4785,
    longitude: -68.5451,
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    hours: { viernes_y_sabado: '21:00 - 02:00', domingo: '12:00 - 16:00' },
    status: 'approved',
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'a1b07384-d113-4ec5-a581-2292d3b2e004',
    owner_id: null,
    name: 'Minimarket Villa Obrera',
    description: 'Almacén familiar con excelente variedad de fiambres, lácteos, carnicería y verdulería fresca todos los días. Aceptamos todas las tarjetas y Mercado Pago.',
    category: 'Almacén y Comestibles',
    address: 'Ruta 40 y Neuquén',
    neighborhood: 'Villa Obrera',
    phone: '264-4554433',
    whatsapp: '542644554433',
    latitude: -31.4852,
    longitude: -68.5305,
    image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    hours: { lunes_a_domingo: '08:00 - 22:00' },
    status: 'approved',
    is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'a1b07384-d113-4ec5-a581-2292d3b2e005',
    owner_id: null,
    name: 'Taller Mecánico San Cayetano',
    description: 'Mecánica general del automotor, inyección electrónica, frenos, embragues y alineación y balanceo computarizado. Diagnósticos rápidos y garantizados.',
    category: 'Automotores y Servicios',
    address: 'Neuquén 890 (Oeste)',
    neighborhood: 'Villa Observatorio',
    phone: '264-4889900',
    whatsapp: '542644889900',
    latitude: -31.5065,
    longitude: -68.5582,
    image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    hours: { lunes_a_viernes: '08:30 - 12:30, 16:00 - 20:00', sabado: '08:30 - 13:00' },
    status: 'approved',
    is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'a1b07384-d113-4ec5-a581-2292d3b2e006',
    owner_id: 'd3b07384-d113-4ec5-a581-2292d3b2e591',
    name: 'Indumentaria Urbana Chimbas',
    description: 'La mejor moda para hombres, mujeres y niños. Ropa informal, deportiva y accesorios a precios accesibles. Promociones especiales todas las semanas.',
    category: 'Indumentaria y Calzado',
    address: 'Mendoza 1220 (Norte)',
    neighborhood: 'Villa Paula',
    phone: '264-4112233',
    whatsapp: '542644112233',
    latitude: -31.4942,
    longitude: -68.5338,
    image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    hours: { lunes_a_sabado: '09:00 - 13:00, 17:00 - 21:00' },
    status: 'approved',
    is_featured: true,
    created_at: new Date().toISOString()
  }
];

export const initialClassifieds = [
  {
    id: 'c1b07384-d113-4ec5-a581-2292d3b2e101',
    user_id: 'd3b07384-d113-4ec5-a581-2292d3b2e591',
    title: 'Bicicleta Mountain Bike Rodado 29',
    description: 'Se vende bicicleta Mountain Bike talle M, rodado 29, cuadro de aluminio super liviano, 21 velocidades Shimano, frenos a disco mecánico. Muy poco uso, casi nueva. Escucho ofertas de contado.',
    price: 145000,
    category: 'sale',
    condition: 'used',
    image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
    whatsapp: '542645123456',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'c1b07384-d113-4ec5-a581-2292d3b2e102',
    user_id: 'd3b07384-d113-4ec5-a581-2292d3b2e591',
    title: 'Servicio de Electricidad del Hogar y Comercios',
    description: 'Electricista matriculado ofrece servicios de instalaciones eléctricas desde cero, tableros generales, colocación de luminarias, reparación de cortocircuitos y trámites ante el E.P.R.E. Urgencias las 24hs.',
    price: 0,
    category: 'service',
    condition: 'not_applicable',
    image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    whatsapp: '542645123456',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'c1b07384-d113-4ec5-a581-2292d3b2e103',
    user_id: 'd3b07384-d113-4ec5-a581-2292d3b2e591',
    title: 'Alquiler Departamento 1 Dormitorio - Villa Paula',
    description: 'Se alquila departamento en planta alta en el centro de Chimbas (Villa Paula). Consta de 1 dormitorio con placard, cocina-comedor equipada con bajo mesada y alacena, baño completo y balcón. Sin expensas. Ideal para persona sola o pareja.',
    price: 160000,
    category: 'rent',
    condition: 'not_applicable',
    image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    whatsapp: '542645123456',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'c1b07384-d113-4ec5-a581-2292d3b2e104',
    user_id: 'd3b07384-d113-4ec5-a581-2292d3b2e591',
    title: 'Búsqueda de Empleada/o Administrativo Contable',
    description: 'Buscamos personal administrativo para empresa en el Parque Industrial de Chimbas. Requisitos: Experiencia previa en facturación, conciliaciones bancarias y manejo de Excel. Secundario completo. Enviar CV.',
    price: 0,
    category: 'job',
    condition: 'not_applicable',
    image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    whatsapp: '542645123456',
    status: 'active',
    created_at: new Date().toISOString()
  }
];

// Helper helper generating dates dynamically
const getDates = (offsets) => {
  return offsets.map(offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  });
};

export const initialPharmacies = [
  {
    id: 'f1b07384-d113-4ec5-a581-2292d3b2e201',
    name: 'Farmacia San Cayetano',
    address: 'Tucumán 1320 (Norte) - Villa Paula',
    phone: '264-4315566',
    latitude: -31.4951,
    longitude: -68.5345,
    duty_dates: getDates([0, 2, 4, 6, -2]),
    is_open_24h: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'f1b07384-d113-4ec5-a581-2292d3b2e202',
    name: 'Farmacia Villa Obrera',
    address: 'Ruta 40 y Dorrego - Villa Obrera',
    phone: '264-4284422',
    latitude: -31.4845,
    longitude: -68.5298,
    duty_dates: getDates([1, 3, 5, -1, -3]),
    is_open_24h: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'f1b07384-d113-4ec5-a581-2292d3b2e203',
    name: 'Farmacia Del Norte',
    address: 'Benavidez 1950 (Oeste) - B° Los Tamarindos',
    phone: '264-4217733',
    latitude: -31.5005,
    longitude: -68.5252,
    duty_dates: getDates([0, 3, 6, -1]),
    is_open_24h: false,
    created_at: new Date().toISOString()
  }
];

export const initialKiosks = [
  {
    id: 'k1b07384-d113-4ec5-a581-2292d3b2e301',
    name: 'Kiosco El Trébol 24hs',
    address: 'Mendoza y Chubut (Villa Paula)',
    neighborhood: 'Villa Paula',
    phone: '264-4098712',
    latitude: -31.4965,
    longitude: -68.5361,
    is_open_24h: true,
    hours_description: 'Abierto las 24 horas del día. Carga de sube, bebidas frías, cigarrillos, golosinas y mercadería en general.',
    created_at: new Date().toISOString()
  },
  {
    id: 'k1b07384-d113-4ec5-a581-2292d3b2e302',
    name: 'Drugstore El Monumental',
    address: 'Neuquén 320 - Villa Obrera',
    neighborhood: 'Villa Obrera',
    phone: '264-4123399',
    latitude: -31.4861,
    longitude: -68.5312,
    is_open_24h: false,
    hours_description: 'Abierto todos los días de 08:00 a 02:00. Bebidas, snacks, fiambrería express y carbón.',
    created_at: new Date().toISOString()
  },
  {
    id: 'k1b07384-d113-4ec5-a581-2292d3b2e303',
    name: 'Kiosco 24hs Las Tres Hermanas',
    address: 'Benavidez s/n (frente al Observatorio)',
    neighborhood: 'Villa Observatorio',
    phone: '264-4771122',
    latitude: -31.5058,
    longitude: -68.5591,
    is_open_24h: true,
    hours_description: 'Abierto las 24 horas. Amplia variedad de golosinas, bebidas frías, sándwiches y artículos de almacén de primera necesidad.',
    created_at: new Date().toISOString()
  }
];

export const initialEvents = [
  {
    id: 'e1b07384-d113-4ec5-a581-2292d3b2e401',
    title: 'Carnaval de Chimbas 2026',
    description: 'El evento más alegre de la provincia de San Juan. Desfile de comparsas locales e invitadas, shows en vivo, stands gastronómicos y elección de la embajadora del Carnaval.',
    date: '2026-02-14',
    time: '21:00',
    location: 'Corsódromo del Complejo Ferial Costanera',
    category: 'Cultura',
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    price: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 'e1b07384-d113-4ec5-a581-2292d3b2e402',
    title: 'Fiesta Provincial de la Empanada Sanjuanina',
    description: 'Concurso de la mejor empanada chimbera de carne cortada a cuchillo. Shows folclóricos locales, academias de baile y feria de artesanos del departamento.',
    date: '2026-07-09',
    time: '12:00',
    location: 'Plaza Centenario de Chimbas',
    category: 'Gastronomía',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    price: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 'e1b07384-d113-4ec5-a581-2292d3b2e403',
    title: 'Torneo Relámpago de Futsal Femenino',
    description: 'Inscripciones abiertas para todos los equipos vecinales de Chimbas. Premios para el 1er, 2do y 3er puesto. Cantina a beneficio del club de barrio.',
    date: '2026-06-28',
    time: '09:00',
    location: 'Polideportivo Villa Paula',
    category: 'Deportes',
    image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    price: 5000,
    created_at: new Date().toISOString()
  },
  {
    id: 'e1b07384-d113-4ec5-a581-2292d3b2e404',
    title: 'Taller de Iniciación a la Robótica para Niños',
    description: 'Curso gratuito orientado a chicos de 8 a 12 años. Cupos limitados. Aprendé las bases de Arduino y programación de sensores básicos en un ambiente divertido.',
    date: '2026-06-22',
    time: '16:00',
    location: 'Punto Digital Chimbas (Delegación Oeste)',
    category: 'Talleres',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    price: 0,
    created_at: new Date().toISOString()
  }
];

export const initialBuses = [
  {
    id: 'b1b07384-d113-4ec5-a581-2292d3b2e501',
    line: 'Línea 400',
    description: 'Conexión rápida entre Chimbas (Villa Paula) y la Terminal de Ómnibus / Centro de San Juan.',
    type: 'capital_conexion',
    frequency: 'Cada 12 minutos',
    neighborhoods: ['Villa Paula', 'Barrio Santo Domingo', 'Capital Centro'],
    stops: [
      'Plaza Centenario de Chimbas (Mendoza y Chubut)',
      'Calle Tucumán y Benavidez',
      'Av. Libertador y Mendoza (Capital)',
      'Terminal de Ómnibus de San Juan'
    ],
    schedule: 'Lunes a Sábado de 05:00 a 23:45, Domingos de 07:00 a 22:30',
    created_at: new Date().toISOString()
  },
  {
    id: 'b1b07384-d113-4ec5-a581-2292d3b2e502',
    line: 'Línea 401',
    description: 'Servicio interno de Chimbas que une el sector Oeste (Villa Observatorio) con el sector Este (Villa Obrera).',
    type: 'interno_chimbas',
    frequency: 'Cada 18 minutos',
    neighborhoods: ['Villa Observatorio', 'Barrio Los Tamarindos', 'Villa Paula', 'Villa Obrera'],
    stops: [
      'Plaza de Villa Observatorio',
      'Calle Benavidez (Frente a Ferretería El Caldén)',
      'Plaza Centenario (Villa Paula)',
      'Calle Neuquén y Ruta 40 (Villa Obrera)'
    ],
    schedule: 'Lunes a Viernes de 05:30 a 23:00, Sábados y Domingos de 06:30 a 22:00',
    created_at: new Date().toISOString()
  },
  {
    id: 'b1b07384-d113-4ec5-a581-2292d3b2e503',
    line: 'Línea 420',
    description: 'Línea universitaria y de salud. Conecta Chimbas directamente con el Complejo Universitario Islas Malvinas (CUIM) de la UNSJ y el Hospital Rawson.',
    type: 'salud_universidad',
    frequency: 'Cada 15 minutos',
    neighborhoods: ['Villa Paula', 'Villa Observatorio', 'Capital Rawson', 'Rivadavia CUIM'],
    stops: [
      'Plaza Centenario de Chimbas',
      'Complejo Ferial Costanera (en días de eventos)',
      'Hospital Guillermo Rawson (Capital)',
      'CUIM - UNSJ (Rivadavia)'
    ],
    schedule: 'Lunes a Viernes de 06:00 a 22:30 (Frecuencia reducida los sábados)',
    created_at: new Date().toISOString()
  }
];

export const initialJobs = [
  {
    id: 'j1b07384-d113-4ec5-a581-2292d3b2e601',
    title: 'Mozo / Ayudante de Cocina para Fines de Semana',
    description: 'Pizzería La Chimbera busca personal para atención al público y tareas básicas de ayudante de cocina. Experiencia previa valorada. Se ofrece excelente ambiente laboral y pago por jornada.',
    type: 'oferta_laboral',
    category: 'Gastronomía',
    price: 0,
    company: 'Pizzería La Chimbera',
    contact_name: 'Juan Pérez',
    whatsapp: '542644901234',
    created_at: new Date().toISOString()
  },
  {
    id: 'j1b07384-d113-4ec5-a581-2292d3b2e602',
    title: 'Servicio de Pintura de Frentes e Interiores',
    description: 'Vecino del Barrio Santo Domingo ofrece servicio de pintura en general, enduido, impermeabilización de techos y colocación de membranas. Presupuestos sin cargo en todo Chimbas.',
    type: 'servicio_vecinal',
    category: 'Construcción y Mantenimiento',
    price: 0,
    company: 'Pinturas Chimbas Express',
    contact_name: 'Carlos Gómez',
    whatsapp: '542645678901',
    created_at: new Date().toISOString()
  },
  {
    id: 'j1b07384-d113-4ec5-a581-2292d3b2e603',
    title: 'Vendedora para Local de Ropa de Niños',
    description: 'Comercio céntrico en Mendoza y Chubut busca vendedora para turno tarde. Requisitos: Buena presencia, proactiva y experiencia en atención al público. Edad de 18 a 30 años.',
    type: 'oferta_laboral',
    category: 'Ventas y Atención al Cliente',
    price: 180000,
    company: 'Indumentaria Burbujas',
    contact_name: 'Marta Soler',
    whatsapp: '542644112233',
    created_at: new Date().toISOString()
  },
  {
    id: 'j1b07384-d113-4ec5-a581-2292d3b2e604',
    title: 'Apoyo Escolar Primario e Inglés Inicial',
    description: 'Estudiante avanzada de profesorado de inglés ofrece clases particulares de apoyo escolar general para nivel primario y clases de inglés para todas las edades. Clases a domicilio en Villa Paula.',
    type: 'servicio_vecinal',
    category: 'Educación',
    price: 1500,
    company: 'Particular',
    contact_name: 'Laura Fernández',
    whatsapp: '542645889977',
    created_at: new Date().toISOString()
  }
];

