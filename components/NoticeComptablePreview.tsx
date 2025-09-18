import React, { useState, useEffect } from "react";
import { Devis } from "@/types/devis";
import {
  getUserById,
  User,
  ArtisanUser,
  CourtierUser,
} from "@/lib/firebase/users";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { entreprise } from "@/types/aximotravo";
import {
  ProjectDetails,
  getProjectDetail,
} from "@/app/artisan/projects/[id]/ProjectDetails";

interface NoticeComptablePreviewProps {
  userId: string;
  devis: Devis;
  onClose?: () => void;
  isModal?: boolean;
}

export const NoticeComptablePreview: React.FC<
  NoticeComptablePreviewProps
> = ({ userId, devis, onClose, isModal = false }) => {
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [client, setClient] = useState<User | null>(null);
  const [artisan, setArtisan] = useState<ArtisanUser | null>(null);
  const [broker, setBroker] = useState<CourtierUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Chargement des données utilisateur et notice
  useEffect(() => {
    const loadData = async () => {
      if (!devis) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        // Charger l'utilisateur
        const userData = await getUserById(userId);
        if (userData && userData.role === "artisan") {
          setUser(userData as ArtisanUser);
        } else {
          setUser(userData as CourtierUser);
        }

        // Charger le projet si disponible
        if (devis?.projectId) {
          const projectData = await getProjectDetail(devis.projectId);
          setProject(projectData);

          // Charger le courtier si disponible
          if (projectData?.broker.id) {
            const brokerData = await getUserById(projectData.broker.id);
            setBroker(brokerData as CourtierUser);
          }

          // Charger le client si disponible
          if (projectData?.client_id) {
            const clientData = await getUserById(projectData.client_id);
            setClient(clientData);
          }
        }

        // Charger l'artisan assigné au devis
        if (devis?.attribution?.artisanId) {
          const artisanData = await getUserById(devis.attribution.artisanId);
          if (artisanData && artisanData.role === "artisan") {
            setArtisan(artisanData as ArtisanUser);
          }
        }

      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, devis?.projectId, devis?.id]);

  // Calcul du montant total du devis
  const calculateDevisTotal = () => {
    if (!devis) return { totalHT: 0, totalTVA: 0, totalTTC: 0 };
    
    let totalHTGeneral = 0;
    let totalTVAGeneral = 0;

    (devis.selectedItems ?? []).forEach((item) => {
      if (!item.isOffered) {
        const itemHT = item.prix_ht * item.quantite;
        const itemTVA = itemHT * ((item.tva || 0) / 100);
        totalHTGeneral += itemHT;
        totalTVAGeneral += itemTVA;
      }
    });

    return {
      totalHT: totalHTGeneral,
      totalTVA: totalTVAGeneral,
      totalTTC: totalHTGeneral + totalTVAGeneral,
    };
  };

  const devisTotals = calculateDevisTotal();
  
  // Calcul des commissions
  const commissionCourtierHT = (devisTotals.totalHT * 12) / 100;
  const commissionCourtierTTC = commissionCourtierHT * 1.2;
  
  const commissionAximotravoHT = (devisTotals.totalHT * 3) / 100;
  const commissionAximotravoTTC = commissionAximotravoHT * 1.2;
  
  const totalCommissionTTC = commissionCourtierTTC + commissionAximotravoTTC;
  const soldeClient = devisTotals.totalTTC - totalCommissionTTC;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const generateNoticeNumber = () => {
    if (!devis) return ""; // Sécurité
    let devisDate: Date;

    if (devis?.createdAt instanceof Date) {
      devisDate = devis.createdAt;
    } else if (
      devis?.createdAt &&
      typeof (devis.createdAt as any).toDate === "function"
    ) {
      devisDate = (devis.createdAt as any).toDate();
    } else {
      devisDate = new Date();
    }

    const year = devisDate.getFullYear();
    const month = String(devisDate.getMonth() + 1).padStart(2, "0");
    const devisIdHash = devis?.id?.slice(-4) || '0000';

    return `NC${year.toString().slice(-2)}${month}-${devisIdHash}`;
  };

  const formatDate = (date: Date | Timestamp | any) => {
    let dateObj: Date;

    if (date && typeof date.toDate === "function") {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date();
    }

    return dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Sécurité: Ne rien rendre si le devis n'est pas disponible
  if (!devis) {
    return null;
  }

  return (
    <div className={`bg-white ${isModal ? "p-4" : "min-h-screen p-6"}`}>
      <div className="max-w-4xl mx-auto bg-white shadow-lg border">
        {/* Header avec actions */}
        {!isModal && (
          <div className="bg-white p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Notice Comptable
            </h1>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
              >
                Fermer
              </Button>
            </div>
          </div>
        )}

        {/* En-tête avec logo et numéro de notice */}
        <div className="p-4 sm:p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img
                src={entreprise.logoUrl}
                alt="AXIMOTRAVO"
                className="h-16 sm:h-20 w-auto"
              />
            </div>

            {/* Numéro de notice et date */}
            <div className="text-center sm:text-right">
              <div className="border border-green-200 p-3 sm:p-4 bg-green-50">
                <h1 className="text-base sm:text-lg font-bold mb-1 text-green-700">
                  Notice Comptable
                </h1>
                <p className="text-base sm:text-lg font-bold text-green-700">
                  {generateNoticeNumber()}
                </p>
                <p className="text-xs sm:text-sm mt-2 text-green-600">
                  {formatDate(new Date())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau principal - Format identique à l'image */}
        <div className="p-4 sm:p-6">
          <div className="border border-gray-300 overflow-hidden">
            {/* En-tête du tableau */}
            <div className="grid grid-cols-3 bg-green-100 border-b border-gray-300">
              <div className="p-3 border-r border-gray-300">
                <span className="font-semibold text-sm">Notice comptable AXIMOTRAVO</span>
              </div>
              <div className="p-3 border-r border-gray-300 text-center">
                <span className="font-semibold text-sm">Montant HT (en €)</span>
              </div>
              <div className="p-3 text-center">
                <span className="font-semibold text-sm">Montant TTC (en €)</span>
              </div>
            </div>

            {/* Ligne Acompte Client */}
            <div className="grid grid-cols-3 border-b border-gray-300 bg-blue-50">
              <div className="p-3 border-r border-gray-300">
                <div className="font-medium text-blue-600">ACOMPTE CLIENT</div>
                <div className="text-xs text-gray-600 mt-1">
                  Chèque ou virement N° VIREMENTS DU {formatDate(new Date()).replace(/\//g, ' ').toUpperCase()}
                </div>
                <div className="text-xs text-gray-600">
                  Client : {client?.firstName?.toUpperCase() || 'CLIENT'} {client?.lastName?.toUpperCase() || 'HARDY'}
                </div>
              </div>
              <div className="p-3 border-r border-gray-300 text-right">
                <span className="font-medium">{formatPrice(devisTotals.totalHT).replace("€", "").trim()} €</span>
              </div>
              <div className="p-3 text-right">
                <span className="font-bold">{formatPrice(devisTotals.totalTTC).replace("€", "").trim()} €</span>
              </div>
            </div>

            {/* Ligne Facture Commission Courtier */}
            <div className="grid grid-cols-3 border-b border-gray-300">
              <div className="p-3 border-r border-gray-300">
                <div className="font-medium text-blue-600">FACTURE COMMISSION COURTIER</div>
                <div className="text-xs text-gray-600 mt-1">
                  N° Facture FA{new Date().getFullYear().toString().slice(-2)}{String(new Date().getMonth() + 1).padStart(2, '0')}-{devis?.id?.slice(-4)}
                </div>
              </div>
              <div className="p-3 border-r border-gray-300 text-right">
                <span className="font-medium">{formatPrice(commissionCourtierHT).replace("€", "").trim()} €</span>
              </div>
              <div className="p-3 text-right">
                <span className="font-bold">{formatPrice(commissionCourtierTTC).replace("€", "").trim()} €</span>
              </div>
            </div>

            {/* Ligne Facture Gestion Compte Sécure Acompte */}
            <div className="grid grid-cols-3 border-b border-gray-300">
              <div className="p-3 border-r border-gray-300">
                <div className="font-medium text-blue-600">FACTURE GESTION COMPTE SECURE ACOMPTE</div>
                <div className="text-xs text-gray-600 mt-1">
                  N° Facture FA{new Date().getFullYear().toString().slice(-2)}{String(new Date().getMonth() + 1).padStart(2, '0')}-{devis?.id?.slice(-4)}52
                </div>
              </div>
              <div className="p-3 border-r border-gray-300 text-right">
                <span className="font-medium">{formatPrice(commissionAximotravoHT).replace("€", "").trim()} €</span>
              </div>
              <div className="p-3 text-right">
                <span className="font-bold">{formatPrice(commissionAximotravoTTC).replace("€", "").trim()} €</span>
              </div>
            </div>

            {/* Ligne Solde Virement - Mise en évidence */}
            <div className="grid grid-cols-3 bg-yellow-50 border-b border-gray-300">
              <div className="p-3 border-r border-gray-300">
                <div className="font-bold text-orange-600">SOLDE VIREMENT {generateNoticeNumber().slice(-4)}</div>
              </div>
              <div className="p-3 border-r border-gray-300 text-right">
                <span className="font-medium"></span>
              </div>
              <div className="p-3 text-right">
                <span className="font-bold text-orange-600 text-lg">{formatPrice(soldeClient).replace("€", "").trim()} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informations complémentaires */}
        <div className="mt-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">Informations sur la transaction</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Numéro du devis :</span>
                <span className="ml-2 font-medium">{devis?.numero || devis?.id?.slice(0, 8).toUpperCase()}</span>
              </div>
              <div>
                <span className="text-gray-600">Date d'émission :</span>
                <span className="ml-2 font-medium">{formatDate(devis.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-600">Client :</span>
                <span className="ml-2 font-medium">
                  {client ? `${client.firstName} ${client.lastName}` : 'Non spécifié'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Référence notice :</span>
                <span className="ml-2 font-medium">{generateNoticeNumber()}</span>
              </div>
            </div>
          </div>

          {/* Récapitulatif des commissions */}
          <div className="bg-blue-50 p-4 rounded border border-blue-100">
            <h3 className="font-semibold text-blue-800 mb-3">Récapitulatif des commissions</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>• Commission courtier (12%) :</span>
                <span className="font-medium">{formatPrice(commissionCourtierTTC)} TTC</span>
              </div>
              <div className="flex justify-between">
                <span>• Commission Aximotravo (3%) :</span>
                <span className="font-medium">{formatPrice(commissionAximotravoTTC)} TTC</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total des commissions :</span>
                  <span className="text-red-600">{formatPrice(totalCommissionTTC)} TTC</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Solde disponible pour le client :</span>
                <span className="text-green-700">{formatPrice(soldeClient)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer légal */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="text-center text-xs text-gray-400 leading-relaxed">
            <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 mb-2">
              <span className="font-medium text-gray-500">
                {entreprise.nom.toUpperCase()}
              </span>
              <span className="text-gray-300">•</span>
              <span>{entreprise.statut}</span>
              <span className="text-gray-300">•</span>
              <a
                href={`https://${entreprise.site}`}
                className="hover:text-gray-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {entreprise.site}
              </a>
              <span className="text-gray-300">•</span>
              <a
                href={`mailto:${entreprise.email}`}
                className="hover:text-gray-600 transition-colors"
              >
                {entreprise.email}
              </a>
              <span className="text-gray-300">•</span>
              <a
                href={`tel:${entreprise.tel}`}
                className="hover:text-gray-600 transition-colors"
              >
                {entreprise.tel}
              </a>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-gray-400">
              <span>
                {entreprise.adresse}, {entreprise.codePostal}{" "}
                {entreprise.ville}
              </span>
              <span className="text-gray-300">•</span>
              <span>RCS {entreprise.rcs}</span>
              <span className="text-gray-300">•</span>
              <span>SIREN {entreprise.siren}</span>
              <span className="text-gray-300">•</span>
              <span>APE {entreprise.ape}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Modal pour la notice comptable
interface NoticeComptableModalProps {
  noticeComptablePreview: Devis | null;
  userId: string;
  setNoticeComptablePreview: (data: any) => void;
}

export const NoticeComptableModal: React.FC<NoticeComptableModalProps> = ({
  noticeComptablePreview,
  userId,
  setNoticeComptablePreview,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Charger les données utilisateur pour le PDF
  useEffect(() => {
    const loadUser = async () => {
      if (userId) {
        try {
          const userData = await getUserById(userId);
          setUser(userData);
        } catch (error) {
          console.error("Erreur lors du chargement de l'utilisateur:", error);
        }
      }
    };

    loadUser();
  }, [userId]);

  const handleGeneratePDF = async () => {
    if (!user || !noticeComptablePreview?.projectId) return;
    try {
      setIsGeneratingPDF(true);
      const { generateAndUploadNoticePDF } = await import("@/utils/generateAndUploadNoticePDF");
      const { url, fileName, blob } = await generateAndUploadNoticePDF(
        noticeComptablePreview,
        noticeComptablePreview.projectId
      );
      // Télécharger localement
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(href);
      console.log("✅ Notice comptable uploadée:", url);
    } catch (error) {
      console.error("❌ Erreur lors de la génération/upload du PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!noticeComptablePreview) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Notice Comptable</h2>
          <div className="flex gap-2">
            <Button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF || !user}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                  <span className="hidden sm:inline">Génération...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline ml-1">Télécharger</span>
                </>
              )}
            </Button>
            <Button
              onClick={() => setNoticeComptablePreview(null)}
              variant="outline"
              size="sm"
            >
              Fermer
            </Button>
          </div>
        </div>
        <NoticeComptablePreview
          userId={userId}
          devis={noticeComptablePreview as Devis}
          onClose={() => setNoticeComptablePreview(null)}
          isModal={true}
        />
      </div>
    </div>
  );
};
