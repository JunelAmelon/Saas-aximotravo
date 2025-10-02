import React, { useState, useEffect } from 'react';
import { X, FileText, Mail, User, Phone, Send, CheckCircle, AlertCircle, Download } from 'lucide-react';
import type { DevisSignatureConfig, UpToSignSigner, UpToSignStartResponse, UpToSignStatusNormalizedResponse } from '@/types/uptosign';

interface DevisSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  devisId: string;
  devisPdfUrl: string;
  devisTitle: string;
  clientInfo?: {
    email?: string;
    name?: string;
    phone?: string;
  };
  onSignatureComplete?: (processId: string) => void;
}

export default function DevisSignatureModal({
  isOpen,
  onClose,
  devisId,
  devisPdfUrl,
  devisTitle,
  clientInfo,
  onSignatureComplete
}: DevisSignatureModalProps) {
  const [signers, setSigners] = useState<UpToSignSigner[]>([
    {
      email: clientInfo?.email || '',
      firstName: clientInfo?.name?.split(' ')[0] || '',
      lastName: clientInfo?.name?.split(' ').slice(1).join(' ') || '',
      mobile: clientInfo?.phone || '',
      posX: 50,
      posY: 80,
      page: 1
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [processId, setProcessId] = useState<string | null>(null);
  const [status, setStatus] = useState<UpToSignStatusNormalizedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState(`Signature du devis - ${devisTitle}`);
  const [message, setMessage] = useState('Veuillez signer ce devis pour confirmer votre accord.');

  // Polling du statut si un processus est en cours
  useEffect(() => {
    if (!processId) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/uptosign-status?processId=${processId}`);
        if (response.ok) {
          const statusData = await response.json();
          setStatus(statusData);
          
          if (statusData.isCompleted) {
            onSignatureComplete?.(processId);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
      }
    };

    // Vérifier immédiatement puis toutes les 30 secondes
    pollStatus();
    const interval = setInterval(pollStatus, 30000);

    return () => clearInterval(interval);
  }, [processId, onSignatureComplete]);

  const handleAddSigner = () => {
    setSigners([...signers, {
      email: '',
      firstName: '',
      lastName: '',
      mobile: '',
      posX: 50,
      posY: 80,
      page: 1
    }]);
  };

  const handleRemoveSigner = (index: number) => {
    if (signers.length > 1) {
      setSigners(signers.filter((_, i) => i !== index));
    }
  };

  const handleSignerChange = (index: number, field: keyof UpToSignSigner, value: string | number) => {
    const updatedSigners = [...signers];
    updatedSigners[index] = { ...updatedSigners[index], [field]: value };
    setSigners(updatedSigners);
  };

  const handleStartSignature = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validation
      const validSigners = signers.filter(s => s.email.trim());
      if (validSigners.length === 0) {
        throw new Error('Au moins un signataire avec email est requis');
      }

      const payload = {
        pdfUrl: devisPdfUrl,
        signers: validSigners,
        subject,
        message,
        filename: `devis-${devisId}.pdf`
      };

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

      setProcessId(result.processId);
      console.log('Processus de signature démarré:', result);

    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSigned = async () => {
    if (!processId) return;

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
        a.download = `devis-${devisId}-signe.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (result.documentUrl) {
        // Ouvrir l'URL dans un nouvel onglet
        window.open(result.documentUrl, '_blank');
      }

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setError(error instanceof Error ? error.message : 'Erreur de téléchargement');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Signature électronique</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Document Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Document à signer</h3>
            <p className="text-sm text-gray-600">{devisTitle}</p>
            <p className="text-xs text-gray-500 mt-1">ID: {devisId}</p>
          </div>

          {/* Status Display */}
          {processId && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {status?.isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                )}
                <h3 className="font-medium">
                  {status?.isCompleted ? 'Signature terminée' : 'Signature en cours'}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Processus ID: {processId}
              </p>
              
              {status && (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Statut:</span> {status.status}
                  </p>
                  {status.signers.map((signer, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{signer.email}:</span> {signer.status}
                      {signer.signedAt && (
                        <span className="text-gray-500 ml-2">
                          (signé le {signer.signedAt.toLocaleDateString()})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {status?.isCompleted && (
                <button
                  onClick={handleDownloadSigned}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Télécharger le document signé
                </button>
              )}
            </div>
          )}

          {/* Configuration Form (only show if no process started) */}
          {!processId && (
            <>
              {/* Subject and Message */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Objet de l'email
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message personnalisé
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Signers */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Signataires</h3>
                  <button
                    onClick={handleAddSigner}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Ajouter un signataire
                  </button>
                </div>

                <div className="space-y-4">
                  {signers.map((signer, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">Signataire {index + 1}</h4>
                        {signers.length > 1 && (
                          <button
                            onClick={() => handleRemoveSigner(index)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            <Mail className="w-3 h-3 inline mr-1" />
                            Email *
                          </label>
                          <input
                            type="email"
                            value={signer.email}
                            onChange={(e) => handleSignerChange(index, 'email', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1">
                            <Phone className="w-3 h-3 inline mr-1" />
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            value={signer.mobile || ''}
                            onChange={(e) => handleSignerChange(index, 'mobile', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1">
                            <User className="w-3 h-3 inline mr-1" />
                            Prénom
                          </label>
                          <input
                            type="text"
                            value={signer.firstName || ''}
                            onChange={(e) => handleSignerChange(index, 'firstName', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Nom
                          </label>
                          <input
                            type="text"
                            value={signer.lastName || ''}
                            onChange={(e) => handleSignerChange(index, 'lastName', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Position X (%)
                          </label>
                          <input
                            type="number"
                            value={signer.posX || 50}
                            onChange={(e) => handleSignerChange(index, 'posX', parseInt(e.target.value))}
                            min="0"
                            max="100"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Position Y (%)
                          </label>
                          <input
                            type="number"
                            value={signer.posY || 80}
                            onChange={(e) => handleSignerChange(index, 'posY', parseInt(e.target.value))}
                            min="0"
                            max="100"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Page
                          </label>
                          <input
                            type="number"
                            value={signer.page || 1}
                            onChange={(e) => handleSignerChange(index, 'page', parseInt(e.target.value))}
                            min="1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {processId ? 'Fermer' : 'Annuler'}
          </button>
          
          {!processId && (
            <button
              onClick={handleStartSignature}
              disabled={isLoading || signers.filter(s => s.email.trim()).length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Démarrage...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Démarrer la signature
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
