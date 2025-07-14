import React, { useEffect, useState } from "react";
import { Devis } from "@/types/devis";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Project, getProjectById } from "@/lib/firebase/projects";
import { MapPin } from "lucide-react";
interface PDFPreviewProps {
  devis: Devis;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ devis }) => {
  const params = useParams();
  const projectId = params?.id as string;
  const [client, setClient] = useState<any>(null);

  const [project, setProject] = useState<Project | null>(null);
  useEffect(() => {
    async function loadProject() {
      if (!projectId) return;
      const project = await getProjectById(projectId);
      setProject(project);
    }
    loadProject();
  }, [projectId]);

  useEffect(() => {
    async function loadClient() {
      if (!projectId) return;
      // Charger le projet
      const projectRef = doc(db, "projects", projectId);
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) return;
      const project = projectSnap.data();
      // Charger le client
      if (project.client_id) {
        const clientRef = doc(db, "users", project.client_id);
        const clientSnap = await getDoc(clientRef);
        if (clientSnap.exists()) setClient(clientSnap.data());
      }
    }
    loadClient();
  }, [projectId]);
  // Calcul des totaux avec gestion de la TVA variable et des prestations offertes
  let totalHT = 0;
  let totalTVA = 0;

  // Calcul détaillé des TVA par taux
  const tvaByRate: {
    [rate: number]: { baseHT: number; tvaAmount: number; count: number };
  } = {};

  devis.selectedItems.forEach((item) => {
    // Récupérer le taux de TVA de l'item ou utiliser celui par défaut du devis
    const itemTvaRate =
      item.tva !== undefined
        ? item.tva
        : typeof devis.tva === "number"
        ? devis.tva
        : parseFloat(devis.tva as string) || 20;

    if (!item.isOffered) {
      const itemHT = item.prix_ht * item.quantite;
      const itemTVA = itemHT * (itemTvaRate / 100);

      totalHT += itemHT;
      totalTVA += itemTVA;

      // Grouper par taux de TVA
      if (!tvaByRate[itemTvaRate]) {
        tvaByRate[itemTvaRate] = { baseHT: 0, tvaAmount: 0, count: 0 };
      }
      tvaByRate[itemTvaRate].baseHT += itemHT;
      tvaByRate[itemTvaRate].tvaAmount += itemTVA;
      tvaByRate[itemTvaRate].count += 1;
    } else {
      // Pour les prestations offertes, on les compte quand même dans les statistiques
      if (!tvaByRate[itemTvaRate]) {
        tvaByRate[itemTvaRate] = { baseHT: 0, tvaAmount: 0, count: 0 };
      }
      // On incrémente juste le compteur pour les prestations offertes
      tvaByRate[itemTvaRate].count += 1;
    }
  });

  const totalTTC = totalHT + totalTVA;

  const lotGroups = devis.selectedItems.reduce((groups, item) => {
    if (!groups[item.lotName]) groups[item.lotName] = [];
    groups[item.lotName].push(item);
    return groups;
  }, {} as Record<string, typeof devis.selectedItems>);

  const payments = [
    { label: "Acompte à la signature", percent: 40, amount: totalTTC * 0.4 },
    { label: "Versement intermédiaire", percent: 25, amount: totalTTC * 0.25 },
    { label: "Versement intermédiaire", percent: 20, amount: totalTTC * 0.2 },
    { label: "Solde final", percent: 15, amount: totalTTC * 0.15 },
  ];

  return (
    <div
      className="w-full max-w-4xl mx-auto bg-white"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* PAGE 1 : Header + Client + Intro */}
      <div className="min-h-screen p-10 text-sm text-gray-800">
        {/* Header élégant */}
        <div className="mb-6 relative">
          <h1 className="text-xl md:text-6xl font-bold text-[#F26755] mb-1">
            DEVIS N°{devis.numero}
          </h1>
          <p className="text-sm md:text-3xl text-gray-500">
            {devis.titre} • Valable 30 jours
          </p>
        </div>

        {/* Carte client premium dynamique */}
        {client ? (
          <div className="bg-[#F26755] text-white p-6 rounded-2xl mb-6 shadow-lg w-full flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base md:text-2xl font-extrabold tracking-wide">
                CLIENT
              </span>
            </div>
            <div className="text-base md:text-2xl font-bold mb-1 truncate">
              {client.displayName ||
                client.companyName ||
                `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() ||
                "Nom du client"}
            </div>
            {project?.location && (
              <div className="flex items-center gap-2 text-base md:text-lg">
                {/* MapPin icon Lucide */}
                <MapPin className="h-5 w-5 text-white/70" />
                <span>{project.location},</span>
                <span>{project?.addressDetails}</span>
              </div>
            )}
            {(project?.postalCode || project?.city) && (
              <div className="flex items-center gap-2 text-base md:text-lg">
                {/* Building icon Lucide */}
                <svg
                  className="w-5 h-5 text-white/70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 21V7a2 2 0 0 1 2-2h2V3h6v2h2a2 2 0 0 1 2 2v14" />
                  <path d="M13 13h4v8h-4z" />
                </svg>
                <span>
                  {project?.postalCode} {project?.city}
                </span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2 bg-white/10 rounded px-2 py-1 mt-1 text-xs md:text-base break-all truncate">
                {/* Mail icon Lucide */}
                <svg
                  className="w-4 h-4 text-white/70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
                <span>{client.email}</span>
              </div>
            )}
            {(client.phone || client.phoneNumber) && (
              <div className="flex items-center gap-2 text-base md:text-lg">
                {/* Phone icon Lucide */}
                <svg
                  className="w-5 h-5 text-white/70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3.08 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.34a2 2 0 0 1-.45 2.11L9.1 10.91a16 16 0 0 0 4 4l1.74-1.15a2 2 0 0 1 2.11-.45c.74.34 1.53.57 2.34.7A2 2 0 0 1 21 16.92z" />
                </svg>
                <span>{client.phone || client.phoneNumber}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#F26755] text-white p-5 rounded-lg mb-6 shadow-lg animate-pulse text-center">
            Chargement client..
          </div>
        )}

        {/* Message d'intro avec bordure stylée */}
        <div className="mb-6 p-3 md:p-5 border-l-4 border-[#F26755] bg-gray-50 rounded-r-lg">
          <div className="text-base md:text-2xl leading-relaxed text-gray-700">
            Madame, Monsieur,
            <br />
            <br />
            Nous avons le plaisir de vous adresser notre devis détaillant
            l'ensemble des prestations proposées, incluant les fournitures ainsi
            que la main d'œuvre.
            <br />
            <br />
            Soucieuse de répondre au mieux à vos attentes, notre équipe reste à
            votre entière disposition pour toute demande d'éclaircissement ou
            d'ajustement. Nous mettons tout en œuvre pour que notre
            collaboration vous apporte pleine satisfaction.
            <br />
            <br />
            Dans l'attente de votre retour, nous vous prions d'agréer, Madame,
            Monsieur, l'expression de nos salutations distinguées.
          </div>
        </div>
      </div>

      {/* PAGE 2 : Tableau récapitulatif des lots */}
      <div className="min-h-screen p-10 text-sm text-gray-800">
        {/* Header de page */}
        <div className="mb-5 pb-2 border-b-2 border-[#F26755]">
          <h2 className="text-base md:text-4xl font-bold text-[#F26755] truncate">
            RÉCAPITULATIF DES LOTS
          </h2>
        </div>

        {/* Tableau récapitulatif des lots */}
        <div className="w-full mb-8 rounded-lg overflow-hidden">
          <div className="flex bg-gray-800 text-white py-2 px-4">
            <div className="flex-[3] font-semibold">Lot</div>
            <div className="flex-1 text-right font-semibold">Montant HT</div>
          </div>

          {Object.entries(lotGroups).map(([lotName, items], index) => (
            <div
              key={index}
              className={`flex py-3 px-4 border-b border-gray-200 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <div className="flex-[3] text-xs md:text-base truncate">
                Lot {index + 1} - {lotName}
              </div>
              <div className="flex-1 text-right text-xs md:text-base">
                <span className="bg-green-100 text-green-700 px-1 py-0.5 rounded font-bold text-xs md:text-base">
                  {items
                    .reduce((sum, item) => {
                      return (
                        sum +
                        (item.isOffered ? 0 : item.quantite * item.prix_ht)
                      );
                    }, 0)
                    .toFixed(2)}{" "}
                  €
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PAGES 3 à N : Détails des prestations par lot */}
      {Object.entries(lotGroups).map(([lotName, items], lotIndex) => (
        <div
          key={lotIndex}
          className="min-h-screen p-4 md:p-10 text-xs md:text-sm text-gray-800"
        >
          {/* Header de page */}
          <div className="mb-5 pb-2 border-b-2 border-[#F26755]">
            <h2 className="text-4xl font-bold text-[#F26755]">
              LOT {lotIndex + 1} - {lotName.toUpperCase()}
            </h2>
          </div>

          {/* Prestations du lot avec numérotation */}
          {items.map((item, itemIndex) => {
            const itemTvaRate =
              item.tva !== undefined
                ? item.tva
                : typeof devis.tva === "number"
                ? devis.tva
                : parseFloat(devis.tva as string) || 20;
            const itemHT = item.prix_ht * item.quantite;
            const itemTVA = itemHT * (itemTvaRate / 100);
            const itemTTC = itemHT + itemTVA;

            return (
              <div
                key={itemIndex}
                className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                {/* Titre avec numérotation */}
                <div className="flex items-start mb-1">
                  <span className="font-bold text-[#F26755] mr-2 text-base md:text-2xl">
                    {lotIndex + 1}.{itemIndex + 1}
                  </span>
                  <h4 className="flex-1 font-semibold text-gray-800 text-base md:text-2xl truncate">
                    {item.optionLabel}
                  </h4>
                </div>

                {/* Badges informatifs */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.isOffered && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs md:text-base font-bold">
                      OFFERT
                    </span>
                  )}
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs md:text-base font-semibold">
                    TVA {itemTvaRate}%
                  </span>
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs md:text-base font-semibold">
                    {item.subcategoryName}
                  </span>
                </div>

                <p className="text-gray-600 mb-2 text-base md:text-lg leading-relaxed">
                  {item.description}
                </p>

                {/* Images */}
                {item.customImage && (
                  <div className="mb-2">
                    <img
                      src={item.customImage}
                      alt="Illustration"
                      className="w-20 h-15 object-cover rounded border border-gray-200"
                    />
                  </div>
                )}

                {/* Détails chiffrés */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-base md:text-lg">
                      Quantité
                    </span>
                    <span className="font-semibold text-yellow-700 text-base md:text-lg">
                      {item.quantite} {item.customUnit || item.unite}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-base md:text-lg">
                      Prix unitaire HT
                    </span>
                    <span className="font-bold text-blue-700 text-base md:text-lg">
                      {item.prix_ht.toFixed(2)} €
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-base md:text-lg">
                      TVA appliquée
                    </span>
                    <span className="font-bold text-yellow-700 text-base md:text-lg">
                      {itemTvaRate}% = {itemTVA.toFixed(2)} €
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold text-gray-700 text-base md:text-lg">
                      Total HT
                    </span>
                    <span
                      className={`font-bold text-base md:text-lg ${
                        item.isOffered ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.isOffered ? "OFFERT" : `${itemHT.toFixed(2)} €`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 text-base md:text-lg">
                      Total TTC
                    </span>
                    {item.isOffered ? (
                      <div className="flex items-center gap-1 md:gap-2 text-xs md:text-base">
                        <span className="line-through text-gray-400 text-base md:text-lg">
                          {itemTTC.toFixed(2)} €
                        </span>
                        <span className="text-green-600 text-base md:text-lg font-bold">
                          OFFERT
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#F26755] text-base md:text-lg font-bold">
                        {itemTTC.toFixed(2)} €
                      </span>
                    )}
                  </div>
                </div>

                {/* Pièces concernées (pour calcul automatique) */}
                {item.pieces && item.pieces.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="font-semibold text-gray-700 mb-2 text-base md:text-lg">
                      Pièces concernées:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.pieces.map((piece, pieceIndex) => (
                        <span
                          key={pieceIndex}
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-base md:text-lg"
                        >
                          {piece}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pièces jointes (selectedPieces) */}
                {item.selectedPieces && item.selectedPieces.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-gray-500 mb-2 text-base md:text-lg truncate">
                      Pièces incluses:
                    </div>
                    {item.selectedPieces.map((piece, pieceIndex) => (
                      <div key={pieceIndex} className="flex items-center mb-1">
                        <div className="w-1 h-1 bg-[#F26755] rounded-full mr-2"></div>
                        <span className="font-semibold text-base md:text-lg">
                          {piece.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* DERNIÈRE PAGE : Récapitulatif financier */}
      <div className="min-h-screen p-10 text-sm text-gray-800">
        {/* Header de la page financière */}
        <div className="mb-5 pb-2 border-b-2 border-[#F26755]">
          <h2 className="text-base md:text-4xl font-bold text-[#F26755] truncate">
            RÉCAPITULATIF FINANCIER
          </h2>
        </div>

        {/* Section Totaux */}
        <div className="mt-6 p-5 bg-gray-50 rounded-lg border-l-4 border-[#F26755]">
          <h3 className="font-bold text-gray-800 mb-5 text-base md:text-3xl">
            DÉTAIL DES MONTANTS
          </h3>

          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600 text-base md:text-lg">Total HT</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold text-base md:text-lg">
              {totalHT.toFixed(2)} €
            </span>
          </div>

          {/* Détail des TVA par taux */}
          <div className="mt-5 mb-5 p-4 border border-gray-200 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2 text-base md:text-lg">
              Détail des TVA par taux
            </h4>
            {Object.entries(tvaByRate)
              .filter(([rate, data]) => data.baseHT > 0)
              .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
              .map(([rate, data]) => (
                <div
                  key={rate}
                  className="flex justify-between items-center mb-2 py-1"
                >
                  <span className="text-gray-600 text-base md:text-lg">
                    TVA {rate}% sur {data.baseHT.toFixed(2)} € HT ({data.count}{" "}
                    prestation{data.count > 1 ? "s" : ""})
                  </span>
                  <span className="font-bold text-gray-800 text-base md:text-lg">
                    {data.tvaAmount.toFixed(2)} €
                  </span>
                </div>
              ))}

            {/* Prestations offertes */}
            {Object.entries(tvaByRate)
              .filter(([rate, data]) => data.baseHT === 0 && data.count > 0)
              .map(([rate, data]) => (
                <div
                  key={`offered-${rate}`}
                  className="flex justify-between items-center mb-2 py-1"
                >
                  <span className="text-green-600 text-base md:text-lg">
                    TVA {rate}% - {data.count} prestation
                    {data.count > 1 ? "s" : ""} offerte
                    {data.count > 1 ? "s" : ""}
                  </span>
                  <span className="font-bold text-green-600 text-base md:text-lg">
                    0,00 €
                  </span>
                </div>
              ))}

            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700 text-base md:text-lg">
                  Total TVA
                </span>
                <span className="font-bold text-gray-800 text-base md:text-lg">
                  {totalTVA.toFixed(2)} €
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t-2 border-[#F26755]">
            <span className="font-bold text-gray-700 text-base md:text-lg">
              Total TTC
            </span>
            <span className="bg-red-100 text-[#F26755] px-2 py-1 rounded-lg font-bold text-base md:text-lg border-2 border-[#F26755]">
              {totalTTC.toFixed(2)} €
            </span>
          </div>
        </div>

        {/* Modalités de paiement */}
        <div className="mt-10">
          <h3 className="font-bold text-gray-800 mb-5 pb-2 border-b-2 border-[#F26755] text-base md:text-3xl">
            MODALITÉS DE PAIEMENT
          </h3>

          {payments.map((payment, index) => (
            <div
              key={index}
              className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 py-3"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#F26755] text-white rounded-full flex items-center justify-center mr-2 text-base md:text-lg font-bold">
                  {payment.percent}%
                </div>
                <span className="text-base md:text-lg font-medium">
                  {payment.label}
                </span>
              </div>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold text-base md:text-lg">
                {payment.amount.toFixed(2)} €
              </span>
            </div>
          ))}
        </div>

        {/* Signature */}
        <div className="mt-15 flex justify-end">
          <div className="w-50 pt-2 border-t border-gray-200 text-center">
            <div className="text-gray-600 text-base md:text-lg">
              Fait à Paris, le {new Date().toLocaleDateString("fr-FR")}
            </div>
            <div className="font-bold text-base md:text-lg mb-1 truncate">
              Signature du client
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
