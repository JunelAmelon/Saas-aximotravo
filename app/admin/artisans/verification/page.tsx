"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Building, 
  Mail, 
  Phone,
  Calendar,
  Search,
  Eye,
  FileText,
  Download,
  MapPin,
  Briefcase,
  CreditCard,
  Shield,
  ArrowLeft
} from 'lucide-react';

interface PendingArtisan {
  tempId: string;
  role?: 'artisan';
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  companyName: string;
  secteur?: string;
  courtierId?: string;
  specialite?: string;
  companyAddress?: string;
  companyPostalCode?: string;
  companyCity?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyLegalForm?: string;
  siret?: string;
  rcs?: string;
  companyApe?: string;
  companyTva?: string;
  companyCapital?: string;
  hasCertification?: string;
  certificationUrl?: string | null;
  insuranceDate?: string;
  assuranceUrl?: string | null;
  fiscalUrl?: string | null;
  kbisUrl?: string | null;
  companyLogoUrl?: string;
  status?: "validated" | "pending" | "rejected";
  courtierName?: string;
  submittedAt?: any;
  validatedAt?: Date | null;
  rejectedAt?: Date | null;
  rejectedReason?: string;
  authCreated?: boolean;
  // Legacy fields for backward compatibility
  address?: string;
  city?: string;
  postalCode?: string;
  experience?: string;
  description?: string;
  // Documents
  idCardUrl?: string | null;
  charterUrl?: string | null;
  // Deprecated legacy (kept for backward compatibility)
  qualityCharterUrl?: string | null;
  obligationsUrl?: string | null;
}

export default function AdminArtisansPage() {
  const [pendingArtisans, setPendingArtisans] = useState<PendingArtisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtisan, setSelectedArtisan] = useState<PendingArtisan | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Charger les artisans en attente
  const loadPendingArtisans = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "pending_artisans"));
      const snapshot = await getDocs(q);
      
      const artisans = snapshot.docs.map(doc => ({
        tempId: doc.id,
        ...doc.data()
      })) as PendingArtisan[];

      setPendingArtisans(artisans);
    } catch (error) {
      console.error("Erreur lors du chargement des artisans:", error);
      toast({
        variant: "destructive",
        description: "Erreur lors du chargement des artisans"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadPendingArtisans();
    }
  }, [currentUser]);

  // Valider un artisan
  const handleValidateArtisan = async () => {
    if (!selectedArtisan) return;
    
    setProcessingAction(true);
    try {
      const response = await fetch('/api/provision-artisan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempId: selectedArtisan.tempId,
          action: 'validate'
        })
      });

      if (response.ok) {
        await loadPendingArtisans();
        setShowValidationModal(false);
        setSelectedArtisan(null);
        toast({
          description: "Artisan validé avec succès"
        });
      } else {
        // Récupérer l'erreur spécifique de l'API
        const errorData = await response.json();
        toast({
          variant: "destructive",
          description: errorData.error || "Erreur lors de la validation de l'artisan"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      toast({
        variant: "destructive",
        description: "Erreur de connexion lors de la validation"
      });
    } finally {
      setProcessingAction(false);
    }
  };

  // Rejeter un artisan
  const handleRejectArtisan = async () => {
    if (!selectedArtisan || !rejectionReason.trim()) return;
    
    setProcessingAction(true);
    try {
      const response = await fetch('/api/provision-artisan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempId: selectedArtisan.tempId,
          action: 'reject',
          rejectedReason: rejectionReason
        })
      });

      if (response.ok) {
        await loadPendingArtisans();
        setShowRejectionModal(false);
        setSelectedArtisan(null);
        setRejectionReason('');
        toast({
          description: "Artisan rejeté avec succès"
        });
      } else {
        // Récupérer l'erreur spécifique de l'API
        const errorData = await response.json();
        toast({
          variant: "destructive",
          description: errorData.error || "Erreur lors du rejet de l'artisan"
        });
      }
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      toast({
        variant: "destructive",
        description: "Erreur de connexion lors du rejet de l'artisan"
      });
    } finally {
      setProcessingAction(false);
    }
  };

  // Filtrer les artisans
  const filteredArtisans = pendingArtisans.filter(artisan => {
    const matchesSearch = 
      artisan.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artisan.companyName && artisan.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Non défini';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  console.log(filteredArtisans);

  const getDocumentStatus = (artisan: PendingArtisan) => {
    const charter = artisan.charterUrl || artisan.qualityCharterUrl || artisan.obligationsUrl;
    const docs = [
      artisan.certificationUrl,
      artisan.assuranceUrl,
      artisan.fiscalUrl,
      artisan.kbisUrl,
      artisan.idCardUrl,
      charter
    ].filter(Boolean);
    return `${docs.length}/6`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#f26755] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement des artisans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <button 
                onClick={() => window.location.href = '/admin/artisans'}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors flex items-center gap-2 flex-shrink-0"
                title="Retour à la page principale"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#f26755] to-[#f21515] rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">Vérification des Artisans</h1>
                <p className="text-slate-600 mt-1 text-sm sm:text-base hidden sm:block">Validation des nouveaux dossiers d'artisans</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#f26755] focus:border-transparent outline-none transition-all duration-200 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* Liste des artisans */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredArtisans.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucun artisan en attente</h3>
              <p className="text-slate-600">Tous les dossiers ont été traités.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredArtisans.map((artisan) => (
                <div key={artisan.tempId} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                            {artisan.firstName} {artisan.lastName}
                          </h3>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium self-start ${
                            getDocumentStatus(artisan) === '6/6' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            Documents: {getDocumentStatus(artisan)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 mb-3">
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{artisan.email}</span>
                          </div>
                          {artisan.phoneNumber && (
                            <div className="flex items-center gap-2 truncate">
                              <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{artisan.phoneNumber}</span>
                            </div>
                          )}
                          {artisan.companyName && (
                            <div className="flex items-center gap-2 truncate">
                              <Building className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{artisan.companyName}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>Soumis le {formatDate(artisan.submittedAt)}</span>
                          </div>
                          {artisan.courtierName && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 flex-shrink-0" />
                              <span>Par {artisan.courtierName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 lg:flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedArtisan(artisan);
                          setShowDetailsModal(true);
                        }}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Détails</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedArtisan(artisan);
                          setShowValidationModal(true);
                        }}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Valider</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedArtisan(artisan);
                          setShowRejectionModal(true);
                        }}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Rejeter</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal des détails */}
      {showDetailsModal && selectedArtisan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      {selectedArtisan.firstName} {selectedArtisan.lastName}
                    </h3>
                    <p className="text-slate-600">Dossier artisan - Vérification complète</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                >
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Informations personnelles */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-600" />
                  Informations personnelles
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Prénom</label>
                    <p className="text-slate-900 font-medium">{selectedArtisan.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Nom</label>
                    <p className="text-slate-900 font-medium">{selectedArtisan.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Email</label>
                    <p className="text-slate-900 font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {selectedArtisan.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Téléphone</label>
                    <p className="text-slate-900 font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {selectedArtisan.phoneNumber || 'Non renseigné'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations entreprise */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-slate-600" />
                  Informations entreprise
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Nom de l'entreprise</label>
                    <p className="text-slate-900 font-medium">{selectedArtisan.companyName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Secteur d'activité</label>
                    <p className="text-slate-900 font-medium flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      {selectedArtisan.secteur || 'Non renseigné'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Spécialité</label>
                    <p className="text-slate-900 font-medium flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      {selectedArtisan.specialite || 'Non renseignée'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Adresse</label>
                    <p className="text-slate-900 font-medium">{selectedArtisan.companyAddress || selectedArtisan.address || 'Non renseignée'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Code postal</label>
                    <p className="text-slate-900 font-medium">{selectedArtisan.companyPostalCode || selectedArtisan.postalCode || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Ville</label>
                    <p className="text-slate-900 font-medium">{selectedArtisan.companyCity || selectedArtisan.city || 'Non renseignée'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Téléphone entreprise</label>
                    <p className="text-slate-900 font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {selectedArtisan.companyPhone || 'Non renseigné'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Email entreprise</label>
                    <p className="text-slate-900 font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {selectedArtisan.companyEmail || 'Non renseigné'}
                    </p>
                  </div>
                </div>
                
                {/* Logo de l'entreprise */}
                {selectedArtisan.companyLogoUrl && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <label className="text-sm font-medium text-slate-600 block mb-3">Logo de l'entreprise</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-white rounded-xl border-2 border-slate-200 overflow-hidden flex items-center justify-center">
                        <img
                          src={selectedArtisan.companyLogoUrl}
                          alt={`Logo ${selectedArtisan.companyName}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<div class="text-slate-400 text-xs text-center">Logo non disponible</div>';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 mb-2">Aperçu du logo fourni par l'artisan</p>
                        <a
                          href={selectedArtisan.companyLogoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          <span>Télécharger</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Informations légales */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-slate-600" />
                  Informations légales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Forme juridique</label>
                    <p className="text-slate-900 font-medium">{selectedArtisan.companyLegalForm || 'Non renseignée'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">SIRET</label>
                    <p className="text-slate-900 font-medium flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      {selectedArtisan.siret || 'Non renseigné'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">RCS</label>
                    <p className="text-slate-900 font-medium">{selectedArtisan.rcs || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Code APE</label>
                    <p className="text-slate-900 font-medium">{selectedArtisan.companyApe || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">N° TVA</label>
                    <p className="text-slate-900 font-medium">{selectedArtisan.companyTva || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Capital social</label>
                    <p className="text-slate-900 font-medium">{selectedArtisan.companyCapital || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>

              {/* Certifications et assurances */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-slate-600" />
                  Certifications et assurances
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Certification professionnelle</label>
                    <p className="text-slate-900 font-medium">{selectedArtisan.hasCertification || 'Non renseignée'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Date d'assurance</label>
                    <p className="text-slate-900 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {selectedArtisan.insuranceDate || 'Non renseignée'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations complémentaires */}
              {(selectedArtisan.experience || selectedArtisan.description) && (
                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-600" />
                    Informations complémentaires
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedArtisan.experience && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">Expérience</label>
                        <p className="text-slate-900 font-medium">{selectedArtisan.experience}</p>
                      </div>
                    )}
                    {selectedArtisan.description && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-slate-600">Description</label>
                        <p className="text-slate-700 leading-relaxed">{selectedArtisan.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-slate-600" />
                  Documents fournis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Certification professionnelle', url: selectedArtisan.certificationUrl, key: 'certification' },
                    { label: 'Assurance responsabilité civile', url: selectedArtisan.assuranceUrl, key: 'insurance' },
                    { label: 'Attestation fiscale', url: selectedArtisan.fiscalUrl, key: 'fiscal' },
                    { label: 'Extrait KBIS', url: selectedArtisan.kbisUrl, key: 'kbis' },
                    { label: "Carte d'identité", url: selectedArtisan.idCardUrl, key: 'idCard' },
                    { label: 'Charte/Obligations', url: (selectedArtisan.charterUrl || selectedArtisan.qualityCharterUrl || selectedArtisan.obligationsUrl), key: 'charter' }
                  ].map((doc) => (
                    <div key={doc.key} className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          doc.url ? 'bg-emerald-100' : 'bg-slate-100'
                        }`}>
                          <FileText className={`w-5 h-5 ${
                            doc.url ? 'text-emerald-600' : 'text-slate-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{doc.label}</p>
                          <p className={`text-sm ${
                            doc.url ? 'text-emerald-600' : 'text-slate-500'
                          }`}>
                            {doc.url ? 'Document fourni' : 'Non fourni'}
                          </p>
                        </div>
                      </div>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm font-medium">Voir</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Informations de soumission */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  Informations de soumission
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Date de soumission</label>
                    <p className="text-slate-900 font-medium">{formatDate(selectedArtisan.submittedAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Soumis par</label>
                    <p className="text-slate-900 font-medium">{selectedArtisan.courtierName || 'Courtier non identifié'}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowValidationModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Valider ce dossier</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowRejectionModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Rejeter ce dossier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de validation */}
      {showValidationModal && selectedArtisan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Valider l'artisan</h3>
              <p className="text-slate-600">
                Êtes-vous sûr de vouloir valider le dossier de{' '}
                <strong>{selectedArtisan.firstName} {selectedArtisan.lastName}</strong> ?
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowValidationModal(false)}
                disabled={processingAction}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleValidateArtisan}
                disabled={processingAction}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 font-medium disabled:opacity-50"
              >
                {processingAction ? 'Validation...' : 'Valider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rejet */}
      {showRejectionModal && selectedArtisan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Rejeter l'artisan</h3>
              <p className="text-slate-600 mb-4">
                Veuillez indiquer le motif du rejet pour{' '}
                <strong>{selectedArtisan.firstName} {selectedArtisan.lastName}</strong>
              </p>
            </div>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Motif du rejet (obligatoire)..."
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-200 mb-4"
              rows={4}
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                }}
                disabled={processingAction}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleRejectArtisan}
                disabled={processingAction || !rejectionReason.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 font-medium disabled:opacity-50"
              >
                {processingAction ? 'Rejet...' : 'Rejeter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
