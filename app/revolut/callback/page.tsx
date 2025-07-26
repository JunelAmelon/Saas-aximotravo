"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RevolutCallback() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dès que le code est trouvé, le stocker et rediriger
  useEffect(() => {
    // Vérification côté client seulement
    if (typeof window === 'undefined' || !searchParams) return;
    
    const code = searchParams.get("code");
    if (!code) {
      setError("Code d'autorisation non trouvé dans l'URL");
      return;
    }
    // Stocke le code dans le localStorage pour qu'il soit accessible au hook
    localStorage.setItem("revolut_auth_code", code);
    // Utilise router.replace au lieu de window.location
    router.replace("/admin/transaction");
  }, [searchParams, router]);

  if (error) return <div className="text-red-500">{error}</div>;
  // Pas d'affichage, redirection immédiate
  return <div>Connexion à Revolut…</div>;
}
