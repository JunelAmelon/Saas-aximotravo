"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ChevronLeft, Save, Image as ImageIcon } from "lucide-react";
import { useCreateProject } from "@/hooks/use-create-project";

// Pour l'upload direct sur Cloudinary
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
import { CLOUDINARY_UPLOAD_PRESET } from '@/lib/cloudinary';
import process from "process";

export default function NewProject() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { addProject, loading: isLoading, error, success } = useCreateProject();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  const [form, setForm] = useState({
    name: "",
    clientEmail: "",
    budget: 0,
    paidAmount: 0,
    startDate: "",
    estimatedEndDate: "",
    status: "En attente",
    progress: 0,
    type: "",
    location: "",
    firstDepositPercent: "",
    description: "",
    image: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Vérifier qu'un fichier image est sélectionné
    if (!imageFile) {
      alert("Veuillez sélectionner une image pour le projet.");
      return;
    }
    // Upload vers Cloudinary
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string);
    let imageUrl = "";
    try {
      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: data
      });
      const cloudinary = await res.json();
      if (!cloudinary.secure_url) throw new Error("Échec de l'upload de l'image");
      imageUrl = cloudinary.secure_url;
    } catch (err) {
      alert("Erreur lors de l'upload de l'image");
      return;
    }
    await addProject({
      ...form,
      budget: Number(form.budget),
      paidAmount: Number(form.paidAmount),
      progress: Number(form.progress),
      firstDepositPercent: Number(form.firstDepositPercent),
      image: imageUrl
    });
    if (!error) {
      setForm({
        name: "",
        clientEmail: "",
        budget: 0,
        paidAmount: 0,
        startDate: "",
        estimatedEndDate: "",
        status: "En attente",
        progress: 0,
        type: "",
        location: "",
        firstDepositPercent: "",
        description: "",
        image: ""
      });
      setImageFile(null);
      setTimeout(() => router.push("/courtier/projects"), 1200);
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
            {error.message}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
            Projet créé avec succès !
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload image Cloudinary */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Image du projet *</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                  } else {
                    setImageFile(null);
                  }
                }}
                required
                className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
              {imageFile && (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Aperçu du projet"
                  className="h-16 w-16 object-cover rounded border"
                />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Nom du projet *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
              placeholder="Ex: Rénovation appartement Paris 15"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email du client *</label>
            <input
              type="email"
              name="clientEmail"
              value={form.clientEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
              placeholder="client@exemple.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Budget estimé (€) *</label>
            <input
              type="number"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
              placeholder="Ex: 10000.50"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date de début</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date de fin estimée</label>
            <input
              type="date"
              name="estimatedEndDate"
              value={form.estimatedEndDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Type de projet</label>
            <input
              type="text"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
              placeholder="Ex: Rénovation, Extension..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Localisation</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
              placeholder="Adresse ou ville"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">% premier acompte *</label>
            <select
              name="firstDepositPercent"
              value={form.firstDepositPercent}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
              required
            >
              <option value="">Choisir le pourcentage</option>
              <option value={30}>30%</option>
              <option value={40}>40%</option>
            </select>
            <span className="text-xs text-gray-500">Seuls 30% ou 40% sont autorisés pour le premier acompte.</span>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description du projet</label>
            <textarea
              name="description"
              value={form.description}
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
            disabled={isLoading}
            className={`px-6 py-2 ${isLoading ? "bg-gray-400" : "bg-[#f21515] hover:bg-[#d41414]"} text-white rounded-lg transition-colors flex items-center gap-2`}
          >
            {isLoading ? (
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
