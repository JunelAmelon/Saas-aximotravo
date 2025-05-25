"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, FolderOpen, Scale } from "lucide-react";
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
        name: "Planning",
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
      }
    ],
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <nav className="flex justify-center px-4">
        {navigation[userRole].map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-8 py-3 text-sm font-medium transition-colors border-b-2",
              item.current
                ? "border-[#f21515] text-[#f21515]"
                : "border-transparent text-gray-700 hover:text-[#f21515] hover:border-[#f21515]"
            )}
          >
            <item.icon
              className={cn(
                "mr-2 h-5 w-5",
                item.current
                  ? "text-[#f21515]"
                  : "text-gray-400 group-hover:text-[#f21515]"
              )}
            />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}