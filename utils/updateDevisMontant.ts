import { updateDocument, getDocumentGenerate } from "@/lib/firebase/firestore";
import { calculateDevisMontantTTC } from "./devisCalculations";
import type { DevisItem } from "@/types/devis";

/**
 * Met à jour le montant d'un devis dans la base de données
 * @param devisConfigId - ID du devis dans la collection devisConfig
 * @param selectedItems - Items sélectionnés pour le calcul
 * @param tva - Taux de TVA par défaut
 * @returns Promise<number> - Le montant TTC calculé
 */
export async function updateDevisMontantInDatabase(
  devisConfigId: string,
  selectedItems: DevisItem[] = [],
  tva: number | string = 20
): Promise<number> {
  try {
    const montantTTC = calculateDevisMontantTTC(selectedItems, tva);
    
    // Mettre à jour le montant dans devisConfig
    await updateDocument("devisConfig", devisConfigId, { 
      montant: montantTTC 
    });
    
    console.log(`Montant mis à jour pour devis ${devisConfigId}: ${montantTTC}€`);
    return montantTTC;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du montant:", error);
    throw error;
  }
}

/**
 * Recalcule et met à jour le montant d'un devis existant à partir de ses données
 * @param devisConfigId - ID du devis dans la collection devisConfig
 * @returns Promise<number | null> - Le montant TTC calculé ou null si erreur
 */
export async function recalculateDevisMontant(
  devisConfigId: string
): Promise<number | null> {
  try {
    // Récupérer les données du devis
    const devisData = await getDocumentGenerate("devisConfig", devisConfigId);
    
    if (!devisData) {
      console.error(`Devis ${devisConfigId} non trouvé`);
      return null;
    }
    
    const selectedItems = devisData.selectedItems || [];
    const tva = devisData.tva || 20;
    
    // Calculer et mettre à jour le montant
    return await updateDevisMontantInDatabase(devisConfigId, selectedItems, tva);
  } catch (error) {
    console.error("Erreur lors du recalcul du montant:", error);
    return null;
  }
}
