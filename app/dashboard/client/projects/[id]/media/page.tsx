"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMedia } from "@/hooks/media";
import { addMediaComment } from "@/hooks/media.comments";
import { useAuth } from "@/hooks/auth";
import { useSettings } from "@/hooks/settings";
import MediaCard from "./MediaCard";
import { ChevronLeft, Search, X, Filter, CheckCircle, XCircle, GalleryHorizontal } from "lucide-react";

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed z-50 inset-0 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" 
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function ProjectMediaPage() {
  const [search, setSearch] = useState("");
  const params = useParams();
  const router = useRouter();
  
  const projectId = params?.id 
    ? Array.isArray(params.id) 
      ? params.id[0] 
      : params.id
    : "";

  const { media, loading, error } = useMedia(projectId);
  const filteredMedias = media.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.tag.toLowerCase().includes(search.toLowerCase())
  );

  // Comment modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [sending, setSending] = useState(false);
  const [notif, setNotif] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { user } = useAuth();
  const { profile, fetchProfile } = useSettings(user?.uid ?? "");
  
  useEffect(() => {
    if (user?.uid) fetchProfile();
  }, [user?.uid, fetchProfile]);

  const handleDoubleClick = (media: any) => {
    setSelectedMedia(media);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMedia(null);
    setComment("");
    setCommentError("");
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError("");
    
    if (!comment.trim()) {
      setCommentError("Le commentaire ne peut pas être vide.");
      return;
    }
    
    if (!selectedMedia?.id) {
      setCommentError("Aucun média sélectionné.");
      return;
    }
    
    if (!user) {
      setCommentError("Vous devez être connecté pour commenter.");
      return;
    }

    setSending(true);
    try {
      await addMediaComment(selectedMedia.id, {
        text: comment,
        author: user.displayName || `${profile.firstName} ${profile.lastName}` || user.email || "Anonyme",
      });
      setNotif({ type: "success", message: "Commentaire ajouté avec succès !" });
      setModalOpen(false);
    } catch (err) {
      setNotif({ type: "error", message: "Erreur lors de l'envoi du commentaire." });
    } finally {
      setSending(false);
      setTimeout(() => setNotif(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8">
      {/* Header avec titre aligné à droite */}
<header className="bg-white sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:h-16 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Retour à la page précédente"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Retour</span>
            </button>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-[#dd7109]">
                <GalleryHorizontal className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Médiathèque</h1>
            </div>
          </div>
        </div>
      </div>
  </header>

      {/* Barre de recherche ET bouton filtre côte à côte */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher des médias..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
          <Filter className="w-4 h-4" />
          Filtrer
        </button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-8 text-red-500">
            {error}
          </div>
        ) : filteredMedias.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Aucun média trouvé pour ce projet.
          </div>
        ) : (
          filteredMedias.map(media => (
            <MediaCard 
              key={media.id} 
              media={media} 
              onDoubleClick={handleDoubleClick} 
            />
          ))
        )}
      </div>

      {/* Comment Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            {selectedMedia?.url && (
              <div className="w-16 h-16 relative rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={selectedMedia.url}
                  alt={selectedMedia.title || "Média"}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {selectedMedia?.title || "Sans titre"}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedMedia?.date || "Date inconnue"}
              </p>
            </div>
          </div>

          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Ajouter un commentaire
              </label>
              <textarea
                id="comment"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Votre commentaire..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={sending}
              />
              {commentError && (
                <p className="mt-1 text-sm text-red-600">{commentError}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={sending}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70"
                disabled={sending}
              >
                {sending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi...
                  </span>
                ) : (
                  "Envoyer"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Notification */}
      {notif && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-lg flex items-center gap-2 ${
          notif.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white`}>
          {notif.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span>{notif.message}</span>
        </div>
      )}
    </div>
  );
}