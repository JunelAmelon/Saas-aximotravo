'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DevisItem, TVA_OPTIONS, UNIT_OPTIONS } from '@/types/devis';
import { X, Plus, FileText, Package, Type, Percent } from 'lucide-react';

interface CreateCustomItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateItem: (item: DevisItem) => void;
  defaultTva: number;
}

type ItemType = 'prestation' | 'lot' | 'texte';

export function CreateCustomItemModal({ 
  open, 
  onOpenChange, 
  onCreateItem, 
  defaultTva 
}: CreateCustomItemModalProps) {
  const [itemType, setItemType] = useState<ItemType>('prestation');
  const [formData, setFormData] = useState({
    lotName: '',
    subcategoryName: '',
    itemName: '',
    optionLabel: '',
    prix_ht: 0,
    unite: 'unité',
    description: '',
    quantite: 1,
    tva: defaultTva,
    customUnit: '',
    isTextOnly: false
  });
  const [customTva, setCustomTva] = useState('');
  const [customUnit, setCustomUnit] = useState('');

  const resetForm = () => {
    setFormData({
      lotName: '',
      subcategoryName: '',
      itemName: '',
      optionLabel: '',
      prix_ht: 0,
      unite: 'unité',
      description: '',
      quantite: 1,
      tva: defaultTva,
      customUnit: '',
      isTextOnly: false
    });
    setCustomTva('');
    setCustomUnit('');
    setItemType('prestation');
  };

  const handleCreate = () => {
    if (!formData.optionLabel.trim()) return;

    const newItem: DevisItem = {
      id: crypto.randomUUID(),
      lotName: formData.lotName || 'Prestations personnalisées',
      subcategoryName: formData.subcategoryName || 'Divers',
      itemName: formData.itemName || 'Prestation personnalisée',
      optionLabel: formData.optionLabel,
      prix_ht: itemType === 'texte' ? 0 : formData.prix_ht,
      unite: formData.customUnit || formData.unite,
      description: formData.description,
      quantite: itemType === 'texte' ? 1 : formData.quantite,
      pieces: [],
      tva: formData.tva,
      customUnit: formData.customUnit,
      isOffered: itemType === 'texte'
    };

    onCreateItem(newItem);
    resetForm();
    onOpenChange(false);
  };

  const handleTvaChange = (value: string) => {
    if (value === 'custom') {
      setFormData(prev => ({ ...prev, tva: undefined as any }));
    } else {
      const tvaValue = parseFloat(value);
      setFormData(prev => ({ ...prev, tva: tvaValue }));
    }
  };

  const handleCustomTvaChange = (value: string) => {
    setCustomTva(value);
    const tvaValue = parseFloat(value);
    if (!isNaN(tvaValue)) {
      setFormData(prev => ({ ...prev, tva: tvaValue }));
    }
  };

  const handleUnitChange = (value: string) => {
    if (value === 'custom') {
      setFormData(prev => ({ ...prev, unite: 'custom', customUnit: '' }));
    } else {
      setFormData(prev => ({ ...prev, unite: value, customUnit: '' }));
    }
  };

  const handleCustomUnitChange = (value: string) => {
    setCustomUnit(value);
    setFormData(prev => ({ ...prev, customUnit: value }));
  };

  const isCustomTva = formData.tva !== undefined && !TVA_OPTIONS.some(opt => opt.value === formData.tva);
  const isCustomUnit = formData.unite === 'custom' || !UNIT_OPTIONS.some(option => option.value === formData.unite);

  const getItemTypeConfig = (type: ItemType) => {
    switch (type) {
      case 'prestation':
        return {
          icon: Package,
          title: 'Prestation personnalisée',
          description: 'Ajouter une prestation avec prix et quantité',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'lot':
        return {
          icon: FileText,
          title: 'Nouveau lot',
          description: 'Créer un nouveau lot de prestations',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'texte':
        return {
          icon: Type,
          title: 'Texte informatif',
          description: 'Ajouter un texte sans prix (note, commentaire)',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl mx-auto max-h-[90vh] overflow-y-auto border-0 bg-white shadow-2xl p-0 rounded-2xl">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#f26755] to-[#e55a4a] px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle>
                    <h2 className="text-lg font-semibold">Créer une prestation personnalisée</h2>
                  </DialogTitle>
                  <p className="text-sm text-white/90">Ajouter un élément personnalisé au devis</p>
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
            {/* Sélection du type d'élément */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Type d'élément à créer</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['prestation', 'lot', 'texte'] as ItemType[]).map((type) => {
                  const config = getItemTypeConfig(type);
                  const IconComponent = config.icon;
                  
                  return (
                    <button
                      key={type}
                      onClick={() => setItemType(type)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        itemType === type
                          ? `${config.borderColor} ${config.bgColor}`
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className={`h-5 w-5 ${itemType === type ? config.color : 'text-gray-400'}`} />
                        <span className={`font-medium ${itemType === type ? config.color : 'text-gray-700'}`}>
                          {config.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{config.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Formulaire dynamique selon le type */}
            <div className="space-y-4">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    {itemType === 'lot' ? 'Nom du lot' : 'Désignation'}
                  </Label>
                  <Input
                    value={formData.optionLabel}
                    onChange={(e) => setFormData(prev => ({ ...prev, optionLabel: e.target.value }))}
                    placeholder={
                      itemType === 'prestation' ? 'Ex: Installation électrique' :
                      itemType === 'lot' ? 'Ex: Électricité générale' :
                      'Ex: Note importante'
                    }
                    className="border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20"
                  />
                </div>

                {itemType !== 'texte' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Lot parent</Label>
                    <Input
                      value={formData.lotName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lotName: e.target.value }))}
                      placeholder="Ex: Électricité"
                      className="border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={
                    itemType === 'prestation' ? 'Description détaillée de la prestation...' :
                    itemType === 'lot' ? 'Description du lot de prestations...' :
                    'Texte informatif, note ou commentaire...'
                  }
                  className="min-h-[80px] border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20"
                />
              </div>

              {/* Prix et quantité (sauf pour texte) */}
              {itemType !== 'texte' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Prix unitaire HT (€)</Label>
                    <Input
                      type="number"
                      value={formData.prix_ht}
                      onChange={(e) => setFormData(prev => ({ ...prev, prix_ht: parseFloat(e.target.value) || 0 }))}
                      className="border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Quantité</Label>
                    <Input
                      type="number"
                      value={formData.quantite}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantite: parseFloat(e.target.value) || 0 }))}
                      className="border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Unité</Label>
                    <Select 
                      value={isCustomUnit ? 'custom' : formData.unite} 
                      onValueChange={handleUnitChange}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20">
                        <SelectValue placeholder="Choisir l'unité" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIT_OPTIONS.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Personnalisé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Unité personnalisée */}
              {itemType !== 'texte' && isCustomUnit && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Unité personnalisée</Label>
                  <Input
                    value={customUnit || formData.customUnit}
                    onChange={(e) => handleCustomUnitChange(e.target.value)}
                    placeholder="Ex: palette, rouleau, intervention..."
                    className="border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20"
                  />
                </div>
              )}

              {/* TVA (sauf pour texte) */}
              {itemType !== 'texte' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Taux de TVA
                    </Label>
                    <Select 
                      value={formData.tva !== undefined ? formData.tva.toString() : 'custom'} 
                      onValueChange={handleTvaChange}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20">
                        <SelectValue placeholder="Choisir le taux de TVA" />
                      </SelectTrigger>
                      <SelectContent>
                        {TVA_OPTIONS.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value.toString()}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* TVA personnalisée */}
                  {isCustomTva && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Taux TVA personnalisé (%)</Label>
                      <Input
                        type="number"
                        value={customTva}
                        onChange={(e) => handleCustomTvaChange(e.target.value)}
                        placeholder="Ex: 15.5"
                        min="0"
                        max="100"
                        step="0.1"
                        className="border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Informations avancées (optionnelles) */}
              <details className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <summary className="cursor-pointer font-medium text-gray-700 mb-3">
                  Informations avancées (optionnel)
                </summary>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Sous-catégorie</Label>
                    <Input
                      value={formData.subcategoryName}
                      onChange={(e) => setFormData(prev => ({ ...prev, subcategoryName: e.target.value }))}
                      placeholder="Ex: Installation, Fourniture"
                      className="border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Nom de l'item</Label>
                    <Input
                      value={formData.itemName}
                      onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                      placeholder="Ex: Tableau électrique"
                      className="border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20"
                    />
                  </div>
                </div>
              </details>

              {/* Aperçu du résultat */}
              {itemType !== 'texte' && formData.optionLabel && (
                <div className="bg-gradient-to-r from-[#f26755]/5 to-[#f26755]/10 rounded-lg p-4 border border-[#f26755]/20">
                  <h4 className="font-medium text-gray-700 mb-3">Aperçu</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Quantité :</span>
                      <div className="font-medium">{formData.quantite} {formData.customUnit || formData.unite}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Prix unitaire :</span>
                      <div className="font-medium">{formData.prix_ht.toFixed(2)} € HT</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total HT :</span>
                      <div className="font-medium">{(formData.quantite * formData.prix_ht).toFixed(2)} €</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total TTC :</span>
                      <div className="font-bold text-[#f26755]">
                        {((formData.quantite * formData.prix_ht) * (1 + (formData.tva || 0) / 100)).toFixed(2)} €
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {itemType === 'prestation' && 'Prestation personnalisée'}
                {itemType === 'lot' && 'Nouveau lot de prestations'}
                {itemType === 'texte' && 'Texte informatif (sans prix)'}
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
                  onClick={handleCreate}
                  disabled={!formData.optionLabel.trim()}
                  className="bg-[#f26755] hover:bg-[#e55a4a] text-white disabled:bg-gray-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter au devis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}