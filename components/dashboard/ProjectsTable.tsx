import { Building, Check, Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BadgeAmo } from "@/components/BadgeAmo";

interface Project {
  id: string;
  name: string;
  client: string;
  status: "En cours" | "Terminé" | "En attente";
  deadline: Date;
  amoIncluded: boolean;
}

interface ProjectsTableProps {
  projects: Project[];
}

export default function ProjectsTable({ projects }: ProjectsTableProps) {
  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "En cours":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock size={12} className="mr-1" />
            En cours
          </span>
        );
      case "Terminé":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check size={12} className="mr-1" />
            Terminé
          </span>
        );
      case "En attente":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock size={12} className="mr-1" />
            En attente
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 hidden md:table-header-group">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Projet
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Échéance
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50 flex flex-col md:table-row p-4 md:p-0 border-b md:border-none">
              {/* Projet - Toujours visible */}
              <td className="px-0 md:px-6 py-2 md:py-4 md:whitespace-nowrap">
                <div className="md:hidden text-xs font-bold text-gray-500 uppercase mb-1">Projet</div>
                <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  {project.name}
                  {project?.amoIncluded && <BadgeAmo />}
                </div>
              </td>
              
              {/* Client */}
              <td className="px-0 md:px-6 py-2 md:py-4 md:whitespace-nowrap">
                <div className="md:hidden text-xs font-bold text-gray-500 uppercase mb-1">Client</div>
                <div className="flex items-center">
                  <Building size={16} className="mr-2 text-gray-400" />
                  <div className="text-sm font-medium text-gray-500">{project.client}</div>
                </div>
              </td>
              
              {/* Statut */}
              <td className="px-0 md:px-6 py-2 md:py-4 md:whitespace-nowrap">
                <div className="md:hidden text-xs font-bold text-gray-500 uppercase mb-1">Statut</div>
                {getStatusBadge(project.status)}
              </td>
              
              {/* Échéance */}
              <td className="px-0 md:px-6 py-2 md:py-4 md:whitespace-nowrap">
                <div className="md:hidden text-xs font-bold text-gray-500 uppercase mb-1">Échéance</div>
                <div className="text-sm font-medium text-gray-500">{project.deadline ? new Date(project.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non renseignée'}</div>
              </td>
              {/* Action */}
              <td className="px-0 md:px-6 py-2 md:py-4 md:whitespace-nowrap">
                <div className="md:hidden text-xs font-bold text-gray-500 uppercase mb-1">Action</div>
                <Link
                  href={`/artisan/projects/${project.id}`}
                  className="text-[#f21515] hover:text-[#f21515]/80 font-bold flex items-center"
                >
                  Voir <ArrowUpRight size={14} className="ml-1" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}