const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Using unsigned upload with an upload preset — no API secret needed.
// This is the recommended approach for client-side uploads.
const UPLOAD_PRESET = 'portfolio_unsigned';

/**
 * Upload an image file to Cloudinary using unsigned upload preset.
 * Returns the secure URL of the uploaded image.
 *
 * Setup: In your Cloudinary dashboard, create an unsigned upload preset
 * named 'portfolio_unsigned' (Settings → Upload → Upload presets → Add).
 */
export async function uploadImage(file: File, folder = 'portfolio'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? 'Cloudinary upload failed');
  }
  const data = await res.json();
  return data.secure_url as string;
}

/** Get a Cloudinary optimized image URL with auto format/quality */
export function cloudinaryUrl(publicId: string, opts: { w?: number; h?: number } = {}) {
  const transforms = ['f_auto', 'q_auto'];
  if (opts.w) transforms.push(`w_${opts.w}`);
  if (opts.h) transforms.push(`h_${opts.h}`);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(',')}/${publicId}`;
}
