'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { Loader } from './ui/Loader';
import { addProjectDocument } from '@/hooks/useProjectDocuments';
import { useDevisConfig } from '@/components/DevisConfigContext';
import { useParams } from 'next/navigation';
import { DevisPDFDocument } from './DevisPDFDocument';
import { pdf } from '@react-pdf/renderer';
import { Devis } from '@/types/devis';

export const PDFGenerator: React.FC<{ className?: string; iconOnly?: boolean }> = ({
  className,
  iconOnly,
}) => {
  const [loading, setLoading] = React.useState(false);
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

      // Calcul du montant TTC
      const totalHT = devis.selectedItems.reduce((sum, item) => sum + (item.quantite * item.prix_ht), 0);
      const tvaRate = typeof devis.tva === 'number' ? devis.tva : parseFloat(devis.tva as string) || 20;
      const totalTTC = totalHT * (1 + tvaRate / 100);

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
    <Button onClick={generatePDF} className={className} disabled={loading}>
      {loading ? <Loader size={20} /> : <Download className="h-4 w-4" />}
      {!iconOnly && !loading && <span className="ml-2">Télécharger PDF</span>}
    </Button>
  );
};
