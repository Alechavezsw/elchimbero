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


-- 6. Insertar Colectivos (RedTulum)
INSERT INTO public.buses (
  id,
  line,
  description,
  type,
  frequency,
  neighborhoods,
  stops,
  stops_vuelta,
  schedule
)
VALUES 
(
  'b1b07384-d113-4ec5-a581-2292d3b2e501',
  'Línea 400',
  'Conecta Villa Observatorio en Chimbas Oeste con el Hospital Dr. Guillermo Rawson pasando por el centro de San Juan.',
  'capital_conexion',
  'Cada 12 minutos',
  ARRAY['Villa Observatorio', 'Barrio Santo Domingo', 'Villa Paula', 'Capital Centro'],
  ARRAY['Plaza de Villa Observatorio (Calle Pellegrini)', 'Calle Pellegrini y Salta', 'Calle Salta y Rodríguez', 'Calle Salta y Centenario (Comisaría 30ª)', 'Avenida Benavídez y Salta (Walmart)', 'Avenida Benavídez y Mendoza', 'Plaza Centenario de Chimbas (Calle Mendoza)', 'Municipalidad de Chimbas (Calle Mendoza)', 'Calle Mendoza y Chile', 'Calle Mendoza y 25 de Mayo', 'Avenida España y 25 de Mayo', 'Centro Cívico de San Juan (Avenida España)', 'Calle Las Heras y Córdoba', 'Teatro del Bicentenario (Las Heras)', 'Avenida Libertador y Mendoza', 'Hospital Dr. Guillermo Rawson (Avenida Rawson)'],
  ARRAY['Hospital Dr. Guillermo Rawson (Avenida Rawson)', 'Terminal de Ómnibus de San Juan', 'Avenida Libertador y General Acha', 'Teatro del Bicentenario (Las Heras)', 'Centro Cívico de San Juan (Avenida España)', 'Avenida España y 25 de Mayo', 'Calle Mendoza y Chile', 'Municipalidad de Chimbas (Calle Mendoza)', 'Plaza Centenario de Chimbas (Calle Mendoza)', 'Avenida Benavídez y Tucumán', 'Avenida Benavídez y Salta (Walmart)', 'Calle Salta y Centenario (Comisaría 30ª)', 'Calle Salta y Rodríguez', 'Plaza de Villa Observatorio (Calle Pellegrini)'],
  'Lunes a Sábado de 05:00 a 23:30, Domingos de 07:00 a 22:00'
),
(
  'b1b07384-d113-4ec5-a581-2292d3b2e502',
  'Línea 401',
  'Une Villa Obrera en Chimbas Este con el Centro Cívico y el Hospital Dr. Guillermo Rawson.',
  'capital_conexion',
  'Cada 15 minutos',
  ARRAY['Villa Obrera', 'Villa Paula', 'Capital Centro'],
  ARRAY['Plaza de Villa Obrera (Calle Dorrego)', 'Calle Dorrego y Neuquén', 'Calle Ruta 40 y Neuquén', 'Delegación Municipal Este', 'Calle Neuquén y Mendoza', 'Plaza Centenario de Chimbas', 'Calle Mendoza y Benavídez', 'Avenida Rioja y Benavídez', 'Avenida Rioja y Corrientes', 'Avenida Rioja y 25 de Mayo', 'Avenida Libertador General San Martín y Rioja', 'Centro Cívico de San Juan', 'Avenida 25 de Mayo y Rawson', 'Hospital Dr. Guillermo Rawson'],
  ARRAY['Hospital Dr. Guillermo Rawson', 'Avenida Rawson y Santa Fe', 'Avenida Libertador General San Martín y Rioja', 'Centro Cívico de San Juan', 'Avenida Rioja y Corrientes', 'Avenida Rioja y Benavídez', 'Calle Mendoza y Benavídez', 'Plaza Centenario de Chimbas', 'Calle Neuquén y Mendoza', 'Delegación Municipal Este', 'Calle Ruta 40 y Neuquén', 'Plaza de Villa Obrera (Calle Dorrego)'],
  'Lunes a Viernes de 05:30 a 23:00, Sábados y Domingos de 06:30 a 22:30'
),
(
  'b1b07384-d113-4ec5-a581-2292d3b2e503',
  'Línea 402',
  'Conecta el Barrio Pedregal con el Hospital Dr. Guillermo Rawson y la zona céntrica.',
  'capital_conexion',
  'Cada 18 minutos',
  ARRAY['Barrio Pedregal', 'Villa Paula', 'Capital Centro'],
  ARRAY['Barrio Pedregal (Calle Rodríguez)', 'Calle Rodríguez y Mendoza', 'Calle Mendoza y Oro', 'Calle Mendoza y Rodríguez', 'Calle Mendoza y Centenario', 'Plaza Centenario de Chimbas', 'Avenida Benavídez y Mendoza', 'Avenida Benavídez y Salta', 'San Juan Shopping (Avenida Benavídez)', 'Avenida Benavídez y Tucumán', 'Avenida España y Libertador', 'Centro Cívico de San Juan', 'Avenida Rawson y Santa Fe', 'Hospital Dr. Guillermo Rawson'],
  ARRAY['Hospital Dr. Guillermo Rawson', 'Avenida Rawson y Santa Fe', 'Centro Cívico de San Juan', 'Avenida España y Libertador', 'Avenida Benavídez y Tucumán', 'San Juan Shopping (Avenida Benavídez)', 'Avenida Benavídez y Salta', 'Avenida Benavídez y Mendoza', 'Plaza Centenario de Chimbas', 'Calle Mendoza y Centenario', 'Calle Mendoza y Rodríguez', 'Calle Mendoza y Oro', 'Calle Rodríguez y Mendoza', 'Barrio Pedregal (Calle Rodríguez)'],
  'Lunes a Viernes de 05:45 a 22:45, Sábados de 06:00 a 22:00'
),
(
  'b1b07384-d113-4ec5-a581-2292d3b2e504',
  'Línea 403',
  'Conexión desde Villa Paula a través del Centro Cívico hacia el Hospital Dr. Guillermo Rawson.',
  'capital_conexion',
  'Cada 14 minutos',
  ARRAY['Villa Paula', 'Barrio Los Tamarindos', 'Capital Centro'],
  ARRAY['Plaza Centenario de Chimbas (Villa Paula)', 'Calle Mendoza y Chubut', 'Calle Mendoza y Benavídez', 'Avenida Benavídez y Tucumán', 'Calle Salta y Benavídez', 'Calle Salta y Sargento Cabral', 'Avenida España y San Isidro', 'Parque de Mayo (Avenida Libertador)', 'Centro Cívico de San Juan', 'Avenida Rioja y Mitre', 'Terminal de Ómnibus de San Juan', 'Hospital Dr. Guillermo Rawson'],
  ARRAY['Hospital Dr. Guillermo Rawson', 'Terminal de Ómnibus de San Juan', 'Avenida Rioja y Mitre', 'Centro Cívico de San Juan', 'Parque de Mayo (Avenida Libertador)', 'Avenida España y San Isidro', 'Calle Salta y Sargento Cabral', 'Calle Salta y Benavídez', 'Avenida Benavídez y Tucumán', 'Calle Mendoza y Benavídez', 'Calle Mendoza y Chubut', 'Plaza Centenario de Chimbas (Villa Paula)'],
  'Lunes a Sábado de 05:15 a 23:15, Domingos de 07:15 a 22:15'
),
(
  'b1b07384-d113-4ec5-a581-2292d3b2e505',
  'Línea 404',
  'Une el Barrio Las Calandrias con el Hospital Dr. Guillermo Rawson pasando por la Plaza de Chimbas.',
  'capital_conexion',
  'Cada 16 minutos',
  ARRAY['Barrio Las Calandrias', 'Villa Paula', 'Capital Centro'],
  ARRAY['Barrio Las Calandrias (Calle Oro)', 'Costanera Alta (Frente a Río San Juan)', 'Complejo Ferial Costanera', 'Calle Tucumán y Oro', 'Calle Mendoza y Oro', 'Calle Mendoza y Neuquén', 'Plaza Centenario de Chimbas (Municipalidad)', 'Calle Mendoza y Benavídez', 'Avenida España y 25 de Mayo', 'Centro Cívico de San Juan', 'Avenida Rawson y Córdoba', 'Hospital Dr. Guillermo Rawson'],
  ARRAY['Hospital Dr. Guillermo Rawson', 'Avenida Rawson y Córdoba', 'Centro Cívico de San Juan', 'Avenida España y 25 de Mayo', 'Calle Mendoza y Benavídez', 'Plaza Centenario de Chimbas (Municipalidad)', 'Calle Mendoza y Neuquén', 'Calle Mendoza y Oro', 'Calle Tucumán y Oro', 'Complejo Ferial Costanera', 'Costanera Alta (Frente a Río San Juan)', 'Barrio Las Calandrias (Calle Oro)'],
  'Lunes a Sábado de 05:30 a 23:00, Domingos de 07:00 a 22:00'
),
(
  'b1b07384-d113-4ec5-a581-2292d3b2e506',
  'Línea 405',
  'Conecta el Barrio Natania VIII en Chimbas con el Centro Cívico y el Hospital Dr. Guillermo Rawson.',
  'capital_conexion',
  'Cada 15 minutos',
  ARRAY['Barrio Natania VIII', 'Villa Paula', 'Capital Centro'],
  ARRAY['Barrio Natania VIII', 'Calle Tucumán y Centenario', 'Plaza Centenario de Chimbas', 'Calle Mendoza y Benavídez', 'Calle Tucumán y Benavídez', 'Avenida Rioja y Benavídez', 'Avenida Rioja y Libertador', 'Plaza 25 de Mayo (Capital)', 'Centro Cívico de San Juan', 'Avenida Rawson y Santa Fe', 'Hospital Dr. Guillermo Rawson'],
  ARRAY['Hospital Dr. Guillermo Rawson', 'Avenida Rawson y Santa Fe', 'Centro Cívico de San Juan', 'Plaza 25 de Mayo (Capital)', 'Avenida Rioja y Libertador', 'Avenida Rioja y Benavídez', 'Calle Tucumán y Benavídez', 'Calle Mendoza y Benavídez', 'Plaza Centenario de Chimbas', 'Calle Tucumán y Centenario', 'Barrio Natania VIII'],
  'Lunes a Viernes de 05:00 a 23:30, Sábados y Domingos de 06:30 a 22:30'
),
(
  'b1b07384-d113-4ec5-a581-2292d3b2e507',
  'Línea 406',
  'Servicio interno de conexión entre Lote Hogar 59, Villa Paula y el Centro Cívico.',
  'interno_chimbas',
  'Cada 20 minutos',
  ARRAY['Lote Hogar 59', 'Villa Paula', 'Capital Centro'],
  ARRAY['Lote Hogar 59', 'Calle Centenario y Mendoza', 'Plaza Centenario de Chimbas', 'Municipalidad de Chimbas', 'Calle Mendoza y Benavídez', 'Calle Mendoza y Chile', 'Calle Mendoza y 25 de Mayo', 'Avenida Rioja y Corrientes', 'Parque de Mayo (Avenida Libertador)', 'Centro Cívico de San Juan (Terminus)'],
  ARRAY['Centro Cívico de San Juan (Terminus)', 'Parque de Mayo (Avenida Libertador)', 'Avenida Rioja y Corrientes', 'Calle Mendoza y 25 de Mayo', 'Calle Mendoza y Chile', 'Calle Mendoza y Benavídez', 'Municipalidad de Chimbas', 'Plaza Centenario de Chimbas', 'Calle Centenario y Mendoza', 'Lote Hogar 59'],
  'Lunes a Viernes de 06:00 a 22:00, Sábados de 07:00 a 21:00'
),
(
  'b1b07384-d113-4ec5-a581-2292d3b2e508',
  'Línea 407',
  'Conecta la Villa Mariano Moreno en el noreste de Chimbas con el Hospital Dr. Guillermo Rawson.',
  'capital_conexion',
  'Cada 18 minutos',
  ARRAY['Villa Mariano Moreno', 'El Mogote', 'Capital Centro'],
  ARRAY['Villa Mariano Moreno (Calle Pellegrini)', 'Calle Pellegrini y Mendoza', 'Calle Mendoza y Oro', 'Calle Mendoza y Rodríguez', 'Calle Rodríguez y Mendoza', 'Plaza Centenario de Chimbas', 'Calle Mendoza y Benavídez', 'Avenida Rioja y 25 de Mayo', 'Avenida Libertador y Rioja', 'Hospital Dr. Guillermo Rawson', 'Terminal de Ómnibus de San Juan', 'Centro Cívico de San Juan'],
  ARRAY['Centro Cívico de San Juan', 'Terminal de Ómnibus de San Juan', 'Hospital Dr. Guillermo Rawson', 'Avenida Libertador y Rioja', 'Avenida Rioja y 25 de Mayo', 'Calle Mendoza y Benavídez', 'Plaza Centenario de Chimbas', 'Calle Rodríguez y Mendoza', 'Calle Mendoza y Rodríguez', 'Calle Mendoza y Oro', 'Calle Pellegrini y Mendoza', 'Villa Mariano Moreno (Calle Pellegrini)'],
  'Lunes a Viernes de 05:30 a 22:30, Sábados de 06:30 a 21:30'
),
(
  'b1b07384-d113-4ec5-a581-2292d3b2e509',
  'Línea 408',
  'Une El Mogote y la Plaza de Chimbas con el Centro Cívico y el Hospital Dr. Guillermo Rawson.',
  'capital_conexion',
  'Cada 22 minutos',
  ARRAY['El Mogote', 'Villa Paula', 'Capital Centro'],
  ARRAY['El Mogote (Calle Rodríguez)', 'Portal de El Mogote', 'Calle Tucumán y Rodríguez', 'Calle Neuquén y Mendoza', 'Plaza Centenario de Chimbas', 'Calle Mendoza y Benavídez', 'Avenida España y Benavídez', 'Centro Cívico de San Juan', 'Avenida Rioja y Santa Fe', 'Hospital Dr. Guillermo Rawson'],
  ARRAY['Hospital Dr. Guillermo Rawson', 'Avenida Rioja y Santa Fe', 'Centro Cívico de San Juan', 'Avenida España y Benavídez', 'Calle Mendoza y Benavídez', 'Plaza Centenario de Chimbas', 'Calle Neuquén y Mendoza', 'Calle Tucumán y Rodríguez', 'Portal de El Mogote', 'El Mogote (Calle Rodríguez)'],
  'Lunes a Viernes de 05:15 a 22:30, Sábados de 06:30 a 21:30'
),
(
  'b1b07384-d113-4ec5-a581-2292d3b2e510',
  'Línea 420',
  'Línea de salud y universitaria. Conecta Chimbas directamente con el CUIM de la UNSJ y el Hospital Dr. Guillermo Rawson.',
  'salud_universidad',
  'Cada 15 minutos',
  ARRAY['Villa Paula', 'Villa Observatorio', 'Capital Rawson', 'Rivadavia CUIM'],
  ARRAY['Plaza Centenario de Chimbas', 'Complejo Ferial Costanera', 'Chimbas Oeste (Villa Observatorio)', 'Avenida Benavídez y Salta', 'San Juan Shopping (Avenida Benavídez)', 'Avenida Libertador (Parque de Mayo)', 'Avenida España y Libertador', 'Hospital Dr. Guillermo Rawson', 'Avenida España y Arenales', 'CUIM - UNSJ (Rivadavia)'],
  ARRAY['CUIM - UNSJ (Rivadavia)', 'Avenida España y Arenales', 'Hospital Dr. Guillermo Rawson', 'Avenida España y Libertador', 'Avenida Libertador (Parque de Mayo)', 'San Juan Shopping (Avenida Benavídez)', 'Avenida Benavídez y Salta', 'Chimbas Oeste (Villa Observatorio)', 'Complejo Ferial Costanera', 'Plaza Centenario de Chimbas'],
  'Lunes a Viernes de 06:00 a 22:30, Sábados con frecuencia reducida'
)
ON CONFLICT (id) DO NOTHING;
