'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useDevisConfig } from '@/components/DevisConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { LOTS_TECHNIQUES, LotTechnique, LotSubcategory, LotItem, LotOption } from '@/data/lots-techniques';
import { DevisItem, Devis, SurfaceData } from '@/types/devis';
import { EditItemModal } from '@/components/EditItemModal';
import { PriceAdjustmentModal } from '@/components/PriceAdjustmentModal';
import { CreateCustomItemModal } from '@/components/CreateCustomItemModal';
import { PDFGenerator } from '@/components/PDFGenerator';
import { DevisConfigProvider } from '@/components/DevisConfigContext';
import { ArrowLeft, Search, ChevronRight, ChevronDown, Plus, Trash2, Edit3, FileText, Calculator, Euro, Download, Wrench, Hammer, Building, Home, DoorOpen, Package, Eye, Save, X, Check, Menu, Settings, Gift, Info, Percent, PlusCircle } from 'lucide-react';

interface DevisGenerationPageProps {
  onBack: () => void;
}

const iconMap = {
  Wrench,
  Hammer,
  Building,
  Home,
  DoorOpen,
  Package
};

// Fonction pour obtenir l'icône ou une icône par défaut
const getIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || Building;
};

export const DevisGenerationPage: React.FC<DevisGenerationPageProps> = ({
  onBack
}) => {
  const router = useRouter();

  const { devisConfig, setDevisConfigField } = useDevisConfig();
  const devis = devisConfig;
  const selectedItems = devisConfig?.selectedItems || [];
  const [expandedLots, setExpandedLots] = useState<string[]>([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: any }>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingItemModal, setEditingItemModal] = useState<DevisItem | null>(null);
  const [showPriceAdjustment, setShowPriceAdjustment] = useState(false);
  const [showFurniturePrice, setShowFurniturePrice] = useState(false);
  const [furnitureDiscount, setFurnitureDiscount] = useState(0);
  const [showCreateCustomModal, setShowCreateCustomModal] = useState(false);

  if (!devis) {
    return <div className="p-8 text-center text-gray-500">Chargement du devis…</div>;
  }
  // Calcul automatique des quantités basé sur les surfaces
  const calculateAutoQuantity = (option: LotOption, selectedPieces: string[]): number => {
    if (!devis.surfaceData || selectedPieces.length === 0) return 1;

    const relevantSurfaces = devis.surfaceData.filter(surface =>
      selectedPieces.includes(surface.piece)
    );

    if (relevantSurfaces.length === 0) return 1;

    switch (option.unite) {
      case 'm²':
        if (option.label.toLowerCase().includes('sol') ||
          option.label.toLowerCase().includes('carrelage') ||
          option.label.toLowerCase().includes('parquet')) {
          return relevantSurfaces.reduce((sum, surface) => sum + surface.surfaceAuSol, 0);
        } else {
          return relevantSurfaces.reduce((sum, surface) => sum + surface.surfaceMurs, 0);
        }
      case 'ml':
        return relevantSurfaces.reduce((sum, surface) => sum + surface.longueurMurs, 0);
      case 'unité':
        return selectedPieces.length;
      case 'forfait':
        return 1;
      default:
        return 1;
    }
  };

  const addItemToDevis = (
    lot: LotTechnique,
    subcategory: LotSubcategory,
    item: LotItem,
    option: LotOption
  ) => {
    
    const newItem: DevisItem = {
      id: crypto.randomUUID(),
      lotName: lot.name,
      subcategoryName: subcategory.name,
      itemName: item.name,
      optionLabel: option.label,
      prix_ht: option.prix_ht,
      unite: option.unite,
      description: option.description,
      quantite: 1,
      pieces: [],
      tva: option.tva
    };

    setDevisConfigField('selectedItems', [...selectedItems, newItem]);
    setSidebarOpen(false); // Fermer la sidebar sur mobile après ajout
  };

  const addCustomItemToDevis = (item: DevisItem) => {
    setDevisConfigField('selectedItems', [...selectedItems, item]);
  };

  const startEditing = (itemId: string, item: DevisItem) => {
    setEditingItem(itemId);
    setEditValues({
      optionLabel: item.optionLabel,
      prix_ht: item.prix_ht,
      quantite: item.quantite,
      description: item.description
    });
  };

  const saveEditing = (itemId: string) => {
    const updatedItems = selectedItems.map(item =>
      item.id === itemId ? { ...item, ...editValues } : item
    );
    setDevisConfigField('selectedItems', updatedItems);
    setEditingItem(null);
    setEditValues({});
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditValues({});
  };

  const updateItemPieces = (itemId: string, pieces: string[]) => {
    const updatedItems = selectedItems.map(item => {
      if (item.id === itemId) {
        const option = {
          label: item.optionLabel,
          unite: item.unite,
          prix_ht: item.prix_ht,
          description: item.description,
          tva: item.tva ?? 10
        };
        const autoQuantity = calculateAutoQuantity(option, pieces);

        return {
          ...item,
          pieces,
          quantite: autoQuantity
        };
      }
      return item;
    });
    setDevisConfigField('selectedItems', updatedItems);
  };

  const removeItem = (itemId: string) => {
    setDevisConfigField('selectedItems', selectedItems.filter(item => item.id !== itemId));
  };

  const updateItem = (updatedItem: DevisItem) => {
    setDevisConfigField('selectedItems',
      selectedItems.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
  };

  const calculateTotals = () => {
    let totalHT = 0;
    let totalTVA = 0;

    selectedItems.forEach(item => {
      if (!item.isOffered) {
        const itemHT = item.prix_ht * item.quantite;
        const itemTvaRate = item.tva !== undefined ? item.tva : (typeof devis.tva === 'number' ? devis.tva : parseFloat(devis.tva as string) || 20);
        const itemTVA = itemHT * (itemTvaRate / 100);

        totalHT += itemHT;
        totalTVA += itemTVA;
      }
    });

    const totalTTC = totalHT + totalTVA;

    // Calcul des fournitures (exemple: 50% du total)
    const furnitureHT = totalHT * 0.5;
    const furnitureDiscountAmount = furnitureHT * (furnitureDiscount / 100);
    const furnitureFinalHT = furnitureHT - furnitureDiscountAmount;

    // TVA moyenne pondérée pour affichage
    const averageTvaRate = totalHT > 0 ? (totalTVA / totalHT) * 100 : 0;

    return {
      totalHT,
      totalTVA,
      totalTTC,
      averageTvaRate,
      furnitureHT,
      furnitureDiscountAmount,
      furnitureFinalHT
    };
  };

  const { totalHT, totalTVA, totalTTC, averageTvaRate, furnitureHT, furnitureDiscountAmount, furnitureFinalHT } = calculateTotals();

  const filteredLots = LOTS_TECHNIQUES.filter(lot =>
    searchTerm === '' ||
    lot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.subcategories.some(sub =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.items.some(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.options.some(option =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    )
  );

  const availablePieces = devis.surfaceData?.map(surface => surface.piece) || [];

  // Grouper les items par lot pour un affichage ordonné
  const groupedItems = selectedItems.reduce((acc, item) => {
    if (!acc[item.lotName]) {
      acc[item.lotName] = [];
    }
    acc[item.lotName].push(item);
    return acc;
  }, {} as { [key: string]: DevisItem[] });

  const totalSurfaceAuSol = devis.surfaceData?.reduce((sum, surface) => sum + surface.surfaceAuSol, 0) || 0;
  const totalSurfaceMurs = devis.surfaceData?.reduce((sum, surface) => sum + surface.surfaceMurs, 0) || 0;

  const offeredItemsCount = selectedItems.filter(item => item.isOffered).length;

  // Calculer les totaux par lot comme dans l'image
  const lotTotals = Object.entries(groupedItems).map(([lotName, items], index) => {
    const total = items.reduce((sum, item) => {
      if (item.isOffered) return sum;
      return sum + (item.prix_ht * item.quantite);
    }, 0);

    // Récupérer les pièces sélectionnées pour ce lot
    const piecesForLot = Array.from(new Set(items.flatMap(item => item.pieces)));

    return {
      index: index + 1,
      name: lotName,
      total,
      itemCount: items.length,
      pieces: piecesForLot
    };
  });

  // TVA par défaut pour les nouvelles prestations
  const defaultTva = typeof devis.tva === 'number' ? devis.tva : parseFloat(devis.tva as string) || 20;

  return (
    <div className="w-full min-h-screen flex flex-col p-0 m-0 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header responsive avec gradient */}
      <div className="bg-gradient-to-r from-[#f26755] to-[#e55a4a] shadow-xl w-full overflow-x-auto">
        <div className="px-2 sm:px-6 py-3 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-y-2">
            {/* Groupe gauche */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-shrink">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onBack()}
                className="h-9 w-9 sm:h-10 sm:w-10 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {/* Bouton menu mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden h-9 w-9 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
              >
                <Menu className="h-4 w-4" />
              </Button>

              <div className="text-white min-w-0">
                <h1 className="text-base sm:text-2xl font-bold truncate max-w-[120px] sm:max-w-none">{devis.titre}</h1>
                <p className="text-white/90 text-xs sm:text-sm truncate">{devis.numero} • {selectedItems.length} prestation{selectedItems.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Groupe droite (boutons) */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-3 justify-end">
              {/* Boutons desktop */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  onClick={() => setShowPriceAdjustment(true)}
                  variant="ghost"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl h-10 px-4 backdrop-blur-sm transition-all duration-200"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Modifier le prix
                </Button>

                <PDFGenerator
                  className="bg-white text-[#f26755] hover:bg-gray-100 rounded-xl h-10 px-4 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                />
              </div>

              {/* Boutons mobiles */}
              <div className="sm:hidden flex gap-1">
                <Button
                  onClick={() => setShowPriceAdjustment(true)}
                  variant="ghost"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white rounded-lg h-9 w-9 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                {/* Bouton PDF mobile - icône seulement */}
                <PDFGenerator
                  className="bg-white text-[#f26755] hover:bg-gray-100 rounded-lg h-9 w-9 p-0 flex items-center justify-center"
                  iconOnly={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex relative">
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar responsive - Lots techniques */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative z-50 lg:z-auto
          w-80 h-[calc(100vh-80px)] lg:h-auto
          bg-white/90 backdrop-blur-sm border-r border-gray-200/50 
          flex flex-col shadow-2xl lg:shadow-lg
          transition-transform duration-300 ease-in-out
        `}>
          {/* Header sidebar */}
          <div className="p-4 sm:p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between lg:justify-start mb-4">
              <div>
                <h2 className="font-bold text-gray-900 text-base sm:text-lg">Catalogue BTP</h2>
                <p className="text-xs sm:text-sm text-gray-600">Sélectionnez vos prestations</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden h-8 w-8 p-0 text-gray-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Recherche moderne */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une prestation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 sm:h-11 border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20 rounded-xl bg-gray-50/50 backdrop-blur-sm text-sm"
              />
            </div>
          </div>

          {/* Liste des lots avec style moderne */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
            {filteredLots.map((lot) => {
              const IconComponent = getIcon(lot.icon);
              const isExpanded = expandedLots.includes(lot.name);

              return (
                <div key={lot.name} className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                  <button
                    onClick={() => toggleLot(lot.name)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-3 hover:bg-[#f26755]/5 transition-colors text-left rounded-xl"
                  >
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#f26755]/20 to-[#f26755]/10 rounded-lg">
                      <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-[#f26755]" />
                    </div>
                    <span className="flex-1 text-xs sm:text-sm font-semibold text-gray-800">{lot.name}</span>
                    <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-2 pb-2">
                      {lot.subcategories.map((subcategory) => {
                        const subcategoryKey = `${lot.name}-${subcategory.name}`;
                        const isSubExpanded = expandedSubcategories.includes(subcategoryKey);

                        return (
                          <div key={subcategoryKey} className="bg-gray-50/50 rounded-lg mt-2">
                            <button
                              onClick={() => toggleSubcategory(subcategoryKey)}
                              className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 hover:bg-gray-100/50 transition-colors text-left rounded-lg"
                            >
                              <span className="flex-1 text-xs sm:text-sm font-medium text-gray-700">{subcategory.name}</span>
                              <div className={`transition-transform duration-200 ${isSubExpanded ? 'rotate-90' : ''}`}>
                                <ChevronRight className="h-3 w-3 text-gray-400" />
                              </div>
                            </button>

                            {isSubExpanded && (
                              <div className="px-2 pb-2 space-y-1">
                                {subcategory.items.map((item) => (
                                  <div key={item.name}>
                                    <div className="text-xs font-medium text-gray-500 px-2 sm:px-3 py-1">{item.name}</div>
                                    {item.options.map((option) => (
                                      <button
                                        key={option.label}
                                        onClick={() => addItemToDevis(lot, subcategory, item, option)}
                                        className="w-full text-left p-2 sm:p-3 rounded-lg hover:bg-white border border-transparent hover:border-[#f26755]/30 hover:shadow-sm transition-all group bg-white/50"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-gray-800 group-hover:text-[#f26755] truncate">
                                              {option.label}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              <span className="font-semibold text-[#f26755]">{option.prix_ht.toFixed(2)} €</span> HT / {option.unite}
                                            </div>
                                          </div>
                                          <div className="ml-2 p-1 bg-[#f26755]/10 rounded-full group-hover:bg-[#f26755]/20 transition-colors">
                                            <Plus className="h-3 w-3 text-[#f26755]" />
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenu principal responsive */}
        <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 pt-3 sm:pt-6 md:pt-0 px-3 sm:px-6 overflow-y-auto">

            {Object.keys(groupedItems).length === 0 ? (
             <div className="h-full flex items-center justify-center p-4 md:pt-0 md:px-4 md:pb-4">
  <div className="text-center max-w-md px-4">
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#f26755]/20 to-[#f26755]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
      <Calculator className="h-8 w-8 sm:h-10 sm:w-10 text-[#f26755]" />
    </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Calcul automatique activé</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Sélectionnez des prestations dans le catalogue. Les quantités seront calculées automatiquement selon vos surfaces.</p>
                  <div className="bg-gradient-to-r from-[#f26755]/5 to-[#f26755]/10 rounded-xl p-3 sm:p-4 border border-[#f26755]/20">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-[#f26755]">{totalSurfaceAuSol.toFixed(1)}</div>
                        <div className="text-gray-600 text-xs sm:text-sm">m² au sol</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-[#f26755]">{totalSurfaceMurs.toFixed(1)}</div>
                        <div className="text-gray-600 text-xs sm:text-sm">m² de murs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Devis en cours</h2>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {selectedItems.length} ligne{selectedItems.length > 1 ? 's' : ''} • {Object.keys(groupedItems).length} lot{Object.keys(groupedItems).length > 1 ? 's' : ''}
                    {offeredItemsCount > 0 && (
                      <span className="ml-2 text-green-600">• {offeredItemsCount} offerte{offeredItemsCount > 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>

                {/* Affichage groupé par lots - responsive */}
                {Object.entries(groupedItems).map(([lotName, items]) => (
                  <div key={lotName} className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-[#f26755]/10 to-[#f26755]/5 px-4 sm:px-6 py-3 sm:py-4 border-b border-[#f26755]/20">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-[#f26755]/20 rounded-lg">
                          <Building className="h-4 w-4 sm:h-5 sm:w-5 text-[#f26755]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base">{lotName}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">{items.length} prestation{items.length > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {items.map((item) => {
                        const itemTvaRate = item.tva !== undefined ? item.tva : (typeof devis.tva === 'number' ? devis.tva : parseFloat(devis.tva as string) || 20);
                        const itemHT = item.prix_ht * item.quantite;
                        const itemTVA = itemHT * (itemTvaRate / 100);
                        const itemTTC = itemHT + itemTVA;

                        return (
                          <div key={item.id} className="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors group">
                            {editingItem === item.id ? (
                              // Mode édition responsive
                              <div className="space-y-3 sm:space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Modification de la prestation</h4>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => saveEditing(item.id)}
                                      className="bg-green-500 hover:bg-green-600 text-white h-8 px-3 rounded-lg text-xs"
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Sauver
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={cancelEditing}
                                      className="h-8 px-3 rounded-lg text-xs"
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Annuler
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                  <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">Désignation</label>
                                    <Input
                                      value={editValues.optionLabel || ''}
                                      onChange={(e) => setEditValues({ ...editValues, optionLabel: e.target.value })}
                                      className="h-8 sm:h-9 text-xs sm:text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">Prix unitaire HT</label>
                                    <Input
                                      type="number"
                                      value={editValues.prix_ht || ''}
                                      onChange={(e) => setEditValues({ ...editValues, prix_ht: parseFloat(e.target.value) || 0 })}
                                      className="h-8 sm:h-9 text-xs sm:text-sm"
                                      step="0.01"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">Quantité</label>
                                    <Input
                                      type="number"
                                      value={editValues.quantite || ''}
                                      onChange={(e) => setEditValues({ ...editValues, quantite: parseFloat(e.target.value) || 0 })}
                                      className="h-8 sm:h-9 text-xs sm:text-sm"
                                      step="0.1"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">Description</label>
                                    <Input
                                      value={editValues.description || ''}
                                      onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                                      className="h-8 sm:h-9 text-xs sm:text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Mode affichage normal responsive
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="text-xs px-2 py-1 bg-[#f26755]/10 text-[#f26755] rounded-full font-medium">
                                      {item.subcategoryName}
                                    </span>
                                    <span className="text-xs text-gray-500">{item.customUnit || item.unite}</span>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                      <Percent className="h-3 w-3" />
                                      TVA {itemTvaRate}%
                                    </div>
                                    {item.isOffered && (
                                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                        <Gift className="h-3 w-3" />
                                        Offert
                                      </div>
                                    )}
                                  </div>
                                  <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{item.optionLabel}</h4>

                                  {item.customImage && (
                                    <div className="mb-2">
                                      <Image
                                        src={item.customImage}
                                        alt="Illustration"
                                        width={100}
                                        height={100}
                                        className="w-16 h-12 object-cover rounded border"
                                      />
                                    </div>
                                  )}

                                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{item.description}</p>

                                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
                                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                                      <label className="text-xs font-medium text-gray-700 mb-1 block">Quantité</label>
                                      <div className="text-sm sm:text-lg font-bold text-gray-900">
                                        {item.quantite} {item.customUnit || item.unite}
                                        {item.pieces.length > 0 && (
                                          <span className="text-xs text-[#f26755] ml-1">(auto)</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                                      <label className="text-xs font-medium text-gray-700 mb-1 block">Prix unitaire</label>
                                      <div className="text-sm sm:text-lg font-bold text-gray-900">
                                        {item.prix_ht.toFixed(2)} € HT
                                      </div>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
                                      <label className="text-xs font-medium text-gray-700 mb-1 block">TVA</label>
                                      <div className="text-sm sm:text-lg font-bold text-blue-700">
                                        {itemTvaRate}%
                                      </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                                      <label className="text-xs font-medium text-gray-700 mb-1 block">Total HT</label>
                                      <div className="text-sm sm:text-lg font-bold text-gray-900">
                                        {itemHT.toFixed(2)} €
                                      </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-[#f26755]/10 to-[#f26755]/5 rounded-lg p-2 sm:p-3 border border-[#f26755]/20">
                                      <label className="text-xs font-medium text-gray-700 mb-1 block">Total TTC</label>
                                      <div className="text-sm sm:text-lg font-bold">
                                        {item.isOffered ? (
                                          <div className="flex items-center gap-1 text-green-600">
                                            <span className="line-through text-gray-400">
                                              {itemTTC.toFixed(2)} €
                                            </span>
                                            <Gift className="h-3 w-3" />
                                          </div>
                                        ) : (
                                          <span className="text-[#f26755]">
                                            {itemTTC.toFixed(2)} €
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingItemModal(item)}
                                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 border-gray-200 hover:border-[#f26755] hover:bg-[#f26755]/5 rounded-lg group-hover:opacity-100 opacity-60 transition-all"
                                    >
                                      <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 hover:text-[#f26755]" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => removeItem(item.id)}
                                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 border-red-200 hover:border-red-400 hover:bg-red-50 rounded-lg group-hover:opacity-100 opacity-60 transition-all"
                                    >
                                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                                    </Button>
                                  </div>

                                  {availablePieces.length > 0 && (
                                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                      <label className="text-xs font-medium text-gray-700 mb-2 block">
                                        🎯 Pièces concernées (calcul automatique des quantités)
                                      </label>
                                      <div className="flex flex-wrap gap-2">
                                        {availablePieces.map((piece) => {
                                          const surfaceData = devis.surfaceData?.find(s => s.piece === piece);
                                          return (
                                            <label key={piece} className="flex items-center gap-2 text-xs bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer">
                                              <Checkbox
                                                checked={item.pieces.includes(piece)}
                                                onCheckedChange={(checked) => {
                                                  const newPieces = checked
                                                    ? [...item.pieces, piece]
                                                    : item.pieces.filter(p => p !== piece);
                                                  updateItemPieces(item.id, newPieces);
                                                }}
                                                className="h-3 w-3 sm:h-4 sm:w-4 data-[state=checked]:bg-[#f26755] data-[state=checked]:border-[#f26755]"
                                              />
                                              <span className="font-medium text-gray-700">{piece}</span>
                                              {surfaceData && (
                                                <span className="text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded text-xs">
                                                  {surfaceData.surfaceAuSol.toFixed(1)}m²
                                                </span>
                                              )}
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Bouton pour ajouter une prestation personnalisée */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl border-2 border-dashed border-[#f26755]/30 hover:border-[#f26755]/50 transition-all duration-200">
                  <button
                    onClick={() => setShowCreateCustomModal(true)}
                    className="w-full p-6 sm:p-8 flex flex-col items-center justify-center gap-3 hover:bg-[#f26755]/5 transition-colors rounded-xl group"
                  >
                    <div className="p-3 bg-[#f26755]/10 rounded-full group-hover:bg-[#f26755]/20 transition-colors">
                      <PlusCircle className="h-6 w-6 text-[#f26755]" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 mb-1">Ajouter une prestation personnalisée</h3>
                      <p className="text-sm text-gray-600">Créer votre propre prestation, lot ou texte informatif</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar droite avec récapitulatif détaillé - responsive */}
        <div className="hidden xl:block w-80 bg-white/90 backdrop-blur-sm border-l border-gray-200/50 shadow-lg">
          <div className="p-6 border-b border-gray-200/50">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Plan</h3>
            <p className="text-sm text-gray-600">{selectedItems.length} ligne{selectedItems.length > 1 ? 's' : ''} sélectionnée{selectedItems.length > 1 ? 's' : ''}</p>
            {offeredItemsCount > 0 && (
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <Gift className="h-4 w-4" />
                {offeredItemsCount} offerte{offeredItemsCount > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="p-6 space-y-4">
            {/* En-tête du tableau comme dans l'image */}
            <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-600 border-b border-gray-200 pb-2">
              <span>Lots</span>
              <span className="text-center">Pièces</span>
              <span className="text-right">Prix</span>
            </div>

            {/* Liste des lots avec numérotation et pièces sélectionnées */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lotTotals.map((lot) => (
                <div key={lot.name} className="grid grid-cols-3 gap-2 text-sm py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-[#f26755] font-semibold">{lot.index}.0</span>
                    <span className="text-gray-800 text-xs truncate" title={lot.name}>
                      {lot.name.length > 15 ? `${lot.name.substring(0, 15)}...` : lot.name}
                    </span>
                  </div>
                  <div className="text-center text-xs text-gray-600">
                    {lot.pieces.length > 0 ? (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {lot.pieces.slice(0, 2).map((piece, index) => (
                          <span key={piece} className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-xs">
                            {piece.length > 8 ? `${piece.substring(0, 8)}...` : piece}
                          </span>
                        ))}
                        {lot.pieces.length > 2 && (
                          <span className="text-gray-500 text-xs">+{lot.pieces.length - 2}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Aucune</span>
                    )}
                  </div>
                  <div className="text-right font-semibold text-gray-900">
                    {lot.total.toFixed(2)} €
                  </div>
                </div>
              ))}
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-900">Total HT</span>
                  <span className="font-bold text-gray-900">{totalHT.toFixed(2)} €</span>
                </div>

                {/* Section fournitures avec checkbox */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox
                      checked={showFurniturePrice}
                      onCheckedChange={(checked) => setShowFurniturePrice(checked === true)}
                      className="h-4 w-4 data-[state=checked]:bg-[#f26755] data-[state=checked]:border-[#f26755]"
                    />
                    <span className="text-sm font-medium text-gray-700">Afficher le prix des fournitures au client</span>
                  </div>

                  {showFurniturePrice && (
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600">
                        Dont fournitures: {furnitureFinalHT.toFixed(2)} €
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Remise:</span>
                        <Input
                          type="number"
                          value={furnitureDiscount}
                          onChange={(e) => setFurnitureDiscount(parseFloat(e.target.value) || 0)}
                          className="h-6 w-16 text-xs text-center"
                          min="0"
                          max="100"
                          step="1"
                        />
                        <span className="text-xs text-gray-600">%</span>
                      </div>
                      {furnitureDiscount > 0 && (
                        <div className="text-xs text-green-600">
                          Économie: -{furnitureDiscountAmount.toFixed(2)} €
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total TVA</span>
                  <span className="font-semibold text-gray-900">{totalTVA.toFixed(2)} €</span>
                </div>

                <div className="flex justify-between items-center text-lg font-bold text-[#f26755] bg-[#f26755]/5 rounded-lg p-3 border border-[#f26755]/20">
                  <span>Total TTC</span>
                  <span>{totalTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowPriceAdjustment(true)}
              className="w-full bg-[#f26755] hover:bg-[#e55a4a] text-white rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Settings className="h-5 w-5 mr-2" />
              Modifier les prix
            </Button>
          </div>
        </div>
      </div>

      {/* Footer fixe avec récapitulatif moderne - responsive (masqué sur XL+) */}
      <div className="xl:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200/50 p-3 sm:p-6 shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Total HT</div>
            <div className="text-sm sm:text-xl font-bold text-gray-900">{totalHT.toFixed(2)} €</div>
          </div>
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">TVA ({averageTvaRate.toFixed(1)}%)</div>
            <div className="text-sm sm:text-xl font-bold text-gray-900">{totalTVA.toFixed(2)} €</div>
          </div>
          <div className="bg-gradient-to-r from-[#f26755]/10 to-[#f26755]/5 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center border border-[#f26755]/20">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Total TTC</div>
            <div className="text-lg sm:text-2xl font-bold text-[#f26755]">{totalTTC.toFixed(2)} €</div>
          </div>
          <div className="flex items-center justify-center">
            <Button
              onClick={() => setShowPriceAdjustment(true)}
              className="w-full bg-[#f26755] hover:bg-[#e55a4a] text-white rounded-lg sm:rounded-xl h-10 sm:h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
            >
              <Settings className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Modifier prix
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {editingItemModal && (
        <EditItemModal
          open={!!editingItemModal}
          onOpenChange={(open) => !open && setEditingItemModal(null)}
          item={editingItemModal}
        />
      )}

      <PriceAdjustmentModal
        open={showPriceAdjustment}
        onOpenChange={setShowPriceAdjustment}
        items={selectedItems}
      />

      <CreateCustomItemModal
        open={showCreateCustomModal}
        onOpenChange={setShowCreateCustomModal}
        defaultTva={defaultTva}
      />
    </div>
  );

  function toggleLot(lotName: string) {
    setExpandedLots(prev =>
      prev.includes(lotName)
        ? prev.filter(name => name !== lotName)
        : [...prev, lotName]
    );
  }

  function toggleSubcategory(key: string) {
    setExpandedSubcategories(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  }
};