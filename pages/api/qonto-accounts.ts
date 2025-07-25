import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Récupération des credentials Qonto depuis les variables d'environnement
    const qontoLogin = process.env.QONTO_LOGIN;
    const qontoSecretKey = process.env.QONTO_SECRET_KEY;

    if (!qontoLogin || !qontoSecretKey) {
      return res.status(500).json({ 
        error: 'Credentials Qonto manquants (QONTO_LOGIN et QONTO_SECRET_KEY requis)' 
      });
    }

    // Construction de l'en-tête d'autorisation : login:secret-key
    const authHeader = `${qontoLogin}:${qontoSecretKey}`;

    // Appel à l'API Qonto pour récupérer les comptes bancaires
    const response = await axios.get('https://thirdparty.qonto.com/v2/bank_accounts', {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
      },
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Erreur API Qonto (comptes):', error?.response?.data || error.message);
    
    return res.status(error?.response?.status || 500).json({
      error: error?.response?.data || error.message || 'Erreur lors de la récupération des comptes Qonto',
    });
  }
}
