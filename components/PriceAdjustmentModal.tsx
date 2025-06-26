'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DevisItem } from '@/types/devis';
import { X, Calculator, TrendingDown, AlertCircle } from 'lucide-react';

interface PriceAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: DevisItem[];
  onAdjustPrices: (adjustedItems: DevisItem[]) => void;
}

export function PriceAdjustmentModal({ 
  open, 
  onOpenChange, 
  items, 
  onAdjustPrices 
}: PriceAdjustmentModalProps) {
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [selectedLots, setSelectedLots] = useState<string[]>([]);
  const [adjustedItems, setAdjustedItems] = useState<DevisItem[]>([]);

  // Calculer le total actuel
  const currentTotal = items.reduce((sum, item) => {
    if (item.isOffered) return sum;
    return sum + (item.quantite * item.prix_ht);
  }, 0);

  // Grouper les items par lot
  const lotGroups = items.reduce((groups, item) => {
    if (!groups[item.lotName]) {
      groups[item.lotName] = [];
    }
    groups[item.lotName].push(item);
    return groups;
  }, {} as Record<string, DevisItem[]>);

  // Calculer le total par lot
  const lotTotals = Object.entries(lotGroups).map(([lotName, lotItems]) => {
    const total = lotItems.reduce((sum, item) => {
      if (item.isOffered) return sum;
      return sum + (item.quantite * item.prix_ht);
    }, 0);
    return { lotName, total, itemCount: lotItems.length };
  });

  const handleLotToggle = (lotName: string, checked: boolean) => {
    setSelectedLots(prev => 
      checked 
        ? [...prev, lotName]
        : prev.filter(name => name !== lotName)
    );
  };

  const calculateAdjustment = () => {
    const target = parseFloat(targetPrice);
    if (!target || selectedLots.length === 0) return;

    // Calculer le total des lots sélectionnés
    const selectedTotal = selectedLots.reduce((sum, lotName) => {
      const lotItems = lotGroups[lotName] || [];
      return sum + lotItems.reduce((lotSum, item) => {
        if (item.isOffered) return lotSum;
        return lotSum + (item.quantite * item.prix_ht);
      }, 0);
    }, 0);

    if (selectedTotal === 0) return;

    // Calculer le ratio d'ajustement
    const adjustmentRatio = target / selectedTotal;

    // Appliquer l'ajustement aux items sélectionnés
    const newItems = items.map(item => {
      if (selectedLots.includes(item.lotName) && !item.isOffered) {
        return {
          ...item,
          prix_ht: item.prix_ht * adjustmentRatio,
          originalPrix: item.originalPrix || item.prix_ht
        };
      }
      return item;
    });

    setAdjustedItems(newItems);
  };

  useEffect(() => {
    calculateAdjustment();
  }, [targetPrice, selectedLots]);

  const handleApply = () => {
    if (adjustedItems.length > 0) {
      onAdjustPrices(adjustedItems);
      onOpenChange(false);
    }
  };

  const adjustedTotal = adjustedItems.reduce((sum, item) => {
    if (item.isOffered) return sum;
    return sum + (item.quantite * item.prix_ht);
  }, 0);

  const savings = currentTotal - adjustedTotal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-y-auto border-0 bg-white shadow-2xl p-0 rounded-2xl">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#f26755] to-[#e55a4a] px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle>
                    <h2 className="text-lg font-semibold">Ajuster les prix</h2>
                  </DialogTitle>
                  <p className="text-sm text-white/90">Modifier le montant total par lots</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/20 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-6">
            {/* Résumé actuel */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">Total actuel HT :</span>
                <span className="text-xl font-bold text-gray-900">{currentTotal.toFixed(2)} €</span>
              </div>
              <p className="text-sm text-gray-600">Montant avant ajustement</p>
            </div>

            {/* Prix cible */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Nouveau montant souhaité HT (€)</Label>
              <Input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="text-lg font-medium border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20"
                placeholder="Entrez le montant cible..."
                min="0"
                step="0.01"
              />
            </div>

            {/* Sélection des lots */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Lots à ajuster</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lotTotals.map(({ lotName, total, itemCount }) => (
                  <div
                    key={lotName}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedLots.includes(lotName)
                        ? 'border-[#f26755] bg-[#f26755]/5'
                        : 'border-gray-200 hover:border-[#f26755]/30'
                    }`}
                    onClick={() => handleLotToggle(lotName, !selectedLots.includes(lotName))}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedLots.includes(lotName)}
                        onCheckedChange={(checked) => handleLotToggle(lotName, checked as boolean)}
                        className="data-[state=checked]:bg-[#f26755] data-[state=checked]:border-[#f26755]"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{lotName}</div>
                        <div className="text-sm text-gray-600">
                          {itemCount} prestation{itemCount > 1 ? 's' : ''} • {total.toFixed(2)} € HT
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aperçu de l'ajustement */}
            {adjustedItems.length > 0 && parseFloat(targetPrice) > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800 mb-2">Aperçu de l&apos;ajustement</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Nouveau total :</span>
                        <span className="font-medium text-blue-800">{adjustedTotal.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Différence :</span>
                        <span className={`font-medium ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {savings >= 0 ? '-' : '+'}{Math.abs(savings).toFixed(2)} €
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Ratio d&apos;ajustement :</span>
                        <span className="font-medium text-blue-800">
                          {((adjustedTotal / currentTotal) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Avertissement */}
            {parseFloat(targetPrice) > 0 && selectedLots.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <TrendingDown className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 mb-1">Information importante</h4>
                    <p className="text-sm text-amber-700">
                      Les prix de toutes les prestations des lots sélectionnés seront ajustés proportionnellement 
                      pour atteindre le montant cible. Cette action est irréversible.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedLots.length} lot{selectedLots.length > 1 ? 's' : ''} sélectionné{selectedLots.length > 1 ? 's' : ''}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={!targetPrice || selectedLots.length === 0 || adjustedItems.length === 0}
                  className="bg-[#f26755] hover:bg-[#e55a4a] text-white disabled:bg-gray-300"
                >
                  Appliquer l&apos;ajustement
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}