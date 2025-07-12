'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchProjectDocuments, addProjectDocument } from '@/hooks/useProjectDocuments';
import { Card } from "@/components/ui/card";
import { FileText, Download, Upload, Mail, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from '@/lib/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

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
  const [devisConfigId, setDevisConfigId] = useState<string | null>(null);
  const [isNotificationSent, setIsNotificationSent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 5;
  const totalPages = Math.ceil(documents.length / documentsPerPage);
  const currentDocuments = documents.slice(
    (currentPage - 1) * documentsPerPage,
    currentPage * documentsPerPage
  );

  const params = useParams() ?? {};
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id as string;

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
  
      if (!res.ok) throw new Error('Échec de l\'upload Cloudinary');
  
      const data = await res.json();
      const uploadedUrl = data.secure_url;
      
      const documentData = {
        projectId,
        name: selectedFile.name,
        category: documentType === 'autre' ? customDocumentType : documentType,
        date: new Date().toISOString(),
        size: `${(selectedFile.size/1024/1024).toFixed(2)} MB`,
        status: "en attente" as "en attente" | "signé",
        url: uploadedUrl,
        createdAt: new Date().toISOString(),
        ...(documentType.toLowerCase() === 'devis' && { 
          montant: Number(montant),
          devisConfigId: "" // Valeur par défaut vide
        })
      };
  
      await addProjectDocument(documentData);
  
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

  const resetForm = () => {
    setSelectedFile(null);
    setDocumentType('');
    setCustomDocumentType('');
    setMontant('');
    setDevisConfigId(null);
    setIsNotificationSent(false);
  };

  return (
   <div className="space-y-6">
      {/* En-tête et boutons */}
      <div className="flex flex-col w-full mb-6 gap-2">
        <h2 className="text-xl font-bold text-center text-gray-900 w-full mb-2">Documents du projet</h2>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4 w-full">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-200 transition text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
      </div>

      {/* Affichage des documents */}
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun document disponible</h3>
          <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
            Ce projet ne contient aucun document pour le moment.
          </p>
          {userRole !== 'admin' && (
            <button
              onClick={() => setIsAddDocumentOpen(true)}
              className="flex items-center px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90"
            >
              <Upload className="h-4 w-4 mr-2" />
              Ajouter un document
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Version mobile */}
          <div className="block md:hidden space-y-4">
            {currentDocuments.map((document) => (
              <Card key={document.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{document.name}</span>
                  </div>
                  <a 
                    href={document.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#f26755] hover:text-[#f26755]/80 p-2"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                  <div>
                    <p className="text-gray-500 font-medium">CATÉGORIE</p>
                    <p className="text-gray-700">{document.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">DATE</p>
                    <p className="text-gray-700">{new Date(document.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Taille</p>
                    <p className="text-gray-700">{document.size}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Statut</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-none font-semibold rounded-full ${
                      document.status === "signé" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {document.status}
                    </span>
                  </div>
                  {document.montant && (
                    <div className="col-span-2">
                      <p className="text-gray-500 font-medium">MONTANT</p>
                      <p className="text-gray-700">{document.montant.toFixed(2)} €</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Version desktop */}
          <div className="hidden md:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taille</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      {documents.some(d => d.montant) && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                      )}
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentDocuments.map((document) => (
                      <tr key={document.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{document.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {document.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(document.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {document.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            document.status === 'signé' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {document.status}
                          </span>
                        </td>
                        {documents.some(d => d.montant) && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {document.montant ? `${document.montant.toFixed(2)} €` : '-'}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a 
                            href={document.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#f26755] hover:text-[#f26755]/80"
                          >
                            <Download className="h-5 w-5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Précédent</span>
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${
                      currentPage === i + 1 ? 'bg-[#f26755] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <span>Suivant</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Formulaire d'ajout */}
      <Sheet open={isAddDocumentOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setIsAddDocumentOpen(open);
      }}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Ajouter un document</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {error && <div className="text-red-600 text-sm p-2 bg-red-50 rounded-md">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de document
              </label>
              <select
               aria-label="Type de document"
                value={documentType}
                onChange={(e) => {
                  setDocumentType(e.target.value);
                  setError(null);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#f26755] focus:border-[#f26755]"
                required
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
              <label className="block w-full border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f26755] cursor-pointer bg-gray-50">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  required
                />
                <Upload className="mx-auto h-12 w-12 text-[#f26755]" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  {selectedFile ? selectedFile.name : "Cliquez pour télécharger"}
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  PDF, DOC, XLS jusqu&apos;à 10MB
                </span>
              </label>
            </div>

            {documentType.toLowerCase() === 'devis' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant du devis (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={montant}
                  onChange={e => {
                    setMontant(e.target.value);
                    setError(null);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#f26755] focus:border-[#f26755]"
                  placeholder="Saisir le montant"
                  required
                />
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isNotificationSent || uploading}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                  isNotificationSent ? "bg-green-100 text-green-700 cursor-not-allowed" :
                  uploading ? "bg-gray-200 text-gray-400 cursor-wait" :
                  "bg-[#f26755] text-white hover:bg-[#f26755]/90"
                }`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
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
      </Sheet>
    </div>
  );
}
