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
      const fileName = `Devis_${devis.numero}.pdf`;

      // 2. Upload vers Cloudinary
      const formData = new FormData();
      formData.append('file', pdfBlob, fileName);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        { method: 'POST', body: formData }
      );
      const { secure_url: pdfUrl } = await uploadRes.json();

      // 3. Sauvegarde Firestore
      if (params.id) {
        const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

        await addProjectDocument({
          projectId,
          name: `Devis ${devis.numero}`,
          category: 'devis',
          date: new Date().toISOString(),
          size: `${Math.round(pdfBlob.size / 1024)} Ko`,
          status: 'en attente',
          url: pdfUrl,
          montant: devis.selectedItems.reduce((sum, item) => sum + item.quantite * item.prix_ht, 0) * 1.2, // TTC
        });
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
