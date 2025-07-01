'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TVA_OPTIONS, PIECES_DISPONIBLES } from '@/types/devis';
import { X, FileText, Percent } from 'lucide-react';
import { Loader } from './ui/Loader';
import { useAuth } from "@/lib/contexts/AuthContext";
import { useParams } from 'next/navigation';

interface CreateDevisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDevis: (titre: string, tva: number, devisConfigId: string) => void;
}

export function CreateDevisModal({ open, onOpenChange, onCreateDevis }: CreateDevisModalProps) {
  const { currentUser } = useAuth();
  const [titre, setTitre] = useState('');
  const [tva, setTva] = useState<number | 'custom'>(20);
  const [customTva, setCustomTva] = useState('');
  const [devisConfigId, setDevisConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const params = useParams() || {};
  const projectId =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : undefined;

  const generateDevisNumber = useCallback(() => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DEV-${year}-${random}`;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;

    const finalTva = tva === 'custom' ? parseFloat(customTva) || 0 : tva;

    // Création immédiate du devis dans devisConfig
    try {
      setLoading(true);
      const devisConfigData = {
        projectId,
        userId: currentUser?.uid,
        titre,
        numero: generateDevisNumber(),
        tva: finalTva,
        status: 'En Cours',
        pieces: PIECES_DISPONIBLES.map(nom => ({
          nom,
          selected: false,
          nombre: 1,
        })),
      };
      const { id } = await import('@/lib/firebase/firestore').then(mod => mod.addDocument('devisConfig', devisConfigData));
      // Ajoute l'id dans le document Firestore juste après création
      await import('@/lib/firebase/firestore').then(mod => mod.updateDocument('devisConfig', id, { id }));
      console.log('DevisConfig créé avec ID:', id);
      setDevisConfigId(id);
      onCreateDevis(titre, finalTva, id); // signature maintenue pour correspondre au parent
    } catch (err) {
      console.error('Erreur lors de la création du devis :', err);
    } finally {
      setLoading(false);
    }

    setTitre('');
    setTva(20);
    setCustomTva('');
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto border-0 bg-white shadow-2xl p-0 overflow-hidden rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Header avec couleur de marque */}
          <div className="bg-gradient-to-r from-[#f26755] to-[#e55a4a] px-4 sm:px-6 py-4 sm:py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-semibold">Nouveau devis</DialogTitle>
                  <p className="text-xs sm:text-sm text-white/90">Créer un devis professionnel</p>
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
          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="titre" className="text-sm font-medium text-gray-700">
                  Titre du devis
                </Label>
                <Input
                  id="titre"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Ex: Rénovation appartement 120m²"
                  required
                  className="h-10 sm:h-11 border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20 rounded-lg text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tva" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Taux de TVA
                </Label>
                <Select 
                  value={tva.toString()} 
                  onValueChange={(value) => setTva(value === 'custom' ? 'custom' : Number(value))}
                >
                  <SelectTrigger id="tva" className="h-10 sm:h-11 border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20 rounded-lg text-sm sm:text-base">
                    <SelectValue placeholder="Choisir le taux de TVA" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                    {TVA_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value.toString()}
                        className="rounded-md hover:bg-[#f26755]/10 focus:bg-[#f26755]/10 text-sm sm:text-base"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {tva === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="customTva" className="text-sm font-medium text-gray-700">
                    Taux personnalisé (%)
                  </Label>
                  <Input
                    id="customTva"
                    type="number"
                    value={customTva}
                    onChange={(e) => setCustomTva(e.target.value)}
                    placeholder="Ex: 15.5"
                    min="0"
                    max="100"
                    step="0.1"
                    className="h-10 sm:h-11 border-gray-200 focus:border-[#f26755] focus:ring-[#f26755]/20 rounded-lg text-sm sm:text-base"
                  />
                </div>
              )}

              <div className="pt-2 sm:pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-10 sm:h-11 bg-[#f26755] hover:bg-[#e55a4a] text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? <Loader size={22} /> : 'Créer le devis'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}