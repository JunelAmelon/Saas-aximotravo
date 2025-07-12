'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProjectMedia, ProjectMedia, addMedia } from '@/hooks/useProjectMedia';
import { CLOUDINARY_UPLOAD_PRESET } from '@/lib/cloudinary';
import { Search, Filter, Upload, X } from 'lucide-react';
import Image from 'next/image';
import MediaCard from './MediaCard';
import MediaCommentsModal from './MediaCommentsModal';
import AddCommentModal from './AddCommentModal';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/lib/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function ProjectPhotos() {
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role?.toLowerCase() || null);
        }
      }
    };
    fetchRole();
  }, [currentUser]);

  useEffect(() => {
    if (!showFilterMenu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) setShowFilterMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showFilterMenu]);

  const [selectedPhoto, setSelectedPhoto] = useState<ProjectMedia | null>(null);
  const [addCommentModalOpen, setAddCommentModalOpen] = useState(false);
  const [addCommentMedia, setAddCommentMedia] = useState<ProjectMedia | null>(null);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [commentsMedia, setCommentsMedia] = useState<ProjectMedia | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [mediaForm, setMediaForm] = useState<{ 
    title: string; 
    tag: string; 
    customTag?: string; 
    date: string; 
    file: File | null 
  }>({ 
    title: '', 
    tag: '', 
    customTag: '', 
    date: '', 
    file: null 
  });
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const params = useParams() ?? {};
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  const [photos, setPhotos] = useState<ProjectMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        if (isMounted) setError(`Erreur lors du chargement des médias: ${e}`);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [projectId, addOpen]);

  const categories = [
    'Photos RT',
    'Photos chantier',
    'Plans',
    'Documents',
    'Autre',
    ...Array.from(new Set(
      photos
        .map(photo => photo.tag)
        .filter(tag => !['Photos RT', 'Photos chantier', 'Plans', 'Documents', 'Autre'].includes(tag))
    ))
  ];
  

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(photo.tag);
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="flex justify-center items-center h-64">Chargement...</div>;
  if (error) return <div className="text-red-600 p-4">Erreur : {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col w-full mb-6 gap-2">
        <h2 className="text-xl font-bold text-center text-gray-900 w-full mb-2">Médiathèque</h2>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4 w-full">
          <button
            onClick={() => window.history.back()}
            type="button"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-200 transition text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Retour
          </button>
          {userRole !== 'admin' && (
            <button
              onClick={() => setAddOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-3 bg-[#f26755] text-white rounded-md text-base font-semibold hover:bg-[#f26755]/90 transition-colors mb-1 sm:mb-0"
            >
              <Upload className="h-5 w-5 mr-2" />
              Ajouter une photo
            </button>
          )}
        </div>
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
            <div className="relative">
              <button
                className="w-full sm:w-48 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#f21515] flex items-center justify-between"
                type="button"
                onClick={() => setShowFilterMenu((v) => !v)}
                aria-label="Filtrer les médias"
              >
                <Filter className="h-4 w-4 mr-2" />
                <span>Filtrer</span>
              </button>
              {showFilterMenu && (
                <div className="absolute left-0 mt-2 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[180px] max-h-64 overflow-auto" onClick={e => e.stopPropagation()}>
                  {categories.map(tag => (
                    <label key={tag} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(tag)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, tag]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(t => t !== tag));
                          }
                        }}
                        className="h-4 w-4 text-[#f26755] focus:ring-[#f26755] border-gray-300 rounded"
                        aria-label={`Filtrer par ${tag}`}
                      />
                      <span className="text-sm text-gray-700">{tag}</span>
                    </label>
                  ))}
                  <button
                    className="mt-2 w-full px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium"
                    onClick={() => setShowFilterMenu(false)}
                    aria-label="Fermer le menu de filtrage"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          </div>

          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
              aria-label="Effacer les filtres"
            >
              <X className="h-4 w-4" />
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun média disponible</h3>
          <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
            {selectedCategories.length > 0 || searchTerm 
              ? "Aucun média ne correspond à vos critères de recherche." 
              : "Ce projet ne contient aucun média pour le moment."}
          </p>
          {userRole !== 'admin' && (
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90"
              aria-label="Ajouter un média"
            >
              <Upload className="h-4 w-4 mr-2" />
              Ajouter un média
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <MediaCard
              key={photo.id}
              media={photo}
              onClick={(media) => setSelectedPhoto(media)}
              onDoubleClick={(media) => {
                setAddCommentMedia(media);
                setAddCommentModalOpen(true);
              }}
              onShowComments={(media) => {
                setCommentsMedia(media);
                setCommentsModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <AddCommentModal open={addCommentModalOpen} onClose={() => setAddCommentModalOpen(false)} media={addCommentMedia} user={null} />
      <MediaCommentsModal open={commentsModalOpen} onClose={() => setCommentsModalOpen(false)} media={commentsMedia} />

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
                  tag: mediaForm.tag === 'autre' ? (mediaForm.customTag || '') : mediaForm.tag,
                });
                setAddOpen(false);
                setMediaForm({ title: '', tag: '', customTag: '', date: '', file: null });
                if (fileInputRef.current) fileInputRef.current.value = '';
              } catch (err: any) {
                setFormError(`Erreur lors de l&apos;ajout du média.`);
              } finally {
                setUploading(false);
              }
            }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold">Ajouter un média</h2>
            {formError && <div className="text-red-600 text-sm">{formError}</div>}
            <div>
              <label htmlFor="media-title" className="block text-sm mb-1">Titre</label>
              <input
                id="media-title"
                type="text"
                className="w-full border rounded px-3 py-2"
                value={mediaForm.title}
                onChange={e => setMediaForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="media-category" className="block text-sm mb-1">Catégorie</label>
              <select
                id="media-category"
                className="w-full border rounded px-3 py-2"
                value={mediaForm.tag}
                onChange={e => {
                  const val = e.target.value;
                  setMediaForm(f => ({ ...f, tag: val }));
                }}
                required
                aria-label="Sélectionner une catégorie"
              >
                <option value="">Sélectionner...</option>
                <option value="Photos RT">Photos RT</option>
                <option value="Photos chantier">Photos chantier</option>
                <option value="Plans">Plans</option>
                <option value="Documents">Documents</option>
                <option value="autre">Autre</option>
              </select>
              {mediaForm.tag === 'autre' && (
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mt-2"
                  value={mediaForm.customTag || ''}
                  onChange={e => setMediaForm(f => ({ ...f, customTag: e.target.value }))}
                  placeholder="Précisez la catégorie"
                  required
                  aria-label="Nom de la catégorie personnalisée"
                />
              )}
            </div>
            <div>
              <label htmlFor="media-date" className="block text-sm mb-1">Date</label>
              <input
                id="media-date"
                type="date"
                className="w-full border rounded px-3 py-2"
                value={mediaForm.date}
                onChange={e => setMediaForm(f => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Photo</label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors cursor-pointer hover:border-[#f21515] bg-gray-50 relative ${mediaForm.file ? 'border-[#f21515]' : 'border-gray-300'}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0] || null;
                  if (file && file.type.startsWith('image/')) {
                    setMediaForm(f => ({ ...f, file }));
                  }
                }}
                onDragOver={e => e.preventDefault()}
                style={{ minHeight: 120 }}
                aria-label="Zone de dépôt pour les fichiers"
              >
                {!mediaForm.file ? (
                  <>
                    <Upload className="h-8 w-8 text-[#f26755] mb-2" />
                    <span className="text-sm text-gray-500 text-center">Cliquez ou glissez une image ici</span>
                  </>
                ) : (
                  <div className="flex flex-col items-center w-full">
                    <Image
                      src={URL.createObjectURL(mediaForm.file)}
                      alt="Aperçu photo"
                      width={100}
                      height={100}
                      className="rounded shadow max-h-32 object-contain mb-2"
                    />
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-gray-700 truncate">{mediaForm.file.name}</span>
                      <button
                        type="button"
                        className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                        onClick={e => {
                          e.stopPropagation();
                          setMediaForm(f => ({ ...f, file: null }));
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        aria-label="Supprimer la sélection"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={e => setMediaForm(f => ({ ...f, file: e.target.files?.[0] || null }))}
                  className="hidden"
                  required
                  aria-label="Sélectionner un fichier"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[#f26755] text-white py-2 rounded font-semibold hover:bg-[#f26755]/90 transition-colors disabled:opacity-60"
              disabled={uploading}
              aria-label={uploading ? 'Ajout en cours' : 'Ajouter le média'}
            >
              {uploading ? 'Ajout en cours...' : 'Ajouter'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}