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
      const response = await axios.get("/api/revolut-transactions");
      setTransactions(response.data);
    } catch (err: any) {
      setError(err?.message || "Erreur lors du chargement des transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
}
