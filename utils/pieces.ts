// Utilitaire pour générer la liste plate des pièces sélectionnées
import { PieceSelection } from '@/types/devis';

/**
 * Retourne la liste des pièces physiques à afficher (ex: ["Chambre 1", "Chambre 2", "Entrée 1"]).
 * @param piecesSelection Array de PieceSelection (du contexte devisConfig.pieces)
 */
export function getAllSelectedPieces(piecesSelection: PieceSelection[]): string[] {
  return piecesSelection
    .filter(p => p.selected)
    .flatMap(p =>
      Array.from({ length: p.nombre }, (_, i) =>
        p.nombre > 1 ? `${p.nom} ${i + 1}` : p.nom
      )
    );
}
