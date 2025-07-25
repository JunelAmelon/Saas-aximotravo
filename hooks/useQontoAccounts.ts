import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { extractErrorMessage } from "@/lib/utils/error-formatter";

interface QontoBankAccount {
  id: string;
  name: string;
  iban: string;
  currency: string;
  balance: number;
  balance_cents: number;
  authorized_balance: number;
  authorized_balance_cents: number;
}

interface QontoAccountsResponse {
  bank_accounts: QontoBankAccount[];
  meta: {
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

interface UseQontoAccountsResult {
  accounts: QontoBankAccount[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  meta: QontoAccountsResponse['meta'] | null;
}

export function useQontoAccounts(): UseQontoAccountsResult {
  const [accounts, setAccounts] = useState<QontoBankAccount[] | null>(null);
  const [meta, setMeta] = useState<QontoAccountsResponse['meta'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<QontoAccountsResponse>('/api/qonto-accounts');
      setAccounts(response.data.bank_accounts);
      setMeta(response.data.meta);
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, "Erreur lors du chargement des comptes Qonto");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, loading, error, refetch: fetchAccounts, meta };
}
