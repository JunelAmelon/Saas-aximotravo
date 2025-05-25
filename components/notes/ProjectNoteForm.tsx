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
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 max-h-[80vh] overflow-y-auto px-1">
      <div>
        <label className="block text-sm text-gray-700 mb-1">
          Titre de la note <span className="text-gray-400">(facultatif)</span>
        </label>
        <input
          type="text"
          value={note.title}
          onChange={(e) => setNote({ ...note, title: e.target.value })}
          placeholder="Titre = objet du mail"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#f21515] focus:border-[#f21515]"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Description</label>
        <div className="border border-gray-300 rounded-md">
          <div className="border-b border-gray-300 px-3 py-2 flex items-center gap-2">
            <button type="button" className="p-1 hover:bg-gray-100 rounded">B</button>
            <button type="button" className="p-1 hover:bg-gray-100 rounded italic">I</button>
            <button type="button" className="p-1 hover:bg-gray-100 rounded underline">S</button>
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
            value={note.content}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
            placeholder="Corps du texte de la note"
            rows={4}
            className="w-full px-3 py-2 text-sm focus:ring-[#f21515] focus:border-[#f21515] border-0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-2">Ajouter des pièces jointes</label>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
        >
          <Upload className="h-4 w-4 mr-2" />
          Télécharger image(s)
        </button>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-2">Envoyer cette note par mail</label>
        <div className="space-y-2">
          <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={note.notifyClient}
                onChange={(e) => setNote({ ...note, notifyClient: e.target.checked })}
                className="rounded border-gray-300 text-[#f21515] focus:ring-[#f21515]"
              />
              <span className="text-sm">Client</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={note.notifyArtisan}
                onChange={(e) => setNote({ ...note, notifyArtisan: e.target.checked })}
                className="rounded border-gray-300 text-[#f21515] focus:ring-[#f21515]"
              />
              <span className="text-sm">Artisan</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={note.notifyPilot}
                onChange={(e) => setNote({ ...note, notifyPilot: e.target.checked })}
                className="rounded border-gray-300 text-[#f21515] focus:ring-[#f21515]"
              />
              <span className="text-sm">Pilote</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={note.notifyVendor}
                onChange={(e) => setNote({ ...note, notifyVendor: e.target.checked })}
                className="rounded border-gray-300 text-[#f21515] focus:ring-[#f21515]"
              />
              <span className="text-sm">Vendeur</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Ajouter un email"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#f21515] focus:border-[#f21515]"
            />
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
            >
              Ajouter un email
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 bg-[#f21515] text-white rounded-md text-sm font-medium hover:bg-[#f21515]/90 transition-colors"
        >
          <Send className="h-4 w-4 mr-2" />
          Enregistrer
        </button>
      </div>
    </form>
  );
}