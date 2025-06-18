"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HeaderProps {
  userRole: "artisan" | "courtier" | "admin";
}

const roleLabels = {
  artisan: "Espace Artisan",
  courtier: "Espace Courtier",
  admin: "Espace Administration"
};

export default function Header({ userRole }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userData, setUserData] = useState({
    displayName: "",
    email: "",
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
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
            displayName: data.displayName || data.email.split('@')[0],
            email: data.email,
            avatar: data.photoURL || userData.avatar
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur:", error);
      } finally {
        setLoading(false);
      }
    }
    
    getUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 py-3 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
  {/* Logo et nom avec style moderne */}
  <div className="flex items-center">
  <Link href="/" className="flex items-center group">
    {/* Logo avec animation au survol */}
    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f26755] to-[#f28c55] flex items-center justify-center shadow-md group-hover:rotate-6 transition-all duration-200 mr-1">
      <span className="text-white text-2xl font-extrabold transform group-hover:scale-110 transition-transform">AX</span>
    </div>
    {/* Texte avec espacement réduit */}
    <span className="text-2xl font-extrabold bg-gradient-to-r from-[#f26755] to-[#f28c55] bg-clip-text text-transparent tracking-tight">
      imotravo
    </span>
  </Link>
</div>
  
  {/* Actions utilisateur */}
  <div className="flex items-center space-x-3 sm:space-x-5">
    {/* Bouton notifications - style moderne */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="relative p-2 rounded-full hover:bg-gray-50 transition-colors group"
          title="Notifications"
          aria-label="Notifications"
        >
          <div className="relative">
            <Bell className="h-5 w-5 text-gray-500 group-hover:text-[#f26755] transition-colors" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-72 p-0 shadow-xl rounded-xl border border-gray-100"
      >
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
        </div>
        <div className="p-4 text-center text-sm text-gray-500">
          Aucune nouvelle notification
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Menu profil - style carte moderne */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center space-x-2 cursor-pointer group">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-900 group-hover:text-[#f26755] transition-colors">
              {loading ? "Chargement..." : userData.displayName}
            </p>
            <p className="text-xs font-medium text-gray-500">
              {roleLabels[userRole]}
            </p>
          </div>
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:border-[#f26755] transition-colors">
            <Image 
              src={userData.avatar} 
              alt="Photo de profil" 
              fill
              className="object-cover"
              sizes="40px"
            />
            {/* Badge en ligne */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 p-2 shadow-xl rounded-xl border border-gray-100"
      >
        <div className="sm:hidden p-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">
            {loading ? "Chargement..." : userData.displayName}
          </p>
          <p className="text-xs font-medium text-gray-500">
            {roleLabels[userRole]}
          </p>
        </div>
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</header>
  );
}