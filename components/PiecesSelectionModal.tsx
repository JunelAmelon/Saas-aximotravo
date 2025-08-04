'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieceSelection, PIECES_DISPONIBLES } from '@/types/devis';
import { ArrowLeft, Home, ArrowRight, Check } from 'lucide-react';
import { Loader } from './ui/Loader';
import { useDevisConfig } from '@/components/DevisConfigContext';

interface PiecesSelectionModalProps {
  open: boolean;
  itemId: string;
  onNext: () => void;
  onSkip?: () => void;
  onBack: () => void;
}

export function PiecesSelectionModal({ 
  open, 
  itemId, 
  onNext, 
  onBack,
  onSkip 
}: PiecesSelectionModalProps) {
  const { devisConfig, setDevisConfigField } = useDevisConfig();
  const defaultPieces: PieceSelection[] = PIECES_DISPONIBLES.map(nom => ({
    nom,
    selected: false,
    nombre: 1,
  }));
  // Fonction de normalisation pour garantir que pieces est toujours PieceSelection[]
  function normalizePieces(pieces: any): PieceSelection[] {
    if (!pieces) return defaultPieces;
    if (typeof pieces[0] === 'string') {
      return (pieces as string[]).map(nom => ({
        nom,
        selected: false,
        nombre: 1,
      }));
    }
    return pieces as PieceSelection[];
  }
  // Récupère l'item courant
  const item = devisConfig?.selectedItems?.find(i => i.id === itemId);
  // Fonction pour garantir que selectedItems est toujours PieceSelection[]
  function normalizeSelectedItems(items: any): PieceSelection[] {
    if (!items) return defaultPieces;
    // Si c'est déjà un tableau de PieceSelection
    if (items[0] && typeof items[0].nom === 'string' && 'selected' in items[0] && 'nombre' in items[0]) {
      return items as PieceSelection[];
    }
    // Si c'est un tableau de DevisItem (legacy)
    if (items[0] && Array.isArray(items[0].pieces)) {
      return items.flatMap((i: any) => i.pieces || []);
    }
    return defaultPieces;
  }

  const [localPieces, setLocalPieces] = useState<PieceSelection[]>(normalizeSelectedItems(devisConfig?.selectedItems));

  // Synchronise localPieces à chaque ouverture du modal
  useEffect(() => {
    if (open) {
      setLocalPieces(normalizeSelectedItems(devisConfig?.selectedItems));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);





  const handlePieceToggle = (index: number, checked: boolean) => {
    const updated = [...localPieces];
    updated[index] = { ...updated[index], selected: checked };
    setLocalPieces(updated);
    setDevisConfigField('pieces', updated);
  };

  const handleNombreChange = (index: number, nombre: string) => {
    const num = parseInt(nombre) || 1;
    const updated = [...localPieces];
    updated[index] = { ...updated[index], nombre: Math.max(1, num) };
    setLocalPieces(updated);
    setDevisConfigField('pieces', updated);
  };

  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    setLoading(true);
    await setDevisConfigField('pieces', localPieces);
    setLoading(false);
    onNext(); // Passe à l'étape suivante (CalculSurfaceModal)
  };

  const selectedCount = localPieces.filter(p => p.selected).length;
  const canProceed = selectedCount > 0;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="w-full sm:w-[95vw] max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto max-h-[100dvh] sm:max-h-[95vh] border-0 bg-white shadow-2xl p-0 overflow-hidden rounded-2xl flex flex-col">
        <div className="flex flex-col h-[100dvh] sm:h-full max-h-[100dvh] sm:max-h-[95vh]">
          {/* Header avec couleur de marque */}
          <div className="bg-gradient-to-r from-[#f26755] to-[#e55a4a] px-3 sm:px-6 py-3 sm:py-5 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="h-9 w-9 p-0 text-white/70 hover:text-white hover:bg-white/20 rounded-lg"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Home className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-base sm:text-lg font-semibold">Sélection des pièces</DialogTitle>
                    <p className="text-xs sm:text-sm text-white/90">Choisissez les espaces concernés</p>
                  </div>
                </div>
              </div>
              
              {selectedCount > 0 && (
                <div className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg border border-white/30">
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-semibold text-white">{selectedCount}</div>
                    <div className="text-xs text-white/90">sélectionnée{selectedCount > 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contenu */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {localPieces.map((piece, index) => (
                <div 
                  key={piece.nom}
                  className={`group relative p-3 sm:p-4 rounded-xl transition-all duration-200 cursor-pointer border-2 ${
                    piece.selected 
                      ? 'bg-[#f26755]/5 border-[#f26755] shadow-md' 
                      : 'bg-white border-gray-200 hover:border-[#f26755]/30 hover:shadow-sm'
                  }`}
                  onClick={() => handlePieceToggle(index, !piece.selected)}
                >
                  {/* Indicateur de sélection */}
                  {piece.selected && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-[#f26755] rounded-full flex items-center justify-center shadow-sm">
                      <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                    </div>
                  )}

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Checkbox
                        id={`piece-${index}`}
                        checked={piece.selected}
                        onCheckedChange={(checked) => 
                          handlePieceToggle(index, checked as boolean)
                        }
                        className="data-[state=checked]:bg-[#f26755] data-[state=checked]:border-[#f26755] h-4 w-4 sm:h-5 sm:w-5 rounded border-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Label 
                        htmlFor={`piece-${index}`}
                        className="text-xs sm:text-sm font-medium text-gray-800 cursor-pointer leading-tight"
                      >
                        {piece.nom}
                      </Label>
                    </div>
                    
                    {piece.selected && (
                      <div className="space-y-1 sm:space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
                        <Label 
                          htmlFor={`nombre-${index}`}
                          className="text-xs font-medium text-gray-600"
                        >
                          Quantité
                        </Label>
                        <Input
                          id={`nombre-${index}`}
                          type="number"
                          value={piece.nombre}
                          onChange={(e) => handleNombreChange(index, e.target.value)}
                          min="1"
                          className="h-8 sm:h-9 text-xs sm:text-sm border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20 rounded-lg text-center"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                {selectedCount === 0 ? (
                  "Sélectionnez au moins une pièce pour continuer"
                ) : (
                  `${selectedCount} pièce${selectedCount > 1 ? 's' : ''} sélectionnée${selectedCount > 1 ? 's' : ''}`
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Bouton Passer cette étape */}
                <Button 
                  onClick={onSkip}
                  disabled={false}
                  variant="outline"
                  className="w-full sm:w-auto h-9 sm:h-10 px-4 sm:px-6 font-medium rounded-lg transition-all duration-200 text-sm border-[#f26755]/30 text-[#f26755] hover:bg-[#f26755]/10 hover:border-[#f26755]/50 hover:text-[#f26755]"
                >
                  Passer
                </Button>
                
                {/* Bouton Continuer */}
                <Button 
                  onClick={handleProceed}
                  disabled={!canProceed || loading}
                  className={`w-full sm:w-auto h-9 sm:h-10 px-4 sm:px-6 font-medium rounded-lg transition-all duration-200 text-sm ${
                    canProceed && !loading
                      ? 'bg-[#f26755] hover:bg-[#e55a4a] text-white shadow-sm hover:shadow-md' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? <Loader size={20} /> : <><span>Continuer</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" /></>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}