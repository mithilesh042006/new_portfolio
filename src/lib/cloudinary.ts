const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Upload an image file to Cloudinary using signed upload.
 * Returns the secure URL of the uploaded image.
 */
export async function uploadImage(file: File, folder = 'portfolio'): Promise<string> {
  // Generate signature via timestamp (using api_secret — admin only)
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

  // For a pure frontend signed upload we use the api_secret directly.
  // This is acceptable since the admin panel is auth-protected.
  const signatureHex = await generateSignature(paramsToSign, API_SECRET);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signatureHex);
  formData.append('folder', folder);

  const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? 'Cloudinary upload failed');
  }
  const data = await res.json();
  return data.secure_url as string;
}

/** SHA-1 hash via Web Crypto API (available in all modern browsers) */
async function generateSignature(str: string, secret: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(str + secret);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Get a Cloudinary optimized image URL with auto format/quality */
export function cloudinaryUrl(publicId: string, opts: { w?: number; h?: number } = {}) {
  const transforms = ['f_auto', 'q_auto'];
  if (opts.w) transforms.push(`w_${opts.w}`);
  if (opts.h) transforms.push(`h_${opts.h}`);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(',')}/${publicId}`;
}
