'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProjectPlans } from '@/hooks/useProjectPlans';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Upload, Info, Mail, Plus } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getUserById } from '@/lib/firebase/users';
import { fetchProjectEmails } from '@/lib/projectEmails';

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
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role?.toLowerCase() || null);
        }
      }
    };
    fetchRole();
  }, [currentUser]);

  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 2;

  // Récupération du projectId depuis l'URL
  const params = useParams() ?? {};
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id as string;
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
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-between w-full mb-2">
        <div className="flex items-center flex-shrink-0">
          <button
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#f26755] to-[#f26755] text-white rounded-lg font-semibold shadow hover:opacity-90 transition"
            onClick={() => window.history.back()}
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Retour
          </button>
        </div>
        <h2 className="text-lg font-medium text-gray-900 flex-1 text-center min-w-[160px] truncate order-2 sm:order-none">Plans du projet</h2>
        <div className="flex items-center flex-shrink-0">
          {userRole !== 'admin' && (
            <button
              onClick={() => setIsAddPlanOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un plan
            </button>
          )}
        </div>
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
              const author = await getUserById(currentUser?.uid as string);
              await addPlan({
                projectId,
                title: planForm.title,
                author: author?.displayName || "",
                date: new Date().toLocaleDateString(),
                status: "en attente",
                images: [urlExistant, urlExecution],
              });

              // --- Notification automatique ---
              try {
                const emails = await fetchProjectEmails(projectId);
                const recipients: string[] = [];
                if (emails.client) recipients.push(emails.client);
                if (emails.courtier) recipients.push(emails.courtier);
                if (emails.artisans && emails.artisans.length > 0) recipients.push(...emails.artisans);
                if (recipients.length > 0) {
                  await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      to: recipients,
                      subject: `Nouveau plan ajouté au projet`,
                      html: `<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <h2 style='color: #f26755; margin-bottom: 0.5em;'>Nouveau plan ajouté au projet</h2>
                        <div style='font-size: 1em; color: #333; margin-bottom: 1em;'>
                          Un nouveau plan intitulé <strong>"${planForm.title}"</strong> vient d'être ajouté.<br/>
                          <strong>Auteur :</strong> ${author?.displayName || ""}<br/>
                          <strong>Date :</strong> ${new Date().toLocaleString()}
                        </div>
                      </div>`
                    })
                  });
                }
              } catch (err) {
                // Optionnel : afficher une notification ou log
                console.error('Erreur notification email plan :', err);
              }

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
                <div
                  className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors cursor-pointer hover:border-[#f26755] bg-gray-50 relative ${planForm.files[0] ? 'border-[#f26755]' : 'border-gray-300'}`}
                  onClick={() => document.getElementById('plan-existant-input')?.click()}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0] || null;
                    if (file && file.type.startsWith('image/')) {
                      setPlanForm(f => ({ ...f, files: [file, f.files[1]] }));
                    }
                  }}
                  onDragOver={e => e.preventDefault()}
                  style={{ minHeight: 120 }}
                >
                  {!planForm.files[0] ? (
                    <>
                      <Upload className="h-8 w-8 text-[#f26755] mb-2" />
                      <span className="text-sm text-gray-500 text-center">Cliquez ou glissez une image ici<br />(plan existant)</span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center w-full">
                      <Image
                        src={URL.createObjectURL(planForm.files[0])}
                        alt="Aperçu plan existant"
                        width={100}
                        height={100}
                        className="rounded shadow max-h-32 object-contain mb-2"
                      />
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-gray-700 truncate">{planForm.files[0].name}</span>
                        <button
                          type="button"
                          className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                          onClick={e => {
                            e.stopPropagation();
                            setPlanForm(f => ({ ...f, files: [null, f.files[1]] }));
                          }}
                          title="Supprimer la sélection"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    id="plan-existant-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setPlanForm(f => ({ ...f, files: [file, f.files[1]] }));
                    }}
                    className="hidden"
                  />
                </div>
              </div>
              {/* Plan d'exécution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image du plan d&apos;exécution</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors cursor-pointer hover:border-[#f26755] bg-gray-50 relative ${planForm.files[1] ? 'border-[#f26755]' : 'border-gray-300'}`}
                  onClick={() => document.getElementById('plan-execution-input')?.click()}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0] || null;
                    if (file && file.type.startsWith('image/')) {
                      setPlanForm(f => ({ ...f, files: [f.files[0], file] }));
                    }
                  }}
                  onDragOver={e => e.preventDefault()}
                  style={{ minHeight: 120 }}
                >
                  {!planForm.files[1] ? (
                    <>
                      <Upload className="h-8 w-8 text-[#f26755] mb-2" />
                      <span className="text-sm text-gray-500 text-center">Cliquez ou glissez une image ici<br />(plan d&apos;exécution)</span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center w-full">
                      <Image
                        src={URL.createObjectURL(planForm.files[1])}
                        alt="Aperçu plan d'exécution"
                        width={100}
                        height={100}
                        className="rounded shadow max-h-32 object-contain mb-2"
                      />
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-gray-700 truncate">{planForm.files[1].name}</span>
                        <button
                          type="button"
                          className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                          onClick={e => {
                            e.stopPropagation();
                            setPlanForm(f => ({ ...f, files: [f.files[0], null] }));
                          }}
                          title="Supprimer la sélection"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    id="plan-execution-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setPlanForm(f => ({ ...f, files: [f.files[0], file] }));
                    }}
                    className="hidden"
                  />
                </div>
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
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${uploading ? 'bg-gray-200 text-gray-400 cursor-wait' : 'bg-[#f26755] text-white hover:bg-[#f26755]/90'}`}
                aria-label="Enregistrer le plan"
                title="Enregistrer le plan"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    Envoi en cours...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}