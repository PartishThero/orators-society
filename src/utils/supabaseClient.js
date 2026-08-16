import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables are missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable dynamic admin functions.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

// ── Storage helpers ───────────────────────────────────────────────────────────

/**
 * Converts a Supabase Storage public URL to a CDN URL.
 * If VITE_CDN_BASE_URL is set, swaps the Supabase Storage origin for the CDN.
 * Falls back to the raw Supabase URL when no CDN is configured (safe).
 *
 * Usage:  <img src={getCdnUrl(item.img)} />
 */
export function getCdnUrl(url) {
  if (!url) return url;
  const cdnBase = import.meta.env.VITE_CDN_BASE_URL;
  if (!cdnBase || !supabaseUrl) return url;

  const storageBase = supabaseUrl + '/storage/v1/object/public/';
  if (url.startsWith(storageBase)) {
    return cdnBase.replace(/\/$/, '') + '/' + url.slice(storageBase.length);
  }
  return url;
}

/**
 * Compresses an image File via canvas and uploads it to Supabase Storage.
 * Returns the public URL of the uploaded file.
 *
 * @param {File}   file       Image file from an <input type="file">
 * @param {string} bucket     Storage bucket, e.g. 'event-images'
 * @param {string} pathPrefix Folder inside bucket, e.g. 'events'
 * @param {object} opts       Optional: { maxWidth, maxHeight, quality }
 * @returns {Promise<string>} Public URL of the uploaded image
 */
export async function uploadToStorage(file, bucket, pathPrefix, opts = {}) {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = opts;

  // Compress via canvas (same logic as before, but output Blob not base64)
  const compressed = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
        } else {
          if (height > maxHeight) { width = Math.round((width * maxHeight) / height); height = maxHeight; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(blob => {
          if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
          resolve({ blob, mimeType });
        }, mimeType, quality);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

  // UUID-style filename ensures cache invalidation when a file is replaced
  const ext = compressed.mimeType === 'image/png' ? 'png' : 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const storagePath = `${pathPrefix}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, compressed.blob, {
      contentType: compressed.mimeType,
      cacheControl: '31536000', // 1 year — files are immutable (replaced, not updated)
      upsert: false,
    });

  if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Deletes an image from Supabase Storage by its public URL.
 * Safe to call on base64 data URIs or external URLs — silently no-ops.
 *
 * @param {string} bucket Storage bucket the file lives in
 * @param {string} url    Public URL returned by uploadToStorage()
 */
export async function deleteFromStorage(bucket, url) {
  if (!url || !supabaseUrl) return;
  const storageBase = `${supabaseUrl}/storage/v1/object/public/${bucket}/`;
  if (!url.startsWith(storageBase)) return; // not a Storage URL — skip
  const storagePath = url.slice(storageBase.length);
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);
  if (error) console.warn('Storage delete warning:', error.message);
}
