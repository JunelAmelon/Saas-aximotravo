'use client';

import { useState } from 'react';
import { Send, Upload } from 'lucide-react';

interface ProjectNoteFormProps {
  onClose?: () => void;
}

export default function ProjectNoteForm({ onClose }: ProjectNoteFormProps) {
  const [note, setNote] = useState({
    title: '',
    content: '',
    notifyClient: false,
    notifyArtisan: false,
    notifyPilot: false,
    notifyVendor: false,
    emails: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Note submitted:', note);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 max-h-[80vh] overflow-y-auto px-1 w-full">
      <div>
        <label htmlFor="note-title" className="block text-sm text-gray-700 mb-1">
          Titre de la note <span className="text-gray-400">(facultatif)</span>
        </label>
        <input
          id="note-title"
          type="text"
          value={note.title}
          onChange={(e) => setNote({ ...note, title: e.target.value })}
          placeholder="Titre = objet du mail"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#f26755] focus:border-[#f26755]"
          aria-label="Titre de la note"
        />
      </div>

      <div>
        <label htmlFor="note-content" className="block text-sm text-gray-700 mb-1">Description</label>
        <div className="border border-gray-300 rounded-md">
          <div className="border-b border-gray-300 px-2 py-2 flex flex-wrap items-center gap-2">
            <button type="button" className="p-1 hover:bg-gray-100 rounded" title="Gras" aria-label="Mettre en gras">B</button>
            <button type="button" className="p-1 hover:bg-gray-100 rounded italic" title="Italique" aria-label="Mettre en italique">I</button>
            <button type="button" className="p-1 hover:bg-gray-100 rounded underline" title="Souligner" aria-label="Souligner">S</button>
            <select 
              className="text-sm border-0 bg-transparent"
              title="Style de texte"
              aria-label="Choisir le style de texte"
              id="text-style"
              name="text-style"
            >
              <option>Normal</option>
            </select>
          </div>
          <textarea
            id="note-content"
            value={note.content}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
            placeholder="Corps du texte de la note"
            rows={4}
            className="w-full px-3 py-2 text-sm focus:ring-[#f26755] focus:border-[#f26755] border-0"
            aria-label="Contenu de la note"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-2">Ajouter des pièces jointes</label>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          title="Télécharger des images"
          aria-label="Télécharger des images"
        >
          <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
          Télécharger image(s)
        </button>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-2">Envoyer cette note par mail</label>
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:flex md:flex-wrap md:items-center gap-3 md:gap-4">
            <label className="flex items-center gap-2">
              <input
                id="notify-client"
                type="checkbox"
                checked={note.notifyClient}
                onChange={(e) => setNote({ ...note, notifyClient: e.target.checked })}
                className="rounded border-gray-300 text-[#f26755] focus:ring-[#f26755]"
                aria-label="Notifier le client"
              />
              <span className="text-sm">Client</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                id="notify-artisan"
                type="checkbox"
                checked={note.notifyArtisan}
                onChange={(e) => setNote({ ...note, notifyArtisan: e.target.checked })}
                className="rounded border-gray-300 text-[#f26755] focus:ring-[#f26755]"
                aria-label="Notifier l'artisan"
              />
              <span className="text-sm">Artisan</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                id="notify-pilot"
                type="checkbox"
                checked={note.notifyPilot}
                onChange={(e) => setNote({ ...note, notifyPilot: e.target.checked })}
                className="rounded border-gray-300 text-[#f26755] focus:ring-[#f26755]"
                aria-label="Notifier le pilote"
              />
              <span className="text-sm">Pilote</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                id="notify-vendor"
                type="checkbox"
                checked={note.notifyVendor}
                onChange={(e) => setNote({ ...note, notifyVendor: e.target.checked })}
                className="rounded border-gray-300 text-[#f26755] focus:ring-[#f26755]"
                aria-label="Notifier le vendeur"
              />
              <span className="text-sm">Vendeur</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <input
              id="additional-email"
              type="email"
              placeholder="Ajouter un email"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#f26755] focus:border-[#f26755]"
              aria-label="Adresse email additionnelle"
            />
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              aria-label="Ajouter cette adresse email"
              title="Ajouter cette adresse email"
            >
              Ajouter un email
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors"
          aria-label="Enregistrer la note"
          title="Enregistrer la note"
        >
          <Send className="h-4 w-4 mr-2" aria-hidden="true" />
          Enregistrer
        </button>
      </div>
    </form>
  );
}