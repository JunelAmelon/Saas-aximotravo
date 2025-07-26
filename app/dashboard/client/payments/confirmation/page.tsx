"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/ClientApp";
import { fetchQontoPaymentStatus } from "@/hooks/qontoPayment";

export default function PaymentConfirmationPage() {
  const params = useSearchParams();
  const paymentId = params?.get("paymentId");
  const [status, setStatus] = useState<"loading"|"success"|"pending"|"error">("loading");
  const [qontoStatus, setQontoStatus] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    if (!paymentId) {
      setStatus("error");
      return;
    }
    getDoc(doc(db, "payments", paymentId)).then(async snap => {
      if (!snap.exists()) {
        setStatus("error");
        return;
      }
      const data = snap.data();
      // Vérification locale Firestore
      if (data.status === "validé") setStatus("success");
      else setStatus("pending");
      // Vérification côté Qonto si qonto_payment_link_id existe
      if (data.qonto_payment_link_id) {
        try {
          const qontoPayment = await fetchQontoPaymentStatus(data.qonto_payment_link_id);
          if (!ignore && qontoPayment && qontoPayment.link_status) {
            setQontoStatus(qontoPayment.link_status);
          }
          if(qontoPayment.has_successful_payment) {
            setStatus("success");
          }else if(qontoPayment.link_status === "expired" || qontoPayment.link_status === "cancelled") {
            setStatus("error");
          }else {
            setStatus("pending");
          }
        } catch {
          // ignore erreur Qonto
        }
      }
    }).catch(() => setStatus("error"));
    return () => { ignore = true; };
  }, [paymentId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Confirmation du paiement</h2>
        {status === "loading" && <div className="text-gray-500">Vérification du paiement…</div>}
        {status === "success" && <div className="text-green-600 font-bold text-xl">✅ Paiement validé !<div className="mt-2 text-base font-normal text-gray-700">Merci, votre paiement a bien été pris en compte.</div></div>}
        {status === "pending" && <div className="text-amber-600 font-bold text-xl">⏳ Paiement en attente de validation.<div className="mt-2 text-base font-normal text-gray-700">Votre paiement est en cours de traitement. Vous recevrez une confirmation dès validation.</div></div>}
        {status === "error" && <div className="text-red-600 font-bold text-xl">❌ Paiement introuvable ou erreur.<div className="mt-2 text-base font-normal text-gray-700">Si le problème persiste, contactez le support.</div></div>}
        {qontoStatus && (
          <div className="mt-4 text-sm text-gray-700">
            <span className="font-semibold">Statut Qonto&nbsp;:</span> {qontoStatus}
          </div>
        )}
      </div>
    </div>
  );
}
