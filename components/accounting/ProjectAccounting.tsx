"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Euro, Check, X, Clock, Mail, Upload, Send, ChevronRight, Download, Eye } from 'lucide-react';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

import type { ProjectPayment } from "@/hooks/useProjectPayments";

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: string;
  required?: boolean;
}

import { useProjectPayments, addPayment } from "@/hooks/useProjectPayments";
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { CLOUDINARY_UPLOAD_PRESET } from '@/lib/cloudinary';
import { useAuth } from '@/lib/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getProjectById, Project } from '@/lib/firebase/projects';

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;

interface PaymentRequestsProps {
  projectId?: string;
}

export default function PaymentRequests({ projectId }: PaymentRequestsProps) {
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

  const params = useParams() ?? {};
  const resolvedProjectId = projectId || (Array.isArray(params.id) ? params.id[0] : params.id as string);
  const { payments: requests, loading, error } = useProjectPayments(resolvedProjectId);
  const [project, setProject] = useState<Project | null>(null);

  const [selectedRequest, setSelectedRequest] = useState<ProjectPayment | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isValidationDrawerOpen, setIsValidationDrawerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isNotificationSent, setIsNotificationSent] = useState(false);

  const handleViewDetails = (request: ProjectPayment) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

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
        return "bg-green-100/80 text-green-800 border-green-200";
      default:
        return "bg-amber-100/80 text-amber-800 border-amber-200";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
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

  const totalAmount = requests.reduce((sum, req) => sum + req.amount, 0);
  const approvedAmount = requests.filter(req => req.status === 'validé').reduce((sum, req) => sum + req.amount, 0);
  const pendingAmount = requests.filter(req => req.status === 'en_attente').reduce((sum, req) => sum + req.amount, 0);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      let imageUrls: string[] = [];
      if (form.files && form.files.length > 0) {
        for (const file of form.files) {
          const data = new FormData();
          data.append('file', file);
          data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET as string);
          const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: data });
          const result = await res.json();
          if (result.secure_url) imageUrls.push(result.secure_url);
        }
      }
      let documentUrls: string[] = [];
      if (documentFiles && documentFiles.length > 0) {
        for (const file of documentFiles) {
          const data = new FormData();
          data.append('file', file);
          data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET as string);
          const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: data });
          const result = await res.json();
          if (result.secure_url) documentUrls.push(result.secure_url);
        }
      }
      await addPayment({
        projectId: resolvedProjectId,
        title: form.title,
        description: form.description,
        amount: parseFloat(form.amount),
        date: new Date().toISOString(),
        status: 'en_attente',
        images: imageUrls,
        documents: documentUrls,
        dateValidation: '',
      });
      setForm({ title: '', description: '', amount: '', files: [] });
      setDocumentFiles([]);
      if (typeof window !== 'undefined') window.location.reload();
    } catch (err) {
      setFormError("Erreur lors de l'ajout de l'acompte");
    } finally {
      setFormLoading(false);
    }
  };

  useEffect(() => {
    async function fetchProject() {
      const data = await getProjectById(resolvedProjectId);
      setProject(data);
    }
    fetchProject();
  }, [resolvedProjectId]);

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Chargement des acomptes...</div>;
  }
  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>;
  }
  if (!requests || requests.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto max-w-md p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center space-y-3">
            <Euro className="h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Aucun acompte enregistré</h3>
            <p className="text-sm text-gray-500">Aucune demande d&apos;acompte n&apos;a été effectuée pour ce projet.</p>
            {userRole === 'artisan' && project?.amoIncluded === false && (
              <button
                className="mt-4 inline-flex items-center px-4 py-2 bg-[#f26755] text-white rounded-lg font-medium hover:bg-[#f26755]/90 transition-colors"
                onClick={() => setOpenAddModal(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Faire une demande
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modales/drawers existantes (validation, détails, etc.) */}
      {/* ... Garde le code existant pour validation/détail, mais harmonise leur style si besoin ... */}
      <Modal
        isOpen={openAddModal}
        onClose={() => setOpenAddModal(false)}
        title="Nouvelle demande d'acompte"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleAddPayment} className="space-y-6 max-h-[70vh] overflow-y-auto p-2">
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

      <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-between w-full mb-2">
        <div className="flex items-center flex-shrink-0">
          <button
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#f26755] to-[#f26755]/90 text-white rounded-lg font-semibold shadow hover:opacity-90 transition"
            onClick={() => window.history.back()}
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Retour
          </button>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 flex-1 text-center min-w-[160px] truncate order-2 sm:order-none">Demandes d&apos;acompte</h2>
        <div className="flex items-center flex-shrink-0">
          {userRole !== 'admin' && project?.amoIncluded === false && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[#f26755] text-white rounded-lg font-semibold shadow hover:opacity-90 transition"
              onClick={() => setOpenAddModal(true)}
              type="button"
            >
              <Upload className="h-4 w-4" /> Demande d&apos;acompte
            </button>
          )}
        </div>
      </div>

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

      {/* Paiements - Grille moderne */}
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
                      {request.status === 'validé' ? 'Validé' : 'En attente'}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4 text-[#f26755]" />
                      {format(new Date(request.date), 'd MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>
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
              {/* Images & Docs */}
              <div className="space-y-3 mb-6">
                {request.images && request.images.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[#f26755]">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm font-medium">{request.images.length}</span>
                    </div>
                    <div className="flex gap-2">
                      {request.images.slice(0, 3).map((img, idx) => (
                        <Image
                          key={idx}
                          src={img}
                          alt={`Justificatif ${idx + 1}`}
                          width={12}
                          height={12}
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
                {request.documents && request.documents.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[#f26755]">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm font-medium">{request.documents.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {request.documents.map((docUrl, idx) => {
                        const fileName = decodeURIComponent(docUrl.split('/').pop()?.split('?')[0] || `Doc ${idx + 1}`);
                        return (
                          <a
                            key={idx}
                            href={docUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-[#f26755]/10 rounded-lg text-xs text-gray-700 hover:text-[#f26755] transition-colors"
                          >
                            <Upload className="h-3 w-3" />
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
                  <ChevronRight className="h-4 w-4" />
                  Voir les détails
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
                      <Image
                        src={img}
                        width={500}
                        height={500}
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
                    const fileName = decodeURIComponent(docUrl.split('/').pop()?.split('?')[0] || `Document_${idx + 1}`);
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

      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        title="Aperçu de l'image"
        maxWidth="max-w-6xl"
      >
        {selectedImage && (
          <div className="text-center p-4">
            <Image
              src={selectedImage}
              width={500}
              height={500}
              alt="Aperçu"
              className="max-w-full max-h-[70vh] w-auto h-auto mx-auto rounded-lg shadow-lg object-contain"
            />
          </div>
        )}
      </Modal>

      <Sheet open={isValidationDrawerOpen} onOpenChange={setIsValidationDrawerOpen}>
        <SheetContent className="w-full sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Valider la demande d&apos;acompte</SheetTitle>
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#f26755] focus:border-[#f26755]"
                placeholder="Ajouter un message..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documents
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer hover:border-[#f26755] bg-gray-50 relative ${selectedFile ? 'border-[#f26755]' : 'border-gray-300'}`}
                onClick={() => document.getElementById('accounting-upload-input')?.click()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0] || null;
                  if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
                    setSelectedFile(file);
                  }
                }}
                onDragOver={e => e.preventDefault()}
                style={{ minHeight: 120 }}
              >
                {!selectedFile ? (
                  <>
                    <Upload className="h-12 w-12 text-[#f26755] mb-2" />
                    <span className="block text-sm text-gray-500 text-center">Cliquez ou glissez une image ou un PDF ici</span>
                    <span className="mt-1 block text-sm text-gray-500">Image ou PDF jusqu&apos;à 10MB</span>
                  </>
                ) : (
                  <div className="flex flex-col items-center w-full">
                    {selectedFile.type.startsWith('image/') ? (
                      <Image
                        src={URL.createObjectURL(selectedFile)}
                        alt="Aperçu document"
                        width={100}
                        height={100}
                        className="rounded shadow max-h-32 object-contain mb-2"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full mb-2">
                        <span className="inline-block px-3 py-2 bg-gray-200 rounded text-xs text-gray-700">{selectedFile.name}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-gray-700 truncate">{selectedFile.name}</span>
                      <button
                        type="button"
                        className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (document.getElementById('accounting-upload-input')) (document.getElementById('accounting-upload-input') as HTMLInputElement).value = '';
                        }}
                        title="Supprimer la sélection"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
                <input
                  id="accounting-upload-input"
                  type="file"
                  accept="image/*,application/pdf"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
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
                        <span className="ml-2 text-xs text-[#f26755]">(Obligatoire)</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-3">
              <button
                type="button"
                onClick={() => setIsValidationDrawerOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isNotificationSent}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${isNotificationSent
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-[#f26755] text-white hover:bg-[#f26755]/90'
                  }`}
              >
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
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}