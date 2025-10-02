import { useState, useCallback } from 'react';
import { useUpToSign } from './useUpToSign';
import { updateDocument } from '@/lib/firebase/firestore';
import type { DevisSignatureConfig } from '@/types/uptosign';

interface UseDevisSignatureReturn {
  startDevisSignature: (config: DevisSignatureConfig) => Promise<string>;
  updateDevisSignatureStatus: (devisId: string, processId: string, status: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useDevisSignature(): UseDevisSignatureReturn {
  const { startSignature, isLoading, error } = useUpToSign();
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const startDevisSignature = useCallback(async (config: DevisSignatureConfig): Promise<string> => {
    setLocalLoading(true);
    setLocalError(null);

    try {
      // Construire les signataires
      const signers = [
        {
          email: config.clientEmail,
          firstName: config.clientName.split(' ')[0] || '',
          lastName: config.clientName.split(' ').slice(1).join(' ') || '',
          mobile: config.clientPhone || '',
          posX: 50,
          posY: 80,
          page: 1
        }
      ];

      // Ajouter l'artisan comme second signataire si fourni
      if (config.artisanEmail && config.artisanName) {
        signers.push({
          email: config.artisanEmail,
          firstName: config.artisanName.split(' ')[0] || '',
          lastName: config.artisanName.split(' ').slice(1).join(' ') || '',
          mobile: '',
          posX: 50,
          posY: 60,
          page: 1
        });
      }

      // Démarrer le processus de signature
      const result = await startSignature({
        pdfUrl: `${window.location.origin}/api/devis-pdf/${config.devisId}`, // URL vers le PDF du devis
        signers,
        subject: config.subject || `Signature du devis - ${config.devisId}`,
        message: config.message || 'Veuillez signer ce devis pour confirmer votre accord.',
        filename: `devis-${config.devisId}.pdf`
      });

      // Mettre à jour le devis avec l'ID du processus
      await updateDocument('devisConfig', config.devisId, {
        uptoSignProcessId: result.processId,
        uptoSignStatus: 'pending',
        updatedAt: new Date()
      });

      return result.processId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setLocalError(errorMessage);
      throw err;
    } finally {
      setLocalLoading(false);
    }
  }, [startSignature]);

  const updateDevisSignatureStatus = useCallback(async (
    devisId: string, 
    processId: string, 
    status: string
  ): Promise<void> => {
    try {
      const updateData: any = {
        uptoSignStatus: status,
        updatedAt: new Date()
      };

      // Si la signature est terminée, marquer la date
      if (['signed', 'completed'].includes(status)) {
        updateData.uptoSignSignedAt = new Date();
        updateData.status = 'Signé'; // Mettre à jour le statut du devis
      }

      await updateDocument('devisConfig', devisId, updateData);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      throw err;
    }
  }, []);

  return {
    startDevisSignature,
    updateDevisSignatureStatus,
    isLoading: isLoading || localLoading,
    error: error || localError,
  };
}

/**
 * Hook pour vérifier le statut de signature d'un devis
 */
export function useDevisSignatureStatus(devisId: string, processId?: string) {
  const [status, setStatus] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const { checkStatus } = useUpToSign();

  const refreshStatus = useCallback(async () => {
    if (!processId) return;

    try {
      const statusData = await checkStatus(processId);
      setStatus(statusData.status);
      setIsCompleted(statusData.isCompleted);

      // Mettre à jour le devis si le statut a changé
      if (statusData.isCompleted) {
        await updateDocument('devisConfig', devisId, {
          uptoSignStatus: statusData.status,
          uptoSignSignedAt: new Date(),
          status: 'Signé',
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
    }
  }, [processId, devisId, checkStatus]);

  return {
    status,
    isCompleted,
    refreshStatus
  };
}
