'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DevisItem, TVA_OPTIONS, UNIT_OPTIONS } from '@/types/devis';
import { X, Upload, Gift, Image as ImageIcon, Percent } from 'lucide-react';
import { Loader } from './ui/Loader';
import { useDevisConfig } from '@/components/DevisConfigContext';

interface EditItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: DevisItem;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  open,
  onOpenChange,
  item,
  
}) => {
  const { devisConfig, setDevisConfigField } = useDevisConfig();
  const [editedItem, setEditedItem] = useState<DevisItem>({ ...item });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(item.customImage || '');
  const [customTva, setCustomTva] = useState<string>('');
  const [customUnit, setCustomUnit] = useState<string>('');

  // Fonction utilitaire d'upload Cloudinary
  async function uploadToCloudinary(file: File): Promise<string | null> {
    const CLOUDINARY_UPLOAD_URL = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL || '';
    const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: data });
    const result = await res.json();
    return result.secure_url || null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Ne pas uploader ici !
    }
  };

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    let imageUrl = editedItem.customImage || '';
    if (imageFile) {
      // Uploader sur Cloudinary ici
      const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;
      const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
      const data = new FormData();
      data.append('file', imageFile);
      data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: data });
      const result = await res.json();
      if (result.secure_url) imageUrl = result.secure_url;
    }
 
    const updatedItem = {
      ...editedItem,
      customImage: imageUrl,
      originalPrix: editedItem.originalPrix || item.prix_ht
    };
    const updatedItems = (devisConfig?.selectedItems || []).map(i => i.id === updatedItem.id ? updatedItem : i);
    setDevisConfigField('selectedItems', updatedItems);
    setLoading(false);
    onOpenChange(false);
  };

  const toggleOffered = () => {
    setEditedItem(prev => ({
      ...prev,
      isOffered: !prev.isOffered,
      originalPrix: prev.originalPrix || prev.prix_ht
    }));
  };

  const handleTvaChange = (value: string) => {
    if (value === 'custom') {
      setEditedItem(prev => ({ ...prev, tva: undefined }));
    } else {
      const tvaValue = parseFloat(value);
      setEditedItem(prev => ({ ...prev, tva: tvaValue }));
    }
  };

  const handleCustomTvaChange = (value: string) => {
    setCustomTva(value);
    const tvaValue = parseFloat(value);
    if (!isNaN(tvaValue)) {
      setEditedItem(prev => ({ ...prev, tva: tvaValue }));
    }
  };

  const handleUnitChange = (value: string) => {
    if (value === 'custom') {
      setEditedItem(prev => ({ ...prev, customUnit: '' }));
    } else {
      setEditedItem(prev => ({ ...prev, customUnit: value }));
    }
  };

  const handleCustomUnitChange = (value: string) => {
    setCustomUnit(value);
    setEditedItem(prev => ({ ...prev, customUnit: value }));
  };

  // Calculer le total TTC pour cette prestation
  const calculateItemTTC = () => {
    const totalHT = editedItem.quantite * editedItem.prix_ht;
    const tvaRate = editedItem.tva !== undefined ? editedItem.tva : 20; // TVA par défaut
    const tvaAmount = totalHT * (tvaRate / 100);
    return { totalHT, tvaAmount, totalTTC: totalHT + tvaAmount, tvaRate };
  };

  const { totalHT, tvaAmount, totalTTC, tvaRate } = calculateItemTTC();

  const currentUnit = editedItem.customUnit || editedItem.unite;
  const isCustomUnit = !UNIT_OPTIONS.some(option => option.value === currentUnit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto border-0 bg-white shadow-2xl p-0 rounded-2xl">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#f26755] to-[#e55a4a] px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle>
                    <span className="text-lg font-semibold">Modifier la prestation</span>
                  </DialogTitle>
                  <p className="text-sm text-white/90">Personnaliser les détails</p>
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
            {/* Image d'illustration */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Image d&apos;illustration</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-[#f26755]/50 transition-colors">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setImagePreview('');
                        setEditedItem(prev => ({ ...prev, customImage: undefined }));
                      }}
                      className="absolute top-2 right-2 h-6 w-6 p-0 bg-black/50 text-white hover:bg-black/70"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Ajouter une image pour illustrer cette prestation</p>
                    <input
                     aria-label="file"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label
                      htmlFor="image-upload"
                      className="inline-flex items-center px-4 py-2 bg-[#f26755] text-white rounded-lg cursor-pointer hover:bg-[#e55a4a] transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir une image
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Description</Label>
              <Textarea
                value={editedItem.description}
                onChange={(e) => setEditedItem(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px] border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20"
                placeholder="Description détaillée de la prestation..."
              />
            </div>

            {/* Quantité et Unité */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Quantité</Label>
                <Input
                  type="number"
                  value={editedItem.quantite}
                  onChange={(e) => setEditedItem(prev => ({ ...prev, quantite: parseFloat(e.target.value) || 0 }))}
                  className="border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Unité</Label>
                <Select
                  value={isCustomUnit ? 'custom' : currentUnit}
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

            {/* Unité personnalisée */}
            {isCustomUnit && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Unité personnalisée</Label>
                <Input
                  value={customUnit || currentUnit}
                  onChange={(e) => handleCustomUnitChange(e.target.value)}
                  placeholder="Ex: palette, rouleau..."
                  className="border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20"
                />
              </div>
            )}

            {/* Prix unitaire et TVA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Prix unitaire HT (€)</Label>
                <Input
                  type="number"
                  value={editedItem.prix_ht}
                  onChange={(e) => setEditedItem(prev => ({ ...prev, prix_ht: parseFloat(e.target.value) || 0 }))}
                  className="border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20"
                  min="0"
                  step="0.01"
                  disabled={editedItem.isOffered}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Taux de TVA
                </Label>
                <Select
                  value={editedItem.tva !== undefined ? editedItem.tva.toString() : 'custom'}
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
            </div>

            {/* TVA personnalisée */}
            {(editedItem.tva === undefined || !TVA_OPTIONS.some(opt => opt.value === editedItem.tva)) && (
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

            {/* Option Offert */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Offrir cette prestation</p>
                  <p className="text-sm text-green-600">Le prix sera barré et marqué comme cadeau</p>
                </div>
              </div>
              <Button
                variant={editedItem.isOffered ? "default" : "outline"}
                size="sm"
                onClick={toggleOffered}
                className={editedItem.isOffered ? "bg-green-600 hover:bg-green-700" : "border-green-300 text-green-700 hover:bg-green-50"}
              >
                {editedItem.isOffered ? "Offert" : "Offrir"}
              </Button>
            </div>

            {/* Récapitulatif des calculs */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-gray-700">Récapitulatif des calculs</h4>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total HT :</span>
                  <span className="font-medium">{totalHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA ({tvaRate}%) :</span>
                  <span className="font-medium">{tvaAmount.toFixed(2)} €</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total TTC :</span>
                  <span className={`text-lg font-bold ${editedItem.isOffered ? 'text-green-600' : 'text-[#f26755]'}`}>
                    {editedItem.isOffered ? (
                      <span className="flex items-center gap-2">
                        <span className="line-through text-gray-400">
                          {totalTTC.toFixed(2)} €
                        </span>
                        <Gift className="h-4 w-4" />
                        OFFERT
                      </span>
                    ) : (
                      `${totalTTC.toFixed(2)} €`
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-4">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                className="bg-[#f26755] hover:bg-[#e55a4a] text-white"
                disabled={loading}
              >
                {loading ? <Loader size={20} /> : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}