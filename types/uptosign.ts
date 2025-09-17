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
  fileBase64: string; // PDF base64 without data: prefix
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
