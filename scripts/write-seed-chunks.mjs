import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const r = spawnSync(process.execPath, ['scripts/generate-seed-sql.mjs'], {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});

if (r.status !== 0) {
  console.error(r.stderr || r.stdout);
  process.exit(1);
}

const sql = r.stdout;
fs.writeFileSync('scripts/seed.sql', sql, 'utf8');

const markers = [
  ['01-auth', 'INSERT INTO public.businesses'],
  ['02-businesses', 'INSERT INTO public.classifieds'],
  ['03-classifieds', 'INSERT INTO public.pharmacies'],
  ['04-pharmacies', 'INSERT INTO public.kiosks'],
  ['05-kiosks', 'INSERT INTO public.events'],
  ['06-events', 'INSERT INTO public.buses'],
  ['07-buses', 'INSERT INTO public.jobs'],
  ['08-jobs', null],
];

fs.mkdirSync('scripts/seed-chunks', { recursive: true });

let start = 0;
for (const [name, next] of markers) {
  const end = next ? sql.indexOf(next, start) : sql.length;
  if (end < 0) {
    console.error('missing marker', next);
    process.exit(1);
  }
  const chunk = sql.slice(start, end);
  fs.writeFileSync(`scripts/seed-chunks/${name}.sql`, chunk, 'utf8');
  const sampleIdx = chunk.indexOf('Ferreter');
  const sample = sampleIdx >= 0 ? chunk.slice(sampleIdx, sampleIdx + 18) : chunk.slice(0, 40);
  console.log(name, chunk.length, sample);
  start = end;
}
