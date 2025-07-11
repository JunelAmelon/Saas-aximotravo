import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LogIn } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo1.svg"
              alt="Logo Aximotravo"
              width={200}
              height={32}
              className="group-hover:scale-110 transition-transform"
            />
          </Link>
        </div>
        <nav>
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium text-white bg-[#f21515] rounded-md hover:bg-[#f21515]/90 transition-colors inline-flex items-center"
          >
            <LogIn size={16} className="mr-2" />
            Se connecter
          </Link>
        </nav>
      </header>

      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/logo1.svg"
            alt="Logo Aximotravo"
            width={200}
            height={32}
            className="my-4 group-hover:scale-110 transition-transform"
          />
          <p className="text-gray-600 mb-6">
            Plateforme de gestion pour courtiers et artisans
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="w-full flex items-center justify-between px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#f21515] hover:bg-[#d41414]"
          >
            <span>Se connecter à votre compte</span>
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/artisan/dashboard"
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
