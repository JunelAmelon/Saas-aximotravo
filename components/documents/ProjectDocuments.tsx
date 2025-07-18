'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchProjectDocuments, addProjectDocument } from '@/hooks/useProjectDocuments';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, Upload, Mail, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/lib/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/' + process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + '/upload';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface Document {
  id: string;
  name: string;
  category: string;
  date: string;
  size: string;
  status: string;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: string;
  required?: boolean;
}

export default function ProjectDocuments() {
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role?.toLowerCase() || null);
        }
      }
    };
    fetchRole();
  }, [currentUser]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [customDocumentType, setCustomDocumentType] = useState("");
  const [montant, setMontant] = useState('');
  const [isNotificationSent, setIsNotificationSent] = useState(false);
  const [uploading, setUploading] = useState(false);

  const params = useParams() ?? {};
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const freshDocs = await fetchProjectDocuments(projectId);
        setDocuments(freshDocs);
      } catch (e) {
        setError('Erreur lors du chargement des documents');
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, isAddDocumentOpen]);

  const [recipients] = useState<Recipient[]>([
    {
      id: "1",
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      role: "Client"
    },
    {
      id: "2",
      name: "Marie Martin",
      email: "marie.martin@example.com",
      role: "Courtier",
      required: true
    },
    {
      id: "3",
      name: "Pierre Durand",
      email: "pierre.durand@example.com",
      role: "Pilote"
    }
  ]);

  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(
    recipients.filter(r => r.required).map(r => r.id)
  );

const [currentPage, setCurrentPage] = useState(1);
const documentsPerPage = 5;
const paginatedDocuments = documents.slice(
  (currentPage - 1) * documentsPerPage,
  currentPage * documentsPerPage
);
const totalPages = Math.ceil(documents.length / documentsPerPage);


  const resetForm = () => {
    setSelectedFile(null);
    setDocumentType('');
    setCustomDocumentType('');
    setMontant('');
    setIsNotificationSent(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (documentType.toLowerCase() === 'devis' && !montant) {
      setError('Le montant est obligatoire pour un devis');
      return;
    }

    if (!selectedFile || !documentType || !projectId) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET || '');

      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Échec de l'upload Cloudinary");

      const data = await res.json();
      const uploadedUrl = data.secure_url;

      const documentData = {
        projectId,
        name: selectedFile.name,
        category: documentType === 'autre' ? customDocumentType : documentType,
        date: new Date().toISOString(),
        size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        status: "en attente" as "en attente" | "signé",
        url: uploadedUrl,
        createdAt: new Date().toISOString(),
        ...(documentType.toLowerCase() === 'devis' && {
          montant: Number(montant),
          devisConfigId: ""
        })
      };

      await addProjectDocument(documentData);

      try {
        const { fetchProjectEmails } = await import('@/lib/projectEmails');
        const emails = await fetchProjectEmails(projectId);
        const recipients: string[] = [];
        if (emails.client) recipients.push(emails.client);
        if (emails.courtier) recipients.push(emails.courtier);
        if (emails.artisans && emails.artisans.length > 0) recipients.push(...emails.artisans);
        if (emails.vendor) recipients.push(emails.vendor);

        if (recipients.length > 0) {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: recipients,
              subject: `Nouveau document ajouté au projet`,
              html: `
                <div style="font-family: Arial, sans-serif; color: #222; max-width: 480px; margin: 0 auto; border: 1px solid #f26755; border-radius: 8px; overflow: hidden;">
                  <div style="background: linear-gradient(90deg, #f26755 0%, #f28c55 100%); padding: 16px 24px;">
                    <h2 style="color: #fff; margin: 0; font-size: 1.3rem; font-weight: bold;">
                      Nouveau document ajouté au projet
                    </h2>
                  </div>
                  <div style="padding: 24px;">
                    <table style="background: #f9f9f9; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; width: 100%; font-size: 1em;">
                      <tr>
                        <td style="padding: 6px 0;"><b>Nom&nbsp;:</b></td>
                        <td style="padding: 6px 0;">${selectedFile.name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;"><b>Type&nbsp;:</b></td>
                        <td style="padding: 6px 0;">${documentType === 'autre' ? customDocumentType : documentType}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;"><b>Date&nbsp;:</b></td>
                        <td style="padding: 6px 0;">${new Date().toLocaleString()}</td>
                      </tr>
                    </table>
                    <p style="color: #f26755; font-size: 0.97em; margin-bottom: 0; margin-top: 18px;">
                      Merci de consulter la plateforme pour accéder au document.
                    </p>
                  </div>
                </div>
              `,
            }),
          });
        }
      } catch (err) {
        console.error('Erreur notification email document :', err);
      }

      setIsNotificationSent(true);
      setTimeout(() => {
        setIsAddDocumentOpen(false);
        resetForm();
      }, 2000);

    } catch (err) {
      setError(`Erreur lors de l'ajout du document: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col w-full mb-6 gap-2">
      <h2 className="text-xl font-bold text-center text-gray-900 w-full mb-2">Documents du projet</h2>
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4 w-full">
        <button
          onClick={() => window.history.back()}
          type="button"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-200 transition text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Retour
        </button>
        {userRole !== 'admin' && (
          <button
            onClick={() => setIsAddDocumentOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-3 bg-[#f26755] text-white rounded-md text-base font-semibold hover:bg-[#f26755]/90 transition-colors mb-1 sm:mb-0"
          >
            <Upload className="h-4 w-4 mr-2" />
            Ajouter un document
          </button>
        )}
      </div>

      {/* Version mobile: affichage en cartes */}
      <div className="block md:hidden space-y-4">
      {paginatedDocuments.map((document) => (
          <div key={document.id} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-900">{document.name}</span>
              </div>
              <button
                className="text-[#f26755] hover:text-[#f26755]/80 p-2"
                title="Télécharger le document"
                aria-label="Télécharger le document"
              >
                <Download className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-500 font-medium">CATÉGORIE</p>
                <p className="text-gray-700">{document.category}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">DATE</p>
                <p className="text-gray-700">{document.date}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Taille</p>
                <p className="text-gray-700">{document.size}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Statut</p>
                <span className={`px-2 py-1 inline-flex text-xs leading-none font-semibold rounded-full ${document.status === "signé"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                  }`}>
                  {document.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {/* Pagination mobile */}
<div className="flex justify-between items-center px-2 pt-2">
  <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(currentPage - 1)}
    className={`flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md ${
      currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-[#f26755] hover:bg-[#f26755]/10'
    }`}
  >
    <ChevronLeft className="w-4 h-4" />
    Précédent
  </button>
  <span className="text-sm text-gray-600">Page {currentPage} sur {totalPages}</span>
  <button
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage(currentPage + 1)}
    className={`flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md ${
      currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-[#f26755] hover:bg-[#f26755]/10'
    }`}
  >
    Suivant
    <ChevronRight className="w-4 h-4" />
  </button>
</div>

      </div>

      {/* Version desktop: affichage en tableau */}
{/* Version desktop: affichage en tableau avec pagination */}
<div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
  {paginatedDocuments.length === 0 ? (
    <div className="p-6 text-center border border-dashed border-gray-300">
      <p className="text-gray-700 text-sm mb-4">Aucun document disponible pour ce projet.</p>
      <button
        onClick={() => setIsAddDocumentOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-semibold hover:bg-[#f26755]/90 transition-colors"
      >
        <Upload className="h-4 w-4" />
        Ajouter un document
      </button>
    </div>
  ) : (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taille</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedDocuments.map((document) => (
              <tr key={document.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{document.name}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{document.category}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{document.date}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{document.size}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    document.status === 'signé' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {document.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button className="text-[#f26755] hover:text-[#f26755]/80" title="Télécharger le document">
                    <Download className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center p-4 border-t bg-gray-50">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className={`flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md ${
            currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-[#f26755] hover:bg-[#f26755]/10'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </button>
        <span className="text-sm text-gray-600">Page {currentPage} sur {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className={`flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md ${
            currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-[#f26755] hover:bg-[#f26755]/10'
          }`}
        >
          Suivant
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </>
  )}
</div>


      <Sheet open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
        <div>
          <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto p-4 sm:p-6">
          <SheetHeader>
            <SheetTitle>Ajouter un document</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 space-y-4 sm:space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            <div>
              <label htmlFor="document-type" className="block text-sm font-medium text-gray-700 mb-2">
                Type de document
              </label>
              <select
                id="document-type"
                name="document-type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#f26755] focus:border-[#f26755]"
                aria-label="Sélectionner le type de document"
              >
                <option value="">Sélectionner...</option>
                <option value="devis">Devis</option>
                <option value="facture">Facture</option>
                <option value="contrat">Contrat</option>
                <option value="autre">Autre</option>
              </select>
              {documentType === 'autre' && (
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mt-2"
                  value={customDocumentType}
                  onChange={e => setCustomDocumentType(e.target.value)}
                  placeholder="Précisez le type de document"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichier
              </label>
              <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f26755] cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  {selectedFile ? selectedFile.name : "Cliquez pour télécharger"}
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  PDF, DOC jusqu&apos;à 10MB
                </span>
              </label>
            </div>
            {documentType.toLowerCase() === 'devis' && (
              <div>
                <label htmlFor="montant" className="block text-sm font-medium text-gray-700 mb-2">Montant du devis (€)</label>
                <input
                  id="montant"
                  type="number"
                  min="0"
                  step="0.01"
                  value={montant}
                  onChange={e => setMontant(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#f26755] focus:border-[#f26755]"
                  placeholder="Saisir le montant"
                />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700">
                  Notifier par email
                </span>
              </div>

              {/* <div className="space-y-3">
                {recipients.map((recipient) => (
                  <div key={recipient.id} className="flex items-center gap-2">
                    <Checkbox
                      id={recipient.id}
                      checked={selectedRecipients.includes(recipient.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRecipients([...selectedRecipients, recipient.id]);
                        } else if (!recipient.required) {
                          setSelectedRecipients(selectedRecipients.filter(id => id !== recipient.id));
                        }
                      }}
                      disabled={recipient.required}
                    />
                    <label htmlFor={recipient.id} className="flex-1 text-sm">
                      <span className="text-gray-700">{recipient.name}</span>
                      <span className="text-gray-500 ml-2">- {recipient.email}</span>
                      {recipient.required && (
                        <span className="ml-2 text-xs text-[#f26755]">(Obligatoire)</span>
                      )}
                    </label>
                  </div>
                ))}
              </div> */}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isNotificationSent || uploading || !selectedFile || !documentType || (documentType.toLowerCase() === 'devis' && !montant)}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${isNotificationSent
                    ? "bg-green-100 text-green-700 cursor-not-allowed"
                    : uploading
                      ? "bg-gray-200 text-gray-400 cursor-wait"
                      : "bg-[#f26755] text-white hover:bg-[#f26755]/90"
                  }`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    Envoi en cours...
                  </>
                ) : isNotificationSent ? (
                  <>
                    <Check className="h-4 w-4" />
                    Document envoyé
                  </>
                ) : (
                  'Envoyer le document'
                )}
              </button>
            </div>
          </form>
        </SheetContent>
        </div>
      </Sheet>
    </div>
  ); 
}
