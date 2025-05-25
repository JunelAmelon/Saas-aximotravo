"use client";

import { useState } from "react";
import { ChevronLeft, Calendar, Euro, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Project {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
  validatedPayments: number;
  pendingPayments: number;
  artisan: {
    name: string;
    company: string;
    avatar: string;
  } | null;
}

interface Broker {
  id: string;
  name: string;
  company: string;
  email: string;
  avatar: string;
  projects: Project[];
}

export default function BrokerDetails({ params }: { params: { id: string } }) {
  const [broker] = useState<Broker>({
    id: params.id,
    name: "Jean Dupont",
    company: "Courtage Pro",
    email: "jean.dupont@courtagepro.fr",
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
    projects: [
      {
        id: "1",
        name: "Rénovation appartement",
        status: "En cours",
        startDate: "2024-02-15",
        endDate: "2024-03-15",
        amount: 15000,
        validatedPayments: 3000,
        pendingPayments: 2000,
        artisan: {
          name: "Pierre Martin",
          company: "Martin Construction",
          avatar: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg"
        }
      },
      {
        id: "2",
        name: "Installation cuisine",
        status: "Planifié",
        startDate: "2024-03-01",
        endDate: "2024-03-30",
        amount: 25000,
        validatedPayments: 5000,
        pendingPayments: 3000,
        artisan: null
      }
    ]
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Projets du courtier</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={broker.avatar}
              alt={broker.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">{broker.name}</h2>
            <p className="text-gray-500">{broker.company}</p>
            <p className="text-gray-500">{broker.email}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projet
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artisan
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {broker.projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      project.status === "En cours" 
                        ? "bg-[#f26755]/10 text-[#f26755]"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(project.startDate).toLocaleDateString('fr-FR')} au{' '}
                          {new Date(project.endDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {project.artisan ? (
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={project.artisan.avatar}
                            alt={project.artisan.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.artisan.name}</div>
                          <div className="text-sm text-gray-500">{project.artisan.company}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-yellow-800 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Non assigné</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {project.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-green-600">
                      {project.validatedPayments.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                    <div className="mt-1 bg-green-200/50 rounded-full h-1.5">
                      <div 
                        className="bg-green-600 h-1.5 rounded-full" 
                        style={{ width: `${(project.validatedPayments / project.amount) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-amber-600">
                      {project.pendingPayments.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                    <div className="mt-1 bg-yellow-200/50 rounded-full h-1.5">
                      <div 
                        className="bg-yellow-600 h-1.5 rounded-full" 
                        style={{ width: `${(project.pendingPayments / project.amount) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}