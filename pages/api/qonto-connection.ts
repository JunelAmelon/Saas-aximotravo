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
  try {
    if (req.method === 'POST') {
      // Initier la connexion au provider Qonto
      const requiredEnvVars = [
        'QONTO_PARTNER_CALLBACK_URL',
        'QONTO_USER_PHONE_NUMBER',
        'QONTO_USER_WEBSITE_URL',
        'QONTO_BUSINESS_DESCRIPTION'
      ];
      
      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          return res.status(500).json({ error: `Variable d'environnement manquante: ${envVar}` });
        }
      }
      
      // Récupérer automatiquement le bank_account_id
      let bankAccountId;
      try {
        const bankAccountsResponse = await axios({
          method: 'GET',
          url: `${QONTO_BASE_URL}/v2/bank_accounts`,
          headers: getQontoHeaders()
        });
        
        const bankAccounts = bankAccountsResponse.data.bank_accounts || [];
        const mainAccount = bankAccounts.find((account: any) => account.main === true) ||
                           bankAccounts.find((account: any) => account.status === 'active') ||
                           bankAccounts[0];
        
        if (!mainAccount) {
          return res.status(500).json({ error: 'Aucun compte bancaire actif trouvé' });
        }
        
        bankAccountId = mainAccount.id;
      } catch (bankError: any) {
        return res.status(500).json({ 
          error: 'Impossible de récupérer le compte bancaire', 
          details: bankError.response?.data || bankError.message 
        });
      }
      
      const connectionData = {
        partner_callback_url: process.env.QONTO_PARTNER_CALLBACK_URL,
        user_bank_account_id: bankAccountId,
        user_phone_number: process.env.QONTO_USER_PHONE_NUMBER,
        user_website_url: process.env.QONTO_USER_WEBSITE_URL,
        business_description: process.env.QONTO_BUSINESS_DESCRIPTION
      };
      
      const response = await axios({
        method: 'POST',
        url: `${QONTO_BASE_URL}/v2/payment_links/connections`,
        headers: getQontoHeaders(),
        data: connectionData
      });
      
      return res.status(200).json(response.data);
      
    } else if (req.method === 'GET') {
      // Vérifier l'état de la connexion
      const response = await axios({
        method: 'GET',
        url: `${QONTO_BASE_URL}/v2/payment_links/connections`,
        headers: getQontoHeaders()
      });
      
      return res.status(200).json(response.data);
      
    } else {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }
    
  } catch (error: any) {
    console.error('Erreur API Qonto connexion:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({ 
      error: error.response?.data || error.message 
    });
  }
}
