import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const QONTO_SANDBOX_URL = 'https://thirdparty-sandbox.staging.qonto.co';

// Test des différents formats d'authentification pour le sandbox
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const results: any[] = [];

  // Format 1: OAuth2 (si disponible)
  const clientId = process.env.QONTO_CLIENT_ID;
  const clientSecret = process.env.QONTO_CLIENT_SECRET;
  
  // Format 2: Login/Secret (ancien format)
  const login = process.env.QONTO_LOGIN;
  const secretKey = process.env.QONTO_SECRET_KEY;

  console.log('🧪 Test des formats d\'authentification Qonto sandbox...');

  // Test 1: Format direct login:secret
  if (login && secretKey) {
    try {
      console.log('📋 Test 1: Format direct login:secret');
      const response = await axios({
        method: 'GET',
        url: `${QONTO_SANDBOX_URL}/v2/bank_accounts`,
        headers: {
          'Authorization': `${login}:${secretKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      
      results.push({
        method: 'Direct login:secret',
        status: 'SUCCESS',
        statusCode: response.status,
        data: 'Authentification réussie'
      });
      
    } catch (error: any) {
      results.push({
        method: 'Direct login:secret',
        status: 'FAILED',
        statusCode: error.response?.status || 'TIMEOUT',
        error: error.response?.data || error.message
      });
    }
  }

  // Test 2: Format Basic base64
  if (login && secretKey) {
    try {
      console.log('📋 Test 2: Format Basic base64');
      const credentials = Buffer.from(`${login}:${secretKey}`).toString('base64');
      const response = await axios({
        method: 'GET',
        url: `${QONTO_SANDBOX_URL}/v2/bank_accounts`,
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      
      results.push({
        method: 'Basic base64',
        status: 'SUCCESS',
        statusCode: response.status,
        data: 'Authentification réussie'
      });
      
    } catch (error: any) {
      results.push({
        method: 'Basic base64',
        status: 'FAILED',
        statusCode: error.response?.status || 'TIMEOUT',
        error: error.response?.data || error.message
      });
    }
  }

  // Test 3: Format Bearer (si c'est un token direct)
  if (secretKey) {
    try {
      console.log('📋 Test 3: Format Bearer token');
      const response = await axios({
        method: 'GET',
        url: `${QONTO_SANDBOX_URL}/v2/bank_accounts`,
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      
      results.push({
        method: 'Bearer token',
        status: 'SUCCESS',
        statusCode: response.status,
        data: 'Authentification réussie'
      });
      
    } catch (error: any) {
      results.push({
        method: 'Bearer token',
        status: 'FAILED',
        statusCode: error.response?.status || 'TIMEOUT',
        error: error.response?.data || error.message
      });
    }
  }

  // Test 4: OAuth2 (si credentials disponibles)
  if (clientId && clientSecret) {
    try {
      console.log('📋 Test 4: OAuth2 client credentials');
      
      // Essayer d'obtenir un token OAuth2
      const tokenResponse = await axios({
        method: 'POST',
        url: `${QONTO_SANDBOX_URL}/oauth/token`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          scope: 'payment_links'
        }),
        timeout: 10000
      });
      
      const accessToken = tokenResponse.data.access_token;
      
      // Tester le token
      const apiResponse = await axios({
        method: 'GET',
        url: `${QONTO_SANDBOX_URL}/v2/bank_accounts`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      
      results.push({
        method: 'OAuth2 Bearer',
        status: 'SUCCESS',
        statusCode: apiResponse.status,
        data: 'Authentification OAuth2 réussie'
      });
      
    } catch (error: any) {
      results.push({
        method: 'OAuth2 Bearer',
        status: 'FAILED',
        statusCode: error.response?.status || 'TIMEOUT',
        error: error.response?.data || error.message
      });
    }
  }

  // Résumé des résultats
  const successfulMethods = results.filter(r => r.status === 'SUCCESS');
  
  res.status(200).json({
    summary: {
      total_tests: results.length,
      successful: successfulMethods.length,
      failed: results.length - successfulMethods.length
    },
    successful_methods: successfulMethods.map(r => r.method),
    detailed_results: results,
    recommendation: successfulMethods.length > 0 
      ? `Utilise la méthode: ${successfulMethods[0].method}`
      : 'Aucune méthode d\'authentification ne fonctionne. Vérifiez vos credentials.'
  });
}
