import { db } from './config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';

export type ProjectStatus = 'En attente' | 'En cours' | 'Terminé';

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description: string;
  image?: string;
  paidAmount: number;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  status: ProjectStatus;
  progress: number;
  startDate?: string;
  estimatedEndDate?: string;
  budget?: number;
  location?: string;
  city?: string;
  postalCode?: string;
  courtierId: string;
  artisanIds: string[];
  notes?: string;
  createdAt: any;
  updatedAt: any;
  firstDepositPercent: number;
  broker: any;
  amoIncluded?: boolean;
  addressDetails?: string;
}

// Créer un nouveau projet
export async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'artisanIds' | 'courtierId' | 'clientName'>) {
  try {
    const projectRef = collection(db, 'projects');
    const projectWithTimestamp = {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(projectRef, projectWithTimestamp);
    return { id: docRef.id, ...projectWithTimestamp };
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error);
    throw error;
  }
}

// Récupérer un projet par ID
export async function getProjectById(projectId: string): Promise<Project | null> {
  try {
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    if (projectDoc.exists()) {
      return { id: projectDoc.id, ...projectDoc.data() } as Project;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    throw error;
  }
}

// Récupérer tous les projets d'un courtier (via broker.id)
export async function getProjectsByCourtier(courtierId: string): Promise<Project[]> {
  try {
    const projectsQuery = query(
      collection(db, 'projects'),
      where('broker.id', '==', courtierId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(projectsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    throw error;
  }
}

// Récupérer les projets récents d'un courtier (pour le tableau de bord)
export async function getRecentProjectsByCourtier(courtierId: string, limitCount = 5): Promise<Project[]> {
  try {
    const projectsQuery = query(
      collection(db, 'projects'),
      where('broker.id', '==', courtierId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(projectsQuery);
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

    // Enrichir chaque projet avec clientName (firstName + lastName ou email)
    const enrichedProjects = await Promise.all(projects.map(async (project) => {
      let clientName = '';
      if (project.client_id) {
        try {
          // Import dynamique pour éviter import cyclique
          const { getUserById } = await import('./users');
          const clientUser = await getUserById(project.client_id);
          if (clientUser) {
            const firstName = clientUser.firstName || '';
            const lastName = clientUser.lastName || '';
            if (firstName || lastName) {
              clientName = `${firstName} ${lastName}`.trim();
            } else if (clientUser.email) {
              clientName = clientUser.email;
            }
          }
        } catch (e) {
          clientName = '';
        }
      }
      return {
        ...project,
        clientName,
      };
    }));
    return enrichedProjects;
  } catch (error) {
    console.error('Erreur lors de la récupération des projets récents:', error);
    throw error;
  }
}

// Récupérer tous les projets liés à un artisan via la table des invitations artisan_projet
export async function getProjectsByArtisan(artisanId: string): Promise<Project[]> {
  try {
    // 1. Chercher les invitations acceptées ou en attente dans artisan_projet
    const invitationsQuery = query(
      collection(db, 'artisan_projet'),
      where('artisanId', '==', artisanId),
      where('status', 'in', ['accepté', 'pending'])
    );
    const invitationsSnap = await getDocs(invitationsQuery);
    const projetIds = invitationsSnap.docs.map(doc => doc.data().projetId);
    if (!projetIds.length) return [];

    // 2. Récupérer tous les projets correspondants
    const projects: Project[] = [];
    for (const projetId of projetIds) {
      const projectDoc = await getDoc(doc(db, 'projects', projetId));
      if (projectDoc.exists()) {
        projects.push({ id: projectDoc.id, ...projectDoc.data() } as Project);
      }
    }
    // Trier par createdAt desc si possible
    return projects.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch (error) {
    console.error("Erreur lors de la récupération des projets liés à l'artisan:", error);
    throw error;
  }
}


// Mettre à jour un projet
export async function updateProject(projectId: string, projectData: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>) {
  try {
    await updateDoc(doc(db, 'projects', projectId), {
      ...projectData,
      updatedAt: serverTimestamp(),
    });
    return { id: projectId, ...projectData };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error);
    throw error;
  }
}

// Supprimer un projet
export async function deleteProject(projectId: string) {
  try {
    await deleteDoc(doc(db, 'projects', projectId));
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    throw error;
  }
}

// Ajouter un artisan à un projet
export async function addArtisanToProject(projectId: string, artisanId: string) {
  try {
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    if (!projectDoc.exists()) {
      throw new Error('Projet non trouvé');
    }

    const projectData = projectDoc.data() as Project;
    const artisanIds = [...(projectData.artisanIds || [])];
    
    // Vérifier si l'artisan est déjà dans le projet
    if (!artisanIds.includes(artisanId)) {
      artisanIds.push(artisanId);
      
      await updateDoc(doc(db, 'projects', projectId), {
        artisanIds,
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'artisan au projet:', error);
    throw error;
  }
}

// Supprimer un artisan d'un projet
export async function removeArtisanFromProject(projectId: string, artisanId: string) {
  try {
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    if (!projectDoc.exists()) {
      throw new Error('Projet non trouvé');
    }

    const projectData = projectDoc.data() as Project;
    const artisanIds = (projectData.artisanIds || []).filter(id => id !== artisanId);
    
    await updateDoc(doc(db, 'projects', projectId), {
      artisanIds,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'artisan du projet:', error);
    throw error;
  }
}

// Obtenir des statistiques sur les projets d'un courtier
export async function getCourtierProjectStats(courtierId: string) {
  try {
    const projects = await getProjectsByCourtier(courtierId);
    
    // Calculer les statistiques
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'En cours').length;
    const completedProjects = projects.filter(p => p.status === 'Terminé').length;
    const pendingProjects = projects.filter(p => p.status === 'En attente').length;
    
    // Calculer la progression moyenne
    const avgProgress = projects.length > 0
      ? projects.reduce((acc, curr) => acc + curr.progress, 0) / projects.length
      : 0;
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
      avgProgress
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    throw error;
  }
}


