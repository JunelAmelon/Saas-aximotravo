"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/auth";
import { useSettings } from "@/hooks/settings";
import Image from "next/image";
import {
  Wallet,
  LayoutDashboard,
  CreditCard,
  FileText,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Search,
  Menu,
  X,
  User,
  HelpCircle,
  Building2,
} from "lucide-react";
import Link from "next/link";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TOUS les hooks doivent être déclarés ici, AVANT tout if/return !
  const { user, loading } = useAuth();
  const { profile, fetchProfile } = useSettings(user?.uid ?? "");

  useEffect(() => {
    if (user?.uid) fetchProfile();
  }, [user?.uid, fetchProfile]);
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: "Paiement en attente",
      message:
        "Un acompte est en attente de paiement pour le projet Villa Moderne",
      time: "Il y a 2 heures",
    },
    {
      id: 2,
      title: "Nouveau document",
      message: "Une nouvelle facture est disponible pour le projet Rénovation",
      time: "Il y a 1 jour",
    },
  ]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500">Chargement...</span>
      </div>
    );
  }

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Tableau de bord",
      href: "/dashboard/client",
    },
    {
      icon: Building2,
      label: "Projets",
      href: "/dashboard/client/projects",
    },
    {
      icon: CreditCard,
      label: "Paiements",
      href: "/dashboard/client/payments",
    },
    {
      icon: Settings,
      label: "Paramètres",
      href: "/dashboard/client/settings",
    },
  ];

  const handleLogout = () => {
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <aside
        className={`w-64 md:w-72 bg-[#1a1a1a] fixed h-full transition-transform duration-300 ease-in-out z-40 border-r border-white/10 ${
          showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col items-center gap-3">
              <Image
                src="/logo-blanc-sf.svg" // Chemin vers ton logo dans /public
                alt="Logo SecureAcompte"
                width={200}
                height={40}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? "bg-[#dd7109] text-white"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <item.icon
                        className={`w-5 h-5 ${
                          isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-white"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-200 relative group"
            >
              {profile?.photoURL ? (
                <Image
                  src={profile.photoURL}
                  alt="avatar"
                  width={70}
                  height={70}
                  className="w-[70px] h-[70px] rounded-full object-cover border-2 border-orange-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#dd7109] to-[#ff9f4d] flex items-center justify-center">
                  <span className="font-semibold text-white">
                    {profile?.firstName?.[0] || ""}
                    {profile?.lastName?.[0] || ""}
                  </span>
                </div>
              )}
              <div className="flex-1 text-left">
                <p className="font-medium text-white">
                  {profile
                    ? `${profile.firstName || ""} ${
                        profile.lastName || ""
                      }`.trim()
                    : user?.email}
                </p>
                <p className="text-sm text-gray-400">Client</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white" />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-20 left-4 right-4 bg-[#262626] rounded-lg border border-white/10 p-2 shadow-xl">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72 pb-20 lg:pb-0">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-72 z-30">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Menu Burger */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                {showSidebar ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Search - Hidden on mobile */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un projet..."
                  className="w-[300px] h-10 bg-white rounded-lg pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#dd7109] transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Help */}
              <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <HelpCircle className="w-5 h-5 text-gray-600" />
              </button>

              {/* User - Hidden on mobile */}
              <button className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#dd7109] to-[#ff9f4d] flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {profile
                    ? `${profile.firstName || ""} ${
                        profile.lastName || ""
                      }`.trim()
                    : user?.email}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="pt-24 md:pt-28 px-4 md:px-8 min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10 z-30">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive ? "text-[#dd7109]" : "text-gray-400"
                }`}
                onClick={() => setShowSidebar(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowBottomMenu(!showBottomMenu)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              showBottomMenu ? "text-[#dd7109]" : "text-gray-400"
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1">Plus</span>
          </button>
        </div>
      </div>

      {/* Bottom Menu Modal */}
      {showBottomMenu && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowBottomMenu(false)}
          />

          {/* Menu Content */}
          <div className="absolute bottom-16 left-0 right-0 bg-[#1a1a1a] rounded-t-2xl overflow-hidden transform transition-transform duration-300 ease-out">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-medium text-white">Menu</h3>
              <button
                onClick={() => setShowBottomMenu(false)}
                className="p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-2">
              {/* Show remaining nav items */}
              {navItems.slice(4).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#dd7109] text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => setShowBottomMenu(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-red-500 mt-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}
