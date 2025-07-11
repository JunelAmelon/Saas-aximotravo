"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RevolutCallback() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Dès que le code est trouvé, le stocker et rediriger
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) {
      setError("Code d’autorisation non trouvé dans l’URL");
      return;
    }
    // Stocke le code dans le localStorage pour qu'il soit accessible au hook
    localStorage.setItem("revolut_auth_code", code);
    // Redirige automatiquement vers la page d'admin
    window.location.replace("/admin/transaction");
  }, []);

  if (error) return <div className="text-red-500">{error}</div>;
  // Pas d'affichage, redirection immédiate
  return <div>Connexion à Revolut…</div>;
}
