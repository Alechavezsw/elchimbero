// Datos semilla mockeados en JavaScript para desarrollo local sin Supabase
// Se inicializan con datos de Chimbas, San Juan

export const initialProfiles = [
  {
    id: 'd3b07384-d113-4ec5-a581-2292d3b2e591',
    full_name: 'Juan Pérez',
    phone: '2645123456',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    created_at: new Date().toISOString(),
    is_admin: false,
    email: 'test@elchimbero.com'
  },
  {
    id: 'a0b07384-d113-4ec5-a581-2292d3b2e999',
    full_name: 'Admin Chimbero',
    phone: '264000000',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    created_at: new Date().toISOString(),
    is_admin: true,
    email: 'admin@elchimbero.com'
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
    id: '01b07384-d113-4ec5-a581-2292d3b2e301',
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
    id: '01b07384-d113-4ec5-a581-2292d3b2e302',
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
    id: '01b07384-d113-4ec5-a581-2292d3b2e303',
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
    category: 'Educación',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    price: 0,
    created_at: new Date().toISOString()
  }
];

export const initialBuses = [
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e501",
    "line": "Línea 400",
    "description": "Conecta Villa Observatorio en Chimbas Oeste con el Hospital Dr. Guillermo Rawson pasando por el centro de San Juan.",
    "type": "capital_conexion",
    "frequency": "Cada 12 minutos",
    "neighborhoods": [
      "Villa Observatorio",
      "Barrio Santo Domingo",
      "Villa Paula",
      "Capital Centro"
    ],
    "stops": [
      "Plaza de Villa Observatorio (Calle Pellegrini)",
      "Calle Pellegrini y Salta",
      "Calle Salta y Neuquén",
      "Calle Salta y Rodríguez",
      "Calle Salta y Centenario (Comisaría 30ª)",
      "Avenida Benavídez y Salta (Walmart)",
      "Avenida Benavídez y España",
      "Avenida Benavídez y Mendoza",
      "Plaza Centenario de Chimbas (Calle Mendoza)",
      "Municipalidad de Chimbas (Calle Mendoza)",
      "Calle Mendoza y Chile",
      "Calle Mendoza y San Isidro",
      "Calle Mendoza y 25 de Mayo",
      "Avenida España y 25 de Mayo",
      "Centro Cívico de San Juan (Avenida España)",
      "Calle Las Heras y Córdoba",
      "Teatro del Bicentenario (Las Heras)",
      "Avenida Libertador y Mendoza",
      "Calle Tucumán y Libertador",
      "Hospital Dr. Guillermo Rawson (Avenida Rawson)"
    ],
    "stops_vuelta": [
      "Hospital Dr. Guillermo Rawson (Avenida Rawson)",
      "Terminal de Ómnibus de San Juan",
      "Calle Tucumán y Libertador",
      "Avenida Libertador y General Acha",
      "Teatro del Bicentenario (Las Heras)",
      "Centro Cívico de San Juan (Avenida España)",
      "Avenida España y 25 de Mayo",
      "Calle Mendoza y 25 de Mayo",
      "Calle Mendoza y San Isidro",
      "Calle Mendoza y Chile",
      "Municipalidad de Chimbas (Calle Mendoza)",
      "Plaza Centenario de Chimbas (Calle Mendoza)",
      "Avenida Benavídez y Mendoza",
      "Avenida Benavídez y España",
      "Avenida Benavídez y Salta (Walmart)",
      "Calle Salta y Centenario (Comisaría 30ª)",
      "Calle Salta y Rodríguez",
      "Calle Salta y Neuquén",
      "Calle Pellegrini y Salta",
      "Plaza de Villa Observatorio (Calle Pellegrini)"
    ],
    "schedule": "Lunes a Sábado de 05:00 a 23:30, Domingos de 07:00 a 22:00"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e502",
    "line": "Línea 401",
    "description": "Une Villa Obrera en Chimbas Este con el Centro Cívico y el Hospital Dr. Guillermo Rawson.",
    "type": "capital_conexion",
    "frequency": "Cada 15 minutos",
    "neighborhoods": [
      "Villa Obrera",
      "Villa Paula",
      "Capital Centro"
    ],
    "stops": [
      "Plaza de Villa Obrera (Calle Dorrego)",
      "Calle Dorrego y Neuquén",
      "Calle Ruta 40 y Neuquén",
      "Delegación Municipal Este",
      "Calle Neuquén y Mendoza",
      "Plaza Centenario de Chimbas",
      "Calle Mendoza y Chubut",
      "Calle Mendoza y Benavídez",
      "Avenida Rioja y Benavídez",
      "Avenida Rioja y Corrientes",
      "Avenida Rioja y 25 de Mayo",
      "Avenida Libertador General San Martín y Rioja",
      "Centro Cívico de San Juan",
      "Avenida 25 de Mayo y Rawson",
      "Hospital Dr. Guillermo Rawson"
    ],
    "stops_vuelta": [
      "Hospital Dr. Guillermo Rawson",
      "Avenida Rawson y Santa Fe",
      "Avenida Libertador General San Martín y Rioja",
      "Centro Cívico de San Juan",
      "Avenida Rioja y 25 de Mayo",
      "Avenida Rioja y Corrientes",
      "Avenida Rioja y Benavídez",
      "Calle Mendoza y Benavídez",
      "Calle Mendoza y Chubut",
      "Plaza Centenario de Chimbas",
      "Calle Neuquén y Mendoza",
      "Delegación Municipal Este",
      "Calle Ruta 40 y Neuquén",
      "Calle Dorrego y Neuquén",
      "Plaza de Villa Obrera (Calle Dorrego)"
    ],
    "schedule": "Lunes a Viernes de 05:30 a 23:00, Sábados y Domingos de 06:30 a 22:30"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e503",
    "line": "Línea 402",
    "description": "Conecta el Barrio Pedregal con el Hospital Dr. Guillermo Rawson y la zona céntrica.",
    "type": "capital_conexion",
    "frequency": "Cada 18 minutos",
    "neighborhoods": [
      "Barrio Pedregal",
      "Villa Paula",
      "Capital Centro"
    ],
    "stops": [
      "Barrio Pedregal (Calle Rodríguez)",
      "Calle Mendoza y Rodríguez",
      "Calle Mendoza y Sabatini",
      "Calle Mendoza y Neuquén",
      "Calle Mendoza y Centenario",
      "Plaza Centenario de Chimbas",
      "Avenida Benavídez y Mendoza",
      "Avenida Benavídez y Salta",
      "San Juan Shopping (Avenida Benavídez)",
      "Avenida Benavídez y Tucumán",
      "Avenida España y Libertador",
      "Centro Cívico de San Juan",
      "Avenida Rawson y Santa Fe",
      "Hospital Dr. Guillermo Rawson"
    ],
    "stops_vuelta": [
      "Hospital Dr. Guillermo Rawson",
      "Avenida Rawson y Santa Fe",
      "Centro Cívico de San Juan",
      "Avenida España y Libertador",
      "Avenida Benavídez y Tucumán",
      "San Juan Shopping (Avenida Benavídez)",
      "Avenida Benavídez y Salta",
      "Avenida Benavídez y Mendoza",
      "Plaza Centenario de Chimbas",
      "Calle Mendoza y Centenario",
      "Calle Mendoza y Neuquén",
      "Calle Mendoza y Sabatini",
      "Calle Mendoza y Rodríguez",
      "Barrio Pedregal (Calle Rodríguez)"
    ],
    "schedule": "Lunes a Viernes de 05:45 a 22:45, Sábados de 06:00 a 22:00"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e504",
    "line": "Línea 403",
    "description": "Conexión desde Villa Paula a través del Centro Cívico hacia el Hospital Dr. Guillermo Rawson.",
    "type": "capital_conexion",
    "frequency": "Cada 14 minutos",
    "neighborhoods": [
      "Villa Paula",
      "Barrio Los Tamarindos",
      "Capital Centro"
    ],
    "stops": [
      "Plaza Centenario de Chimbas (Villa Paula)",
      "Calle Mendoza y Chubut",
      "Calle Mendoza y Benavídez",
      "Avenida Benavídez y Tucumán",
      "Calle Salta y Benavídez",
      "Calle Salta y Sargento Cabral",
      "Avenida España y San Isidro",
      "Parque de Mayo (Avenida Libertador)",
      "Centro Cívico de San Juan",
      "Avenida Rioja y Mitre",
      "Terminal de Ómnibus de San Juan",
      "Hospital Dr. Guillermo Rawson"
    ],
    "stops_vuelta": [
      "Hospital Dr. Guillermo Rawson",
      "Terminal de Ómnibus de San Juan",
      "Avenida Rioja y Mitre",
      "Centro Cívico de San Juan",
      "Parque de Mayo (Avenida Libertador)",
      "Avenida España y San Isidro",
      "Calle Salta y Sargento Cabral",
      "Calle Salta y Benavídez",
      "Avenida Benavídez y Tucumán",
      "Calle Mendoza y Benavídez",
      "Calle Mendoza y Chubut",
      "Plaza Centenario de Chimbas (Villa Paula)"
    ],
    "schedule": "Lunes a Sábado de 05:15 a 23:15, Domingos de 07:15 a 22:15"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e505",
    "line": "Línea 404",
    "description": "Une el Barrio Las Calandrias con el Hospital Dr. Guillermo Rawson pasando por la Plaza de Chimbas.",
    "type": "capital_conexion",
    "frequency": "Cada 16 minutos",
    "neighborhoods": [
      "Barrio Las Calandrias",
      "Villa Paula",
      "Capital Centro"
    ],
    "stops": [
      "Barrio Las Calandrias (Calle Oro)",
      "Costanera Alta (Frente a Río San Juan)",
      "Complejo Ferial Costanera",
      "Calle Mendoza y Oro",
      "Calle Mendoza y Rodríguez",
      "Calle Mendoza y Neuquén",
      "Plaza Centenario de Chimbas (Municipalidad)",
      "Calle Mendoza y Benavídez",
      "Avenida España y 25 de Mayo",
      "Centro Cívico de San Juan",
      "Avenida Rawson y Córdoba",
      "Hospital Dr. Guillermo Rawson"
    ],
    "stops_vuelta": [
      "Hospital Dr. Guillermo Rawson",
      "Avenida Rawson y Córdoba",
      "Centro Cívico de San Juan",
      "Avenida España y 25 de Mayo",
      "Calle Mendoza y Benavídez",
      "Plaza Centenario de Chimbas (Municipalidad)",
      "Calle Mendoza y Neuquén",
      "Calle Mendoza y Rodríguez",
      "Calle Mendoza y Oro",
      "Complejo Ferial Costanera",
      "Costanera Alta (Frente a Río San Juan)",
      "Barrio Las Calandrias (Calle Oro)"
    ],
    "schedule": "Lunes a Sábado de 05:30 a 23:00, Domingos de 07:00 a 22:00"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e506",
    "line": "Línea 405",
    "description": "Conecta el Barrio Natania VIII en Chimbas con el Centro Cívico y el Hospital Dr. Guillermo Rawson.",
    "type": "capital_conexion",
    "frequency": "Cada 15 minutos",
    "neighborhoods": [
      "Barrio Natania VIII",
      "Villa Paula",
      "Capital Centro"
    ],
    "stops": [
      "Barrio Natania VIII",
      "Calle Tucumán y Centenario",
      "Plaza Centenario de Chimbas",
      "Calle Mendoza y Benavídez",
      "Calle Tucumán y Benavídez",
      "Avenida Rioja y Benavídez",
      "Avenida Rioja y Libertador",
      "Plaza 25 de Mayo (Capital)",
      "Centro Cívico de San Juan",
      "Avenida Rawson y Santa Fe",
      "Hospital Dr. Guillermo Rawson"
    ],
    "stops_vuelta": [
      "Hospital Dr. Guillermo Rawson",
      "Avenida Rawson y Santa Fe",
      "Centro Cívico de San Juan",
      "Plaza 25 de Mayo (Capital)",
      "Avenida Rioja y Libertador",
      "Avenida Rioja y Benavídez",
      "Calle Tucumán y Benavídez",
      "Calle Mendoza y Benavídez",
      "Plaza Centenario de Chimbas",
      "Calle Tucumán y Centenario",
      "Barrio Natania VIII"
    ],
    "schedule": "Lunes a Viernes de 05:00 a 23:30, Sábados y Domingos de 06:30 a 22:30"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e507",
    "line": "Línea 406",
    "description": "Servicio interno de conexión entre Lote Hogar 59, Villa Paula y el Centro Cívico.",
    "type": "interno_chimbas",
    "frequency": "Cada 20 minutos",
    "neighborhoods": [
      "Lote Hogar 59",
      "Villa Paula",
      "Capital Centro"
    ],
    "stops": [
      "Lote Hogar 59",
      "Calle Centenario y Mendoza",
      "Plaza Centenario de Chimbas",
      "Municipalidad de Chimbas",
      "Calle Mendoza y Benavídez",
      "Calle Mendoza y Chile",
      "Calle Mendoza y 25 de Mayo",
      "Avenida Rioja y Corrientes",
      "Parque de Mayo (Avenida Libertador)",
      "Centro Cívico de San Juan (Terminus)"
    ],
    "stops_vuelta": [
      "Centro Cívico de San Juan (Terminus)",
      "Parque de Mayo (Avenida Libertador)",
      "Avenida Rioja y Corrientes",
      "Calle Mendoza y 25 de Mayo",
      "Calle Mendoza y Chile",
      "Calle Mendoza y Benavídez",
      "Municipalidad de Chimbas",
      "Plaza Centenario de Chimbas",
      "Calle Centenario y Mendoza",
      "Lote Hogar 59"
    ],
    "schedule": "Lunes a Viernes de 06:00 a 22:00, Sábados de 07:00 a 21:00"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e508",
    "line": "Línea 407",
    "description": "Conecta la Villa Mariano Moreno en el noreste de Chimbas con el Hospital Dr. Guillermo Rawson.",
    "type": "capital_conexion",
    "frequency": "Cada 18 minutos",
    "neighborhoods": [
      "Villa Mariano Moreno",
      "El Mogote",
      "Capital Centro"
    ],
    "stops": [
      "Villa Mariano Moreno (Calle Pellegrini)",
      "Calle Pellegrini y Mendoza",
      "Calle Mendoza y Oro",
      "Calle Mendoza y Rodríguez",
      "Calle Mendoza y Sabatini",
      "Calle Mendoza y Neuquén",
      "Plaza Centenario de Chimbas",
      "Calle Mendoza y Benavídez",
      "Avenida Rioja y 25 de Mayo",
      "Avenida Libertador y Rioja",
      "Hospital Dr. Guillermo Rawson",
      "Terminal de Ómnibus de San Juan",
      "Centro Cívico de San Juan"
    ],
    "stops_vuelta": [
      "Centro Cívico de San Juan",
      "Terminal de Ómnibus de San Juan",
      "Hospital Dr. Guillermo Rawson",
      "Avenida Libertador y Rioja",
      "Avenida Rioja y 25 de Mayo",
      "Calle Mendoza y Benavídez",
      "Plaza Centenario de Chimbas",
      "Calle Mendoza y Neuquén",
      "Calle Mendoza y Sabatini",
      "Calle Mendoza y Rodríguez",
      "Calle Mendoza y Oro",
      "Calle Pellegrini y Mendoza",
      "Villa Mariano Moreno (Calle Pellegrini)"
    ],
    "schedule": "Lunes a Viernes de 05:30 a 22:30, Sábados de 06:30 a 21:30"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e509",
    "line": "Línea 408",
    "description": "Une El Mogote y la Plaza de Chimbas con el Centro Cívico y el Hospital Dr. Guillermo Rawson.",
    "type": "capital_conexion",
    "frequency": "Cada 22 minutos",
    "neighborhoods": [
      "El Mogote",
      "Villa Paula",
      "Capital Centro"
    ],
    "stops": [
      "El Mogote (Calle Rodríguez)",
      "Portal de El Mogote",
      "Calle Tucumán y Rodríguez",
      "Calle Tucumán y Neuquén",
      "Calle Neuquén y Mendoza",
      "Plaza Centenario de Chimbas",
      "Calle Mendoza y Benavídez",
      "Avenida España y Benavídez",
      "Centro Cívico de San Juan",
      "Avenida Rioja y Santa Fe",
      "Hospital Dr. Guillermo Rawson"
    ],
    "stops_vuelta": [
      "Hospital Dr. Guillermo Rawson",
      "Avenida Rioja y Santa Fe",
      "Centro Cívico de San Juan",
      "Avenida España y Benavídez",
      "Calle Mendoza y Benavídez",
      "Plaza Centenario de Chimbas",
      "Calle Neuquén y Mendoza",
      "Calle Tucumán y Neuquén",
      "Calle Tucumán y Rodríguez",
      "Portal de El Mogote",
      "El Mogote (Calle Rodríguez)"
    ],
    "schedule": "Lunes a Viernes de 05:15 a 22:30, Sábados de 06:30 a 21:30"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e510",
    "line": "Línea 420",
    "description": "Línea de salud y universitaria. Conecta Chimbas directamente con el CUIM de la UNSJ y el Hospital Dr. Guillermo Rawson.",
    "type": "salud_universidad",
    "frequency": "Cada 15 minutos",
    "neighborhoods": [
      "Villa Paula",
      "Villa Observatorio",
      "Capital Rawson",
      "Rivadavia CUIM"
    ],
    "stops": [
      "Plaza Centenario de Chimbas",
      "Complejo Ferial Costanera",
      "Chimbas Oeste (Villa Observatorio)",
      "Avenida Benavídez y Salta",
      "San Juan Shopping (Avenida Benavídez)",
      "Avenida Libertador (Parque de Mayo)",
      "Avenida España y Libertador",
      "Hospital Dr. Guillermo Rawson",
      "Avenida España y Arenales",
      "CUIM - UNSJ (Rivadavia)"
    ],
    "stops_vuelta": [
      "CUIM - UNSJ (Rivadavia)",
      "Avenida España y Arenales",
      "Hospital Dr. Guillermo Rawson",
      "Avenida España y Libertador",
      "Avenida Libertador (Parque de Mayo)",
      "San Juan Shopping (Avenida Benavídez)",
      "Avenida Benavídez y Salta",
      "Chimbas Oeste (Villa Observatorio)",
      "Complejo Ferial Costanera",
      "Plaza Centenario de Chimbas"
    ],
    "schedule": "Lunes a Viernes de 06:00 a 22:30, Sábados con frecuencia reducida"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e511",
    "line": "Troncal TNS",
    "description": "Troncal Norte-Sur. Conecta la Plaza Centenario de Chimbas con la Plaza de Villa Krause en Rawson, cruzando por el microcentro de San Juan.",
    "type": "capital_conexion",
    "frequency": "Cada 8 minutos",
    "neighborhoods": [
      "Villa Paula",
      "Capital Centro",
      "Villa Krause"
    ],
    "stops": [
      "Plaza Centenario de Chimbas (Calle Mendoza)",
      "Municipalidad de Chimbas (Calle Mendoza)",
      "Calle Mendoza y Jorge Newbery",
      "Calle Mendoza y Pellegrini",
      "Calle Mendoza y Chubut",
      "Calle Mendoza y Centenario",
      "Calle Mendoza y Benavídez",
      "Avenida Rioja y Benavídez",
      "Avenida Rioja y Chile",
      "Avenida Rioja y San Isidro",
      "Avenida Rioja y 25 de Mayo",
      "Avenida Rioja y Libertador",
      "Estación de Transbordo Córdoba",
      "Centro Cívico de San Juan",
      "Avenida España y Arenales",
      "Plaza de Villa Krause (Rawson)"
    ],
    "stops_vuelta": [
      "Plaza de Villa Krause (Rawson)",
      "Avenida España y Arenales",
      "Estación de Transbordo Córdoba",
      "Avenida Rioja y Libertador",
      "Avenida Rioja y 25 de Mayo",
      "Avenida Rioja y San Isidro",
      "Avenida Rioja y Chile",
      "Avenida Rioja y Benavídez",
      "Calle Mendoza y Benavídez",
      "Calle Mendoza y Centenario",
      "Calle Mendoza y Chubut",
      "Calle Mendoza y Pellegrini",
      "Calle Mendoza y Jorge Newbery",
      "Municipalidad de Chimbas (Calle Mendoza)",
      "Plaza Centenario de Chimbas (Calle Mendoza)"
    ],
    "schedule": "Lunes a Domingo de 04:30 a 00:30"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e512",
    "line": "Corredor B",
    "description": "Corredor Benavídez. Conecta la Escuela de Policía en Chimbas Oeste con la Estación de Transbordo Córdoba por el eje vial de Av. Benavídez.",
    "type": "capital_conexion",
    "frequency": "Cada 10 minutos",
    "neighborhoods": [
      "Chimbas Oeste",
      "Barrio Los Tamarindos",
      "Capital Centro"
    ],
    "stops": [
      "Escuela de Policía (Chimbas)",
      "Avenida Benavídez y Salta (Walmart)",
      "Avenida Benavídez y España",
      "Avenida Benavídez y Mendoza",
      "Avenida Benavídez y Rioja",
      "Avenida Benavídez y Tucumán",
      "Avenida Benavídez y Ruta 40",
      "Avenida Benavídez y Necochea",
      "Avenida Rawson y Córdoba",
      "Estación de Transbordo Córdoba",
      "Hospital Dr. Guillermo Rawson"
    ],
    "stops_vuelta": [
      "Hospital Dr. Guillermo Rawson",
      "Estación de Transbordo Córdoba",
      "Avenida Rawson y Córdoba",
      "Avenida Benavídez y Necochea",
      "Avenida Benavídez y Ruta 40",
      "Avenida Benavídez y Tucumán",
      "Avenida Benavídez y Rioja",
      "Avenida Benavídez y Mendoza",
      "Avenida Benavídez y España",
      "Avenida Benavídez y Salta (Walmart)",
      "Escuela de Policía (Chimbas)"
    ],
    "schedule": "Lunes a Sábado de 05:00 a 23:45, Domingos de 07:00 a 22:30"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e513",
    "line": "Línea 30",
    "description": "Perimetral Este. Conexión periférica directa entre la Plaza de Chimbas y la Plaza de Santa Lucía, pasando por Chimbas Este y la zona este del Gran San Juan.",
    "type": "interno_chimbas",
    "frequency": "Cada 15 minutos",
    "neighborhoods": [
      "Villa Paula",
      "Chimbas Este",
      "Santa Lucía Centro"
    ],
    "stops": [
      "Plaza Centenario de Chimbas",
      "Calle Neuquén y Mendoza",
      "Delegación Municipal Este",
      "Calle Ruta 40 y Neuquén",
      "Calle Ruta 40 y Centenario",
      "Avenida Benavídez y Ruta 40",
      "Avenida Benavídez y Necochea",
      "Calle Necochea y Centenario",
      "Calle Tomás Edison y Benavídez",
      "Calle Tomás Edison y Colón",
      "Plaza de Santa Lucía"
    ],
    "stops_vuelta": [
      "Plaza de Santa Lucía",
      "Calle Tomás Edison y Colón",
      "Calle Tomás Edison y Benavídez",
      "Calle Necochea y Centenario",
      "Avenida Benavídez y Necochea",
      "Avenida Benavídez y Ruta 40",
      "Calle Ruta 40 y Centenario",
      "Calle Ruta 40 y Neuquén",
      "Delegación Municipal Este",
      "Calle Neuquén y Mendoza",
      "Plaza Centenario de Chimbas"
    ],
    "schedule": "Lunes a Sábado de 06:00 a 22:30"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e514",
    "line": "Línea 40",
    "description": "Perimetral Norte. Une la Plaza de Chimbas con el departamento de Rivadavia y el CUIM (Complejo Universitario) de la UNSJ, ideal para estudiantes.",
    "type": "salud_universidad",
    "frequency": "Cada 14 minutos",
    "neighborhoods": [
      "Villa Paula",
      "Chimbas Oeste",
      "Rivadavia Universidades"
    ],
    "stops": [
      "Plaza Centenario de Chimbas",
      "Avenida Benavídez y Mendoza",
      "Avenida Benavídez y España",
      "Avenida Benavídez y Salta",
      "Chimbas Oeste (Villa Observatorio)",
      "Hospital Dr. Marcial Quiroga",
      "Avenida Libertador (Parque de Mayo)",
      "CUIM - UNSJ (Rivadavia)"
    ],
    "stops_vuelta": [
      "CUIM - UNSJ (Rivadavia)",
      "Avenida Libertador (Parque de Mayo)",
      "Hospital Dr. Marcial Quiroga",
      "Chimbas Oeste (Villa Observatorio)",
      "Avenida Benavídez y Salta",
      "Avenida Benavídez y España",
      "Avenida Benavídez y Mendoza",
      "Plaza Centenario de Chimbas"
    ],
    "schedule": "Lunes a Viernes de 06:00 a 22:00, Sábados con frecuencia reducida"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e515",
    "line": "Línea 4",
    "description": "Interurbana Norte. Conexión de larga distancia desde la Villa Villicum en Albardón hasta la Estación de Transbordo Córdoba, transitando por Ruta 40 a través de Chimbas.",
    "type": "capital_conexion",
    "frequency": "Cada 20 minutos",
    "neighborhoods": [
      "Albardón Villicum",
      "Chimbas Ruta 40",
      "Capital Centro"
    ],
    "stops": [
      "Villa Villicum (Albardón)",
      "Portal de El Mogote",
      "Calle Ruta 40 y Neuquén",
      "Calle Ruta 40 y Centenario",
      "Avenida Benavídez y Ruta 40",
      "Avenida Benavídez y Rioja",
      "Avenida Rioja y Libertador",
      "Estación de Transbordo Córdoba",
      "Terminal de Ómnibus de San Juan"
    ],
    "stops_vuelta": [
      "Terminal de Ómnibus de San Juan",
      "Estación de Transbordo Córdoba",
      "Avenida Rioja y Libertador",
      "Avenida Benavídez y Rioja",
      "Avenida Benavídez y Ruta 40",
      "Calle Ruta 40 y Centenario",
      "Calle Ruta 40 y Neuquén",
      "Portal de El Mogote",
      "Villa Villicum (Albardón)"
    ],
    "schedule": "Lunes a Sábado de 05:00 a 23:00, Domingos de 07:00 a 22:00"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e516",
    "line": "Línea 120",
    "description": "Conecta el Barrio Valle Grande en Rivadavia con Villa Observatorio en Chimbas Oeste, transitando por el microcentro.",
    "type": "salud_universidad",
    "frequency": "Cada 15 minutos",
    "neighborhoods": [
      "Rivadavia Valle Grande",
      "Capital Centro",
      "Chimbas Oeste"
    ],
    "stops": [
      "Bº Valle Grande",
      "CUIM - UNSJ (Rivadavia)",
      "Hospital Dr. Marcial Quiroga",
      "Avenida Libertador (Parque de Mayo)",
      "Centro Cívico de San Juan (Avenida España)",
      "Avenida España y 25 de Mayo",
      "Avenida España y Benavídez",
      "Avenida Benavídez y Salta (Walmart)",
      "Plaza de Villa Observatorio (Calle Pellegrini)"
    ],
    "stops_vuelta": [
      "Plaza de Villa Observatorio (Calle Pellegrini)",
      "Avenida Benavídez y Salta (Walmart)",
      "Avenida España y Benavídez",
      "Avenida España y 25 de Mayo",
      "Centro Cívico de San Juan (Avenida España)",
      "Avenida Libertador (Parque de Mayo)",
      "Hospital Dr. Marcial Quiroga",
      "CUIM - UNSJ (Rivadavia)",
      "Bº Valle Grande"
    ],
    "schedule": "Lunes a Sábado de 06:00 a 22:30"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e517",
    "line": "Línea 126",
    "description": "Une la Plaza de Villa Obrera con el Complejo Deportivo El Palomar y el Hospital Rawson.",
    "type": "capital_conexion",
    "frequency": "Cada 18 minutos",
    "neighborhoods": [
      "Chimbas Este",
      "Capital Centro"
    ],
    "stops": [
      "Plaza de Villa Obrera (Calle Dorrego)",
      "Calle Dorrego y Neuquén",
      "Calle Ruta 40 y Neuquén",
      "Delegación Municipal Este",
      "Calle Neuquén y Mendoza",
      "Plaza Centenario de Chimbas",
      "Calle Mendoza y Benavídez",
      "Avenida Rioja y Benavídez",
      "Avenida Rioja y 25 de Mayo",
      "Complejo El Palomar",
      "Hospital Dr. Guillermo Rawson"
    ],
    "stops_vuelta": [
      "Hospital Dr. Guillermo Rawson",
      "Complejo El Palomar",
      "Avenida Rioja y 25 de Mayo",
      "Avenida Rioja y Benavídez",
      "Calle Mendoza y Benavídez",
      "Plaza Centenario de Chimbas",
      "Calle Neuquén y Mendoza",
      "Delegación Municipal Este",
      "Calle Ruta 40 y Neuquén",
      "Calle Dorrego y Neuquén",
      "Plaza de Villa Obrera (Calle Dorrego)"
    ],
    "schedule": "Lunes a Viernes de 05:30 a 22:30, Sábados de 06:30 a 21:30"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e518",
    "line": "Línea 128",
    "description": "Conecta el complejo universitario CUIM con el Barrio CGT Chimbas y la zona norte.",
    "type": "salud_universidad",
    "frequency": "Cada 16 minutos",
    "neighborhoods": [
      "Rivadavia Universidades",
      "Chimbas Norte"
    ],
    "stops": [
      "CUIM - UNSJ (Rivadavia)",
      "Hospital Dr. Marcial Quiroga",
      "Chimbas Oeste (Villa Observatorio)",
      "Avenida Benavídez y Salta (Walmart)",
      "Avenida Benavídez y España",
      "Avenida Benavídez y Mendoza",
      "Plaza Centenario de Chimbas",
      "Calle Mendoza y Oro",
      "Bº CGT Chimbas"
    ],
    "stops_vuelta": [
      "Bº CGT Chimbas",
      "Calle Mendoza y Oro",
      "Plaza Centenario de Chimbas",
      "Avenida Benavídez y Mendoza",
      "Avenida Benavídez y España",
      "Avenida Benavídez y Salta (Walmart)",
      "Chimbas Oeste (Villa Observatorio)",
      "Hospital Dr. Marcial Quiroga",
      "CUIM - UNSJ (Rivadavia)"
    ],
    "schedule": "Lunes a Sábado de 06:00 a 22:00"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e519",
    "line": "Línea 301",
    "description": "Servicio periférico extenso que une Colonia Gutiérrez con el Hospital Rawson y el Centro Cívico.",
    "type": "interno_chimbas",
    "frequency": "Cada 20 minutos",
    "neighborhoods": [
      "Colonia Gutiérrez",
      "Chimbas Este",
      "Capital Centro"
    ],
    "stops": [
      "Colonia Gutiérrez (Chimbas)",
      "Calle Tucumán y Oro",
      "Calle Tucumán y Rodríguez",
      "Calle Tucumán y Neuquén",
      "Calle Tucumán y Centenario",
      "Calle Tucumán y Benavídez",
      "Avenida Rawson y Córdoba",
      "Hospital Dr. Guillermo Rawson",
      "Estación de Transbordo Córdoba",
      "Centro Cívico de San Juan"
    ],
    "stops_vuelta": [
      "Centro Cívico de San Juan",
      "Estación de Transbordo Córdoba",
      "Hospital Dr. Guillermo Rawson",
      "Avenida Rawson y Córdoba",
      "Calle Tucumán y Benavídez",
      "Calle Tucumán y Centenario",
      "Calle Tucumán y Neuquén",
      "Calle Tucumán y Rodríguez",
      "Calle Tucumán y Oro",
      "Colonia Gutiérrez (Chimbas)"
    ],
    "schedule": "Lunes a Sábado de 05:00 a 23:00"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e520",
    "line": "Línea 421",
    "description": "Servicio secundario que conecta Campo Afuera y el Hospital Giordano en Albardón con Chimbas y el Hospital Rawson.",
    "type": "capital_conexion",
    "frequency": "Cada 18 minutos",
    "neighborhoods": [
      "Albardón",
      "Chimbas",
      "Capital Centro"
    ],
    "stops": [
      "Campo Afuera (Albardón)",
      "Hospital Dr. José Giordano (Albardón)",
      "Villa Villicum (Albardón)",
      "Portal de El Mogote",
      "Calle Ruta 40 y Neuquén",
      "Avenida Benavídez y Rioja",
      "Estación de Transbordo Córdoba",
      "Hospital Dr. Guillermo Rawson"
    ],
    "stops_vuelta": [
      "Hospital Dr. Guillermo Rawson",
      "Estación de Transbordo Córdoba",
      "Avenida Benavídez y Rioja",
      "Calle Ruta 40 y Neuquén",
      "Portal de El Mogote",
      "Villa Villicum (Albardón)",
      "Hospital Dr. José Giordano (Albardón)",
      "Campo Afuera (Albardón)"
    ],
    "schedule": "Lunes a Sábado de 06:00 a 22:00"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e521",
    "line": "Línea 500",
    "description": "Media distancia. Une la localidad de San José de Jáchal con la Terminal de Ómnibus de San Juan, transitando por Ruta 40.",
    "type": "capital_conexion",
    "frequency": "Tres frecuencias diarias",
    "neighborhoods": [
      "Jáchal",
      "Albardón",
      "Chimbas Ruta 40",
      "Capital Centro"
    ],
    "stops": [
      "San José de Jáchal",
      "Villa Villicum (Albardón)",
      "Portal de El Mogote",
      "Calle Ruta 40 y Neuquén",
      "Avenida Benavídez y Ruta 40",
      "Avenida Rawson y Córdoba",
      "Terminal de Ómnibus de San Juan"
    ],
    "stops_vuelta": [
      "Terminal de Ómnibus de San Juan",
      "Avenida Rawson y Córdoba",
      "Avenida Benavídez y Ruta 40",
      "Calle Ruta 40 y Neuquén",
      "Portal de El Mogote",
      "Villa Villicum (Albardón)",
      "San José de Jáchal"
    ],
    "schedule": "Lunes a Domingo según horarios fijos"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e522",
    "line": "Línea 600",
    "description": "Media distancia. Conecta Rodeo en el departamento de Iglesia con la Terminal de Ómnibus, cruzando Chimbas por Ruta 40.",
    "type": "capital_conexion",
    "frequency": "Dos frecuencias diarias",
    "neighborhoods": [
      "Iglesia",
      "Albardón",
      "Chimbas Ruta 40",
      "Capital Centro"
    ],
    "stops": [
      "Rodeo (Iglesia)",
      "Villa Villicum (Albardón)",
      "Portal de El Mogote",
      "Calle Ruta 40 y Neuquén",
      "Avenida Benavídez y Ruta 40",
      "Avenida Rawson y Córdoba",
      "Terminal de Ómnibus de San Juan"
    ],
    "stops_vuelta": [
      "Terminal de Ómnibus de San Juan",
      "Avenida Rawson y Córdoba",
      "Avenida Benavídez y Ruta 40",
      "Calle Ruta 40 y Neuquén",
      "Portal de El Mogote",
      "Villa Villicum (Albardón)",
      "Rodeo (Iglesia)"
    ],
    "schedule": "Lunes a Domingo según horarios fijos"
  },
  {
    "id": "b1b07384-d113-4ec5-a581-2292d3b2e523",
    "line": "Línea 700",
    "description": "Larga distancia. Une Barreal y Calingasta con la Terminal de Ómnibus, transitando por Ruta 40 a través de Chimbas.",
    "type": "capital_conexion",
    "frequency": "Frecuencias diarias programadas",
    "neighborhoods": [
      "Calingasta Barreal",
      "Albardón",
      "Chimbas Ruta 40",
      "Capital Centro"
    ],
    "stops": [
      "Barreal (Calingasta)",
      "Villa Villicum (Albardón)",
      "Portal de El Mogote",
      "Calle Ruta 40 y Neuquén",
      "Avenida Benavídez y Ruta 40",
      "Avenida Rawson y Córdoba",
      "Terminal de Ómnibus de San Juan"
    ],
    "stops_vuelta": [
      "Terminal de Ómnibus de San Juan",
      "Avenida Rawson y Córdoba",
      "Avenida Benavídez y Ruta 40",
      "Calle Ruta 40 y Neuquén",
      "Portal de El Mogote",
      "Villa Villicum (Albardón)",
      "Barreal (Calingasta)"
    ],
    "schedule": "Lunes a Domingo según horarios programados"
  }
];

export const initialJobs = [
  {
    id: 'a1b07384-d113-4ec5-a581-2292d3b2e601',
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
    id: 'a1b07384-d113-4ec5-a581-2292d3b2e602',
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
    id: 'a1b07384-d113-4ec5-a581-2292d3b2e603',
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
    id: 'a1b07384-d113-4ec5-a581-2292d3b2e604',
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

