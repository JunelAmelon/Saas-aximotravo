'use client';

import { useState, useCallback } from 'react';
import { Devis, PieceSelection, SurfaceData, DevisItem, PIECES_DISPONIBLES } from '@/types/devis';

export function useDevis() {
  const [currentDevis, setCurrentDevis] = useState<Partial<Devis> | null>(null);
  const [step, setStep] = useState<'create' | 'pieces' | 'calcul' | 'generation'>('create');

  const generateDevisNumber = useCallback(() => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DEV-${year}-${random}`;
  }, []);

  const createDevis = useCallback((titre: string, tva: number | string) => {
    const newDevis: Partial<Devis> = {
      id: crypto.randomUUID(),
      titre,
      numero: generateDevisNumber(),
      tva,
      pieces: PIECES_DISPONIBLES.map(nom => ({
        nom,
        selected: false,
        nombre: 1
      })),
      surfaceData: [],
      selectedItems: [],
      createdAt: new Date()
    };
    
    setCurrentDevis(newDevis);
    setStep('pieces');
  }, [generateDevisNumber]);

  const updatePieces = useCallback((pieces: PieceSelection[]) => {
    if (!currentDevis) return;
    
    setCurrentDevis({
      ...currentDevis,
      pieces
    });
  }, [currentDevis]);

  const updateSurfaceData = useCallback((surfaceData: SurfaceData[]) => {
    if (!currentDevis) return;
    
    setCurrentDevis({
      ...currentDevis,
      surfaceData
    });
  }, [currentDevis]);

  const updateSelectedItems = useCallback((selectedItems: DevisItem[]) => {
    if (!currentDevis) return;
    
    setCurrentDevis({
      ...currentDevis,
      selectedItems
    });
  }, [currentDevis]);

  const nextStep = useCallback(() => {
    if (step === 'pieces') {
      // Générer les données de surface pour les pièces sélectionnées
      if (currentDevis?.pieces) {
        const selectedPieces = currentDevis.pieces.filter(p => p.selected);
        const surfaceData: SurfaceData[] = [];
        
        selectedPieces.forEach(piece => {
          for (let i = 0; i < piece.nombre; i++) {
            surfaceData.push({
              piece: piece.nombre > 1 ? `${piece.nom} ${i + 1}` : piece.nom,
              surfaceAuSol: 0,
              hauteurSousPlafond: 2.5,
              longueurMurs: 0,
              surfaceMurs: 0
            });
          }
        });
        
        updateSurfaceData(surfaceData);
      }
      setStep('calcul');
    } else if (step === 'calcul') {
      setStep('generation');
    }
  }, [step, currentDevis, updateSurfaceData]);

  const previousStep = useCallback(() => {
    if (step === 'generation') {
      setStep('calcul');
    } else if (step === 'calcul') {
      setStep('pieces');
    } else if (step === 'pieces') {
      setStep('create');
    }
  }, [step]);

  const resetDevis = useCallback(() => {
    setCurrentDevis(null);
    setStep('create');
  }, []);

  return {
    currentDevis,
    step,
    createDevis,
    updatePieces,
    updateSurfaceData,
    updateSelectedItems,
    nextStep,
    previousStep,
    resetDevis
  };
}