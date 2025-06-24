import { useState } from "react";
import Image from "next/image";
import { useMediaComments, addMediaComment } from '@/hooks/useMediaComments';

export default function MediaCommentsModal({ open, onClose, media }: { open: boolean; onClose: () => void; media: any }) {
  const { comments, loading, error } = useMediaComments(media?.id || "");
  const [newComment, setNewComment] = useState('');

  // À remplacer par l'utilisateur courant si disponible
  const author = "Anonyme";

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addMediaComment(media.id, { text: newComment, author });
    setNewComment('');
  };


  if (!open) return null;
  return (
    <div className="fixed z-50 inset-0 bg-black/30 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px] max-w-[95vw] relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose} aria-label="Fermer">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        <h3 className="text-lg font-semibold mb-2">Commentaires</h3>
        {media && (
          <div className="mb-3 flex gap-3 items-center">
            <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0">
              <Image src={media.url} alt={media.title} fill className="object-cover" />
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">{media.title}</div>
              <div className="text-xs text-gray-500">{media.date}</div>
            </div>
          </div>
        )}
        {loading ? (
          <div className="text-center text-gray-400 py-4">Chargement des commentaires...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-400 py-4">Aucun commentaire pour ce média.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {comments.map((c: any) => (
              <li key={c.id} className="py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800 text-sm">{c.author}</span>
                  <span className="text-xs text-gray-400">{c.date ? new Date(c.date).toLocaleString() : ""}</span>
                </div>
                <div className="text-gray-700 text-sm whitespace-pre-line">{c.text}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
