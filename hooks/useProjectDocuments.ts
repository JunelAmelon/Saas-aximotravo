import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
} from "firebase/firestore";

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  category: string;
  date: string;
  size: string;
  status: "signé" | "en attente";
  url: string;
  montant?: number;
  devisConfigId?: string;
  documentId?: string;
}

export async function addProjectDocument({ projectId, name, category, date, size, status, url, montant, devisConfigId }: {
  projectId: string;
  name: string;
  category: string;
  date: string;
  size: string;
  status: "signé" | "en attente";
  url: string;
  montant?: number;
  devisConfigId?: string;
  }) {
  const docRef = await addDoc(collection(db, "documents"), {
    projectId,
    name,
    category,
    date,
    size,
    status,
    url,
  });
  // Si c'est un devis, ajoute aussi dans la table devis
  if (category.toLowerCase() === "devis") {
    await addDoc(collection(db, "devis"), {
      titre: name,
      type: "Devis",
      statut: status === "signé" ? "Validé" : "En attente",
      montant: montant ?? null,
      pdfUrl: url,
      projectId,
      devisConfigId,
      documentId: docRef.id,
    });
  }
  return docRef.id;
}

export async function fetchProjectDocuments(projectId: string): Promise<ProjectDocument[]> {
  const docsRef = collection(db, "documents");
  const q = query(
    docsRef,
    where("projectId", "==", projectId),
    orderBy("date", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectDocument[];
}

export function useProjectDocuments(projectId: string) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    const fetchDocs = async () => {
      try {
        const docsList = await fetchProjectDocuments(projectId);
        setDocuments(docsList);
      } catch (e) {
        setError("Erreur lors du chargement des documents");
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [projectId]);

  return { documents, loading, error };
}
