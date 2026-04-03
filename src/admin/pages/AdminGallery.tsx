import { useState, useEffect } from 'react';
import { Trash2, Upload, Plus, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { watchGalleryImages, addGalleryImage, deleteGalleryImage, type GalleryImage } from '../../lib/firestore';
import { uploadImage } from '../../lib/cloudinary';

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsub = watchGalleryImages((data) => {
      setImages(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'gallery');
      await addGalleryImage({ url, alt: file.name.replace(/\.[^.]+$/, '') });
      toast.success('Image added to gallery!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this image from the gallery?')) return;
    try {
      await deleteGalleryImage(id);
      toast.success('Image removed');
    } catch {
      toast.error('Failed to delete');
    }
  }

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Achievement Gallery</h1>
          <p className="text-gray-500 text-sm mt-1">Images shown in the 3D scroll section on the homepage</p>
        </div>

        <label className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
          uploading
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
            : 'bg-white text-black hover:bg-gray-100'
        }`}>
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-500 border-t-gray-300 rounded-full animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Image
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-600">
          <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg mb-2">No gallery images yet</p>
          <p className="text-sm opacity-60">Upload images to display them in the 3D scroll section</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group relative rounded-xl overflow-hidden aspect-square bg-gray-900 border border-gray-800">
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-end p-3">
                <div className="w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                  <p className="text-xs text-gray-300 truncate mb-2">{img.alt}</p>
                  <button
                    onClick={() => handleDelete(img.id!)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/90 hover:bg-red-500 text-white text-xs rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Upload tile */}
          <label className={`aspect-square rounded-xl border-2 border-dashed border-gray-700 hover:border-gray-500 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="w-8 h-8 text-gray-600" />
            <span className="text-xs text-gray-600">Upload</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      )}
    </div>
  );
}
