'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, Upload, Mail, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [isNotificationSent, setIsNotificationSent] = useState(false);

  const [documents] = useState<Document[]>([
    {
      id: "1",
      name: "Devis final",
      category: "Devis",
      date: "2024-02-15",
      size: "1.2 MB",
      status: "Signé"
    },
    {
      id: "2",
      name: "Facture acompte",
      category: "Facture",
      date: "2024-02-16",
      size: "856 KB",
      status: "En attente"
    }
  ]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsNotificationSent(true);
    setTimeout(() => {
      setIsNotificationSent(false);
      setIsAddDocumentOpen(false);
      setSelectedFile(null);
      setDocumentType('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Documents du projet</h2>
        <button
          onClick={() => setIsAddDocumentOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors"
          aria-label="Ajouter un nouveau document"
        >
          <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
          Ajouter un document
        </button>
      </div>

      {/* Version mobile: affichage en cartes */}
      <div className="block md:hidden space-y-4">
        {documents.map((document) => (
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
                <span className={`px-2 py-1 inline-flex text-xs leading-none font-semibold rounded-full ${
                  document.status === "Signé" 
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {document.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Version desktop: affichage en tableau */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taille
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((document) => (
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
                    {document.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {document.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      document.status === 'Signé' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {document.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-[#f26755] hover:text-[#f26755]/80"
                      title="Télécharger le document"
                      aria-label="Télécharger le document"
                    >
                      <Download className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
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

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700">
                  Notifier par email
                </span>
              </div>
              
              <div className="space-y-3">
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
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isNotificationSent || !selectedFile || !documentType}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                  isNotificationSent
                    ? "bg-green-100 text-green-700 cursor-not-allowed"
                    : "bg-[#f26755] text-white hover:bg-[#f26755]/90"
                }`}
              >
                {isNotificationSent ? (
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