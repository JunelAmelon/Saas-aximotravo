export interface UpToSignSigner {
  email: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  page?: number; // 1-based page number
  posX?: number; // coordinates in px expected by API
  posY?: number;
}

// Our internal payload (frontend -> API route)
export interface UpToSignStartPayload {
  // In the current flow we pass a URL that the API route fetches and converts to base64
  pdfUrl: string; // URL of the PDF to fetch server-side
  signers: UpToSignSigner[]; // for now we use first signer as `to`
  subject?: string; // will be mapped to pdf.title
  message?: string;
  filename?: string; // optional, fallback to document.pdf
}

// Raw UpToSign response for POST /api/documents
export interface UpToSignDocumentsResponse {
  id: string;
  action: string;
  message: string | null;
  errors: any;
  status: number; // 0 success
}

// Normalized response we return to our callers
export interface UpToSignStartResponse {
  processId: string; // mapped from response.id
  signUrl?: string; // not provided by this endpoint, reserved for future
}

// Normalized status structure used across the app
export interface UpToSignStatusSigner {
  email: string;
  status: 'pending' | 'in_progress' | 'signed' | 'refused' | 'expired' | string;
  signedAt?: Date;
}

export interface UpToSignStatusNormalizedResponse {
  processId: string;
  status: 'pending' | 'in_progress' | 'signed' | 'completed' | 'refused' | 'expired' | string;
  isCompleted: boolean;
  createdAt: Date;
  completedAt?: Date;
  signers: UpToSignStatusSigner[];
}

// Download response returned by our API route
export interface UpToSignDownloadResponse {
  success?: boolean;
  base64Content?: string; // PDF base64 content
  documentUrl?: string;   // Alternative: direct URL
}

// Configuration used by UI/hooks to start a devis signature
export interface DevisSignatureConfig {
  devisId: string;
  clientEmail: string;
  clientName: string;
  clientPhone?: string;
  artisanEmail?: string;
  artisanName?: string;
  subject?: string;
  message?: string;
}
