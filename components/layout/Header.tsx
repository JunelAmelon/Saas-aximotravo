"use client";

import { useState } from "react";
import Image from "next/image";
import { Bell, Settings, LogOut } from "lucide-react";
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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [user] = useState({
    name: "Sam sam",
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  });

  const handleLogout = () => {
    // Handle logout logic here
    console.log("Logging out...");
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <div className="text-3xl font-bold text-[#f21515] mr-8">
          Aximotravo
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px]">
            <div className="p-4 text-center text-sm text-gray-500">
              Aucune notification
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center cursor-pointer">
              <div className="mr-4 text-right">
                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                <p className="text-xs font-medium text-gray-500">{roleLabels[userRole]}</p>
              </div>
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                <Image 
                  src={user.avatar} 
                  alt="User avatar" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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