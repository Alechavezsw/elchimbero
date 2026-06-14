-- Migración para nuevas características comunitarias: Clima/Alertas, RedTulum, Eventos y Bolsa de Empleo

-- 1. TABLA DE EVENTOS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME WITHOUT TIME ZONE,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    price NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Events
CREATE POLICY "Permitir lectura pública de eventos" 
ON public.events FOR SELECT 
USING (true);

CREATE POLICY "Permitir creación de eventos a usuarios autenticados" 
ON public.events FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 2. TABLA DE COLECTIVOS (REDTULUM)
CREATE TABLE IF NOT EXISTS public.buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line TEXT NOT NULL UNIQUE,
    description TEXT,
    type TEXT NOT NULL, -- capital_conexion, interno_chimbas, salud_universidad
    frequency TEXT,
    neighborhoods TEXT[] NOT NULL,
    stops TEXT[] NOT NULL,
    schedule TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en Buses
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Buses
CREATE POLICY "Permitir lectura pública de colectivos" 
ON public.buses FOR SELECT 
USING (true);

-- Solo administradores pueden modificar colectivos (manejado vía dashboard o DB directamente)
CREATE POLICY "Permitir inserción a administradores" 
ON public.buses FOR INSERT 
WITH CHECK (auth.uid() IN (
  -- Aquí iría la lógica de roles de tu sistema, o permitir solo a un owner email específico
  SELECT id FROM auth.users WHERE email LIKE '%admin%'
));

-- 3. TABLA DE BOLSA DE EMPLEO
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL, -- oferta_laboral, servicio_vecinal
    category TEXT NOT NULL,
    price NUMERIC DEFAULT 0,
    company TEXT,
    contact_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en Jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Jobs
CREATE POLICY "Permitir lectura pública de empleos" 
ON public.jobs FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserción de empleos a usuarios autenticados" 
ON public.jobs FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminación al creador de la publicación" 
ON public.jobs FOR DELETE 
USING (auth.uid() = user_id);

-- Índices para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS events_date_idx ON public.events(date);
CREATE INDEX IF NOT EXISTS buses_line_idx ON public.buses(line);
CREATE INDEX IF NOT EXISTS jobs_type_idx ON public.jobs(type);
CREATE INDEX IF NOT EXISTS jobs_category_idx ON public.jobs(category);
