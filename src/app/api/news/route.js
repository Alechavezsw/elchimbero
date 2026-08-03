import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const WP_POSTS_URL =
  'https://elchimbero.com.ar/wp-json/wp/v2/posts?per_page=10&_embed=1';

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8230;/g, '…')
    .trim();
}

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Match estricto: slug del título debe estar contenido en el archivo (o viceversa con umbral alto). */
function findStrictLocalImage(title, imageEntries) {
  if (!title || !imageEntries?.length) return null;

  const titleSlug = slugify(title);
  if (titleSlug.length < 12) return null;

  // Quitar prefijo de fecha YYYY-MM-DD- del nombre de archivo
  const normalizeFile = (file) =>
    file
      .replace(/\.[^/.]+$/, '')
      .replace(/^\d{4}-\d{2}-\d{2}-/, '');

  let best = null;
  let bestScore = 0;

  for (const entry of imageEntries) {
    const fileSlug = normalizeFile(entry.file);
    if (!fileSlug) continue;

    let score = 0;
    if (fileSlug === titleSlug) score = 100;
    else if (fileSlug.includes(titleSlug) || titleSlug.includes(fileSlug)) {
      const shorter = Math.min(fileSlug.length, titleSlug.length);
      const longer = Math.max(fileSlug.length, titleSlug.length);
      score = Math.round((shorter / longer) * 90);
    } else {
      const titleWords = titleSlug.split('-').filter((w) => w.length > 3);
      const fileWords = new Set(fileSlug.split('-').filter((w) => w.length > 3));
      if (titleWords.length < 4) continue;
      const overlaps = titleWords.filter((w) => fileWords.has(w)).length;
      const ratio = overlaps / titleWords.length;
      // Exigir casi todas las palabras significativas del título
      if (ratio >= 0.75 && overlaps >= 5) score = Math.round(ratio * 70);
    }

    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  // Solo aceptar matches muy seguros
  if (!best || bestScore < 70) return null;
  return best;
}

async function loadLocalImageIndex() {
  const redesPath = path.join(process.cwd(), 'redes');
  const entries = [];
  try {
    const files = await fs.readdir(redesPath, { withFileTypes: true });
    const dirs = files
      .filter((f) => f.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(f.name))
      .map((f) => f.name)
      .sort((a, b) => b.localeCompare(a));

    for (const dirName of dirs.slice(0, 14)) {
      try {
        let raw = await fs.readFile(path.join(redesPath, dirName, 'manifest.json'), 'utf-8');
        raw = raw.trim();
        if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
        const manifest = JSON.parse(raw);
        for (const file of manifest.files || []) {
          entries.push({
            dirName,
            file,
            url: `/api/redes/${dirName}/${file}`,
          });
        }
      } catch {
        // skip broken day folders
      }
    }
  } catch {
    // redes folder missing
  }
  return entries;
}

function extractFeaturedImage(post) {
  const media = post?._embedded?.['wp:featuredmedia']?.[0];
  if (!media) return null;

  const sizes = media.media_details?.sizes || {};
  return (
    sizes.large?.source_url ||
    sizes.medium_large?.source_url ||
    sizes.full?.source_url ||
    media.source_url ||
    null
  );
}

function extractCategories(post) {
  const terms = post?._embedded?.['wp:term'] || [];
  const cats = [];
  for (const group of terms) {
    for (const term of group || []) {
      if (term?.taxonomy === 'category' && term?.name) {
        cats.push(cleanText(term.name));
      }
    }
  }
  return cats;
}

async function fetchWordpressNews() {
  const res = await fetch(WP_POSTS_URL, {
    headers: {
      'User-Agent': 'ElChimberoPortalClient/1.0',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(12000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`WordPress API ${res.status}`);
  const posts = await res.json();
  if (!Array.isArray(posts) || posts.length === 0) throw new Error('Respuesta WP inválida');

  const localImages = await loadLocalImageIndex();

  return posts.map((post, index) => {
    const title = cleanText(post.title?.rendered);
    const description = cleanText(post.excerpt?.rendered);
    const link = post.link;
    const pubDate = post.date_gmt ? `${post.date_gmt}Z` : post.date;
    const categories = extractCategories(post);

    // 1) Imagen oficial del diario (featured)
    let image_url = extractFeaturedImage(post);

    // 2) Fallback local solo con match estricto
    if (!image_url) {
      const local = findStrictLocalImage(title, localImages);
      if (local) image_url = local.url;
    }

    // 3) Placeholder neutro (nunca Unsplash genérico engañoso)
    if (!image_url) {
      image_url = '/logo-el-chimbero.png';
    }

    return {
      id: post.id ? `wp-${post.id}` : `news-${index}`,
      title,
      link,
      description,
      categories,
      pubDate,
      image_url,
    };
  });
}

/** Fallback RSS sin fotos inventadas */
async function fetchRssNewsFallback() {
  const res = await fetch('https://elchimbero.com.ar/feed/', {
    headers: {
      'User-Agent': 'ElChimberoPortalClient/1.0',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
    signal: AbortSignal.timeout(10000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`RSS ${res.status}`);
  const xmlText = await res.text();
  const itemBlocks = xmlText.match(/<item>[\s\S]*?<\/item>/gi) || [];
  if (!itemBlocks.length) throw new Error('RSS sin ítems');
  const localImages = await loadLocalImageIndex();

  return itemBlocks.slice(0, 10).map((itemBlock, index) => {
    const title = cleanText(itemBlock.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
    const link = cleanText(itemBlock.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]);
    const description = cleanText(itemBlock.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1]);
    const pubDate = cleanText(itemBlock.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]);
    const categories = [...(itemBlock.match(/<category[^>]*>([\s\S]*?)<\/category>/gi) || [])].map((c) =>
      cleanText(c.replace(/<\/?category[^>]*>/gi, ''))
    );

    const local = findStrictLocalImage(title, localImages);
    return {
      id: `news-${index}`,
      title,
      link,
      description,
      categories,
      pubDate,
      image_url: local?.url || '/logo-el-chimbero.png',
    };
  });
}

export async function GET() {
  try {
    let news;
    let source = 'wordpress';
    try {
      news = await fetchWordpressNews();
    } catch (wpError) {
      console.warn('WP API falló, uso RSS:', wpError.message);
      news = await fetchRssNewsFallback();
      source = 'rss';
    }

    return Response.json(
      {
        success: true,
        source,
        timestamp: new Date().toISOString(),
        data: news,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error en Route Handler de noticias:', error);
    const timedOut =
      error?.name === 'TimeoutError' ||
      error?.name === 'AbortError' ||
      error?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT';

    return Response.json(
      {
        success: false,
        error: timedOut
          ? 'El feed de noticias no respondió a tiempo. Reintentá en unos segundos.'
          : error.message || 'Error interno del servidor al procesar noticias',
        data: [],
      },
      {
        status: timedOut ? 503 : 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
