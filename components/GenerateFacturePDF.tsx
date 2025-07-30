import { pdf } from "@react-pdf/renderer";
import { FacturePDFDocument } from "@/components/FacturePDFDocument";
import { addProjectDocument } from "@/hooks/useProjectDocuments";
import { getUserById, ArtisanUser, User } from "@/lib/firebase/users";
import { getProjectById, Project } from "@/lib/firebase/projects";
import { Devis } from "@/types/devis";

export const GenerateFacturePDF = async ({
  devis,
  userId,
  setLoading,
}: {
  devis: Devis;
  userId: string;
  setLoading?: (b: boolean) => void;
}) => {
  if (!devis) return;
  if (setLoading) setLoading(true);

  try {
    // 1. Récupérer artisan, project, client
    const user = await getUserById(userId) as ArtisanUser;
    const project = devis.projectId ? await getProjectById(devis.projectId) : null;
    const client = project?.client_id ? await getUserById(project.client_id) : null;

    // 2. Calculer les totaux
    const totalHT = (devis.selectedItems ?? []).reduce(
      (sum, item) => sum + item.prix_ht * item.quantite,
      0
    );
    const tvaRate =
      typeof devis.tva === "string" ? parseFloat(devis.tva) : devis.tva;
    const totalTVA = totalHT * (tvaRate / 100);
    const totalTTC = totalHT + totalTVA;

    // 3. Générer le blob PDF avec react-pdf
    const pdfBlob = await pdf(
      <FacturePDFDocument
        devis={devis}
        user={user}
        client={client}
        project={project}
        totalHT={totalHT}
        totalTVA={totalTVA}
        totalTTC={totalTTC}
        tvaRate={tvaRate}
      />
    ).toBlob();
    const fileName = `Facture_${devis.numero}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;

    // 4. Upload Cloudinary
    const uploadPDFToCloudinary = async (pdfBlob: Blob, fileName: string): Promise<string> => {
      const formData = new FormData();
      formData.append('file', pdfBlob, fileName);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!res.ok) throw new Error('Erreur upload Cloudinary');
      const data = await res.json();
      return data.secure_url;
    };

    const pdfUrl = await uploadPDFToCloudinary(pdfBlob, fileName);

    // 5. Enregistrement Firestore
    const projectId = project?.id;
    if (projectId && devis.titre) {
      const { collection, query, where, getDocs, doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');
      const docsRef = collection(db, 'documents');
      const q = query(docsRef, where('projectId', '==', projectId), where('devisConfigId', '==', devis.id));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        await updateDoc(doc(docsRef, docId), { url: pdfUrl, montant: totalTTC });
      } else {
        await addProjectDocument({
          projectId,
          name: devis.titre,
          category: 'facture',
          date: new Date().toISOString(),
          size: `${Math.round(pdfBlob.size / 1024)} Ko`,
          status: 'en attente',
          url: pdfUrl,
          montant: totalTTC || undefined,
          devisConfigId: devis.id,
        });
      }
    }

    // 6. Téléchargement local
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    return { pdfUrl, fileName };
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    alert('Erreur lors de la génération ou sauvegarde du PDF.');
    throw error;
  } finally {
    if (setLoading) setLoading(false);
  }
};