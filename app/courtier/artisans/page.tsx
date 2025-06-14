"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Users, Search, Plus, UserPlus, Check } from "lucide-react";
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCreateArtisan } from '@/hooks/useCreateArtisan';
import {
  getArtisansByCourtierId,
  getUnassignedArtisans,
  assignArtisanToCourtier,
  ArtisanUser
} from "@/lib/firebase/users";

export default function CourtierArtisans() {
  // Modal état
  const [openAddModal, setOpenAddModal] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    codePostal: '',
    ville: '',
    secteur: '',
    email: '',
    specialite: '',
  });
  const { createArtisan, loading: formLoading, error: formError, success: formSuccess } = useCreateArtisan();

  // Handler formulaire
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Création artisan
  const handleAddArtisan = async (e: React.FormEvent) => {
    e.preventDefault();
    await createArtisan(form);
    // Rafraîchir la liste si succès (succès = string)
    if (!formError) {
      setForm({
        companyName: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        codePostal: '',
        ville: '',
        secteur: '',
        email: '',
        specialite: '',
      });
      // Recharge la liste des artisans après ajout
      if (typeof window !== 'undefined') {
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  const { currentUser } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myArtisans, setMyArtisans] = useState<ArtisanUser[]>([]);
  const [unassignedArtisans, setUnassignedArtisans] = useState<ArtisanUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigning, setAssigning] = useState<{ [key: string]: boolean }>({});

  // Charger les artisans
  useEffect(() => {
    async function loadArtisans() {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);

        // Récupérer mes artisans
        const courtierArtisans = await getArtisansByCourtierId(currentUser.uid);

        // Récupérer les artisans non assignés
        const availableArtisans = await getUnassignedArtisans();

        setMyArtisans(courtierArtisans);
        setUnassignedArtisans(availableArtisans);
      } catch (err: any) {
        console.error('Erreur lors du chargement des artisans:', err);
        setError('Impossible de charger la liste des artisans.');
      } finally {
        setLoading(false);
      }
    }

    loadArtisans();
  }, [currentUser]);

  // Assigner un artisan
  const handleAssignArtisan = async (artisanId: string) => {
    if (!currentUser) return;

    try {
      setAssigning(prev => ({ ...prev, [artisanId]: true }));

      await assignArtisanToCourtier(artisanId, currentUser.uid);

      // Mise à jour de l'UI
      const artisan = unassignedArtisans.find(a => a.uid === artisanId);
      if (artisan) {
        setMyArtisans(prev => [...prev, artisan]);
        setUnassignedArtisans(prev => prev.filter(a => a.uid !== artisanId));
      }
    } catch (err: any) {
      console.error('Erreur lors de l\'assignation de l\'artisan:', err);
      alert('Une erreur est survenue lors de l\'association de l\'artisan.');
    } finally {
      setAssigning(prev => ({ ...prev, [artisanId]: false }));
    }
  };

  // Filtrer les artisans par recherche
  const filteredUnassignedArtisans = searchTerm
    ? unassignedArtisans.filter(artisan =>
      artisan.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.specialite?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : unassignedArtisans;

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f21515]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push('/courtier/dashboard')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
        >
          Retour au tableau de bord
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des artisans</h1>
        <button
          onClick={() => setOpenAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#f26755] text-white rounded-md font-semibold shadow hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" /> Ajouter un artisan
        </button>
      </div>

      <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
        <DialogContent className="max-w-lg w-full">
          <form onSubmit={handleAddArtisan} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold mb-2">Ajouter un artisan</h2>
            <div className="grid grid-cols-2 gap-2">
              <input name="companyName" value={form.companyName} onChange={handleFormChange} placeholder="Entreprise" required className="border p-2 rounded" />
              <input name="firstName" value={form.firstName} onChange={handleFormChange} placeholder="Prénom" required className="border p-2 rounded" />
              <input name="lastName" value={form.lastName} onChange={handleFormChange} placeholder="Nom" required className="border p-2 rounded" />
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleFormChange} placeholder="Téléphone" required className="border p-2 rounded" />
              <input name="codePostal" value={form.codePostal} onChange={handleFormChange} placeholder="Code postal" required className="border p-2 rounded" />
              <input name="ville" value={form.ville} onChange={handleFormChange} placeholder="Ville" required className="border p-2 rounded" />
              <input name="secteur" value={form.secteur} onChange={handleFormChange} placeholder="Secteur géographique" required className="border p-2 rounded" />
              <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="Email" required className="border p-2 rounded col-span-2" />
              <input name="specialite" value={form.specialite} onChange={handleFormChange} placeholder="Spécialité" required className="border p-2 rounded col-span-2" />
            </div>
            {formError && <div className="text-red-600 text-sm">{formError}</div>}
            {formSuccess && <div className="text-green-600 text-sm">{formSuccess}</div>}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors disabled:opacity-50"
                disabled={formLoading}
              >
                {formLoading ? (
                  <span className="loader mr-2"></span>
                ) : (
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                )}
                Ajouter
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mes artisans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users size={20} className="mr-2" />
          Mes artisans ({myArtisans.length})
        </h2>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}

        {myArtisans.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">Vous n'avez pas encore d'artisans associés à votre compte.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {myArtisans.map((artisan) => (
              <div key={artisan.uid} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{artisan.displayName || artisan.email}</h3>
                    <p className="text-sm text-gray-500">{artisan.companyName}</p>
                    <p className="text-xs text-gray-400 mt-1">Email: {artisan.email}</p>
                    <p className="text-xs text-gray-400 mt-1">Spécialité: {artisan.specialite}</p>
                    {artisan.phoneNumber && (
                      <p className="text-xs text-gray-400 mt-1">Tél: {artisan.phoneNumber}</p>
                    )}
                  </div>
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <Check size={16} />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => router.push(`/courtier/artisans/${artisan.uid}`)}
                    className="text-xs text-[#f21515] hover:underline"
                  >
                    Voir les projets
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
