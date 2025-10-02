import type { NextApiRequest, NextApiResponse } from "next";
import type { UpToSignSigner } from "@/types/uptosign";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Vérifier la présence de la clé API côté serveur pour éviter un 401 inutile
  if (!process.env.UPTOSIGN_API_KEY) {
    return res.status(500).json({ error: "UPTOSIGN_API_KEY manquant côté serveur" });
  }

  // Debug: vérifier le format de la clé (masquer les caractères sensibles)
  const apiKey = process.env.UPTOSIGN_API_KEY;
  console.log("[UpToSign][Debug] API Key format:", {
    hasKey: !!apiKey,
    keyLength: apiKey?.length,
    keyStart: apiKey?.substring(0, 15) + "...",
    keyEnd: "..." + apiKey?.substring(apiKey?.length - 5),
    baseUrl: process.env.UPTOSIGN_BASE_URL,
    startsWithBearer: apiKey?.toLowerCase().startsWith('bearer'),
    containsBearer: apiKey?.toLowerCase().includes('bearer')
  });

  const base = (process.env.UPTOSIGN_BASE_URL || "https://dev.uptosign.com").replace(/\/$/, "");

  try {
    const { pdfUrl, signers, subject, message, filename } = req.body as {
      pdfUrl: string;
      signers: UpToSignSigner[];
      subject?: string;
      message?: string;
      filename?: string;
    };

    if (!pdfUrl || !Array.isArray(signers) || signers.length === 0) {
      return res.status(400).json({ error: "pdfUrl et signers requis" });
    }

    // Log d'entrée
    console.log("[UpToSign][API] Incoming body:", { pdfUrl, subject, message, filename, signers });

    // Télécharger le PDF et encoder en base64
    console.log("[UpToSign][API] Fetching PDF from:", pdfUrl);
    const pdfRes = await fetch(pdfUrl);
    if (!pdfRes.ok) {
      const txt = await pdfRes.text();
      console.log("[UpToSign][API] PDF fetch error:", { status: pdfRes.status, body: txt });
      return res.status(400).json({ error: `Unable to fetch PDF: ${pdfRes.status} ${txt}` });
    }
    
    const contentType = pdfRes.headers.get('content-type');
    console.log("[UpToSign][API] PDF Content-Type:", contentType);
    
    const arrayBuf = await pdfRes.arrayBuffer();
    const fileBase64 = Buffer.from(arrayBuf).toString("base64");

    console.log("[UpToSign][API] PDF prepared:", {
      pdfBytes: arrayBuf.byteLength,
      base64Length: fileBase64.length,
      base64Head: fileBase64.slice(0, 120),
      contentType,
      isValidPDF: fileBase64.startsWith('JVBERi') // PDF magic number en base64
    });

    // Construire l'appel upstream sans fonction utilitaire
    const url = new URL(`${base}/api/documents`);
    
    // Debug: vérifier la construction du header Authorization
    const rawApiKey = process.env.UPTOSIGN_API_KEY;
    const authHeader = `Bearer ${rawApiKey}`;
    console.log("[UpToSign][Debug] Authorization header construction:", {
      rawApiKeyStart: rawApiKey?.substring(0, 15) + "...",
      authHeaderStart: authHeader.substring(0, 25) + "...",
      hasDoubleBearer: authHeader.toLowerCase().includes('bearer bearer')
    });
    
    const headers = {
      Authorization: authHeader,
      "Content-Type": "application/json",
      Accept: "application/json",
    } as const;

    const primary = signers[0];
    if (!primary?.email) {
      return res.status(400).json({ error: "Signer email requis" });
    }
    const secondary = signers[1];

    let body: any = {
      pdf: {
        alerts: undefined as unknown as string | undefined,
        infos: message ?? undefined,
        title: subject || "Signature de document",
        content: fileBase64,
        filename: filename || "document.pdf",
        posx: primary?.posX ? Math.round(primary.posX) : 5000,
        posy: primary?.posY ? Math.round(primary.posY) : 5000,
        signonpage: typeof primary?.page === "number" ? primary.page : 1,
        stampnumber: undefined as unknown as number | undefined,
        autoposition: !primary?.posX || !primary?.posY ? true : false,
        stampArray: undefined as unknown as any[] | undefined,
      },
      to: {
        email: primary.email,
        mobile: primary.mobile || "",
        firstname: primary.firstName || "",
        lastname: primary.lastName || "",
        signPosX: primary?.posX ? Math.round(primary.posX) : 5000,
        signPosY: primary?.posY ? Math.round(primary.posY) : 5000,
        signPage: typeof primary?.page === "number" ? primary.page : 1,
        autoposition: !primary?.posX || !primary?.posY ? true : false,
        multiSign: [],
        "multiSign[email]": primary.email,
      },
    };

    if (secondary?.email) {
      body.from = {
        email: secondary.email,
        mobile: secondary.mobile || "",
        firstname: secondary.firstName || "",
        lastname: secondary.lastName || "",
        signPosX: secondary?.posX ? Math.round(secondary.posX) : 5000,
        signPosY: secondary?.posY ? Math.round(secondary.posY) : 5000,
        signPage: typeof secondary?.page === "number" ? secondary.page : 1,
        autoposition: !secondary?.posX || !secondary?.posY ? true : false,
        signArray: [],
      };
    }

    // Validation des données avant envoi
    const validation = {
      hasEmail: !!primary?.email,
      hasValidEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(primary?.email || ''),
      hasValidPDF: fileBase64.startsWith('JVBERi'),
      pdfSize: fileBase64.length,
      signersCount: signers.length
    };

    console.log("[UpToSign][API] Validation:", validation);

    if (!validation.hasValidEmail) {
      return res.status(400).json({ error: "Email du signataire invalide", validation });
    }

    if (!validation.hasValidPDF) {
      return res.status(400).json({ error: "PDF invalide ou corrompu", validation });
    }

    console.log("[UpToSign][API] About to send to UpToSign:", {
      url: String(url),
      method: "POST",
      headers: { ...headers, Authorization: `${headers.Authorization.substring(0, 20)}...` },
      bodyKeys: Object.keys(body),
      pdfContentLength: body.pdf.content.length,
      validation
    });

    const upstream = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch {}

    if (!upstream.ok) {
      console.log("[UpToSign][API] UpToSign error:", { status: upstream.status, body: text });
      // Renvoyer la réponse brute d'UpToSign
      return res.status(upstream.status).json({ 
        error: "UpToSign API Error",
        uptoSignResponse: json || text,
        status: upstream.status,
        statusText: upstream.statusText
      });
    }

    const processId = json?.id;
    if (!processId) {
      console.log("[UpToSign][API] Unexpected response:", json);
      return res.status(502).json({ 
        error: "Réponse UpToSign inattendue",
        uptoSignResponse: json || text
      });
    }

    // Renvoyer la réponse complète d'UpToSign + notre processId
    return res.status(200).json({ 
      processId,
      uptoSignResponse: json,
      success: true
    });
  } catch (error: any) {
    const status = (error && (error as any).status) || 500;
    const message = error?.message || "Internal Server Error";
    console.error("/api/uptosign-start-process error:", { message, status });
    return res.status(status).json({ error: message });
  }
}
