import fs from 'node:fs';

const dates = (offsets) =>
  offsets.map((o) => {
    const d = new Date();
    d.setDate(d.getDate() + o);
    return d.toISOString().slice(0, 10);
  });

const pharmacies = [
  {
    id: 'f1b07384-d113-4ec5-a581-2292d3b2e201',
    name: 'Farmacia San Cayetano',
    address: 'Tucumán 1320 (Norte) - Villa Paula',
    phone: '264-4315566',
    lat: -31.4951,
    lng: -68.5345,
    duty: dates([0, 2, 4, 6, -2]),
    h24: true,
  },
  {
    id: 'f1b07384-d113-4ec5-a581-2292d3b2e202',
    name: 'Farmacia Villa Obrera',
    address: 'Ruta 40 y Dorrego - Villa Obrera',
    phone: '264-4284422',
    lat: -31.4845,
    lng: -68.5298,
    duty: dates([1, 3, 5, -1, -3]),
    h24: true,
  },
  {
    id: 'f1b07384-d113-4ec5-a581-2292d3b2e203',
    name: 'Farmacia Del Norte',
    address: 'Benavidez 1950 (Oeste) - B° Los Tamarindos',
    phone: '264-4217733',
    lat: -31.5005,
    lng: -68.5252,
    duty: dates([0, 3, 6, -1]),
    h24: false,
  },
];

const esc = (s) => String(s).replace(/'/g, "''");

const sql = pharmacies
  .map(
    (p) =>
      `INSERT INTO public.pharmacies (id, name, address, phone, latitude, longitude, duty_dates, is_open_24h) VALUES ('${p.id}', '${esc(p.name)}', '${esc(p.address)}', '${esc(p.phone)}', ${p.lat}, ${p.lng}, '{${p.duty.join(',')}}'::date[], ${p.h24});`
  )
  .join('\n');

fs.writeFileSync('scripts/seed-chunks/04-pharmacies-fixed.sql', sql + '\n', 'utf8');
console.log(sql);
