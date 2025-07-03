'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SurfaceData } from '@/types/devis';
import { ArrowLeft, Calculator, Home, ArrowRight, TrendingUp } from 'lucide-react';
import { Loader } from './ui/Loader';

import { useDevisConfig } from '@/components/DevisConfigContext';
import { getAllSelectedPieces } from '@/utils/pieces';

interface CalculSurfaceModalProps {
  open: boolean;
  onNext: () => void;
  onBack: () => void;
}

export const CalculSurfaceModal: React.FC<CalculSurfaceModalProps> = ({ 
  open, 
  onNext, 
  onBack
}) => {
  const router = useRouter();
  const { devisConfig, setDevisConfigField } = useDevisConfig();
  const [localData, setLocalData] = useState<SurfaceData[]>([]);

  // Génère une entrée SurfaceData pour chaque pièce sélectionnée
  function getSurfaceDataFromSelectedItems(selectedItems: any[]): SurfaceData[] {
    return selectedItems
      .filter(piece => piece.selected)
      .map(piece => ({
        piece: piece.nom,
        surfaceAuSol: 0,
        longueurMurs: 0,
        surfaceMurs: 0,
        hauteurSousPlafond: 2.5,
      }));
  }

  useEffect(() => {
    if (open) {
      const piecesSelection = devisConfig?.pieces || [];
      const allPieces = getAllSelectedPieces(piecesSelection);
      let initialData: SurfaceData[] = [];
      if ((devisConfig?.surfaceData ?? []).length > 0) {
        initialData = allPieces.map((pieceName: string) => {
          const existing = (devisConfig?.surfaceData ?? []).find((s: any) => s.piece === pieceName);
          return (
            existing || {
              piece: pieceName,
              surfaceAuSol: 0,
              longueurMurs: 0,
              surfaceMurs: 0,
              hauteurSousPlafond: 2.5,
            }
          );
        });
      } else {
        initialData = allPieces.map((pieceName: string) => ({
          piece: pieceName,
          surfaceAuSol: 0,
          longueurMurs: 0,
          surfaceMurs: 0,
          hauteurSousPlafond: 2.5,
        }));
      }
      setLocalData(initialData);
    }
    // Ne pas inclure devisConfig.surfaceData ni devisConfig.selectedItems comme dépendances pour ne pas réinitialiser à chaque modif utilisateur.
  }, [open]);

  // Pour sauvegarder les modifications dans le contexte devis
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await setDevisConfigField('surfaceData', localData);
    setLoading(false);
  };

  // Calculs automatiques basés sur des formules réalistes
  const calculateFromSurface = (surface: number, hauteur: number) => {
    if (surface <= 0) return { longueur: 0, surfaceMurs: 0, hauteur: hauteur || 2.5 };
    
    // Calcul du périmètre basé sur une forme rectangulaire optimale (ratio 1.4:1)
    const largeur = Math.sqrt(surface / 1.4);
    const longueur = surface / largeur;
    const perimetre = 2 * (largeur + longueur);
    const hauteurFinal = hauteur || 2.5;
    const surfaceMurs = perimetre * hauteurFinal;
    
    return { 
      longueur: Math.round(perimetre * 100) / 100, 
      surfaceMurs: Math.round(surfaceMurs * 100) / 100,
      hauteur: hauteurFinal
    };
  };

  const calculateFromPerimetre = (perimetre: number, hauteur: number) => {
    if (perimetre <= 0) return { surface: 0, surfaceMurs: 0, hauteur: hauteur || 2.5 };
    
    // Calcul de la surface basé sur une forme rectangulaire optimale
    const largeur = perimetre / (2 * (1 + 1.4));
    const longueur = largeur * 1.4;
    const surface = largeur * longueur;
    const hauteurFinal = hauteur || 2.5;
    const surfaceMurs = perimetre * hauteurFinal;
    
    return { 
      surface: Math.round(surface * 100) / 100, 
      surfaceMurs: Math.round(surfaceMurs * 100) / 100,
      hauteur: hauteurFinal
    };
  };

  const calculateFromSurfaceMurs = (surfaceMurs: number, hauteur: number) => {
    if (surfaceMurs <= 0 || hauteur <= 0) return { surface: 0, longueur: 0 };
    
    const perimetre = surfaceMurs / hauteur;
    const { surface } = calculateFromPerimetre(perimetre, hauteur);
    
    return { 
      surface: Math.round(surface * 100) / 100, 
      longueur: Math.round(perimetre * 100) / 100
    };
  };

  const updatePiece = (index: number, field: keyof SurfaceData, value: string) => {
    const updated = [...localData];
    const numValue = parseFloat(value) || 0;
    
    updated[index] = { ...updated[index], [field]: numValue };
    
    // Calculs automatiques selon le champ modifié
    if (field === 'surfaceAuSol') {
      const { longueur, surfaceMurs, hauteur } = calculateFromSurface(numValue, updated[index].hauteurSousPlafond);
      updated[index].longueurMurs = longueur;
      updated[index].surfaceMurs = surfaceMurs;
      if (!updated[index].hauteurSousPlafond) {
        updated[index].hauteurSousPlafond = hauteur;
      }
    } else if (field === 'hauteurSousPlafond') {
      if (updated[index].surfaceAuSol > 0) {
        const { longueur, surfaceMurs } = calculateFromSurface(updated[index].surfaceAuSol, numValue);
        updated[index].longueurMurs = longueur;
        updated[index].surfaceMurs = surfaceMurs;
      } else if (updated[index].longueurMurs > 0) {
        updated[index].surfaceMurs = updated[index].longueurMurs * numValue;
      }
    } else if (field === 'longueurMurs') {
      const { surface, surfaceMurs } = calculateFromPerimetre(numValue, updated[index].hauteurSousPlafond || 2.5);
      if (!updated[index].surfaceAuSol) {
        updated[index].surfaceAuSol = surface;
      }
      updated[index].surfaceMurs = surfaceMurs;
      if (!updated[index].hauteurSousPlafond) {
        updated[index].hauteurSousPlafond = 2.5;
      }
    } else if (field === 'surfaceMurs') {
      const hauteur = updated[index].hauteurSousPlafond || 2.5;
      const { surface, longueur } = calculateFromSurfaceMurs(numValue, hauteur);
      if (!updated[index].surfaceAuSol) {
        updated[index].surfaceAuSol = surface;
      }
      if (!updated[index].longueurMurs) {
        updated[index].longueurMurs = longueur;
      }
      if (!updated[index].hauteurSousPlafond) {
        updated[index].hauteurSousPlafond = 2.5;
      }
    }
    
    setLocalData(updated);
    setDevisConfigField('surfaceData', updated);
  };

  const totals = localData.reduce(
    (acc, item) => ({
      surfaceAuSol: acc.surfaceAuSol + (item.surfaceAuSol || 0),
      surfaceMurs: acc.surfaceMurs + (item.surfaceMurs || 0)
    }),
    { surfaceAuSol: 0, surfaceMurs: 0 }
  );

  const hasValidData = localData.some(item => (item.surfaceAuSol || 0) > 0 || (item.longueurMurs || 0) > 0 || (item.surfaceMurs || 0) > 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-[95vw] max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto max-h-[100dvh] sm:max-h-[95vh] p-0 overflow-hidden flex flex-col">
        <div className="flex flex-col h-[100dvh] sm:h-full max-h-[100dvh] sm:max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#f26755] to-[#e55a4a] px-3 sm:px-6 py-3 sm:py-5 text-white flex-shrink-0 rounded-t-2xl">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-9 w-9 p-0 text-white/70 hover:text-white hover:bg-white/20 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-base sm:text-lg font-semibold">Calcul des surfaces</h2>
            </div>
          </div>
          
          {/* Contenu principal */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
            {/* Tableau des surfaces - Version responsive */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-[#f26755]/5 px-3 sm:px-6 py-3 sm:py-4 border-b border-[#f26755]/20">
                <div className="hidden lg:grid lg:grid-cols-5 gap-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-[#f26755]" />
                    <span>Espace</span>
                  </div>
                  <div className="text-center">Surface au sol (m²)</div>
                  <div className="text-center">Hauteur (m)</div>
                  <div className="text-center">Longueur murs (m)</div>
                  <div className="text-center">Surface murs (m²)</div>
                </div>
                <div className="lg:hidden flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Home className="h-4 w-4 text-[#f26755]" />
                  <span>Configuration des espaces</span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {localData.map((item, index) => (
                  <div key={index} className="p-3 sm:p-6 hover:bg-gray-50 transition-colors">
                    {/* Version desktop */}
                    <div className="hidden lg:grid lg:grid-cols-5 gap-4 items-center">
                      <div className="font-medium text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#f26755] rounded-full" />
                        {item.piece}
                      </div>
                      <div>
                        <Input
                          type="number"
                          value={item.surfaceAuSol || ''}
                          onChange={(e) => updatePiece(index, 'surfaceAuSol', e.target.value)}
                          placeholder="0"
                          min="0"
                          step="0.1"
                          className="h-10 text-center border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20 rounded-lg"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          value={item.hauteurSousPlafond || ''}
                          onChange={(e) => updatePiece(index, 'hauteurSousPlafond', e.target.value)}
                          placeholder="2.5"
                          min="0"
                          step="0.1"
                          className="h-10 text-center border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20 rounded-lg"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          value={item.longueurMurs || ''}
                          onChange={(e) => updatePiece(index, 'longueurMurs', e.target.value)}
                          placeholder="0"
                          min="0"
                          step="0.1"
                          className="h-10 text-center border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20 rounded-lg"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          value={item.surfaceMurs || ''}
                          onChange={(e) => updatePiece(index, 'surfaceMurs', e.target.value)}
                          placeholder="0"
                          min="0"
                          step="0.1"
                          className="h-10 text-center border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Version mobile/tablet */}
                    <div className="lg:hidden space-y-4">
                      <div className="font-medium text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
                        <div className="w-2 h-2 bg-[#f26755] rounded-full" />
                        {item.piece}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Surface au sol (m²)</label>
                          <Input
                            type="number"
                            value={item.surfaceAuSol || ''}
                            onChange={(e) => updatePiece(index, 'surfaceAuSol', e.target.value)}
                            placeholder="0"
                            min="0"
                            step="0.1"
                            className="h-9 text-center border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Hauteur (m)</label>
                          <Input
                            type="number"
                            value={item.hauteurSousPlafond || ''}
                            onChange={(e) => updatePiece(index, 'hauteurSousPlafond', e.target.value)}
                            placeholder="2.5"
                            min="0"
                            step="0.1"
                            className="h-9 text-center border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Longueur murs (m)</label>
                          <Input
                            type="number"
                            value={item.longueurMurs || ''}
                            onChange={(e) => updatePiece(index, 'longueurMurs', e.target.value)}
                            placeholder="0"
                            min="0"
                            step="0.1"
                            className="h-9 text-center border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Surface murs (m²)</label>
                          <Input
                            type="number"
                            value={item.surfaceMurs || ''}
                            onChange={(e) => updatePiece(index, 'surfaceMurs', e.target.value)}
                            placeholder="0"
                            min="0"
                            step="0.1"
                            className="h-9 text-center border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section des totaux */}
            <div className="mt-4 sm:mt-6 bg-gradient-to-r from-[#f26755]/5 to-[#f26755]/10 rounded-xl p-4 sm:p-6 border border-[#f26755]/20">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-[#f26755]/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#f26755]" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Résultats calculés</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg border border-[#f26755]/20 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-[#f26755] mb-1">
                    {totals.surfaceAuSol.toFixed(2)}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-700">m² au sol</div>
                  <div className="text-xs text-gray-500 mt-1">Surface totale des espaces</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg border border-[#f26755]/20 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-[#f26755] mb-1">
                    {totals.surfaceMurs.toFixed(2)}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-700">m² de murs</div>
                  <div className="text-xs text-gray-500 mt-1">Surface totale des parois</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                {!hasValidData ? (
                  "Saisissez au moins une dimension pour continuer"
                ) : (
                  `${totals.surfaceAuSol.toFixed(2)} m² calculés automatiquement`
                )}
              </div>
              
              <Button 
                onClick={async () => {
                  await handleSave();
                  onNext();
                }}
                disabled={!hasValidData || loading}
                className={`w-full sm:w-auto h-9 sm:h-10 px-4 sm:px-6 font-medium rounded-lg transition-all duration-200 text-sm ${
                  hasValidData && !loading
                    ? 'bg-[#f26755] hover:bg-[#e55a4a] text-white shadow-sm hover:shadow-md' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? <Loader size={20} /> : <><span>Générer le devis</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" /></>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};