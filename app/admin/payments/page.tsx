"use client";

import { useState } from "react";
import { Search, Filter, X, Euro, Clock, CheckCircle, ChevronLeft, ChevronRight, Send, Upload, Mail } from "lucide-react";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

interface PaymentProject {
  id: string;
  name: string;
  broker: {
    name: string;
    company: string;
    avatar: string;
  };
  artisan: {
    name: string;
    company: string;
    avatar: string;
  };
  amount: number;
  validatedPayments: number;
  pendingPayments: number;
  quontoBalance: number;
  status: "en_attente" | "validé" | "refusé";
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: string;
  required?: boolean;
}

export default function AdminPayments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "validated">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isValidationDrawerOpen, setIsValidationDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PaymentProject | null>(null);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isNotificationSent, setIsNotificationSent] = useState(false);
  const projectsPerPage = 10;

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
  
  const [projects] = useState<PaymentProject[]>([
    {
      id: "1",
      name: "Rénovation appartement",
      broker: {
        name: "Jean Dupont",
        company: "Courtage Pro",
        avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
      },
      artisan: {
        name: "Pierre Martin",
        company: "Martin Construction",
        avatar: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg"
      },
      amount: 15000,
      validatedPayments: 3000,
      pendingPayments: 2000,
      quontoBalance: 5000,
      status: "en_attente"
    },
    {
      id: "2",
      name: "Installation cuisine",
      broker: {
        name: "Marie Martin",
        company: "Habitat Solutions",
        avatar: "https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg"
      },
      artisan: {
        name: "Jean Dubois",
        company: "Dubois & Fils",
        avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
      },
      amount: 25000,
      validatedPayments: 5000,
      pendingPayments: 0,
      quontoBalance: 8000,
      status: "validé"
    }
  ]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.artisan.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "pending") {
      return matchesSearch && project.pendingPayments > 0;
    } else if (statusFilter === "validated") {
      return matchesSearch && project.validatedPayments > 0;
    }
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  const handleValidation = (project: PaymentProject) => {
    setSelectedProject(project);
    setIsValidationDrawerOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsNotificationSent(true);
    setTimeout(() => {
      setIsNotificationSent(false);
      setIsValidationDrawerOpen(false);
      setSelectedProject(null);
      setSelectedFile(null);
      setMessage('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des acomptes</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-[32rem] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un projet, courtier ou artisan..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#f21515] focus:border-[#f21515]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "validated")}
            className="flex-1 sm:w-48 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#f21515]"
          >
            <option value="all">Tous les acomptes</option>
            <option value="pending">Acomptes en attente</option>
            <option value="validated">Acomptes validés</option>
          </select>

          {(searchTerm || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                  Projet
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                  Courtier
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                  Artisan
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                  Montant total
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider bg-white">
                  Acomptes validés
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-amber-600 uppercase tracking-wider bg-white">
                  Acomptes en attente
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#f21515] uppercase tracking-wider bg-white">
                  Solde Qonto
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="relative h-8 w-8 flex-shrink-0">
                        <Image
                          src={project.broker.avatar}
                          alt={project.broker.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{project.broker.name}</div>
                        <div className="text-sm text-gray-500">{project.broker.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="relative h-8 w-8 flex-shrink-0">
                        <Image
                          src={project.artisan.avatar}
                          alt={project.artisan.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{project.artisan.name}</div>
                        <div className="text-sm text-gray-500">{project.artisan.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {project.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-green-600">
                      {project.validatedPayments.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-amber-600">
                      {project.pendingPayments.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-[#f21515]">
                      {project.quontoBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {project.pendingPayments > 0 && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {}}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          Refuser
                        </button>
                        <button
                          onClick={() => handleValidation(project)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Valider
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Affichage de <span className="font-medium">{((currentPage - 1) * projectsPerPage) + 1}</span> à{' '}
              <span className="font-medium">{Math.min(currentPage * projectsPerPage, filteredProjects.length)}</span> sur{' '}
              <span className="font-medium">{filteredProjects.length}</span> projets
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                      ${currentPage === i + 1 
                        ? 'bg-[#f21515] text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={isValidationDrawerOpen} onOpenChange={setIsValidationDrawerOpen}>
        <SheetContent className="w-[500px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Valider la demande d'acompte</SheetTitle>
          </SheetHeader>
          
          <form onSubmit={handleSubmitValidation} className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#f21515] focus:border-[#f21515]"
                placeholder="Ajouter un message..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documents
              </label>
              <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f21515] cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  {selectedFile ? selectedFile.name : "Cliquez pour télécharger"}
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  PDF, DOC jusqu'à 10MB
                </span>
              </label>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4 text-gray-500" />
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
                        <span className="ml-2 text-xs text-[#f21515]">(Obligatoire)</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isNotificationSent}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                  isNotificationSent
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-[#f21515] text-white hover:bg-[#f21515]/90'
                }`}
              >
                {isNotificationSent ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Demande validée
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Valider et envoyer
                  </>
                )}
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}