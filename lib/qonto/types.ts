// Types pour l'API Qonto
export interface QontoTransaction {
  transaction_id: string;
  amount: number;
  amount_cents: number;
  settled_balance: number;
  settled_balance_cents: number;
  attachment_ids: string[];
  local_amount: number;
  local_amount_cents: number;
  side: "debit" | "credit";
  operation_type: string;
  currency: string;
  local_currency: string;
  label: string;
  settled_at: string;
  emitted_at: string;
  updated_at: string;
  status: string;
  note: string | null;
  reference: string | null;
  vat_amount: number | null;
  vat_amount_cents: number | null;
  vat_rate: number | null;
  initiator_id: string;
  label_ids: string[];
  attachment_lost: boolean;
  attachment_required: boolean;
  card_last_digits: string | null;
  category: string;
  cashflow_category: {
    name: string;
  };
  cashflow_subcategory: {
    name: string;
  };
  id: string;
  subject_type: string;
  transfer?: {
    counterparty_account_number: string;
    counterparty_account_number_format: string;
    counterparty_bank_identifier: string;
    counterparty_bank_identifier_format: string;
  };
}

export interface QontoTransactionsResponse {
  transactions: QontoTransaction[];
  meta: {
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

// Format simplifié pour l'affichage dans l'app
export interface SimplifiedTransaction {
  id: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  type: "credit" | "debit";
  status: string;
  reference?: string;
  category?: string;
}

// Fonction utilitaire pour convertir une transaction Qonto en format simplifié
export function mapQontoTransaction(qontoTx: QontoTransaction): SimplifiedTransaction {
  return {
    id: qontoTx.transaction_id,
    amount: qontoTx.amount,
    currency: qontoTx.currency,
    date: qontoTx.settled_at || qontoTx.emitted_at,
    description: qontoTx.label,
    type: qontoTx.side,
    status: qontoTx.status,
    reference: qontoTx.reference || undefined,
    category: qontoTx.cashflow_category?.name || qontoTx.category,
  };
}
