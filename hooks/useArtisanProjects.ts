import { useEffect, useState } from 'react';
import { getDocument, queryDocuments } from '../lib/firebase/firestore';
import { useAuth } from '@/lib/contexts/AuthContext';

export interface ArtisanProject {
  id: string;
  name: string;
  client: string;
  status: string;
  deadline: string;
  location: string;
  amoIncluded?: boolean;
}

export function useArtisanProjects() {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<ArtisanProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      if (!currentUser) return;
      setLoading(true);
      setError(null);
      try {
        // 1. Récupérer les invitations artisan_projet
        const invitations = await queryDocuments(
          'artisan_projet',
          [
            { field: 'artisanId', operator: '==', value: currentUser.uid },
            { field: 'status', operator: 'in', value: ['accepté', 'pending'] }
          ]
        );
        // 2. Récupérer les projets liés
        const projects = await Promise.all(
          invitations
            .filter((inv: any) => inv.projetId)
            .map(async (inv: any) => {
              const project = await getDocument('projects', inv.projetId);
              if (!project) return null;
              // Enrichir avec info client
              let clientName = '';
              const p = project as any;
              if (p.client_id) {
                const client = await getDocument('users', p.client_id);
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
                id: p.id,
                name: p.name,
                client: clientName,
                status: p.status,
                deadline: p.estimatedEndDate || 'Non défini',
                budget: p.budget,
                image: p.image,
                location: p.location,
                amoIncluded: p.amoIncluded ?? false,
              } as ArtisanProject;
            })
        );
        setProjects((projects.filter((p): p is ArtisanProject => !!p)));
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des projets');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [currentUser]);

  return { projects, loading, error };
}
