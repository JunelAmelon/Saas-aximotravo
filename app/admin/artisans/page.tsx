"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  CheckCircle, 
  UserCheck,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function AdminArtisansIndexPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#f26755] to-[#f21515] rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">Gestion des Artisans</h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">Administration des artisans de la plateforme</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Card Vérification */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-br from-[#f26755] to-[#f21515] p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="bg-white/20 p-3 sm:p-4 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
              </div>
            </div>
            
            <div className="p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Vérification</h2>
              <p className="text-slate-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Validez ou rejetez les nouveaux dossiers d'artisans soumis par les courtiers. 
                Consultez les documents et informations avant validation.
              </p>
              
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Artisans en attente</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/admin/artisans/verification')}
                className="w-full bg-[#f26755] hover:bg-[#f21515] text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
              >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="truncate">Accéder à la vérification</span>
              </button>
            </div>
          </div>

          {/* Card Artisans Validés */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="bg-white/20 p-3 sm:p-4 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
              </div>
            </div>
            
            <div className="p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Artisans Validés</h2>
              <p className="text-slate-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Consultez et gérez tous les artisans validés sur la plateforme. 
                Accédez aux profils complets et gérez les statuts des comptes.
              </p>
              
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Artisans actifs</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/admin/artisans/validated')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
              >
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="truncate">Voir les artisans validés</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
