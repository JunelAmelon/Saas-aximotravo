import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { QontoTransaction, QontoTransactionsResponse } from "@/lib/qonto/types";
import { extractErrorMessage } from "@/lib/utils/error-formatter";

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
      const errorMessage = extractErrorMessage(err, "Erreur lors du chargement des transactions Qonto");
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
