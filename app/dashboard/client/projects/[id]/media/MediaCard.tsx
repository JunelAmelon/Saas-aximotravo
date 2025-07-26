import Image from "next/image";
import { useMediaComments } from "@/hooks/media.comments";
import { useState } from "react";
import MediaCommentsModal from "./MediaCommentsModal";
import { MessageSquare } from "lucide-react";

export default function MediaCard({ media, onDoubleClick }: { media: any; onDoubleClick: (media: any) => void }) {
  const { comments } = useMediaComments(media.id);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      {/* Zone image cliquable */}
      <div
        className="relative w-full aspect-square overflow-hidden cursor-pointer"
        onDoubleClick={() => onDoubleClick(media)}
        title="Double-cliquez pour commenter"
      >
        <Image 
          src={media.url} 
          alt={media.title || "Média sans titre"} 
          fill 
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        />
        
        {/* Badge de tag en overlay */}
        {media.tag && (
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white/90 text-gray-800 backdrop-blur-sm">
              {media.tag}
            </span>
          </div>
        )}
      </div>

      {/* Contenu texte */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
            {media.title || "Sans titre"}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {media.date || "Date inconnue"}
          </p>
        </div>

        {/* Bouton commentaires */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCommentsModalOpen(true);
          }}
          className={`mt-auto flex items-center gap-1 text-xs ${
            comments?.length > 0 
              ? "text-orange-600 hover:text-orange-800 font-medium" 
              : "text-gray-400 hover:text-gray-600"
          } transition-colors w-fit`}
          disabled={!comments || comments.length === 0}
          title={comments?.length > 0 ? `Voir les ${comments.length} commentaires` : "Aucun commentaire"}
        >
          <MessageSquare className="w-4 h-4" />
          {comments?.length > 0 && (
            <span>{comments.length}</span>
          )}
        </button>
      </div>

      {/* Modal des commentaires */}
      <MediaCommentsModal 
        open={commentsModalOpen} 
        onClose={() => setCommentsModalOpen(false)} 
        media={media} 
      />
    </div>
  );
}