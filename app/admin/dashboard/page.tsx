"use client";

import { useState } from "react";
import { Users, FileText, Search, MapPin } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import Link from "next/link";
import Image from "next/image";

interface Broker {
  id: string;
  name: string;
  company: string;
  email: string;
  region: string;
  avatar: string;
  stats: {
    activeProjects: number;
    totalArtisans: number;
    totalAmount: number;
    pendingAmount: number;
    validatedAmount: number;
  };
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  
  const [brokers] = useState<Broker[]>([
    {
      id: "1",
      name: "Jean Dupont",
      company: "Courtage Pro",
      email: "jean.dupont@courtagepro.fr",
      region: "Île-de-France",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
      stats: {
        activeProjects: 12,
        totalArtisans: 8,
        totalAmount: 150000,
        pendingAmount: 45000,
        validatedAmount: 105000
      }
    },
    {
      id: "2",
      name: "Marie Martin",
      company: "Habitat Solutions",
      email: "m.martin@habitat-solutions.fr",
      region: "Nouvelle-Aquitaine",
      avatar: "https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg",
      stats: {
        activeProjects: 15,
        totalArtisans: 10,
        totalAmount: 180000,
        pendingAmount: 60000,
        validatedAmount: 120000
      }
    },
    {
      id: "3",
      name: "Pierre Dubois",
      company: "Dubois Immobilier",
      email: "p.dubois@dubois-immo.fr",
      region: "Auvergne-Rhône-Alpes",
      avatar: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg",
      stats: {
        activeProjects: 8,
        totalArtisans: 6,
        totalAmount: 120000,
        pendingAmount: 35000,
        validatedAmount: 85000
      }
    }
  ]);

  const regions = Array.from(new Set(brokers.map(broker => broker.region))).sort();

  const filteredBrokers = brokers.filter(broker => {
    const matchesSearch = 
      broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      broker.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      broker.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = !regionFilter || broker.region === regionFilter;
    
    return matchesSearch && matchesRegion;
  });

  const globalStats = {
    totalBrokers: brokers.length,
    totalProjects: brokers.reduce((acc, broker) => acc + broker.stats.activeProjects, 0),
    totalArtisans: brokers.reduce((acc, broker) => acc + broker.stats.totalArtisans, 0),
    totalAmount: brokers.reduce((acc, broker) => acc + broker.stats.totalAmount, 0),
    pendingAmount: brokers.reduce((acc, broker) => acc + broker.stats.pendingAmount, 0),
    validatedAmount: brokers.reduce((acc, broker) => acc + broker.stats.validatedAmount, 0)
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord administrateur</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Courtiers actifs"
          value={globalStats.totalBrokers.toString()}
          icon={<Users size={24} />}
          trend={{ value: 10, isPositive: true }}
        />
        <StatCard
          title="Projets en cours"
          value={globalStats.totalProjects.toString()}
          icon={<FileText size={24} />}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Artisans actifs"
          value={globalStats.totalArtisans.toString()}
          icon={<Users size={24} />}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-medium text-gray-900">Liste des courtiers</h2>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un courtier..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent"
                />
              </div>
              
              <div className="relative flex-1 sm:w-48">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f21515] focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Toutes les régions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courtier
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Région
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projets actifs
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant total
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider">
                    Acomptes validés
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-amber-600 uppercase tracking-wider">
                    Acomptes en attente
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBrokers.map((broker) => (
                  <tr key={broker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative h-10 w-10 flex-shrink-0">
                          <Image
                            src={broker.avatar}
                            alt={broker.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{broker.name}</div>
                          <div className="text-sm text-gray-500">{broker.email}</div>
                          <div className="text-sm text-gray-500">{broker.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{broker.region}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{broker.stats.activeProjects}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {broker.stats.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-green-600">
                        {broker.stats.validatedAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-amber-600">
                        {broker.stats.pendingAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/brokers/${broker.id}`}
                        className="text-[#f21515] hover:text-[#f21515]/80"
                      >
                        Voir les projets
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}