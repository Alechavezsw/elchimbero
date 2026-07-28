'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';

/**
 * Subida de foto a Supabase Storage (o data URL en mock).
 * value: URL actual
 * onChange: (url) => void
 * folder: carpeta en el bucket (ej. businesses, events)
 */
export default function ImageUploadField({
  value = '',
  onChange,
  folder = 'misc',
  label = 'Foto',
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes (JPG, PNG, WebP o GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5 MB.');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const url = await db.uploadImage(file, folder);
      onChange?.(url);
    } catch (err) {
      console.error(err);
      setError(err.message || 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>
        {label}
      </label>

      {value ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '160px',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid var(--border-glass)',
            marginBottom: '0.75rem',
            background: '#0b0c12',
          }}
        >
          <img
            src={value}
            alt="Vista previa"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            type="button"
            onClick={() => onChange?.('')}
            title="Quitar foto"
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.65rem',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <Trash2 size={14} /> Quitar
          </button>
        </div>
      ) : null}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            border: '1px solid rgba(248,120,0,0.45)',
            background: 'rgba(248,120,0,0.12)',
            color: '#ffb020',
            cursor: uploading ? 'wait' : 'pointer',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          {uploading ? <Loader2 size={16} className="spin" /> : <ImagePlus size={16} />}
          {uploading ? 'Subiendo…' : value ? 'Cambiar foto' : 'Subir foto'}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <input
          type="url"
          placeholder="o pegá una URL"
          value={value?.startsWith('data:') ? '' : value || ''}
          onChange={(e) => {
            setError(null);
            onChange?.(e.target.value);
          }}
          style={{
            flex: 1,
            minWidth: '160px',
            padding: '0.65rem 0.75rem',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-glass)',
            color: 'white',
            fontSize: '0.85rem',
          }}
        />
      </div>

      {error ? (
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#f87171' }}>{error}</p>
      ) : (
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          JPG, PNG, WebP o GIF · máx. 5 MB
        </p>
      )}
    </div>
  );
}
