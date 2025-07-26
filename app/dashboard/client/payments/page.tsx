"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Download, FileText, ChevronRight, Calendar, ArrowUpRight, CreditCard, CheckCircle, Clock, XCircle, Plus } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { getAllClientPayments } from "@/hooks/payments";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import PaymentModal from '@/components/PaymentModal';
import PaymentDetailsModal from '@/components/PaymentDetailsModal';

export default function PaymentTracking() {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    project: "",
    amount: "",
    method: "virement bancaire"
  });
  // Nouveaux états pour menu contextuel et modals
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const paymentsPerPage = 5;
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.uid) return;
      setLoadingPayments(true);
      try {
        const data = await getAllClientPayments(user.uid);
        setPayments(data);
      } catch (e) {
        setPayments([]);
      }
      setLoadingPayments(false);
    };
    if (user?.uid) fetchPayments();
  }, [user?.uid]);

    // Stats dynamiques paiements
  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const completedAmount = payments.filter(p => p.status === "validé").reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingAmount = payments.filter(p => p.status === "en_attente").reduce((sum, p) => sum + (p.amount || 0), 0);

  const stats = [
    {
      title: "Total des paiements",
      value: totalAmount.toLocaleString("fr-FR") + " €",
      icon: <CreditCard className="w-6 h-6 text-[#dd7109]" />,
      color: "bg-orange-50 text-[#dd7109]"
    },
    {
      title: "Paiements complétés",
      value: completedAmount.toLocaleString("fr-FR") + " €",
      icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
      color: "bg-emerald-50 text-emerald-700"
    },
    {
      title: "En attente",
      value: pendingAmount.toLocaleString("fr-FR") + " €",
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      color: "bg-amber-50 text-amber-700"
    }
  ];

  const handleExport = () => {
    const data = payments.map(payment => ({
      ...payment,
      date: new Date(payment.date).toLocaleDateString(),
      amount: `${payment.amount.toLocaleString()} €`
    }));
    
    console.log("Exporting payment data:", data);
    alert("Export des paiements en cours...");
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
  (payment.project?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
  (payment.title?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "validé") return matchesSearch && payment.status === "validé";
    if (activeFilter === "en_attente") return matchesSearch && payment.status === "en_attente";
    if (activeFilter === "tout") {
      return matchesSearch;
    }
    return matchesSearch;
  });

  // Pagination logic
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "validé":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "en_attente":
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch(method) {
      case "virement bancaire":
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-[#dd7109]" />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header avec bandeau coloré */}
      <div className="bg-gradient-to-r from-[#dd7109] to-amber-600 px-6 py-8 rounded-b-2xl shadow-md bg-opacity-90">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-white">
              <h1 className="text-2xl font-bold">Suivi des Paiements</h1>
              <p className="text-amber-100 mt-1">Gérez les paiements associés à vos projets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-5 rounded-xl shadow-sm border border-gray-100/50 hover:shadow-md transition-all ${stat.color}`}
            >
              <div className="flex-shrink-0">
                {stat.icon}
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recherche et filtres */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100/50 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par projet, référence ou facture..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#dd7109] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setActiveFilter("tout")}
                  className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                    activeFilter === "tout" 
                      ? 'bg-[#dd7109] text-white shadow-xs' 
                      : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Tous
                </button>
                <button 
                  onClick={() => setActiveFilter("validé")}
                  className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                    activeFilter === "validé" 
                      ? 'bg-[#dd7109] text-white shadow-xs' 
                      : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Complété
                </button>
                <button 
                  onClick={() => setActiveFilter("en_attente")}
                  className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                    activeFilter === "en_attente" 
                      ? 'bg-[#dd7109] text-white shadow-xs' 
                      : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  En attente
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100/50">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
                  <select className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#dd7109] focus:border-transparent transition-all">
                    <option>Toutes</option>
                    <option>Cette semaine</option>
                    <option>Ce mois</option>
                    <option>Ce trimestre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Montant</label>
                  <select className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#dd7109] focus:border-transparent transition-all">
                    <option>Tous</option>
                    <option>0 - 5 000 €</option>
                    <option>5 000 - 15 000 €</option>
                    <option>15 000+ €</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Liste des paiements */}
        {filteredPayments.length > 0 ? (
  <>
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/50 overflow-x-auto mb-4">
      {/* Table header for md+ */}
      <div className="hidden sm:grid grid-cols-12 bg-gray-50/50 p-4 border-b border-gray-100/50 min-w-[700px]">
        <div className="col-span-3 font-medium text-sm text-gray-500">Projet</div>
        <div className="col-span-2 font-medium text-sm text-gray-500">Montant</div>
        <div className="col-span-2 font-medium text-sm text-gray-500">Méthode</div>
        <div className="col-span-2 font-medium text-sm text-gray-500">Statut</div>
        <div className="col-span-1"></div>
      </div>
      {currentPayments.map((payment) => (
        <div
          key={payment.id}
          className="grid grid-cols-1 sm:grid-cols-12 gap-y-2 sm:gap-0 p-4 border-b border-gray-100/50 hover:bg-gray-50/30 transition-colors items-center min-w-[700px]"
        >
          {/* Projet */}
          <div className="sm:col-span-3">
            <div className="font-medium text-gray-900">{payment.project}</div>
            <div className="text-xs text-[#dd7109] mt-1">{payment.title}</div>
          </div>
          {/* Montant */}
          <div className="sm:col-span-2">
            <span className="block sm:hidden text-xs text-gray-500 mb-0.5">Montant</span>
            <span className="font-medium text-gray-900">{payment.amount.toLocaleString()} €</span>
          </div>
          {/* Méthode */}
          <div className="sm:col-span-2 flex items-center gap-2">
            <span className="block sm:hidden text-xs text-gray-500 mb-0.5">Méthode</span>
            {getMethodIcon("virement bancaire")}
            <span className="text-gray-700">Virement bancaire</span>
          </div>
          {/* Statut */}
          <div className="sm:col-span-2">
            <span className="block sm:hidden text-xs text-gray-500 mb-0.5">Statut</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(payment.status)}
              <span className={`text-sm font-medium ${
                payment.status === "validé" ? "text-emerald-600" :
                payment.status === "en_attente" ? "text-amber-600" :
                "text-red-600"
              }`}>
                {payment.status}
              </span>
              {payment.status === "Rejeté" && (
                <span className="text-xs text-red-500">({payment.rejectionReason})</span>
              )}
            </div>
          </div>
          {/* Menu */}
          <div className="sm:col-span-1 flex justify-end">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-2 rounded-full hover:bg-[#dd7109]/10 transition-colors" aria-label="Menu paiement">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="4" cy="10" r="1.5" fill="#dd7109"/><circle cx="10" cy="10" r="1.5" fill="#dd7109"/><circle cx="16" cy="10" r="1.5" fill="#dd7109"/></svg>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" className="z-50 min-w-[150px] rounded-xl bg-white shadow-xl border border-gray-100 py-2">
                <DropdownMenu.Item asChild>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-900 text-sm"
                    onClick={() => {
                      setSelectedPayment(payment);
                      setShowDetailsModal(true);
                    }}
                  >
                    Voir les détails
                  </button>
                </DropdownMenu.Item>
                {payment.status === "en_attente" && (
                  <DropdownMenu.Item asChild>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-[#dd7109] text-sm"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowPaymentModal(true);
                      }}
                    >
                      Payer
                    </button>
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      ))}
    </div>

            {/* Pagination */}
            <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100/50">
              <div className="text-sm text-gray-500">
                Affichage de {indexOfFirstPayment + 1} à {Math.min(indexOfLastPayment, filteredPayments.length)} sur {filteredPayments.length} paiements
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Précédent
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-lg border ${
                      currentPage === number 
                        ? 'bg-[#dd7109] text-white border-[#dd7109]' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    {number}
                  </button>
                ))}
                
                <button 
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-100/50">
            <div className="mx-auto max-w-md">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-[#dd7109]">Aucun paiement trouvé</h3>
              <p className="mt-1 text-gray-500">
                Essayez de modifier vos critères de recherche ou enregistrez un nouveau paiement.
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Modal de détail */}
      <PaymentDetailsModal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        payment={selectedPayment}
      />
      {/* Modal de paiement */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        payment={selectedPayment}
      />
    </div>
  );
}