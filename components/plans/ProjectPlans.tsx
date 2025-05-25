'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Upload, Info, Mail, Plus } from 'lucide-react';
import Image from 'next/image';

interface Plan {
  id: string;
  title: string;
  type: 'existant' | 'execution';
  date: string;
  author: string;
  image: string;
  status: 'validé' | 'en_attente';
}

export default function ProjectPlans() {
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 2;
  
  const [plans] = useState<Plan[]>([
    {
      id: '1',
      title: 'Plan SDB',
      type: 'existant',
      date: '28/02/2025',
      author: 'Sam',
      status: 'validé',
      image: 'https://images.pexels.com/photos/271667/pexels-photo-271667.jpeg'
    },
    {
      id: '2',
      title: 'Plan d\'exécution SDB',
      type: 'execution',
      date: '28/02/2025',
      author: 'Sam',
      status: 'validé',
      image: 'https://images.pexels.com/photos/271795/pexels-photo-271795.jpeg'
    }
  ]);

  const [planForm, setPlanForm] = useState({
    title: '',
    type: '',
    image: '',
    notifications: {
      client: { email: 'client@test.fr', selected: false },
      artisan: { email: 'artisan@test.fr', selected: false },
      pilote: { email: 'pilote@test.fr', selected: false },
      vendeur: { email: 'vendeur@test.fr', selected: false }
    }
  });

  const totalPages = Math.ceil(plans.length / plansPerPage);
  const currentPlans = plans.slice(
    (currentPage - 1) * plansPerPage,
    currentPage * plansPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Plans du projet</h2>
        <button
          onClick={() => setIsAddPlanOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-[#f21515] text-white rounded-md text-sm font-medium hover:bg-[#f21515]/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un plan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {currentPlans.map((plan) => (
          <Card key={plan.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{plan.title}</h3>
                <p className="text-sm text-gray-500">
                  déposé par {plan.author} le {plan.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {plan.status === 'validé' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Plan validé pour exécution
                  </span>
                )}
                <button className="text-gray-400 hover:text-gray-600">•••</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src={plan.image}
                  alt={plan.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40"></div>
                  <span className="relative text-white font-medium">Plan {plan.type}</span>
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src={plan.image}
                  alt={plan.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${currentPage === i + 1 
                  ? 'bg-[#f21515] text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <Sheet open={isAddPlanOpen} onOpenChange={setIsAddPlanOpen}>
        <SheetContent className="w-[500px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Ajouter un plan</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du plan
              </label>
              <input
                type="text"
                value={planForm.title}
                onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#f21515] focus:border-[#f21515]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de plan
              </label>
              <select
                value={planForm.type}
                onChange={(e) => setPlanForm({ ...planForm, type: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#f21515] focus:border-[#f21515]"
              >
                <option value="">Sélectionner...</option>
                <option value="existant">Plan existant</option>
                <option value="execution">Plan d'exécution</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image du plan
              </label>
              <button
                type="button"
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f21515]"
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Cliquez pour télécharger
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  PNG, JPG jusqu'à 10MB
                </span>
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Envoyer ce plan par mail
                </span>
              </div>
              
              <div className="space-y-3">
                {Object.entries(planForm.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={value.selected}
                      onChange={(e) => setPlanForm({
                        ...planForm,
                        notifications: {
                          ...planForm.notifications,
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
                Enregistrer
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}