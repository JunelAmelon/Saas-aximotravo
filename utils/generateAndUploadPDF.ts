import { pdf } from '@react-pdf/renderer';
import { DevisPDFDocument } from '@/components/DevisPDFDocument';
import { updateDoc, doc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { addProjectDocument } from '@/hooks/useProjectDocuments';
import { calculateDevisMontantTTC } from './devisCalculations';
import type { Devis } from '@/types/devis';

/**
 * Upload un blob PDF vers Cloudinary avec nom personnalisé
 */
async function uploadPDFToCloudinary(pdfBlob: Blob, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', pdfBlob, fileName);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  formData.append('folder', 'devis');
  // Tags utiles pour le tri dans Cloudinary (optionnel)
  // formData.append('tags', 'devis');
  
  // Spécifier le nom du fichier dans l'URL Cloudinary (sans l'extension)
  const publicId = fileName.replace('.pdf', '');
  formData.append('public_id', publicId);
  formData.append('resource_type', 'auto');
 
  const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) {
    throw new Error('Erreur upload Cloudinary');
  }
  
  const data = await res.json();
  return data.secure_url;
}

/**
 * Génère un PDF, l'uploade sur Cloudinary et met à jour la base de données
 * @param devis - Les données du devis
 * @param projectId - ID du projet
 * @param userId - ID de l'utilisateur
 * @returns L'URL Cloudinary du PDF généré
 */
export async function generateAndUploadDevisPDF(
  devis: Devis,
  projectId: string,
  userId: string
): Promise<string> {
  try {
    console.log(' Génération et upload du PDF pour le devis:', devis.id);

    // 1. Récupérer les données du projet et du client
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    const projectData = projectSnap.data();
    
    if (!projectData) {
      throw new Error('Projet non trouvé');
    }

    if (!projectData.client_id) {
      throw new Error('ID client manquant dans le projet');
    }

    const clientRef = doc(db, 'users', projectData.client_id);
    const clientSnap = await getDoc(clientRef);
    const clientData = clientSnap.data();
    
    if (!clientData) {
      throw new Error(`Client non trouvé avec l'ID: ${projectData.client_id}`);
    }

    // 1.b Récupérer l'utilisateur courant pour déterminer le rôle
    let isArtisan = false;
    try {
      const currentUserRef = doc(db, 'users', userId);
      const currentUserSnap = await getDoc(currentUserRef);
      const currentUserData = currentUserSnap.data();
      isArtisan = (currentUserData?.role || '').toLowerCase() === 'artisan';
    } catch (e) {
      // Par défaut, considérer non-artisan si erreur
      isArtisan = false;
    }

    // 2. Générer le PDF (masquer l'entête client si non-artisan)
    const pdfDoc = pdf(DevisPDFDocument({ 
      devis, 
      client: clientData as any, 
      project: projectData as any,
      isArtisan
    }));
    const pdfBlob = await pdfDoc.toBlob();
    
    // 3. Créer un nom de fichier avec le format "DEVIS N°DEV-2025-009"
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const devisNumber = devis.numero || devis.id || 'sans-numero';
    const fileName = `DEVIS-N°${devisNumber}-${timestamp}.pdf`;
    
    // 3. Upload vers Cloudinary
    const pdfUrl = await uploadPDFToCloudinary(pdfBlob, fileName);
    console.log(' PDF uploadé sur Cloudinary:', pdfUrl);
    
    // 4. Calculer le montant TTC
    const selectedItems = devis.selectedItems || [];
    const tva = devis.tva || 20;
    const montantTTC = calculateDevisMontantTTC(selectedItems, tva);
    
    // 5. Mettre à jour la base de données
    await updateDevisWithPDFUrl(devis.id, pdfUrl, montantTTC, projectId, devis.titre || 'Devis', pdfBlob.size, devis);
    
    console.log(' Base de données mise à jour avec l\'URL PDF');
    
    return pdfUrl;
    
  } catch (error) {
    console.error(' Erreur lors de la génération/upload du PDF:', error);
    throw error;
  }
}

/**
 * Met à jour la base de données avec l'URL du PDF
 */
async function updateDevisWithPDFUrl(
  devisId: string,
  pdfUrl: string,
  montantTTC: number,
  projectId: string,
  devisTitle: string,
  pdfSize: number,
  devisData: any
): Promise<void> {
  // 1. Mettre à jour le document devisConfig avec l'URL PDF
  const devisConfigRef = doc(db, 'devisConfig', devisId);
  await updateDoc(devisConfigRef, {
    pdfUrl: pdfUrl,
    montant: montantTTC,
    updatedAt: new Date().toISOString()
  });
  
  // 2. Vérifier s'il existe déjà un document dans la collection documents
  const docsRef = collection(db, 'documents');
  const q = query(docsRef, where('projectId', '==', projectId), where('devisConfigId', '==', devisId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    // Document existe, on met à jour l'URL
    const docId = querySnapshot.docs[0].id;
    await updateDoc(doc(docsRef, docId), { 
      url: pdfUrl, 
      montant: montantTTC,
      size: `${Math.round(pdfSize / 1024)} Ko`,
      updatedAt: new Date().toISOString()
    });
  } else {
    // Sinon, on crée un nouveau document
    const documentName = devisData.numero ? `DEVIS N°${devisData.numero}` : devisTitle;
    await addProjectDocument({
      projectId,
      name: documentName,
      category: 'devis',
      date: new Date().toISOString(),
      size: `${Math.round(pdfSize / 1024)} Ko`,
      status: 'en attente',
      url: pdfUrl,
      montant: montantTTC,
      devisConfigId: devisId,
    });
  }
  
  // 3. Mettre à jour aussi la collection devis si elle existe
  try {
    const devisRef = doc(db, 'devis', devisId);
    await updateDoc(devisRef, {
      pdfUrl: pdfUrl,
      montant: montantTTC,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    // Le document devis n'existe peut-être pas, ce n'est pas grave
    console.log('Document devis non trouvé, skip mise à jour');
  }
}
