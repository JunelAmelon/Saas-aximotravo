"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ChevronLeft, Save, Image as ImageIcon } from "lucide-react";
import { useCreateProject } from "@/hooks/use-create-project";

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
import process from "process";

export default function NewProject() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { addProject, loading: isLoading, error, success } = useCreateProject();

  const [form, setForm] = useState({
    name: "",
    clientFullName: "",  // ajouté
    clientPhone: "",     // ajouté
    clientEmail: "",
    budget: 0,
    paidAmount: 0,
    startDate: "",
    estimatedEndDate: "",
    status: "En attente",
    progress: 0,
    type: "",
    location: "",
    addressDetails: "",
    firstDepositPercent: "",
    description: "",
    image: "",
    amoIncluded: false
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Veuillez sélectionner une image pour le projet.");
      return;
    }

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
      image: imageUrl,
      status: "En attente",
      amoIncluded: form.amoIncluded
    });

    if (!error) {
      setForm({
        name: "",
        clientFullName: "",
        clientPhone: "",
        clientEmail: "",
        budget: 0,
        paidAmount: 0,
        startDate: "",
        estimatedEndDate: "",
        status: "En attente",
        progress: 0,
        type: "",
        location: "",
        addressDetails: "",
        firstDepositPercent: "",
        description: "",
        image: "",
        amoIncluded: false
      });
      setImageFile(null);
      setTimeout(() => router.push("/courtier/projects"), 1200);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Nouveau projet</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-[#f26755] text-white rounded-lg hover:bg-[#e05a48] transition-colors flex items-center gap-2 shadow-md"
        >
          <ChevronLeft size={16} />
          Retour
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {typeof error === "object" && error !== null && "message" in error
              ? (error as any).message
              : String(error)}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
            Projet créé avec succès !
          </div>
        )}

        <div className="mb-6 flex items-center gap-3">
          <input
            type="checkbox"
            id="amoIncluded"
            name="amoIncluded"
            checked={form.amoIncluded}
            onChange={handleChange}
            className="h-4 w-4 text-[#f26755] border-gray-300 rounded focus:ring-[#f26755]"
          />
          <label htmlFor="amoIncluded" className="text-sm text-gray-700 font-medium select-none">
            AMO inclus ?
          </label>
          <span className="text-xs text-gray-500">
            {form.amoIncluded ? "Oui" : "Non"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image du projet *
            </label>
            <div className="flex items-center gap-4">
              <label className="flex flex-col items-center justify-center w-full max-w-xs cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#f26755] transition-colors group">
                  <ImageIcon className="w-8 h-8 mb-3 text-gray-400 group-hover:text-[#f26755]" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e =>
                    e.target.files && e.target.files[0] && setImageFile(e.target.files[0])
                  }
                  className="hidden"
                  required
                />
              </label>
              {imageFile && (
                <div className="relative">
                  <Image
                    src={URL.createObjectURL(imageFile)}
                    alt="Aperçu du projet"
                    width={128}
                    height={128}
                    className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    aria-label="bouton"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom du projet *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent transition-all shadow-sm"
              placeholder="Nom du projet"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="clientFullName" className="block text-sm font-medium text-gray-700 mb-1">Nom complet du client *</label>
            <input
              id="clientFullName"
              name="clientFullName"
              type="text"
              value={form.clientFullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent transition-all shadow-sm"
              placeholder="Jean Dupont"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-1">Contact du client *</label>
            <input
              id="clientPhone"
              name="clientPhone"
              type="tel"
              value={form.clientPhone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent transition-all shadow-sm"
              placeholder="06 00 00 00 00"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-1">Email du client *</label>
            <input
              id="clientEmail"
              name="clientEmail"
              type="email"
              value={form.clientEmail}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent transition-all shadow-sm"
              placeholder="client@exemple.com"
            />
          </div>

          {/* Les autres champs budget, dates, type, location, description… restent inchangés — reporte ton code original ici */}
                    <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget estimé (€) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">€</span>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent transition-all shadow-sm"
                placeholder="10000.50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4CAF50] mb-1">Date de début</label>
            <div className="relative">
              <input
                aria-label="date"
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-[#4CAF50] text-[#2E7D32] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#f26755] mb-1">Date de fin estimée</label>
            <div className="relative">
              <input
                aria-label="date"
                type="date"
                name="estimatedEndDate"
                value={form.estimatedEndDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-[#f26755] text-[#d32f2f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de projet</label>
            <input
              type="text"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent transition-all shadow-sm"
              placeholder="Ex: Rénovation, Extension..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent transition-all shadow-sm"
              placeholder="Adresse ou ville"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Informations complémentaires sur l'adresse</label>
            <textarea
              name="addressDetails"
              value={form.addressDetails}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent transition-all shadow-sm"
              placeholder="Étage, code porte, bâtiment, précisions..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">% premier acompte *</label>
            <select
              aria-label="firstDepositPercent"
              name="firstDepositPercent"
              value={form.firstDepositPercent}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent transition-all shadow-sm appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem]"
              required
            >
              <option value="">Choisir le pourcentage</option>
              <option value={30}>30%</option>
              <option value={40}>40%</option>
            </select>
            <span className="text-xs text-gray-500">Seuls 30% ou 40% sont autorisés pour le premier acompte.</span>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description du projet</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent transition-all shadow-sm"
              placeholder="Décrivez le projet en quelques mots..."
              rows={4}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
        <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 shadow-md ${isLoading ? "bg-gray-400" : "bg-[#f26755] hover:bg-[#e05a48]"} text-white font-medium`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                Création en cours...
              </>
            ) : (
              <>
                <Save size={18} />
                Créer le projet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
