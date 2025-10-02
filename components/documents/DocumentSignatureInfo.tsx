import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileSignature, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Download
} from 'lucide-react';
import { useDownloadSignedDocument } from '@/hooks/useUpToSign';

interface DocumentSignatureInfoProps {
  document: {
    id: string;
    name: string;
    category: string;
    devisConfigId?: string;
    uptoSignProcessId?: string;
    uptoSignStatus?: string;
    uptoSignSignedAt?: Date | string;
  };
  onViewStatus?: (processId: string) => void;
  className?: string;
}

export default function DocumentSignatureInfo({
  document,
  onViewStatus,
  className
}: DocumentSignatureInfoProps) {
  const { downloadSignedDocument } = useDownloadSignedDocument();

  // Ne pas afficher si ce n'est pas un devis ou s'il n'y a pas de processus de signature
  if (document.category !== 'devis' || !document.uptoSignProcessId) {
    return null;
  }

  const getStatusIcon = () => {
    switch (document.uptoSignStatus) {
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
    switch (document.uptoSignStatus) {
      case 'signed':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 text-xs">Signé</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">En attente</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">En cours</Badge>;
      case 'refused':
        return <Badge className="bg-red-100 text-red-800 text-xs">Refusé</Badge>;
      case 'expired':
        return <Badge className="bg-orange-100 text-orange-800 text-xs">Expiré</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{document.uptoSignStatus}</Badge>;
    }
  };

  const handleDownload = async () => {
    if (!document.uptoSignProcessId) return;
    
    try {
      await downloadSignedDocument(
        document.uptoSignProcessId, 
        `${document.name}-signe.pdf`
      );
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const isCompleted = ['signed', 'completed'].includes(document.uptoSignStatus || '');
  const signedDate = document.uptoSignSignedAt 
    ? new Date(document.uptoSignSignedAt).toLocaleDateString('fr-FR')
    : null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icône et statut */}
      <div className="flex items-center gap-1">
        <FileSignature className="w-4 h-4 text-gray-500" />
        {getStatusIcon()}
        {getStatusBadge()}
      </div>

      {/* Date de signature si disponible */}
      {isCompleted && signedDate && (
        <span className="text-xs text-gray-500">
          Signé le {signedDate}
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Bouton voir détails */}
        <Button
          onClick={() => onViewStatus?.(document.uptoSignProcessId!)}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          title="Voir le statut de signature"
        >
          <Eye className="w-3 h-3" />
        </Button>

        {/* Bouton télécharger si signé */}
        {isCompleted && (
          <Button
            onClick={handleDownload}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            title="Télécharger le document signé"
          >
            <Download className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Composant compact pour afficher juste le statut de signature
 */
export function CompactSignatureStatus({
  status,
  className
}: {
  status?: string;
  className?: string;
}) {
  if (!status) return null;

  const getStatusColor = () => {
    switch (status) {
      case 'signed':
      case 'completed':
        return 'text-green-600';
      case 'refused':
        return 'text-red-600';
      case 'expired':
        return 'text-orange-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'signed':
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'refused':
        return <XCircle className="w-3 h-3" />;
      case 'expired':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className={`flex items-center gap-1 ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      <FileSignature className="w-3 h-3" />
    </div>
  );
}
