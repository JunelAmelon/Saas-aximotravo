'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye, X } from 'lucide-react';
import { Loader } from './ui/Loader';
import { addProjectDocument } from '@/hooks/useProjectDocuments';
import { useDevisConfig } from '@/components/DevisConfigContext';
import { useParams } from 'next/navigation';
import { DevisPDFDocument } from './DevisPDFDocument';
import { PDFPreview } from './PDFPreview';
import { pdf } from '@react-pdf/renderer';
import { Devis } from '@/types/devis';

export const PDFGenerator: React.FC<{ className?: string; iconOnly?: boolean }> = ({
  className,
  iconOnly,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const params = useParams() || {};
  const { devisConfig } = useDevisConfig();
  const devis = devisConfig as Devis;

  const generatePDF = async () => {
    if (!devis) return;
    setLoading(true);

    try {
      // 1. Générer le blob PDF avec react-pdf
      const pdfBlob = await pdf(<DevisPDFDocument devis={devis} />).toBlob();
      const fileName = `Devis_${devis.numero}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;

      // Fonction d'upload Cloudinary avec cloud_name et endpoint /auto/upload
      const uploadPDFToCloudinary = async (pdfBlob: Blob, fileName: string): Promise<string> => {
        const formData = new FormData();
        formData.append('file', pdfBlob, fileName);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
        formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Erreur upload Cloudinary');
        const data = await res.json();
        return data.secure_url;
      }

      // Calcul du montant TTC avec TVA variable
      let totalHT = 0;
      let totalTVA = 0;

      devis.selectedItems.forEach(item => {
        if (!item.isOffered) {
          const itemTvaRate = item.tva !== undefined ? item.tva : (typeof devis.tva === 'number' ? devis.tva : parseFloat(devis.tva as string) || 20);
          const itemHT = item.prix_ht * item.quantite;
          const itemTVA = itemHT * (itemTvaRate / 100);

          totalHT += itemHT;
          totalTVA += itemTVA;
        }
      });

      const totalTTC = totalHT + totalTVA;

      // 2. Upload PDF to Cloudinary
      const pdfUrl = await uploadPDFToCloudinary(pdfBlob, fileName);

      // 3. Enregistrer dans Firestore (update si existe, sinon insert)
      const projectId = params.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : undefined;
      if (projectId && devis.titre) {
        // Vérifier s'il existe déjà un document devis pour ce devisConfigId
        const { collection, query, where, getDocs, doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase/config');
        const docsRef = collection(db, 'documents');
        const q = query(docsRef, where('projectId', '==', projectId), where('devisConfigId', '==', devis.id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          // Document existe, on met à jour l'url
          const docId = querySnapshot.docs[0].id;
          await updateDoc(doc(docsRef, docId), { url: pdfUrl, montant: totalTTC });
        } else {
          // Sinon, on crée un nouveau document
          await addProjectDocument({
            projectId,
            name: devis.titre,
            category: 'devis',
            date: new Date().toISOString(),
            size: `${Math.round(pdfBlob.size / 1024)} Ko`,
            status: 'en attente',
            url: pdfUrl,
            montant: totalTTC || undefined,
            devisConfigId: devis.id,
          });
        }
      }

      // 4. Téléchargement local
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Erreur lors de la génération ou sauvegarde du PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        {/* Bouton Aperçu */}
        <Button 
          onClick={() => setShowPreview(true)} 
          variant="outline"
          className={className}
          disabled={loading}
        >
          <Eye className="h-4 w-4" />
          {!iconOnly && <span className="ml-2 hidden md:inline">Aperçu</span>}
        </Button>

        {/* Bouton Télécharger */}
        <Button onClick={generatePDF} className={className} disabled={loading}>
          {loading ? <Loader size={20} /> : <Download className="h-4 w-4" />}
          {!iconOnly && !loading && <span className="ml-2 hidden md:inline">Télécharger PDF</span>}
        </Button>
      </div>

      {/* Modal de prévisualisation */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#F26755] to-[#e55a4a] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Aperçu du devis PDF</h3>
                <p className="text-sm text-white/90">Prévisualisation de votre devis</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={generatePDF}
                  className="bg-white text-[#F26755] hover:bg-gray-100 rounded-lg"
                  disabled={loading}
                >
                  {loading ? <Loader size={16} /> : <Download className="h-4 w-4" />}
                  {!loading && <span className="ml-2 hidden md:inline">Télécharger</span>}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  className="text-white hover:bg-white/20 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="h-[calc(95vh-120px)] overflow-auto">
              <PDFPreview devis={devis} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};