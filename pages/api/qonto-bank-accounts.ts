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

  try {
    const response = await axios({
      method: 'GET',
      url: `${QONTO_BASE_URL}/v2/bank_accounts`,
      headers: getQontoHeaders()
    });

    const bankAccounts = response.data.bank_accounts || [];
    console.log('Bank accounts:', bankAccounts);
    
    // Trouver le compte principal (main: true) ou le premier actif
    const mainAccount = bankAccounts.find((account: any) => account.main === true) ||
                       bankAccounts.find((account: any) => account.status === 'active') ||
                       bankAccounts[0];

    res.status(200).json({
      bank_accounts: bankAccounts,
      main_account: mainAccount,
      main_account_id: mainAccount?.id || null
    });

  } catch (error: any) {
    console.error('Erreur récupération comptes bancaires Qonto:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data || error.message 
    });
  }
}
