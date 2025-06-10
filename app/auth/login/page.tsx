"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/contexts/AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase/config";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser l'erreur
    setError("");
    setLoading(true);
    
    try {
      // Appeler la fonction de connexion du contexte d'authentification
      const user = await login(email, password);
      
      // Vérifier le rôle de l'utilisateur dans Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;
        
        // Rediriger en fonction du rôle
        if (role === "courtier") {
          router.push("/courtier/dashboard");
        } else if (role === "artisan") {
          router.push("/artisan/dashboard");
        } else if (role === "admin") {
          router.push("/admin/dashboard");
        } else {
          // Par défaut, page d'accueil
          router.push("/");
        }
      } else {
        // Pour le développement uniquement - créer automatiquement un document utilisateur
        try {
          // Par défaut, on crée un utilisateur avec le rôle "courtier" pour tester
          const newUserData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || email.split('@')[0],
            role: "courtier", // Par défaut pour les tests
            createdAt: serverTimestamp()
          };
          
          await setDoc(doc(db, "users", user.uid), newUserData);
          console.log("Document utilisateur créé automatiquement pour les tests");
          
          // Redirection vers le dashboard courtier
          router.push("/courtier/dashboard");
        } catch (createError) {
          console.error("Erreur lors de la création du document utilisateur:", createError);
          setError("Impossible de récupérer ou créer vos informations utilisateur.");
          setLoading(false);
        }
      }
      
    } catch (err: any) {
      console.error("Erreur de connexion:", err);
      
      // Traduire les erreurs Firebase en messages plus conviviaux
      if (err.message?.includes("user-not-found")) {
        setError("Aucun utilisateur trouvé avec cet email.");
      } else if (err.message?.includes("wrong-password")) {
        setError("Mot de passe incorrect.");
      } else if (err.message?.includes("too-many-requests")) {
        setError("Trop de tentatives. Veuillez réessayer plus tard.");
      } else {
        setError("Une erreur est survenue lors de la connexion.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">
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
            <h1 className="text-xl font-medium text-gray-900 mb-6">Se connecter</h1>
            
            <p className="text-sm text-gray-600 mb-6">
              Rentrer les informations de votre compte pour vous connecter :
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                  placeholder="Votre email"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                    placeholder="Votre mot de passe"
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

              <div className="flex items-center justify-between">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-[#f21515] hover:text-[#f21515]/90"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
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
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/auth/register"
                  className="inline-flex px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Créer un compte entreprise
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}