"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, FolderOpen, Scale, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole: "artisan" | "courtier" | "admin";
}

const roleGradients = {
  artisan: "from-amber-500 to-orange-500",
  courtier: "from-blue-500 to-indigo-500",
  admin: "from-purple-500 to-pink-500",
};

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  
  const roleBasePath = `/${userRole}`;
  
  const navigation = {
    artisan: [
      {
        name: "Tableau de bord",
        href: `${roleBasePath}/dashboard`,
        icon: LayoutDashboard,
        current: pathname === `${roleBasePath}/dashboard`,
      },
      {
        name: "Projets",
        href: `${roleBasePath}/projects`,
        icon: FolderOpen,
        current: pathname === `${roleBasePath}/projects`,
      },
      {
        name: "Événements",
        href: `${roleBasePath}/calendar`,
        icon: Calendar,
        current: pathname === `${roleBasePath}/calendar`,
      },
    ],
    courtier: [
      {
        name: "Tableau de bord",
        href: `${roleBasePath}/dashboard`,
        icon: LayoutDashboard,
        current: pathname === `${roleBasePath}/dashboard`,
      },
      {
        name: "Projets",
        href: `${roleBasePath}/projects`,
        icon: FolderOpen,
        current: pathname === `${roleBasePath}/projects`,
      },
      {
        name: "Artisans",
        href: `${roleBasePath}/artisans`,
        icon: Users,
        current: pathname === `${roleBasePath}/artisans`,
      },
      {
        name: "Événements",
        href: `${roleBasePath}/events`,
        icon: Calendar,
        current: pathname === `${roleBasePath}/events`,
      },
    ],
    admin: [
      {
        name: "Tableau de bord",
        href: `${roleBasePath}/dashboard`,
        icon: LayoutDashboard,
        current: pathname === `${roleBasePath}/dashboard`,
      },
      {
        name: "Gestion des acomptes",
        href: `${roleBasePath}/transaction`,
        icon: Scale,
        current: pathname === `${roleBasePath}/transaction`,
      },
      {
        name: "Gérer les profils",
        href: `${roleBasePath}/profiles`,
        icon: Users,
        current: pathname === `${roleBasePath}/profiles`,
      }
    ],
  };

  return (
    <div className="relative bg-white/95 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
      {/* Ligne de gradient subtile en haut */}
      
      <nav className="relative flex justify-between sm:justify-center px-2 sm:px-6 py-1">
        {navigation[userRole].map((item, index) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group relative flex flex-col sm:flex-row items-center px-4 sm:px-8 py-4 text-xs sm:text-sm font-medium transition-all duration-300 border-b-3 rounded-t-lg",
              item.current
                ? "border-[#f26755] text-[#f26755] bg-[#f26755]/5"
                : "border-transparent text-gray-600 hover:text-[#f26755] hover:border-[#f26755]/60 hover:bg-gradient-to-t hover:from-[#f26755]/3 hover:to-transparent"
            )}
            title={item.name}
          >
            {/* Conteneur de l'icône avec effet moderne */}
            <div className={cn(
              "relative flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto transition-all duration-300 sm:mr-3",
              item.current
                ? ""
                : ""
            )}>
              <item.icon
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  item.current
                    ? "text-[#f26755]"
                    : "text-gray-500 group-hover:text-[#f26755]"
                )}
                aria-hidden="true"
              />
            </div>
            
            {/* Texte desktop */}
            <span className={cn(
              "hidden sm:inline relative font-semibold transition-all duration-300",
              item.current
                ? "text-[#f26755]"
                : "text-gray-700 group-hover:text-[#f26755]"
            )}>
              {item.name}
            </span>
            
            {/* Texte mobile */}
            <span className={cn(
              "text-[10px] mt-1 sm:hidden font-medium transition-all duration-300 leading-tight text-center",
              item.current
                ? "text-[#f26755]"
                : "text-gray-600 group-hover:text-[#f26755]"
            )}>
              {item.name.split(' ')[0]}
            </span>
          </Link>
        ))}
      </nav>
      
      {/* Ombre subtile en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
    </div>
  );
}