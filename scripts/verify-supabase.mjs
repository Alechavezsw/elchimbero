/**
 * Verifica que la app esté cableada a Supabase y que el admin funcione.
 * Uso: node scripts/verify-supabase.mjs
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('Falta .env.local con NEXT_PUBLIC_SUPABASE_URL y ANON_KEY');
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key || url.includes('placeholder')) {
  console.error('Credenciales Supabase inválidas en .env.local');
  process.exit(1);
}

const sb = createClient(url, key);
const results = [];

async function check(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail });
    console.log(`✓ ${name}`, detail ?? '');
  } catch (e) {
    results.push({ name, ok: false, detail: e.message });
    console.error(`✗ ${name}:`, e.message);
  }
}

await check('public.businesses', async () => {
  const { data, error } = await sb.from('businesses').select('id').eq('status', 'approved');
  if (error) throw error;
  return `${data.length} aprobados`;
});

await check('login.admin', async () => {
  const { data, error } = await sb.auth.signInWithPassword({
    email: 'admin@elchimbero.com',
    password: 'chimbero123',
  });
  if (error) throw error;
  const { data: profile, error: pErr } = await sb
    .from('profiles')
    .select('is_admin, full_name')
    .eq('id', data.user.id)
    .single();
  if (pErr) throw pErr;
  if (!profile.is_admin) throw new Error('is_admin=false');
  return profile.full_name;
});

await check('admin.write.pharmacy', async () => {
  const { data, error } = await sb
    .from('pharmacies')
    .insert([
      {
        name: 'QA Farmacia Temporal',
        address: 'Calle Test 1',
        phone: '264-111',
        latitude: -31.49,
        longitude: -68.53,
        duty_dates: [],
        is_open_24h: false,
      },
    ])
    .select('id')
    .single();
  if (error) throw error;
  const { error: delErr } = await sb.from('pharmacies').delete().eq('id', data.id);
  if (delErr) throw delErr;
  return 'create+delete ok';
});

await check('admin.write.business', async () => {
  const { data, error } = await sb
    .from('businesses')
    .insert([
      {
        name: 'QA Comercio Temporal',
        description: 'Prueba admin',
        category: 'Otros',
        address: 'Calle Test',
        neighborhood: 'Villa Paula',
        status: 'pending',
        is_featured: false,
      },
    ])
    .select('id,status')
    .single();
  if (error) throw error;
  const { data: upd, error: uErr } = await sb
    .from('businesses')
    .update({ status: 'approved' })
    .eq('id', data.id)
    .select('status')
    .single();
  if (uErr) throw uErr;
  const { error: delErr } = await sb.from('businesses').delete().eq('id', data.id);
  if (delErr) throw delErr;
  return `status ${upd.status} + delete ok`;
});

await sb.auth.signOut();

const failed = results.filter((r) => !r.ok);
console.log('\n---');
console.log(failed.length ? `FALLÓ ${failed.length} chequeos` : 'TODO OK — Supabase + admin listos');
process.exit(failed.length ? 1 : 0);
