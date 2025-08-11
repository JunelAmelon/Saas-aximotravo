import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { addDocument, updateDocument } from "@/lib/firebase/firestore";
import { getDocumentGenerate } from "@/lib/firebase/firestore";
// Types stricts importés pour la cohérence globale
import type { DevisItem, PieceSelection, SurfaceData, ClientInfo, CompanyInfo } from "@/types/devis";
// Import de la fonction de calcul du montant
import { calculateDevisMontantTTC } from "@/utils/devisCalculations";

// Typage de la configuration du devis (à enrichir selon les besoins réels)
type DevisConfig = {
  id?: string;
  titre: string;
  tva: number | string;
  status: string;
  numero?: string;
  pieces: PieceSelection[];
  surfaceData: SurfaceData[];
  selectedItems: DevisItem[];
  clientInfo?: ClientInfo;
  companyInfo?: CompanyInfo;
  createdAt?: Date;
  remise?: number; // Remise globale en % ou en €
  commentaire?: string;
  adresseChantier?: string;
  lots?: string[]; // Noms des lots présents dans ce devis
  pdfUrl?: string; // Lien vers le PDF généré
  projectId?: string; // Lien vers le projet parent
  signatureClient?: string; // Image/base64 de la signature
  deadline?: string; // Date limite de validité
  montant?: number; // Montant total TTC calculé automatiquement
  // Ajoute ici tout champ additionnel utile à l'édition ou la génération de devis
};

// Types importés nécessaires (à importer ou déclarer dans ce fichier si besoin)
// import { DevisItem, PieceSelection, SurfaceData, ClientInfo, CompanyInfo } from "@/types/devis";

type DevisConfigContextType = {
  devisConfig: Partial<DevisConfig> | null;
  devisConfigId: string | null;
  setDevisConfigField: (field: string, value: any) => void;
  createDevisConfig: (data: Partial<DevisConfig>) => Promise<string | null>;
};

const DevisConfigContext = createContext<DevisConfigContextType | undefined>(undefined);

interface DevisConfigProviderProps {
  devisId?: string;
  children: React.ReactNode;
}

export const DevisConfigProvider: React.FC<DevisConfigProviderProps> = ({ devisId, children }) => {
  const [devisConfig, setDevisConfig] = useState<Partial<DevisConfig> | null>(null);
  const [devisConfigId, setDevisConfigId] = useState<string | null>(devisId ?? null);

  // Charger le devis si un devisId est fourni
  useEffect(() => {
    if (devisId) {
      // Remplace par ta logique Firestore réelle
      const fetchDevis = async () => {
        const docSnap = await getDocumentGenerate("devisConfig", devisId);
        if (docSnap) {
          setDevisConfig({ ...docSnap, id: devisId });
          setDevisConfigId(devisId);
        }
      };
      fetchDevis();
    }
  }, [devisId]);

  // Création initiale
  const createDevisConfig = useCallback(async (data: Partial<DevisConfig>) => {
    const { id } = await addDocument("devisConfig", { ...data });
    // Ajout de l'id dans le document Firestore juste après création
    await updateDocument("devisConfig", id, { id });
    setDevisConfig({ ...data, id });
    setDevisConfigId(id);
    return id;
  }, []);

  // Auto-save sur modification d'un champ avec calcul automatique du montant
  const setDevisConfigField = useCallback(
    (field: string, value: any) => {
      if (!devisConfigId) return;
      const newConfig = { ...devisConfig, [field]: value };
      setDevisConfig(newConfig);
      
      // Calcul automatique du montant si les items sélectionnés changent
      let updateData: any = { [field]: value };
      
      if (field === 'selectedItems' && Array.isArray(value)) {
        const montantTTC = calculateDevisMontantTTC(value, newConfig.tva || 20);
        updateData.montant = montantTTC;
        // Mettre à jour aussi l'état local
        setDevisConfig({ ...newConfig, montant: montantTTC });
      }
      
      updateDocument("devisConfig", devisConfigId, updateData);
    },
    [devisConfig, devisConfigId]
  );

  return (
    <DevisConfigContext.Provider value={{ devisConfig, devisConfigId, setDevisConfigField, createDevisConfig }}>
      {children}
    </DevisConfigContext.Provider>
  );
};

export const useDevisConfig = () => {
  const ctx = useContext(DevisConfigContext);
  if (!ctx) throw new Error("useDevisConfig must be used within a DevisConfigProvider");
  return ctx;
};
