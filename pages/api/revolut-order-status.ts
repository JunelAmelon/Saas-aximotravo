import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  const { orderId } = req.query;
  if (!orderId) {
    return res.status(400).json({ error: 'orderId requis' });
  }
  try {
    const response = await axios({
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://merchant.revolut.com/api/orders/${orderId}`,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.REVOLUT_API_KEY}`,
        'Revolut-Api-Version': '2024-09-01',
      },
    });
    res.status(200).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
}
