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
    <div className="relative bg-white border-b border-gray-100">
      <nav className="relative flex justify-between sm:justify-center px-4 py-2 gap-1">
        {navigation[userRole].map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group relative flex flex-col sm:flex-row items-center px-4 py-3 text-xs sm:text-sm font-medium transition-all duration-150",
              item.current
                ? "text-[#f26755] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-0.5 after:bg-[#f26755] after:rounded-full"
                : "text-gray-500 hover:text-[#f26755]"
            )}
            aria-current={item.current ? "page" : undefined}
          >
            {/* Icône avec transition subtile */}
            <div className="relative sm:mr-2">
              <item.icon
                className={cn(
                  "h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem] transition-transform duration-150",
                  item.current
                    ? "text-[#f26755] scale-110"
                    : "text-gray-400 group-hover:text-[#f26755] group-hover:scale-105"
                )}
                aria-hidden="true"
              />
            </div>
            
            {/* Texte desktop */}
            <span className="hidden sm:inline font-medium">
              {item.name}
            </span>
            
            {/* Texte mobile */}
            <span className="text-[10px] mt-1 sm:hidden font-medium leading-tight">
              {item.name.split(' ')[0]}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );

}
