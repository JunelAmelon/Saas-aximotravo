import { useCallback, useEffect, useState } from 'react';
import { getProjectsByArtisan } from '../lib/firebase/projects';
import { getAllArtisans } from '../lib/firebase/users';
import { Activity, getRecentActivitiesByCourtier } from '../lib/firebase/activities';
import { User as FirebaseUser } from 'firebase/auth';
import { getDocument } from '../lib/firebase/firestore';
import { queryDocuments } from '../lib/firebase/firestore';
import { Event } from '../lib/models/Event';
import { useAuth } from '@/lib/contexts/AuthContext';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingProjects: number;
}

interface UseArtisanDashboardResult {
  loading: boolean;
  error: string | null;
  projects: any[];
  recentsProjects: any[];
  appointments: Event[];
  clients: any[];
  activities: Activity[];
  stats: DashboardStats;
  refresh: () => Promise<void>;
}

export function useArtisanDashboard(): UseArtisanDashboardResult {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Event[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentsProjects, setRecentsProjects] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingProjects: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch projects assigned to the artisan (via artisan_projet)
      const projectsData = await queryDocuments(
        'artisan_projet',
        [{ field: 'artisanId', operator: '==', value: currentUser.uid }],
        []
      );
      // Correction : filtrer les invitations valides et utiliser le bon champ pour l'ID projet
      const validInvitations = projectsData.filter(
        (inv: any) => inv.projetId && ['accepté', 'pending'].includes(inv.status)
      );
      const projects = await Promise.all(
        validInvitations.map(async (inv: any) => {
          const projectData = await getDocument('projects', inv.projetId);
          return projectData;
        })
      );
      console.log(projectsData);
      // Enrichir chaque projet avec les infos client pour l'affichage
      const formattedProjects = await Promise.all(
        projects.filter(Boolean).map(async (project: any) => {
          let clientName = '';
          if (project.client_id) {
            const client = await getDocument('users', project.client_id);
            if (client) {
              const c = client as any;
              const firstName = c.firstName || '';
              const lastName = c.lastName || '';
              if (firstName || lastName) {
                clientName = `${firstName} ${lastName}`.trim();
              } else if (c.email) {
                clientName = c.email;
              }
            }
          }
          return {
            id: project.id,
            name: project.name,
            client: clientName,
            status: project.status,
            deadline: project.estimatedEndDate || 'Non défini',
            amoIncluded: project.amoIncluded || false,
          };
        })
      );
      setProjects(formattedProjects);
      console.log(formattedProjects);
      // Générer la liste des projets récents (acceptés, triés par acceptedAt)
      const recents = (await Promise.all(
        projectsData
          .filter((inv: any) => inv.projetId && inv.status === 'accepté' && inv.acceptedAt)
          .map(async (inv: any) => {
            const project = await getDocument('projects', inv.projetId);
            if (!project) return null;
            return {
              ...project,
              id: inv.projetId,
              acceptedAt: inv.acceptedAt,
            };
          })
      ))
        .filter(Boolean)
        .sort((a: any, b: any) => {
          const dateA = a.acceptedAt?.toDate ? a.acceptedAt.toDate() : new Date(a.acceptedAt);
          const dateB = b.acceptedAt?.toDate ? b.acceptedAt.toDate() : new Date(b.acceptedAt);
          return dateB.getTime() - dateA.getTime();
        });
      setRecentsProjects(recents);

      // 2. Fetch appointments/events where artisan is a participant
      // (Assume Event model and queryDocuments util)
      // Récupérer les rendez-vous à venir (start > maintenant) pour l'artisan
      const now = new Date();
      // On récupère les rendez-vous des projets de l'artisan
      const projectIds = formattedProjects.map((p: any) => p.id);
      let allAppointments: Event[] = [];
      for (const projectId of projectIds) {
        const projectEvents = await queryDocuments(
          'events',
          [{ field: 'projectId', operator: '==', value: projectId }],
          []
        );
        allAppointments = allAppointments.concat(projectEvents as Event[]);
      }
      // Filtrer pour ne garder que les rendez-vous à venir
      const upcomingAppointments = allAppointments
        .filter(ev => ev.end && new Date(ev.end) >= now)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      setAppointments(upcomingAppointments);
      console.log("upcomingAppointments", allAppointments);

      // 3. Fetch clients for the artisan's projects
      const clientIds = Array.from(
        new Set(projectsData.map((p: any) => p.client_id).filter(Boolean))
      );
      const clientsData = await Promise.all(
        clientIds.map((cid) => getDocument('users', cid))
      );
      setClients(clientsData.filter(Boolean));

      // 4. Fetch recent activities for the artisan's projects
      // We'll fetch activities where projectId in artisan's projects
      // (If needed, can optimize with a custom backend/Cloud Function)
      let activitiesArr: Activity[] = [];
      for (const project of projectsData) {
        try {
          const acts = await queryDocuments(
            'activities',
            [{ field: 'projectId', operator: '==', value: project.id }],
            [{ field: 'createdAt', direction: 'desc' }],
            5
          );
          activitiesArr = activitiesArr.concat(acts as Activity[]);
        } catch {}
      }
      setActivities(activitiesArr.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));

      // 5. Compute stats
      const totalProjects = formattedProjects.length;
      const activeProjects = formattedProjects.filter((p: any) => p.status === 'En cours').length;
      const completedProjects = formattedProjects.filter((p: any) => p.status === 'Terminé').length;
      const pendingProjects = formattedProjects.filter((p: any) => p.status === 'En attente').length;
      setStats({ totalProjects, activeProjects, completedProjects, pendingProjects });
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    loading,
    error,
    projects,
    recentsProjects,
    appointments,
    clients,
    activities,
    stats,
    refresh: fetchDashboardData,
  };
}
