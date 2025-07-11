"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/contexts/AuthContext";
import { Lock, Mail, Eye, EyeOff, LogIn } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
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
        
        switch (role) {
          case "courtier":
            await router.push("/courtier/dashboard");
            break;
          case "artisan":
            await router.push("/artisan/dashboard");
            break;
          case "admin":
            window.location.href = "/admin/dashboard";
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
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          {/* Icon Header */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#f26755]/10 p-4 rounded-full">
              <Lock className="h-8 w-8 text-[#f26755]" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Authentification
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Accédez à votre espace professionnel
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
                  loading ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
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
  );
}