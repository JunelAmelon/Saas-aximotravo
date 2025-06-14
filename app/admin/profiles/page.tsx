"use client";

import { useState, useEffect } from "react";
import { Users, PlusCircle, Search, ChevronLeft, ChevronRight, X, Loader2, CheckCircle } from "lucide-react";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "courtier";
  company?: string;
  postalCode?: string;
  city?: string;
  geographicArea?: string;
  avatar: string;
  createdAt: string;
}

export default function ProfilerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "courtier">("admin");
  const [formState, setFormState] = useState({
    loading: false,
    success: false,
    error: "",
  });
  const usersPerPage = 7;

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "admin" || data.role === "courtier") {
          usersData.push({
            id: doc.id,
            name: data.name || "Nom inconnu",
            email: data.email || "Email non spécifié",
            role: data.role,
            company: data.company,
            postalCode: data.postalCode,
            city: data.city,
            geographicArea: data.geographicArea,
            avatar: data.avatar || "/default-avatar.png",
            createdAt: data.createdAt || new Date().toISOString(),
          });
        }
      });

      setUsers(usersData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users: ", err);
      setError("Échec du chargement des utilisateurs");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (role: "admin" | "courtier") => {
    setSelectedRole(role);
    setIsModalOpen(true);
    setFormState({ loading: false, success: false, error: "" });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateUser = async (formData: any) => {
    setFormState({ ...formState, loading: true, error: "" });
    
    try {
      const apiUrl = '/api/create-profiles';
      console.log('Sending request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: selectedRole
        }),
      });
  
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la création');
      }
  
      const data = await response.json();
      console.log('Success:', data);
      
      setFormState({ loading: false, success: true, error: "" });
      setTimeout(() => {
        setIsModalOpen(false);
        fetchUsers();
      }, 1500);
  
    } catch (err: any) {
      console.error('Full Error:', {
        message: err.message,
        stack: err.stack
      });
      
      setFormState({ 
        loading: false, 
        success: false, 
        error: err.message.includes('Failed to fetch') 
          ? 'Erreur de connexion au serveur' 
          : err.message 
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.company && user.company.toLowerCase().includes(searchLower)) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const getRoleColor = (role: string) => {
    return role === "admin" 
      ? "bg-purple-100 text-purple-800" 
      : "bg-blue-100 text-blue-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-[#f21515]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <X className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  {/* Titre */}
  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 whitespace-nowrap">
    Gestion des utilisateurs
  </h1>
  
  {/* Boutons - ligne sur desktop, colonne sur mobile */}
  <div className="flex flex-col sm:flex-row gap-3">
    <Button 
      onClick={() => openModal("admin")} 
      className="bg-[#f26755] hover:bg-[#f26755]/90 whitespace-nowrap"
    >
      <PlusCircle className="h-4 w-4 mr-2" />
      Créer un admin
    </Button>
    <Button 
      onClick={() => openModal("courtier")} 
      className="bg-[#f26755] hover:bg-[#f26755]/90 whitespace-nowrap"
    >
      <PlusCircle className="h-4 w-4 mr-2" />
      Créer un courtier
    </Button>
  </div>
</div>

      {/* Barre de recherche */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-[32rem] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
          />
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* En-têtes du tableau... */}
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="relative h-10 w-10 flex-shrink-0">
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.company || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Affichage de <span className="font-medium">{((currentPage - 1) * usersPerPage) + 1}</span> à{' '}
              <span className="font-medium">{Math.min(currentPage * usersPerPage, filteredUsers.length)}</span> sur{' '}
              <span className="font-medium">{filteredUsers.length}</span> utilisateurs
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentPage === i + 1 
                        ? 'bg-[#f26755] text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de création */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Créer un {selectedRole === "admin" ? "administrateur" : "courtier"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            {formState.success ? (
              <div className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Utilisateur créé avec succès !</h3>
                <Button 
                  onClick={closeModal}
                  className="mt-4 bg-[#f21515] hover:bg-[#f21515]/90"
                >
                  Fermer
                </Button>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                handleCreateUser({
                  email: form.email.value,
                  password: form.password.value,
                  name: form.name.value,
                  company: form.company?.value,
                  postalCode: form.postalCode?.value,
                  city: form.city?.value,
                  geographicArea: form.geographicArea?.value
                });
              }} className="p-6 space-y-4">
                {formState.error && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                    {formState.error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Mot de passe temporaire *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Nom complet *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                  />
                </div>

                {selectedRole === "courtier" && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Société *</label>
                      <input
                        type="text"
                        name="company"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Code postal *</label>
                        <input
                          type="text"
                          name="postalCode"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Ville *</label>
                        <input
                          type="text"
                          name="city"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Secteur géographique *</label>
                      <input
                        type="text"
                        name="geographicArea"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={closeModal}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={formState.loading}
                    className="bg-[#f26755] hover:bg-[#f26755]/90"
                  >
                    {formState.loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      "Créer l'utilisateur"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}