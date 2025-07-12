"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Euro, Check, X, Clock, Mail, Upload, Send, ChevronRight, ArrowLeft, Plus, Eye, Calendar, FileText, Download, Image as ImageIcon } from 'lucide-react';

// Mock types to match your existing structure
interface ProjectPayment {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  status: 'validé' | 'en_attente';
  images?: string[];
  documents?: string[];
  dateValidation?: string;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: string;
  required?: boolean;
}

// Mock data for demonstration with documents
const mockRequests: ProjectPayment[] = [
  {
    id: '1',
    title: 'Versement au démarrage',
    description: 'Premier versement pour le démarrage du projet de rénovation',
    amount: 5000,
    date: '2024-01-15',
    status: 'validé',
    images: [
      'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1181248/pexels-photo-1181248.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    documents: [
      'https://example.com/devis-renovation.pdf',
      'https://example.com/contrat-travaux.pdf'
    ]
  },
  {
    id: '2',
    title: 'Versement mi chantier',
    description: 'Versement intermédiaire pour les travaux en cours',
    amount: 7500,
    date: '2024-01-20',
    status: 'en_attente',
    images: [
      'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    documents: [
      'https://example.com/facture-intermediaire.pdf'
    ]
  },
  {
    id: '3',
    title: 'A la fin des travaux',
    description: 'Versement final pour la finalisation du projet',
    amount: 3000,
    date: '2024-01-25',
    status: 'en_attente',
    documents: [
      'https://example.com/rapport-final.pdf',
      'https://example.com/garantie-travaux.pdf'
    ]
  }
];

interface PaymentRequestsProps {
  projectId?: string;
}

export default function PaymentRequests({ projectId }: PaymentRequestsProps) {
  // Mock user role - replace with your actual auth logic
  const [userRole, setUserRole] = useState<string | null>('client');
  
  // Mock data - replace with your actual data fetching
  const requests = mockRequests;
  const loading = false;
  const error = null;

  const [selectedRequest, setSelectedRequest] = useState<ProjectPayment | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isValidationDrawerOpen, setIsValidationDrawerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [message, setMessage] = useState('');
  const [isNotificationSent, setIsNotificationSent] = useState(false);

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

  const getStatusStyle = (status: ProjectPayment["status"]) => {
    switch (status) {
      case "validé":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getStatusIcon = (status: ProjectPayment["status"]) => {
    switch (status) {
      case "validé":
        return <Check className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: ProjectPayment["status"]) => {
    switch (status) {
      case "validé":
        return "Validé";
      default:
        return "En attente";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleValidation = (request: ProjectPayment) => {
    setSelectedRequest(request);
    setIsValidationDrawerOpen(true);
  };

  const handleViewDetails = (request: ProjectPayment) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleSubmitValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsNotificationSent(true);
    setTimeout(() => {
      setIsNotificationSent(false);
      setIsValidationDrawerOpen(false);
      setSelectedRequest(null);
      setSelectedFile(null);
      setMessage('');
    }, 2000);
  };

  const [openAddModal, setOpenAddModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    files: [] as File[],
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    if (name === 'file' || name === 'files') {
      setForm(f => ({ ...f, files: files ? Array.from(files) : [] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setForm({ title: '', description: '', amount: '', files: [] });
      setDocumentFiles([]);
      setOpenAddModal(false);
      setFormLoading(false);
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Calculate totals
  const totalAmount = requests.reduce((sum, req) => sum + req.amount, 0);
  const approvedAmount = requests.filter(req => req.status === 'validé').reduce((sum, req) => sum + req.amount, 0);
  const pendingAmount = requests.filter(req => req.status === 'en_attente').reduce((sum, req) => sum + req.amount, 0);

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f26755] mx-auto mb-4"></div>
        <p>Chargement des acomptes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="space-y-6">
        <div className="w-full mb-6">
          <div className="flex flex-col items-center w-full">
            <h2 className="text-xl font-semibold text-gray-800 w-full text-center mb-2">Demandes d&apos;acompte</h2>
            <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-4 justify-between">
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-200 transition"
                onClick={() => window.history.back()}
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Retour
              </button>
              {userRole !== 'admin' && (
                <button
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#f26755] text-white rounded-lg font-semibold shadow hover:bg-[#f26755]/90 transition"
                  onClick={() => setOpenAddModal(true)}
                  type="button"
                >
                  <Upload className="h-4 w-4" /> Demande d&apos;acompte
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center min-h-96">
          <Card className="text-center py-16 max-w-md mx-auto shadow-lg">
            <CardContent>
              <div className="w-20 h-20 bg-gradient-to-br from-[#f26755] to-[#e55a4a] rounded-full flex items-center justify-center mx-auto mb-6">
                <Euro className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun acompte enregistré
              </h3>
              <p className="text-gray-600 mb-6">
                Aucune demande d&apos;acompte n&apos;a été effectuée pour ce projet.
              </p>
              {userRole !== 'admin' && (
                <Button onClick={() => setOpenAddModal(true)} className="bg-[#f26755] hover:bg-[#e55a4a]">
                  <Upload className="h-4 w-4" />
                  Faire une demande
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="w-full mb-6">
        <div className="flex flex-col items-center w-full">
          <h2 className="text-xl font-semibold text-gray-800 w-full text-center mb-2">Demandes d&apos;acompte</h2>
          <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-4 justify-between">
            <button
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-200 transition"
              onClick={() => window.history.back()}
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Retour au projet
            </button>
            {userRole !== 'admin' && (
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#f26755] text-white rounded-lg font-semibold shadow hover:bg-[#f26755]/90 transition"
                onClick={() => setOpenAddModal(true)}
                type="button"
              >
                <Upload className="h-4 w-4" /> Nouvelle demande
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total demandé</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{totalAmount.toLocaleString('fr-FR')}</span>
                  <span className="text-lg font-medium text-gray-600">€</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-[#f26755]/10 rounded-xl flex items-center justify-center">
                <Euro className="h-6 w-6 text-[#f26755]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Approuvé</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{approvedAmount.toLocaleString('fr-FR')}</span>
                  <span className="text-lg font-medium text-gray-600">€</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">En attente</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{pendingAmount.toLocaleString('fr-FR')}</span>
                  <span className="text-lg font-medium text-gray-600">€</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Requests - Modern Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {requests.map((request) => (
          <div
            key={request.id}
            className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >

            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {request.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border ${getStatusStyle(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {getStatusText(request.status)}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 text-[#f26755]" />
                      {formatDate(request.date)}
                    </div>
                  </div>
                </div>
                
                {/* Price Display */}
                <div className="text-right">
                  <div className="bg-gradient-to-r from-[#f26755] to-[#e55a4a] bg-clip-text text-transparent">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{request.amount.toLocaleString('fr-FR')}</span>
                      <span className="text-lg font-medium">€</span>
                    </div>
                  </div>
                  {request.status === 'validé' && (
                    <div className="flex items-center justify-end gap-1 text-emerald-600 text-sm font-medium mt-1">
                      <Check className="h-3 w-3" />
                      Versé
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                {request.description}
              </p>

              {/* Media Section */}
              <div className="space-y-3 mb-6">
                {/* Images */}
                {request.images && request.images.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[#f26755]">
                      <ImageIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{request.images.length}</span>
                    </div>
                    <div className="flex gap-2">
                      {request.images.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Justificatif ${idx + 1}`}
                          className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-[#f26755] transition-colors"
                          onClick={() => setSelectedImage(img)}
                        />
                      ))}
                      {request.images.length > 3 && (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                          +{request.images.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {request.documents && request.documents.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[#f26755]">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{request.documents.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {request.documents.map((docUrl, idx) => {
                        const fileName = decodeURIComponent(docUrl.split('/').pop()?.split('?')[0] || `Doc ${idx+1}`);
                        return (
                          <a
                            key={idx}
                            href={docUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-[#f26755]/10 rounded-lg text-xs text-gray-700 hover:text-[#f26755] transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            <span className="truncate max-w-20">{fileName.split('.')[0]}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  className="text-sm font-medium text-[#f26755] hover:text-[#f26755]/80 flex items-center gap-1 transition-colors"
                  onClick={() => handleViewDetails(request)}
                >
                  <Eye className="h-4 w-4" />
                  Voir les détails
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                {request.status === 'en_attente' && (
                  <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1 transition-colors">
                    <Send className="h-3 w-3" />
                    Relancer
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Request Modal */}
      <Modal
        isOpen={openAddModal}
        onClose={() => setOpenAddModal(false)}
        title="Nouvelle demande d'acompte"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleAddPayment} className="space-y-6">
          {formError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {formError}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de versement
              </label>
              <select
              aria-label="Titre"
                name="title"
                required
                value={form.title}
                onChange={handleSelectChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f26755] focus:border-[#f26755]"
              >
                <option value="" disabled>Sélectionnez un type</option>
                <option value="Versement au démarrage">Versement au démarrage</option>
                <option value="Versement mi chantier">Versement mi chantier</option>
                <option value="A la fin des travaux">A la fin des travaux</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (€)
              </label>
              <input
                name="amount"
                type="number"
                required
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleFormChange}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f26755] focus:border-[#f26755]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f26755] focus:border-[#f26755]"
              placeholder="Décrivez la raison de cette demande d'acompte..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images justificatives
              </label>
              <input
                aria-label="Files"
                name="files"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFormChange}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#f26755]/10 file:text-[#f26755] hover:file:bg-[#f26755]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documents (PDF, DOC, etc.)
              </label>
              <input
                aria-label="Documents"
                name="documents"
                type="file"
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
                onChange={e => setDocumentFiles(e.target.files ? Array.from(e.target.files) : [])}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#f26755]/10 file:text-[#f26755] hover:file:bg-[#f26755]/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenAddModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={formLoading} className="bg-[#f26755] hover:bg-[#e55a4a]">
              {formLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Création...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Ajouter un acompte
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedRequest?.title || ''}
        maxWidth="max-w-6xl"
      >
        {selectedRequest && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">Informations générales</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Montant:</span>
                    <div className="bg-gradient-to-r from-[#f26755] to-[#e55a4a] bg-clip-text text-transparent">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold">{selectedRequest.amount.toLocaleString('fr-FR')}</span>
                        <span className="text-sm font-medium">€</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Date:</span>
                    <span className="font-semibold">{formatDate(selectedRequest.date)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Statut:</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-0.5 border ${getStatusStyle(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      {getStatusText(selectedRequest.status)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">Description</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{selectedRequest.description}</p>
                </div>
              </div>
            </div>

            {selectedRequest.images && selectedRequest.images.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">Justificatifs</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedRequest.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Justificatif ${idx + 1}`}
                        className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedImage(img)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedRequest.documents && selectedRequest.documents.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">Documents</h4>
                <div className="grid grid-cols-1 gap-3">
                  {selectedRequest.documents.map((docUrl, idx) => {
                    const fileName = decodeURIComponent(docUrl.split('/').pop()?.split('?')[0] || `Document_${idx+1}`);
                    return (
                      <a
                        key={idx}
                        href={docUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-[#f26755]/10 rounded-xl border border-gray-200 hover:border-[#f26755] transition-all group"
                      >
                        <div className="w-10 h-10 bg-[#f26755]/10 rounded-lg flex items-center justify-center group-hover:bg-[#f26755]/20 transition-colors">
                          <Download className="h-5 w-5 text-[#f26755]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{fileName}</p>
                          <p className="text-sm text-gray-500">Cliquez pour télécharger</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        title="Aperçu de l'image"
        maxWidth="max-w-6xl"
      >
        {selectedImage && (
          <div className="text-center p-4">
            <img
              src={selectedImage}
              alt="Aperçu"
              className="max-w-full max-h-[70vh] w-auto h-auto mx-auto rounded-lg shadow-lg object-contain"
            />
          </div>
        )}
      </Modal>

      {/* Validation Drawer - Simplified for demo */}
      <Modal
        isOpen={isValidationDrawerOpen}
        onClose={() => setIsValidationDrawerOpen(false)}
        title="Valider la demande d'acompte"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitValidation} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f26755] focus:border-[#f26755]"
              placeholder="Ajouter un message..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsValidationDrawerOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isNotificationSent} className="bg-[#f26755] hover:bg-[#e55a4a]">
              {isNotificationSent ? (
                <>
                  <Check className="h-4 w-4" />
                  Demande validée
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Valider et envoyer
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

 