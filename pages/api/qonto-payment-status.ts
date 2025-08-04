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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { paymentLinkId } = req.query;

  if (!paymentLinkId) {
    return res.status(400).json({ error: 'paymentLinkId est requis' });
  }

  try {
    // Récupérer les détails du lien de paiement
    const linkResponse = await axios({
      method: 'GET',
      url: `${QONTO_BASE_URL}/v2/payment_links/${paymentLinkId}`,
      headers: getQontoHeaders()
    });

    // Récupérer les paiements associés au lien
    const paymentsResponse = await axios({
      method: 'GET',
      url: `${QONTO_BASE_URL}/v2/payment_links/${paymentLinkId}/payments`,
      headers: getQontoHeaders()
    });

    const linkData = linkResponse.data;
    const paymentsData = paymentsResponse.data;

    // Chercher un paiement réussi
    const successfulPayment = paymentsData.payments?.find(
      (payment: any) => payment.status === 'paid'
    );

    const response = {
      link_status: linkData.status,
      payments: paymentsData.payments || [],
      has_successful_payment: !!successfulPayment,
      successful_payment: successfulPayment || null
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Erreur récupération statut paiement Qonto:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data || error.message 
    });
  }
}
