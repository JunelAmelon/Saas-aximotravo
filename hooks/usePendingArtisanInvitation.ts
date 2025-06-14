import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export function usePendingArtisanInvitation(artisanId: string, projectId: string) {
  const [pending, setPending] = useState<null | { invitationId: string, status: string }>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    async function fetchPending() {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, "artisan_projet"),
          where("artisanId", "==", artisanId),
          where("projetId", "==", projectId),
          where("status", "==", "pending")
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setPending({ invitationId: snap.docs[0].id, status: "pending" });
        } else {
          setPending(null);
        }
      } catch (e: any) {
        setError(e.message || "Erreur lors de la récupération de l'invitation");
      } finally {
        setLoading(false);
      }
    }
    if (artisanId && projectId) fetchPending();
  }, [artisanId, projectId]);

  async function acceptInvitation() {
    if (!pending) return;
    setAccepting(true);
    setError(null);
    try {
      await updateDoc(doc(db, "artisan_projet", pending.invitationId), { status: "accepté" });
      setAccepted(true);
      setPending(null);
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'acceptation");
    } finally {
      setAccepting(false);
    }
  }

  return { pending, loading, error, acceptInvitation, accepting, accepted };
}
