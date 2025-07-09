"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, FolderOpen, Scale, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole: "artisan" | "courtier" | "admin";
}

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
        icon: Users, // ou Hammer pour une icône plus métier
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
        href: `${roleBasePath}/payments`,
        icon: Scale,
        current: pathname === `${roleBasePath}/payments`,
      },
      {
        name: "Gérer les profils",
        href: `${roleBasePath}/profiles`,
        icon: Users,
        current: pathname === `${roleBasePath}/profiles`,
      },
      {
        name: "Gérer les transactions",
        href: `${roleBasePath}/transaction`,
        icon: Users,
        current: pathname === `${roleBasePath}/transaction`,
      }
    ],
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <nav className="flex justify-between sm:justify-center px-2 sm:px-4">
        {navigation[userRole].map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col sm:flex-row items-center px-3 sm:px-8 py-3 text-xs sm:text-sm font-medium transition-colors border-b-2",
              item.current
                ? "border-[#f26755] text-[#f26755]"
                : "border-transparent text-gray-700 hover:text-[#f26755] hover:border-[#f26755]"
            )}
            title={item.name}
          >
            <item.icon
              className={cn(
                "h-5 w-5 sm:mr-2",
                item.current
                  ? "text-[#f26755]"
                  : "text-gray-400 group-hover:text-[#f26755]"
              )}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">{item.name}</span>
            <span className="text-[10px] mt-1 sm:hidden">{item.name.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}