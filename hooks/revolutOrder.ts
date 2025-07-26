import { useState } from "react";

export type RevolutOrderParams = {
  amount: number;
  currency: string;
  paymentId: string; // id Firestore du paiement à mettre à jour
  redirect_url?: string;
};

export type RevolutOrderResult = {
  id: string;
  public_id: string;
  status: string;
  [key: string]: any;
};

/**
 * Récupère le statut d'une commande Revolut en appelant l'API interne.
 * @param orderId id Revolut de la commande
 * @returns données de la commande (status, ...)
 */
import { collection, getDocs, getDoc, query, where, updateDoc, doc as fsDoc } from "firebase/firestore";
import { db } from "@/firebase/ClientApp";

export async function fetchRevolutOrderStatus(orderId: string) {
  const res = await fetch(`/api/revolut-order-status?orderId=${orderId}`);
  if (!res.ok) throw new Error("Impossible de récupérer le statut du paiement Revolut");
  const data = await res.json();

  // Met à jour le statut du paiement dans Firestore si trouvé
  try {
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("revolut_payment_id", "==", orderId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const paymentDoc = snap.docs[0];
      let newStatus = "en_attente";
      if (data.state === "completed" || data.state === "paid") newStatus = "validé";
      await updateDoc(fsDoc(db, "payments", paymentDoc.id), {
        status: newStatus,
        revolut_state: data.state,
        revolut_updated_at: new Date().toISOString()
      });

      // Si paiement validé, mettre à jour le statut du projet associé si "En attente"
      if (newStatus === "validé" && paymentDoc.data().projectId) {
        const projectRef = fsDoc(db, "projects", paymentDoc.data().projectId);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists() && projectSnap.data().status === "En attente") {
          await updateDoc(projectRef, { status: "En cours" });
        }
      }
    }
  } catch (e) {
    console.error('Erreur mise à jour paiement/projet:', e);
  }

  return data;
}

export function useCreateRevolutOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RevolutOrderResult | null>(null);

  /**
   * Crée une commande Revolut et met à jour le paiement Firestore avec le lien Revolut.
   * @param params { amount, currency, paymentId, redirect_url? }
   * @returns checkout_url et revolut_payment_id ou null en cas d'erreur.
   */
  const createOrder = async (params: RevolutOrderParams) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/revolut-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création de la commande Revolut");
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };


  return { createOrder, loading, error, result };
}
