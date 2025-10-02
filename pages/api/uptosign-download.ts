import type { NextApiRequest, NextApiResponse } from "next";
import type { UpToSignDownloadResponse } from "@/types/uptosign";
import {
  validateUpToSignConfig,
  getUpToSignHeaders,
  UPTOSIGN_ENDPOINTS
} from "@/lib/services/uptosign-service";

/**
 * API Route pour télécharger un document signé depuis UpToSign
 * 
 * @param req.query.processId - ID du processus de signature
 * @returns UpToSignDownloadResponse - Document signé en base64 ou URL
 */
export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<UpToSignDownloadResponse | { error: string }>
) {
  // Vérifier la méthode HTTP
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez GET." });
  }

  // Valider la configuration UpToSign
  const configValidation = validateUpToSignConfig();
  if (!configValidation.isValid) {
    console.error("[UpToSign][Download] Configuration invalide:", configValidation.error);
    return res.status(500).json({ error: configValidation.error! });
  }

  try {
    // Extraire l'ID du processus
    const { processId } = req.query;

    if (!processId || typeof processId !== 'string') {
      return res.status(400).json({ error: "processId est requis" });
    }

    console.log("[UpToSign][Download] Téléchargement du document:", { processId });

    // Construire l'URL et les headers
    const downloadUrl = UPTOSIGN_ENDPOINTS.download(processId);
    const headers = getUpToSignHeaders();

    // Envoyer la requête à UpToSign
    const uptoSignResponse = await fetch(downloadUrl, {
      method: "GET",
      headers,
    });

    if (!uptoSignResponse.ok) {
      console.error("[UpToSign][Download] Erreur UpToSign:", {
        status: uptoSignResponse.status,
        statusText: uptoSignResponse.statusText
      });
      
      return res.status(uptoSignResponse.status).json({
        error: `Erreur UpToSign (${uptoSignResponse.status}): ${uptoSignResponse.statusText}`
      });
    }

    // Vérifier le type de contenu
    const contentType = uptoSignResponse.headers.get('content-type');
    
    if (contentType?.includes('application/pdf')) {
      // Si c'est un PDF direct, le convertir en base64
      const arrayBuffer = await uptoSignResponse.arrayBuffer();
      const base64Content = Buffer.from(arrayBuffer).toString('base64');
      
      const result: UpToSignDownloadResponse = {
        success: true,
        base64Content,
      };

      console.log("[UpToSign][Download] Document téléchargé (PDF direct):", {
        processId,
        sizeKB: Math.round(base64Content.length * 0.75 / 1024)
      });

      return res.status(200).json(result);
    } else {
      // Sinon, traiter comme une réponse JSON
      const responseText = await uptoSignResponse.text();
      
      let responseJson;
      try {
        responseJson = JSON.parse(responseText);
      } catch (parseError) {
        console.error("[UpToSign][Download] Réponse JSON invalide:", { responseText, parseError });
        return res.status(502).json({ 
          error: "Réponse UpToSign invalide: JSON malformé" 
        });
      }

      // Construire la réponse
      const result: UpToSignDownloadResponse = {
        success: true,
        documentUrl: responseJson.url || responseJson.downloadUrl,
        base64Content: responseJson.content || responseJson.base64,
      };

      console.log("[UpToSign][Download] Document téléchargé (JSON):", {
        processId,
        hasUrl: !!result.documentUrl,
        hasBase64: !!result.base64Content
      });

      return res.status(200).json(result);
    }

  } catch (error) {
    console.error("[UpToSign][Download] Erreur inattendue:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Erreur interne du serveur";
    return res.status(500).json({ error: errorMessage });
  }
}
