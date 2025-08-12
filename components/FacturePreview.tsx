import React, { useState, useEffect, ReactNode } from "react";
import { Devis } from "@/types/devis";
import { getUserById } from "@/lib/firebase/users";
import { ArtisanUser, User, CourtierUser } from "@/lib/firebase/users";
import { Timestamp } from "firebase/firestore";
import { getProjectById, Project } from "@/lib/firebase/projects";
import { pdf } from "@react-pdf/renderer";
import { FacturePDFDocument } from "./FacturePDFDocument";
import { Button } from "@/components/ui/button";
import { Building, Download, Edit, User as UserIcon } from "lucide-react";
import { GenerateFacturePDF } from "./GenerateFacturePDF";

interface FacturePreviewProps {
  userId: string;
  devis: Devis;
  onClose?: () => void;
  isModal?: boolean;
}

// Informations par défaut de l'entreprise pour les courtiers
export const DEFAULT_COMPANY_INFO = {
  logoUrl: "https://res.cloudinary.com/djdogxq0d/image/upload/v1753677699/logo_vvpiay.jpg",
  name: "Aximobat",
  address: "123 Rue de l'Innovation",
  postalCode: "75001",
  city: "Paris",
  phone: "01 23 45 67 89",
  email: "contact@Aximobat.com",
  companyLegalForm: "SAS",
  companyCapital: "100000",
  siret: "123456789012345",
  rcs: "123456789",
  companyApe: "12345",
};

export const FacturePreview: React.FC<FacturePreviewProps> = ({
  userId,
  devis,
  onClose,
  isModal = false,
}) => {
  const [user, setUser] = useState<ArtisanUser | CourtierUser | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Chargement des données utilisateur
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUserById(userId);
        if (userData && userData.role === "artisan") {
          setUser(userData as ArtisanUser);
        } else {
          setUser(userData as CourtierUser);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [userId]);

  // Chargement des données projet
  useEffect(() => {
    const loadProject = async () => {
      try {
        if (devis.projectId) {
          const projectData = await getProjectById(devis.projectId);
          setProject(projectData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du projet:", error);
      }
    };

    loadProject();
  }, [devis.projectId]);

  // Chargement des données client
  useEffect(() => {
    const loadClient = async () => {
      try {
        if (project?.client_id) {
          const clientData = await getUserById(project.client_id);
          setClient(clientData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du client:", error);
      } finally {
        setLoading(false);
      }
    };

    if (project) {
      loadClient();
    } else if (!devis.projectId) {
      // Si pas de projet, on arrête le loading
      setLoading(false);
    }
  }, [project]);

  const lotsMap = new Map();
  (devis.selectedItems ?? []).forEach((item) => {
    const lotKey = item.lotName || "Autre";
    if (!lotsMap.has(lotKey)) lotsMap.set(lotKey, []);
    lotsMap.get(lotKey).push(item);
  });

  const lotsTotals: {
    lotName: any;
    items: any;
    lotHT: number;
    lotTVA: number;
    lotTTC: number;
    tvaRate: any;
  }[] = [];
  let totalHTGeneral = 0;
  let totalTVAGeneral = 0;

  lotsMap.forEach((items, lotName) => {
    let lotHT = 0,
      lotTVA = 0;
    items.forEach(
      (item: { prix_ht: number; quantite: number; tva: number }) => {
        const itemHT = item.prix_ht * item.quantite;
        const itemTVA = itemHT * (item.tva / 100);
        lotHT += itemHT;
        lotTVA += itemTVA;
      }
    );
    const lotTTC = lotHT + lotTVA;
    lotsTotals.push({
      lotName,
      items,
      lotHT,
      lotTVA,
      lotTTC,
      tvaRate: items[0]?.tva,
    });
    totalHTGeneral += lotHT;
    totalTVAGeneral += lotTVA;
  });
  const totalTTCGeneral = totalHTGeneral + totalTVAGeneral;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

console.log(user);

  // Affichage du loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26755] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div
        className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden"
        style={{ borderColor: "#F26755", borderWidth: "1px" }}
      >
        {/* En-tête avec dégradé */}
        <div
          className="p-3 sm:p-6 lg:p-8"
          style={{ background: "linear-gradient(to right, #F26755, #E55145)" }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            {/* Logo entreprise */}
            <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
              {user && user.role === "artisan" ? (
                user?.companyLogoUrl ? (
                  <img
                    src={user.companyLogoUrl}
                    alt={user.companyName}
                    className="h-16 sm:h-20 lg:h-32 w-auto max-w-[200px] sm:max-w-[250px] lg:max-w-[300px] object-contain bg-white p-2 sm:p-3 rounded-xl shadow-lg"
                    onLoad={() => console.log('🖼️ Logo artisan chargé:', user.companyLogoUrl)}
                    onError={() => console.error('❌ Erreur chargement logo artisan:', user.companyLogoUrl)}
                  />
                ) : (
                  <div
                    className="h-16 sm:h-20 w-32 sm:w-40 bg-white bg-opacity-95 rounded-xl flex items-center justify-center border-2 border-white shadow-lg"
                    style={{ color: "#F26755" }}
                  >
                    <span className="text-sm sm:text-lg font-bold text-center px-2 leading-tight">
                      {user?.companyName || "Entreprise"}
                    </span>
                  </div>
                )
              ) : (
                <img
                  src={DEFAULT_COMPANY_INFO.logoUrl}
                  alt={DEFAULT_COMPANY_INFO.name}
                  className="h-16 sm:h-20 lg:h-32 w-auto max-w-[200px] sm:max-w-[250px] lg:max-w-[300px] object-contain bg-white p-2 sm:p-3 rounded-xl shadow-lg"
                  onLoad={() => console.log('🖼️ Logo courtier chargé:', DEFAULT_COMPANY_INFO.logoUrl)}
                  onError={() => console.error('❌ Erreur chargement logo courtier:', DEFAULT_COMPANY_INFO.logoUrl)}
                />
              )}
            </div>

            {/* Numéro de facture */}
            <div className="bg-white bg-opacity-95 p-3 sm:p-6 rounded-2xl shadow-lg w-full sm:min-w-[320px] sm:w-auto">
              <div className="text-center">
                <h2
                  className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3"
                  style={{ color: "#F26755" }}
                >
                  FACTURE N° {devis.numero}
                </h2>
                <div className="text-gray-700">
                  <p className="text-sm sm:text-base font-medium">
                    Date:{" "}
                    {devis.createdAt
                      ? devis.createdAt instanceof Timestamp
                        ? devis.createdAt.toDate().toLocaleDateString("fr-FR")
                        : devis.createdAt instanceof Date
                        ? devis.createdAt.toLocaleDateString("fr-FR")
                        : "-"
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations client */}
        <div
          className="p-3 sm:p-6 lg:p-8 border-b-4"
          style={{ borderColor: "#F26755" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            {/* Informations entreprise */}
            <div
              className="p-4 sm:p-6 rounded-2xl border-l-4"
              style={{ backgroundColor: "#F2675520", borderColor: "#F26755" }}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Building
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  style={{ color: "#F26755" }}
                />
                <h3
                  className="text-base sm:text-lg font-bold"
                  style={{ color: "#C5453A" }}
                >
                  PRESTATAIRE
                </h3>
              </div>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <p className="font-semibold text-gray-800">
                  {user?.role === "artisan"
                    ? user?.companyName
                    : DEFAULT_COMPANY_INFO.name}
                </p>
                <p className="text-gray-600">
                  {user?.role === "artisan"
                    ? user?.companyAddress
                    : DEFAULT_COMPANY_INFO.address}
                </p>
                <p className="text-gray-600">
                  {user?.role === "artisan"
                    ? `${user?.companyPostalCode} ${user?.companyCity}`
                    : `${DEFAULT_COMPANY_INFO.postalCode} ${DEFAULT_COMPANY_INFO.city}`}
                </p>
                <p className="text-gray-600">
                  Tél: {user?.role === "artisan" ? user?.companyPhone : user?.phone}
                </p>
                <p className="text-gray-600">
                  Email: {user?.role === "artisan" ? user?.companyEmail : user?.email}
                </p>
              </div>
            </div>

            {/* Informations client */}
            <div
              className="p-4 sm:p-6 rounded-2xl border-l-4"
              style={{ backgroundColor: "#F2675520", borderColor: "#F26755" }}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <UserIcon
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  style={{ color: "#F26755" }}
                />
                <h3
                  className="text-base sm:text-lg font-bold"
                  style={{ color: "#C5453A" }}
                >
                  CLIENT
                </h3>
              </div>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <p className="font-semibold text-gray-800">
                  {client?.firstName} {client?.lastName}
                </p>
                <p className="text-gray-600">{project?.location}</p>
                <p className="text-gray-600">
                  {project?.postalCode} {project?.addressDetails}
                </p>
                {client?.phone && (
                  <p className="text-gray-600">Tél: {client?.phone}</p>
                )}
                {client?.email && (
                  <p className="text-gray-600">Email: {client?.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Prestations par lot */}
        <div className="p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-10">
          {lotsTotals.map((lot, lotIndex) => (
            <div key={lot.lotName} className="space-y-0">
              {/* Titre du lot */}
              <div className="mb-3 sm:mb-4">
                <h2
                  className="text-lg sm:text-xl font-bold border-b-2 pb-2"
                  style={{ color: "#F26755", borderColor: "#F2675550" }}
                >
                  {lot.lotName}
                </h2>
              </div>

              {/* Tableau responsive */}
              <div
                className="overflow-x-auto rounded-xl border shadow-lg"
                style={{ borderColor: "#F26755" }}
              >
                <table className="w-full bg-white">
                  {/* En-tête du tableau */}
                  <thead
                    className="text-white"
                    style={{ backgroundColor: "#F26755" }}
                  >
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-4 text-left font-bold rounded-tl-xl text-xs sm:text-sm">
                        Prestation
                      </th>
                      <th className="px-1 sm:px-4 py-2 sm:py-4 text-center font-bold min-w-[10%] sm:min-w-[10%] text-xs sm:text-sm">
                        Qté
                      </th>
                      <th className="px-1 sm:px-4 py-2 sm:py-4 text-center font-bold min-w-[10%] sm:min-w-[10%] text-xs sm:text-sm">
                        PU HT
                      </th>
                      <th className="px-1 sm:px-4 py-2 sm:py-4 text-center font-bold min-w-[10%] sm:min-w-[10%] text-xs sm:text-sm">
                        Total HT
                      </th>
                      <th className="px-1 sm:px-4 py-2 sm:py-4 text-center font-bold min-w-[10%] sm:min-w-[10%] text-xs sm:text-sm">
                        TVA
                      </th>
                      <th className="px-1 sm:px-4 py-2 sm:py-4 text-center font-bold min-w-[10%] sm:min-w-[10%] text-xs sm:text-sm">
                        Total TTC
                      </th>
                    </tr>
                  </thead>

                  {/* Corps du tableau */}
                  <tbody
                    style={{ borderColor: "#F2675550" }}
                    className="divide-y"
                  >
                    {lot.items.map((item: any, itemIndex: number) => {
                      const montantHT = item.prix_ht * item.quantite;
                      const montantTVA = (montantHT * item.tva) / 100;
                      const montantTTC = montantHT + montantTVA;

                      return (
                        <tr
                          key={itemIndex}
                          className={`${
                            itemIndex % 2 === 0 ? "bg-white" : ""
                          } transition-colors`}
                          style={{
                            backgroundColor:
                              itemIndex % 2 === 1 ? "#F2675510" : "white",
                          }}
                          onMouseEnter={(e) =>
                            ((e.target as HTMLElement).closest(
                              "tr"
                            )!.style.backgroundColor = "#F2675520")
                          }
                          onMouseLeave={(e) =>
                            ((e.target as HTMLElement).closest(
                              "tr"
                            )!.style.backgroundColor =
                              itemIndex % 2 === 1 ? "#F2675510" : "white")
                          }
                        >
                          <td
                            className="px-2 sm:px-4 py-2 sm:py-4 border-r"
                            style={{ borderColor: "#F2675550" }}
                          >
                            <div>
                              <p className="font-semibold text-gray-800 text-xs sm:text-base leading-tight">
                                {item.optionLabel}
                              </p>
                              {item.description && (
                                <p className="hidden sm:block text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td
                            className="px-1 sm:px-4 py-2 sm:py-4 text-center border-r font-medium"
                            style={{ borderColor: "#F2675550" }}
                          >
                            <div className="text-xs sm:text-sm">
                              <div className="font-semibold">
                                {Number(item.quantite).toFixed(1)}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {item.unite}
                              </div>
                            </div>
                          </td>
                          <td
                            className="px-1 sm:px-4 py-2 sm:py-4 text-right border-r font-medium text-xs sm:text-sm"
                            style={{ borderColor: "#F2675550" }}
                          >
                            {formatPrice(item.prix_ht)}
                          </td>
                          <td
                            className="px-1 sm:px-4 py-2 sm:py-4 text-right border-r font-semibold text-xs sm:text-sm"
                            style={{ borderColor: "#F2675550" }}
                          >
                            {formatPrice(montantHT)}
                          </td>
                          <td
                            className="px-1 sm:px-4 py-2 sm:py-4 text-center border-r"
                            style={{ borderColor: "#F2675550" }}
                          >
                            <span
                              className="px-1 sm:px-2 py-1 rounded-full text-xs sm:text-sm font-medium"
                              style={{
                                backgroundColor: "#F2675520",
                                color: "#C5453A",
                              }}
                            >
                              {item.tva}%
                            </span>
                          </td>
                          <td
                            className="px-1 sm:px-4 py-2 sm:py-4 text-right font-bold text-sm sm:text-lg"
                            style={{ color: "#F26755" }}
                          >
                            {formatPrice(montantTTC)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* Pied du tableau avec totaux */}
                  <tfoot>
                    {/* Ligne Total HT */}
                    <tr
                      className="border-t-2"
                      style={{
                        backgroundColor: "#F2675520",
                        borderColor: "#F26755",
                      }}
                    >
                      <td
                        colSpan={5}
                        className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-sm sm:text-base"
                        style={{ color: "#C5453A" }}
                      >
                        Total HT du lot :
                      </td>
                      <td
                        className="px-2 sm:px-4 py-2 sm:py-3 text-right font-bold text-sm sm:text-lg border-r"
                        style={{ borderColor: "#F26755", color: "#C5453A" }}
                      >
                        {formatPrice(lot.lotHT)}
                      </td>
                    </tr>

                    {/* Ligne Total TVA */}
                    <tr style={{ backgroundColor: "#F2675520" }}>
                      <td
                        colSpan={5}
                        className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-sm sm:text-base"
                        style={{ color: "#C5453A" }}
                      >
                        Total TVA du lot :
                      </td>
                      <td
                        className="px-2 sm:px-4 py-2 sm:py-3 text-right font-bold text-sm sm:text-lg border-r"
                        style={{ borderColor: "#F26755", color: "#C5453A" }}
                      >
                        {formatPrice(lot.lotTVA)}
                      </td>
                    </tr>

                    {/* Ligne Total TTC - Mise en valeur */}
                    <tr
                      className="border-t-2"
                      style={{
                        background:
                          "linear-gradient(to right, #F2675540, #F2675530)",
                        borderColor: "#F26755",
                      }}
                    >
                      <td
                        colSpan={5}
                        className="px-2 sm:px-4 py-3 sm:py-4 text-right font-bold text-lg sm:text-xl"
                        style={{ color: "#C5453A" }}
                      >
                        Total TTC du lot :
                      </td>
                      <td className="px-2 sm:px-4 py-3 sm:py-4 text-right">
                        <div className="flex justify-end">
                          <span
                            className="text-white px-6 py-3 rounded-xl font-bold text-xl shadow-lg border-2 border-white"
                            style={{
                              background:
                                "linear-gradient(to right, #F26755, #E55145)",
                            }}
                          >
                            {formatPrice(lot.lotTTC)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Conditions et totaux */}
        <div className="p-3 sm:p-6 lg:p-8 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Conditions de règlement */}
            <div
              className="bg-white p-4 sm:p-6 rounded-2xl border-l-4 shadow-md"
              style={{ borderColor: "#F26755" }}
            >
              <h3
                className="text-base sm:text-lg font-bold mb-3 sm:mb-4"
                style={{ color: "#C5453A" }}
              >
                Conditions de règlement :
              </h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                <p>• Acompte de 20% à la commande</p>
                <p>• Acompte de 30% au début des travaux</p>
                <p>• Solde à la livraison, paiement comptant dès réception</p>
              </div>
            </div>

            {/* Total général avec détail TVA */}
            <div
              className="bg-white p-4 sm:p-6 rounded-2xl border-2 shadow-lg"
              style={{ borderColor: "#F26755" }}
            >
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="font-bold" style={{ color: "#F26755" }}>
                    TOTAL HT :
                  </span>
                  <span className="font-bold">
                    {formatPrice(totalHTGeneral)}
                  </span>
                </div>

                {/* Détail TVA par taux */}
                <div
                  className="space-y-1 sm:space-y-2 border-l-2 pl-3 sm:pl-4"
                  style={{ borderColor: "#F2675550" }}
                >
                  <h4
                    className="text-xs sm:text-sm font-semibold"
                    style={{ color: "#C5453A" }}
                  >
                    Détail TVA :
                  </h4>
                  {(() => {
                    const tvaByRate: Record<
                      number,
                      { baseHT: number; montantTVA: number }
                    > = {};
                    (devis.selectedItems ?? []).forEach((item) => {
                      // Skip items without TVA defined
                      if (item.tva === undefined || item.tva === null) return;

                      const montantHT = item.prix_ht * item.quantite;
                      const montantTVA = (montantHT * item.tva) / 100;
                      if (!tvaByRate[item.tva]) {
                        tvaByRate[item.tva] = { baseHT: 0, montantTVA: 0 };
                      }
                      tvaByRate[item.tva].baseHT += montantHT;
                      tvaByRate[item.tva].montantTVA += montantTVA;
                    });

                    return Object.entries(tvaByRate).map(([taux, data]) => (
                      <div key={taux} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          TVA {taux}% sur {formatPrice(data.baseHT)} :
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "#F26755" }}
                        >
                          {formatPrice(data.montantTVA)}
                        </span>
                      </div>
                    ));
                  })()}
                </div>

                <div
                  className="flex justify-between text-base sm:text-lg border-t pt-2"
                  style={{ borderColor: "#F2675550" }}
                >
                  <span className="font-bold" style={{ color: "#F26755" }}>
                    TOTAL TVA :
                  </span>
                  <span className="font-bold">
                    {formatPrice(totalTVAGeneral)}
                  </span>
                </div>

                <div
                  className="flex justify-between items-center text-lg sm:text-2xl font-bold border-t-2 pt-3 sm:pt-4"
                  style={{ borderColor: "#F26755" }}
                >
                  <span style={{ color: "#F26755" }}>TOTAL TTC :</span>
                  <span
                    className="text-white px-3 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-lg text-sm sm:text-base"
                    style={{ backgroundColor: "#F26755" }}
                  >
                    {formatPrice(totalTTCGeneral)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message signature */}
        <div
          className="p-3 sm:p-6 lg:p-8 text-center bg-white border-t-4"
          style={{ borderColor: "#F2675550" }}
        >
          <p className="text-sm sm:text-lg italic text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Merci de nous retourner un exemplaire de ce devis signé avec votre
            nom et revêtu de la mention « Bon pour accord et commande »
          </p>
        </div>

        {/* Signatures */}
        <div className="p-3 sm:p-6 lg:p-8 bg-white">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-8">
            <Edit
              className="w-5 h-5 sm:w-6 sm:h-6"
              style={{ color: "#F26755" }}
            />
            <h3
              className="text-lg sm:text-xl font-bold"
              style={{ color: "#C5453A" }}
            >
              SIGNATURES
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            <div className="text-center">
              <h4
                className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base"
                style={{ color: "#C5453A" }}
              >
                Signature de l'entreprise
              </h4>
              <div
                className="rounded-2xl p-4 sm:p-8 min-h-32 sm:min-h-32"
              >
                {/* Espace pour signature */}
              </div>
            </div>

            <div className="text-center">
              <h4
                className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base"
                style={{ color: "#C5453A" }}
              >
                Signature du client
              </h4>
              <div
                className="rounded-2xl p-4 sm:p-8 min-h-32 sm:min-h-32" 
              >
                {/* Espace pour signature */}
              </div>
            </div>
          </div>
        </div>

        {/* Mentions légales */}
        <div
          className="p-4 text-center text-xs text-gray-600 border-t-4"
          style={{ backgroundColor: "#F2675520", borderColor: "#F26755" }}
        >
          <p className="font-medium">
            {user && user.role === "artisan"
              ? `${user?.companyLegalForm} ${user?.companyName} au Capital de ${
                  user?.companyCapital
                } ${user?.siret ? `- Siret ${user.siret}` : ""} - RCS ${
                  user?.rcs
                } - Code APE ${user?.companyApe}`
              : `${DEFAULT_COMPANY_INFO.companyLegalForm} ${
                  DEFAULT_COMPANY_INFO.name
                } au Capital de ${DEFAULT_COMPANY_INFO.companyCapital} ${
                  DEFAULT_COMPANY_INFO.siret
                    ? `- Siret ${DEFAULT_COMPANY_INFO.siret}`
                    : ""
                } - RCS ${DEFAULT_COMPANY_INFO.rcs} - Code APE ${
                  DEFAULT_COMPANY_INFO.companyApe
                }`}
          </p>
        </div>
      </div>
    </div>
  );
};

// Composant Modal
interface FactureModalProps {
  facturePreview: Devis | null;
  userId: string;
  setFacturePreview: (devis: Devis | null) => void;
}

export const FactureModal: React.FC<FactureModalProps> = ({
  facturePreview,
  userId,
  setFacturePreview,
}) => {
  if (!facturePreview) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl mx-2 my-4 relative animate-fadeIn max-h-[95vh] overflow-y-auto p-0 hide-scrollbar flex flex-col"
        style={{ scrollbarWidth: "none" }}
      >
        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        `}</style>
        {/* Bandeau orange */}
        <div className="flex items-center justify-between bg-[#F26755] px-3 sm:px-6 py-3 sm:py-4 rounded-t-none sm:rounded-t-2xl">
          <span className="font-bold text-white text-base sm:text-lg">
            Aperçu de la facture
          </span>

          <div className="flex gap-2 ml-auto">
            <button
              className="flex items-center gap-2 bg-white text-[#F26755] font-semibold px-4 py-2 rounded-lg shadow hover:bg-orange-100 transition"
              aria-label="Télécharger la facture"
              onClick={() =>
                GenerateFacturePDF({
                  devis: facturePreview,
                  userId: userId,
                })
              }
              tabIndex={0}
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Télécharger</span>
            </button>
            <button
              className="flex items-center justify-center bg-white text-[#F26755] text-2xl font-bold px-3 py-2 rounded-lg shadow hover:bg-orange-100 transition"
              aria-label="Fermer la prévisualisation"
              onClick={() => setFacturePreview(null)}
              tabIndex={0}
              style={{ lineHeight: 1 }}
            >
              &times;
            </button>
          </div>
        </div>
        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 hide-scrollbar">
          <FacturePreview
            userId={userId}
            devis={facturePreview}
            onClose={() => setFacturePreview(null)}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};