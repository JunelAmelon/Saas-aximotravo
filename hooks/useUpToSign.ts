import { useState, useCallback } from 'react';
import type { 
  UpToSignStartPayload, 
  UpToSignStartResponse, 
  UpToSignStatusNormalizedResponse,
  UpToSignDownloadResponse 
} from '@/types/uptosign';

interface UseUpToSignReturn {
  startSignature: (payload: UpToSignStartPayload) => Promise<UpToSignStartResponse>;
  checkStatus: (processId: string) => Promise<UpToSignStatusNormalizedResponse>;
  downloadDocument: (processId: string) => Promise<UpToSignDownloadResponse>;
  isLoading: boolean;
  error: string | null;
}

export function useUpToSign(): UseUpToSignReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSignature = useCallback(async (payload: UpToSignStartPayload): Promise<UpToSignStartResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/uptosign-start-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du démarrage de la signature');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkStatus = useCallback(async (processId: string): Promise<UpToSignStatusNormalizedResponse> => {
    setError(null);

    try {
      const response = await fetch(`/api/uptosign-status?processId=${processId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la vérification du statut');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const downloadDocument = useCallback(async (processId: string): Promise<UpToSignDownloadResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/uptosign-download?processId=${processId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du téléchargement');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    startSignature,
    checkStatus,
    downloadDocument,
    isLoading,
    error,
  };
}

/**
 * Hook pour télécharger automatiquement un document signé
 */
export function useDownloadSignedDocument() {
  const downloadSignedDocument = useCallback(async (
    processId: string, 
    filename?: string
  ): Promise<void> => {
    try {
      const response = await fetch(`/api/uptosign-download?processId=${processId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du téléchargement');
      }

      if (result.base64Content) {
        // Créer un blob et télécharger
        const byteCharacters = atob(result.base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `document-signe-${processId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (result.documentUrl) {
        // Ouvrir l'URL dans un nouvel onglet
        window.open(result.documentUrl, '_blank');
      } else {
        throw new Error('Aucun document disponible');
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw error;
    }
  }, []);

  return { downloadSignedDocument };
}
