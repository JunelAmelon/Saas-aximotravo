'use client';

import { useState } from "react";
import { Info, Paperclip, Send, Upload, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ProjectNoteForm from "./ProjectNoteForm";

interface Note {
  id: string;
  title: string;
  content: string;
  date: Date;
  author: string;
  sentTo: string[];
  attachments?: string[];
}

export default function ProjectNotes() {
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Info",
      content: "test",
      date: new Date("2025-03-01T11:10:00"),
      author: "Junel",
      sentTo: ["junel@aximotravo.fr"],
    },
    {
      id: "2",
      title: "Objet",
      content: "ceci est important",
      date: new Date("2025-03-01T10:30:00"),
      author: "Junel",
      sentTo: ["junel@aximotravo.fr"],
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Notes du projet</h2>
        <button 
          onClick={() => setIsAddNoteOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une note
        </button>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="mb-1">- type "fil d'actualité", le plus récent est en haut</p>
            <p>- permet de comprendre l'historique d'un projet</p>
          </div>
        </div>
      </div>

      {/* Notes Timeline */}
      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {format(note.date, "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                </p>
                <h3 className="font-medium mt-1">{note.title}</h3>
                <p className="text-sm mt-2">{note.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Envoyé par mail à {note.author}: {note.sentTo.join(", ")}
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
            <ProjectNoteForm onClose={() => setIsAddNoteOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}