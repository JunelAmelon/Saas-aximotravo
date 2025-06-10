import { db } from './config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  limit,
  serverTimestamp
} from 'firebase/firestore';

export type ActivityType = 'message' | 'status_change' | 'document' | 'deadline' | 'artisan_assigned' | 'artisan_removed';

export interface Activity {
  id: string;
  type: ActivityType;
  content: string;
  projectId: string;
  projectName: string;
  userId?: string;
  userName?: string;
  courtierId: string;
  createdAt: any;
  metadata?: Record<string, any>;
}

// Créer une nouvelle activité
export async function createActivity(activityData: Omit<Activity, 'id' | 'createdAt'>) {
  try {
    const activityRef = collection(db, 'activities');
    const activityWithTimestamp = {
      ...activityData,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(activityRef, activityWithTimestamp);
    return { id: docRef.id, ...activityWithTimestamp };
  } catch (error) {
    console.error('Erreur lors de la création de l\'activité:', error);
    throw error;
  }
}

// Récupérer les activités d'un projet
export async function getActivitiesByProject(projectId: string): Promise<Activity[]> {
  try {
    const activitiesQuery = query(
      collection(db, 'activities'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(activitiesQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
  } catch (error) {
    console.error('Erreur lors de la récupération des activités du projet:', error);
    throw error;
  }
}

// Récupérer les activités récentes d'un courtier
export async function getRecentActivitiesByCourtier(courtierId: string, limitCount = 10): Promise<Activity[]> {
  try {
    const activitiesQuery = query(
      collection(db, 'activities'),
      where('courtierId', '==', courtierId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(activitiesQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
  } catch (error) {
    console.error('Erreur lors de la récupération des activités récentes:', error);
    throw error;
  }
}

// Fonction d'aide pour créer une activité lors de l'assignation d'un artisan à un projet
export async function logArtisanAssignedActivity(
  projectId: string,
  projectName: string,
  artisanId: string,
  artisanName: string,
  courtierId: string,
  userId: string,
  userName: string
) {
  return createActivity({
    type: 'artisan_assigned',
    content: `${artisanName} a été assigné au projet`,
    projectId,
    projectName,
    userId,
    userName,
    courtierId,
    metadata: { artisanId, artisanName }
  });
}

// Fonction d'aide pour créer une activité lors du changement de statut d'un projet
export async function logStatusChangeActivity(
  projectId: string,
  projectName: string,
  newStatus: string,
  courtierId: string,
  userId: string,
  userName: string
) {
  return createActivity({
    type: 'status_change',
    content: `Statut du projet modifié en "${newStatus}"`,
    projectId,
    projectName,
    userId,
    userName,
    courtierId,
    metadata: { newStatus }
  });
}

// Fonction d'aide pour créer une activité lors de l'ajout d'un document
export async function logDocumentActivity(
  projectId: string,
  projectName: string,
  documentName: string,
  documentType: string,
  courtierId: string,
  userId: string,
  userName: string
) {
  return createActivity({
    type: 'document',
    content: `Document "${documentName}" ajouté`,
    projectId,
    projectName,
    userId,
    userName,
    courtierId,
    metadata: { documentName, documentType }
  });
}

// Fonction d'aide pour créer une activité de message
export async function logMessageActivity(
  projectId: string,
  projectName: string,
  message: string,
  courtierId: string,
  userId: string,
  userName: string
) {
  return createActivity({
    type: 'message',
    content: message,
    projectId,
    projectName,
    userId,
    userName,
    courtierId
  });
}
