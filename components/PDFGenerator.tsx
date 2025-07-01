'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { Download } from 'lucide-react';
=======
import { Devis, DevisItem } from '@/types/devis';
import { Download, FileText } from 'lucide-react';
import { Loader } from './ui/Loader';
import { addProjectDocument } from '@/hooks/useProjectDocuments';
>>>>>>> 01a76f39e8d3c86262781519206faa87ff3b8162
import { useDevisConfig } from '@/components/DevisConfigContext';
import { useParams } from 'next/navigation';
import { addProjectDocument } from '@/hooks/useProjectDocuments';
import { DevisPDFDocument } from './DevisPDFDocument'; // ✅ nom corrigés

import { pdf } from '@react-pdf/renderer';
import { Devis } from '@/types/devis';

<<<<<<< HEAD
export const PDFGenerator = ({ className, iconOnly }: { className?: string; iconOnly?: boolean }) => {
  const params = useParams();
=======
export const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  className,
  iconOnly
}) => {
  
  const [loading, setLoading] = React.useState(false);
  const params = useParams() || {};
>>>>>>> 01a76f39e8d3c86262781519206faa87ff3b8162
  const { devisConfig } = useDevisConfig();
  const devis = devisConfig as Devis;

  const generatePDF = async () => {
<<<<<<< HEAD
    if (!devis) return;
=======
    setLoading(true);
  // Précharger toutes les images customImage en base64
  const imageCache: Record<string, string> = {};
  const allItems: any[] = devisConfig?.selectedItems || [];
  const imageUrls = Array.from(
    new Set(allItems.filter(i => i.customImage).map(i => i.customImage))
  );
>>>>>>> 01a76f39e8d3c86262781519206faa87ff3b8162

    // 1. Générer le blob PDF
    const blob = await pdf(<DevisPDFDocument devis={devis} />).toBlob();
    
    // 2. Upload vers Cloudinary
    const formData = new FormData();
    formData.append('file', blob, `Devis_${devis.numero}.pdf`);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    try {
<<<<<<< HEAD
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        { method: 'POST', body: formData }
      );
      const { secure_url } = await uploadRes.json();

      // 3. Sauvegarde dans Firestore
      if (params.id) {
        const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
        await addProjectDocument({
          projectId,
          name: `Devis ${devis.numero}`,
          category: 'devis',
          date: new Date().toISOString(),
          size: `${Math.round(blob.size / 1024)} Ko`,
          status: 'en attente',
          url: secure_url,
          montant: devis.selectedItems.reduce((sum, item) => sum + (item.quantite * item.prix_ht), 0) * 1.2 // TTC
        });
      }

      // 4. Téléchargement local
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Devis_${devis.numero}.pdf`;
      link.click();
    } catch (error) {
      console.error('Erreur génération PDF:', error);
=======
      // 1. Upload PDF to Cloudinary
      const pdfUrl = await uploadPDFToCloudinary(pdfBlob, fileName);
      // 2. Enregistrer dans Firestore
      if (projectId && devis.titre) {
        // Vérifier s'il existe déjà un document devis pour ce devisConfigId
        const { collection, query, where, getDocs, doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase/config');
        const docsRef = collection(db, 'documents');
        const q = query(docsRef, where('projectId', '==', projectId), where('devisConfigId', '==', devisConfig.id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          // Document existe, on met à jour l'url
          const docId = querySnapshot.docs[0].id;
          await updateDoc(doc(docsRef, docId), { url: pdfUrl });
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
            devisConfigId: devisConfig.id,
          });
        }
      }
      // 3. Télécharger localement
      pdf.save(fileName);
    } catch (err) {
      alert('Erreur lors de la sauvegarde du devis : ' + (err as any).message);
    } finally {
      setLoading(false);
>>>>>>> 01a76f39e8d3c86262781519206faa87ff3b8162
    }
  };

  return (
<<<<<<< HEAD
    <Button onClick={generatePDF} className={className}>
      <Download className="h-4 w-4" />
      {!iconOnly && <span className="ml-2">Télécharger PDF</span>}
=======
    <Button
      onClick={generatePDF}
      className={className}
      disabled={loading}
    >
      {loading ? <Loader size={20} /> : <Download className="h-4 w-4" />}
      {!iconOnly && !loading && (
        <>
          <span className="ml-2">Télécharger PDF</span>
        </>
      )}
>>>>>>> 01a76f39e8d3c86262781519206faa87ff3b8162
    </Button>
  );
};