'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useDevisConfig } from '@/components/DevisConfigContext';
import { useParams } from 'next/navigation';
import { addProjectDocument } from '@/hooks/useProjectDocuments';
import { DevisPDFDocument } from './DevisPDFDocument'; // ✅ nom corrigés

import { pdf } from '@react-pdf/renderer';
import { Devis } from '@/types/devis';

export const PDFGenerator = ({ className, iconOnly }: { className?: string; iconOnly?: boolean }) => {
  const params = useParams();
  const { devisConfig } = useDevisConfig();
  const devis = devisConfig as Devis;

  const generatePDF = async () => {
    if (!devis) return;

    // 1. Générer le blob PDF
    const blob = await pdf(<DevisPDFDocument devis={devis} />).toBlob();
    
    // 2. Upload vers Cloudinary
    const formData = new FormData();
    formData.append('file', blob, `Devis_${devis.numero}.pdf`);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    try {
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
    }
  };

  return (
    <Button onClick={generatePDF} className={className}>
      <Download className="h-4 w-4" />
      {!iconOnly && <span className="ml-2">Télécharger PDF</span>}
    </Button>
  );
};