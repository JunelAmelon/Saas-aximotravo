import { Devis } from "./devis";

export type FactureType = 
  | 'devis' 
  | 'commission_courtier'
  | 'commission_aximotravo'
  | 'notice_comptable';

export interface Facture {
  id: string;
  numero: string;
  type: FactureType;
  devisId: string;
  devis: Devis;
  createdAt: Date;
  montantCommission?: number; // Pour les factures de commission
  tauxCommission?: number; // Taux de commission en %
  notes?: string;
}

export const FACTURE_TYPE_OPTIONS = [
  { value: 'devis', label: 'Facture Devis' },
  { value: 'commission_courtier', label: 'Commission Courtier' },
  { value: 'commission_aximotravo', label: 'Commission Aximotravo' },
  { value: 'notice_comptable', label: 'Notice Comptable' },
] as const;

export const COMMISSION_RATES = {
  commission_courtier: 12, // 12% pour le courtier
  commission_aximotravo: 3 // 3% pour Aximotravo
};
