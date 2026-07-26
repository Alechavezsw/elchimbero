import { promises as fs } from 'fs';
import path from 'path';

// Segment config to ensure it runs dynamically and doesn't get statically cached forever at build time
export const dynamic = 'force-dynamic';

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Quita acentos y diacríticos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres no alfanuméricos excepto espacios y guiones
    .trim()
    .replace(/\s+/g, '-'); // Reemplaza espacios con guiones
}

function findMatchingImage(title, imageFiles) {
  if (!imageFiles || imageFiles.length === 0) return null;

  const titleSlug = slugify(title);
  const titleWords = titleSlug.split('-').filter(w => w.length > 2); // Palabras de más de 2 caracteres

  if (titleWords.length === 0) return null;

  let bestMatch = null;
  let maxOverlaps = 0;

  for (const file of imageFiles) {
    // El nombre del archivo sin extensión
    const filenameNoExt = file.replace(/\.[^/.]+$/, "");
    const fileWords = filenameNoExt.split('-').filter(w => w.length > 2);

    if (fileWords.length === 0) continue;

    // Contar cuántas palabras del nombre de archivo están en el título
    let overlaps = 0;
    for (const word of fileWords) {
      if (titleWords.includes(word)) {
        overlaps++;
      }
    }

    // Si hay coincidencia de al menos 3 palabras y supera el máximo anterior
    if (overlaps >= 3 && overlaps > maxOverlaps) {
      // Verificar también ratio de coincidencia sobre el archivo (para evitar falsos positivos muy cortos)
      const ratio = overlaps / fileWords.length;
      if (ratio >= 0.5) {
        maxOverlaps = overlaps;
        bestMatch = file;
      }
    }
  }

  return bestMatch;
}

async function getLatestRedesDir() {
  const redesPath = path.join(process.cwd(), 'redes');
  try {
    const files = await fs.readdir(redesPath, { withFileTypes: true });
    const dirs = files
      .filter(f => f.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(f.name))
      .map(f => f.name)
      .sort((a, b) => b.localeCompare(a)); // Orden descendente: el más reciente primero
    
    if (dirs.length > 0) {
      return { 
        dirName: dirs[0], 
        path: path.join(redesPath, dirs[0]), 
        source: 'root' 
      };
    }
  } catch (err) {
    console.warn('No se pudo leer el directorio redes de la raiz:', err.message);
  }
  
  // Fallback a public/redes/2026-06-10
  return { 
    dirName: '2026-06-10', 
    path: path.join(process.cwd(), 'public', 'redes', '2026-06-10'),
    source: 'public'
  };
}

function getFallbackImage(categories = [], title = '') {
  const catsLower = categories.map(c => c.toLowerCase());
  const titleLower = title.toLowerCase();

  if (catsLower.includes('policiales') || titleLower.includes('robo') || titleLower.includes('detenido') || titleLower.includes('preso') || titleLower.includes('policia') || titleLower.includes('penal') || titleLower.includes('profugo')) {
    return 'https://images.unsplash.com/photo-1564485377539-4af72d1f6a2f?auto=format&fit=crop&w=800&q=80'; // Patrullero / Policial
  }
  if (catsLower.includes('salud') || catsLower.includes('caps') || titleLower.includes('hospital') || titleLower.includes('medico') || titleLower.includes('cancer') || titleLower.includes('prostata')) {
    return 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'; // Estetoscopio / Médico
  }
  if (titleLower.includes('obra') || titleLower.includes('acueducto') || titleLower.includes('construccion') || titleLower.includes('plaza') || titleLower.includes('vivienda')) {
    return 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80'; // Construcción / Obras
  }
  if (catsLower.includes('deportes') || titleLower.includes('futbol') || titleLower.includes('pumas') || titleLower.includes('partido')) {
    return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'; // Deportes
  }
  
  return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'; // Diario genérico
}

// Helper para limpiar textos de etiquetas HTML y CDATA
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // Remueve CDATA
    .replace(/<[^>]*>/g, '') // Remueve etiquetas HTML
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '–')
    .trim();
}

// Regex helpers para parsear XML sin dependencias pesadas
function extractTagContent(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : '';
}

function extractAllTagsContent(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'gi');
  const matches = xml.match(regex) || [];
  return matches.map(m => {
    const contentMatch = m.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i'));
    return contentMatch ? contentMatch[1] : '';
  });
}

export async function GET() {
  try {
    // 1. Obtener el directorio de imágenes más reciente
    const latestDir = await getLatestRedesDir();
    let localImages = [];
    
    try {
      const manifestPath = path.join(latestDir.path, 'manifest.json');
      let manifestContent = await fs.readFile(manifestPath, 'utf-8');
      manifestContent = manifestContent.trim();
      if (manifestContent.charCodeAt(0) === 0xFEFF) {
        manifestContent = manifestContent.substring(1);
      }
      const manifest = JSON.parse(manifestContent);
      localImages = manifest.files || [];
    } catch (err) {
      console.warn(`No se pudo cargar el manifest.json desde ${latestDir.path}:`, err.message);
    }

    // 2. Fetch del RSS Feed de El Chimbero (timeout corto para no tumbar la home)
    const res = await fetch('https://elchimbero.com.ar/feed/', {
      headers: {
        'User-Agent': 'ElChimberoPortalClient/1.0',
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 60 } // Caché por 60 segundos
    });

    if (!res.ok) {
      throw new Error(`Error al consultar el feed de noticias: ${res.status}`);
    }

    const xmlText = await res.text();

    // 3. Parsear ítems de noticias
    const itemBlocks = xmlText.match(/<item>[\s\S]*?<\/item>/gi) || [];
    const news = itemBlocks.map((itemBlock, index) => {
      const titleRaw = extractTagContent(itemBlock, 'title');
      const linkRaw = extractTagContent(itemBlock, 'link');
      const pubDateRaw = extractTagContent(itemBlock, 'pubDate');
      const descRaw = extractTagContent(itemBlock, 'description');
      const categoriesRaw = extractAllTagsContent(itemBlock, 'category');

      const title = cleanText(titleRaw);
      const link = cleanText(linkRaw);
      const description = cleanText(descRaw);
      const categories = categoriesRaw.map(c => cleanText(c));
      const pubDate = cleanText(pubDateRaw);

      // Intentar asociar con imagen local
      const matchingFile = findMatchingImage(title, localImages);
      let image_url = null;
      if (matchingFile) {
        if (latestDir.source === 'root') {
          image_url = `/api/redes/${latestDir.dirName}/${matchingFile}`;
        } else {
          image_url = `/redes/${latestDir.dirName}/${matchingFile}`;
        }
      }
      
      // Si no hay match local, usar fallback
      if (!image_url) {
        image_url = getFallbackImage(categories, title);
      }

      return {
        id: `news-${index}`,
        title,
        link,
        description,
        categories,
        pubDate,
        image_url
      };
    });

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: news
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error en Route Handler de noticias:', error);
    const timedOut =
      error?.name === 'TimeoutError' ||
      error?.name === 'AbortError' ||
      error?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT';

    return Response.json({
      success: false,
      error: timedOut
        ? 'El feed de noticias no respondió a tiempo. Reintentá en unos segundos.'
        : (error.message || 'Error interno del servidor al procesar noticias'),
      data: []
    }, {
      // 503 evita romper la home; el cliente ya maneja success:false
      status: timedOut ? 503 : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}
