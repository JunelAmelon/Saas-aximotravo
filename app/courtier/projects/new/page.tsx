"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ChevronLeft, Save } from "lucide-react";
import { createProject } from "@/lib/firebase/projects";
import { createActivity } from "@/lib/firebase/activities";

export default function NewProject() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    address: "",
    description: "",
    budget: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError("Vous devez être connecté pour créer un projet");
      return;
    }
    
    // Validation simple
    if (!formData.name || !formData.clientName) {
      setError("Le nom du projet et le nom du client sont requis");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Créer le projet dans Firestore
      const projectData = {
        name: formData.name,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        address: formData.address,
        description: formData.description,
        status: "en_attente", // Statut par défaut
        budget: parseFloat(formData.budget) || 0,
        courtierId: currentUser.uid, // Associer au courtier connecté
      };
      
      // Créer le projet
      const projectId = await createProject(projectData);
      
      // Créer une activité pour le nouveau projet
      await createActivity({
        projectId,
        type: "creation",
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email || "Courtier",
        message: `Projet "${formData.name}" créé`
      });
      
      // Rediriger vers la page du projet
      router.push(`/courtier/projects/${projectId}`);
      
    } catch (err: any) {
      console.error("Erreur lors de la création du projet:", err);
      setError("Une erreur est survenue lors de la création du projet");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-gray-900">Nouveau projet</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Retour
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nom du projet *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
              placeholder="Ex: Rénovation appartement Paris 15"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nom du client *
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
              placeholder="Ex: Dupont SAS"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email du client
            </label>
            <input
              type="email"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
              placeholder="client@exemple.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Téléphone du client
            </label>
            <input
              type="tel"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
              placeholder="06 12 34 56 78"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Adresse du chantier
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
              placeholder="123 rue Example, 75000 Paris"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Budget estimé (€)
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
              placeholder="10000"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Description du projet
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
              placeholder="Décrivez le projet en quelques mots..."
              rows={4}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 ${
              loading ? "bg-gray-400" : "bg-[#f21515] hover:bg-[#d41414]"
            } text-white rounded-lg transition-colors flex items-center gap-2`}
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                Création en cours...
              </>
            ) : (
              <>
                <Save size={16} />
                Créer le projet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
