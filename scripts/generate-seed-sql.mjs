/**
 * Genera SQL de seed desde mockData.js para aplicar en Supabase.
 * Uso: node scripts/generate-seed-sql.mjs > scripts/seed.sql
 */
import {
  initialBusinesses,
  initialClassifieds,
  initialPharmacies,
  initialKiosks,
  initialEvents,
  initialBuses,
  initialJobs,
} from '../src/lib/mockData.js';

const esc = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL';
  if (Array.isArray(v)) {
    if (v.length === 0) return `'{}'`;
    const allDates = v.every((item) => /^\d{4}-\d{2}-\d{2}$/.test(String(item)));
    if (allDates) {
      return `'{${v.join(',')}}'`;
    }
    // text[]  → '{"a","b"}'
    const inner = v
      .map((item) => `"${String(item).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
      .join(',');
    return `'{${inner}}'`;
  }
  if (typeof v === 'object') {
    return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(v).replace(/'/g, "''")}'`;
};

const parts = [];

parts.push(`-- Seed El Chimbero (idempotent-ish: clear then insert)
TRUNCATE TABLE public.classifieds, public.businesses, public.jobs, public.events, public.pharmacies, public.kiosks, public.buses RESTART IDENTITY CASCADE;

-- Auth demo users (password: chimbero123)
DO $$
DECLARE
  v_instance uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Clean previous demo identities/users if re-running
  DELETE FROM auth.identities WHERE user_id IN (
    'd3b07384-d113-4ec5-a581-2292d3b2e591'::uuid,
    'a0b07384-d113-4ec5-a581-2292d3b2e999'::uuid
  );
  DELETE FROM public.profiles WHERE id IN (
    'd3b07384-d113-4ec5-a581-2292d3b2e591'::uuid,
    'a0b07384-d113-4ec5-a581-2292d3b2e999'::uuid
  );
  DELETE FROM auth.users WHERE id IN (
    'd3b07384-d113-4ec5-a581-2292d3b2e591'::uuid,
    'a0b07384-d113-4ec5-a581-2292d3b2e999'::uuid
  );

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES
  (
    v_instance,
    'd3b07384-d113-4ec5-a581-2292d3b2e591',
    'authenticated', 'authenticated',
    'test@elchimbero.com',
    crypt('chimbero123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Juan Pérez","phone":"2645123456","avatar_url":"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    v_instance,
    'a0b07384-d113-4ec5-a581-2292d3b2e999',
    'authenticated', 'authenticated',
    'admin@elchimbero.com',
    crypt('chimbero123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Admin Chimbero","phone":"264000000","avatar_url":"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"}'::jsonb,
    now(), now(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES
  (
    gen_random_uuid(),
    'd3b07384-d113-4ec5-a581-2292d3b2e591',
    jsonb_build_object('sub', 'd3b07384-d113-4ec5-a581-2292d3b2e591', 'email', 'test@elchimbero.com', 'email_verified', true),
    'email',
    'd3b07384-d113-4ec5-a581-2292d3b2e591',
    now(), now(), now()
  ),
  (
    gen_random_uuid(),
    'a0b07384-d113-4ec5-a581-2292d3b2e999',
    jsonb_build_object('sub', 'a0b07384-d113-4ec5-a581-2292d3b2e999', 'email', 'admin@elchimbero.com', 'email_verified', true),
    'email',
    'a0b07384-d113-4ec5-a581-2292d3b2e999',
    now(), now(), now()
  );

  -- Trigger may have created profiles; ensure admin flag + names
  UPDATE public.profiles
  SET full_name = 'Juan Pérez',
      phone = '2645123456',
      avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      is_admin = FALSE
  WHERE id = 'd3b07384-d113-4ec5-a581-2292d3b2e591';

  UPDATE public.profiles
  SET full_name = 'Admin Chimbero',
      phone = '264000000',
      avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      is_admin = TRUE
  WHERE id = 'a0b07384-d113-4ec5-a581-2292d3b2e999';
END $$;
`);

// Businesses
for (const b of initialBusinesses) {
  parts.push(`INSERT INTO public.businesses (
    id, owner_id, name, description, category, address, neighborhood,
    phone, whatsapp, latitude, longitude, image_url, hours, status, is_featured, created_at
  ) VALUES (
    ${esc(b.id)}, ${esc(b.owner_id)}, ${esc(b.name)}, ${esc(b.description)}, ${esc(b.category)},
    ${esc(b.address)}, ${esc(b.neighborhood)}, ${esc(b.phone)}, ${esc(b.whatsapp)},
    ${esc(b.latitude)}, ${esc(b.longitude)}, ${esc(b.image_url)}, ${esc(b.hours)},
    ${esc(b.status)}, ${esc(!!b.is_featured)}, ${esc(b.created_at)}
  );`);
}

// Classifieds
for (const c of initialClassifieds) {
  parts.push(`INSERT INTO public.classifieds (
    id, user_id, title, description, price, category, condition, image_url, whatsapp, status, created_at
  ) VALUES (
    ${esc(c.id)}, ${esc(c.user_id)}, ${esc(c.title)}, ${esc(c.description)}, ${esc(c.price)},
    ${esc(c.category)}, ${esc(c.condition)}, ${esc(c.image_url)}, ${esc(c.whatsapp)},
    ${esc(c.status)}, ${esc(c.created_at)}
  );`);
}

// Pharmacies
for (const p of initialPharmacies) {
  parts.push(`INSERT INTO public.pharmacies (
    id, name, address, phone, latitude, longitude, duty_dates, is_open_24h, created_at
  ) VALUES (
    ${esc(p.id)}, ${esc(p.name)}, ${esc(p.address)}, ${esc(p.phone)},
    ${esc(p.latitude)}, ${esc(p.longitude)}, ${esc(p.duty_dates)}::date[],
    ${esc(!!p.is_open_24h)}, ${esc(p.created_at)}
  );`);
}

// Kiosks
for (const k of initialKiosks) {
  parts.push(`INSERT INTO public.kiosks (
    id, name, address, neighborhood, phone, latitude, longitude, is_open_24h, hours_description, created_at
  ) VALUES (
    ${esc(k.id)}, ${esc(k.name)}, ${esc(k.address)}, ${esc(k.neighborhood)}, ${esc(k.phone)},
    ${esc(k.latitude)}, ${esc(k.longitude)}, ${esc(!!k.is_open_24h)}, ${esc(k.hours_description)},
    ${esc(k.created_at)}
  );`);
}

// Events
for (const e of initialEvents) {
  parts.push(`INSERT INTO public.events (
    id, title, description, date, time, location, category, image_url, price, created_at
  ) VALUES (
    ${esc(e.id)}, ${esc(e.title)}, ${esc(e.description)}, ${esc(e.date)}::date,
    ${esc(e.time)}::time, ${esc(e.location)}, ${esc(e.category)}, ${esc(e.image_url)},
    ${esc(e.price)}, ${esc(e.created_at)}
  );`);
}

// Buses
for (const b of initialBuses) {
  parts.push(`INSERT INTO public.buses (
    id, line, description, type, frequency, neighborhoods, stops, stops_vuelta, schedule, created_at
  ) VALUES (
    ${esc(b.id)}, ${esc(b.line)}, ${esc(b.description)}, ${esc(b.type)}, ${esc(b.frequency)},
    ${esc(b.neighborhoods)}::text[], ${esc(b.stops)}::text[], ${esc(b.stops_vuelta || [])}::text[],
    ${esc(b.schedule)}, ${esc(b.created_at || new Date().toISOString())}
  );`);
}

// Jobs
for (const j of initialJobs) {
  parts.push(`INSERT INTO public.jobs (
    id, title, description, type, category, price, company, contact_name, whatsapp, created_at
  ) VALUES (
    ${esc(j.id)}, ${esc(j.title)}, ${esc(j.description)}, ${esc(j.type)}, ${esc(j.category)},
    ${esc(j.price)}, ${esc(j.company)}, ${esc(j.contact_name)}, ${esc(j.whatsapp)},
    ${esc(j.created_at)}
  );`);
}

process.stdout.write(parts.join('\n') + '\n');
