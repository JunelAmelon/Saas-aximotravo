'use client';

import React from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { Devis, DevisItem } from '@/types/devis';
import { Download, FileText } from 'lucide-react';
import { addProjectDocument } from '@/hooks/useProjectDocuments';
import { useDevisConfig } from '@/components/DevisConfigContext';
import { useParams } from 'next/navigation';

interface PDFGeneratorProps {
  className?: string;
  iconOnly?: boolean; // Nouvelle prop pour afficher seulement l'icône
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  className,
  iconOnly
}) => {
  const params = useParams() || {};
  const { devisConfig } = useDevisConfig();
  const devis = devisConfig;
  const items = devisConfig?.selectedItems || [];
  if (!devis) return null;

  
  const projectId =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : undefined;

  const generatePDF = async () => {
  // Précharger toutes les images customImage en base64
  const imageCache: Record<string, string> = {};
  const allItems: any[] = devisConfig?.selectedItems || [];
  const imageUrls = Array.from(
    new Set(allItems.filter(i => i.customImage).map(i => i.customImage))
  );

  await Promise.all(imageUrls.map(async url => {
    try {
      const res = await fetch(url!);
      const blob = await res.blob();
      const reader = new FileReader();
      const base64: string = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      imageCache[url!] = base64;
    } catch {
      imageCache[url!] = '';
    }
  }));
    // Génération du PDF (inchangé)

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Configuration des couleurs
    const primaryColor = [242, 103, 85]; // #f26755
    const darkGray = [51, 51, 51];
    const lightGray = [128, 128, 128];
    const veryLightGray = [245, 245, 245];

    // Helper function pour ajouter une nouvelle page si nécessaire
    const checkPageBreak = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function pour dessiner une ligne
    const drawLine = (x1: number, y1: number, x2: number, y2: number, color = lightGray) => {
      pdf.setDrawColor(color[0], color[1], color[2]);
      pdf.setLineWidth(0.5);
      pdf.line(x1, y1, x2, y2);
    };

    // Header avec design moderne
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 60, 'F');
    
    // Logo/Titre principal
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DEVIS', margin, 25);
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(devis.titre || 'Devis professionnel', margin, 35);
    
    // Numéro de devis et date
    pdf.setFontSize(12);
    const devisInfo = [
      `Devis n°${devis.numero}`,
      `En date du ${new Date().toLocaleDateString('fr-FR')}`,
      `Valable jusqu'au ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}`
    ];
    
    devisInfo.forEach((info, index) => {
      pdf.text(info, pageWidth - margin, 20 + (index * 6), { align: 'right' });
    });

    yPosition = 80;

    // Section client (à droite)
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('À l\'attention de :', pageWidth - margin, yPosition, { align: 'right' });
    
    yPosition += 10;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const clientInfo = [
      'Monsieur/Madame Client',
      '1 impasse du pavillon',
      '85600 Rocheservière',
      '',
      'Adresse du chantier :',
      '6 Rue de la Petite Grolle',
      '85600 Rocheservière'
    ];
    
    clientInfo.forEach((line, index) => {
      if (line === 'Adresse du chantier :') {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      pdf.text(line, pageWidth - margin, yPosition + (index * 5), { align: 'right' });
    });

    yPosition += 50;

    // Message d'introduction
    checkPageBreak(30);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    
    const introText = [
      'Madame, Monsieur,',
      '',
      'Voici notre devis qui comporte l\'intégralité des prestations de fournitures et main d\'œuvre.',
      '',
      'Nous restons à votre disposition pour toute question ou modification du devis, et espérons que notre entreprise vous apportera',
      'entière satisfaction.',
      '',
      'Nous vous prions d\'agréer, Madame, Monsieur, nos sincères salutations.'
    ];
    
    introText.forEach((line, index) => {
      if (line === 'Madame, Monsieur,') {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      pdf.text(line, margin, yPosition + (index * 5));
    });

    yPosition += 50;

    // Grouper les items par lot avec numérotation hiérarchique
    const lotGroups = items.reduce((groups, item) => {
      if (!groups[item.lotName]) {
        groups[item.lotName] = [];
      }
      groups[item.lotName].push(item);
      return groups;
    }, {} as Record<string, DevisItem[]>);

    let lotIndex = 1;
    let totalHT = 0;
    let totalTVA = 0;

    // Parcourir chaque lot
    Object.entries(lotGroups).forEach(([lotName, lotItems]) => {
      checkPageBreak(40);
      
      // Titre du lot avec numérotation
      pdf.setFillColor(veryLightGray[0], veryLightGray[1], veryLightGray[2]);
      pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 12, 'F');
      
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${lotIndex}.0 ${lotName}`, margin + 5, yPosition + 3);
      
      // Calculer le total du lot
      const lotTotal = lotItems.reduce((sum, item) => {
        if (item.isOffered) return sum;
        return sum + (item.quantite * item.prix_ht);
      }, 0);
      
      pdf.text(`${lotTotal.toFixed(2)} € HT`, pageWidth - margin - 5, yPosition + 3, { align: 'right' });
      
      yPosition += 20;
      
      // Grouper par sous-catégorie
      const subcategoryGroups = lotItems.reduce((groups, item) => {
        const key = `${item.subcategoryName}_${item.itemName}`;
        if (!groups[key]) {
          groups[key] = {
            subcategoryName: item.subcategoryName,
            itemName: item.itemName,
            items: []
          };
        }
        groups[key].items.push(item);
        return groups;
      }, {} as Record<string, { subcategoryName: string; itemName: string; items: DevisItem[] }>);
      
      let subIndex = 1;
      Object.entries(subcategoryGroups).forEach(([key, group]) => {
        checkPageBreak(30);
        
        // Sous-titre
        pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${lotIndex}.${subIndex} ${group.itemName}`, margin + 10, yPosition);
        
        yPosition += 8;
        
        // Items de cette sous-catégorie
        group.items.forEach((item, itemIndex) => {
          checkPageBreak(25);
          
          // Ligne de prestation
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
          
          // Description avec image si disponible
          let descriptionY = yPosition;
          if (item.customImage && imageCache[item.customImage]) {
            // Détecter le format de l'image base64
            let format = 'JPEG';
            const base64 = imageCache[item.customImage];
            if (base64.startsWith('data:image/png')) format = 'PNG';
            else if (base64.startsWith('data:image/webp')) format = 'WEBP';
            else if (base64.startsWith('data:image/gif')) format = 'GIF';
            else if (base64.startsWith('data:image/svg+xml')) format = 'SVG';
            // Ajoute l'image avec le bon format
            pdf.addImage(base64, format, margin + 15, yPosition - 2, 20, 15);
            descriptionY = yPosition + 5;
          } else if (item.customImage) {
            pdf.setFillColor(240, 240, 240);
            pdf.rect(margin + 15, yPosition - 2, 20, 15, 'F');
            pdf.setFontSize(8);
            pdf.text('IMAGE', margin + 25, yPosition + 6, { align: 'center' });
            descriptionY = yPosition + 5;
          }

          // Texte de la prestation
          const maxWidth = pageWidth - margin - 80;
          const splitDescription = pdf.splitTextToSize(item.description, maxWidth);
          pdf.text(splitDescription, margin + (item.customImage ? 40 : 15), descriptionY);
          
          // Quantité et unité
          const quantiteText = `${item.quantite} ${item.customUnit || item.unite}`;
          pdf.text(quantiteText, pageWidth - 70, yPosition, { align: 'center' });
          
          // Prix unitaire
          if (item.isOffered) {
            pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
            pdf.text(`${item.prix_ht.toFixed(2)} €/u`, pageWidth - 45, yPosition, { align: 'center' });
            // Ligne barrée
            drawLine(pageWidth - 55, yPosition - 1, pageWidth - 35, yPosition - 1, lightGray);
          } else {
            pdf.text(`${item.prix_ht.toFixed(2)} €/u`, pageWidth - 45, yPosition, { align: 'center' });
          }
          
          // Prix total
          if (item.isOffered) {
            pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.setFont('helvetica', 'bold');
            pdf.text('OFFERT', pageWidth - margin, yPosition, { align: 'right' });
            // Icône cadeau (simulée avec du texte)
            pdf.setFontSize(8);
            pdf.text('🎁', pageWidth - margin - 25, yPosition);
          } else {
            pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
            pdf.setFont('helvetica', 'bold');
            const itemTotal = item.quantite * item.prix_ht;
            pdf.text(`${itemTotal.toFixed(2)} €`, pageWidth - margin, yPosition, { align: 'right' });
            totalHT += itemTotal;
            
            // Calculer la TVA pour cet item
            const itemTvaRate = item.tva !== undefined ? item.tva : (typeof devis.tva === 'number' ? devis.tva : parseFloat(devis.tva as string) || 20);
            const itemTVA = itemTotal * (itemTvaRate / 100);
            totalTVA += itemTVA;
          }
          
          yPosition += Math.max(15, splitDescription.length * 4 + 5);
          
          // Ligne de séparation subtile
          if (itemIndex < group.items.length - 1) {
            drawLine(margin + 15, yPosition - 2, pageWidth - margin, yPosition - 2, [230, 230, 230]);
          }
        });
        
        yPosition += 5;
        subIndex++;
      });
      
      yPosition += 10;
      lotIndex++;
    });

    // Section récapitulatif
    checkPageBreak(80);
    yPosition += 10;
    
    // Cadre récapitulatif
    pdf.setFillColor(veryLightGray[0], veryLightGray[1], veryLightGray[2]);
    pdf.rect(pageWidth - 80, yPosition - 5, 60, 60, 'F');
    pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setLineWidth(1);
    pdf.rect(pageWidth - 80, yPosition - 5, 60, 60, 'S');
    
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Récapitulatif des lots', pageWidth - 75, yPosition + 5);
    
    yPosition += 15;
    
    // Détail par lot
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    let recapIndex = 1;
    Object.entries(lotGroups).forEach(([lotName, lotItems]) => {
      const lotTotal = lotItems.reduce((sum, item) => {
        if (item.isOffered) return sum;
        return sum + (item.quantite * item.prix_ht);
      }, 0);
      
      pdf.text(`${recapIndex}.0 ${lotName.substring(0, 15)}...`, pageWidth - 75, yPosition);
      pdf.text(`${lotTotal.toFixed(2)} € HT`, pageWidth - 25, yPosition, { align: 'right' });
      yPosition += 4;
      recapIndex++;
    });
    
    // Totaux
    yPosition += 5;
    drawLine(pageWidth - 75, yPosition, pageWidth - 25, yPosition, darkGray);
    yPosition += 5;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total HT', pageWidth - 75, yPosition);
    pdf.text(`${totalHT.toFixed(2)} €`, pageWidth - 25, yPosition, { align: 'right' });
    
    // TVA
    yPosition += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`TVA`, pageWidth - 75, yPosition);
    pdf.text(`${totalTVA.toFixed(2)} €`, pageWidth - 25, yPosition, { align: 'right' });
    
    // Total TTC
    const totalTTC = totalHT + totalTVA;
    yPosition += 8;
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(pageWidth - 75, yPosition - 3, 50, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Total TTC', pageWidth - 70, yPosition + 2);
    pdf.text(`${totalTTC.toFixed(2)} €`, pageWidth - 25, yPosition + 2, { align: 'right' });

    // Footer avec conditions
    yPosition = pageHeight - 40;
    pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    const footerText = [
      'Conditions générales : Devis valable 30 jours. Acompte de 30% à la commande.',
      'Paiement du solde à la livraison. Prix TTC incluant la TVA au taux en vigueur.',
      'En cas de litige, seuls les tribunaux de Nantes seront compétents.'
    ];
    
    footerText.forEach((line, index) => {
      pdf.text(line, margin, yPosition + (index * 4));
    });

    // --- UPLOAD CLOUDINARY + SAVE FIRESTORE ---
    const fileName = `Devis_${devis.numero}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
    const pdfBlob = pdf.output('blob');

    async function uploadPDFToCloudinary(pdfBlob: Blob, fileName: string): Promise<string> {
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

    try {
      // 1. Upload PDF to Cloudinary
      const pdfUrl = await uploadPDFToCloudinary(pdfBlob, fileName);
      // 2. Enregistrer dans Firestore
      if (projectId && devis.titre) {
        await addProjectDocument({
          projectId,
          name: devis.titre,
          category: 'devis',
          date: new Date().toISOString(),
          size: `${Math.round(pdfBlob.size / 1024)} Ko`,
          status: 'en attente',
          url: pdfUrl,
          montant: totalTTC || undefined,
        });
      }
      // 3. Télécharger localement
      pdf.save(fileName);
    } catch (err) {
      alert('Erreur lors de la sauvegarde du devis : ' + (err as any).message);
    }
  }

  return (
    <Button
      onClick={generatePDF}
      className={className}
    >
      <Download className="h-4 w-4" />
      {!iconOnly && (
        <>
          <span className="ml-2">Télécharger PDF</span>
        </>
      )}
    </Button>
  );
}