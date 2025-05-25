'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from 'next/navigation';
import { ChevronLeft, Calendar, FileText, Camera, FileSpreadsheet, FileBox, Scale, Crown, User, Eye, Download, Phone, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProjectDetails {
  id: string;
  name: string;
  client: {
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    image: string;
  };
  status: string;
  amount: number;
  date: string;
  image: string;
  startDate?: string;
  endDate?: string;
  actors: {
    pilote: {
      name: string;
      role: string;
    };
    pro: {
      name: string | null;
      role: string;
      accepted: boolean;
    };
  };
  quotes: {
    id: string;
    title: string;
    type: string;
    version: string;
    date: string;
    amount: number;
    status: "envoyée" | "en_cours";
    content?: string;
  }[];
}

export default function ProjectDetails({ id }: { id: string }) {
  const params = useParams();
  const [selectedQuote, setSelectedQuote] = useState<ProjectDetails["quotes"][0] | null>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  
  const [project, setProject] = useState<ProjectDetails>({
    id: id,
    name: "Projet Découverte",
    client: {
      name: "Jean Dupont",
      company: "LEROY MERLIN BIGANOS",
      email: "jean.dupont@email.com",
      phone: "+33 6 12 34 56 78",
      address: "12 Avenue des Champs-Élysées, 75008 Paris",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
    },
    status: "ADMINISTRATION/TEST",
    amount: 4079.27,
    date: "27/09/2021",
    image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
    startDate: "2024-02-15",
    endDate: "2024-03-15",
    actors: {
      pilote: {
        name: "John Mazu",
        role: "Pilote"
      },
      pro: {
        name: null,
        role: "Artisan",
        accepted: false
      }
    },
    quotes: [
      {
        id: "1",
        title: "Forfait Cuisine Regions",
        type: "Devis",
        version: "1",
        date: "16/02/22",
        amount: 734.25,
        status: "envoyée",
        content: "Détails du devis Forfait Cuisine Regions..."
      },
      {
        id: "2",
        title: "Cuisine meubles - [surface < 5 m²]_2",
        type: "Devis",
        version: "2",
        date: "10/02/22",
        amount: 3345.02,
        status: "en_cours",
        content: "Détails du devis Cuisine meubles..."
      }
    ]
  });

  const handleAcceptInvitation = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProject(prev => ({
        ...prev,
        actors: {
          ...prev.actors,
          pro: {
            ...prev.actors.pro,
            accepted: true
          }
        }
      }));
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const tabs = [
    { id: "notes", icon: FileText, label: "Notes", count: 1 },
    { id: "events", icon: Calendar, label: "Événements", count: 1 },
    { id: "photos", icon: Camera, label: "Photos RT, chantier, etc", count: 1 },
    { id: "plans", icon: FileSpreadsheet, label: "Plans", count: 1 },
    { id: "documents", icon: FileBox, label: "Documents" },
    { id: "accounting", icon: Scale, label: "Mes acomptes" }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/artisan/projects"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Link>
          <h1 className="text-xl font-medium text-gray-900">Détails du projet</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative w-[100px] h-[100px] flex-shrink-0">
              <Image
                src={project.image}
                alt={project.name}
                fill
                className="object-cover rounded-full border-2 border-white shadow"
              />
              <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                {project.date}
              </p>
            </div>

            <div className="flex-1 w-full md:w-auto">
              <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-medium text-gray-900">{project.name}</h2>
                  <p className="text-sm text-gray-600">{project.client.company}</p>
                </div>
                <span className="inline-flex px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  {project.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Montant prospecté</p>
                <p className="text-xl font-semibold">
                  {project.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="inline-flex items-center px-2.5 py-1 bg-emerald-500 text-white rounded text-xs font-medium hover:bg-emerald-600 transition-colors">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(project.startDate!).toLocaleDateString('fr-FR')}
                </button>
                <button className="inline-flex items-center px-2.5 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition-colors">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(project.endDate!).toLocaleDateString('fr-FR')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={`/artisan/projects/${id}/${tab.id}`}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                  params.tab === tab.id
                    ? 'border-[#f26755] text-[#f26755]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {tab.count && (
                  <span className={cn(
                    "px-2 py-0.5 text-xs rounded-full",
                    params.tab === tab.id
                      ? "bg-[#f26755] text-white"
                      : "bg-gray-100 text-gray-600"
                  )}>
                    {tab.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-sm h-full border border-gray-100">
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-lg font-medium mb-6 text-[#f26755]">Informations client</h3>
              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#f26755] ring-offset-2">
                    <Image
                      src={project.client.image}
                      alt={project.client.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{project.client.name}</h4>
                    <p className="text-sm text-[#f26755]">{project.client.company}</p>
                  </div>
                </div>
                
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 rounded-full bg-[#f26755]/10 group-hover:bg-[#f26755]/20 transition-colors">
                      <Phone className="h-5 w-5 text-[#f26755]" />
                    </div>
                    <span className="text-sm text-gray-600">{project.client.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 rounded-full bg-[#f26755]/10 group-hover:bg-[#f26755]/20 transition-colors">
                      <Mail className="h-5 w-5 text-[#f26755]" />
                    </div>
                    <span className="text-sm text-gray-600">{project.client.email}</span>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <div className="p-2 rounded-full bg-[#f26755]/10 group-hover:bg-[#f26755]/20 transition-colors">
                      <MapPin className="h-5 w-5 text-[#f26755]" />
                    </div>
                    <span className="text-sm text-gray-600">{project.client.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow-sm h-full border border-gray-100">
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-lg font-medium mb-6 text-[#f26755]">Acteurs du projet</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="text-sm font-medium mb-4 flex items-center text-gray-900">
                    Pilote
                    <span className="ml-2 p-2 rounded-full bg-[#f26755]/10">
                      <User className="h-4 w-4 text-[#f26755]" />
                    </span>
                  </h4>
                  <div className="bg-white p-4 rounded-md border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{project.actors.pilote.name}</span>
                      <div className="p-1.5 rounded-full bg-yellow-100">
                        <Crown className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="text-sm font-medium mb-4 flex items-center text-gray-900">
                    Pro
                    <span className="ml-2 p-2 rounded-full bg-[#f26755]/10">
                      <User className="h-4 w-4 text-[#f26755]" />
                    </span>
                  </h4>
                  <div className="bg-white p-4 rounded-md border border-gray-100">
                    {project.actors.pro.accepted ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{project.actors.pro.name}</span>
                        <div className="p-1.5 rounded-full bg-green-100">
                          <Crown className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Invitation en attente</span>
                        </div>
                        <button
                          onClick={handleAcceptInvitation}
                          className="w-full px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors"
                        >
                          Accepter l'invitation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-medium">Devis</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-gray-500">Afficher</span>
              <select className="border rounded px-2 py-1 text-sm">
                <option>5</option>
                <option>10</option>
                <option>20</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Titre</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Version</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Historique</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Prix TTC</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {project.quotes.map((quote) => (
                <tr key={quote.id} className="border-b last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{quote.title}</span>
                      {quote.status === "envoyée" && (
                        <span className="mt-1 inline-flex w-fit px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          ENVOYÉE
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{quote.type}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{quote.version}</td>
                  <td className="py-3 px-4">
                    <div className="text-xs text-gray-500">
                      <div>Mise à jour le {quote.date}</div>
                      <div>Créé par Junel</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-medium">
                    {quote.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </td>
                  <td className="py-3 px-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-gray-400 hover:text-gray-600">
                        •••
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                          setSelectedQuote(quote);
                          setIsQuoteDialogOpen(true);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualiser le devis
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger le devis
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="max-w-3xl">
          <div className="p-6">
            <h2 className="text-xl font-medium mb-4">{selectedQuote?.title}</h2>
            <div className="prose max-w-none">
              <p>{selectedQuote?.content}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}