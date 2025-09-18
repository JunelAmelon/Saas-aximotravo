// ====================
// Imports externes
// ====================
import React, { useEffect, useState } from "react";
import {
  Plus,
  Eye,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  FileText,
  Calendar,
  Euro,
  Search,
  Loader2,
  Mail,
  Send,
} from "lucide-react";
import { MoreVertical, UserCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useParams } from "next/navigation";
import { TVAHelper } from "./TVAHelper";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { addProjectDocument } from "@/hooks/useProjectDocuments";
import { FacturePreview } from "./FacturePreview";
import {NoticeComptablePreview, NoticeComptableModal} from "./NoticeComptablePreview";
import { FactureModal } from "./FacturePreview";
import { GenerateFacturePDF } from "./GenerateFacturePDF";
import {
  FactureCommissionPreview,
  FactureCommissionModal,
} from "./FactureCommissionPreview";
import { FactureType } from "@/types/facture";
// ====================
// Types et Interfaces
// ====================

/**
 * Représente un devis ou une facture dans le système.
 */
interface DevisItem {
  id: string;
  titre?: string;
  type?: string;
  status?: string;
  montant?: number;
  pdfUrl?: string;
  numero?: string;
  selectedItems?: any[];
  url?: string;
  attribution?: {
    artisanName?: string;
    artisanId?: string;
  };
}

/**
 * Représente un utilisateur (artisan, courtier, etc.) dans le système.
 */
export interface User {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
  courtierId: string;
  phone?: string;
  company?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
}

/**
 * Props du composant principal ModernDevisSection.
 * Permet de gérer l'affichage, la pagination, les filtres et les actions sur les devis/factures.
 */
interface ModernDevisSectionProps {
  activeDevisTab: "generes" | "uploades" | "Factures";
  setActiveDevisTab: (tab: "generes" | "uploades" | "Factures") => void;
  devisTabsData: {
    [key in "generes" | "uploades" | "Factures"]: {
      items: DevisItem[];
      setItems:
        | React.Dispatch<React.SetStateAction<DevisItem[]>>
        | (() => void);
      currentPage: number;
      setCurrentPage: (page: number) => void;
      itemsPerPage: number;
      type: "devis" | "devisConfig";
    };
  };
  filters: any;
  handleFilterChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  setShowCreateModal: (show: boolean) => void;
  setSelectedDevisId: (id: string) => void;
  handleEditDevis: (id: string) => void;
  handleUpdateDevisStatus: (
    type: "devis" | "devisConfig",
    id: string,
    status: string
  ) => void;
  updatingStatusId: string | null;
  userRole: string;
  currentUserId: string | null;
}

// Hook utilitaire : filtrage + pagination pour tous les onglets
import { useMemo, useRef } from "react";
import { Devis } from "@/types/devis";

// ====================
// Composant principal : ModernDevisSection
// ====================
export const ModernDevisSection: React.FC<ModernDevisSectionProps> = ({
  activeDevisTab,
  setActiveDevisTab,
  devisTabsData,
  filters,
  handleFilterChange,
  setShowCreateModal,
  setSelectedDevisId,
  handleEditDevis,
  handleUpdateDevisStatus,
  updatingStatusId,
  userRole,
  currentUserId,
}) => {
  // --- State hooks internes ---
  const [acceptedArtisans, setAcceptedArtisans] = useState<User[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignDevisId, setAssignDevisId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [sendingSignatureId, setSendingSignatureId] = useState<string | null>(null);
  // États pour la modal de commentaire avant envoi
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [pendingSendData, setPendingSendData] = useState<{
    devisId: string;
    type: "devis" | "devisConfig";
    projectId: string;
  } | null>(null);
  const [emailComment, setEmailComment] = useState("");
  // Récupération des paramètres d'URL (ex: projectId)
  const params = useParams() || {};
  const [selectedArtisanId, setSelectedArtisanId] = useState<string>("");
  const { toast } = useToast();

  const [facturePreview, setFacturePreview] = useState<Devis | null>(null);
  const [factureCommissionPreview, setFactureCommissionPreview] = useState<{
    devis: Devis;
    factureType: "commission_courtier" | "commission_aximotravo";
  } | null>(null);
  const [noticeComptablePreview, setNoticeComptablePreview] = useState<Devis | null>(null);

  // Fonction pour ouvrir la modal de commentaire avant envoi
  const handleOpenCommentModal = (
    devisId: string,
    type: "devis" | "devisConfig",
    projectId: string
  ) => {
    setPendingSendData({ devisId, type, projectId });
    setEmailComment("");
    setShowCommentModal(true);
  };

  // Fonction pour confirmer l'envoi avec commentaire
  const handleConfirmSendWithComment = () => {
    if (pendingSendData) {
      setShowCommentModal(false);
      handleSendToClient(
        pendingSendData.devisId,
        pendingSendData.type,
        pendingSendData.projectId,
        emailComment
      );
      setPendingSendData(null);
      setEmailComment("");
    }
  };

  // Fonction pour annuler l'envoi
  const handleCancelSend = () => {
    setShowCommentModal(false);
    setPendingSendData(null);
    setEmailComment("");
  };

  // Fonction pour envoyer l'email au client manuellement
  const handleSendToClient = async (
    devisId: string,
    type: "devis" | "devisConfig",
    projectId: string,
    comment?: string
  ) => {
    setSendingEmailId(devisId);

    // Afficher le toast de chargement
    const loadingToast = toast({
      title: "📤 Envoi en cours...",
      description: "Préparation et envoi de l'email au client",
      className: "border-blue-200 bg-blue-50 text-blue-800",
    });

    try {
      // Récupérer les informations du devis
      const devisRef = doc(db, type, devisId);
      const devisSnap = await getDoc(devisRef);
      const devisData = devisSnap.data();

      // Récupérer l'email du client via le projet
      const projectRef = doc(db, "projects", projectId);
      const projectSnap = await getDoc(projectRef);
      const projectData = projectSnap.data();

      if (!projectData?.client_id) {
        console.error("Client ID non trouvé pour le projet");
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Client non trouvé pour ce projet",
        });
        return;
      }

      // Récupérer les informations du client
      const clientRef = doc(db, "users", projectData.client_id);
      const clientSnap = await getDoc(clientRef);
      const clientData = clientSnap.data();

      if (!clientData?.email) {
        console.error("Email du client non trouvé");
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Email du client non trouvé",
        });
        return;
      }

      // Vérifier s'il s'agit du premier devis validé pour ce projet
      const isFirstValidatedDevis = await checkIfFirstValidatedDevis(
        projectId,
        devisId,
        type
      );

      // Construire l'URL sécurisée pour l'espace client
      const secureClientUrl = `https://app.secureacomptetravaux.com/auth/login`;

      // Générer et uploader un nouveau PDF sur Cloudinary à chaque envoi
      let pdfUrl: string;

      try {
        console.log(
          "🔄 Génération et upload d'un nouveau PDF pour envoi au client..."
        );
        console.log("📋 Données du devis:", {
          devisId,
          projectId,
          currentUserId,
          devisData: devisData ? "Présent" : "Absent",
        });

        const { generateAndUploadDevisPDF } = await import(
          "@/utils/generateAndUploadPDF"
        );
        pdfUrl = await generateAndUploadDevisPDF(
          devisData as any,
          projectId,
          currentUserId || ""
        );

        console.log("✅ Nouveau PDF généré et uploadé:", pdfUrl);
        console.log(
          "🔗 Vérification URL Cloudinary:",
          pdfUrl.includes("cloudinary") ? "✅ Cloudinary" : "❌ Pas Cloudinary"
        );

        // Vérifier que l'URL est bien de Cloudinary
        if (!pdfUrl.includes("cloudinary")) {
          throw new Error("URL PDF générée n'est pas de Cloudinary: " + pdfUrl);
        }
      } catch (error) {
        console.error("❌ Erreur génération/upload PDF:", error);
        console.error("📊 Détails de l'erreur:", {
          message: error instanceof Error ? error.message : "Erreur inconnue",
          stack: error instanceof Error ? error.stack : undefined,
        });

        // 🚫 PLUS DE FALLBACK LOCAL - Arrêter l'envoi si échec Cloudinary
        loadingToast.dismiss();
        toast({
          variant: "destructive",
          title: "❌ Erreur génération PDF",
          description:
            "Impossible de générer le PDF sur Cloudinary. Veuillez réessayer.",
        });
        setSendingEmailId(null);
        return; // Arrêter l'envoi
      }

      const emailSubject = isFirstValidatedDevis
        ? `Votre devis personnalisé est disponible - ${projectData.name}`
        : `Nouveau devis disponible - ${projectData.name}`;

      const loginInstructionsSection =
        isFirstValidatedDevis &&
        clientData.tempPassword &&
        !clientData.passwordRetrieved
          ? `
<!-- Section identifiants -->
<div style="border: 2px solid #e3f2fd; 
            background: #f8fbff; 
            border-radius: 6px; 
            padding: 16px; 
            margin: 24px 0;">
  <h4 style="color: #1976d2; 
             margin: 0 0 16px 0; 
             font-size: 16px; 
             font-weight: 600;
             text-transform: uppercase;
             letter-spacing: 0.5px;">
    Accès à votre espace client
  </h4>
  
  <p style="color: #495057; 
            font-size: 14px; 
            margin: 0 0 20px 0; 
            line-height: 1.5;">
    Voici vos identifiants de connexion pour accéder à votre espace personnel sécurisé :
  </p>
  
  <div style="margin-bottom: 20px;">
    <div style="padding: 8px 0; color: #6c757d; font-weight: 500; font-size: 14px;">
      Identifiant :
    </div>
    <div style="padding: 8px 0; color: #2c3e50; font-weight: 600; font-size: 14px; word-break: break-all;">
      ${clientData.email}
    </div>
    <div style="padding: 8px 0; color: #6c757d; font-weight: 500; font-size: 14px;">
      Mot de passe temporaire :
    </div>
    <div style="padding: 8px 0;">
      <code style="background: #f8f9fa; 
                  border: 1px solid #dee2e6; 
                  padding: 8px 12px; 
                  border-radius: 4px; 
                  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; 
                  font-size: 14px; 
                  color: #2c3e50;
                  font-weight: 600;
                  word-break: break-all;
                  display: inline-block;
                  max-width: 100%;">
        ${clientData.tempPassword}
      </code>
    </div>
  </div>
  
  <div style="background: #fff3cd; 
              border: 1px solid #ffeaa7; 
              border-radius: 4px; 
              padding: 12px; 
              margin: 16px 0 0 0;">
    <p style="margin: 0; 
              color: #856404; 
              font-size: 13px; 
              font-weight: 500;
              line-height: 1.4;">
      ⚠️ <strong>Important :</strong> Veuillez modifier ce mot de passe lors de votre première connexion.
    </p>
  </div>
</div>
`
          : ""; // Section vide si pas de mot de passe temporaire ou pas le premier devis

      const welcomeMessage = isFirstValidatedDevis
        ? `Nous avons le plaisir de vous transmettre votre devis pour le projet <strong>"${projectData.name}"</strong>. 
   Ce document détaillé reprend l'ensemble des prestations étudiées lors de notre entretien.`
        : `Votre nouveau devis pour le projet <strong>"${projectData.name}"</strong> est maintenant disponible dans votre espace client.`;

      const headerTitle = isFirstValidatedDevis
        ? "Votre devis personnalisé est disponible"
        : "Nouveau devis disponible";

      const emailHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devis Aximotravo</title>
  <style>
    /* Reset styles */
    * { box-sizing: border-box; }
    body, table, td, p, h1, h2, h3, h4 { margin: 0; padding: 0; }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        border-radius: 0 !important;
      }
      
      .header-content {
        padding: 24px 20px !important;
      }
      
      .main-content {
        padding: 24px 20px !important;
      }
      
      .footer-content {
        padding: 20px !important;
      }
      
      .header-flex {
        display: block !important;
      }
      
      .header-badge {
        margin-top: 16px !important;
        text-align: left !important;
      }
      
      .header-title {
        font-size: 20px !important;
        line-height: 1.2 !important;
      }
      
      .button-container {
        display: block !important;
        margin: 0 !important;
      }
      
      .button {
        display: block !important;
        width: 100% !important;
        margin: 8px 0 !important;
        text-align: center !important;
        box-sizing: border-box !important;
      }
      
      .info-table {
        display: block !important;
      }
      
      .info-row {
        display: block !important;
        margin-bottom: 12px !important;
      }
      
      .info-label {
        display: block !important;
        padding: 4px 0 !important;
        width: 100% !important;
      }
      
      .info-value {
        display: block !important;
        padding: 4px 0 !important;
        width: 100% !important;
      }
      
      .section-padding {
        padding: 16px !important;
        margin: 16px 0 !important;
      }
      
      .hide-mobile {
        display: none !important;
      }
    }
    
    @media only screen and (max-width: 480px) {
      .header-title {
        font-size: 18px !important;
      }
      
      .main-content {
        padding: 20px 16px !important;
      }
      
      .section-padding {
        padding: 12px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">

<div class="container" style="max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 8px; 
          overflow: hidden; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border: 1px solid #e9ecef;">

<!-- Header professionnel -->
<div class="header-content" style="background: #2c3e50; 
            padding: 32px 40px; 
            text-align: left;">
  
  <div class="header-flex" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
    <div style="color: #f26755; 
                font-size: 24px; 
                font-weight: 700; 
                letter-spacing: -0.5px;">
      AXIMOTRAVO
    </div>
    <div class="header-badge" style="background: rgba(242, 103, 85, 0.1); 
                color: #f26755; 
                padding: 6px 12px; 
                border-radius: 4px; 
                font-size: 12px; 
                font-weight: 600; 
                text-transform: uppercase; 
                letter-spacing: 0.5px;">
      NOUVEAU DEVIS
    </div>
  </div>
  
  <h1 class="header-title" style="color: white; 
             margin: 0; 
             font-size: 24px; 
             font-weight: 600; 
             line-height: 1.3;">
    ${headerTitle}
  </h1>
  
  <p style="color: #bdc3c7; 
            margin: 8px 0 0 0; 
            font-size: 16px; 
            font-weight: 400;
            line-height: 1.4;">
    Réf: ${
      devisData?.numero ||
      "#DEV-" +
        new Date().getFullYear() +
        "-" +
        Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")
    } <span class="hide-mobile">•</span><br class="show-mobile" style="display: none;"> ${new Date().toLocaleDateString(
        "fr-FR"
      )}
  </p>
</div>

<!-- Contenu principal -->
<div class="main-content" style="padding: 40px;">
  
  <!-- Salutation -->
  <div style="margin-bottom: 32px;">
    <p style="font-size: 16px; 
              color: #2c3e50; 
              margin: 0 0 16px 0; 
              line-height: 1.5;">
      Bonjour <strong>${clientData.firstName || ""} ${
        clientData.lastName || ""
      }</strong>,
    </p>
    
    <p style="font-size: 16px; 
              color: #495057; 
              margin: 0; 
              line-height: 1.6;">
      ${welcomeMessage}
    </p>
  </div>
  
  <!-- Informations du devis -->
  <div class="section-padding" style="background: #f8f9fa; 
              border: 1px solid #e9ecef; 
              border-radius: 6px; 
              padding: 24px; 
              margin: 32px 0;">
    <h3 style="color: #2c3e50; 
               margin: 0 0 20px 0; 
               font-size: 18px; 
               font-weight: 600;">
      Informations du devis
    </h3>
    
    <div class="info-table" style="width: 100%;">
      <div class="info-row" style="display: flex; margin-bottom: 8px;">
        <div class="info-label" style="color: #6c757d; font-weight: 500; width: 30%; font-size: 14px;">Projet :</div>
        <div class="info-value" style="color: #2c3e50; font-weight: 600; flex: 1; font-size: 14px; word-break: break-word;">${
          projectData.name
        }</div>
      </div>
      <div class="info-row" style="display: flex; margin-bottom: 8px;">
        <div class="info-label" style="color: #6c757d; font-weight: 500; width: 30%; font-size: 14px;">Référence :</div>
        <div class="info-value" style="color: #2c3e50; font-weight: 600; flex: 1; font-size: 14px; word-break: break-word;">${
          devisData?.reference ||
          "#DEV-" +
            new Date().getFullYear() +
            "-" +
            Math.floor(Math.random() * 1000)
              .toString()
              .padStart(3, "0")
        }</div>
      </div>
      <div class="info-row" style="display: flex; margin-bottom: 8px;">
        <div class="info-label" style="color: #6c757d; font-weight: 500; width: 30%; font-size: 14px;">Date d'envoi :</div>
        <div class="info-value" style="color: #2c3e50; font-weight: 600; flex: 1; font-size: 14px;">${new Date().toLocaleDateString(
          "fr-FR"
        )}</div>
      </div>
      <div class="info-row" style="display: flex;">
        <div class="info-label" style="color: #6c757d; font-weight: 500; width: 30%; font-size: 14px;">Validité :</div>
        <div class="info-value" style="color: #2c3e50; font-weight: 600; flex: 1; font-size: 14px;">30 jours</div>
      </div>
    </div>
  </div>
  
  <!-- Boutons d'action -->
  <div style="text-align: center; margin: 40px 0;">
    <div class="button-container" style="display: inline-block;">
      <a href="${secureClientUrl}" 
         class="button"
         style="display: inline-block; 
                background: #f26755; 
                color: white; 
                padding: 14px 28px; 
                text-decoration: none; 
                border-radius: 4px; 
                font-weight: 600; 
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border: none;
                margin: 0 8px;
                min-width: 200px;">
        CONSULTER LE DEVIS
      </a>
      <a href="${pdfUrl}" 
         class="button"
         style="display: inline-block; 
                background: transparent; 
                color: #6c757d; 
                padding: 14px 28px; 
                text-decoration: none; 
                border-radius: 4px; 
                font-weight: 600; 
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border: 2px solid #dee2e6;
                margin: 0 8px;
                min-width: 200px;">
        TÉLÉCHARGER PDF
      </a>
    </div>
  </div>
  
  ${loginInstructionsSection}
  
  ${
    comment
      ? `
  <!-- Message courtier -->
  <div class="section-padding" style="border-left: 4px solid #f26755; 
              background: #fafafa; 
              padding: 24px; 
              margin: 32px 0;">
    <h4 style="color: #2c3e50; 
               margin: 0 0 12px 0; 
               font-size: 16px; 
               font-weight: 600;">
      Message de votre courtier
    </h4>
    <p style="font-size: 15px; 
              color: #495057; 
              margin: 0; 
              line-height: 1.6; 
              font-style: italic;
              word-break: break-word;">
      "${comment}"
    </p>
    <p style="font-size: 14px; 
              color: #6c757d; 
              margin: 12px 0 0 0; 
              font-weight: 500;">
      — Votre courtier Aximotravo
    </p>
  </div>
  `
      : ""
  }
  
</div>

<!-- Footer -->
<!---<div class="footer-content" style="background: #f8f9fa; 
            padding: 24px 40px; 
            border-top: 1px solid #e9ecef;">
  <p style="font-size: 14px; 
            color: #6c757d; 
            margin: 0 0 8px 0; 
            text-align: center;
            line-height: 1.5;">
    Pour toute question, contactez-nous au <strong>01 23 45 67 89</strong><br>
    ou par email à <strong>contact@aximotravo.fr</strong>
  </p>
  <p style="font-size: 12px; 
            color: #adb5bd; 
            margin: 0; 
            text-align: center;
            line-height: 1.4;">
    &copy; 2024 Aximotravo • Société de courtage en travaux<br>
    SIRET 123 456 789 00012
  </p>
</div>--->

</div>

</body>
</html>
`;

      // Envoyer l'email
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: clientData.email,
          subject: emailSubject,
          html: emailHtml,
        }),
      });

      if (response.ok) {
        // Fermer le toast de chargement
        loadingToast.dismiss();

        // Mettre à jour le statut du devis à "Envoyé au client"
        try {
          await updateDoc(devisRef, {
            status: "Envoyé au client",
          });
          console.log("Statut du devis mis à jour à 'Envoyé au client'");

          // Mettre à jour l'état local pour rafraîchir l'interface
          const updateLocalDevisStatus = (items: DevisItem[]) => {
            return items.map((item) =>
              item.id === devisId
                ? { ...item, status: "Envoyé au client" }
                : item
            );
          };

          // Mettre à jour tous les onglets qui pourraient contenir ce devis
          if (type === "devisConfig") {
            devisTabsData["generes"].setItems((prev: DevisItem[]) =>
              updateLocalDevisStatus(prev)
            );
          } else {
            devisTabsData["uploades"].setItems((prev: DevisItem[]) =>
              updateLocalDevisStatus(prev)
            );
          }
        } catch (statusUpdateError) {
          console.error(
            "Erreur lors de la mise à jour du statut du devis:",
            statusUpdateError
          );
        }

        // Si c'est le premier devis et qu'un mot de passe temporaire a été envoyé, le supprimer
        if (isFirstValidatedDevis && clientData.tempPassword) {
          try {
            await updateDoc(clientRef, {
              tempPassword: null, // Supprimer le mot de passe pour sécurité
            });
            console.log("Mot de passe temporaire supprimé");
          } catch (passwordUpdateError) {
            console.error(
              "Erreur lors de la suppression du mot de passe temporaire:",
              passwordUpdateError
            );
          }
        }

        // Afficher le toast de succès
        toast({
          title: "✅ Email envoyé !",
          description:
            "L'email a été envoyé avec succès au client. Statut mis à jour.",
          className: "border-green-200 bg-green-50 text-green-800",
        });
      } else {
        throw new Error("Erreur lors de l'envoi de l'email");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);

      // Fermer le toast de chargement
      loadingToast.dismiss();

      // Afficher le toast d'erreur
      toast({
        variant: "destructive",
        title: "❌ Erreur d'envoi",
        description:
          "Impossible d'envoyer l'email au client. Veuillez réessayer.",
      });
    } finally {
      setSendingEmailId(null);
    }
  };

  // Fonction pour vérifier si c'est le premier devis validé
  const checkIfFirstValidatedDevis = async (
    projectId: string,
    currentDevisId: string,
    currentType: string
  ) => {
    try {
      // Vérifier dans la collection devis
      const devisQuery = query(
        collection(db, "devis"),
        where("projectId", "==", projectId),
        where("status", "in", ["Validé", "Envoyé au client"])
      );
      const devisSnapshot = await getDocs(devisQuery);

      // Vérifier dans la collection devisConfig
      const devisConfigQuery = query(
        collection(db, "devisConfig"),
        where("projectId", "==", projectId),
        where("status", "in", ["Validé", "Envoyé au client"])
      );
      const devisConfigSnapshot = await getDocs(devisConfigQuery);

      // Compter les devis validés en excluant le devis actuel
      let validatedCount = 0;

      devisSnapshot.docs.forEach((doc) => {
        if (!(currentType === "devis" && doc.id === currentDevisId)) {
          validatedCount++;
        }
      });

      devisConfigSnapshot.docs.forEach((doc) => {
        if (!(currentType === "devisConfig" && doc.id === currentDevisId)) {
          validatedCount++;
        }
      });

      return validatedCount === 0;
    } catch (error) {
      console.error("Erreur lors de la vérification du premier devis:", error);
      return false;
    }
  };

  // Fonction pour envoyer en signature (UpToSign)
  const handleSendForSignature = async (
    devisId: string,
    type: "devis" | "devisConfig",
    projectId: string
  ) => {
    setSendingSignatureId(devisId);

    const loadingToast = toast({
      title: "Signature: préparation...",
      description: "Vérification/génération du PDF et démarrage du processus",
      className: "border-blue-200 bg-blue-50 text-blue-800",
    });

    try {
      // Charger le devis
      const devisRef = doc(db, type, devisId);
      const devisSnap = await getDoc(devisRef);
      const devisData = devisSnap.data() as any;

      // Charger le projet et le client
      const projectRef = doc(db, "projects", projectId);
      const projectSnap = await getDoc(projectRef);
      const projectData: any = projectSnap.data();
      if (!projectData?.client_id) throw new Error("Client introuvable sur le projet");
      const clientRef = doc(db, "users", projectData.client_id);
      const clientSnap = await getDoc(clientRef);
      const clientData: any = clientSnap.data();
      if (!clientData?.email) throw new Error("Email du client introuvable");

      // Vérifier s'il existe déjà un document PDF
      const docsRef = collection(db, "documents");
      const qDocs = query(
        docsRef,
        where("projectId", "==", projectId),
        where("devisConfigId", "==", devisId)
      );
      const docsSnap = await getDocs(qDocs);
      let pdfUrl: string | undefined = docsSnap.docs[0]?.data()?.url;

      // Générer si manquant
      if (!pdfUrl) {
        const { generateAndUploadDevisPDF } = await import("@/utils/generateAndUploadPDF");
        pdfUrl = await generateAndUploadDevisPDF(devisData, projectId, currentUserId || "");
      }

      if (!pdfUrl) throw new Error("PDF introuvable ou non généré");

      // Démarrer le process de signature via API interne
      const signer = {
        email: clientData.email,
        firstName: clientData.firstName || "",
        lastName: clientData.lastName || "",
        mobile: clientData.phoneNumber || clientData.mobile || "",
        page: 1,
        posX: 50,
        posY: 80,
      };

      const res = await fetch("/api/uptosign-start-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfUrl, signers: [signer], subject: `Signature devis ${projectData.name}`, message: "Merci de procéder à la signature de votre devis." }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erreur démarrage signature: ${text}`);
      }

      const data = await res.json();
      console.log("UpToSign started:", data);

      loadingToast.dismiss();
      toast({
        title: "Invitation envoyée",
        description: "Le client a reçu l'email de signature",
        className: "border-green-200 bg-green-50 text-green-800",
      });
    } catch (err: any) {
      loadingToast.dismiss();
      toast({
        variant: "destructive",
        title: "Erreur signature",
        description: err?.message || "Echec de l'envoi pour signature",
      });
    } finally {
      setSendingSignatureId(null);
    }
  };

  // Upload devis via Cloudinary + Firestore
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);
  const CLOUDINARY_UPLOAD_URL =
    "https://api.cloudinary.com/v1_1/" +
    (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "") +
    "/upload";
  const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

  const triggerUpload = (category: "devis_estimatif" | "devis_artisan" | "devis_signe") => {
    setPendingCategory(category);
    fileInputRef.current?.click();
  };

  const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingCategory || !projectId) return;
    try {
      setUploadingDoc(true);
      // 1) Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Échec de l'upload Cloudinary");
      const data = await res.json();
      const uploadedUrl = data.secure_url as string;

      // 2) Persist document + create devis record via helper
      const nowIso = new Date().toISOString();
      const sizeLabel = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
      const statusLabel = pendingCategory === "devis_signe" ? "signé" : "en attente";
      const documentId = await addProjectDocument({
        projectId: projectId as string,
        name: file.name,
        category: pendingCategory,
        date: nowIso,
        size: sizeLabel,
        status: statusLabel as "signé" | "en attente",
        url: uploadedUrl,
      });

      // 3) Retrieve created devis by documentId to update UI immediately
      const devisCol = collection(db, "devis");
      const q = query(devisCol, where("documentId", "==", documentId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const created = { id: snap.docs[0].id, ...(snap.docs[0].data() as any) } as any;
        // Map to DevisItem minimal fields
        const newItem: any = {
          id: created.id,
          titre: created.titre,
          status: created.statut || created.status,
          url: created.pdfUrl,
          numero: created.numero,
        };
        // Determine which tab to inject
        const tabKey =
          pendingCategory === "devis_estimatif"
            ? "generes"
            : pendingCategory === "devis_artisan"
            ? "uploades"
            : "Factures";
        if (devisTabsData[tabKey] && typeof devisTabsData[tabKey].setItems === "function") {
          devisTabsData[tabKey].setItems((prev: any[]) => [newItem, ...prev]);
        }
        toast({
          title: "Document importé",
          description: "Le devis a été ajouté et classé dans l'onglet correspondant.",
        });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload échoué", description: err?.message || "Erreur inconnue" });
    } finally {
      setUploadingDoc(false);
      setPendingCategory(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ====================
  // Effet : Récupération des artisans acceptés pour le projet courant
  // ====================
  const projectId = params.id
    ? Array.isArray(params.id)
      ? params.id[0]
      : params.id
    : undefined;
  React.useEffect(() => {
    if (!projectId) return;
    async function getAcceptedArtisansForProject(projectId: string) {
      const q = query(
        collection(db, "artisan_projet"),
        where("projetId", "==", projectId),
        where("status", "==", "accepté") // ou "accepted" selon ta base
      );
      const snapshot = await getDocs(q);
      const artisanIds = snapshot.docs.map(
        (docSnap) => docSnap.data().artisanId
      );
      const users = await Promise.all(
        artisanIds.map(async (uid) => {
          const userDoc = await getDoc(doc(db, "users", uid));
          return userDoc.exists() ? { ...(userDoc.data() as User), uid } : null;
        })
      );
      return users.filter((u): u is User => u !== null);
    }
    getAcceptedArtisansForProject(projectId).then(setAcceptedArtisans);
  }, [projectId]);

  // ====================
  // Fonction utilitaire : Attribution d'un devis à un artisan
  // ====================
  async function attribuerDevis(
    devisId: string,
    artisanId: string,
    artisanName: string,
    type: "devis" | "devisConfig"
  ) {
    try {
      const devisRef = doc(db, type, devisId);
      await updateDoc(devisRef, {
        attribution: {
          artisanId,
          artisanName,
        },
      });
      window.alert("Attribution réussie !");
    } catch (err) {
      console.error("Erreur lors de l'attribution:", err);
      window.alert("Erreur lors de l'attribution du devis.");
    }
  }

  // --- Affichage des filtres ---
  const [showFilters, setShowFilters] = useState(false);

  // ====================
  // Sous-composant : Sélecteur de statut
  // ====================
  const StatutSelect = ({
    value,
    onChange,
    disabled,
    docId,
  }: {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
    docId: string;
  }) => {
    const statutOptions = [
      {
        value: "En Attente",
        label: "En Attente",
        bg: "bg-sky-50",
        text: "text-sky-700",
        border: "border-sky-200",
      },
      {
        value: "Annulé",
        label: "Annulé",
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
      },
      {
        value: "Validé",
        label: "Validé",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
      },
      {
        value: "À modifier",
        label: "À modifier",
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
      },
      {
        value: "Envoyé au client",
        label: "Envoyé au client",
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
      },
    ];

    if (updatingStatusId === docId) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#f26755] rounded-full animate-spin"></div>
          <span className="text-xs text-gray-600 font-medium">
            Mise à jour...
          </span>
        </div>
      );
    }

    const currentOption = statutOptions.find(
      (opt) => opt.value === (value || "En Attente")
    );
    const currentConfig = currentOption || statutOptions[0];

    return (
      <select
        aria-label="status"
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all outline-none cursor-pointer shadow-sm hover:shadow-md ${currentConfig.bg} ${currentConfig.text} ${currentConfig.border} focus:border-[#f26755] focus:ring-2 focus:ring-[#f26755]/20`}
        value={value || "En Attente"}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {statutOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  };

  function useFilteredPaginatedDevis({
    items,
    userRole,
    currentUserId,
    itemsPerPage,
    currentPage,
    extraFilter, // optionnel : pour appliquer d'autres filtres (recherche, statut, etc.)
  }: {
    items: any[];
    userRole: string;
    currentUserId: string | null;
    itemsPerPage: number;
    currentPage: number;
    extraFilter?: (item: any) => boolean;
  }) {
    // Filtrage selon le rôle + filtre supplémentaire éventuel
    const filtered = useMemo(() => {
      let arr = items;
      if (userRole === "artisan" && currentUserId) {
        arr = arr.filter(
          (devis) => devis.attribution?.artisanId === currentUserId
        );
      }
      if (extraFilter) {
        arr = arr.filter(extraFilter);
      }
      return arr;
    }, [items, userRole, currentUserId, extraFilter]);

    // Pagination
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const paginated = filtered.slice(startIdx, endIdx);

    return { paginated, totalPages, totalItems };
  }

  const filteredUploades = devisTabsData["uploades"].items.filter(
    (devis) => devis.attribution?.artisanId === currentUserId
  );

  //Uploade
  const {
    paginated: paginatedUploades,
    totalPages: totalPagesUploades,
    totalItems: totalItemsUploades,
  } = useFilteredPaginatedDevis({
    items: devisTabsData["uploades"].items,
    userRole,
    currentUserId,
    itemsPerPage: devisTabsData["uploades"].itemsPerPage,
    currentPage: devisTabsData["uploades"].currentPage,
    extraFilter: (item) => {
      // Filtre par titre
      const titreOk = filters.titre
        ? (item.titre || "").toLowerCase().includes(filters.titre.toLowerCase())
        : true;
      // Filtre par statut
      const statutOk = filters.status
        ? (item.status || "").toLowerCase() === filters.status.toLowerCase()
        : true;
      return titreOk && statutOk;
    },
  });

  const filteredGeneres = devisTabsData["generes"].items.filter(
    (devis) => devis.attribution?.artisanId === currentUserId
  );

  //Generer
  const {
    paginated: paginatedGeneres,
    totalPages: totalPagesGeneres,
    totalItems: totalItemsGeneres,
  } = useFilteredPaginatedDevis({
    items: devisTabsData["generes"].items,
    userRole,
    currentUserId,
    itemsPerPage: devisTabsData["generes"].itemsPerPage,
    currentPage: devisTabsData["generes"].currentPage,
    extraFilter: (item) => {
      // Filtre par titre
      const titreOk = filters.titre
        ? (item.titre || "").toLowerCase().includes(filters.titre.toLowerCase())
        : true;

      // Filtre par statut
      const statutOk = filters.status
        ? (item.status || "").toLowerCase() === filters.status.toLowerCase()
        : true;
      return titreOk && statutOk;
    },
  });

  //Factures
  const {
    paginated: paginatedFactures,
    totalPages: totalPagesFactures,
    totalItems: totalItemsFactures,
  } = useFilteredPaginatedDevis({
    items: devisTabsData["Factures"].items,
    userRole,
    currentUserId,
    itemsPerPage: devisTabsData["Factures"].itemsPerPage,
    currentPage: devisTabsData["Factures"].currentPage,
    extraFilter: (item) => {
      // Filtre par titre
      const titreOk = filters.titre
        ? (item.titre || "").toLowerCase().includes(filters.titre.toLowerCase())
        : true;
      // Filtre par statut
      const statutOk = filters.status
        ? (item.status || "").toLowerCase() === filters.status.toLowerCase()
        : true;
      return titreOk && statutOk;
    },
  });

  // ====================
  // Pagination générique
  // ====================
  const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
  }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 px-6 pb-6">
        <div className="text-sm text-gray-600">
          Affichage de <span className="font-semibold">{startItem}</span> à{" "}
          <span className="font-semibold">{endItem}</span> sur{" "}
          <span className="font-semibold">{totalItems}</span> éléments
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="bouton"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === pageNum
                    ? "bg-[#f26755] text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            aria-label="bouton"
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8">
      {/*
          ====================
          Onglets principaux (Estimatif créé, Devis artisan, Devis signé)
          ====================
        */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
          {/* Estimatif créé (generes) en premier */}
          <button
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeDevisTab === "generes"
                ? "bg-white text-[#f26755] shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveDevisTab("generes")}
          >
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Estimatif créé</span>
              <span className="sm:hidden">Estimatif</span>
            </div>
          </button>
          {/* Devis artisan (uploades) en deuxième */}
          <button
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeDevisTab === "uploades"
                ? "bg-white text-[#f26755] shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveDevisTab("uploades")}
          >
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Devis artisan</span>
              <span className="sm:hidden">Artisan</span>
            </div>
          </button>
          <button
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeDevisTab === "Factures"
                ? "bg-white text-[#f26755] shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveDevisTab("Factures")}
          >
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Devis signé</span>
              <span className="sm:hidden">Signé</span>
            </div>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <TVAHelper />
          {userRole !== "artisan" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f26755] hover:bg-[#e55a4a] text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Créer un estimatif</span>
              <span className="sm:hidden">Créer</span>
            </button>
          )}
          <button
            onClick={() => triggerUpload("devis_estimatif")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f26755] hover:bg-[#e55a4a] text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            Upload devis estimatif
          </button>
        </div>
      </div>

      {/*
          ====================
          Contenu dynamique selon l'onglet sélectionné
          ====================
        */}
      {activeDevisTab === "uploades" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/*
                --- Header avec filtres pour les devis importés ---
              */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">Devis artisan</h4>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    showFilters
                      ? "bg-[#f26755] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                </button>
                <button
                  onClick={() => triggerUpload("devis_artisan")}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#f26755] text-white hover:bg-[#e55a4a]"
                >
                  <Download className="h-4 w-4" />
                  Upload devis artisan
                </button>
              </div>
            </div>

            {/* Filtres */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                showFilters ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par titre..."
                    name="titre"
                    value={filters.titre}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f26755]/20 focus:border-[#f26755] transition-colors"
                  />
                </div>
                <select
                  aria-label="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f26755]/20 focus:border-[#f26755] transition-colors"
                >
                  <option value="">Tous les status</option>
                  <option value="Validé">Validé</option>
                  <option value="En attente">En attente</option>
                  <option value="À modifier">À modifier</option>
                  <option value="Annulé">Annulé</option>
                </select>
              </div>
            </div>
          </div>

          {/* --- Tableau des devis importés --- */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Attribué
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUploades.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">Devis importés de mon artisan</p>
                        <p className="text-sm text-gray-400">Essayez de modifier vos filtres</p>
                        <button
                          type="button"
                          onClick={() => triggerUpload("devis_artisan")}
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f26755] text-white hover:bg-[#e55a4a]"
                          title="Uploader un devis artisan (PDF)"
                        >
                          Upload devis artisan
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUploades.map((devisItem) => (
                    <tr
                      key={devisItem.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {devisItem.titre || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">
                          {devisItem.type || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {devisItem.attribution?.artisanName || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatutSelect
                          value={devisItem.status || "En Attente"}
                          onChange={(value) =>
                            handleUpdateDevisStatus(
                              "devis",
                              devisItem.id,
                              value
                            )
                          }
                          disabled={updatingStatusId !== null}
                          docId={devisItem.id}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {typeof devisItem.montant === "number"
                              ? devisItem.montant.toLocaleString("fr-FR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              aria-label="bouton"
                              className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {userRole === "courtier" &&
                              (!devisItem.attribution ||
                                !devisItem.attribution.artisanId) && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setAssignDevisId(devisItem.id);
                                    setShowAssignModal(true);
                                  }}
                                >
                                  <UserCheck className="w-4 h-4 mr-2" />{" "}
                                  Attribuer
                                </DropdownMenuItem>
                              )}
                            {devisItem.pdfUrl && (
                              <>
                                <DropdownMenuItem asChild>
                                  <a
                                    href={devisItem.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 w-full"
                                  >
                                    <FileText className="w-4 h-4 mr-2" />{" "}
                                    Visualiser PDF
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a
                                    href={devisItem.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="flex items-center gap-3 w-full"
                                  >
                                    <Download className="w-4 h-4 mr-2" />{" "}
                                    Télécharger PDF
                                  </a>
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                handleOpenCommentModal(
                                  devisItem.id,
                                  "devis",
                                  projectId || ""
                                )
                              }
                              disabled={sendingEmailId === devisItem.id}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Envoyer au client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {paginatedUploades.length > 0 && (
            <Pagination
              currentPage={devisTabsData["uploades"].currentPage}
              totalPages={totalPagesUploades}
              onPageChange={devisTabsData["uploades"].setCurrentPage}
              totalItems={totalItemsUploades}
              itemsPerPage={devisTabsData["uploades"].itemsPerPage}
            />
          )}
        </div>
      )}

      {/* Hidden file input for uploads */}
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        className="hidden"
        onChange={handleLocalFileUpload}
      />

      {/*
          ====================
          Section : Devis créés
          ====================
        */}
      {activeDevisTab === "generes" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">Estimatif créé</h4>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    showFilters
                      ? "bg-[#f26755] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                </button>
                <button
                  onClick={() => triggerUpload("devis_estimatif")}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#f26755] text-white hover:bg-[#e55a4a]"
                >
                  <Download className="h-4 w-4" />
                  Upload devis estimatif
                </button>
              </div>
            </div>

            {/* Filtres */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                showFilters ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par titre..."
                    name="titre"
                    value={filters.titre}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f26755]/20 focus:border-[#f26755] transition-colors"
                  />
                </div>
                <select
                  aria-label="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f26755]/20 focus:border-[#f26755] transition-colors"
                >
                  <option value="">Tous les statuts</option>
                  <option value="Validé">Validé</option>
                  <option value="En attente">En attente</option>
                  <option value="À modifier">À modifier</option>
                  <option value="Annulé">Annulé</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Attribué
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedGeneres.length > 0 ? (
                  paginatedGeneres.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {doc.numero || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {doc.titre || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {doc.attribution?.artisanName || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatutSelect
                          value={doc.status || "En Attente"}
                          onChange={(value) =>
                            handleUpdateDevisStatus(
                              "devisConfig",
                              doc.id,
                              value
                            )
                          }
                          disabled={updatingStatusId !== null}
                          docId={doc.id}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {Array.isArray(doc.selectedItems) &&
                            doc.selectedItems.length > 0
                              ? doc.selectedItems
                                  .reduce((sum: number, item: any) => {
                                    const tva =
                                      typeof item.tva === "number"
                                        ? item.tva
                                        : parseFloat(item.tva as string) || 20;
                                    return (
                                      sum +
                                      item.quantite *
                                        item.prix_ht *
                                        (1 + tva / 100)
                                    );
                                  }, 0)
                                  .toLocaleString("fr-FR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              aria-label="bouton"
                              className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditDevis(doc.id)}
                            >
                              <FileText className="w-4 h-4 mr-2" /> Modifier
                            </DropdownMenuItem>
                            {userRole === "courtier" &&
                              (!doc.attribution ||
                                !doc.attribution.artisanId) && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setAssignDevisId(doc.id);
                                    setShowAssignModal(true);
                                  }}
                                >
                                  <UserCheck className="w-4 h-4 mr-2" /> Attribuer
                                </DropdownMenuItem>
                              )}
                            {userRole === "artisan" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleOpenCommentModal(
                                    doc.id,
                                    "devisConfig",
                                    projectId || ""
                                  )
                                }
                                disabled={sendingEmailId === doc.id}
                              >
                                <Send className="w-4 h-4 mr-2" /> Envoyer au client
                              </DropdownMenuItem>
                            )}
                            {userRole === "artisan" && doc.status === "Validé" && (
                              <DropdownMenuItem
                                onClick={() => handleSendForSignature(doc.id, "devisConfig", projectId || "")}
                                disabled={sendingSignatureId === doc.id}
                              >
                                <Send className="w-4 h-4 mr-2" /> Envoyer pour signature
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">Aucun estimatif créé</p>
                        <p className="text-sm text-gray-400">Commencez par créer votre premier estimatif</p>
                        <button
                          type="button"
                          onClick={() => triggerUpload("devis_estimatif")}
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f26755] text-white hover:bg-[#e55a4a]"
                          title="Uploader un estimatif (PDF)"
                        >
                          Upload devis estimatif
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {paginatedGeneres.length > 0 && (
            <Pagination
              currentPage={devisTabsData["generes"].currentPage}
              totalPages={totalPagesGeneres}
              onPageChange={devisTabsData["generes"].setCurrentPage}
              totalItems={totalItemsGeneres}
              itemsPerPage={devisTabsData["generes"].itemsPerPage}
            />
          )}
        </div>
      )}
      {/*
          ====================
          Section : Factures validées
          ====================
        */}
      {activeDevisTab === "Factures" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">Devis signé</h4>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    showFilters
                      ? "bg-[#f26755] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                </button>
                <button
                  onClick={() => triggerUpload("devis_signe")}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#f26755] text-white hover:bg-[#e55a4a]"
                >
                  <Download className="h-4 w-4" />
                  Upload devis signé
                </button>
              </div>
            </div>

            {/* Filtres */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                showFilters ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par titre..."
                    name="titre"
                    value={filters.titre}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f26755]/20 focus:border-[#f26755] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Attribué
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedFactures.length > 0 ? (
                  paginatedFactures.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {doc.numero || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {doc.titre || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {doc.attribution?.artisanName || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">{doc.status}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {Array.isArray(doc.selectedItems) &&
                            doc.selectedItems.length > 0
                              ? doc.selectedItems
                                  .reduce((sum: number, item: any) => {
                                    const tva =
                                      typeof item.tva === "number"
                                        ? item.tva
                                        : parseFloat(item.tva as string) || 20;
                                    return (
                                      sum +
                                      item.quantite *
                                        item.prix_ht *
                                        (1 + tva / 100)
                                    );
                                  }, 0)
                                  .toLocaleString("fr-FR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              aria-label="bouton"
                              className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {
                              <>
                                {userRole === "artisan" && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setFacturePreview(doc);
                                    }}
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Visualiser la facture
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      GenerateFacturePDF({
                                        devis: doc,
                                        userId: currentUserId || "",
                                      });
                                    }}
                                    className="flex items-center gap-3 w-full"
                                  >
                                    <Download className="w-4 h-4 mr-2" />{" "}
                                    Télécharger PDF
                                  </a>
                                </DropdownMenuItem>
                                {doc.status === "Validé" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleSendToClient(
                                          doc.id,
                                          "devis", // Les factures sont stockées comme devis avec un flag
                                          projectId || ""
                                        )
                                      }
                                      disabled={sendingEmailId === doc.id}
                                    >
                                      <Send className="w-4 h-4 mr-2" />
                                      Envoyer au client
                                    </DropdownMenuItem>
                                    {/* Options de factures de commission - Uniquement pour devis validés */}
                                    {/* Pour les artisans : seulement commission courtier */}
                                    {userRole === "artisan" && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            setFactureCommissionPreview({
                                              devis: doc,
                                              factureType:
                                                "commission_courtier",
                                            })
                                          }
                                        >
                                          <Euro className="w-4 h-4 mr-2" />
                                          Facture Commission Courtier
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            setFactureCommissionPreview({
                                              devis: doc,
                                              factureType:
                                                "commission_aximotravo",
                                            })
                                          }
                                        >
                                          <Euro className="w-4 h-4 mr-2" />
                                          Facture Commission Aximotravo
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            setNoticeComptablePreview(doc)
                                          }
                                        >
                                          <FileText className="w-4 h-4 mr-2" />
                                          Voir la notice comptable
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </>
                                )}
                              </>
                            }
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">Aucun devis signé</p>
                        <p className="text-sm text-gray-400">Les devis signés apparaîtront ici</p>
                        <button
                          type="button"
                          onClick={() => triggerUpload("devis_signe")}
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f26755] text-white hover:bg-[#e55a4a]"
                          title="Uploader un devis signé (PDF)"
                        >
                          Upload devis signé
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* --- Pagination des devis signés --- */}
          {paginatedFactures.length > 0 && (
            <Pagination
              currentPage={devisTabsData["Factures"].currentPage}
              totalPages={totalPagesFactures}
              onPageChange={devisTabsData["Factures"].setCurrentPage}
              totalItems={totalItemsFactures}
              itemsPerPage={devisTabsData["Factures"].itemsPerPage}
            />
          )}
        </div>
      )}

      {/* Modal de la notice comptable */}
      <NoticeComptableModal
        noticeComptablePreview={noticeComptablePreview}
        userId={currentUserId || ""}
        setNoticeComptablePreview={setNoticeComptablePreview}
      />

      {facturePreview && (
        <FactureModal
          facturePreview={facturePreview}
          userId={currentUserId || ""}
          setFacturePreview={setFacturePreview}
        />
      )}
      {/* Modal d'attribution d'un devis à un artisan */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            {/* Bouton de fermeture */}
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => {
                setShowAssignModal(false);
                setAssignDevisId(null);
                setSelectedArtisanId("");
              }}
            >
              <span className="sr-only">Fermer</span>×
            </button>
            <h3 className="text-lg font-semibold mb-4">
              Attribuer le devis à un artisan
            </h3>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Choisir un artisan
            </label>
            <select
              aria-label="aria"
              className="w-full border rounded px-3 py-2 mb-4"
              value={selectedArtisanId}
              onChange={(e) => setSelectedArtisanId(e.target.value)}
            >
              <option value="">Sélectionner...</option>
              {acceptedArtisans.map((artisan) => (
                <option key={artisan.uid} value={artisan.uid}>
                  {artisan.displayName || artisan.email}
                </option>
              ))}
            </select>
            <button
              className="w-full bg-[#f26755] hover:bg-[#e55a4a] text-white font-semibold py-2 rounded"
              disabled={!selectedArtisanId || userRole !== "courtier"}
              title={
                userRole !== "courtier"
                  ? "Seuls les courtiers peuvent attribuer un devis à un artisan."
                  : undefined
              }
              onClick={async () => {
                if (userRole !== "courtier") return;
                if (!assignDevisId || !selectedArtisanId) return;
                const artisan = acceptedArtisans.find(
                  (a) => a.uid === selectedArtisanId
                );
                if (!artisan) return;
                await attribuerDevis(
                  assignDevisId,
                  artisan.uid,
                  artisan.displayName || artisan.email,
                  activeDevisTab === "generes" ? "devisConfig" : "devis"
                );
                // Mise à jour du state local pour affichage immédiat
                devisTabsData[activeDevisTab].setItems((prev) =>
                  prev.map((devis) =>
                    devis.id === assignDevisId
                      ? {
                          ...devis,
                          attribution: {
                            artisanId: artisan.uid,
                            artisanName: artisan.displayName || artisan.email,
                          },
                        }
                      : devis
                  )
                );
                setShowAssignModal(false);
                setAssignDevisId(null);
                setSelectedArtisanId("");
              }}
            >
              {userRole !== "courtier"
                ? "Attribution réservée au courtier"
                : "Confirmer l'attribution"}
            </button>
          </div>
        </div>
      )}

      {/* Modal de commentaire avant envoi */}
      {showCommentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 relative">
            {/* Bouton de fermeture */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleCancelSend}
            >
              <span className="sr-only">Fermer</span>×
            </button>
            <h3 className="text-lg font-bold mb-4">
              📧 Envoyer le devis au client
            </h3>
            <p className="text-sm text-gray-600">
              Vous pouvez ajouter un message personnalisé qui sera inclus dans
              l'email envoyé au client.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💬 Message personnalisé (optionnel)
              </label>
              <textarea
                value={emailComment}
                onChange={(e) => setEmailComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f26755] focus:border-[#f26755] transition-colors resize-none"
                rows={4}
                placeholder="Exemple: Merci pour votre confiance, n'hésitez pas si vous avez des questions..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Ce message apparaîtra dans l'email avec un style mis en valeur.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                onClick={handleCancelSend}
              >
                Annuler
              </button>
              <button
                className="flex-1 px-4 py-3 bg-[#f26755] text-white rounded-lg hover:bg-[#e55a4a] transition-colors font-medium flex items-center justify-center gap-2"
                onClick={handleConfirmSendWithComment}
                disabled={sendingEmailId !== null}
              >
                <Send className="w-4 h-4" />
                {emailComment.trim()
                  ? "Envoyer avec message"
                  : "Envoyer sans message"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour les factures de commission */}
      <FactureCommissionModal
        factureCommissionPreview={factureCommissionPreview}
        userId={currentUserId || ""}
        setFactureCommissionPreview={setFactureCommissionPreview}
      />

      {/* Modal pour les factures classiques */}
      <FactureModal
        facturePreview={facturePreview}
        userId={currentUserId || ""}
        setFacturePreview={setFacturePreview}
      />
    </div>
  );

};
