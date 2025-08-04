"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/contexts/AuthContext";
import { Lock, Mail, Eye, EyeOff, LogIn } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase/config";

import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role?.toLowerCase();

        if (!role) {
          setError("Rôle utilisateur non défini.");
          return;
        }

        setRedirecting(true);
        
        // Petit délai pour montrer le message de succès
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        switch (role) {
          case "courtier":
            await router.push("/courtier/dashboard");
            break;
          case "artisan":
            await router.push("/artisan/dashboard");
            break;
          case "admin":
            await router.push("/admin/dashboard");
            break;
          default:
            router.push("/");
            break;
        }
      } else {
        setError("Profil utilisateur non trouvé.");
      }
    } catch (err: any) {
      if (err.message?.includes("user-not-found")) {
        setError("Identifiants incorrects");
      } else if (err.message?.includes("wrong-password")) {
        setError("Identifiants incorrects");
      } else if (err.message?.includes("too-many-requests")) {
        setError("Trop de tentatives. Réessayez plus tard");
      } else {
        setError("Erreur de connexion");
      }
    } finally {
      setLoading(false);
    }
  };

  // Loader de redirection en plein écran
  if (redirecting) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/logo1.svg"
              alt="Logo Aximotravo"
              width={200}
              height={32}
              className="mx-auto"
            />
          </div>
          
          {/* Loader animé */}
          <div className="mb-6">
            <div className="relative mx-auto w-16 h-16">
              {/* Cercle principal */}
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              {/* Cercle animé */}
              <div className="absolute inset-0 border-4 border-[#f26755] border-t-transparent rounded-full animate-spin"></div>
              {/* Point central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#f26755] rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Texte */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connexion réussie !</h2>
          <p className="text-gray-600 animate-pulse">Redirection vers votre espace...</p>
          
          {/* Barre de progression */}
          <div className="mt-6 w-64 mx-auto">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#f26755] rounded-full">
                <div className="h-full bg-gradient-to-r from-[#f26755] to-[#ff8a75] rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Points de chargement */}
          <div className="flex justify-center mt-4 space-x-1">
            <div className="w-2 h-2 bg-[#f26755] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-[#f26755] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-[#f26755] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="flex flex-1 items-center justify-center w-full mt-32">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            {/* Icon Header */}
            <div className="flex justify-center mb-6">
              <Link href="/" className="flex items-center group">
                <Image
                  src="/logo1.svg"
                  alt="Logo Aximotravo"
                  width={200}
                  height={32}
                  className="group-hover:scale-110 transition-transform"
                />
              </Link>
            </div>
            <p className="text-sm text-gray-500 text-center mb-6">
              Accédez à votre espace professionnel
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f26755] focus:border-[#f26755] transition-all"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f26755] focus:border-[#f26755] transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center px-6 py-3.5 rounded-lg text-sm font-medium text-white bg-[#f26755] hover:bg-[#f26755]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f26755] transition-colors ${
                    loading ? "opacity-80 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          {/* Spinner principal */}
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          {/* Points animés */}
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                        </div>
                        <span className="ml-3 font-medium">Connexion en cours...</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Se connecter
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
