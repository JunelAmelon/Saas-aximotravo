import { useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc as fsDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/ClientApp";

export type QontoPaymentParams = {
  amount: number;
  currency: string;
  paymentId: string; // id Firestore du paiement à mettre à jour
  description?: string;
};

export type QontoPaymentResult = {
  payment_url: string;
  qonto_payment_link_id: string;
  status: string;
  [key: string]: any;
};

export type QontoConnectionStatus = {
  status: 'enabled' | 'pending' | 'disabled' | 'not_connected';
  connection_location?: string;
  bank_account_id: string;
};

export type QontoBankAccount = {
  id: string;
  name: string;
  organization_id: string;
  status: 'active' | 'inactive';
  main: boolean;
  iban: string;
  bic: string;
  currency: string;
  balance: number;
  balance_cents: number;
  authorized_balance: number;
  authorized_balance_cents: number;
  updated_at: string;
  is_external_account: boolean;
  account_number: number;
};

export type QontoBankAccountsResult = {
  bank_accounts: QontoBankAccount[];
  main_account: QontoBankAccount | null;
  main_account_id: string | null;
};

/**
 * Vérifie l'état de la connexion Qonto
 */
export async function checkQontoConnection(): Promise<QontoConnectionStatus> {
  const res = await fetch('/api/qonto-connection');
  if (!res.ok) throw new Error("Impossible de vérifier la connexion Qonto");
  return await res.json();
}

/**
 * Initie la connexion au provider Qonto
 */
export async function initiateQontoConnection(): Promise<QontoConnectionStatus> {
  const res = await fetch('/api/qonto-connection', { method: 'POST' });
  if (!res.ok) throw new Error("Impossible d'initier la connexion Qonto");
  return await res.json();
}

/**
 * Récupère le statut d'un lien de paiement Qonto et met à jour Firestore
 */
export async function fetchQontoPaymentStatus(paymentLinkId: string) {
  const res = await fetch(`/api/qonto-payment-status?paymentLinkId=${paymentLinkId}`);
  if (!res.ok) throw new Error("Impossible de récupérer le statut du paiement Qonto");
  const data = await res.json();

  // Met à jour le statut du paiement dans Firestore si trouvé
  try {
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("qonto_payment_link_id", "==", paymentLinkId));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      const paymentDoc = snap.docs[0];
      let newStatus = "en_attente";
      
      // Vérifier si un paiement a été effectué avec succès
      if (data.has_successful_payment) {
        newStatus = "validé";
      } else if (data.link_status === 'expired' || data.link_status === 'cancelled') {
        newStatus = "échoué";
      }
      
      await updateDoc(fsDoc(db, "payments", paymentDoc.id), {
        status: newStatus,
        qonto_link_status: data.link_status,
        qonto_payments: data.payments,
        qonto_updated_at: new Date().toISOString()
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

/**
 * Hook pour créer des liens de paiement Qonto
 */
export function useCreateQontoPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QontoPaymentResult | null>(null);

  /**
   * Crée un lien de paiement Qonto et met à jour le paiement Firestore
   */
  const createPaymentLink = async (params: QontoPaymentParams) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await fetch("/api/qonto-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Si la connexion n'est pas active, on peut proposer de l'initier
        if (data.connection_status && data.connection_status !== 'enabled') {
          throw new Error(`Connexion Qonto requise. Statut: ${data.connection_status}`);
        }
        throw new Error(data.error || "Erreur lors de la création du lien de paiement Qonto");
      }
      
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createPaymentLink, loading, error, result };
}

// Hook pour récupérer les comptes bancaires Qonto
export function useQontoBankAccounts() {
  const [bankAccounts, setBankAccounts] = useState<QontoBankAccount[]>([]);
  const [mainAccount, setMainAccount] = useState<QontoBankAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBankAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/qonto-bank-accounts');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des comptes');
      }
      
      setBankAccounts(data.bank_accounts || []);
      setMainAccount(data.main_account || null);
      
      return data as QontoBankAccountsResult;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    bankAccounts, 
    mainAccount, 
    fetchBankAccounts, 
    loading, 
    error 
  };
}

/**
 * Hook pour gérer la connexion Qonto
 */
export function useQontoConnection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<QontoConnectionStatus | null>(null);

  const checkConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const status = await checkQontoConnection();
      setConnectionStatus(status);
      return status;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const initiateConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const status = await initiateQontoConnection();
      setConnectionStatus(status);
      return status;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { 
    checkConnection, 
    initiateConnection, 
    loading, 
    error, 
    connectionStatus 
  };
}
