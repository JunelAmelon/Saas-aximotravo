"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Users, Search, Plus, UserPlus, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCreateArtisan } from '@/hooks/useCreateArtisan';
import { CLOUDINARY_UPLOAD_PRESET } from '@/lib/cloudinary';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;
import {
  getArtisansByCourtierId,
  getUnassignedArtisans,
  assignArtisanToCourtier,
  ArtisanUser
} from "@/lib/firebase/users";

export default function CourtierArtisans() {
  const [cloudinaryLoading, setCloudinaryLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    companyAddress: '',
    status: '',
    siret: '',
    specialite: '',
    otherSpecialite: '',
    hasCertification: '', // 'oui' ou 'non'
    secteur: '',
    insuranceDate: '',
    codePostal: '',
    ville: '',
  });
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [fiscalFile, setFiscalFile] = useState<File | null>(null);
  const [kbisFile, setKbisFile] = useState<File | null>(null);
  const { createArtisan, loading: formLoading, error: formError, success: formSuccess } = useCreateArtisan();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const artisansPerPage = 8;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    } else {
      setter(null);
    }
  };

  const handleAddArtisan = async (e: React.FormEvent) => {
    e.preventDefault();
    setCloudinaryLoading(true);
    e.preventDefault();
    // Upload fichiers sur Cloudinary
    let certificationUrl = null;
    let assuranceUrl = null;
    let fiscalUrl = null;
    let kbisUrl = null;
    const uploadToCloudinary = async (file: File | null) => {
      if (!file) return null;
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET as string);
      const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: data });
      const result = await res.json();
      return result.secure_url || null;
    };
    if (certificationFile) certificationUrl = await uploadToCloudinary(certificationFile);
    if (insuranceFile) assuranceUrl = await uploadToCloudinary(insuranceFile);
    if (fiscalFile) fiscalUrl = await uploadToCloudinary(fiscalFile);
    if (kbisFile) kbisUrl = await uploadToCloudinary(kbisFile);
    setCloudinaryLoading(false);
    // Appel création artisan avec URLs Cloudinary
    await createArtisan({
      ...form,
      certificationUrl,
      assuranceUrl,
      fiscalUrl,
      kbisUrl
    });
    if (!formError) {
      setForm({
        companyName: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        companyAddress: '',
        status: '',
        siret: '',
        specialite: '',
        otherSpecialite: '',
        hasCertification: '', // 'oui' ou 'non'
        secteur: '',
        insuranceDate: '',
        codePostal: '',
        ville: '',
      });
      setCertificationFile(null);
      setInsuranceFile(null);
      setFiscalFile(null);
      setKbisFile(null);
      if (typeof window !== 'undefined') {
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  const { currentUser } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myArtisans, setMyArtisans] = useState<ArtisanUser[]>([]);
  const [unassignedArtisans, setUnassignedArtisans] = useState<ArtisanUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigning, setAssigning] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    async function loadArtisans() {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);
        const courtierArtisans = await getArtisansByCourtierId(currentUser.uid);
        const availableArtisans = await getUnassignedArtisans();
        setMyArtisans(courtierArtisans);
        setUnassignedArtisans(availableArtisans);
      } catch (err: any) {
        console.error('Erreur:', err);
        setError('Impossible de charger la liste des artisans.');
      } finally {
        setLoading(false);
      }
    }

    loadArtisans();
  }, [currentUser]);

  const handleAssignArtisan = async (artisanId: string) => {
    if (!currentUser) return;

    try {
      setAssigning(prev => ({ ...prev, [artisanId]: true }));
      await assignArtisanToCourtier(artisanId, currentUser.uid);
      const artisan = unassignedArtisans.find(a => a.uid === artisanId);
      if (artisan) {
        setMyArtisans(prev => [...prev, artisan]);
        setUnassignedArtisans(prev => prev.filter(a => a.uid !== artisanId));
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      alert('Erreur lors de l\'association.');
    } finally {
      setAssigning(prev => ({ ...prev, [artisanId]: false }));
    }
  };

  // Pagination logic
  const indexOfLastArtisan = currentPage * artisansPerPage;
  const indexOfFirstArtisan = indexOfLastArtisan - artisansPerPage;
  const currentArtisans = myArtisans.slice(indexOfFirstArtisan, indexOfLastArtisan);
  const totalPages = Math.ceil(myArtisans.length / artisansPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f21515]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push('/courtier/dashboard')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
        >
          Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des artisans</h1>
        <button
          onClick={() => setOpenAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#f26755] text-white rounded-md font-semibold shadow hover:opacity-90 transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      {/* Modal d'ajout */}
      <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
        <DialogContent className="max-w-lg w-full">
          <div className="relative">
            {cloudinaryLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f26755] mb-4"></div>
                <span className="text-[#f26755] font-semibold">Enregistrement des fichiers...</span>
              </div>
            )}
            <form onSubmit={handleAddArtisan} className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
              <h2 className="text-lg font-semibold mb-2">Ajouter un artisan</h2>
              <div className="grid grid-cols-2 gap-2">
                <input name="companyName" value={form.companyName} onChange={handleFormChange} placeholder="Entreprise" required className="border p-2 rounded" />
                <input name="companyAddress" value={form.companyAddress} onChange={handleFormChange} placeholder="Adresse de l'entreprise" required className="border p-2 rounded" />
                <input name="firstName" value={form.firstName} onChange={handleFormChange} placeholder="Prénom du gérant" required className="border p-2 rounded" />
                <input name="lastName" value={form.lastName} onChange={handleFormChange} placeholder="Nom du gérant" required className="border p-2 rounded" />
                <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="Adresse mail" required className="border p-2 rounded col-span-2" />
                <input name="phoneNumber" value={form.phoneNumber} onChange={handleFormChange} placeholder="Téléphone" required className="border p-2 rounded" />
                <input name="status" value={form.status} onChange={handleFormChange} placeholder="Statut (ex: SARL, SAS...)" required className="border p-2 rounded" />
                <input name="siret" value={form.siret} onChange={handleFormChange} placeholder="Numéro SIRET" required className="border p-2 rounded" />
                <select name="specialite" value={form.specialite} onChange={handleFormChange} required className="border p-2 rounded">
                  <option value="">Spécialité principale</option>
                  <option value="maçonnerie">Maçonnerie</option>
                  <option value="plomberie">Plomberie</option>
                  <option value="électricité">Électricité</option>
                  <option value="menuiserie">Menuiserie</option>
                  <option value="peinture">Peinture</option>
                  <option value="carrelage">Carrelage</option>
                  <option value="couverture">Couverture</option>
                  <option value="étanchéité">Étanchéité</option>
                  <option value="autre">Autre (précisez)</option>
                </select>
                {form.specialite === 'autre' && (
                  <input name="otherSpecialite" value={form.otherSpecialite} onChange={handleFormChange} placeholder="Autre spécialité" className="border p-2 rounded col-span-2" />
                )}
                <div className="col-span-2 flex items-center gap-4">
                  <span>Certification&nbsp;?</span>
                  <label className="inline-flex items-center"><input type="radio" name="hasCertification" value="oui" checked={form.hasCertification === 'oui'} onChange={handleFormChange} /> Oui</label>
                  <label className="inline-flex items-center"><input type="radio" name="hasCertification" value="non" checked={form.hasCertification === 'non'} onChange={handleFormChange} /> Non</label>
                </div>
                {form.hasCertification === 'oui' && (
                  <div className="col-span-2">
                    <label className="block mb-1">Attestation de certification (PDF/JPG/PNG)</label>
                    <input type="file" accept="application/pdf,image/*" onChange={e => handleFileChange(e, setCertificationFile)} className="border p-2 rounded w-full" />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block mb-1">Assurance (PDF/JPG/PNG)</label>
                  <input type="file" accept="application/pdf,image/*" onChange={e => handleFileChange(e, setInsuranceFile)} className="border p-2 rounded w-full" />
                </div>
                <input name="secteur" value={form.secteur} onChange={handleFormChange} placeholder="Secteur géographique (secteur d’intervention)" required className="border p-2 rounded col-span-2" />
                <div className="col-span-2">
                  <label className="block mb-1">Date d&apos;assurance</label>
                  <input type="date" name="insuranceDate" value={form.insuranceDate} onChange={handleFormChange} required className="border p-2 rounded w-full" />
                </div>
                <div className="col-span-2">
                  <label className="block mb-1">Attestation de régularité fiscale (PDF/JPG/PNG)</label>
                  <input type="file" accept="application/pdf,image/*" onChange={e => handleFileChange(e, setFiscalFile)} className="border p-2 rounded w-full" />
                </div>
                <div className="col-span-2">
                  <label className="block mb-1">Kbis (PDF/JPG/PNG)</label>
                  <input type="file" accept="application/pdf,image/*" onChange={e => handleFileChange(e, setKbisFile)} className="border p-2 rounded w-full" />
                </div>
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              {formSuccess && <div className="text-green-600 text-sm">{formSuccess}</div>}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#f26755]/90 transition-colors disabled:opacity-50"
                  disabled={formLoading || cloudinaryLoading}
                >
                  {formLoading ? (
                    <span className="loader mr-2"></span>
                  ) : (
                    <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  )}
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mes artisans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users size={20} className="mr-2" />
          Mes artisans ({myArtisans.length})
        </h2>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}

        {myArtisans.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">Aucun artisan associé à votre compte.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentArtisans.map((artisan) => (
                <div key={artisan.uid} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{artisan.displayName || artisan.email}</h3>
                      <p className="text-sm text-gray-500">{artisan.companyName}</p>
                      <p className="text-xs text-gray-400 mt-1">Email: {artisan.email}</p>
                      <p className="text-xs text-gray-400 mt-1">Spécialité: {artisan.specialite}</p>
                      {artisan.phoneNumber && (
                        <p className="text-xs text-gray-400 mt-1">Tél: {artisan.phoneNumber}</p>
                      )}
                    </div>
                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                      <Check size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${currentPage === index + 1
                        ? 'bg-[#f26755] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}