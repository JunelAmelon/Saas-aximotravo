import { Devis } from "./devis";

export type FactureType = 'devis' | 'commission_courtier' | 'commission_aximotravo';

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
  { value: 'devis' as FactureType, label: 'Facture Devis' },
  { value: 'commission_courtier' as FactureType, label: 'Commission Courtier' },
  { value: 'commission_aximotravo' as FactureType, label: 'Commission Aximotravo' }
];

export const COMMISSION_RATES = {
  commission_courtier: 12, // 12% pour le courtier
  commission_aximotravo: 3 // 3% pour Aximotravo
};
