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

export type ProjectStatus = 'en_attente' | 'en_cours' | 'terminé';

export interface Project {
  id: string;
  name: string;
  description: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  status: ProjectStatus;
  progress: number;
  deadline?: string;
  budget?: number;
  address?: string;
  city?: string;
  postalCode?: string;
  courtierId: string;
  artisanIds: string[];
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

// Créer un nouveau projet
export async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
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

// Récupérer tous les projets d'un courtier
export async function getProjectsByCourtier(courtierId: string): Promise<Project[]> {
  try {
    const projectsQuery = query(
      collection(db, 'projects'),
      where('courtierId', '==', courtierId),
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
      where('courtierId', '==', courtierId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(projectsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  } catch (error) {
    console.error('Erreur lors de la récupération des projets récents:', error);
    throw error;
  }
}

// Récupérer tous les projets auxquels un artisan est assigné
export async function getProjectsByArtisan(artisanId: string): Promise<Project[]> {
  try {
    const projectsQuery = query(
      collection(db, 'projects'),
      where('artisanIds', 'array-contains', artisanId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(projectsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  } catch (error) {
    console.error('Erreur lors de la récupération des projets de l\'artisan:', error);
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
    const activeProjects = projects.filter(p => p.status === 'en_cours').length;
    const completedProjects = projects.filter(p => p.status === 'terminé').length;
    const pendingProjects = projects.filter(p => p.status === 'en_attente').length;
    
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
