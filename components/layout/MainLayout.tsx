// components/MainLayout.tsx
import { ReactNode, useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "@/lib/contexts/AuthContext";
import {getUserById} from "@/lib/firebase/users";
import { useRouter } from "next/navigation";
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
  const { currentUser } = useAuth();
  const roleid = currentUser?.uid || "";
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    if (!currentUser?.uid) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getUserById(currentUser.uid)
      .then((u) => setUser(u))
      .finally(() => setLoading(false));
  }, [currentUser]);
  useEffect(() => {
    if (user && userRole !== user.role) {
      router.push(`/${user.role}/dashboard`);
    }
  }, [user, userRole, router]);
  // Si noLayout est true, retournez simplement les enfants sans wrapper
  if (noLayout) {
    return <>{children}</>;
  }

  if (user && userRole !== user.role) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Accès refusé</h2>
          <p className="text-gray-500">
            Vous n’avez pas l’autorisation d’accéder à cette interface.
          </p>
        </div>
      </div>
    );
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