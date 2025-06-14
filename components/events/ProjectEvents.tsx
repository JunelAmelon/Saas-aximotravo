'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useProjectEvents } from '@/hooks/useProjectEvents';
import { useParams } from 'next/navigation';
import { Search, Filter, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddEventDrawer from './AddEventDrawer';

// interface Event supprimée : on utilise ProjectEvent du hook

const typeConfig: Record<Event['type'], { label: string; color: string; bg: string; border: string }> = {
  sav: {
    label: 'SAV',
    color: 'text-red-800',
    bg: 'bg-red-50',
    border: 'border-red-200'
  },
  visite: {
    label: 'Visite',
    color: 'text-green-800',
    bg: 'bg-green-50',
    border: 'border-green-200'
  },
  construction: {
    label: 'Construction',
    color: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  livraison: {
    label: 'Livraison',
    color: 'text-orange-800',
    bg: 'bg-orange-50',
    border: 'border-orange-200'
  },
  autre: {
    label: 'Autre',
    color: 'text-gray-800',
    bg: 'bg-gray-50',
    border: 'border-gray-200'
  },
  releve_technique: {
    label: 'Relevé Technique',
    color: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  }
};

export default function ProjectEvents() {
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role?.toLowerCase() || null);
        }
      }
    };
    fetchRole();
  }, [currentUser]);
  const params = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id as string;
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const { events, loading, error, addEvent } = useProjectEvents(projectId);

  // Filtrage local pour la recherche
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.address || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#f26755] to-[#f26755] text-white rounded-lg font-semibold shadow hover:opacity-90 transition"
          onClick={() => window.history.back()}
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Retour
        </button>
        <h2 className="text-lg font-medium text-gray-900">Événements du Projet</h2>
        {userRole === 'artisan' && (
          <button
            onClick={() => setIsAddEventOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un événement
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Chercher les événements..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent"
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <Filter className="h-4 w-4 mr-2" />
          Filtrer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de début
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de fin
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom de l'événement
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adresse
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50 group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(event.start), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(event.end), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${typeConfig[event.type]?.color || ''} ${typeConfig[event.type]?.bg || ''} ${typeConfig[event.type]?.border || ''} border`}>
                    {typeConfig[event.type]?.label || event.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{event.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{event.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-gray-600">•••</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Affichage de <span className="font-medium">1</span> à <span className="font-medium">5</span> sur <span className="font-medium">5</span> événements
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Précédent
              </button>
              <span className="px-3 py-1 bg-[#f26755] text-white rounded-md text-sm font-medium">1</span>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddEventDrawer
        isOpen={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onAddEvent={async (eventData) => {
          if (!projectId) return;
          await addEvent({ ...eventData, projectId });
        }}
        loading={loading}
      />
    </div>
  );
}