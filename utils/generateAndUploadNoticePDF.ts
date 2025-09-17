import { pdf } from '@react-pdf/renderer';
import type { Devis } from '@/types/devis';
import NoticeComptablePDFDocument from '@/components/NoticeComptablePDFDocument';
import { db } from '@/lib/firebase/config';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { addProjectDocument } from '@/hooks/useProjectDocuments';

function formatFRDate(d: Date) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function buildNoticeNumber(devis: Devis) {
  let devisDate: Date;
  const createdAt: any = (devis as any).createdAt;
  if (createdAt && typeof createdAt.toDate === 'function') {
    devisDate = createdAt.toDate();
  } else if (createdAt instanceof Date) {
    devisDate = createdAt;
  } else {
    devisDate = new Date();
  }
  const year = devisDate.getFullYear().toString().slice(-2);
  const month = String(devisDate.getMonth() + 1).padStart(2, '0');
  const hash = devis.id?.slice(-4) || '0000';
  return `NC${year}${month}-${hash}`;
}

async function uploadPDFToCloudinary(pdfBlob: Blob, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', pdfBlob, fileName);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  const publicId = fileName.replace('.pdf', '');
  formData.append('public_id', publicId);
  formData.append('resource_type', 'auto');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    throw new Error('Erreur upload Cloudinary');
  }
  const data = await res.json();
  return data.secure_url as string;
}

export async function generateAndUploadNoticePDF(
  devis: Devis,
  projectId: string
): Promise<{ url: string; fileName: string; blob: Blob }> {
  // 1. Charger projet et client
  const projectRef = doc(db, 'projects', projectId);
  const projectSnap = await getDoc(projectRef);
  const projectData = projectSnap.data();
  if (!projectData) throw new Error('Projet non trouvé');

  let clientName = 'CLIENT HARDY';
  if (projectData.client_id) {
    const clientRef = doc(db, 'users', projectData.client_id);
    const clientSnap = await getDoc(clientRef);
    const client = clientSnap.data() as any | undefined;
    if (client) {
      clientName = `${(client.firstName || '').toUpperCase()} ${(client.lastName || '').toUpperCase()}`.trim();
    }
  }

  // 2. Construire numéro et date
  const noticeNumber = buildNoticeNumber(devis);
  const now = new Date();
  const dateStr = formatFRDate(now);

  // 3. Générer le PDF côté client
  const pdfDoc = pdf(
    NoticeComptablePDFDocument({ devis, clientName, noticeNumber, dateStr }) as any
  );
  const pdfBlob = await pdfDoc.toBlob();

  // 4. Nom de fichier
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `NOTICE-COMPTABLE-${noticeNumber}-${timestamp}.pdf`;

  // 5. Upload Cloudinary
  const pdfUrl = await uploadPDFToCloudinary(pdfBlob, fileName);

  // 6. Persistance Document (documents)
  try {
    // upsert in documents for this project & devis
    const docsRef = collection(db, 'documents');
    const q = query(docsRef, where('projectId', '==', projectId), where('name', '==', `NOTICE COMPTABLE ${noticeNumber}`));
    const qs = await getDocs(q);
    if (!qs.empty) {
      const docId = qs.docs[0].id;
      await updateDoc(doc(docsRef, docId), {
        url: pdfUrl,
        updatedAt: new Date().toISOString(),
        size: `${Math.round(pdfBlob.size / 1024)} Ko`,
      });
    } else {
      await addProjectDocument({
        projectId,
        name: `NOTICE COMPTABLE ${noticeNumber}`,
        category: 'notice_comptable',
        date: new Date().toISOString(),
        size: `${Math.round(pdfBlob.size / 1024)} Ko`,
        status: 'en attente',
        url: pdfUrl,
      });
    }
  } catch (e) {
    console.warn('Persistance document notice échouée:', e);
  }

  return { url: pdfUrl, fileName, blob: pdfBlob };
}
