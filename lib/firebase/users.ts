import { db } from './config';
import { collection, doc, getDoc, getDocs, setDoc, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { createUser as firebaseCreateUser } from './auth';

export type UserRole = 'admin' | 'courtier' | 'artisan';

export interface BaseUser {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ArtisanUser extends BaseUser {
  role: 'artisan';
  companyName: string;
  siret: string;
  courtierId?: string;
}

export interface CourtierUser extends BaseUser {
  role: 'courtier';
  companyName: string;
  artisanIds: string[];
}

export interface AdminUser extends BaseUser {
  role: 'admin';
}

export type User = ArtisanUser | CourtierUser | AdminUser;

// Créer un nouvel utilisateur (admin only)
export async function createUser(
  email: string, 
  password: string, 
  userData: Omit<User, 'uid' | 'createdAt' | 'updatedAt'>
) {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await firebaseCreateUser(email, password);
    const uid = userCredential.user.uid;

    // Préparer les données utilisateur avec les timestamps
    const userWithTimestamp = {
      ...userData,
      uid,
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Enregistrer dans Firestore selon le rôle
    await setDoc(doc(db, 'users', uid), userWithTimestamp);

    return { uid, ...userWithTimestamp };
  } catch (error) {
    console.error('Erreur lors de la création du utilisateur:', error);
    throw error;
  }
}

// Récupérer un utilisateur par email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data() as User;
      userData.uid = querySnapshot.docs[0].id; // Pour avoir l'uid
      return userData;
    }
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur par email:", error);
    throw error;
  }
}

// Récupérer un utilisateur par ID
export async function getUserById(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      return userData;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
}

// Récupérer tous les artisans rattachés à un courtier
export async function getArtisansByCourtierId(courtierId: string): Promise<ArtisanUser[]> {
  try {
    const artisansQuery = query(
      collection(db, 'users'),
      where('role', '==', 'artisan'),
      where('courtierId', '==', courtierId)
    );
    const snapshot = await getDocs(artisansQuery);
    return snapshot.docs.map(doc => doc.data() as ArtisanUser);
  } catch (error) {
    console.error('Erreur lors de la récupération des artisans:', error);
    throw error;
  }
}

// Récupérer tous les artisans non rattachés
export async function getUnassignedArtisans(): Promise<ArtisanUser[]> {
  try {
    const artisansQuery = query(
      collection(db, 'users'),
      where('role', '==', 'artisan'),
      where('courtierId', '==', null)
    );
    const snapshot = await getDocs(artisansQuery);
    return snapshot.docs.map(doc => doc.data() as ArtisanUser);
  } catch (error) {
    console.error('Erreur lors de la récupération des artisans non assignés:', error);
    throw error;
  }
}

// Attribuer un artisan à un courtier
export async function assignArtisanToCourtier(artisanId: string, courtierId: string) {
  try {
    // Mettre à jour l'artisan avec l'ID du courtier
    await updateDoc(doc(db, 'users', artisanId), {
      courtierId,
      updatedAt: serverTimestamp()
    });

    // Ajouter l'ID de l'artisan à la liste des artisans du courtier
    const courtierDoc = await getDoc(doc(db, 'users', courtierId));
    if (courtierDoc.exists()) {
      const courtierData = courtierDoc.data() as CourtierUser;
      const artisanIds = [...(courtierData.artisanIds || []), artisanId];
      
      await updateDoc(doc(db, 'users', courtierId), {
        artisanIds,
        updatedAt: serverTimestamp()
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'assignation de l\'artisan au courtier:', error);
    throw error;
  }
}

// Récupérer tous les courtiers
export async function getAllCourtiers(): Promise<CourtierUser[]> {
  try {
    const courtiersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'courtier')
    );
    const snapshot = await getDocs(courtiersQuery);
    return snapshot.docs.map(doc => doc.data() as CourtierUser);
  } catch (error) {
    console.error('Erreur lors de la récupération des courtiers:', error);
    throw error;
  }
}

// Récupérer tous les artisans
export async function getAllArtisans(): Promise<ArtisanUser[]> {
  try {
    const artisansQuery = query(
      collection(db, 'users'),
      where('role', '==', 'artisan')
    );
    const snapshot = await getDocs(artisansQuery);
    return snapshot.docs.map(doc => doc.data() as ArtisanUser);
  } catch (error) {
    console.error('Erreur lors de la récupération des artisans:', error);
    throw error;
  }
}
