"use client";
import React, { useState, useEffect } from "react";
import type { ProjectPayment } from "@/hooks/payments";
import { updatePaymentValidationInfo } from "@/hooks/payments";
import { useCreateQontoPayment } from "@/hooks/qontoPayment";


interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  payment: ProjectPayment | null;
}

export default function PaymentModal({ open, onClose, payment }: PaymentModalProps) {
  const [ibanCopied, setIbanCopied] = useState(false);
  const IBAN = "FR7616958000016272158217962";
  const BIC = "QNTOFRP1XXX";
  const HOLDER = "Resotravaux";
  const BANK = "Qonto";

  const [showValidationForm, setShowValidationForm] = useState(false);
  const [transferAmount, setTransferAmount] = useState(payment?.amount || "");
  const [currency, setCurrency] = useState("EUR");
  const [transferDate, setTransferDate] = useState("");
  const [reference, setReference] = useState("");
  const [bankName, setBankName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { createPaymentLink, loading, error } = useCreateQontoPayment();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormSuccess(null);
      setShowValidationForm(false);
      setFormError(null);
    }
  }, [open, payment?.id]);

  if (!open || !payment) return null;

  const handleCopyIban = () => {
    navigator.clipboard.writeText(IBAN);
    setIbanCopied(true);
    setTimeout(() => setIbanCopied(false), 2000);
  };

  const handlePayOnline = async () => {
    setPaying(true);
    setPayError(null);
    try {
      const result = await createPaymentLink({
        amount: payment.amount * 100, // Montant en centimes
        currency: "EUR",
        paymentId: payment.id,
        description: `Paiement SecureAcompte - ${payment.title}`
      });
      if (result && result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        setPayError("Impossible de générer le lien de paiement Qonto.");
      }
    } catch (e: any) {
      setPayError(e.message || "Erreur lors de la création du lien de paiement Qonto.");
    } finally {
      setPaying(false);
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
        <h3 className="text-lg font-semibold mb-2">Payer l&apos;acompte</h3>
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="mb-4">
            <div className="text-base font-medium text-gray-900 mb-1">{payment.title}</div>
            <div className="text-sm text-gray-500 mb-1">{payment.date}</div>
            <div className="text-sm text-gray-700 mb-1">{payment.description}</div>
            <div className="text-xl font-bold text-gray-900 mt-2">{payment.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Instructions de paiement</label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 text-sm">
                Merci d&apos;effectuer un virement bancaire du montant indiqué sur le compte suivant&nbsp;:<br /><br />
                <span className="font-semibold">Titulaire&nbsp;:</span> {HOLDER}<br />
                <span className="font-semibold">IBAN&nbsp;:</span> <span className="select-all" style={{ letterSpacing: '1px' }}>{IBAN}</span>
                <button
                  type="button"
                  className="ml-2 px-2 py-0.5 text-xs bg-[#dd7109] text-white rounded hover:bg-[#b95c07] transition"
                  onClick={handleCopyIban}
                >
                  {ibanCopied ? "Copié !" : "Copier"}
                </button>
                <br />
                <span className="font-semibold">BIC&nbsp;:</span> {BIC}<br />
                <span className="font-semibold">Banque&nbsp;:</span> {BANK}<br /><br />
                Merci d&apos;indiquer le nom du projet ou la référence de la facture dans le motif du virement.<br />
                <span className="italic text-xs text-gray-500">Une fois le virement reçu, votre paiement sera validé sous 1 à 2 jours ouvrés.</span>
              </div>
            </div>
          </div>
          {/* <div className="flex flex-col gap-2 pt-2">
            <button
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-60"
              onClick={handlePayOnline}
              disabled={paying || loading}
            >
              {paying || loading ? "Création du lien…" : "Payer en ligne via Revolut"}
            </button>
            {payError && <div className="text-red-500 text-sm mt-1">{payError}</div>}
          </div> */}
          {/* Séparateur "ou" */}
          {/* <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 font-semibold">ou</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div> */}
          <div className="pt-6">
            {!showValidationForm && !formSuccess && (
              <button
                className="px-4 py-2 rounded-xl bg-green-600 text-white font-medium"
                onClick={() => setShowValidationForm(true)}
              >
                Valider le virement bancaire
              </button>
            )}

            {showValidationForm && (
              <form
                className="space-y-4 mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4"
                onSubmit={async e => {
                  e.preventDefault();
                  setFormError(null);
                  setFormSuccess(null);
                  setSubmitting(true);
                  if (!transferAmount || !currency || !transferDate || !reference) {
                    setFormError("Merci de remplir tous les champs obligatoires.");
                    setSubmitting(false);
                    return;
                  }
                  const ok = await updatePaymentValidationInfo(payment.id, {
                    montant: Number(transferAmount),
                    devise: currency,
                    dateVirement: transferDate,
                    reference,
                    banque: bankName
                  });
                  if (ok) {
                    setFormSuccess("Merci ! Votre déclaration de paiement a bien été transmise.");
                    setShowValidationForm(false);
                  } else {
                    setFormError("Erreur lors de la transmission. Veuillez réessayer.");
                  }
                  setSubmitting(false);
                }}
              >
                <div>
                  <label className="block font-medium mb-1">Montant du virement 💶 <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    className="border rounded px-3 py-2 w-full"
                    value={transferAmount}
                    min={0}
                    step="0.01"
                    onChange={e => setTransferAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Devise utilisée 💱 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="border rounded px-3 py-2 w-full"
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Date estimée du virement 📅 <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className="border rounded px-3 py-2 w-full"
                    value={transferDate}
                    onChange={e => setTransferDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Libellé ou référence du virement ✏️ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="border rounded px-3 py-2 w-full"
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Nom de la banque ou du titulaire (optionnel)</label>
                  <input
                    type="text"
                    className="border rounded px-3 py-2 w-full"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="Nom de la banque ou du titulaire"
                  />
                </div>
                {formError && <div className="text-red-500 text-sm mt-1">{formError}</div>}
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-green-600 text-white font-medium disabled:opacity-60"
                    disabled={submitting}
                  >
                    {submitting ? "Envoi en cours..." : "Envoyer"}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-gray-300 text-gray-800 font-medium"
                    onClick={() => setShowValidationForm(false)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
            {formSuccess && (
              <div className="text-green-600 font-semibold mt-4">{formSuccess}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

