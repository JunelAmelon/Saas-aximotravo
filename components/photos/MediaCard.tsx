import Image from "next/image";
import { useState } from "react";
import MediaCommentsModal from "./MediaCommentsModal";
// Dummy hook for demonstration, replace with real one if available
import { useMediaComments } from "@/hooks/useMediaComments";

// function useMediaComments(mediaId: string) {
//   // Replace this with real fetching logic
//   return { comments: [], loading: false, error: null };
// }

export default function MediaCard({ media, onClick, onDoubleClick, onShowComments }: { media: any; onClick: (media: any) => void; onDoubleClick: (media: any) => void; onShowComments: (media: any) => void }) {
  const { comments } = useMediaComments(media.id);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 p-3 flex flex-col">
      <div
        className="relative w-full h-40 rounded-lg overflow-hidden mb-3 cursor-pointer group"
        onClick={(e) => {
          if ((window as any)._mediaCardClickTimer) {
            clearTimeout((window as any)._mediaCardClickTimer);
            (window as any)._mediaCardClickTimer = null;
          }
          (window as any)._mediaCardClickTimer = setTimeout(() => {
            onClick(media);
            (window as any)._mediaCardClickTimer = null;
          }, 220);
        }}
        onDoubleClick={(e) => {
          if ((window as any)._mediaCardClickTimer) {
            clearTimeout((window as any)._mediaCardClickTimer);
            (window as any)._mediaCardClickTimer = null;
          }
          e.stopPropagation();
          onDoubleClick(media);
        }}
        title="Clic pour agrandir, double-clic pour commenter"
      >
        <Image src={media.url} alt={media.title} fill className="object-cover group-hover:opacity-80 transition" />
      </div>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1">
          <div className="font-medium text-gray-900 text-sm mb-1">{media.title}</div>
          <div className="text-xs text-gray-500 mb-1">{media.date}</div>
        </div>
        <div className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200">{media.tag}</div>
        {/* Icône message pour afficher les commentaires */}
        {comments && comments.length > 0 && (
          <button
            className="ml-2 flex items-center gap-1 text-amber-700 hover:text-amber-900 focus:outline-none"
            title="Voir les commentaires"
            onClick={() => setCommentsModalOpen(true)}
            type="button"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <span className="text-xs font-semibold">{comments.length}</span>
          </button>
        )}
      </div>
      <MediaCommentsModal open={commentsModalOpen} onClose={() => setCommentsModalOpen(false)} media={media} />
    </div>
  );
}
