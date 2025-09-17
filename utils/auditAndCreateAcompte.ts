import { db } from "@/lib/firebase/config";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc 
} from "firebase/firestore";
import { addPayment } from "@/hooks/useProjectPayments";

/**
 * Fonction d'audit qui vérifie si un projet a des devis validés mais aucun acompte
 * et crée automatiquement l'acompte si nécessaire
 * @param projectId ID du projet à auditer
 */
export async function auditAndCreateAcompte(projectId: string): Promise<void> {
  console.log('🔍 AUDIT - Vérification des acomptes pour le projet:', projectId);
  
  try {
    // 1. Récupérer les informations du projet
    console.log('📋 Récupération des données du projet...');
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);
    
    if (!projectSnap.exists()) {
      console.log('❌ Projet introuvable:', projectId);
      return;
    }

    const projectData = projectSnap.data();
    const firstDepositPercent = projectData.firstDepositPercent;
    const projectBudget = projectData.budget;
    
    console.log('📊 Données du projet:', {
      firstDepositPercent,
      projectBudget
    });
    
    if (!firstDepositPercent) {
      console.log('⚠️ Aucun pourcentage d\'acompte défini pour ce projet');
      return;
    }

    if (!projectBudget || projectBudget <= 0) {
      console.log('⚠️ Budget du projet non défini ou invalide');
      return;
    }

    // 2. Vérifier s'il existe déjà des acomptes
    console.log('🔍 Vérification des acomptes existants...');
    const existingAcomptes = await getExistingAcomptes(projectId);
    
    if (existingAcomptes.length > 0) {
      console.log('✅ Des acomptes existent déjà pour ce projet:', existingAcomptes.length);
      return;
    }

    // 3. Chercher des devis validés
    console.log('🔍 Recherche de devis validés...');
    const validatedDevis = await getValidatedDevis(projectId);
    
    console.log('📋 Devis validés trouvés:', validatedDevis.length, validatedDevis);
    
    if (validatedDevis.length === 0) {
      console.log('ℹ️ Aucun devis validé trouvé, pas de création d\'acompte');
      return;
    }

    // 4. Si on a des devis validés mais aucun acompte, créer l'acompte automatique
    console.log('🚀 Création d\'acompte automatique nécessaire!');
    
    const acompteAmount = Math.round((projectBudget * firstDepositPercent) / 100);
    
    console.log('💰 Calcul de l\'acompte:', {
      projectBudget,
      firstDepositPercent,
      acompteAmount
    });

    // Prendre le premier devis validé comme référence
    const firstValidatedDevis = validatedDevis[0];
    const devisNumber = firstValidatedDevis.numero || firstValidatedDevis.id;
    
    await addPayment({
      projectId,
      title: `Premier versement (${firstDepositPercent}%)`,
      description: `Premier versement de ${firstDepositPercent}% du montant total des travaux, conformément aux conditions contractuelles. Montant calculé sur la base du budget projet de ${projectBudget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}. Généré suite à la validation du devis ${devisNumber}.`,
      amount: acompteAmount,
      date: new Date().toISOString(),
      status: 'en_attente',
      images: [],
      documents: [],
      dateValidation: '',
    });

    console.log('🎉 SUCCÈS! Acompte automatique créé par audit:', {
      projectId,
      amount: acompteAmount,
      percentage: firstDepositPercent,
      baseAmount: projectBudget,
      referencedDevis: firstValidatedDevis.id
    });

  } catch (error: any) {
    console.error('💥 ERREUR dans auditAndCreateAcompte:', error);
    console.error('Stack trace:', error?.stack);
  }
}

/**
 * Récupère tous les devis validés d'un projet (insensible à la casse)
 */
async function getValidatedDevis(projectId: string): Promise<any[]> {
  const validatedDevis: any[] = [];
  
  try {
    console.log('🔍 Recherche de devis validés pour le projet:', projectId);
    
    // Vérifier dans la collection devis (récupérer TOUS les devis du projet)
    const devisQuery = query(
      collection(db, 'devis'),
      where('projectId', '==', projectId)
    );
    const devisSnapshot = await getDocs(devisQuery);
    
    console.log('📋 Devis trouvés dans collection "devis":', devisSnapshot.size);
    
    devisSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const status = data.status;
      console.log(`📎 Devis ${doc.id}: status="${status}"`);
      
      // Vérification insensible à la casse
      if (status && status.toLowerCase() === 'validé') {
        console.log(`✅ Devis validé trouvé: ${doc.id} (status: "${status}")`);
        validatedDevis.push({
          id: doc.id,
          type: 'devis',
          ...data
        });
      }
    });
    
    // Vérifier dans la collection devisConfig (récupérer TOUS les devisConfig du projet)
    const devisConfigQuery = query(
      collection(db, 'devisConfig'),
      where('projectId', '==', projectId)
    );
    const devisConfigSnapshot = await getDocs(devisConfigQuery);
    
    console.log('📋 DevisConfig trouvés dans collection "devisConfig":', devisConfigSnapshot.size);
    
    devisConfigSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const status = data.status;
      console.log(`📎 DevisConfig ${doc.id}: status="${status}"`);
      
      // Vérification insensible à la casse
      if (status && status.toLowerCase() === 'validé') {
        console.log(`✅ DevisConfig validé trouvé: ${doc.id} (status: "${status}")`);
        validatedDevis.push({
          id: doc.id,
          type: 'devisConfig',
          ...data
        });
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des devis validés:', error);
  }
  
  return validatedDevis;
}

/**
 * Récupère tous les acomptes existants d'un projet
 */
async function getExistingAcomptes(projectId: string): Promise<any[]> {
  try {
    const paymentsQuery = query(
      collection(db, 'payments'),
      where('projectId', '==', projectId)
    );
    const paymentsSnapshot = await getDocs(paymentsQuery);
    
    return paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
  } catch (error) {
    console.error('Erreur lors de la vérification des acomptes existants:', error);
    return [];
  }
}
