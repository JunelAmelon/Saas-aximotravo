import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Vérifier la configuration
  const apiKey = process.env.UPTOSIGN_API_KEY || "";
  const config = {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey.length,
    apiKeyStart: apiKey.substring(0, 10) || "N/A",
    baseUrl: process.env.UPTOSIGN_BASE_URL || "N/A",
    // Vérifications supplémentaires
    hasWhitespace: /\s/.test(apiKey),
    startsWithBearer: apiKey.toLowerCase().startsWith('bearer '),
    containsPipe: apiKey.includes('|'),
    apiKeyEnd: apiKey.substring(apiKey.length - 5) || "N/A"
  };

  console.log("[Debug] Configuration UpToSign:", config);

  // Test sur les deux environnements
  const environments = [
    { name: "dev", url: "https://dev.uptosign.com" },
    { name: "prod", url: "https://app.uptosign.com" }
  ];

  const tests = [];

  for (const env of environments) {
    try {
      const testUrl = `${env.url}/api/documents`;
      const headers = {
        'Authorization': `Bearer ${process.env.UPTOSIGN_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      console.log(`[Debug] Test ${env.name} URL:`, testUrl);

      const response = await fetch(testUrl, {
        method: 'GET',
        headers
      });

      const responseText = await response.text();
      let responseJson = null;
      try {
        responseJson = JSON.parse(responseText);
      } catch (e) {
        // Pas de JSON valide
      }

      tests.push({
        environment: env.name,
        url: testUrl,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responseText: responseText.substring(0, 500),
        responseJson,
        success: response.status !== 401 && response.status !== 403
      });

    } catch (error: any) {
      tests.push({
        environment: env.name,
        error: {
          message: error.message,
          stack: error.stack?.substring(0, 500)
        }
      });
    }
  }

  const result = {
    config,
    tests,
    recommendation: tests.find(t => t.success) ? 
      `Utilisez l'environnement: ${tests.find(t => t.success)?.environment}` :
      "Vérifiez votre clé API dans le dashboard UpToSign"
  };

  console.log("[Debug] Résultat complet:", result);

  return res.status(200).json(result);
}
