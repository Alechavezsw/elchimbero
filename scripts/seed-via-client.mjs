/**
 * Completa seed demo vía cliente Supabase (login admin).
 * Uso: node scripts/seed-via-client.mjs
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialBuses } from '../src/lib/mockData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');
const envText = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const { error: authError } = await supabase.auth.signInWithPassword({
  email: 'admin@elchimbero.com',
  password: 'chimbero123',
});
if (authError) {
  console.error('Login admin falló:', authError.message);
  process.exit(1);
}
console.log('Login admin OK');

const buses = initialBuses.map((b) => ({
  id: b.id,
  line: b.line,
  description: b.description,
  type: b.type,
  frequency: b.frequency,
  neighborhoods: b.neighborhoods,
  stops: b.stops,
  stops_vuelta: b.stops_vuelta || [],
  schedule: b.schedule,
}));

const { error } = await supabase.from('buses').upsert(buses, { onConflict: 'id' });
if (error) {
  console.error('Error buses:', error.message);
  process.exit(1);
}

const tables = ['businesses', 'classifieds', 'pharmacies', 'kiosks', 'events', 'buses', 'jobs'];
for (const t of tables) {
  const { count, error: cErr } = await supabase
    .from(t)
    .select('*', { count: 'exact', head: true });
  console.log(`${t}: ${cErr ? cErr.message : count}`);
}

await supabase.auth.signOut();
console.log('Seed buses listo');
