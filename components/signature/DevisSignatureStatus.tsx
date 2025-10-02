import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileSignature, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download, 
  RefreshCw,
  AlertCircle,
  Users
} from 'lucide-react';
import { useUpToSign, useDownloadSignedDocument } from '@/hooks/useUpToSign';
import type { UpToSignStatusNormalizedResponse } from '@/types/uptosign';

interface DevisSignatureStatusProps {
  processId: string;
  devisId: string;
  onStatusChange?: (status: UpToSignStatusNormalizedResponse) => void;
  className?: string;
}

export default function DevisSignatureStatus({
  processId,
  devisId,
  onStatusChange,
  className
}: DevisSignatureStatusProps) {
  const { checkStatus, isLoading } = useUpToSign();
  const { downloadSignedDocument } = useDownloadSignedDocument();
  
  const [status, setStatus] = useState<UpToSignStatusNormalizedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refreshStatus = async () => {
    if (!processId) return;

    try {
      setError(null);
      const statusData = await checkStatus(processId);
      setStatus(statusData);
      setLastRefresh(new Date());
      onStatusChange?.(statusData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la vérification du statut');
    }
  };

  // Rafraîchissement automatique toutes les 30 secondes si pas terminé
  useEffect(() => {
    if (!processId) return;

    // Vérification initiale
    refreshStatus();

    // Polling automatique si pas terminé
    const interval = setInterval(() => {
      if (status && !status.isCompleted) {
        refreshStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [processId, status?.isCompleted]);

  const handleDownload = async () => {
    try {
      await downloadSignedDocument(processId, `devis-${devisId}-signe.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement');
    }
  };

  const getStatusIcon = () => {
    if (!status) return <Clock className="w-4 h-4" />;
    
    switch (status.status) {
      case 'signed':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'refused':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusBadge = () => {
    if (!status) return <Badge variant="secondary">Chargement...</Badge>;
    
    switch (status.status) {
      case 'signed':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Signé</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">En attente</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>;
      case 'refused':
        return <Badge className="bg-red-100 text-red-800">Refusé</Badge>;
      case 'expired':
        return <Badge className="bg-orange-100 text-orange-800">Expiré</Badge>;
      default:
        return <Badge variant="secondary">{status.status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Signature électronique</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Processus ID: {processId}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Erreur</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {status && (
          <>
            {/* Informations générales */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Statut:</span>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon()}
                  <span className="capitalize">{status.status}</span>
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Créé le:</span>
                <p className="mt-1">{formatDate(status.createdAt)}</p>
              </div>
              {status.completedAt && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-600">Terminé le:</span>
                  <p className="mt-1">{formatDate(status.completedAt)}</p>
                </div>
              )}
            </div>

            {/* Liste des signataires */}
            {status.signers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-600">Signataires</span>
                </div>
                <div className="space-y-2">
                  {status.signers.map((signer, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{signer.email}</p>
                        {signer.signedAt && (
                          <p className="text-xs text-gray-500">
                            Signé le {formatDate(signer.signedAt)}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant={signer.status === 'signed' ? 'default' : 'secondary'}
                        className={
                          signer.status === 'signed' 
                            ? 'bg-green-100 text-green-800' 
                            : signer.status === 'refused'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {signer.status === 'signed' ? 'Signé' : 
                         signer.status === 'refused' ? 'Refusé' : 
                         'En attente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={refreshStatus}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Actualiser
          </Button>

          {status?.isCompleted && (
            <Button
              onClick={handleDownload}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
          )}
        </div>

        {lastRefresh && (
          <p className="text-xs text-gray-500 text-center">
            Dernière mise à jour: {formatDate(lastRefresh)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
