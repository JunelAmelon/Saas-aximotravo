import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const QONTO_BASE_URL = 'https://thirdparty.qonto.com';

// Fonction pour créer les headers d'authentification Qonto
function getQontoHeaders() {
  const login = process.env.QONTO_LOGIN;
  const secretKey = process.env.QONTO_SECRET_KEY;
  
  if (!login || !secretKey) {
    throw new Error('QONTO_LOGIN et QONTO_SECRET_KEY sont requis');
  }
  
  return {
    'Authorization': `${login}:${secretKey}`,
    'Content-Type': 'application/json',
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { amount, currency = 'EUR', paymentId, description } = req.body;

  if (!amount || !paymentId) {
    return res.status(400).json({ error: 'amount et paymentId sont requis' });
  }

  try {
    // Vérifier d'abord l'état de la connexion
    const connectionResponse = await axios({
      method: 'GET',
      url: `${QONTO_BASE_URL}/v2/payment_links/connections`,
      headers: getQontoHeaders()
    });

    const connectionStatus = connectionResponse.data.status;
    
    if (connectionStatus !== 'enabled') {
      return res.status(400).json({ 
        error: `Connexion Qonto non active. Statut: ${connectionStatus}`,
        connection_status: connectionStatus,
        connection_location: connectionResponse.data.connection_location
      });
    }

    // Créer le lien de paiement
    const paymentLinkData = {
      payment_link: {
        potential_payment_methods: ['credit_card', 'apple_pay', 'paypal'],
        reusable: false, // Lien à usage unique
        items: [
          {
            title: description || `Paiement SecureAcompte - ${paymentId}`,
            type: 'service',
            description: description || `Paiement pour le projet ${paymentId}`,
            quantity: 1,
            measure_unit: 'unit',
            unit_price: {
              value: (amount / 100).toFixed(2), // Convertir centimes en euros
              currency: currency
            },
            vat_rate: '0.0' // Pas de TVA par défaut
          }
        ]
      }
    };

    const response = await axios({
      method: 'POST',
      url: `${QONTO_BASE_URL}/v2/payment_links`,
      headers: getQontoHeaders(),
      data: paymentLinkData
    });

    const { payment_link } = response.data;
    const { id: qonto_payment_link_id, url: payment_url } = payment_link;

    if (!payment_url || !qonto_payment_link_id) {
      return res.status(500).json({ error: "URL de paiement ou ID manquant dans la réponse Qonto" });
    }

    // Mettre à jour le paiement Firestore avec l'URL Qonto et l'ID
    const admin = await import('firebase-admin');
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    }

    await admin.firestore().doc(`payments/${paymentId}`).update({
      qonto_payment_url: payment_url,
      qonto_payment_link_id,
      qonto_status: payment_link.status || 'open'
    });

    res.status(200).json({ 
      payment_url, 
      qonto_payment_link_id,
      status: payment_link.status 
    });

  } catch (error: any) {
    console.error('Erreur création lien de paiement Qonto:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data || error.message 
    });
  }
}
