'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProjectPlans } from '@/hooks/useProjectPlans';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Upload, Info, Mail, Plus } from 'lucide-react';
import Image from 'next/image';

interface Plan {
  id: string;
  title: string;
  date: string;
  author: string;
  image: string;
  status: 'validé' | 'en_attente';
}

export default function ProjectPlans() {
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 2;

  // Récupération du projectId depuis l'URL
  const params = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id as string;
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const { fetchProjectPlans } = await import('@/hooks/useProjectPlans');
        const freshPlans = await fetchProjectPlans(projectId);
        setPlans(freshPlans);
      } catch (e) {
        setError('Erreur lors du chargement des plans');
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, isAddPlanOpen]);

  const [planForm, setPlanForm] = useState({
    title: '',
    files: [null, null] as (File | null)[], // [plan existant, plan exécution]
    notifications: {
      client: { email: 'client@test.fr', selected: false },
      artisan: { email: 'artisan@test.fr', selected: false },
      pilote: { email: 'pilote@test.fr', selected: false },
      vendeur: { email: 'vendeur@test.fr', selected: false }
    }
  });
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);


  const totalPages = Math.ceil(plans.length / plansPerPage);
  const currentPlans = plans.slice(
    (currentPage - 1) * plansPerPage,
    currentPage * plansPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#f26755] to-[#f26755] text-white rounded-lg font-semibold shadow hover:opacity-90 transition"
          onClick={() => window.history.back()}
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Retour
        </button>
        <h2 className="text-lg font-medium text-gray-900">Plans du projet</h2>
        <button
          onClick={() => setIsAddPlanOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors"
          aria-label="Ajouter un nouveau plan"
          title="Ajouter un plan"
        >
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
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
                <button
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Options du plan"
                  title="Options"
                >•••</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src={plan.images[0]}
                  alt={plan.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40"></div>
                  <span className="relative text-white font-medium">Plan existant</span>
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src={plan.images[1]}
                  alt={plan.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40"></div>
                  <span className="relative text-white font-medium">Plan d&apos;exécution</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${currentPage === i + 1
                  ? 'bg-[#f26755] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
              aria-label={`Page ${i + 1}`}
              title={`Aller à la page ${i + 1}`}
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

          <form className="mt-6 space-y-6" onSubmit={async (e) => {
            e.preventDefault();
            setFormError(null);
            setUploading(true);
            try {
              if (!planForm.title || !planForm.files[0] || !planForm.files[1]) {
                setFormError('Tous les champs et les deux images sont obligatoires.');
                setUploading(false);
                return;
              }
              // Upload des deux images sur Cloudinary
              const uploadImage = async (file: File) => {
                const data = new FormData();
                data.append('file', file);
                data.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string);
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
                const res = await fetch(uploadUrl, { method: 'POST', body: data });
                const result = await res.json();
                if (!result.secure_url) throw new Error('Erreur upload Cloudinary');
                return result.secure_url as string;
              };
              const [urlExistant, urlExecution] = await Promise.all([
                uploadImage(planForm.files[0]),
                uploadImage(planForm.files[1])
              ]);
              // Ajout du plan en base
              const { addPlan } = await import('@/hooks/useProjectPlans');
              await addPlan({
                projectId,
                title: planForm.title,
                author: "Sam",
                date: new Date().toLocaleDateString(),
                status: "en attente",
                images: [urlExistant, urlExecution],
              });
              setIsAddPlanOpen(false);
              setPlanForm({
                title: '',
                files: [null, null],
                notifications: {
                  client: { email: 'client@test.fr', selected: false },
                  artisan: { email: 'artisan@test.fr', selected: false },
                  pilote: { email: 'pilote@test.fr', selected: false },
                  vendeur: { email: 'vendeur@test.fr', selected: false }
                }
              });
            } catch (err: any) {
              setFormError('Erreur lors de l\'ajout du plan.');
            } finally {
              setUploading(false);
            }
          }}>
            {formError && <div className="text-red-600 text-sm">{formError}</div>}
            <div>
              <label htmlFor="plan-title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre du plan
              </label>
              <input
                id="plan-title"
                type="text"
                value={planForm.title}
                onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#f26755] focus:border-[#f26755]"
                placeholder="Entrez le titre du plan"
                aria-label="Titre du plan"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Plan existant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image du plan existant</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setPlanForm(f => ({ ...f, files: [file, f.files[1]] }));
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {planForm.files[0] && (
                  <div className="mt-2 text-xs text-gray-600">{planForm.files[0].name}</div>
                )}
              </div>
              {/* Plan d'exécution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image du plan d&apos;exécution</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setPlanForm(f => ({ ...f, files: [f.files[0], file] }));
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {planForm.files[1] && (
                  <div className="mt-2 text-xs text-gray-600">{planForm.files[1].name}</div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700">
                  Envoyer ce plan par mail
                </span>
              </div>

              {/* <div className="space-y-3">
                {Object.entries(planForm.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      id={`notify-${key}`}
                      type="checkbox"
                      checked={value.selected}
                      onChange={(e) => setPlanForm({
                        ...planForm,
                        notifications: {
                          ...planForm.notifications,
                          [key]: { ...value, selected: e.target.checked }
                        }
                      })}
                      className="rounded border-gray-300 text-[#f26755] focus:ring-[#f26755]"
                      title={`Notifier ${key}`}
                      aria-label={`Notifier ${key} par email`}
                    />
                    <label htmlFor={`notify-${key}`} className="flex-1">
                      <span className="text-sm text-gray-700 capitalize">
                        {key}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        - {value.email}
                      </span>
                    </label>
                  </div>
                ))}
              </div> */}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors"
                aria-label="Enregistrer le plan"
                title="Enregistrer le plan"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}