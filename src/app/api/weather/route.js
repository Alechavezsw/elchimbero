import {
  CHIMBAS,
  formatAlertWindow,
  instructionsToList,
  pointInPolygon,
  severityMeta,
  tagValue,
  weatherFromCode,
  windDirectionLabel,
} from '@/lib/weather';

export const dynamic = 'force-dynamic';

const SMN_RSS = 'https://ssl.smn.gob.ar/feeds/CAP/rss_alertaCAP_nuevo_2026.xml';
const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';

const RELEVANT_TITLE = /zonda|viento|tormenta|nevada|lluvia|temperatura|niebla|helada|polvo|humo/i;
const RELEVANT_FILE = /Cordillera|Cuyo|SanJuan|San_Juan|Zonda/i;

let cache = null;
let cacheAt = 0;
const CACHE_MS = 10 * 60 * 1000;

function extractRssItems(rssXml) {
  const items = [];
  const blocks = rssXml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const title = tagValue(block, 'title');
    const link = tagValue(block, 'link');
    const description = tagValue(block, 'description');
    if (title && link) items.push({ title, link, description });
  }
  return items;
}

async function fetchText(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/xml,text/xml,application/rss+xml,*/*' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function mapPool(items, concurrency, mapper) {
  const results = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const current = idx++;
      results[current] = await mapper(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

function parseCapAlert(xml, sourceLink) {
  const event = tagValue(xml, 'event') || tagValue(xml, 'headline') || 'Alerta meteorológica';
  const severity = tagValue(xml, 'severity') || 'Unknown';
  const urgency = tagValue(xml, 'urgency');
  const certainty = tagValue(xml, 'certainty');
  const onset = tagValue(xml, 'onset');
  const expires = tagValue(xml, 'expires');
  const headline = tagValue(xml, 'headline') || event;
  const description = tagValue(xml, 'description');
  const instruction = tagValue(xml, 'instruction');
  const areaDesc = tagValue(xml, 'areaDesc');
  const polygon = tagValue(xml, 'polygon');
  const web = tagValue(xml, 'web') || 'https://www.smn.gob.ar';

  const coversChimbas =
    pointInPolygon(CHIMBAS.lat, CHIMBAS.lon, polygon) ||
    /chimbas|san\s*juan/i.test(`${areaDesc} ${description} ${headline}`);

  if (!coversChimbas) return null;

  const now = Date.now();
  if (expires) {
    const exp = new Date(expires).getTime();
    if (!Number.isNaN(exp) && exp < now) return null;
  }

  const meta = severityMeta(severity);
  return {
    event,
    headline,
    description,
    instruction,
    recommendations: instructionsToList(instruction),
    severity,
    severityLabel: meta.label,
    severityLevel: meta.level,
    rank: meta.rank,
    colors: { color: meta.color, bg: meta.bg, border: meta.border },
    urgency,
    certainty,
    onset,
    expires,
    validity: formatAlertWindow(onset, expires),
    areaDesc: areaDesc || 'Área que incluye Chimbas',
    source: 'SMN',
    sourceUrl: sourceLink || web,
  };
}

async function loadSmnAlertsForChimbas() {
  const rssXml = await fetchText(SMN_RSS, 15000);
  const items = extractRssItems(rssXml).filter(
    (item) => RELEVANT_TITLE.test(item.title) || RELEVANT_FILE.test(item.link)
  );

  const caps = await mapPool(items, 8, async (item) => {
    try {
      const xml = await fetchText(item.link, 10000);
      return parseCapAlert(xml, item.link);
    } catch {
      return null;
    }
  });

  const alerts = caps.filter(Boolean);
  // Deduplicate by event+onset+expires
  const seen = new Set();
  const unique = [];
  for (const alert of alerts.sort((a, b) => b.rank - a.rank)) {
    const key = `${alert.event}|${alert.onset}|${alert.expires}|${alert.severity}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(alert);
  }
  return unique;
}

async function loadOpenMeteo() {
  const url = new URL(OPEN_METEO);
  url.searchParams.set('latitude', String(CHIMBAS.lat));
  url.searchParams.set('longitude', String(CHIMBAS.lon));
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m'
  );
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_gusts_10m_max'
  );
  url.searchParams.set('timezone', 'America/Argentina/San_Juan');
  url.searchParams.set('forecast_days', '5');
  url.searchParams.set('wind_speed_unit', 'kmh');

  const res = await fetch(url.toString(), { cache: 'no-store', next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const data = await res.json();
  const current = data.current || {};
  const wmo = weatherFromCode(current.weather_code);
  const windDir = windDirectionLabel(current.wind_direction_10m);

  const daily = [];
  const times = data.daily?.time || [];
  for (let i = 0; i < times.length; i++) {
    const code = data.daily.weather_code?.[i];
    const dayInfo = weatherFromCode(code);
    const date = new Date(`${times[i]}T12:00:00`);
    const dayLabel = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' });
    daily.push({
      date: times[i],
      day: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1),
      tempMax: Math.round(data.daily.temperature_2m_max?.[i]),
      tempMin: Math.round(data.daily.temperature_2m_min?.[i]),
      windMax: Math.round(data.daily.wind_speed_10m_max?.[i] ?? 0),
      gustMax: Math.round(data.daily.wind_gusts_10m_max?.[i] ?? 0),
      status: dayInfo.status,
      icon: dayInfo.icon,
      weatherCode: code,
    });
  }

  return {
    location: CHIMBAS.label,
    updatedAt: current.time || new Date().toISOString(),
    temp: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m ?? 0),
    windGusts: Math.round(current.wind_gusts_10m ?? 0),
    windDirection: windDir,
    windDirectionDeg: current.wind_direction_10m,
    status: wmo.status,
    icon: wmo.icon,
    weatherCode: current.weather_code,
    forecast: daily,
    source: 'Open-Meteo',
  };
}

async function buildPayload() {
  const [weatherResult, alertsResult] = await Promise.allSettled([
    loadOpenMeteo(),
    loadSmnAlertsForChimbas(),
  ]);

  const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null;
  const alerts = alertsResult.status === 'fulfilled' ? alertsResult.value : [];
  const primaryAlert = alerts[0] || null;

  return {
    success: Boolean(weather) || alerts.length > 0,
    location: CHIMBAS.label,
    weather,
    alerts,
    primaryAlert,
    errors: {
      weather: weatherResult.status === 'rejected' ? String(weatherResult.reason?.message || weatherResult.reason) : null,
      alerts: alertsResult.status === 'rejected' ? String(alertsResult.reason?.message || alertsResult.reason) : null,
    },
    fetchedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const now = Date.now();
    if (cache && now - cacheAt < CACHE_MS) {
      return Response.json({ ...cache, cached: true });
    }

    const payload = await buildPayload();
    cache = payload;
    cacheAt = now;
    return Response.json({ ...payload, cached: false });
  } catch (error) {
    console.error('weather API error', error);
    return Response.json(
      { success: false, error: 'No se pudo obtener el clima', details: String(error?.message || error) },
      { status: 502 }
    );
  }
}
