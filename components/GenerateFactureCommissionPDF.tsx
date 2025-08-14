import { pdf } from "@react-pdf/renderer";
import { FactureCommissionPDFDocument } from "@/components/FactureCommissionPDFDocument";
import { addProjectDocument } from "@/hooks/useProjectDocuments";
import { getUserById, ArtisanUser } from "@/lib/firebase/users";
import { getProjectById, Project } from "@/lib/firebase/projects";
import { Devis } from "@/types/devis";
import { FactureType } from "@/types/facture";
import {
  getOrCreateFactureCommissionData,
  updateFacturePDFData,
} from "@/utils/factureCommissionPersistence";

export const GenerateFactureCommissionPDF = async ({
  devis,
  userId,
  factureType,
  tauxCommission,
  setLoading,
}: {
  devis: Devis;
  userId: string;
  factureType: FactureType;
  tauxCommission: number;
  setLoading?: (b: boolean) => void;
}) => {
  if (!devis) return;
  if (setLoading) setLoading(true);

  try {
    // 1. Récupérer utilisateur, projet, client
    const user = (await getUserById(
      devis.attribution?.artisanId || ""
    )) as ArtisanUser;
    const project = devis.projectId
      ? await getProjectById(devis.projectId)
      : null;
    const client = project?.client_id
      ? await getUserById(project.client_id)
      : null;

    // 2. Calculer le montant de commission
    const calculateDevisTotal = () => {
      if (!devis.selectedItems || devis.selectedItems.length === 0) {
        return { totalHT: 0, totalTVA: 0, totalTTC: 0 };
      }

      let totalHTGeneral = 0;
      let totalTVAGeneral = 0;

      devis.selectedItems.forEach((item) => {
        if (!item.isOffered) {
          const prixHT = item.prix_ht || 0;
          const quantite = item.quantite || 0;
          const totalItemHT = prixHT * quantite;

          const tauxTVA = item.tva || 20;
          const totalItemTVA = totalItemHT * (tauxTVA / 100);

          totalHTGeneral += totalItemHT;
          totalTVAGeneral += totalItemTVA;
        }
      });

      return {
        totalHT: totalHTGeneral,
        totalTVA: totalTVAGeneral,
        totalTTC: totalHTGeneral + totalTVAGeneral,
      };
    };

    const devisTotals = calculateDevisTotal();
    const montantCommissionHT = (devisTotals.totalHT * tauxCommission) / 100;

    // 3. Récupérer ou créer les données de facture
    const factureData = await getOrCreateFactureCommissionData(
      devis.id,
      devis.createdAt,
      factureType,
      tauxCommission,
      montantCommissionHT
    );

    const fileName = `${factureData.factureNumber}-${Date.now()}.pdf`;
    const cloudinaryPublicId = `factures_commission/${
      factureData.factureNumber
    }-${Date.now()}`;

    console.log("🔄 Génération et mise à jour du PDF sur Cloudinary...");

    // 4. Générer le blob PDF avec react-pdf
    const pdfBlob = await pdf(
      <FactureCommissionPDFDocument
        devis={devis}
        user={user}
        client={client}
        project={project}
        factureType={factureType}
        tauxCommission={tauxCommission}
      />
    ).toBlob();

    // 5. Upload vers Cloudinary (écrasement forcé)
    const uploadPDFToCloudinary = async (
      pdfBlob: Blob,
      fileName: string,
      cloudinaryPublicId: string
    ): Promise<string> => {
      const formData = new FormData();
      formData.append("file", pdfBlob, fileName);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );
      formData.append("public_id", cloudinaryPublicId);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload vers Cloudinary");
      }

      const data = await response.json();
      return data.secure_url;
    };

    const pdfUrl = await uploadPDFToCloudinary(pdfBlob, fileName, cloudinaryPublicId);

    // 6. Mettre à jour les données de facture
    await updateFacturePDFData(factureData.id, pdfUrl, cloudinaryPublicId);

    // 7. Sauvegarder dans la base de données
    if (devis.projectId) {
      await addProjectDocument({
        projectId: devis.projectId,
        name: fileName,
        category: "facture",
        date: new Date().toISOString(),
        size: "N/A",
        status: "signé" as const,
        url: pdfUrl,
        devisConfigId: devis.id,
      });
    }

    // 8. Télécharger le fichier
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération du PDF depuis Cloudinary"
        );
      }

      const pdfBlobDownloaded = await response.blob();
      const downloadUrl = window.URL.createObjectURL(pdfBlobDownloaded);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      console.log("✅ Téléchargement automatique lancé");
    } catch (downloadError) {
      console.error("❌ Erreur lors du téléchargement:", downloadError);
      window.open(pdfUrl, "_blank");
    }

    console.log("✅ Facture de commission générée avec succès:", fileName);
    return {
      success: true,
      fileName,
      pdfUrl,
      factureNumber: factureData.factureNumber,
    };
  } catch (error) {
    console.error(
      "❌ Erreur lors de la génération de la facture de commission:",
      error
    );
    throw error;
  } finally {
    if (setLoading) setLoading(false);
  }
};
