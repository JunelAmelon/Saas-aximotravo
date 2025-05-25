import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
  userRole: "artisan" | "courtier" | "admin";
}

export default function MainLayout({ children, userRole }: MainLayoutProps) {
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