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
      window.location.href = "/";
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/" className="text-2xl sm:text-3xl font-bold text-[#f26755] mr-2 sm:mr-8">
          Aximotravo
        </Link>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Notifications - Visible uniquement sur les écrans plus grands */}
        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                title="Notifications"
                aria-label="Voir les notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <div className="p-4 text-center text-sm text-gray-500">
                Aucune notification
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Profil utilisateur */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center cursor-pointer">
              {/* Nom et rôle - visible uniquement sur les écrans plus grands */}
              <div className="hidden sm:block mr-4 text-right">
                <p className="text-sm font-bold text-gray-900">{loading ? "Chargement..." : userData.displayName}</p>
                <p className="text-xs font-medium text-gray-500">{roleLabels[userRole]}</p>
              </div>
              {/* Avatar - toujours visible */}
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                <Image 
                  src={userData.avatar} 
                  alt="User avatar" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Nom et rôle - visible uniquement dans le dropdown sur mobile */}
            <div className="sm:hidden p-3 border-b">
              <p className="text-sm font-bold text-gray-900">{loading ? "Chargement..." : userData.displayName}</p>
              <p className="text-xs font-medium text-gray-500">{roleLabels[userRole]}</p>
            </div>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}