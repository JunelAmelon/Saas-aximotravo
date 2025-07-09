"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CLOUDINARY_UPLOAD_PRESET } from "@/lib/cloudinary";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Euro,
  Check,
  X,
  Clock,
  Mail,
  Upload,
  Send,
  ChevronRight,
  ArrowLeft,
  Plus,
  Eye,
  Calendar,
  FileText,
  Download,
  Image as ImageIcon,
} from "lucide-react";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;

interface ProjectPayment {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  status: "validé" | "en_attente";
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

interface PaymentRequestsProps {
  projectId?: string;
}

import { useParams } from "next/navigation";
// Pour la correction de typage AccompteStatus
// (optionnel: vous pouvez aussi faire un import type en haut)

import { getProjectById } from "@/lib/firebase/projects";
import { useProjectPayments, addPayment } from "@/hooks/useProjectPayments";

export default function PaymentRequests() {
  // Extraction de l'ID du projet via useParams (même logique que ProjectNotes)
  const params = useParams() ?? {};
  const projectId = Array.isArray(params.id)
    ? params.id[0]
    : (params.id as string);
  console.log(projectId); // Pour debug

  // Mock user role - replace with your actual auth logic
  const [userRole, setUserRole] = useState<string | null>("client");

  // Paiements via hook custom
  const {
    payments,
    loading: paymentsLoading,
    error: paymentsError,
  } = useProjectPayments(projectId);

  const [selectedRequest, setSelectedRequest] = useState<ProjectPayment | null>(
    null
  );

  // State pour le projet Firebase
  const [project, setProject] = useState<any>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      setProjectLoading(true);
      setProjectError(null);
      try {
        const data = await getProjectById(projectId);
        if (data) {
          setProject(data);
        } else {
          setProject(null);
          setProjectError("Projet introuvable");
        }
      } catch (err: any) {
        setProjectError("Erreur lors de la récupération du projet");
        setProject(null);
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  console.log(project);
  console.log(payments);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isValidationDrawerOpen, setIsValidationDrawerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [isNotificationSent, setIsNotificationSent] = useState(false);
  // États pour la relance d'email
  const [relanceLoadingId, setRelanceLoadingId] = useState<string | null>(null);
  const [relanceSuccess, setRelanceSuccess] = useState<string | null>(null);
  const [relanceErrorId, setRelanceErrorId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [recipients, setRecipients] = useState<Recipient[]>([]);

  const [userConnectedInfo, setUserConnectedInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchRecipientsAndUser() {
      if (!project) return;
      try {
        const usersModule = await import("@/lib/firebase/users");
        // Récupérer le client du projet
        const clientUser = await usersModule.getClientUserFromProject(project);
        let recipientsArr: Recipient[] = [];
        if (clientUser) {
          recipientsArr.push({
            id: clientUser.uid,
            name:
              clientUser.displayName ||
              clientUser.firstName + " " + clientUser.lastName ||
              clientUser.email ||
              "Client",
            email: clientUser.email,
            role: "Client",
            required: true,
          });
        }
        setRecipients(recipientsArr);

        // Récupérer l'utilisateur connecté
        const userInfo = await usersModule.getCurrentUserInfo();
        setUserConnectedInfo(userInfo);
        console.log("Utilisateur connecté:", userInfo);
      } catch (e) {
        setRecipients([]);
        setUserConnectedInfo(null);
      }
    }
    fetchRecipientsAndUser();
  }, [project]);
  console.log(recipients);

  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(
    recipients.filter((r) => r.required).map((r) => r.id)
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
      setMessage("");
    }, 2000);
  };

  const [openAddModal, setOpenAddModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    files: [] as File[],
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as any;
    if (name === "file" || name === "files") {
      setForm((f) => ({ ...f, files: files ? Array.from(files) : [] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Fonction d'envoi de relance par mail
  const handleRelance = async (request: ProjectPayment) => {
    // On tente de récupérer l'email du client depuis recipients ou userConnectedInfo
    const clientData = recipients.find(
      (r) => r.role.toLowerCase() === "client"
    );
    setRelanceLoadingId(request.id);
    setRelanceSuccess(null);
    setRelanceErrorId(null);

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: clientData?.email || "",
          subject: request.title,
          html: `
<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />
<table width=\"100%\" bgcolor=\"#f8f9fb\" cellpadding=\"0\" cellspacing=\"0\" style=\"padding:24px 0;\">
  <tr>
    <td align=\"center\">
      <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px; background:#fff; border-radius:12px; box-shadow:0 2px 8px #0001;\">
        <tr>
          <td align=\"center\" bgcolor=\"#f26755\" style=\"padding:24px 0; border-radius:12px 12px 0 0;\">
            <h2 style=\"color:#fff; margin:0; font-size:22px; font-family:Segoe UI, Arial, sans-serif; letter-spacing:1px;\">Relance pour règlement d’acompte</h2>
          </td>
        </tr>
        <tr>
          <td style=\"padding:32px 24px 24px 24px; font-family:Segoe UI, Arial, sans-serif;\">
            <p style="font-size:16px; color:#222; margin-bottom:22px;">Madame, Monsieur,</p>
            <p style="font-size:15px; color:#222; margin-bottom:22px;">
              Je me permets de revenir vers vous concernant le règlement de l’acompte relatif à votre projet <span style="color:#f26755; font-weight:bold;">"${
                project?.name || ""
              }"</span>.
            </p>
            <div style="background:#f8f9fb; border-radius:10px; padding:18px 20px 14px 20px; margin-bottom:26px; border:1px solid #ececec;">
              <div style="font-size:15px; color:#f26755; font-weight:600; margin-bottom:10px;">🔍 Détails du projet</div>
              <ul style="padding-left:18px; margin:0; color:#333; font-size:15px;">
                ${
                  project?.name
                    ? `<li><b>Nom du projet :</b> ${project.name}</li>`
                    : ""
                }
                ${project?.type ? `<li><b>Type :</b> ${project.type}</li>` : ""}
                ${
                  project?.description
                    ? `<li><b>Description :</b> <i>${project.description}</i></li>`
                    : ""
                }
                ${
                  project?.startDate
                    ? `<li><b>Date de début prévue :</b> ${new Date(
                        project.startDate
                      ).toLocaleDateString("fr-FR")}</li>`
                    : ""
                }
                ${
                  project?.estimatedEndDate
                    ? `<li><b>Date de fin estimée :</b> ${new Date(
                        project.estimatedEndDate
                      ).toLocaleDateString("fr-FR")}</li>`
                    : ""
                }
              </ul>
            </div>
            <div style="background:#f4f4f4; border-radius:8px; padding:14px 18px; margin-bottom:24px; border:1px solid #eee;">
              <div style="font-size:15px; color:#222; margin-bottom:6px;">
                <b>Demande d’acompte :</b> ${
                  request.title
                    ? `<span style='color:#f26755'>${request.title}</span>`
                    : "Votre acompte"
                }
              </div>
              <div style="font-size:15px; color:#333; margin-bottom:5px;">
                <b>Montant :</b> <span style="color:#009966; font-weight:bold;">${
                  request.amount
                } €</span>
              </div>
              <div style="font-size:15px; color:#333; margin-bottom:5px;">
                <b>Échéance :</b> <span style="color:#f26755; font-weight:bold;">${new Date(
                  request.date
                ).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
              </div>
              ${
                request.description
                  ? `<div style="font-size:15px; color:#333;"><b>Motif :</b> <i>${request.description}</i></div>`
                  : ""
              }
            </div>
            <p style="font-size:15px; color:#444; margin-bottom:18px;">
              Nous vous serions reconnaissants de bien vouloir effectuer ce règlement dans les meilleurs délais afin d’assurer la bonne continuité du projet.
            </p>
            <div style="text-align:center; margin-bottom:32px;">
              <a href="#" style="background:#f26755; color:#fff; text-decoration:none; padding:12px 28px; border-radius:6px; font-weight:600; font-size:15px; display:inline-block;">Accéder à mon espace</a>
            </div>
            <p style="font-size:15px; color:#444; margin-bottom:18px;">
              Je reste bien entendu à votre entière disposition pour toute question ou pour vous transmettre à nouveau les documents nécessaires.
            </p>
            <p style="font-size:15px; color:#444; margin-bottom:0;">
              Dans l’attente de votre retour, je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.
            </p>
            <div style="margin-top:32px; font-size:15px; color:#222;">
              <b>${userConnectedInfo?.lastName || ""}</b><b>${
            userConnectedInfo?.firstName || ""
          }</b><br>
              <span style="color:#f26755;">${
                userConnectedInfo?.email || ""
              }</span><br>
              <span>${userConnectedInfo?.phoneNumber || ""}</span>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de l’envoi");
      setRelanceSuccess(request.id);
      setToast({ type: "success", message: "Relance envoyée avec succès !" });
      setTimeout(() => {
        setRelanceSuccess(null);
      }, 5000);
    } catch (e: any) {
      setRelanceErrorId(request.id);
      setToast({
        type: "error",
        message: "Erreur lors de l’envoi de la relance.",
      });
      setTimeout(() => {
        setRelanceErrorId(null);
      }, 5000);
    } finally {
      setRelanceLoadingId(null);
    }
  };

  // Ajout paiement

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const { title, description, amount, files } = form;
      if (!projectId || !title || !amount) {
        setFormError("Titre, montant et projet requis");
        setFormLoading(false);
        return;
      }

      // Upload images
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET || "");
          const res = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: "POST",
            body: data,
          });
          const result = await res.json();
          if (result.secure_url) imageUrls.push(result.secure_url);
        }
      }
      // Upload documents
      let documentUrls: string[] = [];
      if (documentFiles && documentFiles.length > 0) {
        for (const file of documentFiles) {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET || "");
          const res = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: "POST",
            body: data,
          });
          const result = await res.json();
          if (result.secure_url) documentUrls.push(result.secure_url);
        }
      }

      const accompteData = {
        projectId,
        title,
        description,
        amount: Number(amount),
        date: new Date().toISOString(),
        status:
          "en_attente" as import("@/hooks/useProjectPayments").PaymentStatus,
        images: imageUrls,
        documents: documentUrls,
        dateValidation: "",
      };
      await addPayment(accompteData);
      setForm({ title: "", description: "", amount: "", files: [] });
      setDocumentFiles([]);
      setOpenAddModal(false);
    } catch (err: any) {
      setFormError("Erreur lors de l'ajout de la demande d'acompte");
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Calculate totals
  const totalAmount = payments.reduce((sum, req) => sum + (req.amount || 0), 0);
  const approvedAmount = payments
    .filter((req) => req.status === "validé")
    .reduce((sum, req) => sum + (req.amount || 0), 0);
  const pendingAmount = payments
    .filter((req) => req.status === "en_attente")
    .reduce((sum, req) => sum + (req.amount || 0), 0);

  if (paymentsLoading) {
    return (
      <div className="py-8 text-center text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f26755] mx-auto mb-4"></div>
        <p>Chargement des acomptes...</p>
      </div>
    );
  }

  if (paymentsError) {
    return (
      <div className="py-8 text-center text-red-500">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p>{paymentsError}</p>
        </div>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="w-full mb-6">
          <div className="flex flex-col items-center w-full">
            <h2 className="text-xl font-semibold text-gray-800 w-full text-center mb-2">
              Demandes d&apos;acompte
            </h2>
            <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-4 justify-between">
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-200 transition"
                onClick={() => window.history.back()}
                type="button"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15 19l-7-7 7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Retour
              </button>
              {userRole !== "admin" && (
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
                Aucune demande d'acompte n'a été effectuée pour ce projet.
              </p>
              {userRole !== "admin" && (
                <Button
                  onClick={() => setOpenAddModal(true)}
                  type="button"
                  className="bg-[#f26755] hover:bg-[#e55a4a]"
                >
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
          <h2 className="text-xl font-semibold text-gray-800 w-full text-center mb-2">
            Demandes d&apos;acompte
          </h2>
          <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-4 justify-between">
            <button
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-200 transition"
              onClick={() => window.history.back()}
              type="button"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Retour au projet
            </button>
            {userRole !== "admin" && (
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
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Total demandé
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {totalAmount.toLocaleString("fr-FR")}
                  </span>
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
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Approuvé
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {approvedAmount.toLocaleString("fr-FR")}
                  </span>
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
                <p className="text-gray-600 text-sm font-medium mb-1">
                  En attente
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {pendingAmount.toLocaleString("fr-FR")}
                  </span>
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
        {payments.map((payment: any) => (
          <div
            key={payment.id}
            className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Toast Notification */}
            {toast && (
              <div
                style={{
                  position: "fixed",
                  top: 24,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 9999,
                  minWidth: 260,
                  maxWidth: "90vw",
                  padding: "14px 28px",
                  borderRadius: 8,
                  background: toast.type === "success" ? "#d1fae5" : "#fee2e2",
                  color: toast.type === "success" ? "#065f46" : "#b91c1c",
                  fontWeight: 600,
                  fontSize: 16,
                  boxShadow: "0 2px 16px #0002",
                  border:
                    toast.type === "success"
                      ? "1px solid #34d399"
                      : "1px solid #f87171",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
                role="alert"
              >
                {toast.type === "success" ? (
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="#34d399"
                      opacity=".2"
                    />
                    <path
                      d="M8 12.5l2.5 2.5 5-5"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="#f87171"
                      opacity=".2"
                    />
                    <path
                      d="M15 9l-6 6M9 9l6 6"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {toast.message}
              </div>
            )}
            <div className="relative p-6 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {payment.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border ${getStatusStyle(
                        payment.status
                      )}`}
                    >
                      {getStatusIcon(payment.status)}
                      {getStatusText(payment.status)}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 text-[#f26755]" />
                      {formatDate(payment.date)}
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="text-right">
                  <div className="bg-gradient-to-r from-[#f26755] to-[#e55a4a] bg-clip-text text-transparent">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">
                        {(payment.amount ?? 0).toLocaleString("fr-FR")}
                      </span>
                      <span className="text-lg font-medium">€</span>
                    </div>
                  </div>
                  {payment.status === "validé" && (
                    <div className="flex items-center justify-end gap-1 text-emerald-600 text-sm font-medium mt-1">
                      <Check className="h-3 w-3" />
                      Versé
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                  {payment.description}
                </p>

                {/* Media Section */}
                <div className="space-y-3 mb-6">
                  {/* Images */}
                  {payment.images && payment.images.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[#f26755]">
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {payment.images.length}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {payment.images
                          .slice(0, 3)
                          .map((img: string, idx: number) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Justificatif ${idx + 1}`}
                              className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-[#f26755] transition-colors"
                              onClick={() => setSelectedImage(img)}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                  {/* Documents */}
                  {payment.documents && payment.documents.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      {payment.documents.map((docUrl: string, idx: number) => (
                        <a
                          key={idx}
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[#f26755] hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Document {idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                <button
                  className="text-sm font-medium text-[#f26755] hover:text-[#f26755]/80 flex items-center gap-1 transition-colors"
                  onClick={() => handleViewDetails(payment)}
                >
                  <Eye className="h-4 w-4" />
                  Voir les détails
                  <ChevronRight className="h-4 w-4" />
                </button>

                {payment.status === "en_attente" && (
                  <button
                    onClick={() => handleRelance(payment)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors 
    ${
      relanceLoadingId === payment.id
        ? "bg-orange-100 text-orange-600 cursor-not-allowed border border-orange-300 shadow"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
                    disabled={relanceLoadingId === payment.id}
                  >
                    {relanceLoadingId === payment.id ? (
                      <span className="animate-spin mr-2">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                      </span>
                    ) : relanceSuccess === payment.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : relanceErrorId === payment.id ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    {relanceLoadingId === payment.id ? (
                      <span className="font-semibold text-orange-600">
                        Envoi en cours…
                      </span>
                    ) : relanceSuccess === payment.id ? (
                      <span className="font-semibold text-green-600">
                        Envoyé
                      </span>
                    ) : relanceErrorId === payment.id ? (
                      <span className="font-semibold text-red-600">Erreur</span>
                    ) : (
                      "Relancer"
                    )}
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
                name="title"
                required
                value={form.title}
                onChange={handleSelectChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f26755] focus:border-[#f26755]"
              >
                <option value="" disabled>
                  Sélectionnez un type
                </option>
                <option value="Versement au démarrage">
                  Versement au démarrage
                </option>
                <option value="Versement mi chantier">
                  Versement mi chantier
                </option>
                <option value="A la fin des travaux">
                  A la fin des travaux
                </option>
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
                onChange={(e) =>
                  setDocumentFiles(
                    e.target.files ? Array.from(e.target.files) : []
                  )
                }
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
            <Button
              type="submit"
              disabled={formLoading}
              className="bg-[#f26755] hover:bg-[#e55a4a]"
            >
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
        title={selectedRequest?.title || ""}
        maxWidth="max-w-6xl"
      >
        {selectedRequest && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">
                  Informations générales
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Montant:</span>
                    <div className="bg-gradient-to-r from-[#f26755] to-[#e55a4a] bg-clip-text text-transparent">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold">
                          {selectedRequest.amount.toLocaleString("fr-FR")}
                        </span>
                        <span className="text-sm font-medium">€</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Date:</span>
                    <span className="font-semibold">
                      {formatDate(selectedRequest.date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Statut:</span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-0.5 border ${getStatusStyle(
                        selectedRequest.status
                      )}`}
                    >
                      {getStatusIcon(selectedRequest.status)}
                      {getStatusText(selectedRequest.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">
                  Description
                </h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedRequest.description}
                  </p>
                </div>
              </div>
            </div>

            {selectedRequest.images && selectedRequest.images.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                  Justificatifs
                </h4>
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

            {selectedRequest.documents &&
              selectedRequest.documents.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                    Documents
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedRequest.documents.map((docUrl, idx) => {
                      const fileName = decodeURIComponent(
                        docUrl.split("/").pop()?.split("?")[0] ||
                          `Document_${idx + 1}`
                      );
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
                            <p className="font-medium text-gray-900 truncate">
                              {fileName}
                            </p>
                            <p className="text-sm text-gray-500">
                              Cliquez pour télécharger
                            </p>
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
            <Button
              type="submit"
              disabled={isNotificationSent}
              className="bg-[#f26755] hover:bg-[#e55a4a]"
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
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}