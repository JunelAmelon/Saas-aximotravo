import { db } from './config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type AccompteStatus = "en_attente" | "payé" | "en_retard";

export interface Accompte {
  id?: string;
  projectId: string;
  title: string;
  date: string;
  description?: string;
  status: AccompteStatus;
  amount: number;
  images: string[];
  createdAt: any;
  updatedAt: any;
}

// Crée un accompte Firestore pour un projet donné
export async function createAccompte(accompte: Omit<Accompte, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = collection(db, 'payments');
  const docRef = await addDoc(ref, {
    ...accompte,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, ...accompte };
}
