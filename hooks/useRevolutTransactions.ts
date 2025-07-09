import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface RevolutTransaction {
  id: string;
  type: string;
  state: string;
  created_at: string;
  // Ajoute d'autres champs selon la doc Revolut si besoin
}

interface UseRevolutTransactionsResult {
  transactions: RevolutTransaction[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRevolutTransactions(): UseRevolutTransactionsResult {
  const [transactions, setTransactions] = useState<RevolutTransaction[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Cherche le code d'autorisation dans localStorage (si côté client)
      let codeParam = '';
      if (typeof window !== 'undefined') {
        const code = localStorage.getItem('revolut_auth_code');
        if (code) {
          codeParam = `?code=${encodeURIComponent(code)}`;
          // Supprime le code après usage pour éviter les requêtes multiples avec un code expiré
          localStorage.removeItem('revolut_auth_code');
        }
      }
      const response = await axios.get(`/api/revolut-transactions${codeParam}`);
      setTransactions(response.data);
    } catch (err: any) {
      console.log(err);
      setError(err?.response.data.error || "Erreur lors du chargement des transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
}
