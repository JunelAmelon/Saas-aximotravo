"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
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
  UserCheck,
  UserX,
  Settings,
  ArrowLeft
} from 'lucide-react';

interface ValidatedArtisan {
  uid: string;
  role: 'artisan';
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  companyName?: string;
  secteur?: string;
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
  hasCertification?: boolean;
  insuranceDate?: any;
  status: string;
  validatedAt?: any;
  authCreated: boolean;
  isActive?: boolean;
  // Documents
  certificationUrl?: string;
  assuranceUrl?: string;
  fiscalUrl?: string;
  kbisUrl?: string;
  // Legacy fields
  address?: string;
  city?: string;
  postalCode?: string;
  experience?: string;
  description?: string;
  // New merged field
  charterUrl?: string;
  // Deprecated legacy (kept for backward compatibility)
  qualityCharterUrl?: string;
  obligationsUrl?: string;
  // Other docs
  idCardUrl?: string;
}

export default function ValidatedArtisansPage() {
  const [validatedArtisans, setValidatedArtisans] = useState<ValidatedArtisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtisan, setSelectedArtisan] = useState<ValidatedArtisan | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Charger les artisans validés
  const loadValidatedArtisans = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("role", "==", "artisan"),
        where("status", "==", "validated")
      );
      
      const snapshot = await getDocs(q);
      const artisans = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as ValidatedArtisan[];

      setValidatedArtisans(artisans);
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
      loadValidatedArtisans();
    }
  }, [currentUser]);

  // Activer/Désactiver un artisan
  const handleToggleArtisanStatus = async (artisan: ValidatedArtisan, activate: boolean) => {
    setProcessingAction(true);
    try {
      await updateDoc(doc(db, "users", artisan.uid), {
        isActive: activate,
        updatedAt: new Date()
      });

      await loadValidatedArtisans();
      toast({
        description: `Artisan ${activate ? 'activé' : 'désactivé'} avec succès`
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        variant: "destructive",
        description: "Erreur lors de la mise à jour du statut"
      });
    } finally {
      setProcessingAction(false);
    }
  };

  // Filtrer les artisans
  const filteredArtisans = validatedArtisans.filter(artisan => {
    const matchesSearch = 
      (artisan.firstName && artisan.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (artisan.lastName && artisan.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (artisan.email && artisan.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <button 
                onClick={() => window.location.href = '/admin/artisans'}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors flex items-center gap-2 flex-shrink-0"
                title="Retour à la page principale"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Artisans Validés</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base hidden sm:block">Gestion des artisans actifs sur la plateforme</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="bg-green-50 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl self-center">
                <span className="text-green-700 font-semibold text-sm sm:text-base">{filteredArtisans.length} artisan(s)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Liste des artisans */}
        <div className="grid gap-4 sm:gap-6">
          {filteredArtisans.map((artisan) => (
            <div key={artisan.uid} className="bg-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                      <Building className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                        {artisan.firstName} {artisan.lastName}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base truncate">{artisan.companyName || 'Entreprise non renseignée'}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-xs sm:text-sm text-gray-500 gap-1 sm:gap-0">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{artisan.email}</span>
                        </div>
                        {artisan.phoneNumber && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{artisan.phoneNumber}</span>
                          </div>
                        )}
                        {artisan.secteur && (
                          <div className="flex items-center space-x-1">
                            <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{artisan.secteur}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:flex-shrink-0">
                    {/* Statut */}
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-center ${
                      artisan.isActive !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {artisan.isActive !== false ? 'Actif' : 'Désactivé'}
                    </div>

                    {/* Date de validation */}
                    <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">Validé le {formatDate(artisan.validatedAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedArtisan(artisan);
                          setShowDetailsModal(true);
                        }}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors flex-1 sm:flex-initial"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4 mx-auto" />
                      </button>

                      {artisan.isActive !== false ? (
                        <button
                          onClick={() => handleToggleArtisanStatus(artisan, false)}
                          disabled={processingAction}
                          className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors disabled:opacity-50 flex-1 sm:flex-initial"
                          title="Désactiver"
                        >
                          <UserX className="h-4 w-4 mx-auto" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleArtisanStatus(artisan, true)}
                          disabled={processingAction}
                          className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition-colors disabled:opacity-50 flex-1 sm:flex-initial"
                          title="Activer"
                        >
                          <UserCheck className="h-4 w-4 mx-auto" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArtisans.length === 0 && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun artisan trouvé</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Aucun artisan ne correspond à votre recherche.' : 'Aucun artisan validé pour le moment.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {showDetailsModal && selectedArtisan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Header du modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-4">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                    Profil de {selectedArtisan.firstName} {selectedArtisan.lastName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Informations complètes de l'artisan</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* Informations personnelles */}
              <div className="bg-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4 flex items-center">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  <span>Informations personnelles</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Prénom</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedArtisan.firstName}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Nom</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedArtisan.lastName}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Email</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium break-all">{selectedArtisan.email}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Téléphone</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedArtisan.phoneNumber || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>

              {/* Informations entreprise */}
              <div className="bg-green-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-3 sm:mb-4 flex items-center">
                  <Building className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  <span>Informations entreprise</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Nom de l'entreprise</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedArtisan.companyName || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Secteur</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedArtisan.secteur || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Spécialité</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedArtisan.specialite || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Téléphone entreprise</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedArtisan.companyPhone || 'Non renseigné'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Adresse</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">
                      {selectedArtisan.companyAddress || selectedArtisan.address || 'Non renseignée'}
                      {(selectedArtisan.companyPostalCode || selectedArtisan.postalCode) && 
                        `, ${selectedArtisan.companyPostalCode || selectedArtisan.postalCode}`}
                      {(selectedArtisan.companyCity || selectedArtisan.city) && 
                        ` ${selectedArtisan.companyCity || selectedArtisan.city}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations légales */}
              <div className="bg-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-purple-900 mb-3 sm:mb-4 flex items-center">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  <span>Informations légales</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Forme juridique</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedArtisan.companyLegalForm || 'Non renseignée'}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">SIRET</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium font-mono">{selectedArtisan.siret || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">RCS</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedArtisan.rcs || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Code APE</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedArtisan.companyApe || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">N° TVA</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedArtisan.companyTva || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Capital</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedArtisan.companyCapital || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>

              {/* Certifications et assurances */}
              <div className="bg-yellow-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-yellow-900 mb-3 sm:mb-4 flex items-center">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  <span>Certifications et assurances</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Certification professionnelle</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedArtisan.hasCertification 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedArtisan.hasCertification ? 'Oui' : 'Non'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Date d'assurance</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">
                      {selectedArtisan.insuranceDate ? formatDate(selectedArtisan.insuranceDate) : 'Non renseignée'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  <span>Documents fournis</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { key: 'certificationUrl', label: 'Certification' },
                    { key: 'assuranceUrl', label: 'Assurance' },
                    { key: 'fiscalUrl', label: 'Document fiscal' },
                    { key: 'kbisUrl', label: 'KBIS' },
                    { key: 'idCardUrl', label: "Carte d'identité" },
                    { key: 'charter', label: 'Charte qualité/Obligations' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 truncate mr-2">{label}</span>
                      {key === 'charter' ? (
                        (selectedArtisan.charterUrl || selectedArtisan.qualityCharterUrl || selectedArtisan.obligationsUrl) ? (
                          <a
                            href={(selectedArtisan.charterUrl || selectedArtisan.qualityCharterUrl || selectedArtisan.obligationsUrl) as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 flex-shrink-0"
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Voir</span>
                          </a>
                        ) : (
                          <span className="text-red-600 text-xs sm:text-sm flex-shrink-0">Non fourni</span>
                        )
                      ) : (
                        selectedArtisan[key as keyof ValidatedArtisan] ? (
                          <a
                            href={selectedArtisan[key as keyof ValidatedArtisan] as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 flex-shrink-0"
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Voir</span>
                          </a>
                        ) : (
                          <span className="text-red-600 text-xs sm:text-sm flex-shrink-0">Non fourni</span>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Informations système */}
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  <span>Informations système</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Statut</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {selectedArtisan.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">Date de validation</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{formatDate(selectedArtisan.validatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer du modal */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 rounded-b-xl sm:rounded-b-2xl">
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base order-2 sm:order-1"
                >
                  Fermer
                </button>
                <div className="flex space-x-3 order-1 sm:order-2">
                  {selectedArtisan.isActive !== false ? (
                    <button
                      onClick={() => {
                        handleToggleArtisanStatus(selectedArtisan, false);
                        setShowDetailsModal(false);
                      }}
                      disabled={processingAction}
                      className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg sm:rounded-xl font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      Désactiver ce compte
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleToggleArtisanStatus(selectedArtisan, true);
                        setShowDetailsModal(false);
                      }}
                      disabled={processingAction}
                      className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg sm:rounded-xl font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      Activer ce compte
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
