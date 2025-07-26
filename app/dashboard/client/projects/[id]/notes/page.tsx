"use client";
import { useState } from "react";
import { Plus, CheckCircle, XCircle, ChevronLeft, MoreHorizontal, Calendar, User, Mail, Paperclip, Send, Info, FileText, Clock, X } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useNotes } from "@/hooks/notes";
import { useAuth } from "@/hooks/auth";
import { useAcceptedArtisans } from "@/hooks/acceptedArtisans";
import { useEffect, useMemo } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/ClientApp";

export default function ProjectNotesPage() {
  const [showForm, setShowForm] = useState(false);
  type NoteForm = {
    title: string;
    content: string;
    recipients: string[];
    attachments: string[];
    emails: string[];
  };
  const [form, setForm] = useState<NoteForm>({ title: "", content: "", recipients: [], attachments: [], emails: [""] });
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [notif, setNotif] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const router = useRouter();
  
  const params = useParams();
  let projectId = "";
  if (params && "id" in params && params.id) {
    projectId = Array.isArray(params.id) ? params.id[0] : params.id;
  }
  const { notes, loading, error, addNote } = useNotes(projectId);
  const { user } = useAuth();

  const { artisans } = useAcceptedArtisans(projectId);
  const [courtierEmail, setCourtierEmail] = useState<string>("");
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      const snap = await getDoc(doc(db, "projects", projectId));
      if (snap.exists()) {
        setProject(snap.data());
        const brokerField = snap.data().broker;
        let brokerId = "";
        if (typeof brokerField === "string") {
          brokerId = brokerField;
        } else if (brokerField && typeof brokerField.id === "string") {
          brokerId = brokerField.id;
        } else if (brokerField && typeof brokerField.id === "number") {
          brokerId = String(brokerField.id);
        } else if (brokerField) {
          console.warn("Format inattendu pour le champ broker:", brokerField);
        }
        if (brokerId) {
          const brokerSnap = await getDoc(doc(db, "users", brokerId));
          setCourtierEmail(brokerSnap.exists() ? brokerSnap.data()?.email || "" : "");
        } else {
          setCourtierEmail("");
        }
      }
    })();
  }, [projectId]);

  const autoRecipients = useMemo(() => {
    let emails: string[] = [];
    if (form.recipients.includes("Artisan")) {
      emails = emails.concat(artisans.map(a => a.email).filter(Boolean));
    }
    if (form.recipients.includes("Pilote") && courtierEmail) {
      emails.push(courtierEmail);
    }
    return Array.from(new Set(emails));
  }, [form.recipients, artisans, courtierEmail]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm(f => ({ ...f, recipients: checked ? [...f.recipients, value] : f.recipients.filter((r: string) => r !== value) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleEmailChange = (idx: number, value: string) => {
    setForm(f => {
      const emails = [...f.emails];
      emails[idx] = value;
      return { ...f, emails };
    });
  };

  const addEmailField = () => setForm(f => ({ ...f, emails: [...f.emails, ""] }));
  const removeEmailField = (idx: number) => setForm(f => ({ ...f, emails: f.emails.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSending(true);
    try {
      const allRecipients = [
        ...autoRecipients,
        ...form.emails.filter(e => e.trim() !== "")
      ];
      
      let uploadedFiles: string[] = [];
      if (pendingFiles && pendingFiles.length > 0) {
        const { uploadImageToCloudinary, uploadFileToCloudinary } = await import("@/hooks/cloudinary");
        const urls = await Promise.all(pendingFiles.map(async (file) => {
          const isImage = file.type.startsWith("image/");
          try {
            if (isImage) {
              return await uploadImageToCloudinary(file);
            } else {
              return await uploadFileToCloudinary(file);
            }
          } catch {
            return null;
          }
        }));
        uploadedFiles = urls.filter(Boolean) as string[];
      } else if (form.attachments && form.attachments.length > 0) {
        uploadedFiles = [...form.attachments];
      }
      
      if (!projectId) return;
      await addNote({
        projectId: projectId,
        title: form.title,
        content: form.content,
        author: user?.email ?? user?.displayName ?? 'Utilisateur',
        recipients: allRecipients,
        attachments: uploadedFiles,
      });
      
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: allRecipients,
            subject: form.title || "Nouvelle note de projet",
            html: `<div><h2>${form.title || "Note de projet"}</h2><p>${form.content.replace(/\n/g, "<br/>")}</p></div>`,
            ...(uploadedFiles.length > 0 ? { html: `<div><h2>${form.title || "Note de projet"}</h2><p>${form.content.replace(/\n/g, "<br/>")}</p><ul>${uploadedFiles.map(url => `<li><a href='${url}'>Pièce jointe</a></li>`).join("")}</ul></div>` } : {})
          })
        });
      } catch (err) {
        setNotif({ type: "error", message: "Note enregistrée mais erreur lors de l'envoi du mail." });
        return;
      }
      
      setNotif({ type: "success", message: "Note ajoutée et envoyée par mail avec succès !" });
      setShowForm(false);
      setForm({ title: "", content: "", recipients: [], attachments: [], emails: [""] });
      setPendingFiles([]);
    } catch (err) {
      setNotif({ type: "error", message: "Erreur lors de l'ajout de la note." });
    } finally {
      setSending(false);
      setTimeout(() => setNotif(null), 3500);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Clean Header */}
      <header className="bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:h-16 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Retour à la page précédente"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">Retour</span>
              </button>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-[#dd7109]">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Notes du projet</h1>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center space-x-2 px-3 py-2 sm:px-4 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm sm:text-base bg-[#dd7109]"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Nouvelle note</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-8 bg-blue-50 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm text-blue-800">
              <h3 className="font-medium mb-2">À propos des notes de projet</h3>
              <ul className="space-y-1 text-blue-700">
                <li>• Type &quot;fil d&apos;actualité&quot;, le plus récent est en haut</li>
                <li>• Permet de comprendre l&apos;historique complet du projet</li>
                <li>• Notifications automatiques par email aux parties prenantes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900 mb-4"></div>
            <p className="text-gray-500 text-sm">Chargement des notes...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-red-50 rounded-lg p-6 text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Erreur de chargement</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {/* Empty State */}
        {!loading && notes.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune note pour le moment</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Commencez par ajouter votre première note pour documenter l&apos;avancement du projet.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity bg-[#dd7109]"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter la première note</span>
            </button>
          </div>
        )}
        
        {/* Notes List */}
        {!loading && notes.length > 0 && (
          <div className="space-y-6">
            {notes.map((note, index) => (
              <article 
                key={note.id}
                className="bg-white rounded-lg p-6 transition-colors group hover:bg-[#fef7f0]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#dd7109]">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {note.title || <span className="italic text-gray-500">Note sans titre</span>}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{note.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{note.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Plus d'options"
                    aria-label="Option de la note"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{note.content}</p>
                </div>
                
                {note.attachments && note.attachments.length > 0 && (
                  <div className="mb-4 p-3 rounded-lg border border-orange-100 bg-[#fef7f0]">
                    <h4 className="text-xs font-medium mb-2 flex items-center space-x-1 text-[#dd7109]">
                      <Paperclip className="w-3 h-3" />
                      <span>Pièces jointes ({note.attachments.length})</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {note.attachments.map((file: string, idx: number) => (
                        <a
                          key={idx}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 bg-white text-gray-700 rounded-md text-xs hover:bg-[#fef7f0] transition-colors border border-orange-200"
                        >
                          <Paperclip className="w-2 h-2 mr-1 text-[#dd7109]" />
                          <span className="truncate">Fichier {idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                {note.recipients && note.recipients.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Mail className="w-4 h-4" />
                      <span>
                        Envoyé à {note.recipients.length} destinataire{note.recipients.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Notification Toast */}
      {notif && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg max-w-md ${
            notif.type === "success" 
              ? "bg-green-50 text-green-800" 
              : "bg-red-50 text-red-800"
          }`}>
            {notif.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{notif.message}</span>
          </div>
        </div>
      )}

      {/* Side Drawer Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-black bg-opacity-25" 
            onClick={() => setShowForm(false)}
          ></div>
          
          <div className="relative bg-white w-full max-w-lg h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#dd7109]">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Nouvelle note</h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la note
                </label>
                <input
                  id="note-title"
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dd7109] focus:border-[#dd7109]"
                  placeholder="Titre = objet du mail"
                  autoFocus
                />
              </div>
              
              <div>
                <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="note-content"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dd7109] focus:border-[#dd7109] resize-none"
                  placeholder="Corps du texte de la note"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="note-files" className="block text-sm font-medium text-gray-700 mb-2">
                  Pièces jointes
                </label>
                <div className="relative">
                  <input
                    id="note-files"
                    type="file"
                    multiple
                    onChange={e => e.target.files && setPendingFiles(Array.from(e.target.files))}
                    className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:rounded-l-lg file:text-sm file:font-medium file:text-white file:transition-all file:duration-200 file:bg-[#dd7109] file:hover:bg-[#c46208]"
                  />
                </div>
                {pendingFiles.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg border border-orange-100 bg-[#fef7f0]">
                    <p className="text-sm font-medium text-gray-700 mb-2">Fichiers sélectionnés :</p>
                    <div className="space-y-2">
                      {pendingFiles.map((file, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-center space-x-2 p-2 bg-white rounded-md border border-orange-200">
                          <Paperclip className="w-3 h-3 text-[#dd7109]" />
                          <span className="truncate font-medium">{file.name}</span>
                          <span className="text-gray-400 text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Envoyer cette note par mail à :
                </label>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {['Artisan', 'Pilote', 'Vendeur'].map((recipient) => (
                      <label key={recipient} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          name="recipients"
                          value={recipient}
                          checked={form.recipients.includes(recipient)}
                          onChange={handleChange}
                          className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-[#dd7109]"
                        />
                        <span className="text-sm font-medium text-gray-700">{recipient}s</span>
                      </label>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-600">
                      Emails supplémentaires
                    </label>
                    {form.emails.map((email, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => handleEmailChange(idx, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dd7109] focus:border-[#dd7109]"
                          placeholder="email@example.com"
                          aria-label={`Email ${idx + 1}`}
                        />
                        {form.emails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEmailField(idx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer cet email"
                            aria-label="Supprimer cet email"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {idx === form.emails.length - 1 && (
                          <button
                            type="button"
                            onClick={addEmailField}
                            className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-[#dd7109]"
                            title="Ajouter un email"
                            aria-label="Ajouter un email"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center space-x-2 px-6 py-2 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#dd7109] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-[#dd7109] hover:bg-[#c46208]"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Envoi...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Ajouter la note</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}