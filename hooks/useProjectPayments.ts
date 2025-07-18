import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc
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
  amoIncluded?: boolean;
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
  validation?: {
    montant: number;
    devise: string;
    dateVirement: string;
    reference: string;
    banque: string | null;
    updatedAt: string;
  };
}

/**
 * Ajoute un acompte (payment) dans la collection Firestore 'payments'.
 * @param payment Un objet ProjectPayment sans l'id (l'id sera généré par Firestore)
 * @returns L'id du document créé
 */
export async function addPayment(payment: Omit<ProjectPayment, 'id'>): Promise<string> {
  // 1. Récupérer le projet pour avoir le budget
  const projectRef = doc(db, "projects", payment.projectId);
  const projectSnap = await getDoc(projectRef);
  if (!projectSnap.exists()) throw new Error("Projet introuvable");
  const project = projectSnap.data();
  const budget = typeof project.budget === "number" ? project.budget : Number(project.budget);

  // 2. Récupérer tous les paiements du projet
  const paymentsRef = collection(db, "payments");
  const q = query(paymentsRef, where("projectId", "==", payment.projectId));
  const querySnapshot = await getDocs(q);
  const totalPaid = querySnapshot.docs.reduce((sum, doc) => {
    const data = doc.data();
    return sum + (typeof data.amount === "number" ? data.amount : Number(data.amount) || 0);
  }, 0);

  // 3. Vérifier la règle métier
  if (totalPaid >= budget) {
    throw new Error("Le budget du projet est déjà atteint.");
  }
  if ((totalPaid + payment.amount) > budget) {
    throw new Error("Ce paiement dépasserait le budget du projet.");
  }

  // 4. Ajouter le paiement si OK
  const docRef = await addDoc(paymentsRef, payment);
  return docRef.id;
}


/**
 * Met à jour le statut d'un paiement dans Firestore.
 * @param paymentId L'id du paiement à mettre à jour
 * @param status Le nouveau statut ("validé" ou "en_attente")
 */
export async function updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void> {
  const paymentRef = doc(db, "payments", paymentId);
  await updateDoc(paymentRef, { status });

  // Récupère le paiement pour obtenir le projectId et le montant
  const paymentSnap = await getDoc(paymentRef);
  const payment = paymentSnap.data();
  console.log("payment", payment);
  if (!payment || !payment.projectId) return;

  // Récupère le paidAmount actuel du projet
  const projectRef = doc(db, "projects", payment.projectId);
  const projectSnap = await getDoc(projectRef);
  const project = projectSnap.data();
  const currentPaidAmount = project?.paidAmount || 0;
  const paymentAmount = payment.amount || 0;
  console.log("currentPaidAmount", currentPaidAmount);
  console.log("paymentAmount", paymentAmount);
  console.log("idprojet", payment.projectId)

  // Prépare la mise à jour du projet : paidAmount, et éventuellement status
  const updateData: any = { paidAmount: currentPaidAmount + paymentAmount };
  if (project?.status === "En attente") {
    updateData.status = "En cours";
  }

  // Mets à jour le projet
  await updateDoc(projectRef, updateData);
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
