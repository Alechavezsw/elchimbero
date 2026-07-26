import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { path: filePathParts } = await params;
    if (!filePathParts || filePathParts.length === 0) {
      return new Response('Not Found', { status: 404 });
    }

    const relativePath = path.join(...filePathParts);
    
    // Evitar directory traversal
    if (relativePath.includes('..') || relativePath.startsWith('/') || relativePath.startsWith('\\')) {
      return new Response('Forbidden', { status: 403 });
    }

    const absolutePath = path.join(process.cwd(), 'redes', relativePath);
    
    const fileBuffer = await fs.readFile(absolutePath);
    
    // Determinar content-type básico
    let contentType = 'application/octet-stream';
    if (absolutePath.endsWith('.png')) {
      contentType = 'image/png';
    } else if (absolutePath.endsWith('.jpg') || absolutePath.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (absolutePath.endsWith('.gif')) {
      contentType = 'image/gif';
    } else if (absolutePath.endsWith('.svg')) {
      contentType = 'image/svg+xml';
    } else if (absolutePath.endsWith('.json')) {
      contentType = 'application/json';
    }

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Error serving file from redes:', error);
    return new Response('Not Found', { status: 404 });
  }
}
