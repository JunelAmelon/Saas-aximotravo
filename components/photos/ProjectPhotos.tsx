'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProjectMedia, ProjectMedia, addMedia } from '@/hooks/useProjectMedia';
import { CLOUDINARY_UPLOAD_PRESET } from '@/lib/cloudinary';
import { Search, Filter, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent } from "@/components/ui/dialog";

// On utilise ProjectMedia du hook

export default function ProjectPhotos() {
  const [addOpen, setAddOpen] = useState(false);
  const [mediaForm, setMediaForm] = useState({ title: '', tag: '', date: '', file: null as File | null });
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Récupération du projectId depuis l'URL
  const params = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id as string;
  const [photos, setPhotos] = useState<ProjectMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chargement des médias avec useEffect
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    let isMounted = true;
    (async () => {
      try {
        const { fetchProjectMedia } = await import('@/hooks/useProjectMedia');
        const mediaList = await fetchProjectMedia(projectId);
        if (isMounted) setPhotos(mediaList);
      } catch (e) {
        if (isMounted) setError('Erreur lors du chargement des médias: ' + e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [projectId, addOpen]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  const categories = Array.from(new Set(photos.map(photo => photo.tag)));

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(photo.tag);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#f26755] to-[#f26755] text-white rounded-lg font-semibold shadow hover:opacity-90 transition"
          onClick={() => window.history.back()}
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Retour
        </button>
        <h2 className="text-lg font-medium text-gray-900">Médiathèque</h2>
        <button
          className="inline-flex items-center px-4 py-2 bg-[#f21515] text-white rounded-md text-sm font-medium hover:bg-[#f21515]/90 transition-colors"
          onClick={() => setAddOpen(true)}
          type="button"
        >
          <Upload className="h-4 w-4 mr-2" />
          Ajouter des médias
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-[32rem] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher des médias..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#f21515] focus:border-[#f21515]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <button
              className="w-full sm:w-48 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#f21515] flex items-center justify-between"
            >
              <Filter className="h-4 w-4 mr-2" />
              <span>Filtrer</span>
            </button>
          </div>

          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="group relative bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="relative h-48">
              <Image
                src={photo.url}
                alt={photo.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm">Cliquer pour agrandir</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 truncate">{photo.title}</h3>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">{photo.date}</span>
                <span className="inline-flex px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                  {photo.tag}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedPhoto && (
            <div className="relative aspect-video">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'ajout de média */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setFormError(null);
              setUploading(true);
              try {
                if (!mediaForm.title || !mediaForm.tag || !mediaForm.date || !mediaForm.file) {
                  setFormError('Tous les champs sont obligatoires.');
                  setUploading(false);
                  return;
                }
                // Upload Cloudinary
                const data = new FormData();
                data.append('file', mediaForm.file);
                data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET as string);
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
                const res = await fetch(uploadUrl, {
                  method: 'POST',
                  body: data,
                });
                const result = await res.json();
                if (!result.secure_url) throw new Error('Erreur upload Cloudinary');
                await addMedia({
                  projectId,
                  url: result.secure_url,
                  title: mediaForm.title,
                  date: mediaForm.date,
                  tag: mediaForm.tag,
                });
                setAddOpen(false);
                setMediaForm({ title: '', tag: '', date: '', file: null });
                if (fileInputRef.current) fileInputRef.current.value = '';
              } catch (err: any) {
                setFormError('Erreur lors de l\'ajout du média.');
              } finally {
                setUploading(false);
              }
            }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold">Ajouter un média</h2>
            {formError && <div className="text-red-600 text-sm">{formError}</div>}
            <div>
              <label className="block text-sm mb-1">Titre</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={mediaForm.title}
                onChange={e => setMediaForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Catégorie</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={mediaForm.tag}
                onChange={e => setMediaForm(f => ({ ...f, tag: e.target.value }))}
                placeholder="Photos Chantier, Photos RT, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={mediaForm.date}
                onChange={e => setMediaForm(f => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Fichier image</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={e => setMediaForm(f => ({ ...f, file: e.target.files?.[0] || null }))}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#f21515] text-white py-2 rounded font-semibold hover:bg-[#f21515]/90 transition-colors disabled:opacity-60"
              disabled={uploading}
            >
              {uploading ? 'Ajout en cours...' : 'Ajouter'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}