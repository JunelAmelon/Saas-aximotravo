import { db } from "@/lib/firebase/config";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  addDoc 
} from "firebase/firestore";
import { addPayment } from "@/hooks/useProjectPayments";

/**
 * Crée automatiquement une demande d'acompte lors de la validation du premier devis par le client
 * @param projectId ID du projet
 * @param devisId ID du devis validé
 * @param devisType Type de devis ("devis" ou "devisConfig")
 */
export async function createAutomaticAcompte(
  projectId: string,
  devisId: string,
  devisType: "devis" | "devisConfig"
): Promise<void> {
  console.log('🚀 DÉBUT createAutomaticAcompte - Fonction appelée avec:', {
    projectId,
    devisId,
    devisType
  });
  
  try {
    console.log('🔄 Vérification pour création automatique d\'acompte...');

    // 1. Récupérer les informations du projet
    console.log('📋 Étape 1: Récupération du projet:', projectId);
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);
    
    if (!projectSnap.exists()) {
      console.error('❌ Projet introuvable:', projectId);
      return;
    }
    console.log('✅ Projet trouvé');

    const projectData = projectSnap.data();
    const firstDepositPercent = projectData.firstDepositPercent;
    const projectBudget = projectData.budget;
    
    console.log('📊 Données du projet récupérées:', {
      firstDepositPercent,
      projectBudget,
      projectData: projectData
    });
    
    if (!firstDepositPercent) {
      console.log('⚠️ Aucun pourcentage d\'acompte défini pour ce projet');
      return;
    }

    if (!projectBudget || projectBudget <= 0) {
      console.log('⚠️ Budget du projet non défini ou invalide');
      return;
    }
    
    console.log('✅ Pourcentage et budget validés');

    // 2. Vérifier si c'est le premier devis validé du projet
    console.log('📋 Étape 2: Vérification premier devis validé');
    const isFirstValidatedDevis = await checkIfFirstValidatedDevis(projectId, devisId, devisType);
    
    console.log('🔍 Résultat vérification premier devis:', isFirstValidatedDevis);
    
    if (!isFirstValidatedDevis) {
      console.log('ℹ️ Ce n\'est pas le premier devis validé, pas de création d\'acompte automatique');
      return;
    }
    
    console.log('✅ C\'est bien le premier devis validé');

    // 3. Vérifier qu'aucun acompte n'existe déjà pour ce projet
    console.log('📋 Étape 3: Vérification acomptes existants');
    const existingAcomptes = await checkExistingAcomptes(projectId);
    
    console.log('🔍 Acomptes existants trouvés:', existingAcomptes.length, existingAcomptes);
    
    if (existingAcomptes.length > 0) {
      console.log('ℹ️ Des acomptes existent déjà pour ce projet, pas de création automatique');
      return;
    }
    
    console.log('✅ Aucun acompte existant, on peut créer');

    // 4. Calculer le montant de l'acompte basé sur le budget du projet
    console.log('📋 Étape 4: Calcul du montant de l\'acompte');
    const acompteAmount = Math.round((projectBudget * firstDepositPercent) / 100);
    
    console.log('💰 Montant calculé:', {
      projectBudget,
      firstDepositPercent,
      acompteAmount
    });

    // 5. Créer la demande d'acompte automatique
    console.log('📋 Étape 5: Création de l\'acompte dans Firestore');
    
    // Récupérer le numéro du devis pour la référence
    const devisDoc = await getDoc(doc(db, devisType, devisId));
    const devisData = devisDoc.data();
    const devisNumber = devisData?.numero || devisId;
    
    await addPayment({
      projectId,
      title: `Premier versement (${firstDepositPercent}%)`,
      description: `Premier versement de ${firstDepositPercent}% du montant total des travaux, conformément aux conditions contractuelles. Montant calculé sur la base du budget projet de ${projectBudget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}. Déclenché suite à la validation du devis ${devisNumber}.`,
      amount: acompteAmount,
      date: new Date().toISOString(),
      status: 'en_attente',
      images: [],
      documents: [],
      dateValidation: '',
    });

    console.log('🎉 SUCCÈS! Acompte automatique créé avec succès:', {
      projectId,
      amount: acompteAmount,
      percentage: firstDepositPercent,
      baseAmount: projectBudget,
      calculatedFrom: 'project budget'
    });

  } catch (error: any) {
    console.error('💥 ERREUR CRITIQUE dans createAutomaticAcompte:', error);
    console.error('Stack trace:', error?.stack);
    // Ne pas faire échouer la validation du devis si la création d'acompte échoue
  }
  
  console.log('🏁 FIN createAutomaticAcompte');
}

/**
 * Vérifie si c'est le premier devis validé du projet
 */
async function checkIfFirstValidatedDevis(
  projectId: string, 
  currentDevisId: string, 
  currentDevisType: "devis" | "devisConfig"
): Promise<boolean> {
  try {
    // Vérifier dans la collection devis
    const devisQuery = query(
      collection(db, 'devis'),
      where('projectId', '==', projectId),
      where('status', '==', 'validé')
    );
    const devisSnapshot = await getDocs(devisQuery);
    
    // Vérifier dans la collection devisConfig
    const devisConfigQuery = query(
      collection(db, 'devisConfig'),
      where('projectId', '==', projectId),
      where('status', '==', 'validé')
    );
    const devisConfigSnapshot = await getDocs(devisConfigQuery);

    // Compter le nombre total de devis validés (en excluant le devis actuel)
    let validatedCount = 0;
    
    devisSnapshot.docs.forEach(doc => {
      if (!(currentDevisType === 'devis' && doc.id === currentDevisId)) {
        validatedCount++;
      }
    });
    
    devisConfigSnapshot.docs.forEach(doc => {
      if (!(currentDevisType === 'devisConfig' && doc.id === currentDevisId)) {
        validatedCount++;
      }
    });

    // C'est le premier si aucun autre devis n'est validé
    return validatedCount === 0;
    
  } catch (error) {
    console.error('Erreur lors de la vérification du premier devis validé:', error);
    return false;
  }
}

/**
 * Vérifie s'il existe déjà des acomptes pour ce projet
 */
async function checkExistingAcomptes(projectId: string): Promise<any[]> {
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
