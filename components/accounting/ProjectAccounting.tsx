'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Euro, Plus, Upload, X, Image as ImageIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Payment {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  status: "en_attente" | "validé" | "refusé";
  images?: string[];
}

export default function ProjectAccounting() {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [payments] = useState<Payment[]>([
    {
      id: "1",
      title: "Premier acompte",
      description: "Début des travaux de la salle de bain",
      amount: 2500,
      date: "2025-02-10",
      status: "validé",
      images: [
        "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg",
        "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg",
        "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
        "https://images.pexels.com/photos/271667/pexels-photo-271667.jpeg"
      ]
    },
    {
      id: "2",
      title: "Deuxième acompte",
      description: "Avancement des travaux - 50% réalisé",
      amount: 3000,
      date: "2025-02-20",
      status: "en_attente",
      images: [
        "https://images.pexels.com/photos/271795/pexels-photo-271795.jpeg",
        "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg"
      ]
    }
  ]);

  const [paymentForm, setPaymentForm] = useState({
    title: "",
    description: "",
    amount: "",
    images: [] as File[],
    notifications: {
      client: { email: "client@test.fr", selected: false },
      pilote: { email: "pilote@test.fr", selected: false },
      vendeur: { email: "vendeur@test.fr", selected: false }
    }
  });

  const getStatusStyle = (status: Payment["status"]) => {
    switch (status) {
      case "validé":
        return "bg-green-50 text-green-700 border-green-200";
      case "refusé":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPaymentForm(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setPaymentForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Mes acomptes</h2>
        <button
          onClick={() => setIsAddPaymentOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-[#f21515] text-white rounded-md text-sm font-medium hover:bg-[#f21515]/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Demander un acompte
        </button>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-gray-900">{payment.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {format(new Date(payment.date), "d MMMM yyyy", { locale: fr })}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">{payment.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-gray-900">
                    {payment.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
              </div>

              {payment.images && payment.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {payment.images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                    >
                      <img src={image} alt={`Image ${index + 1}`} className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm">Agrandir</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <SheetContent side="right" className="w-[500px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Demander un acompte</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={paymentForm.title}
                  onChange={(e) => setPaymentForm({ ...paymentForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#f21515] focus:border-[#f21515]"
                  placeholder="Ex: Premier acompte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#f21515] focus:border-[#f21515]"
                  placeholder="Décrivez l'avancement du projet..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:ring-[#f21515] focus:border-[#f21515]"
                    placeholder="0.00"
                  />
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos d'avancement
                </label>
                <div className="space-y-4">
                  <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f21515] cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Cliquez pour télécharger
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      PNG, JPG jusqu'à 10MB
                    </span>
                  </label>

                  {paymentForm.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {paymentForm.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg border border-gray-200 overflow-hidden">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notifier par email
                </label>
                <div className="space-y-3">
                  {Object.entries(paymentForm.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value.selected}
                        onChange={(e) => setPaymentForm({
                          ...paymentForm,
                          notifications: {
                            ...paymentForm.notifications,
                            [key]: { ...value, selected: e.target.checked }
                          }
                        })}
                        className="rounded border-gray-300 text-[#f21515] focus:ring-[#f21515]"
                      />
                      <div className="flex-1">
                        <span className="text-sm text-gray-700 capitalize">
                          {key}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          - {value.email}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f21515] text-white rounded-md text-sm font-medium hover:bg-[#f21515]/90 transition-colors"
                >
                  Lancer la demande
                </button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedImage && (
            <div className="relative aspect-video">
              <img
                src={selectedImage}
                alt="Image agrandie"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}