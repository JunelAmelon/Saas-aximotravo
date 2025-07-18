import React from "react";
import { Devis } from "@/types/devis";

interface FacturePreviewProps {
  devis: Devis;
  onClose?: () => void;
  isModal?: boolean;
}

export const FacturePreview: React.FC<FacturePreviewProps> = ({
  devis,
  onClose,
  isModal = false,
}) => {
  const totalHT = (devis.selectedItems ?? []).reduce(
    (sum, item) => sum + item.prix_ht * item.quantite,
    0
  );
  const tvaRate =
    typeof devis.tva === "string" ? parseFloat(devis.tva) : devis.tva;
  const totalTVA = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + totalTVA;

  return (
    <div
      className={`bg-white ${
        isModal ? "rounded-none" : "mx-auto rounded-2xl shadow-2xl"
      } border border-[#F26755] p-6 md:p-12 font-sans text-base`}
    >
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
        <div className="flex items-center gap-4">
          <img
            src="/logo1.svg"
            alt="Logo entreprise"
            className="h-40 w-40 object-contain rounded-xl"
          />
        </div>
        <div className="border-2 border-[#F26755] rounded-2xl px-8 py-4 text-center bg-white shadow-lg min-w-[260px]">
          <div className="font-bold text-xl mb-1 text-[#F26755]">
            FACTURE N° {devis.numero}
          </div>
          <div className="text-gray-700">
            Date :{" "}
            {devis.createdAt instanceof Date
              ? devis.createdAt.toLocaleDateString("fr-FR")
              : devis.createdAt}
          </div>
          <div className="text-gray-700">
            Code Client : {devis.clientInfo?.nom || "-"}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Facture valable 2 mois
          </div>
        </div>
      </div>

      {/* Informations entreprise et client */}
      <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
        <div className="md:w-1/2 space-y-1">
          <div className="font-bold text-[#F26755] mb-1">Entreprise</div>
          <div className="text-lg font-semibold">{devis.companyInfo?.nom}</div>
          <div>{devis.companyInfo?.adresse}</div>
          <div>
            {devis.companyInfo?.codePostal} {devis.companyInfo?.ville}
          </div>
          <div>Tél : {devis.companyInfo?.telephone}</div>
          <div>Mail : {devis.companyInfo?.email}</div>
        </div>
        <div className="md:w-1/2 flex md:justify-end">
          <div className="border-2 border-[#F26755] rounded-2xl px-6 py-4 inline-block bg-orange-50 text-left shadow-md min-w-[250px]">
            <div className="font-bold text-[#F26755] mb-1">Client</div>
            <div className="text-lg font-semibold">{devis.clientInfo?.nom}</div>
            <div>{devis.clientInfo?.adresse}</div>
            <div>
              {devis.clientInfo?.codePostal} {devis.clientInfo?.ville}
            </div>
            {devis.clientInfo?.telephone && (
              <div>Tél : {devis.clientInfo.telephone}</div>
            )}
            {devis.clientInfo?.email && (
              <div>Mail : {devis.clientInfo.email}</div>
            )}
          </div>
        </div>
      </div>

      {/* Tableau des prestations */}
      <div className="mb-10 overflow-x-auto">
        <table className="w-full border-collapse border border-[#F26755] rounded-2xl shadow-lg overflow-hidden">
          <thead>
            <tr className="bg-[#F26755] text-white rounded-t-2xl">
              <th className="p-4 text-left font-bold rounded-tl-2xl">
                Désignation
              </th>
              <th className="p-4 font-bold w-20">Unité</th>
              <th className="p-4 font-bold w-20">Quantité</th>
              <th className="p-4 font-bold w-28">Prix unitaire</th>
              <th className="p-4 font-bold w-28 rounded-tr-2xl">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {(devis.selectedItems ?? []).map((item, idx) => (
              <tr
                key={item.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-orange-50/40"}
              >
                <td className="p-4 border-b border-[#F26755]">
                  <div className="font-medium text-base">{item.itemName}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </div>
                  )}
                </td>
                <td className="p-4 text-center border-b border-[#F26755]">
                  {item.unite}
                </td>
                <td className="p-4 text-center border-b border-[#F26755]">
                  {item.quantite}
                </td>
                <td className="p-4 text-right border-b border-[#F26755]">
                  {item.prix_ht.toFixed(2)} €
                </td>
                <td className="p-4 text-right border-b border-[#F26755]">
                  {(item.prix_ht * item.quantite).toFixed(2)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Conditions et totaux */}
      <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
        <div className="md:w-1/2">
          <div className="bg-orange-50/60 rounded-2xl p-6 shadow-inner border border-[#F26755]/30">
            <div className="font-bold text-[#F26755] mb-2">
              Conditions de règlement :
            </div>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Acompte de 20% à la commande</li>
              <li>Acompte de 30% au début des travaux</li>
              <li>Solde à la livraison, paiement comptant dès réception</li>
            </ul>
            <div className="mt-4 text-xs italic text-gray-500">
              Merci de nous retourner un exemplaire de ce devis signé avec votre
              nom et revêtu de la mention « Bon pour accord et commande »
            </div>
          </div>
        </div>
        <div className="md:w-1/2 flex md:justify-end mt-8 md:mt-0">
          <div className="bg-white rounded-2xl border-2 border-[#F26755] p-6 shadow-lg w-full min-w-[250px]">
            <div className="flex justify-between mb-3 text-base">
              <span className="font-bold text-[#F26755]">TOTAL HT :</span>
              <span className="font-bold">{totalHT.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between mb-3 text-base">
              <span className="font-bold text-[#F26755]">TVA {tvaRate}% :</span>
              <span className="font-bold">{totalTVA.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold border-t-2 border-[#F26755] pt-4 mt-4">
              <span className="text-[#F26755]">TOTAL TTC :</span>
              <span className="bg-[#F26755] text-white px-6 py-2 rounded-2xl shadow-lg text-xl">
                {totalTTC.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mt-12">
        <div className="text-center flex-1">
          <div className="font-bold mb-3 text-[#F26755]">Pour l'entreprise</div>
          <div className="bg-[#F26755] text-white px-8 py-3 font-bold text-lg mb-3 rounded-2xl shadow-lg inline-block">
            Signature
          </div>
          <div className="text-base mt-2">{devis.companyInfo?.nom}</div>
        </div>
        <div className="text-center flex-1">
          <div className="font-bold mb-3 text-[#F26755]">Pour le client</div>
          <div className="text-base mb-2">
            À {devis.companyInfo?.ville || "Paris"} le{" "}
            {devis.createdAt instanceof Date
              ? devis.createdAt.toLocaleDateString("fr-FR")
              : devis.createdAt}
          </div>
          <div className="text-base">
            Bon pour accord et règlement
            <br />
            <span className="font-bold">Signature du client</span>
          </div>
        </div>
      </div>

      {/* Mentions légales */}
      <div className="text-center text-xs mt-12 pt-4 border-t-2 border-[#F26755] text-gray-500">
        {`SARL ${devis.companyInfo?.nom} au Capital de 50 000€ ${
          devis.companyInfo?.siret ? `Siret ${devis.companyInfo.siret}` : ""
        } RCS Versailles Code APE 4321A`}
      </div>
    </div>
  );
};

// Composant Modal
interface FactureModalProps {
  facturePreview: Devis | null;
  setFacturePreview: (devis: Devis | null) => void;
}

export const FactureModal: React.FC<FactureModalProps> = ({
  facturePreview,
  setFacturePreview,
}) => {
  if (!facturePreview) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 my-8 relative animate-fadeIn max-h-[90vh] overflow-y-auto p-0 hide-scrollbar flex flex-col"
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
          <button
            className="text-white text-2xl font-bold hover:text-orange-200 transition"
            aria-label="Fermer la prévisualisation"
            onClick={() => setFacturePreview(null)}
            tabIndex={0}
          >
            &times;
          </button>
        </div>
        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 hide-scrollbar">
          <FacturePreview
            devis={facturePreview}
            onClose={() => setFacturePreview(null)}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};