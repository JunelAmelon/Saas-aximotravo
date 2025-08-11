import type { DevisItem } from "@/types/devis";

/**
 * Calcule le montant total TTC d'un devis à partir de ses items sélectionnés
 * @param selectedItems - Liste des items sélectionnés dans le devis
 * @param defaultTva - Taux de TVA par défaut si l'item n'en a pas
 * @returns Objet contenant les totaux HT, TVA et TTC
 */
export function calculateDevisTotals(
  selectedItems: DevisItem[] = [],
  defaultTva: number | string = 20
): {
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  averageTvaRate: number;
} {
  let totalHT = 0;
  let totalTVA = 0;

  selectedItems.forEach((item) => {
    // Ignore les items offerts
    if (!item.isOffered) {
      const itemHT = item.prix_ht * item.quantite;
      const itemTvaRate =
        item.tva !== undefined
          ? item.tva
          : typeof defaultTva === "number"
          ? defaultTva
          : parseFloat(defaultTva as string) || 20;
      const itemTVA = itemHT * (itemTvaRate / 100);

      totalHT += itemHT;
      totalTVA += itemTVA;
    }
  });

  const totalTTC = totalHT + totalTVA;
  
  // TVA moyenne pondérée pour affichage
  const averageTvaRate = totalHT > 0 ? (totalTVA / totalHT) * 100 : 0;

  return {
    totalHT,
    totalTVA,
    totalTTC,
    averageTvaRate,
  };
}

/**
 * Calcule et retourne uniquement le montant TTC d'un devis
 * @param selectedItems - Liste des items sélectionnés dans le devis
 * @param defaultTva - Taux de TVA par défaut
 * @returns Montant TTC du devis
 */
export function calculateDevisMontantTTC(
  selectedItems: DevisItem[] = [],
  defaultTva: number | string = 20
): number {
  const { totalTTC } = calculateDevisTotals(selectedItems, defaultTva);
  return totalTTC;
}
