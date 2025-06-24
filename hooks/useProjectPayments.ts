import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc
} from "firebase/firestore";

export type PaymentStatus = "validé" | "en_attente";
export interface ProjectPayment {
  id: string;
  projectId: string;
  title: string;
  date: string;
  description: string;
  status: PaymentStatus;
  amount: number;
  images: string[];
  documents: string[];
  project?: string;
  dateValidation: string;
  localisation?: string;
  client?: {
    id: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
  courtier?: {
    id: string;
    name?: string;
    company?: string;
    [key: string]: any;
  };
}

/**
 * Ajoute un acompte (payment) dans la collection Firestore 'payments'.
 * @param payment Un objet ProjectPayment sans l'id (l'id sera généré par Firestore)
 * @returns L'id du document créé
 */
export async function addPayment(payment: Omit<ProjectPayment, 'id'>): Promise<string> {
  const paymentsRef = collection(db, "payments");
  const docRef = await addDoc(paymentsRef, payment);
  return docRef.id;
}

export function useProjectPayments(projectId: string) {
  const [payments, setPayments] = useState<ProjectPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    const fetchPayments = async () => {
      try {
        const paymentsRef = collection(db, "payments");
        const q = query(
          paymentsRef,
          where("projectId", "==", projectId),
          orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        const paymentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectPayment[];
        setPayments(paymentsList);
      } catch (e) {
        setError("Erreur lors du chargement des acomptes");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [projectId]);

  return { payments, loading, error };
}
