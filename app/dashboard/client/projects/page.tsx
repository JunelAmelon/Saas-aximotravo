"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import { useProjects, seedDevisForProjects } from "@/hooks/project";
import { Building2, Plus, Search, Filter, ArrowUpRight, ChevronRight, Calendar, Users, CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Broker {
  id: number;
  name: string;
  company: string;
  rating: number;
  projectsCount: number;
  specialties: string[];
  image: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  budget: number;
  paidAmount: number;
  startDate: string;
  estimatedEndDate: string;
  status: "En cours" | "En attente" | "Terminé" | "Annulé";
  broker: Broker;
  progress: number;
  type: string;
  location: string;
}

export default function ProjectsPage() {
  // const [seedStatus, setSeedStatus] = useState<string | null>(null);
  // const handleSeed = async () => {
  //   setSeedStatus(null);
  //   const projectIds = [
  //     "4bcAP3SIfu6qiLYqRHZ4",
  //     "SDXu6oZBf0lQO52PPWK0",
  //     "SwT0dX8Pi9Oe6Te2qrMh",
  //     "urn7ZEDROHHeYzriFWmG"
  //   ];
  //   const ok = await seedDevisForProjects(projectIds);
  //   setSeedStatus(ok ? "Devis injectés avec succès !" : "Erreur lors de l'injection des devis.");
  // };

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showBrokerSelectionModal, setShowBrokerSelectionModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    budget: "",
    type: "",
    location: "",
    startDate: "",
    estimatedEndDate: "",
  });

  const { user } = useAuth();
  const { projects, loading, error, fetchProjects, updateProject, injectSampleProjects } = useProjects(user?.uid ?? "");

  useEffect(() => {
    if (user?.uid) fetchProjects();
  }, [user?.uid, fetchProjects]);

  // Calculs dynamiques pour les stats
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalPaid = projects.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const avgProgress = totalBudget > 0 ? Math.round((totalPaid / totalBudget) * 100) : 0;
  const activeProjects = projects.filter(p => p.status === "En cours").length;

  // Filtrage combiné search + filter
  const filteredProjects = projects.filter((project) => {
    // Filtres d'état
    if (activeFilter === "in_progress" && project.status !== "En cours") return false;
    if (activeFilter === "completed" && project.status !== "Terminé") return false;
    if (activeFilter === "pending" && project.status !== "En attente") return false;
    // Barre de recherche (nom ou description)
    const search = searchTerm.toLowerCase();
    if (
      search &&
      !project.name.toLowerCase().includes(search) &&
      !project.description.toLowerCase().includes(search)
    ) {
      return false;
    }
    return true;
  });

  const stats = [
    {
      title: "Projets actifs",
      value: activeProjects.toString(),
      icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
      color: "bg-emerald-50 text-emerald-700"
    },
    {
      title: "Budget total",
      value: totalBudget.toLocaleString() + " €",
      icon: <CreditCard className="w-6 h-6 text-[#dd7109]" />,
      color: "bg-orange-50 text-[#dd7109]"
    },
    {
      title: "Montant versé",
      value: totalPaid.toLocaleString() + " €",
      icon: <ArrowUpRight className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50 text-blue-700"
    },
    {
      title: "Avancement moyen",
      value: avgProgress + "%",
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      color: "bg-amber-50 text-amber-700"
    }
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* {process.env.NODE_ENV === "development" && (
        <div className="mb-4">
          <button onClick={handleSeed} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Injecter des devis de test</button>
          {seedStatus && <div className="mt-2 text-sm text-emerald-600">{seedStatus}</div>}
        </div>
      )} */}
      {/* Bouton d'injection de projets de test (affiché seulement si connecté) */}
      {/* {user && (
        <button
          type="button"
          className="mb-4 bg-emerald-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-emerald-700 transition-colors"
          onClick={async () => {
            await injectSampleProjects(user.uid);
            alert("Projets de test injectés !");
            fetchProjects();
          }}
        >
          Injecter 4 projets de test
        </button>
      )} */}

      {/* Header avec bandeau coloré */}
      <div className="bg-gradient-to-r from-[#dd7109] to-amber-600 px-6 py-8 rounded-b-2xl shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-white">
              <h1 className="text-2xl font-bold">Projets</h1>
              <p className="text-amber-100 mt-1">Gérez vos projets de construction et rénovation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
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

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100/50 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un projet..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#dd7109] focus:border-transparent transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${activeFilter === "all"
                    ? 'bg-[#dd7109] text-white'
                    : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setActiveFilter("in_progress")}
                  className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${activeFilter === "in_progress"
                    ? 'bg-[#dd7109] text-white'
                    : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  En cours
                </button>
                <button
                  onClick={() => setActiveFilter("pending")}
                  className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${activeFilter === "pending"
                    ? 'bg-[#dd7109] text-white'
                    : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  En attente
                </button>
                <button
                  onClick={() => setActiveFilter("completed")}
                  className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${activeFilter === "completed"
                    ? 'bg-[#dd7109] text-white'
                    : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  Terminés
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100/50">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de projet</label>
                  <select className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-2 px-3">
                    <option>Tous</option>
                    <option>Résidentiel</option>
                    <option>Commercial</option>
                    <option>Rénovation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                  <select className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-2 px-3">
                    <option>Tous</option>
                    <option>{"< 100 000 €"}</option>
                    <option>100 000 € - 500 000 €</option>
                    <option>{"> 500 000 €"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
                  <select className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-2 px-3">
                    <option>Toutes</option>
                    <option>Paris</option>
                    <option>Lyon</option>
                    <option>Marseille</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100/50 hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Project Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-gray-500 mt-1">{project.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${project.status === "En cours"
                      ? "bg-green-100 text-green-700"
                      : project.status === "En attente"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-700"
                      }`}>
                      {project.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Budget total</p>
                      <p className="text-lg font-semibold text-gray-900">{project.budget.toLocaleString()} €</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Montant versé</p>
                      <p className="text-lg font-semibold text-[#dd7109]">{project.paidAmount.toLocaleString()} €</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date de début</p>
                      <p className="text-lg font-semibold text-gray-900">{new Date(project.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date de fin estimée</p>
                      <p className="text-lg font-semibold text-gray-900">{new Date(project.estimatedEndDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-end mt-4">
                      <Link href={`/dashboard/client/projects/${project.id}`} legacyBehavior>
                        <a className="inline-block bg-[#dd7109] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#b95d0a] transition-colors">
                          Voir plus de détails
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Broker Info */}
                <div className="lg:w-72 flex flex-col justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden mb-3">
                      <Image
                        src={project.broker.image}
                        alt={project.broker.name}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-medium text-gray-900">{project.broker.name}</h4>
                    <p className="text-sm text-gray-500">{project.broker.company}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-amber-500">★</span>
                      <span className="font-medium">{project.broker.rating}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{project.broker.projectsCount} projets</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a
                      href={project.broker.phone ? `tel:${project.broker.phone}` : undefined}
                      className="w-full px-4 py-2 bg-[#dd7109] text-white rounded-lg hover:bg-[#dd7109]/90 transition-colors flex flex-col items-center justify-center"
                      style={{ pointerEvents: project.broker.phone ? 'auto' : 'none', opacity: project.broker.phone ? 1 : 0.6 }}
                    >
                      Contacter
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}