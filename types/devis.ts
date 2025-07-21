import { Timestamp } from "firebase/firestore";

export interface Devis {
  projectId: string;
  id: string;
  titre: string;
  numero: string;
  tva: number | string;
  pieces: PieceSelection[];
  surfaceData: SurfaceData[];
  selectedItems: DevisItem[];
  createdAt: Date;
  clientInfo?: ClientInfo;
  companyInfo?: CompanyInfo;
  attribution?: {
    artisanId: string;
    artisanName: string;
  };
}

export interface ClientInfo {
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone?: string;
  email?: string;
}

export interface CompanyInfo {
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone: string;
  email: string;
  siret?: string;
}

export interface PieceSelection {
  nom: string;
  selected: boolean;
  nombre: number;
}

export interface SurfaceData {
  piece: string;
  surfaceAuSol: number;
  hauteurSousPlafond: number;
  longueurMurs: number;
  surfaceMurs: number;
}

export interface DevisItem {
  id: string;
  lotName: string;
  subcategoryName: string;
  itemName: string;
  optionLabel: string;
  prix_ht: number;
  unite: string;
  description: string;
  quantite: number;
  pieces: string[];
  isOffered?: boolean;
  customImage?: string;
  customUnit?: string;
  originalPrix?: number;
  tva?: number; // TVA spécifique à cette prestation
  selectedPieces?: DevisPiece[];
}

export interface DevisPiece {
  url: string;
  name?: string;
  type?: string;
  size?: number;
}

export const PIECES_DISPONIBLES = [
  'Chambre',
  'Bureau', 
  'Dégagement',
  'Cuisine',
  'Dressing',
  'Entrée',
  'Pièce principale',
  'Salle à manger',
  'Salle d\'eau',
  'Salle de bain',
  'Salon',
  'WC'
];

export const TVA_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 5.5, label: '5.5%' },
  { value: 10, label: '10%' },
  { value: 20, label: '20%' },
  { value: 'custom', label: 'Personnalisé' }
];

export const UNIT_OPTIONS = [
  { value: 'm', label: 'm (mètre)' },
  { value: 'm²', label: 'm² (mètre carré)' },
  { value: 'm³', label: 'm³ (mètre cube)' },
  { value: 'ml', label: 'ml (mètre linéaire)' },
  { value: 'heure', label: 'heure' },
  { value: 'jour', label: 'jour' },
  { value: 'kg', label: 'kg (kilogramme)' },
  { value: 'forfait', label: 'forfait' },
  { value: 'unité', label: 'unité' },
  { value: 'lot', label: 'lot' },
  { value: 'pièce', label: 'pièce' }
];