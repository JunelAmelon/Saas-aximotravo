import { useState, useEffect } from "react";
import Image from "next/image";
import { addMediaComment } from "@/hooks/useMediaComments";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getUserById } from "@/lib/firebase/users";

export default function AddCommentModal({ open, onClose, media, user }: {
  open: boolean;
  onClose: () => void;
  media: any;
  user?: { displayName?: string; email?: string; firstName?: string; lastName?: string } | null;
}) {
  const { currentUser } = useAuth();
  const [dbUser, setDbUser] = useState<any>(null);
  useEffect(() => {
    if (currentUser?.uid) {
      getUserById(currentUser.uid).then(setDbUser).catch(() => setDbUser(null));
    } else {
      setDbUser(null);
    }
  }, [currentUser]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  if (!open || !media) return null;

  const author = dbUser?.displayName || `${dbUser?.firstName ?? ''} ${dbUser?.lastName ?? ''}`.trim() || dbUser?.email || "Anonyme";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!comment.trim()) {
      setError("Le commentaire ne peut pas être vide.");
      return;
    }
    setSending(true);
    try {
      await addMediaComment(media.id, { text: comment, author });
      setNotif("Commentaire ajouté avec succès !");
      setComment("");
      setTimeout(() => {
        setNotif(null);
        onClose();
      }, 1200);
    } catch (err) {
      setError("Erreur lors de l'envoi du commentaire.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed z-50 inset-0 bg-black/30 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px] max-w-[90vw] relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose} aria-label="Fermer">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        <h3 className="text-lg font-semibold mb-2">Commenter le média</h3>
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            className="border border-amber-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#f26755]/50 focus:border-[#f26755] transition min-h-[60px]"
            placeholder="Écrire un commentaire..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={sending}
            required
          />
          {error && <div className="text-red-500 text-xs">{error}</div>}
          <div className="flex gap-2 justify-end mt-2">
            <button type="button" className="px-4 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={onClose} disabled={sending}>Annuler</button>
            <button type="submit" className="px-4 py-1 rounded bg-[#f26755] text-white font-semibold hover:bg-amber-600 disabled:opacity-60" disabled={sending}>{sending ? "Envoi..." : "Commenter"}</button>
          </div>
        </form>
        {notif && (
          <div className="mt-2 px-3 py-2 rounded bg-green-100 text-green-800 text-sm text-center">{notif}</div>
        )}
      </div>
    </div>
  );
}
