"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Users, Search, Plus, UserPlus, Check } from "lucide-react";
import { 
  getArtisansByCourtierId, 
  getUnassignedArtisans,
  assignArtisanToCourtier,
  ArtisanUser
} from "@/lib/firebase/users";

export default function CourtierArtisans() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myArtisans, setMyArtisans] = useState<ArtisanUser[]>([]);
  const [unassignedArtisans, setUnassignedArtisans] = useState<ArtisanUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigning, setAssigning] = useState<{[key: string]: boolean}>({});
  
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
        artisan.siret?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-bold text-gray-900">Gestion des artisans</h1>
        <button
          onClick={() => router.push('/courtier/dashboard')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
        >
          Retour au tableau de bord
        </button>
      </div>
      
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
                    <h3 className="font-bold text-gray-900">{artisan.companyName}</h3>
                    <p className="text-sm text-gray-500">{artisan.displayName || artisan.email}</p>
                    <p className="text-xs text-gray-400 mt-1">SIRET: {artisan.siret}</p>
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
      
      {/* Artisans disponibles */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <UserPlus size={20} className="mr-2" />
          Artisans disponibles
        </h2>
        
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un artisan par nom, email ou SIRET..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {filteredUnassignedArtisans.length === 0 && unassignedArtisans.length > 0 && (
          <p className="text-center text-gray-500 p-4">Aucun résultat pour "{searchTerm}"</p>
        )}
        
        {unassignedArtisans.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">Aucun artisan disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnassignedArtisans.map((artisan) => (
              <div key={artisan.uid} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{artisan.companyName}</h3>
                    <p className="text-sm text-gray-500">{artisan.displayName || artisan.email}</p>
                    <p className="text-xs text-gray-400 mt-1">SIRET: {artisan.siret}</p>
                    {artisan.phoneNumber && (
                      <p className="text-xs text-gray-400 mt-1">Tél: {artisan.phoneNumber}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => handleAssignArtisan(artisan.uid)}
                    disabled={assigning[artisan.uid]}
                    className={`w-full flex items-center justify-center px-4 py-2 ${
                      assigning[artisan.uid]
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-[#f21515] hover:bg-[#d41414]'
                    } text-white rounded-lg transition-colors`}
                  >
                    {assigning[artisan.uid] ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                        Assignation...
                      </>
                    ) : (
                      <>
                        <Plus size={16} className="mr-2" />
                        Ajouter à ma liste
                      </>
                    )}
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
