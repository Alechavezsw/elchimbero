-- Datos Semilla para El Chimbero
-- Departamento de Chimbas, San Juan, Argentina

-- 1. Crear un usuario de prueba en auth.users (si no existe)
-- Su contraseña es: chimbero123
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
)
VALUES (
  'd3b07384-d113-4ec5-a581-2292d3b2e591',
  '00000000-0000-0000-0000-000000000000',
  'test@elchimbero.com',
  '$2a$10$U.9aN4x62iV3.Q6Q11O6u.K5C7Ff4NqO/f5d5N79K1XpY5E2dGe2i', -- hash para "chimbero123"
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Juan Pérez","phone":"2645123456"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- Nota: El trigger 'on_auth_user_created' creará automáticamente el perfil en public.profiles.
-- Por si acaso, nos aseguramos de que exista el perfil:
INSERT INTO public.profiles (id, full_name, phone, avatar_url)
VALUES (
  'd3b07384-d113-4ec5-a581-2292d3b2e591',
  'Juan Pérez',
  '2645123456',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
)
ON CONFLICT (id) DO NOTHING;


-- 2. Insertar Comercios (Guía Comercial)
INSERT INTO public.businesses (
  id,
  owner_id,
  name,
  description,
  category,
  address,
  neighborhood,
  phone,
  whatsapp,
  latitude,
  longitude,
  image_url,
  hours,
  status,
  is_featured
)
VALUES 
(
  'a1b07384-d113-4ec5-a581-2292d3b2e001',
  'd3b07384-d113-4ec5-a581-2292d3b2e591',
  'Pizzería La Chimbera',
  'Las mejores pizzas a la piedra de Chimbas. Empanadas sanjuaninas hechas en horno de barro y lomos gigantes. ¡Envío a domicilio sin cargo en Villa Paula!',
  'Gastronomía',
  'Tucumán 1450 (Norte)',
  'Villa Paula',
  '264-4901234',
  '542644901234',
  -31.4958,
  -68.5352,
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  '{"lunes_a_viernes": "19:00 - 00:30", "sabado_y_domingo": "19:00 - 01:30"}',
  'approved',
  true
),
(
  'a1b07384-d113-4ec5-a581-2292d3b2e002',
  null,
  'Ferretería El Caldén',
  'Todo para la construcción, electricidad, plomería y herramientas. Pinturas nacionales e importadas. Atención personalizada y presupuestos para obras.',
  'Construcción y Ferretería',
  'Benavidez 2100 (Oeste)',
  'Barrio Los Tamarindos',
  '264-4288765',
  '542644288765',
  -31.5012,
  -68.5245,
  'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80',
  '{"lunes_a_sabado": "08:30 - 13:00, 16:30 - 20:30"}',
  'approved',
  false
),
(
  'a1b07384-d113-4ec5-a581-2292d3b2e003',
  'd3b07384-d113-4ec5-a581-2292d3b2e591',
  'El Rey de la Costanera',
  'Parrillada completa los fines de semana. Chivito, costillares y el mejor vacío al asador en un ambiente familiar único cerca del río San Juan.',
  'Gastronomía',
  'Av. Costanera s/n (frente al Complejo Ferial)',
  'Costanera',
  '264-4776655',
  '542644776655',
  -31.4785,
  -68.5451,
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  '{"viernes_y_sabado": "21:00 - 02:00", "domingo": "12:00 - 16:00"}',
  'approved',
  true
),
(
  'a1b07384-d113-4ec5-a581-2292d3b2e004',
  null,
  'Minimarket Villa Obrera',
  'Almacén familiar con excelente variedad de fiambres, lácteos, carnicería y verdulería fresca todos los días. Aceptamos todas las tarjetas y Mercado Pago.',
  'Almacén y Comestibles',
  'Ruta 40 y Neuquén',
  'Villa Obrera',
  '264-4554433',
  '542644554433',
  -31.4852,
  -68.5305,
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
  '{"lunes_a_domingo": "08:00 - 22:00"}',
  'approved',
  false
),
(
  'a1b07384-d113-4ec5-a581-2292d3b2e005',
  null,
  'Taller Mecánico San Cayetano',
  'Mecánica general del automotor, inyección electrónica, frenos, embragues y alineación y balanceo computarizado. Diagnósticos rápidos y garantizados.',
  'Automotores y Servicios',
  'Neuquén 890 (Oeste)',
  'Villa Observatorio',
  '264-4889900',
  '542644889900',
  -31.5065,
  -68.5582,
  'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
  '{"lunes_a_viernes": "08:30 - 12:30, 16:00 - 20:00", "sabado": "08:30 - 13:00"}',
  'approved',
  false
),
(
  'a1b07384-d113-4ec5-a581-2292d3b2e006',
  'd3b07384-d113-4ec5-a581-2292d3b2e591',
  'Indumentaria Urbana Chimbas',
  'La mejor moda para hombres, mujeres y niños. Ropa informal, deportiva y accesorios a precios accesibles. Promociones especiales todas las semanas.',
  'Indumentaria y Calzado',
  'Mendoza 1220 (Norte)',
  'Villa Paula',
  '264-4112233',
  '542644112233',
  -31.4942,
  -68.5338,
  'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
  '{"lunes_a_sabado": "09:00 - 13:00, 17:00 - 21:00"}',
  'approved',
  true
)
ON CONFLICT (id) DO NOTHING;


-- 3. Insertar Clasificados
INSERT INTO public.classifieds (
  id,
  user_id,
  title,
  description,
  price,
  category,
  condition,
  image_url,
  whatsapp,
  status
)
VALUES 
(
  'c1b07384-d113-4ec5-a581-2292d3b2e101',
  'd3b07384-d113-4ec5-a581-2292d3b2e591',
  'Bicicleta Mountain Bike Rodado 29',
  'Se vende bicicleta Mountain Bike talle M, rodado 29, cuadro de aluminio super liviano, 21 velocidades Shimano, frenos a disco mecánico. Muy poco uso, casi nueva. Escucho ofertas de contado.',
  145000,
  'sale',
  'used',
  'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
  '542645123456',
  'active'
),
(
  'c1b07384-d113-4ec5-a581-2292d3b2e102',
  'd3b07384-d113-4ec5-a581-2292d3b2e591',
  'Servicio de Electricidad del Hogar y Comercios',
  'Electricista matriculado ofrece servicios de instalaciones eléctricas desde cero, tableros generales, colocación de luminarias, reparación de cortocircuitos y trámites ante el E.P.R.E. Urgencias las 24hs.',
  0,
  'service',
  'not_applicable',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  '542645123456',
  'active'
),
(
  'c1b07384-d113-4ec5-a581-2292d3b2e103',
  'd3b07384-d113-4ec5-a581-2292d3b2e591',
  'Alquiler Departamento 1 Dormitorio - Villa Paula',
  'Se alquila departamento en planta alta en el centro de Chimbas (Villa Paula). Consta de 1 dormitorio con placard, cocina-comedor equipada con bajo mesada y alacena, baño completo y balcón. Sin expensas. Ideal para persona sola o pareja.',
  160000,
  'rent',
  'not_applicable',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  '542645123456',
  'active'
),
(
  'c1b07384-d113-4ec5-a581-2292d3b2e104',
  'd3b07384-d113-4ec5-a581-2292d3b2e591',
  'Búsqueda de Empleada/o Administrativo Contable',
  'Buscamos personal administrativo para empresa en el Parque Industrial de Chimbas. Requisitos: Experiencia previa en facturación, conciliaciones bancarias y manejo de Excel. Secundario completo. Enviar CV.',
  0,
  'job',
  'not_applicable',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
  '542645123456',
  'active'
)
ON CONFLICT (id) DO NOTHING;


-- 4. Insertar Farmacias de Turno
-- Vamos a setear las fechas del turno dinámicamente con fechas cercanas para que siempre haya farmacias de turno al probar
INSERT INTO public.pharmacies (
  id,
  name,
  address,
  phone,
  latitude,
  longitude,
  duty_dates,
  is_open_24h
)
VALUES 
(
  'f1b07384-d113-4ec5-a581-2292d3b2e201',
  'Farmacia San Cayetano',
  'Tucumán 1320 (Norte) - Villa Paula',
  '264-4315566',
  -31.4951,
  -68.5345,
  ARRAY[
    CURRENT_DATE,
    CURRENT_DATE + 2,
    CURRENT_DATE + 4,
    CURRENT_DATE + 6,
    CURRENT_DATE - 2
  ]::date[],
  true
),
(
  'f1b07384-d113-4ec5-a581-2292d3b2e202',
  'Farmacia Villa Obrera',
  'Ruta 40 y Dorrego - Villa Obrera',
  '264-4284422',
  -31.4845,
  -68.5298,
  ARRAY[
    CURRENT_DATE + 1,
    CURRENT_DATE + 3,
    CURRENT_DATE + 5,
    CURRENT_DATE - 1,
    CURRENT_DATE - 3
  ]::date[],
  true
),
(
  'f1b07384-d113-4ec5-a581-2292d3b2e203',
  'Farmacia Del Norte',
  'Benavidez 1950 (Oeste) - B° Los Tamarindos',
  '264-4217733',
  -31.5005,
  -68.5252,
  ARRAY[
    CURRENT_DATE,
    CURRENT_DATE + 3,
    CURRENT_DATE + 6,
    CURRENT_DATE - 1
  ]::date[],
  false
)
ON CONFLICT (id) DO NOTHING;


-- 5. Insertar Kioscos 24h / Abiertos Tarde
INSERT INTO public.kiosks (
  id,
  name,
  address,
  neighborhood,
  phone,
  latitude,
  longitude,
  is_open_24h,
  hours_description
)
VALUES 
(
  'k1b07384-d113-4ec5-a581-2292d3b2e301',
  'Kiosco El Trébol 24hs',
  'Mendoza y Chubut (Villa Paula)',
  'Villa Paula',
  '264-4098712',
  -31.4965,
  -68.5361,
  true,
  'Abierto las 24 horas del día. Carga de sube, bebidas frías, cigarrillos, golosinas y mercadería en general.'
),
(
  'k1b07384-d113-4ec5-a581-2292d3b2e302',
  'Drugstore El Monumental',
  'Neuquén 320 - Villa Obrera',
  'Villa Obrera',
  '264-4123399',
  -31.4861,
  -68.5312,
  false,
  'Abierto todos los días de 08:00 a 02:00. Bebidas, snacks, fiambrería express y carbón.'
),
(
  'k1b07384-d113-4ec5-a581-2292d3b2e303',
  'Kiosco 24hs Las Tres Hermanas',
  'Benavidez s/n (frente al Observatorio)',
  'Villa Observatorio',
  '264-4771122',
  -31.5058,
  -68.5591,
  true,
  'Abierto las 24 horas. Amplia variedad de golosinas, bebidas frías, sándwiches y artículos de almacén de primera necesidad.'
)
ON CONFLICT (id) DO NOTHING;
