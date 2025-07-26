"use client";
import React from "react";
import type { ProjectPayment } from "@/hooks/payments";
import jsPDF from "jspdf";

interface PaymentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  payment: ProjectPayment | null;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({ open, onClose, payment }) => {
  const [loadingPDF, setLoadingPDF] = React.useState(false);
  if (!open || !payment) return null;

  const handleDownloadInvoice = async () => {
    if (!payment) return;
    setLoadingPDF(true);
    try {
      // 1. Charger le logo en base64
      const logoUrl = '/Logo-2025.png';
      const getBase64FromUrl = async (url: string) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };
      const logoBase64 = await getBase64FromUrl(logoUrl);

      // 2. Génération PDF fidèle au modèle fourni
      const doc = new jsPDF({ format: 'a4', unit: 'mm' });
      const rouge = "#e52320";
      const gris = "#6d6d6d";
      const margin = 18;
      let y = 18;

      // Logo centré (largeur max 80mm, hauteur adaptée)
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 80;
      const logoHeight = 22;
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(logoBase64, 'PNG', logoX, y, logoWidth, logoHeight);
      y += 28;
      // Trait rouge épais sous le logo
      doc.setDrawColor(rouge);
      doc.setLineWidth(2.5);
      doc.line(margin, y, 192, y);
      y += 10;

      // TITRE
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(rouge);
      doc.text("ATTESTATION DE RÉCEPTION D’ACOMPTE SÉCURISÉ", 105, y, { align: 'center' });
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(gris);

      // À l’attention de
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text("À l’attention de :", margin, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`${payment.client?.firstName + " " + payment.client?.lastName || '[Nom complet du client]'}`, margin, y);
      y += 6;
      doc.text(`Adresse : ${payment.localisation || '[Adresse complète du client]'}`, margin, y);
      y += 6;
      doc.text(`Projet : ${payment.project || '[Adresse ou description du chantier]'}`, margin, y);
      y += 6;
      doc.text(`Date : ${payment.date || '[Date du jour]'}`, margin, y);
      y += 10;

      // Corps de l'attestation
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const montant = (typeof payment.amount === 'number' && !isNaN(payment.amount))
        ? payment.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }).replace(/[^\d,€]/g, ' ').replace(/\s+/g, ' ').trim()
        : '[montant]';
      const nomClient = payment.client?.firstName || '[Nom du client]';
      const refDossier = payment.id || '[Référence interne ou n° devis]';
      const modePaiement = 'Virement';
      const dateValidation = payment.dateValidation || '[Date de validation]';
      const courtier = payment.courtier?.name || '[Prénom NOM]';

      const lines = [
        `Nous, soussignés AXIMOTRAVO, attestons avoir reçu un acompte d’un montant de ${montant} TTC, versé par ${nomClient} dans le cadre de son projet de travaux situé à l’adresse mentionnée ci-dessus.`,
        "",
        "Cet acompte a été versé via notre système de sécurisation d’acompte, garantissant que les fonds ne sont transmis qu’après validation explicite du client.",
        "",
        `À la date du ${dateValidation}, le client a validé la proposition, déclenchant ainsi le déblocage de l’acompte.`,
        "",
        "L’acompte a donc été transféré à AXIMOTRAVO, qui le remettra intégralement au prestataire sélectionné pour la réalisation des travaux, conformément à la mission de courtage.",
        "",
        "Détails de l’acompte :",
        `Montant : ${montant}`,
        `Date de validation client : ${dateValidation}`,
        `Mode de paiement : ${modePaiement}`,
        `Référence du dossier : ${refDossier}`,
        "",
        "Cette attestation confirme que les fonds ont été reçus par Aximotravo uniquement après validation formelle du client, et dans le cadre strict de notre rôle d’intermédiaire entre le client et les professionnels du bâtiment.",
        "",
        `Fait à AXIMOTRAVO, le ${dateValidation}`,
        "",
        "Note : Cette attestation n’est pas une facture. Le prestataire émettra sa propre facture pour les prestations à réaliser."
      ];
      for (const line of lines) {
        const splitLines = doc.splitTextToSize(line, 175);
        doc.text(splitLines, margin, y);
        y += 5 * splitLines.length;
        if (y > 275) { doc.addPage(); y = margin; }
      }

      // Ajout de la ligne signature/courtier en bas
      const leftLabel = "Nom du courtier référent :";
      const rightText = "Signature & cachet d’AXIMOTRAVO";
      const bottomY = y + 12; // espace réduit pour le cachet, évite le saut de page
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(leftLabel, margin, bottomY);
      doc.text(rightText, pageWidth - margin, bottomY, { align: 'right' });
      // Ajoute le nom du courtier juste en dessous, aligné à gauche
      if (courtier) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(courtier, margin, bottomY + 6);
        doc.setFont('helvetica', 'normal');
      }

      // Prévoir un espace pour le cachet (image à droite SOUS la mention)
      // Exemple : emplacement juste sous "Signature & cachet..."
      // const cachetWidth = 35, cachetHeight = 35;
      // doc.addImage(cachetBase64, 'PNG', pageWidth - margin - cachetWidth, bottomY + 8, cachetWidth, cachetHeight);
      // (décommenter et fournir cachetBase64 si image disponible)

      doc.save(`attestation_acompte_${payment.id}.pdf`);
    } catch (e) {
      alert("Erreur lors de la génération du PDF");
    } finally {
      setLoadingPDF(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fade-in">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>
        <h3 className="text-lg font-semibold mb-4">Détail de l&apos;acompte</h3>
        <div className="space-y-2 mb-4">
          <div>
            <span className="font-medium text-gray-700">Projet : </span>
            <span className="text-gray-900">{(payment as any).project || payment.projectId}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Montant : </span>
            <span className="text-gray-900">{payment.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Date : </span>
            <span className="text-gray-900">{payment.date}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Statut : </span>
            <span className={
              payment.status === "validé"
                ? "text-emerald-600 font-semibold"
                : payment.status === "en_attente"
                ? "text-amber-600 font-semibold"
                : "text-red-600 font-semibold"
            }>
              {payment.status}
            </span>
          </div>
          {payment.description && (
            <div>
              <span className="font-medium text-gray-700">Description : </span>
              <span className="text-gray-900">{payment.description}</span>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
            onClick={onClose}
          >
            Fermer
          </button>
          {loadingPDF ? (
            <button
              className="px-4 py-2 rounded-xl bg-[#dd7109] text-white font-medium opacity-80 cursor-not-allowed flex items-center justify-center gap-2"
              disabled
              aria-busy="true"
            >
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Génération de l&apos;attestation…
            </button>
          ) : (
            <button
              className="px-4 py-2 rounded-xl bg-[#dd7109] text-white hover:bg-[#b95c07] font-medium disabled:opacity-50"
              onClick={handleDownloadInvoice}
              disabled={payment.status !== "validé"}
              title={payment.status !== "validé" ? "L'attestation n'est disponible qu'après validation du paiement." : ""}
            >
              Obtenir l&apos;attestation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;
