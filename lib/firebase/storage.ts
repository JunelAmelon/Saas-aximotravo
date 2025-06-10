import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTaskSnapshot
} from "firebase/storage";
import { storage } from "./config";

// Télécharger un fichier sur Firebase Storage
export const uploadFile = (
  file: File,
  path: string,
  progressCallback?: (progress: number, snapshot: UploadTaskSnapshot) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Créer une référence au fichier dans Firebase Storage
      const storageRef = ref(storage, path);
      
      // Commencer le téléchargement
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Suivre les changements d'état et les erreurs
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Calculer et signaler la progression du téléchargement
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progressCallback) {
            progressCallback(progress, snapshot);
          }
        },
        (error) => {
          // Gérer les erreurs de téléchargement
          reject(error);
        },
        async () => {
          // Téléchargement terminé avec succès
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    } catch (error: any) {
      reject(error);
    }
  });
};

// Obtenir l'URL de téléchargement d'un fichier
export const getFileUrl = async (path: string): Promise<string> => {
  try {
    const fileRef = ref(storage, path);
    return await getDownloadURL(fileRef);
  } catch (error: any) {
    throw new Error(`Erreur lors de la récupération de l'URL du fichier: ${error.message}`);
  }
};

// Supprimer un fichier
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  } catch (error: any) {
    throw new Error(`Erreur lors de la suppression du fichier: ${error.message}`);
  }
};

// Lister tous les fichiers dans un dossier
export const listFiles = async (folderPath: string): Promise<string[]> => {
  try {
    const folderRef = ref(storage, folderPath);
    const filesList = await listAll(folderRef);
    
    // Récupérer les URLs de tous les fichiers
    const fileUrls = await Promise.all(
      filesList.items.map(async (itemRef) => await getDownloadURL(itemRef))
    );
    
    return fileUrls;
  } catch (error: any) {
    throw new Error(`Erreur lors de la liste des fichiers: ${error.message}`);
  }
};
