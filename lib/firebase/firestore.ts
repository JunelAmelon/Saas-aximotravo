import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "./config";

// Ajouter un document à une collection
export const addDocument = async (collectionName: string, data: any) => {
  try {
    // Ajouter les timestamps pour created_at et updated_at
    const dataWithTimestamps = {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, collectionName), dataWithTimestamps);
    return { id: docRef.id, ...data };
  } catch (error: any) {
    throw new Error(`Erreur lors de l'ajout du document: ${error.message}`);
  }
};

// Mettre à jour un document existant
export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    
    // Ajouter le timestamp pour updated_at
    const dataWithTimestamp = {
      ...data,
      updated_at: serverTimestamp(),
    };
    
    await updateDoc(docRef, dataWithTimestamp);
    return { id: docId, ...data };
  } catch (error: any) {
    throw new Error(`Erreur lors de la mise à jour du document: ${error.message}`);
  }
};

// Définir un document avec un ID spécifique
export const setDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    
    // Ajouter les timestamps pour created_at et updated_at
    const dataWithTimestamps = {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };
    
    await setDoc(docRef, dataWithTimestamps);
    return { id: docId, ...data };
  } catch (error: any) {
    throw new Error(`Erreur lors de la définition du document: ${error.message}`);
  }
};

// Obtenir un document par son ID
export const getDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { id: docId, ...data };
    } else {
      return null;
    }
  } catch (error: any) {
    throw new Error(`Erreur lors de la récupération du document: ${error.message}`);
  }
};

// Supprimer un document
export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error: any) {
    throw new Error(`Erreur lors de la suppression du document: ${error.message}`);
  }
};

// Récupérer tous les documents d'une collection
export const getAllDocuments = async (collectionName: string) => {
  try {
    const colRef = collection(db, collectionName);
    const querySnapshot = await getDocs(colRef);
    
    const documents: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error: any) {
    throw new Error(`Erreur lors de la récupération des documents: ${error.message}`);
  }
};

// Rechercher des documents avec des contraintes (filtre, tri, limite)
export const queryDocuments = async (
  collectionName: string,
  conditions: { field: string; operator: any; value: any }[] = [],
  sortOptions: { field: string; direction: 'asc' | 'desc' }[] = [],
  limitCount?: number
) => {
  try {
    const colRef = collection(db, collectionName);
    
    // Construire les contraintes de requête
    const constraints: QueryConstraint[] = [];
    
    // Ajouter les conditions de filtrage
    conditions.forEach((condition) => {
      constraints.push(where(condition.field, condition.operator, condition.value));
    });
    
    // Ajouter les options de tri
    sortOptions.forEach((sort) => {
      constraints.push(orderBy(sort.field, sort.direction));
    });
    
    // Ajouter la limite
    if (limitCount) {
      constraints.push(limit(limitCount));
    }
    
    // Exécuter la requête
    const q = query(colRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const documents: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error: any) {
    throw new Error(`Erreur lors de la requête des documents: ${error.message}`);
  }
};

// Convertir un Timestamp Firestore en Date JavaScript
export const timestampToDate = (timestamp: Timestamp) => {
  return timestamp.toDate();
};
