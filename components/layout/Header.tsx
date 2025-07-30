"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  userRole: "artisan" | "courtier" | "admin";
}

const roleLabels = {
  artisan: "Espace Artisan",
  courtier: "Espace Courtier",
  admin: "Espace Administration",
};

const roleGradients = {
  artisan: "from-amber-500 to-orange-500",
  courtier: "from-blue-500 to-indigo-500",
  admin: "from-purple-500 to-pink-500",
};

export default function Header({ userRole }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userData, setUserData] = useState({
    displayName: "",
    email: "",
    avatar:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserData() {
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            displayName: data.displayName || data.email.split("@")[0],
            email: data.email,
            avatar: data.photoURL || userData.avatar,
          });
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données utilisateur:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    getUserData();
  }, [currentUser, userData.avatar]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/60 py-4 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Logo et nom avec style moderne */}
      <div className="flex items-center">
        <Link href={`/${userRole}/dashboard`} className="flex items-center group">
          {/* Logo avec animation au survol */}
          <div className="relative">
            <Image
              src="/logo1.svg"
              alt="Logo Aximotravo"
              width={200}
              height={32}
              className="w-[200px] h-[32px] transition-all duration-300 group-hover:scale-105"
            />
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#f26755] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100"></div>
          </div>
        </Link>
      </div>

      {/* Actions utilisateur */}
      <div className="flex items-center space-x-4">
        

        {/* Bouton notifications - style moderne */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative p-3 rounded-xl bg-gray-50/80 hover:bg-white hover:shadow-lg transition-all duration-300 group"
              title="Notifications"
              aria-label="Notifications"
            >
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-600 group-hover:text-[#f26755] transition-colors duration-300" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 p-0 shadow-xl rounded-xl border-0 bg-white/95 backdrop-blur-md"
          >
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#f26755]/5 to-transparent">
              <h3 className="font-bold text-gray-900 flex items-center">
                <Bell className="h-4 w-4 mr-2 text-[#f26755]" />
                Notifications
              </h3>
            </div>
            <div className="p-4 text-center text-sm text-gray-500">
              Aucune nouvelle notification
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Menu profil - style carte moderne */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-3 cursor-pointer group p-2 rounded-xl hover:bg-gray-50/80 transition-all duration-300">
              <div className="hidden sm:block text-right">
                <div className="flex items-center space-x-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-[#f26755] transition-colors leading-tight">
                      {loading ? (
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        userData.displayName
                      )}
                    </p>
                    <p className="text-xs font-medium text-gray-500 leading-tight">
                      {roleLabels[userRole]}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-[#f26755] transition-all duration-300 group-hover:rotate-180" />
                </div>
              </div>
              
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg group-hover:border-[#f26755]/50 transition-all duration-300">
                  {loading ? (
                    <div className="w-full h-full rounded-full bg-gray-200 animate-pulse"></div>
                  ) : (
                    <Image
                      src={userData.avatar}
                      alt="Photo de profil"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  )}
                </div>
                {/* Badge en ligne */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 p-0 shadow-xl rounded-xl border-0 bg-white/95 backdrop-blur-md"
          >
            {/* Header du profil */}
            <div className="p-4 bg-gradient-to-r from-[#f26755]/5 to-transparent border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                    {loading ? (
                      <div className="w-full h-full rounded-full  bg-gray-200 animate-pulse"></div>
                    ) : (
                      <Image
                        src={userData.avatar}
                        alt="Photo de profil"
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">
                    {loading ? (
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      userData.displayName
                    )}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">{userData.email}</p>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r ${roleGradients[userRole]} text-white text-xs font-semibold mt-1`}>
                    {roleLabels[userRole]}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3">
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center px-3 py-3 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer"
              >
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <LogOut className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">Déconnexion</p>
                  <p className="text-xs text-gray-500">Se déconnecter du compte</p>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}