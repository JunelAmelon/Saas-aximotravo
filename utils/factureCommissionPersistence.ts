import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { FactureType } from "@/types/facture";

export interface FactureCommissionData {
  id: string;
  devisId: string;
  factureType: FactureType;
  factureNumber: string;
  tauxCommission: number;
  montantCommissionHT: number;
  montantCommissionTTC: number;
  createdAt: Date;
  updatedAt: Date;
  pdfUrl?: string;
  cloudinaryPublicId?: string;
}

/**
 * Génère un numéro de facture unique basé sur le devis
 */
export const generateFactureNumber = (devisId: string, devisCreatedAt: any, factureType: FactureType): string => {
  let devisDate: Date;
  
  if (devisCreatedAt instanceof Date) {
    devisDate = devisCreatedAt;
  } else if (devisCreatedAt && typeof devisCreatedAt.toDate === 'function') {
    devisDate = devisCreatedAt.toDate();
  } else {
    devisDate = new Date();
  }
  
  const year = devisDate.getFullYear();
  const month = String(devisDate.getMonth() + 1).padStart(2, '0');
  
  const prefix = factureType === 'commission_courtier' ? 'FC' : 'FA';
  const devisIdHash = devisId.slice(-4);
  const typeCode = factureType === 'commission_courtier' ? '01' : '02';
  
  return `${prefix}${year.toString().slice(-2)}${month}-${devisIdHash}${typeCode}`;
};

/**
 * Récupère ou crée les données de facture de commission
 */
export const getOrCreateFactureCommissionData = async (
  devisId: string,
  devisCreatedAt: any,
  factureType: FactureType,
  tauxCommission: number,
  montantCommissionHT: number
): Promise<FactureCommissionData> => {
  const factureId = `${devisId}_${factureType}`;
  const factureRef = doc(db, "factures_commission", factureId);
  
  try {
    // Vérifier si la facture existe déjà
    const factureDoc = await getDoc(factureRef);
    
    if (factureDoc.exists()) {
      const data = factureDoc.data();
      
      // Mettre à jour le taux de commission si différent
      if (data.tauxCommission !== tauxCommission) {
        const updatedData = {
          ...data,
          tauxCommission,
          montantCommissionHT,
          montantCommissionTTC: montantCommissionHT * 1.20,
          updatedAt: new Date(),
        };
        
        await updateDoc(factureRef, updatedData);
        return updatedData as FactureCommissionData;
      }
      
      return data as FactureCommissionData;
    } else {
      // Créer une nouvelle facture
      const factureNumber = generateFactureNumber(devisId, devisCreatedAt, factureType);
      const newFactureData: FactureCommissionData = {
        id: factureId,
        devisId,
        factureType,
        factureNumber,
        tauxCommission,
        montantCommissionHT,
        montantCommissionTTC: montantCommissionHT * 1.20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(factureRef, newFactureData);
      return newFactureData;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération/création de la facture:', error);
    throw error;
  }
};

/**
 * Met à jour l'URL PDF et l'ID Cloudinary de la facture
 */
export const updateFacturePDFData = async (
  factureId: string,
  pdfUrl: string,
  cloudinaryPublicId: string
): Promise<void> => {
  const factureRef = doc(db, "factures_commission", factureId);
  
  try {
    await updateDoc(factureRef, {
      pdfUrl,
      cloudinaryPublicId,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données PDF:', error);
    throw error;
  }
};

/**
 * Vérifie si un PDF existe déjà sur Cloudinary
 */
export const checkCloudinaryFileExists = async (publicId: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://res.cloudinary.com/dqmqc0uaa/image/upload/v1_1/dqmqc0uaa/raw/upload/${publicId}.pdf`);
    
    if (response.ok) {
      return response.url;
    }
    
    return null;
  } catch (error) {
    console.log('Fichier non trouvé sur Cloudinary:', publicId);
    return null;
  }
};
