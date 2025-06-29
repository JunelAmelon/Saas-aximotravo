// components/MainLayout.tsx
import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
  userRole: "artisan" | "courtier" | "admin";
  noLayout?: boolean; // Nouvelle prop optionnelle
}

export default function MainLayout({ 
  children, 
  userRole, 
  noLayout = false // Valeur par défaut false
}: MainLayoutProps) {
  // Si noLayout est true, retournez simplement les enfants sans wrapper
  if (noLayout) {
    return <>{children}</>;
  }

  // Sinon, retournez le layout complet
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <Sidebar userRole={userRole} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 pb-20 sm:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}