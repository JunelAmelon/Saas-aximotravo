"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEvents } from "@/hooks/events";
import { 
  ChevronLeft, 
  Search, 
  ChevronRight, 
  Calendar, 
  XCircle, 
  MapPin,
  Users,
  Eye,
  MoreHorizontal
} from "lucide-react";

// Utilisez le même type que celui retourné par useEvents

type ProjectEvent = {
  id?: string; // Rend id optionnel pour correspondre au type du hook
  name: string;
  type: string;
  address: string;
  description?: string;
  start: string;
  startTime?: string;
  endTime?: string;
  attendees?: number;
  status?: 'confirmed' | 'pending' | 'draft';
  typeColor?: string;
};

export default function ProjectEventsPage() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [filterType, setFilterType] = useState('all');
  const params = useParams();
  const router = useRouter();
  
  const projectId = params?.id 
    ? Array.isArray(params.id) 
      ? params.id[0] 
      : params.id
    : "";

  const { events, loading, error } = useEvents(projectId);
  
  const filteredEvents = events.filter((ev: ProjectEvent) => {
    const matchesSearch = ev.name.toLowerCase().includes(search.toLowerCase()) ||
                         ev.type.toLowerCase().includes(search.toLowerCase()) ||
                         ev.address.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'all' || ev.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'confirmed': return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'pending': return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'draft': return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
      default: return <div className="w-2 h-2 bg-gray-300 rounded-full"></div>;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Style identique à la page de notes */}
      <header className="bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:h-16 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Retour à la page précédente"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">Retour</span>
              </button>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-[#dd7109]">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Événements du projet</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, type ou adresse..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#dd7109] focus:border-[#dd7109] sm:text-sm transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Rechercher des événements"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <label htmlFor="eventTypeFilter" className="sr-only">Filtrer par type d&apos;événement</label>
              <select
                id="eventTypeFilter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#dd7109] focus:border-[#dd7109] transition"
                aria-label="Filtrer par type d&apos;événement"
              >
                <option value="all">Tous les types</option>
                <option value="réunion">Réunions</option>
                <option value="visite">Visites</option>
                <option value="formation">Formations</option>
                <option value="présentation">Présentations</option>
              </select>
            </div>
            
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  viewMode === 'cards' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Afficher en mode cartes"
              >
                Cartes
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Afficher en mode tableau"
              >
                Tableau
              </button>
            </div>
          </div>
        </div>

        {/* Events Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-[#dd7109] mb-4"></div>
              <p className="text-gray-500 text-sm">Chargement des événements...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 rounded-lg p-6 text-center">
              <XCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">Erreur de chargement</h3>
              <p className="text-red-700">{error}</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Aucun événement ne correspond à votre recherche.
              </p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredEvents.map((ev: ProjectEvent) => (
                  <div key={ev.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(ev.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ev.typeColor || 'bg-gray-100 text-gray-800'}`}>
                          {ev.type}
                        </span>
                      </div>
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Options pour ${ev.name}`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#dd7109] transition-colors">
                      {ev.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{ev.description || 'Aucune description disponible'}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{ev.start} • {ev.startTime || '--:--'} - {ev.endTime || '--:--'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{ev.address}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{ev.attendees || 0} participants</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                      <span className="text-xs font-medium text-gray-500">
                        {ev.status === 'confirmed' ? 'Confirmé' : 
                         ev.status === 'pending' ? 'En attente' : 'Brouillon'}
                      </span>
                      <button 
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={`Voir les détails de ${ev.name}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Événement</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Heure</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lieu</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEvents.map((ev: ProjectEvent) => (
                      <tr key={ev.id} className="hover:bg-[#fef7f0] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 bg-[#dd7109] rounded-lg flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-[#dd7109] transition-colors">
                                {ev.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {ev.description || 'Aucune description disponible'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{ev.start}</div>
                          <div className="text-sm text-gray-500">{ev.startTime || '--:--'} - {ev.endTime || '--:--'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${ev.typeColor || 'bg-gray-100 text-gray-800'}`}>
                            {ev.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-900">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="truncate max-w-xs">{ev.address}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{ev.attendees || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(ev.status)}
                            <span className="ml-2 text-xs font-medium text-gray-600">
                              {ev.status === 'confirmed' ? 'Confirmé' : 
                               ev.status === 'pending' ? 'En attente' : 'Brouillon'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            aria-label={`Voir les détails de ${ev.name}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button 
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    aria-label="Page précédente"
                  >
                    Précédent
                  </button>
                  <button 
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    aria-label="Page suivante"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredEvents.length}</span> sur <span className="font-medium">{events.length}</span> événements
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        disabled
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-400 hover:bg-gray-50"
                        aria-label="Page précédente"
                      >
                        <span className="sr-only">Précédent</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        aria-current="page"
                        className="z-10 bg-[#dd7109] border-[#dd7109] text-white relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                        aria-label="Page 1"
                      >
                        1
                      </button>
                      <button
                        disabled
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-400 hover:bg-gray-50"
                        aria-label="Page suivante"
                      >
                        <span className="sr-only">Suivant</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}