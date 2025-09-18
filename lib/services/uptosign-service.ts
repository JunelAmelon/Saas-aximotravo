import type { UpToSignStartPayload, UpToSignStartResponse, UpToSignDocumentsResponse } from "@/types/uptosign";

// Constantes sans fonctions: base, url et headers prêts à l'emploi
export const UPTOSIGN_BASE = (process.env.UPTOSIGN_BASE_URL || "https://dev.uptosign.com").replace(/\/$/, "");
export const UPTOSIGN_URL = new URL(`${UPTOSIGN_BASE}/api/documents`);
export const UPTOSIGN_HEADERS = {
  Authorization: `Bearer ${process.env.UPTOSIGN_API_KEY}`,
  "Content-Type": "application/json",
  Accept: "application/json",
} as const;

// Gabarit de corps de requête (à compléter avant envoi)
export type UpToSignRequestBody = {
  pdf: {
    alerts?: string;
    infos?: string;
    title: string;
    content: string; // PDF en base64 (sans préfixe data:)
    filename: string;
    posx: number;
    posy: number;
    signonpage: number;
    stampnumber?: number;
    autoposition: boolean;
    stampArray?: any[];
  };
  from?: {
    email: string;
    mobile?: string;
    firstname?: string;
    lastname?: string;
    signPosX?: number;
    signPosY?: number;
    signPage?: number;
    autoposition?: boolean;
    signArray?: any[];
  };
  to: {
    email: string;
    mobile?: string;
    firstname?: string;
    lastname?: string;
    signPosX: number;
    signPosY: number;
    signPage: number;
    autoposition: boolean;
    multiSign: any[];
    "multiSign[email]": string;
  };
};

// Exemple de structure de body à adapter avant envoi
export const UPTOSIGN_BODY_EXAMPLE: UpToSignRequestBody = {
  pdf: {
    alerts: undefined,
    infos: undefined,
    title: "Signature de document",
    content: "<BASE64_PDF>",
    filename: "document.pdf",
    posx: 5000,
    posy: 5000,
    signonpage: 1,
    stampnumber: undefined,
    autoposition: true,
    stampArray: undefined,
  },
  to: {
    email: "destinataire@example.com",
    mobile: "",
    firstname: "",
    lastname: "",
    signPosX: 5000,
    signPosY: 5000,
    signPage: 1,
    autoposition: true,
    multiSign: [],
    "multiSign[email]": "destinataire@example.com",
  },
};
