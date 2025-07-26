import { useState, useEffect } from "react";
import { db } from "@/firebase/ClientApp";
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
}

export async function injectMockDocuments(projectId: string) {
  const mockDocs = [
    {
      projectId,
      name: "Devis final",
      category: "Devis",
      date: "2024-02-15",
      size: "1.2 MB",
      status: "signé" as const,
      url: "/docs/devis-final.pdf",
    },
    {
      projectId,
      name: "Facture acompte",
      category: "Facture",
      date: "2024-02-16",
      size: "856 KB",
      status: "en attente" as const,
      url: "/docs/facture-acompte.pdf",
    },
    {
      projectId,
      name: "Procès-verbal de réception",
      category: "PV",
      date: "2024-02-20",
      size: "640 KB",
      status: "en attente" as const,
      url: "/docs/pv-reception.pdf",
    },
  ];
  for (const doc of mockDocs) {
    await addDoc(collection(db, "documents"), doc);
  }
}

export function useDocuments(projectId: string) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    const fetchDocuments = async () => {
      try {
        const docsRef = collection(db, "documents");
        const q = query(
          docsRef,
          where("projectId", "==", projectId),
          orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        const docsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectDocument[];
        setDocuments(docsList);
      } catch (e) {
        setError("Erreur lors du chargement des documents");
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [projectId]);

  return { documents, loading, error };
}
