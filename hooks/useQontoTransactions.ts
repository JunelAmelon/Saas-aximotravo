import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { QontoTransaction, QontoTransactionsResponse } from "@/lib/qonto/types";

interface UseQontoTransactionsResult {
  transactions: QontoTransaction[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  meta: QontoTransactionsResponse['meta'] | null;
}

export function useQontoTransactions(): UseQontoTransactionsResult {
  const [transactions, setTransactions] = useState<QontoTransaction[] | null>(null);
  const [meta, setMeta] = useState<QontoTransactionsResponse['meta'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<QontoTransactionsResponse>('/api/qonto-transactions');
      setTransactions(response.data.transactions);
      setMeta(response.data.meta);
    } catch (err: any) {
      // Gestion robuste des erreurs pour s'assurer qu'on retourne toujours une chaîne
      let errorMessage = "Erreur lors du chargement des transactions Qonto";
      
      if (err?.response?.data?.error) {
        errorMessage = typeof err.response.data.error === 'string' 
          ? err.response.data.error 
          : JSON.stringify(err.response.data.error);
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions, meta };
}
