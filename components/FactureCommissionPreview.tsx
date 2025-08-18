import React, { useState, useEffect } from "react";
import { Devis } from "@/types/devis";
import {
  Facture,
  FactureType,
  FACTURE_TYPE_OPTIONS,
  COMMISSION_RATES,
} from "@/types/facture";
import {
  getUserById,
  User,
  ArtisanUser,
  CourtierUser,
} from "@/lib/firebase/users";
import { getProjectById, Project } from "@/lib/firebase/projects";
import { GenerateFactureCommissionPDF } from "@/components/GenerateFactureCommissionPDF";
import { Button } from "@/components/ui/button";
import {
  Building,
  Download,
  Edit,
  User as UserIcon,
  FileText,
  Percent,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";
import {
  getOrCreateFactureCommissionData,
  FactureCommissionData,
} from "@/utils/factureCommissionPersistence";
import { entreprise } from "@/types/aximotravo";

interface FactureCommissionPreviewProps {
  userId: string;
  devis: Devis;
  factureType: "commission_courtier" | "commission_aximotravo";
  onClose?: () => void;
  isModal?: boolean;
}

export const FactureCommissionPreview: React.FC<
  FactureCommissionPreviewProps
> = ({ userId, devis, factureType, onClose, isModal = false }) => {
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<User | null>(null);
  const [artisan, setArtisan] = useState<ArtisanUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [factureData, setFactureData] = useState<FactureCommissionData | null>(
    null
  );
  const [tauxCommission, setTauxCommission] = useState<number>(
    factureType === "commission_courtier"
      ? COMMISSION_RATES.commission_courtier
      : COMMISSION_RATES.commission_aximotravo
  );

  // Chargement des données utilisateur et facture
  useEffect(() => {
    const loadData = async () => {
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
        if (devis.projectId) {
          const projectData = await getProjectById(devis.projectId);
          setProject(projectData);

          // Charger le client si disponible
          if (projectData?.client_id) {
            const clientData = await getUserById(projectData.client_id);
            setClient(clientData);
          }
        }

        // Charger l'artisan assigné au devis
        if (devis.attribution?.artisanId) {
          const artisanData = await getUserById(devis.attribution.artisanId);
          if (artisanData && artisanData.role === "artisan") {
            setArtisan(artisanData as ArtisanUser);
          }
        }

        // Calculer le montant de commission initial
        const devisTotals = calculateDevisTotal();
        const montantCommissionHT =
          (devisTotals.totalHT * tauxCommission) / 100;

        // Charger ou créer les données de facture persistées
        const factureDataPersisted = await getOrCreateFactureCommissionData(
          devis.id,
          devis.createdAt,
          factureType,
          tauxCommission,
          montantCommissionHT
        );

        setFactureData(factureDataPersisted);
        setTauxCommission(factureDataPersisted.tauxCommission);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, devis.projectId, devis.id, factureType]);

  // Calcul du montant total du devis
  const calculateDevisTotal = () => {
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
  // Commission calculée sur le montant HT du devis
  const montantCommissionHT = (devisTotals.totalHT * tauxCommission) / 100;
  const montantCommissionTTC = montantCommissionHT * 1.2; // TVA 20% sur commission

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const generateFactureNumber = () => {
    // Utiliser le numéro persisté si disponible
    if (factureData?.factureNumber) {
      return factureData.factureNumber;
    }

    // Fallback: générer un nouveau numéro (ne devrait pas arriver)
    let devisDate: Date;

    if (devis.createdAt instanceof Date) {
      devisDate = devis.createdAt;
    } else if (
      devis.createdAt &&
      typeof (devis.createdAt as any).toDate === "function"
    ) {
      devisDate = (devis.createdAt as any).toDate();
    } else {
      devisDate = new Date();
    }

    const year = devisDate.getFullYear();
    const month = String(devisDate.getMonth() + 1).padStart(2, "0");

    const prefix = factureType === "commission_courtier" ? "FC" : "FA";

    const devisIdHash = devis.id.slice(-4);
    const typeCode = factureType === "commission_courtier" ? "01" : "02";

    return `${prefix}${year
      .toString()
      .slice(-2)}${month}-${devisIdHash}${typeCode}`;
  };

  const handleGeneratePDF = async () => {
    if (!user) return;

    try {
      setIsGeneratingPDF(true);
      await GenerateFactureCommissionPDF({
        devis,
        userId: user.uid,
        factureType,
        tauxCommission,
        setLoading: setIsGeneratingPDF,
      });
      console.log("✅ PDF de facture de commission généré avec succès");
    } catch (error) {
      console.error("❌ Erreur lors de la génération du PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatDate = (date: Date | Timestamp | any) => {
    let dateObj: Date;

    if (date && typeof date.toDate === "function") {
      // C'est un Timestamp Firestore
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      // C'est déjà un objet Date
      dateObj = date;
    } else {
      // Fallback vers la date actuelle
      dateObj = new Date();
    }

    return dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getClientCode = () => {
    if (factureType === "commission_courtier" && user) {
      const firstName = user.firstName || "";
      const lastName = user.lastName || "";
      return (
        (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase() ||
        "COUR"
      );
    }
    return "AXIM";
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

  return (
    <div className={`bg-white ${isModal ? "p-4" : "min-h-screen p-6"}`}>
      <div className="max-w-4xl mx-auto bg-white shadow-lg border">
        {/* Header avec actions */}
        {!isModal && (
          <div className="bg-white p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Facture de Commission
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

        {/* En-tête avec logo et numéro de facture */}
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

            {/* Numéro de facture et date */}
            <div className="text-center sm:text-right">
              <div className="border border-orange-200 p-3 sm:p-4 bg-orange-50">
                <h1 className="text-base sm:text-lg font-bold mb-1 text-[#F26755]">
                  Facture
                </h1>
                <p className="text-base sm:text-lg font-bold text-[#F26755]">
                  {generateFactureNumber()}
                </p>
                <p className="text-xs sm:text-sm mt-2 text-orange-700">
                  {formatDate(new Date())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections Émetteur et Adresse de facturation */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Émetteur */}
            <div>
              <div className="border border-orange-200">
                <div className="bg-orange-100 px-3 py-1 border-b border-orange-200">
                  <h3 className="font-bold text-xs sm:text-sm text-[#F26755]">
                    ÉMETTEUR
                  </h3>
                </div>
                <div className="p-3 text-xs">
                  <p className="font-bold">{entreprise.nom}</p>
                  <p>{entreprise.adresse}</p>
                  <p>
                    {entreprise.codePostal} {entreprise.ville}
                  </p>
                  <p>SIRET: {entreprise.siren}</p>
                  <p>TVA: {entreprise.tva}</p>
                  <p>Tél: {entreprise.tel}</p>
                  <p>Email: {entreprise.email}</p>
                </div>
              </div>
            </div>

            {/* Adresse de facturation */}
            <div>
              <div className="border border-orange-200">
                <div className="bg-orange-100 px-3 py-1 border-b border-orange-200">
                  <h3 className="font-bold text-xs sm:text-sm text-[#F26755]">
                    ADRESSE DE FACTURATION
                  </h3>
                </div>
                <div className="p-3 text-xs">
                  <>
                    <p className="font-bold">
                      {artisan?.companyName ||
                        `${artisan?.firstName} ${artisan?.lastName}`}
                    </p>
                    {artisan?.companyAddress && (
                      <p>{artisan?.companyAddress}</p>
                    )}
                    {artisan?.companyPostalCode && artisan?.companyCity && (
                      <p>
                        {artisan?.companyPostalCode} {artisan?.companyCity}
                      </p>
                    )}
                    {artisan?.siret && <p>SIRET: {artisan?.siret}</p>}
                    {artisan?.companyPhone && (
                      <p>Tél: {artisan?.companyPhone}</p>
                    )}
                    <p>Email: {artisan?.companyEmail || artisan?.email}</p>
                  </>
                </div>
              </div>
            </div>
          </div>

          {/* Section Commission */}
          <div className="mb-6">
            <div className="border border-orange-200">
              <div className="bg-[#F26755] px-3 py-2 border-b border-orange-200">
                <h3 className="font-bold text-white">
                  {factureType === "commission_courtier"
                    ? "COMMISSION COURTIER"
                    : "COMMISSION GESTION AFFAIRE"}
                </h3>
              </div>

              {/* Tableau détaillé - Version desktop */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-orange-100 border-b border-orange-200">
                      <th className="border-r border-orange-200 px-3 py-2 text-left font-medium text-[#F26755]">
                        Désignation
                      </th>
                      <th className="border-r border-orange-200 px-3 py-2 text-center font-medium text-[#F26755]">
                        Prix unitaire € HT
                      </th>
                      <th className="border-r border-orange-200 px-3 py-2 text-center font-medium text-[#F26755]">
                        Qté
                      </th>
                      <th className="border-r border-orange-200 px-3 py-2 text-center font-medium text-[#F26755]">
                        Prix total € HT
                      </th>
                      <th className="px-3 py-2 text-center font-medium text-[#F26755]">
                        TVA
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-r border-orange-200 px-3 py-4 align-top">
                        <p className="font-medium">
                          {factureType === "commission_courtier"
                            ? "COMMISSION COURTIER"
                            : "COMMISSION GESTION AFFAIRE"}
                        </p>
                        <p className="text-xs mt-1">
                          Client: {client?.firstName?.toUpperCase()}{" "}
                          {client?.lastName?.toUpperCase()}
                        </p>
                        <p className="text-xs mt-1">
                          Commissionnement de {tauxCommission}% sur le montant
                          HT des travaux: {formatPrice(devisTotals.totalHT)}{" "}
                          suivant
                        </p>
                        <p className="text-xs">
                          le devis n° {devis.numero} daté du{" "}
                          {formatDate(devis.createdAt)} et accepté le
                        </p>
                        <p className="text-xs">{formatDate(devis.updatedAt)}</p>
                      </td>
                      <td className="border-r border-orange-200 px-3 py-4 text-center align-top">
                        {formatPrice(montantCommissionHT)
                          .replace("€", "")
                          .trim()}
                      </td>
                      <td className="border-r border-orange-200 px-3 py-4 text-center align-top">
                        1
                      </td>
                      <td className="border-r border-orange-200 px-3 py-4 text-center align-top">
                        {formatPrice(montantCommissionHT)
                          .replace("€", "")
                          .trim()}
                      </td>
                      <td className="px-3 py-4 text-center align-top">20% A</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Version mobile - Cards */}
              <div className="md:hidden">
                <div className="p-4 space-y-4">
                  <div className="bg-white border border-orange-200 rounded p-3">
                    <h4 className="font-medium text-[#F26755] mb-2">
                      {factureType === "commission_courtier"
                        ? "COMMISSION COURTIER"
                        : "COMMISSION GESTION AFFAIRE"}
                    </h4>
                    <div className="text-xs space-y-1 mb-3">
                      <p>
                        Client: {client?.firstName?.toUpperCase()}{" "}
                        {client?.lastName?.toUpperCase()}
                      </p>
                      <p>
                        Commissionnement de {tauxCommission}% sur le montant HT
                        des travaux: {formatPrice(devisTotals.totalHT)} suivant
                      </p>
                      <p>
                        le devis n° {devis.numero} daté du{" "}
                        {formatDate(devis.createdAt)} et accepté le{" "}
                        {formatDate(devis.updatedAt || devis.createdAt)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-orange-50 p-2 rounded">
                        <span className="text-[#F26755] font-medium">
                          Prix unitaire HT:
                        </span>
                        <br />
                        {formatPrice(montantCommissionHT)
                          .replace("€", "")
                          .trim()}
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <span className="text-[#F26755] font-medium">
                          Quantité:
                        </span>
                        <br />1
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <span className="text-[#F26755] font-medium">
                          Total HT:
                        </span>
                        <br />
                        {formatPrice(montantCommissionHT)
                          .replace("€", "")
                          .trim()}
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <span className="text-[#F26755] font-medium">TVA:</span>
                        <br />
                        20% A
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration du taux */}
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label className="text-sm font-medium text-[#F26755]">
                  Ajuster le taux de commission :
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tauxCommission}
                    onChange={(e) => setTauxCommission(Number(e.target.value))}
                    className="w-20 p-2 border border-orange-300 rounded text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <span className="text-sm text-orange-700">%</span>
                </div>
              </div>

              {/* Bouton de téléchargement PDF */}
              <Button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF || !user}
                className="bg-[#F26755] hover:bg-[#E55A4A] text-white px-4 py-2 rounded flex items-center gap-2 w-full sm:w-auto"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Conditions de paiement */}
          <div className="mb-6">
            <div className="border border-orange-200">
              <div className="bg-orange-100 px-3 py-2 border-b border-orange-200">
                <h3 className="font-bold text-sm md:text-base text-[#F26755]">
                  Conditions de paiement
                </h3>
              </div>
              <div className="p-3 md:p-4 text-xs md:text-sm space-y-2">
                <div className="bg-orange-50 p-3 rounded border-l-4 border-[#F26755]">
                  <p className="font-medium text-[#F26755] mb-2">
                    Modalités de règlement :
                  </p>
                  <p className="leading-relaxed">
                    Selon articles L 441-10 et suivants du code du commerce,
                    taux appliqué :{" "}
                    <span className="font-medium">15,21% par an</span>.
                  </p>
                  <p className="leading-relaxed mt-2">
                    Une indemnité forfaitaire de{" "}
                    <span className="font-medium text-[#F26755]">40 €</span>{" "}
                    sera due de plein droit dès le premier jour de retard de
                    paiement (Article D. 441-5 du code du commerce).
                  </p>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 pt-2 border-t border-orange-200">
                  <span className="font-medium text-[#F26755]">
                    Mode de règlement :
                  </span>
                  <span>Virement bancaire ou chèque</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <span className="font-medium text-[#F26755]">
                    Délai de paiement :
                  </span>
                  <span>30 jours à réception de facture</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer avec totaux */}
          <div className="flex justify-center md:justify-end">
            {/* Montant total */}
            <div className="w-full md:w-auto md:min-w-[400px]">
              <div className="border border-orange-200">
                <div className="bg-orange-100 px-3 py-2 border-b border-orange-200">
                  <h3 className="font-bold text-sm md:text-base text-[#F26755]">
                    Montant total lignes HT
                  </h3>
                  <div className="text-right font-bold text-lg text-[#F26755]">
                    {formatPrice(montantCommissionHT)}
                  </div>
                </div>
                <div className="p-3 text-xs md:text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Frais de port</span>
                    <span>-</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA collectée sur les débits</span>
                    <span>-</span>
                  </div>

                  {/* Version desktop - Tableau */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-5 gap-1 mt-2 border-t pt-2">
                      <div className="text-center font-medium">Code TVA</div>
                      <div className="text-center font-medium">%</div>
                      <div className="text-center font-medium">TTC €</div>
                      <div className="text-center font-medium">HT €</div>
                      <div className="text-center font-medium">TVA €</div>
                    </div>
                    <div className="grid grid-cols-5 gap-1 mt-1">
                      <div className="text-center">A</div>
                      <div className="text-center">20</div>
                      <div className="text-center">
                        {formatPrice(montantCommissionTTC)
                          .replace("€", "")
                          .trim()}
                      </div>
                      <div className="text-center">
                        {formatPrice(montantCommissionHT)
                          .replace("€", "")
                          .trim()}
                      </div>
                      <div className="text-center">
                        {formatPrice(montantCommissionHT * 0.2)
                          .replace("€", "")
                          .trim()}
                      </div>
                    </div>
                  </div>

                  {/* Version mobile - Cards */}
                  <div className="md:hidden mt-2 border-t pt-2">
                    <div className="bg-orange-50 p-2 rounded mb-2">
                      <div className="font-medium text-[#F26755] mb-1">
                        Détail TVA
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Code: A (20%)</div>
                        <div>TVA: {formatPrice(montantCommissionHT * 0.2)}</div>
                        <div>HT: {formatPrice(montantCommissionHT)}</div>
                        <div>TTC: {formatPrice(montantCommissionTTC)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-sm md:text-base">
                      <span>Montant total TTC</span>
                      <span className="text-[#F26755]">
                        {formatPrice(montantCommissionTTC)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs md:text-sm">
                    <p>Règlement: à réception de facture</p>
                    <p className="mt-1 font-medium text-[#F26755]">
                      Facture à régler
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer légal */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="text-center text-xs text-gray-400 leading-relaxed">
              {/* Ligne principale avec nom et contact */}
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

              {/* Ligne adresse et informations légales */}
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
    </div>
  );
};

// Composant Modal pour les factures de commission
interface FactureCommissionModalProps {
  factureCommissionPreview: {
    devis: Devis;
    factureType: "commission_courtier" | "commission_aximotravo";
  } | null;
  userId: string;
  setFactureCommissionPreview: (data: any) => void;
}

export const FactureCommissionModal: React.FC<FactureCommissionModalProps> = ({
  factureCommissionPreview,
  userId,
  setFactureCommissionPreview,
}) => {
  if (!factureCommissionPreview) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Facture de Commission</h2>
          <Button
            onClick={() => setFactureCommissionPreview(null)}
            variant="outline"
            size="sm"
          >
            Fermer
          </Button>
        </div>
        <FactureCommissionPreview
          userId={userId}
          devis={factureCommissionPreview.devis}
          factureType={factureCommissionPreview.factureType}
          onClose={() => setFactureCommissionPreview(null)}
          isModal={true}
        />
      </div>
    </div>
  );
};
