"use client";

import { useState, useEffect } from "react";
import { Users, FileText, Search, MapPin } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

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
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        // Créer une query pour récupérer uniquement les utilisateurs avec rôle "courtier"
        const q = query(collection(db, "users"), where("role", "==", "courtier"));
        const querySnapshot = await getDocs(q);
        const brokersData: Broker[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          brokersData.push({
            id: doc.id,
            name: data.name || `${data.firstName} ${data.lastName}` || "Nom inconnu",
            company: data.company || "Société non spécifiée",
            email: data.email || "Email non spécifié",
            region: data.region || "Région non spécifiée",
            avatar: data.image || "/default-avatar.png",
            stats: {
              activeProjects: data.activeProjects || 0,
              totalArtisans: data.totalArtisans || 0,
              totalAmount: data.totalAmount || 0,
              pendingAmount: data.pendingAmount || 0,
              validatedAmount: data.validatedAmount || 0,
            },
          });
        });

        setBrokers(brokersData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching brokers: ", err);
        setError("Failed to load brokers data");
        setLoading(false);
      }
    };

    fetchBrokers();
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f21515]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (brokers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">Aucun courtier trouvé</p>
      </div>
    );
  }

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
                            width={40}
                            height={40}
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