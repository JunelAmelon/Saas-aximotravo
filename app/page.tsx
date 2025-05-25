import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Aximotravo</h1>
          <p className="text-gray-600 mb-6">Plateforme de gestion pour courtiers et artisans</p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/artisan/dashboard" 
            className="w-full flex items-center justify-between px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <span>Espace Artisan</span>
            <ArrowRight size={18} />
          </Link>
          
          <Link 
            href="/courtier/dashboard" 
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <span>Espace Courtier</span>
            <ArrowRight size={18} />
          </Link>
          
          <Link 
            href="/admin/dashboard" 
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <span>Administration</span>
            <ArrowRight size={18} />
          </Link>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2025 Aximotravo. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}