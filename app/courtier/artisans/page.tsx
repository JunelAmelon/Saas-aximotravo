"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  Users,
  Search,
  Plus,
  UserPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCreateArtisan } from "@/hooks/useCreateArtisan";
import { CLOUDINARY_UPLOAD_PRESET } from "@/lib/cloudinary";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;
import {
  getArtisansByCourtierId,
  getUnassignedArtisans,
  assignArtisanToCourtier,
  ArtisanUser,
} from "@/lib/firebase/users";

export default function CourtierArtisans() {
  const [cloudinaryLoading, setCloudinaryLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [form, setForm] = useState({
    // Artisan
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    specialite: "",
    otherSpecialite: "",
    secteur: "",
    hasCertification: "",
    certificationFile: null,
    insuranceDate: "",
    insuranceFile: null,
    fiscalFile: null,
    kbisFile: null,

    // Entreprise
    companyName: "",
    companyAddress: "",
    companyPostalCode: "",
    companyCity: "",
    companyPhone: "",
    companyEmail: "",
    companyLegalForm: "",
    siret: "",
    rcs: "",
    companyApe: "",
    companyTva: "",
    companyCapital: "",
  });
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [certificationUrl, setCertificationUrl] = useState<string | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [insuranceUrl, setInsuranceUrl] = useState<string | null>(null);
  const [fiscalFile, setFiscalFile] = useState<File | null>(null);
  const [fiscalUrl, setFiscalUrl] = useState<string | null>(null);
  const [kbisFile, setKbisFile] = useState<File | null>(null);
  const [kbisUrl, setKbisUrl] = useState<string | null>(null);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const {
    createArtisan,
    loading: formLoading,
    error: formError,
    success: formSuccess,
  } = useCreateArtisan();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const artisansPerPage = 8;

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setUrl?: (url: string | null) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      if (setUrl) setUrl(URL.createObjectURL(file));
    } else {
      setFile(null);
      if (setUrl) setUrl(null);
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
    let companyLogoUrl = null;
    const uploadToCloudinary = async (file: File | null) => {
      if (!file) return null;
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET as string);
      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      return result.secure_url || null;
    };
    if (certificationFile)
      certificationUrl = await uploadToCloudinary(certificationFile);
    if (insuranceFile) assuranceUrl = await uploadToCloudinary(insuranceFile);
    if (fiscalFile) fiscalUrl = await uploadToCloudinary(fiscalFile);
    if (kbisFile) kbisUrl = await uploadToCloudinary(kbisFile);
    if (companyLogoUrl)
      companyLogoUrl = await uploadToCloudinary(companyLogoUrl);
    setCloudinaryLoading(false);
    // Appel création artisan avec URLs Cloudinary
    await createArtisan({
      ...form,
      certificationUrl,
      assuranceUrl,
      fiscalUrl,
      kbisUrl,
    });
    if (!formError) {
      setForm({
        // Artisan
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        specialite: "",
        otherSpecialite: "",
        secteur: "",
        hasCertification: "",
        certificationFile: null,
        insuranceDate: "",
        insuranceFile: null,
        fiscalFile: null,
        kbisFile: null,
        // Entreprise
        companyName: "",
        companyAddress: "",
        companyPostalCode: "",
        companyCity: "",
        companyPhone: "",
        companyEmail: "",
        companyLegalForm: "",
        siret: "",
        rcs: "",
        companyApe: "",
        companyTva: "",
        companyCapital: "",
      });
      setCertificationFile(null);
      setInsuranceFile(null);
      setFiscalFile(null);
      setKbisFile(null);
      setCompanyLogoUrl(null);
      if (typeof window !== "undefined") {
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  const { currentUser } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myArtisans, setMyArtisans] = useState<ArtisanUser[]>([]);
  const [unassignedArtisans, setUnassignedArtisans] = useState<ArtisanUser[]>(
    []
  );
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
        console.error("Erreur:", err);
        setError("Impossible de charger la liste des artisans.");
      } finally {
        setLoading(false);
      }
    }

    loadArtisans();
  }, [currentUser]);

  const handleAssignArtisan = async (artisanId: string) => {
    if (!currentUser) return;

    try {
      setAssigning((prev) => ({ ...prev, [artisanId]: true }));
      await assignArtisanToCourtier(artisanId, currentUser.uid);
      const artisan = unassignedArtisans.find((a) => a.uid === artisanId);
      if (artisan) {
        setMyArtisans((prev) => [...prev, artisan]);
        setUnassignedArtisans((prev) =>
          prev.filter((a) => a.uid !== artisanId)
        );
      }
    } catch (err: any) {
      console.error("Erreur:", err);
      alert("Erreur lors de l'association.");
    } finally {
      setAssigning((prev) => ({ ...prev, [artisanId]: false }));
    }
  };

  // Pagination logic
  const indexOfLastArtisan = currentPage * artisansPerPage;
  const indexOfFirstArtisan = indexOfLastArtisan - artisansPerPage;
  const currentArtisans = myArtisans.slice(
    indexOfFirstArtisan,
    indexOfLastArtisan
  );
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
      <div className="w-full mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2 sm:gap-0">
          <h1 className="text-2xl font-bold text-gray-900 w-full text-center sm:w-auto sm:text-left sm:mb-0 mb-2">
            Gestion des artisans
          </h1>
          <button
            onClick={() => setOpenAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#f26755] text-white rounded-md font-semibold shadow hover:opacity-90 transition-colors disabled:opacity-50"
            type="button"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un artisan</span>
          </button>
        </div>
      </div>

      {/* Modal d'ajout */}
      <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
        <DialogContent className="max-w-2xl w-full p-0 rounded-3xl shadow-xl bg-[#fff] border-0">
          <div className="relative bg-white">
            {cloudinaryLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f26755] mb-4"></div>
                <span className="text-[#f26755] font-semibold text-lg">
                  Enregistrement des fichiers..
                </span>
              </div>
            )}

            <form
              onSubmit={handleAddArtisan}
              className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto p-8 bg-white rounded-3xl shadow-xl border border-gray-100"
            >
              {/* TITRE */}
              <div className="border-b border-gray-100">
                <h2 className="text-3xl font-extrabold text-[#f26755] tracking-wide uppercase mb-1">
                  Ajouter un artisan
                </h2>
                <p className="text-base text-gray-400 font-medium">
                  Tous les champs sont obligatoires
                </p>
              </div>

              {/* --- SECTION ARTISAN --- */}
              <h3 className="text-base font-bold text-[#f26755] uppercase tracking-wider col-span-2 mt-1 mb-1">
                Informations sur l'artisan
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Prénom*
                  </label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Nom*
                  </label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1 ">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Téléphone*
                  </label>
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="specialite-select"
                    className="text-xs font-semibold uppercase tracking-wide text-gray-600"
                  >
                    Spécialité*
                  </label>
                  <select
                    name="specialite"
                    value={form.specialite}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/50 focus:border-[#f26755] transition-all appearance-none"
                  >
                    <option value="">Sélectionnez une spécialité</option>
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
                  {form.specialite === "autre" && (
                    <input
                      name="otherSpecialite"
                      value={form.otherSpecialite}
                      onChange={handleFormChange}
                      placeholder="Précisez la spécialité"
                      className="rounded-xl bg-gray-50 border border-gray-200 text-base placeholder:text-gray-400 focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] px-4 py-3"
                    />
                  )}
                </div>
                <div className="space-y-1 ">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Secteur géographique*
                  </label>
                  <input
                    name="secteur"
                    value={form.secteur}
                    onChange={handleFormChange}
                    required
                    placeholder="Secteur d'intervention"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Certification*
                  </label>
                  <div className="flex items-center space-x-4 mt-1">
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasCertification"
                        value="oui"
                        checked={form.hasCertification === "oui"}
                        onChange={handleFormChange}
                        className="h-4 w-4 text-[#f26755] focus:ring-[#f26755] border-gray-300"
                      />
                      <span className="text-gray-700">Oui</span>
                    </label>
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasCertification"
                        value="non"
                        checked={form.hasCertification === "non"}
                        onChange={handleFormChange}
                        className="h-4 w-4 text-[#f26755] focus:ring-[#f26755] border-gray-300"
                      />
                      <span className="text-gray-700">Non</span>
                    </label>
                  </div>
                  {form.hasCertification === "oui" && (
                    <div className="mt-2">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
                        Attestation de certification*
                      </label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col w-full border border-dashed border-gray-200 hover:border-[#f26755] rounded-xl cursor-pointer transition-all p-4 bg-gray-50 hover:bg-orange-50 group">
                          <div className="flex items-center gap-2 text-gray-400 group-hover:text-[#f26755] transition-colors">
                            <Upload className="h-5 w-5" />
                            <span className="text-sm">
                              Cliquez pour uploader (PDF, JPG, PNG)
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="application/pdf,image/*"
                            onChange={(e) =>
                              handleFileChange(
                                e,
                                setCertificationFile,
                                setCertificationUrl
                              )
                            }
                            className="hidden"
                            disabled={!!certificationFile}
                          />
                          {certificationUrl && (
                            <div className="mt-4 flex justify-center items-center gap-2">
                              {certificationFile &&
                              certificationFile.type.startsWith("image/") ? (
                                <img
                                  src={certificationUrl}
                                  alt="Aperçu certification"
                                  className="max-h-24 rounded-lg border"
                                />
                              ) : (
                                <a
                                  href={certificationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-600 underline"
                                >
                                  <FileText className="h-5 w-5 text-blue-500" />
                                  {certificationFile?.name || "Voir le fichier"}
                                </a>
                              )}
                              <button
                                type="button"
                                className="ml-2 p-1 rounded hover:bg-gray-200"
                                onClick={() => {
                                  setCertificationFile(null);
                                  setCertificationUrl(null);
                                }}
                                aria-label="Supprimer le fichier"
                              >
                                <X className="h-5 w-5 text-gray-500" />
                              </button>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
                    Assurance*
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col w-full border border-dashed border-gray-200 hover:border-[#f26755] rounded-xl cursor-pointer transition-all p-4 bg-gray-50 hover:bg-orange-50 group">
                      <div className="flex items-center gap-2 text-gray-400 group-hover:text-[#f26755] transition-colors">
                        <Upload className="h-5 w-5" />
                        <span className="text-sm">
                          Cliquez pour uploader (PDF, JPG, PNG)
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={(e) =>
                          handleFileChange(e, setInsuranceFile, setInsuranceUrl)
                        }
                        className="hidden"
                        disabled={!!insuranceFile}
                      />
                      {insuranceUrl && (
                        <div className="mt-4 flex justify-center items-center gap-2">
                          {insuranceFile &&
                          insuranceFile.type.startsWith("image/") ? (
                            <img
                              src={insuranceUrl}
                              alt="Aperçu assurance"
                              className="max-h-24 rounded-lg border"
                            />
                          ) : (
                            <a
                              href={insuranceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 underline"
                            >
                              <FileText className="h-5 w-5 text-blue-500" />
                              {insuranceFile?.name || "Voir le fichier"}
                            </a>
                          )}
                          <button
                            type="button"
                            className="ml-2 p-1 rounded hover:bg-gray-200"
                            onClick={() => {
                              setInsuranceFile(null);
                              setInsuranceUrl(null);
                            }}
                            aria-label="Supprimer le fichier"
                          >
                            <X className="h-5 w-5 text-gray-500" />
                          </button>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Date d'assurance*
                  </label>
                  <input
                    type="date"
                    name="insuranceDate"
                    value={form.insuranceDate}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
              </div>

              {/* --- SECTION ENTREPRISE --- */}
              <h3 className="text-base font-bold text-[#f26755] uppercase tracking-wider col-span-2 mt-10 mb-2 border-t border-gray-100 pt-6">
                Informations sur l'entreprise
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Nom de l'entreprise*
                  </label>
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Adresse*
                  </label>
                  <input
                    name="companyAddress"
                    value={form.companyAddress}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Code postal*
                  </label>
                  <input
                    name="companyPostalCode"
                    value={form.companyPostalCode}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Ville*
                  </label>
                  <input
                    name="companyCity"
                    value={form.companyCity}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Téléphone entreprise*
                  </label>
                  <input
                    name="companyPhone"
                    value={form.companyPhone}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Email entreprise*
                  </label>
                  <input
                    name="companyEmail"
                    value={form.companyEmail}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Forme juridique*
                  </label>
                  <input
                    name="companyLegalForm"
                    value={form.companyLegalForm}
                    onChange={handleFormChange}
                    required
                    placeholder="SARL, SAS..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    SIRET*
                  </label>
                  <input
                    name="siret"
                    value={form.siret}
                    onChange={handleFormChange}
                    required
                    placeholder="123 456 789 00012"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    RCS*
                  </label>
                  <input
                    name="rcs"
                    value={form.rcs}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Code APE/NAF*
                  </label>
                  <input
                    name="companyApe"
                    value={form.companyApe}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Numéro de TVA*
                  </label>
                  <input
                    name="companyTva"
                    value={form.companyTva}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Capital social*
                  </label>
                  <input
                    name="companyCapital"
                    value={form.companyCapital}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 focus:border-[#f26755] transition-all"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
                    Logo de l'entreprise*
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col w-full border border-dashed border-gray-200 hover:border-[#f26755] rounded-xl cursor-pointer transition-all p-4 bg-gray-50 hover:bg-orange-50 group">
                      <div className="flex items-center gap-2 text-gray-400 group-hover:text-[#f26755] transition-colors">
                        <Upload className="h-5 w-5" />
                        <span className="text-sm">
                          Cliquez pour uploader (JPG, PNG)
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            setCompanyLogoFile,
                            setCompanyLogoUrl
                          )
                        }
                        className="hidden"
                        disabled={!!companyLogoFile}
                      />
                      {companyLogoUrl && (
                        <div className="mt-4 flex justify-center items-center gap-2">
                          <img
                            src={companyLogoUrl}
                            alt="Logo de l'entreprise"
                            className="max-h-24 rounded-lg border"
                          />
                          <button
                            type="button"
                            className="ml-2 p-1 rounded hover:bg-gray-200"
                            onClick={() => {
                              setCompanyLogoFile(null);
                              setCompanyLogoUrl(null);
                            }}
                            aria-label="Supprimer le fichier"
                          >
                            <X className="h-5 w-5 text-gray-500" />
                          </button>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* --- SECTION DOCUMENTS --- */}
              <h3 className="text-base font-bold text-[#f26755] uppercase tracking-wider col-span-2 mt-10 mb-2 border-t border-gray-100 pt-6">
                Documents administratifs
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1 ">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
                    Attestation fiscale*
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col w-full border border-dashed border-gray-200 hover:border-[#f26755] rounded-xl cursor-pointer transition-all p-4 bg-gray-50 hover:bg-orange-50 group">
                      <div className="flex items-center gap-2 text-gray-400 group-hover:text-[#f26755] transition-colors">
                        <Upload className="h-5 w-5" />
                        <span className="text-sm">
                          Cliquez pour uploader (PDF, JPG, PNG)
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={(e) =>
                          handleFileChange(e, setFiscalFile, setFiscalUrl)
                        }
                        className="hidden"
                        disabled={!!fiscalFile}
                      />
                      {fiscalUrl && (
                        <div className="mt-4 flex justify-center items-center gap-2">
                          {fiscalFile &&
                          fiscalFile.type.startsWith("image/") ? (
                            <img
                              src={fiscalUrl}
                              alt="Aperçu fiscal"
                              className="max-h-24 rounded-lg border"
                            />
                          ) : (
                            <a
                              href={fiscalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[#f26755] underline"
                            >
                              <FileText className="h-5 w-5 text-[#f26755]" />
                              {fiscalFile?.name || "Voir le fichier"}
                            </a>
                          )}
                          <button
                            type="button"
                            className="ml-2 p-1 rounded hover:bg-gray-200"
                            onClick={() => {
                              setFiscalFile(null);
                              setFiscalUrl(null);
                            }}
                            aria-label="Supprimer le fichier"
                          >
                            <X className="h-5 w-5 text-gray-500" />
                          </button>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
                    Kbis*
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col w-full border border-dashed border-gray-200 hover:border-[#f26755] rounded-xl cursor-pointer transition-all p-4 bg-gray-50 hover:bg-orange-50 group">
                      <div className="flex items-center gap-2 text-gray-400 group-hover:text-[#f26755] transition-colors">
                        <Upload className="h-5 w-5" />
                        <span className="text-sm">
                          Cliquez pour uploader (PDF, JPG, PNG)
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={(e) =>
                          handleFileChange(e, setKbisFile, setKbisUrl)
                        }
                        className="hidden"
                        disabled={!!kbisFile}
                      />
                      {kbisUrl && (
                        <div className="mt-4 flex justify-center items-center gap-2">
                          {kbisFile && kbisFile.type.startsWith("image/") ? (
                            <img
                              src={kbisUrl}
                              alt="Aperçu kbis"
                              className="max-h-24 rounded-lg border"
                            />
                          ) : (
                            <a
                              href={kbisUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[#f26755] underline"
                            >
                              <FileText className="h-5 w-5 text-[#f26755]" />
                              {kbisFile?.name || "Voir le fichier"}
                            </a>
                          )}
                          <button
                            type="button"
                            className="ml-2 p-1 rounded hover:bg-gray-200"
                            onClick={() => {
                              setKbisFile(null);
                              setKbisUrl(null);
                            }}
                            aria-label="Supprimer le fichier"
                          >
                            <X className="h-5 w-5 text-gray-500" />
                          </button>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Messages d'erreur/succès */}
              {formError && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 text-base rounded-xl flex items-start gap-3 shadow border border-red-100">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>{formError}</div>
                </div>
              )}
              {formSuccess && (
                <div className="mt-4 p-4 bg-green-50 text-green-600 text-base rounded-xl flex items-start gap-3 shadow border border-green-100">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>{formSuccess}</div>
                </div>
              )}

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={formLoading || cloudinaryLoading}
                  className="inline-flex items-center px-6 py-3 bg-[#f26755] text-white text-base font-semibold rounded-xl shadow hover:bg-[#e55a4a] focus:outline-none focus:ring-2 focus:ring-[#f26755]/40 transition-all duration-200 disabled:opacity-50 active:scale-95"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter l&apos;artisan
                    </>
                  )}
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
            <p className="text-gray-500">
              Aucun artisan associé à votre compte.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentArtisans.map((artisan) => (
                <div
                  key={artisan.uid}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {artisan.displayName || artisan.email}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {artisan.companyName}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Email: {artisan.email}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Spécialité: {artisan.specialite}
                      </p>
                      {artisan.phoneNumber && (
                        <p className="text-xs text-gray-400 mt-1">
                          Tél: {artisan.phoneNumber}
                        </p>
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentPage === index + 1
                        ? "bg-[#f26755] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                  aria-label="Page suivante"
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
