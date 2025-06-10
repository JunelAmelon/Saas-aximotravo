"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/contexts/AuthContext";
import { db } from "../../../lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { signup } = useAuth();
  
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    siret: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser les erreurs
    setError("");
    
    // Vérifier que les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }
    
    // Vérifier la force du mot de passe (minimum 6 caractères pour Firebase)
    if (formData.password.length < 6) {
      return setError("Le mot de passe doit contenir au moins 6 caractères.");
    }
    
    // Vérifier que tous les champs requis sont remplis
    if (!formData.companyName || !formData.email || !formData.password || !formData.phone || !formData.siret) {
      return setError("Tous les champs sont obligatoires.");
    }

    setLoading(true);
    
    try {
      // Créer l'utilisateur dans Firebase Authentication
      const user = await signup(formData.email, formData.password);
      
      // Créer un document dans Firestore pour stocker les informations supplémentaires
      await setDoc(doc(db, "companies", user.uid), {
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        siret: formData.siret,
        createdAt: new Date(),
        role: "company",
        status: "active"
      });
      
      // Rediriger vers le tableau de bord après inscription réussie
      router.push("/artisan/dashboard");
      
    } catch (err: any) {
      console.error("Erreur d'inscription:", err);
      
      // Traduire les erreurs Firebase en messages plus conviviaux
      if (err.message.includes("email-already-in-use")) {
        setError("Cette adresse email est déjà utilisée.");
      } else if (err.message.includes("invalid-email")) {
        setError("L'adresse email est invalide.");
      } else {
        setError("Une erreur est survenue lors de l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen">
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div className="w-32">
            <Image
              src="/aximotravo-logo.svg"
              alt="Aximotravo"
              width={120}
              height={40}
              priority
            /> 
          </div>
          <div className="flex gap-2">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-white bg-[#f21515] rounded-md hover:bg-[#f21515]/90 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 text-sm font-medium text-white bg-[#f21515] rounded-md hover:bg-[#f21515]/90 transition-colors"
            >
              S'inscrire
            </Link>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h1 className="text-xl font-medium text-gray-900 mb-6">Créer un compte entreprise</h1>
            
            <p className="text-sm text-gray-600 mb-6">
              Remplissez le formulaire ci-dessous pour créer votre compte :
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Nom de votre entreprise"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email professionnel
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 caractères"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmez votre mot de passe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ex: 06 12 34 56 78"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro SIRET
                </label>
                <input
                  type="text"
                  name="siret"
                  value={formData.siret}
                  onChange={handleChange}
                  placeholder="14 chiffres (SIREN + NIC)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm mb-4">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#f21515] text-white py-2 rounded-md hover:bg-[#f21515]/90 transition-colors flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></span>
                    Création du compte...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </button>

              <p className="text-center text-sm text-gray-600">
                Déjà inscrit ?{" "}
                <Link
                  href="/auth/login"
                  className="text-[#f21515] hover:text-[#f21515]/90 font-medium"
                >
                  Se connecter
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}