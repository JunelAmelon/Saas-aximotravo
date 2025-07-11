"use client";

import { useState, useEffect } from "react";
import { Search, Wallet, Folder, CheckCircle, Clock, ChevronLeft, ChevronRight, Download, ArrowUpDown } from "lucide-react";
import Image from "next/image";
import { collection, getDocs, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface QontoTransaction {
  id: string;
  amount: number;
  date: string;
  senderName: string;
  projectId: string;
  projectName: string;
  broker: {
    name: string;
    company: string;
    avatar: string;
  };
  artisan: {
    name: string;
    company: string;
    avatar: string;
  };
  status: "completed" | "pending" | "failed";
  reference: string;
}

interface DashboardStats {
  totalBalance: number;
  last30Days: number;
  pendingTransactions: number;
  completedProjects: number;
}

export default function QontoDashboard() {
  const [transactions, setTransactions] = useState<QontoTransaction[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof QontoTransaction; direction: 'asc' | 'desc' }>({ 
    key: 'date', 
    direction: 'desc' 
  });
  
  const transactionsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Qonto transactions
        const q = query(
          collection(db, "qontoTransactions"),
          orderBy(sortConfig.key, sortConfig.direction)
        );
        
        const querySnapshot = await getDocs(q);
        const transactionsData = await Promise.all(
          querySnapshot.docs.map(async (snapshot) => {
            const data = snapshot.data();

            // Get project details
            const projectRef = doc(db, "projects", data.projectId);
            const projectDoc = await getDoc(projectRef);
            const projectData = projectDoc.exists() ? projectDoc.data() : {};

            // Get broker and artisan details
            const brokerId = projectData?.brokerId || '';
            const artisanId = projectData?.artisanId || '';
            const [brokerDoc, artisanDoc] = await Promise.all([
              brokerId ? getDoc(doc(db, "users", brokerId)) : null,
              artisanId ? getDoc(doc(db, "users", artisanId)) : null,
            ]);
            const brokerData = brokerDoc?.exists() ? brokerDoc.data() : {};
            const artisanData = artisanDoc?.exists() ? artisanDoc.data() : {};

            return {
              id: snapshot.id,
              amount: data.amount,
              date: data.date?.toDate().toISOString() ?? "",
              senderName: data.senderName,
              projectId: data.projectId,
              projectName: projectData?.name || "Projet inconnu",
              broker: {
                name: brokerData?.name || "Courtier inconnu",
                company: brokerData?.company || "",
                avatar: brokerData?.avatar || "/default-avatar.png"
              },
              artisan: {
                name: artisanData?.name || "Artisan inconnu",
                company: artisanData?.company || "",
                avatar: artisanData?.avatar || "/default-avatar.png"
              },
              status: data.status,
              reference: data.reference
            };
          })
        );
        
        setTransactions(transactionsData);
        
        // 2. Calculate stats
        const completedTransactions = transactionsData.filter(t => t.status === 'completed');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        setStats({
          totalBalance: completedTransactions.reduce((sum, t) => sum + t.amount, 0),
          last30Days: completedTransactions
            .filter(t => new Date(t.date) > thirtyDaysAgo)
            .reduce((sum, t) => sum + t.amount, 0),
          pendingTransactions: transactionsData.filter(t => t.status === 'pending').length,
          completedProjects: new Set(completedTransactions.map(t => t.projectId)).size
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sortConfig]);

  const handleSort = (key: keyof QontoTransaction) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.senderName.toLowerCase().includes(searchLower) ||
      transaction.projectName.toLowerCase().includes(searchLower) ||
      transaction.broker.name.toLowerCase().includes(searchLower) ||
      transaction.artisan.name.toLowerCase().includes(searchLower) ||
      transaction.reference.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * transactionsPerPage,
    currentPage * transactionsPerPage
  );

  const statusMap = {
    completed: { color: 'bg-green-100 text-green-800', label: 'Complété' },
    pending: { color: 'bg-amber-100 text-amber-800', label: 'En attente' },
    failed: { color: 'bg-red-100 text-red-800', label: 'Échoué' }
  } as const;
  type StatusKey = keyof typeof statusMap;
  const StatusBadge = ({ status }: { status: StatusKey }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[status].color}`}>
      {statusMap[status].label}
    </span>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f26755]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Qonto</h1>
          <p className="text-sm text-gray-500">Suivi des transactions financières</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#f26755] text-white rounded-lg hover:bg-[#f26755]/90 transition-colors">
          <Download className="h-4 w-4" />
          Exporter les données
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Solde Total" 
            value={stats.totalBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            icon={<Wallet className="h-5 w-5 text-[#f26755]" />}
            trend="up"
          />
          <StatCard 
            title="30 derniers jours" 
            value={stats.last30Days.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            icon={<Wallet className="h-5 w-5 text-blue-500" />}
          />
          <StatCard 
            title="Transactions en attente" 
            value={stats.pendingTransactions.toString()}
            icon={<Clock className="h-5 w-5 text-amber-500" />}
          />
          <StatCard 
            title="Projets financés" 
            value={stats.completedProjects.toString()}
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          />
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une transaction, client, projet..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projet
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courtier
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end">
                    Montant
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.senderName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">
                        {transaction.reference}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {transaction.projectName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <Image
                            className="h-8 w-8 rounded-full"
                            src={transaction.broker.avatar}
                            alt={transaction.broker.name}
                            width={32}
                            height={32}
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.broker.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.broker.company}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={transaction.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune transaction trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedTransactions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Affichage de <span className="font-medium">{(currentPage - 1) * transactionsPerPage + 1}</span> à{' '}
                <span className="font-medium">
                  {Math.min(currentPage * transactionsPerPage, filteredTransactions.length)}
                </span>{' '}
                sur <span className="font-medium">{filteredTransactions.length}</span> transactions
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentPage === i + 1
                          ? 'bg-[#f26755] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// StatCard Component
const StatCard = ({ 
  title, 
  value, 
  icon,
  trend 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode;
  trend?: 'up' | 'down'; 
}) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      </div>
      <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-green-100 text-green-600' : trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
        {icon}
      </div>
    </div>
  </div>
);