/** Chimbas, San Juan */
export const CHIMBAS = { lat: -31.4935, lon: -68.5326, label: 'Chimbas, San Juan' };

const WMO = {
  0: { status: 'Despejado', icon: '☀️' },
  1: { status: 'Mayormente despejado', icon: '🌤️' },
  2: { status: 'Parcialmente nublado', icon: '⛅' },
  3: { status: 'Nublado', icon: '☁️' },
  45: { status: 'Niebla', icon: '🌫️' },
  48: { status: 'Niebla con escarcha', icon: '🌫️' },
  51: { status: 'Llovizna leve', icon: '🌦️' },
  53: { status: 'Llovizna', icon: '🌦️' },
  55: { status: 'Llovizna intensa', icon: '🌧️' },
  61: { status: 'Lluvia leve', icon: '🌧️' },
  63: { status: 'Lluvia', icon: '🌧️' },
  65: { status: 'Lluvia intensa', icon: '🌧️' },
  71: { status: 'Nevada leve', icon: '🌨️' },
  73: { status: 'Nevada', icon: '❄️' },
  75: { status: 'Nevada intensa', icon: '❄️' },
  80: { status: 'Chubascos', icon: '🌦️' },
  81: { status: 'Chubascos moderados', icon: '🌧️' },
  82: { status: 'Chubascos intensos', icon: '⛈️' },
  95: { status: 'Tormenta', icon: '⛈️' },
  96: { status: 'Tormenta con granizo', icon: '⛈️' },
  99: { status: 'Tormenta fuerte con granizo', icon: '⛈️' },
};

const SEVERITY = {
  Extreme: { level: 'roja', label: 'Roja', rank: 4, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.4)' },
  Severe: { level: 'naranja', label: 'Naranja', rank: 3, color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.4)' },
  Moderate: { level: 'amarilla', label: 'Amarilla', rank: 2, color: '#eab308', bg: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.4)' },
  Minor: { level: 'verde', label: 'Verde', rank: 1, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.35)' },
  Unknown: { level: 'info', label: 'Informativa', rank: 0, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)' },
};

const CARDINAL = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];

export function weatherFromCode(code) {
  return WMO[code] || { status: 'Sin datos', icon: '🌡️' };
}

export function windDirectionLabel(degrees) {
  if (degrees == null || Number.isNaN(degrees)) return '—';
  const idx = Math.round(((degrees % 360) / 45)) % 8;
  return CARDINAL[idx];
}

export function severityMeta(severity) {
  return SEVERITY[severity] || SEVERITY.Unknown;
}

/** Ray-casting point-in-polygon. Polygon pairs: "lat,lon lat,lon ..." */
export function pointInPolygon(lat, lon, polygonText) {
  if (!polygonText) return false;
  const pts = [];
  for (const pair of polygonText.trim().split(/\s+/)) {
    const [a, b] = pair.split(',');
    const pLat = Number(a);
    const pLon = Number(b);
    if (Number.isFinite(pLat) && Number.isFinite(pLon)) pts.push([pLat, pLon]);
  }
  if (pts.length < 3) return false;

  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [yi, xi] = pts[i];
    const [yj, xj] = pts[j];
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function decodeXmlEntities(text = '') {
  return text
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function tagValue(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = xml.match(re);
  return m ? decodeXmlEntities(m[1].trim()) : '';
}

export function formatAlertWindow(onset, expires) {
  const opts = { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
  const start = onset ? new Date(onset) : null;
  const end = expires ? new Date(expires) : null;
  if (start && !Number.isNaN(start.getTime()) && end && !Number.isNaN(end.getTime())) {
    return `${start.toLocaleString('es-AR', opts)} → ${end.toLocaleString('es-AR', opts)}`;
  }
  if (end && !Number.isNaN(end.getTime())) {
    return `Hasta ${end.toLocaleString('es-AR', opts)}`;
  }
  return 'Vigencia según SMN';
}

export function instructionsToList(instruction) {
  if (!instruction) return [];
  return instruction
    .split(/(?=\d+\s*[-.)])/)
    .map((s) => s.replace(/^\d+\s*[-.)]\s*/, '').trim())
    .filter(Boolean);
}
