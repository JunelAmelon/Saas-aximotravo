'use client';

import { useState } from "react";
import { useProjectNotes, ProjectNote } from "@/hooks/useProjectNotes";
import { Info, Paperclip, Send, Upload, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ProjectNoteForm from "./ProjectNoteForm";
import { useParams } from "next/navigation";

// Mode lecture seule pour l'admin
const readonly = true;

export default function ProjectNotes() {
  const params = useParams() ?? {};
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const { notes, loading, error, addNote } = useProjectNotes(projectId);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-between w-full mb-2">
        <div className="flex items-center flex-shrink-0">
          <button
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#f26755] to-[#f26755] text-white rounded-lg font-semibold shadow hover:opacity-90 transition"
            onClick={() => window.history.back()}
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Retour
          </button>
        </div>
        <h2 className="text-lg font-medium text-gray-900 flex-1 text-center min-w-[160px] truncate order-2 sm:order-none">Notes du projet</h2>
        {/* Bouton d'ajout masqué en mode readonly */}
        {!readonly && (
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={() => setIsAddNoteOpen(true)}
              className={`inline-flex items-center px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors${readonly ? ' hidden' : ''}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une note
            </button>
          </div>
        )}
      </div>
      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="mb-1">- type &quot;fil d&apos;actualité&quot;, le plus récent est en haut</p>
            <p>- permet de comprendre l&apos;historique d&apos;un projet</p>
          </div>
        </div>
      </div>

      {/* Notes Timeline */}
      <div className="space-y-4">
        {loading && <div className="text-sm text-gray-400">Chargement des notes…</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}
        {notes.map((note) => (
          <div key={note.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {/* Affiche la date formatée (string Firestore ou Date JS) */}
                  {note.date ? note.date : note.timestamp?.toDate ? format(note.timestamp.toDate(), "dd/MM/yyyy 'à' HH:mm", { locale: fr }) : ''}
                </p>
                <h3 className="font-medium mt-1">{note.title}</h3>
                <p className="text-sm mt-2">{note.content}</p>
                {note.attachments && note.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {note.attachments.map((att, idx) => (
                      <a key={att} href={att} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-blue-600 hover:underline">
                        <Paperclip className="h-4 w-4 mr-1" /> Pièce jointe {idx + 1}
                      </a>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Par <span className="font-medium">{note.author}</span>
                  {note.recipients && note.recipients.length > 0 && (
                    <> — Envoyé à {note.recipients.join(", ")}</>
                  )}
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">•••</button>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <SheetContent side="right" className="w-[500px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Ajouter une note</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ProjectNoteForm onClose={() => setIsAddNoteOpen(false)} onAddNote={addNote ?? (async () => { })} projectId={projectId} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}