'use client';

import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddEventDrawer from './AddEventDrawer';

interface Event {
  id: string;
  startDate: string;
  endDate: string;
  type: 'sav' | 'visite' | 'construction' | 'livraison' | 'autre' | 'releve_technique';
  name: string;
  location: string;
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [events] = useState<Event[]>([
    {
      id: '1',
      startDate: '2025-03-01T17:00',
      endDate: '2025-03-01T18:00',
      type: 'sav',
      name: 'SAV - Pose Paroi',
      location: 'Leroy Merlin Biganos'
    },
    {
      id: '2',
      startDate: '2025-03-01T09:30',
      endDate: '2025-03-01T12:00',
      type: 'visite',
      name: 'Démarrage Chantier',
      location: 'Leroy Merlin Biganos'
    },
    {
      id: '3',
      startDate: '2025-03-01T14:30',
      endDate: '2025-03-01T17:00',
      type: 'construction',
      name: 'Date de Pose',
      location: 'Leroy Merlin Biganos'
    },
    {
      id: '4',
      startDate: '2025-03-01T19:00',
      endDate: '2025-03-01T20:00',
      type: 'livraison',
      name: 'Livraison',
      location: 'Leroy Merlin Biganos'
    },
    {
      id: '5',
      startDate: '2025-03-01T16:30',
      endDate: '2025-03-01T17:30',
      type: 'releve_technique',
      name: 'Relevé Technique',
      location: 'Leroy Merlin Biganos'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Événements du Projet</h2>
        <button 
          onClick={() => setIsAddEventOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un événement
        </button>
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
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50 group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(event.startDate), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(event.endDate), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${typeConfig[event.type].color} ${typeConfig[event.type].bg} ${typeConfig[event.type].border} border`}>
                    {typeConfig[event.type].label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{event.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{event.location}</div>
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
      />
    </div>
  );
}