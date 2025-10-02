import type { NextApiRequest, NextApiResponse } from "next";
import type { UpToSignStatusNormalizedResponse } from "@/types/uptosign";
import {
  validateUpToSignConfig,
  getUpToSignHeaders,
  normalizeStatusResponse,
  UPTOSIGN_ENDPOINTS
} from "@/lib/services/uptosign-service";

/**
 * API Route pour vérifier le statut d'un processus de signature UpToSign
 * 
 * @param req.query.processId - ID du processus de signature
 * @returns UpToSignStatusNormalizedResponse - Statut du processus
 */
export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<UpToSignStatusNormalizedResponse | { error: string }>
) {
  // Vérifier la méthode HTTP
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez GET." });
  }

  // Valider la configuration UpToSign
  const configValidation = validateUpToSignConfig();
  if (!configValidation.isValid) {
    console.error("[UpToSign][Status] Configuration invalide:", configValidation.error);
    return res.status(500).json({ error: configValidation.error! });
  }

  try {
    // Extraire l'ID du processus
    const { processId } = req.query;

    if (!processId || typeof processId !== 'string') {
      return res.status(400).json({ error: "processId est requis" });
    }

    console.log("[UpToSign][Status] Vérification du statut:", { processId });

    // Construire l'URL et les headers
    const statusUrl = UPTOSIGN_ENDPOINTS.status(processId);
    const headers = getUpToSignHeaders();

    // Envoyer la requête à UpToSign
    const uptoSignResponse = await fetch(statusUrl, {
      method: "GET",
      headers,
    });

    const responseText = await uptoSignResponse.text();
    
    if (!uptoSignResponse.ok) {
      console.error("[UpToSign][Status] Erreur UpToSign:", {
        status: uptoSignResponse.status,
        statusText: uptoSignResponse.statusText,
        body: responseText
      });
      
      return res.status(uptoSignResponse.status).json({
        error: `Erreur UpToSign (${uptoSignResponse.status}): ${responseText}`
      });
    }

    // Parser la réponse
    let responseJson;
    try {
      responseJson = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[UpToSign][Status] Réponse JSON invalide:", { responseText, parseError });
      return res.status(502).json({ 
        error: "Réponse UpToSign invalide: JSON malformé" 
      });
    }

    // Normaliser la réponse
    const normalizedResponse = normalizeStatusResponse(responseJson);

    console.log("[UpToSign][Status] Statut récupéré:", {
      processId: normalizedResponse.processId,
      status: normalizedResponse.status,
      isCompleted: normalizedResponse.isCompleted,
      signersCount: normalizedResponse.signers.length
    });

    return res.status(200).json(normalizedResponse);

  } catch (error) {
    console.error("[UpToSign][Status] Erreur inattendue:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Erreur interne du serveur";
    return res.status(500).json({ error: errorMessage });
  }
}
