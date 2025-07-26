import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Log du callback pour debugging
    console.log('Callback Qonto reçu:', {
      headers: req.headers,
      body: req.body,
      query: req.query
    });

    // Qonto envoie généralement des webhooks avec des informations sur l'état de la connexion
    // ou des paiements. La structure exacte dépend du type d'événement.
    
    const { event_type, data } = req.body;

    switch (event_type) {
      case 'connection.updated':
        // La connexion au provider a été mise à jour
        console.log('Connexion Qonto mise à jour:', data);
        break;
        
      case 'payment_link.paid':
        // Un lien de paiement a été payé
        console.log('Paiement Qonto effectué:', data);
        
        // Ici on pourrait mettre à jour automatiquement le statut dans Firestore
        // si on a l'ID du lien de paiement
        if (data?.payment_link_id) {
          await updatePaymentStatus(data.payment_link_id, 'paid');
        }
        break;
        
      case 'payment_link.expired':
        // Un lien de paiement a expiré
        console.log('Lien de paiement Qonto expiré:', data);
        if (data?.payment_link_id) {
          await updatePaymentStatus(data.payment_link_id, 'expired');
        }
        break;
        
      default:
        console.log('Type d\'événement Qonto non géré:', event_type);
    }

    // Répondre avec succès pour confirmer la réception du webhook
    res.status(200).json({ received: true });

  } catch (error: any) {
    console.error('Erreur traitement callback Qonto:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Fonction helper pour mettre à jour le statut d'un paiement
async function updatePaymentStatus(paymentLinkId: string, status: string) {
  try {
    const admin = await import('firebase-admin');
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    }

    const db = admin.firestore();
    
    // Chercher le paiement avec ce payment_link_id
    const paymentsSnapshot = await db
      .collection('payments')
      .where('qonto_payment_link_id', '==', paymentLinkId)
      .get();

    if (!paymentsSnapshot.empty) {
      const paymentDoc = paymentsSnapshot.docs[0];
      const paymentData = paymentDoc.data();
      
      let newStatus = 'en_attente';
      if (status === 'paid') {
        newStatus = 'validé';
      } else if (status === 'expired' || status === 'cancelled') {
        newStatus = 'échoué';
      }
      
      // Mettre à jour le paiement
      await paymentDoc.ref.update({
        status: newStatus,
        qonto_webhook_status: status,
        updated_at: new Date().toISOString()
      });

      // Si paiement validé, mettre à jour le projet associé
      if (newStatus === 'validé' && paymentData.projectId) {
        const projectRef = db.doc(`projects/${paymentData.projectId}`);
        const projectSnap = await projectRef.get();
        
        if (projectSnap.exists && projectSnap.data()?.status === 'En attente') {
          await projectRef.update({ status: 'En cours' });
        }
      }
      
      console.log(`Paiement ${paymentDoc.id} mis à jour: ${newStatus}`);
    }
    
  } catch (error) {
    console.error('Erreur mise à jour statut paiement:', error);
  }
}
