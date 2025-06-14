'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Euro, Check, X, Clock, Mail, Upload, Send } from 'lucide-react';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

import type { ProjectPayment } from "@/hooks/useProjectPayments";

// ProjectPayment est utilisé partout dans ce composant désormais

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
  // Récupération de l'id projet dynamiquement si non fourni
  const params = useParams();
  const resolvedProjectId = projectId || (Array.isArray(params?.id) ? params.id[0] : params?.id as string);
  const { payments: requests, loading, error } = useProjectPayments(resolvedProjectId);

  const [selectedRequest, setSelectedRequest] = useState<ProjectPayment | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isValidationDrawerOpen, setIsValidationDrawerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  // Rendu dynamique géré ci-dessus avec resolvedProjectId

  const getStatusStyle = (status: ProjectPayment["status"]) => {
    switch (status) {
      case "validé":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
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
  // --- Formulaire d'ajout d'acompte (HOOKS EN PREMIER) ---
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    files: [] as File[],
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Chargement des acomptes...</div>;
  }
  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>;
  }
  // Affichage fallback si aucun acompte
  if (!requests || requests.length === 0) {
    return <div className="py-8 text-center text-gray-400">Aucun acompte trouvé pour ce projet.</div>;
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    if (name === 'file' || name === 'files') {
      setForm(f => ({ ...f, files: files ? Array.from(files) : [] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };


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
      await addPayment({
        projectId: resolvedProjectId,
        title: form.title,
        description: form.description,
        amount: parseFloat(form.amount),
        date: new Date().toISOString(),
        status: 'en_attente',
        images: imageUrls,
        dateValidation: '',
      });
      setForm({ title: '', description: '', amount: '', files: [] });
      // Forcer le refresh :
      if (typeof window !== 'undefined') window.location.reload();
    } catch (err) {
      setFormError("Erreur lors de l'ajout de l'acompte");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Chargement des acomptes...</div>;
  }
  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>;
  }
  // Affichage fallback si aucun acompte
  if (!requests || requests.length === 0) {
    return <div className="py-8 text-center text-gray-400">Aucun acompte trouvé pour ce projet.</div>;
  }

  return (
    <div className="space-y-6">
      <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
        <DialogContent className="max-w-lg w-full">
          <form onSubmit={handleAddPayment} className="flex flex-col gap-3">
            {formError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{formError}</div>}
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                name="title"
                type="text"
                required
                value={form.title}
                onChange={handleFormChange}
                placeholder="Titre"
                className="w-full sm:w-1/3 border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <input
                name="amount"
                type="number"
                required
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleFormChange}
                placeholder="Montant (€)"
                className="w-full sm:w-1/4 border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Description"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              rows={2}
            />
            <div className="flex items-center gap-3">
              <input
                name="files"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFormChange}
                className="block text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
              />
              {form.files && form.files.length > 0 && (
                <span className="text-xs text-gray-600">
                  {form.files.map(f => f.name).join(', ')}
                </span>
              )}
            </div> 
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors disabled:opacity-50"
                disabled={formLoading}
              >
                {formLoading ? (
                  <span className="loader mr-2"></span>
                ) : (
                  <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                )}
                Ajouter un acompte
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#f26755] to-[#f26755] text-white rounded-lg font-semibold shadow hover:opacity-90 transition"
          onClick={() => window.history.back()}
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Retour
        </button>
        <h2 className="text-lg font-medium text-gray-900">Demandes d'acompte</h2>
        {userRole === 'artisan' && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#f26755] text-white rounded-md font-semibold shadow hover:opacity-90 transition"
            onClick={() => setOpenAddModal(true)}
            type="button"
          >
            <Upload className="h-4 w-4" /> Demande d'acompte
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {requests.map((request) => (
          <Card key={request.id} className="border border-gray-200">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{request.title}</span>
                    <span className={`ml-2 text-xs font-semibold rounded-full px-2 py-0.5 border ${getStatusStyle(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status === 'validé' ? 'Validé' : 'En attente'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(new Date(request.date), "PPP", { locale: fr })}
                  </div>
                </div>
                <div className="text-right text-lg font-bold text-[#f21515]">
                  {request.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </div>
              </div>
              <div className="text-sm text-gray-700 mt-1">
                {request.description}
              </div>
              {request.images && request.images.length > 0 && (
                <div className="flex gap-3 mt-2 overflow-x-auto">
                  {request.images.map((img, idx) => (
                    <Image
                      key={idx}
                      src={img}
                      alt={`Justificatif ${idx + 1}`}
                      width={200}
                      height={200}
                      className="h-60 w-60 object-cover rounded border cursor-pointer transition-transform hover:scale-105"
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div> 
              )}
              {/* <div className="flex justify-end mt-4">
                <button
                  className="px-3 py-1 rounded bg-[#f21515] text-white text-xs font-semibold hover:bg-[#f21515]/90"
                  onClick={() => handleValidation(request)}
                >
                  Valider / Notifier
                </button>
              </div> */}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedImage && (
            <div className="relative aspect-video">
              <Image
                src={selectedImage}
                alt="Image agrandie"
                width={600}
                height={600}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${isNotificationSent
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-[#f21515] text-white hover:bg-[#f21515]/90'
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