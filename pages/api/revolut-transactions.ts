import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import https from 'https';
import jwt from 'jsonwebtoken';

// Simple in-memory token cache
let cachedToken: string | null = null;
let cachedTokenExpiresAt: number | null = null;

// Génère dynamiquement un JWT (client assertion) signé pour Revolut
function generateClientAssertion({ clientId, iss, privateKeyPath }: { clientId: string, iss: string, privateKeyPath: string }) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss,
    sub: clientId,
    aud: 'https://revolut.com',
    exp: now + 10 * 60, // 10 min
  };
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  return jwt.sign(payload, privateKey, { algorithm: 'RS256', header: { alg: 'RS256', typ: 'JWT' } });
}

// Récupère un access_token Revolut sandbox via code d'autorisation + client_assertion
async function getRevolutAccessToken({ code }: { code: string }) {
  if (cachedToken && cachedTokenExpiresAt && Date.now() < cachedTokenExpiresAt) {
    return cachedToken;
  }
  const clientId = process.env.REVOLUT_CLIENT_ID;
  const iss = process.env.REVOLUT_JWT_ISS || 'localhost:3000';
  if (!clientId) throw new Error('Client ID manquant');
  if (!code) throw new Error('Code d\'autorisation OAuth manquant');
  const certPath = path.resolve(process.cwd(), 'publiccert.cer');
  const keyPath = path.resolve(process.cwd(), 'privatecert.pem');
  const cert = fs.readFileSync(certPath);
  const key = fs.readFileSync(keyPath);
  const agent = new https.Agent({ cert, key });
  const clientAssertion = generateClientAssertion({ clientId, iss, privateKeyPath: keyPath });
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
  params.append('client_assertion', clientAssertion);
  const response = await axios.post(
    'https://sandbox-b2b.revolut.com/api/1.0/auth/token',
    params,
    {
      httpsAgent: agent,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );
  const { access_token, expires_in } = response.data;
  cachedToken = access_token;
  cachedTokenExpiresAt = Date.now() + (expires_in - 60) * 1000;
  console.log("Token : ", access_token);
  return access_token;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Récupère le code d'autorisation depuis query ou variable d'env
    const code = req.query.code as string || process.env.REVOLUT_AUTH_CODE;
    if (!code) {
      return res.status(400).json({ error: 'Code d\'autorisation OAuth manquant (ajoute ?code=... à l\'URL ou mets-le dans REVOLUT_AUTH_CODE)' });
    }
    // Récupération du token via client_assertion
    const token = await getRevolutAccessToken({ code });
    const response = await axios.get('https://sandbox-b2b.revolut.com/api/1.0/transactions', {
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
