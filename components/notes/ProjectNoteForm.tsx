'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Upload } from 'lucide-react';

import { ProjectNote } from "@/hooks/useProjectNotes";
import { useAuth } from "@/lib/contexts/AuthContext";
import { CLOUDINARY_UPLOAD_PRESET } from '@/lib/cloudinary';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;
import { fetchProjectEmails } from '@/lib/projectEmails';

interface ProjectNoteFormProps {
  onClose?: () => void;
  onAddNote?: (note: Omit<ProjectNote, 'id' | 'date' | 'timestamp'>) => Promise<void>;
  projectId?: string;
}

// Fonction d'envoi d'email 
async function sendNoteEmail({ to, subject, html }: { to: string[]; subject: string; html: string }) {
  // Appel l'API d'envoi d'email
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html })
  });
}

export default function ProjectNoteForm({ onClose, onAddNote, projectId }: ProjectNoteFormProps) {
  const [note, setNote] = useState({
    title: '',
    content: '',
    notifyClient: false,
    notifyArtisan: false,
    notifyPilot: false,
    notifyVendor: false,
    emails: [] as string[],
    attachments: [] as string[],
  });
  // State pour l'input email additionnel
  const [additionalEmail, setAdditionalEmail] = useState('');

  // Gestion des emails associés au projet
  const [projectEmails, setProjectEmails] = useState<{client?: string, artisans?: string[], courtier?: string, vendor?: string}>({});
  const [projectName, setProjectName] = useState<string>('Projet');
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setEmailsLoading(true);
    setEmailsError(null);
    fetchProjectEmails(projectId)
      .then((emails) => {
        setProjectEmails(emails);
      })
      .catch((err: any) => setEmailsError(err.message || 'Erreur lors de la récupération des emails'))
      .finally(() => setEmailsLoading(false));
  }, [projectId]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();

  // Log dynamique des emails sélectionnés à chaque changement de case
  useEffect(() => {
    const checkedEmails: string[] = [];
    if (note.notifyClient) checkedEmails.push(projectEmails.client || '');
    if (note.notifyArtisan && projectEmails.artisans) checkedEmails.push(...projectEmails.artisans);
    if (note.notifyPilot) checkedEmails.push(projectEmails.courtier || '');
    if (note.notifyVendor) checkedEmails.push(projectEmails.vendor || '');
    const filteredCheckedEmails = checkedEmails.filter(email => !!email);
    console.log('Emails sélectionnés (cases cochées):', filteredCheckedEmails);
  }, [note.notifyClient, note.notifyArtisan, note.notifyPilot, note.notifyVendor, projectEmails]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);
  try {
    let uploadedUrls: string[] = [];
    if (files.length > 0) {
      for (const file of files) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET as string);
        const res = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: "POST",
          body: data
        });
        if (!res.ok) {
          throw new Error("Erreur lors de l'upload du fichier.");
        }
        const result = await res.json();
        if (result.secure_url) {
          uploadedUrls.push(result.secure_url);
        }
      }
    }
    if (!projectId) {
      setError("Impossible d'ajouter la note : projectId manquant.");
      setLoading(false);
      return;
    }
    // Récupère les emails cochés
    const checkedEmails: string[] = [];
    if (note.notifyClient) checkedEmails.push(projectEmails.client || '');
    if (note.notifyArtisan && projectEmails.artisans) checkedEmails.push(...projectEmails.artisans);
    if (note.notifyPilot) checkedEmails.push(projectEmails.courtier || '');
    if (note.notifyVendor) checkedEmails.push(projectEmails.vendor || '');
    // Filtre les emails vides ou non définis
    const filteredCheckedEmails = checkedEmails.filter(email => !!email);
    // Ajoute les emails saisis manuellement
    const recipients: string[] = [...filteredCheckedEmails, ...(note.emails || []).filter(Boolean)];
    console.log('Emails récupérés pour envoi :', recipients);
    // Prépare l'auteur
    const author = currentUser?.displayName || currentUser?.email || 'Utilisateur inconnu';
    // Envoi du mail si des destinataires sont présents
    if (recipients.length > 0) {
      const now = new Date().toLocaleString();
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f26755; margin-bottom: 0.5em;">Nouvelle note ajoutée au projet</h2>
          <div style="font-size: 1em; color: #333; margin-bottom: 1em;">
            Une note intitulée <strong>"${note.title || 'Note de projet'}"</strong> vient d'être ajoutée.<br/>
            <strong>Projet :</strong> ${projectName}<br/>
            <strong>Auteur :</strong> ${author}<br/>
            <strong>Date :</strong> ${now}
          </div>
          <div style="margin-top: 1em;">${note.content}</div>
        </div>
      `;
      await sendNoteEmail({
        to: recipients,
        subject: note.title || 'Nouvelle note de projet',
        html: htmlContent
      });
    }
    const noteToAdd = {
      projectId,
      title: note.title,
      content: note.content,
      author,
      recipients,
      attachments: uploadedUrls,
    };
    await onAddNote?.(noteToAdd);
    onClose?.();
  } catch (err: any) {
    console.error('Erreur détaillée:', err);
    setError("Erreur lors de l'ajout de la note: " + (err.message || ''));
  } finally {
    setLoading(false);
  }
};


  if (emailsLoading) {
    return <div className="py-8 text-center text-gray-500">Chargement des emails associés au projet...</div>;
  }
  if (emailsError) {
    return <div className="py-8 text-center text-red-500">{emailsError}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 max-h-[80vh] overflow-y-auto px-1 w-full">
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
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
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          aria-label="Télécharger des fichiers"
        />
        {files.length > 0 && (
          <ul className="mt-2 text-xs text-gray-600 space-y-1">
            {files.map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
        )}
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
              value={additionalEmail}
              onChange={e => setAdditionalEmail(e.target.value)}
              placeholder="Ajouter un email"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#f26755] focus:border-[#f26755]"
              aria-label="Adresse email additionnelle"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (additionalEmail && !note.emails.includes(additionalEmail)) {
                    setNote(n => ({ ...n, emails: [...n.emails, additionalEmail] }));
                    setAdditionalEmail('');
                  }
                }
              }}
            />
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              aria-label="Ajouter cette adresse email"
              title="Ajouter cette adresse email"
              onClick={() => {
                if (additionalEmail && !note.emails.includes(additionalEmail)) {
                  setNote(n => ({ ...n, emails: [...n.emails, additionalEmail] }));
                  setAdditionalEmail('');
                }
              }}
            >
              Ajouter un email
            </button>
          </div>
          {note.emails.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {note.emails.map((email, idx) => (
                <span key={email} className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
                  {email}
                  <button
                    type="button"
                    className="ml-1 text-red-500 hover:text-red-700"
                    aria-label={`Supprimer ${email}`}
                    title={`Supprimer ${email}`}
                    onClick={() => setNote(n => ({ ...n, emails: n.emails.filter(e => e !== email) }))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {emailsLoading && <div className="text-sm text-gray-500 mt-2">Chargement des emails du projet...</div>}
          {emailsError && typeof emailsError === 'string' && (
            <div className="text-sm text-red-500 mt-2">{emailsError}</div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors disabled:opacity-50"
          aria-label="Enregistrer la note"
          title="Enregistrer la note"
          disabled={loading}
        >
          {loading ? (
            <span className="loader mr-2"></span>
          ) : (
            <Send className="h-4 w-4 mr-2" aria-hidden="true" />
          )}
          Enregistrer
        </button>
      </div>
    </form>
  );
}