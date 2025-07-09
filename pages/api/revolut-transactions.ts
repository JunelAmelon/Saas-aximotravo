import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Idéalement, stocke le token dans une variable d'environnement côté serveur
  const token = process.env.REVOLUT_API_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Token Revolut manquant sur le serveur' });
  }

  try {
    const response = await axios.get('https://b2b.revolut.com/api/1.0/transactions', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      maxBodyLength: Infinity,
    });
    return res.status(200).json(response.data);
  } catch (error: any) {
    return res.status(error?.response?.status || 500).json({
      error: error?.response?.data || error.message || 'Erreur inconnue',
    });
  }
}
