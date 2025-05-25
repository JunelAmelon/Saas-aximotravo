'use client';

import { useState } from 'react';
import { Search, Filter, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Photo {
  id: number;
  url: string;
  title: string;
  date: string;
  category: string;
}

export default function ProjectPhotos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const photos: Photo[] = [
    {
      id: 1,
      url: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg",
      title: "Photo RT - Salle de bain",
      date: "27 sept. 2021",
      category: "Photos RT"
    },
    {
      id: 2,
      url: "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg",
      title: "Photo Chantier - Installation",
      date: "27 sept. 2021",
      category: "Photos Chantier"
    }
  ];

  const categories = ["Photos RT", "Photos Chantier", "Photos SAV"];

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategories = selectedCategories.length === 0 || selectedCategories.includes(photo.category);
    return matchesSearch && matchesCategories;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Médiathèque</h2>
        <button className="inline-flex items-center px-4 py-2 bg-[#f21515] text-white rounded-md text-sm font-medium hover:bg-[#f21515]/90 transition-colors">
          <Upload className="h-4 w-4 mr-2" />
          Ajouter des médias
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-[32rem] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher des médias..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#f21515] focus:border-[#f21515]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <button
              className="w-full sm:w-48 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#f21515] flex items-center justify-between"
            >
              <Filter className="h-4 w-4 mr-2" />
              <span>Filtrer</span>
            </button>
          </div>

          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="group relative bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="relative h-48">
              <Image
                src={photo.url}
                alt={photo.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm">Cliquer pour agrandir</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 truncate">{photo.title}</h3>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">{photo.date}</span>
                <span className="inline-flex px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                  {photo.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedPhoto && (
            <div className="relative aspect-video">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}