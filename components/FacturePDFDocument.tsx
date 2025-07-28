import { ArtisanUser, User } from "@/lib/firebase/users";
import { Project } from "@/lib/firebase/projects";
import { Devis } from "@/types/devis";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { Timestamp } from "firebase/firestore";
import { Image } from "@react-pdf/renderer";

// Définition des styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 12,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  companyName: {
    fontSize: 24,
    color: "#F26755",
    fontWeight: "bold",
  },
  invoiceNumberBox: {
    borderWidth: 2,
    borderColor: "#F26755",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "white",
    minWidth: 180,
    textAlign: "center",
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F26755",
    marginBottom: 10,
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  companyInfo: {
    width: "48%",
  },
  clientBox: {
    borderWidth: 2,
    borderColor: "#F26755",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#FFF5F3",
    width: "48%",
  },
  clientTitle: {
    fontWeight: "bold",
    color: "#F26755",
    marginBottom: 5,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 10,
    color: "#F26755",
  },
  table: {
    width: "100%",
    marginBottom: 30,
  },
  tableHeader: {
    backgroundColor: "#F26755",
    color: "white",
    flexDirection: "row",
    paddingVertical: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F26755",
    paddingVertical: 8,
  },
  tableRowEven: {
    backgroundColor: "#FFF5F3",
  },
  colDesignation: {
    width: "40%",
    paddingLeft: 10,
  },
  colUnit: {
    width: "15%",
    textAlign: "center",
  },
  colQuantity: {
    width: "15%",
    textAlign: "center",
  },
  colPrice: {
    width: "15%",
    textAlign: "right",
    paddingRight: 10,
  },
  colTotal: {
    width: "15%",
    textAlign: "right",
    paddingRight: 10,
  },
  conditionsBox: {
    backgroundColor: "#FFF5F3",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#F26755",
    width: "48%",
  },
  totalBox: {
    borderWidth: 2,
    borderColor: "#F26755",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "white",
    width: "48%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalTTC: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 2,
    borderTopColor: "#F26755",
    paddingTop: 10,
    marginTop: 5,
  },
  totalTTCText: {
    color: "#F26755",
    fontSize: 14,
    fontWeight: "bold",
  },
  totalTTCAmount: {
    backgroundColor: "#F26755",
    color: "white",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "bold",
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 20,
    marginBottom: 80,
  },
  signatureBox: {
    width: "45%",
    alignItems: "center",
    paddingTop: 10,
  },
  signatureText: {
    fontWeight: "bold",
    color: "#F26755",
    fontSize: 10,
  },
  legalMentionsFooter: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    textAlign: "center",
    fontSize: 12,
    color: "#666",
    borderTopWidth: 3,
    borderTopColor: "#F26755",
    borderTopStyle: "solid",
    paddingTop: 8,
  },
  noteText: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#666666",
    marginTop: 10,
    marginBottom: 20,
  },
});

interface FacturePDFDocumentProps {
  devis: Devis;
  artisan: ArtisanUser | null;
  client: User | null;
  project: Project | null;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  tvaRate: number;
}

export const FacturePDFDocument = ({
  artisan,
  devis,
  client,
  project,
  totalHT,
  totalTVA,
  totalTTC,
  tvaRate,
}: FacturePDFDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* En-tête */}
      <View style={styles.header}>
        <View>
          {artisan?.companyLogoUrl ? (
            <Image
              src={artisan.companyLogoUrl}
              style={{ height: 60, objectFit: "contain", marginBottom: 8 }}
            />
          ) : (
            <Text style={styles.companyName}>
              {artisan?.companyName}
            </Text>
          )}
        </View>
        <View style={styles.invoiceNumberBox}>
          <Text style={styles.invoiceNumber}>FACTURE N° {devis.numero}</Text>
          <Text>
            Date :{" "}
            {devis.createdAt
              ? devis.createdAt instanceof Timestamp
                ? devis.createdAt.toDate().toLocaleDateString("fr-FR")
                : devis.createdAt instanceof Date
                ? devis.createdAt.toLocaleDateString("fr-FR")
                : "-"
              : "-"}
          </Text>
        </View>
      </View>

      {/* Informations entreprise et client */}
      <View style={styles.infoSection}>
        <View style={styles.companyInfo}>
          <Text style={{ fontWeight: "bold", fontSize: 14 }}>
            {artisan?.companyName}
          </Text>
          <Text>{artisan?.companyAddress}</Text>
          <Text>
            {artisan?.companyPostalCode} {artisan?.companyCity}
          </Text>
          <Text>Tél: {artisan?.companyPhone}</Text>
          <Text>Mail: {artisan?.companyEmail}</Text>
        </View>
        <View style={styles.clientBox}>
          <Text style={styles.clientTitle}>Client</Text>
          <Text>
            {client?.firstName} {client?.lastName}
          </Text>
          <Text>{project?.location}</Text>
          {project?.postalCode && (
            <Text>
              {project?.postalCode} {project?.city}
            </Text>
          )}
          {client?.phone && <Text>Tél: {client?.phone}</Text>}
          {client?.email && <Text>Mail: {client?.email}</Text>}
        </View>
      </View>

      {/* Tableau des prestations */}
      <Text style={styles.sectionTitle}>Détail des prestations</Text>
      <View style={styles.table}>
        {/* En-tête du tableau */}
        <View style={styles.tableHeader}>
          <Text style={styles.colDesignation}>Désignation</Text>
          <Text style={styles.colUnit}>Unité</Text>
          <Text style={styles.colQuantity}>Quantité</Text>
          <Text style={styles.colPrice}>Prix unitaire</Text>
          <Text style={styles.colTotal}>Total HT</Text>
        </View>

        {/* Lignes du tableau */}
        {(devis.selectedItems ?? []).map((item, idx) => (
          <View
            key={item.id}
            style={
              idx % 2 === 0
                ? styles.tableRow
                : [styles.tableRow, styles.tableRowEven]
            }
          >
            <View style={styles.colDesignation}>
              <Text style={{ fontWeight: "bold" }}>{item.itemName}</Text>
              {item.description && (
                <Text style={{ fontSize: 10, color: "#666666" }}>
                  {item.description}
                </Text>
              )}
            </View>
            <Text style={styles.colUnit}>{item.unite}</Text>
            <Text style={styles.colQuantity}>{item.quantite}</Text>
            <Text style={styles.colPrice}>{item.prix_ht.toFixed(2)} €</Text>
            <Text style={styles.colTotal}>
              {(item.prix_ht * item.quantite).toFixed(2)} €
            </Text>
          </View>
        ))}
      </View>

      {/* Conditions et totaux */}
      <View style={styles.infoSection} wrap={false}>
        <View style={styles.conditionsBox}>
          <Text style={styles.sectionTitle}>Conditions de règlement :</Text>
          <View style={{ paddingLeft: 5 }}>
            <Text>- Acompte de 20% à la commande</Text>
            <Text>- Acompte de 30% au début des travaux</Text>
            <Text>- Solde à la livraison, paiement comptant dès réception</Text>
          </View>
        </View>
        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={{ fontWeight: "bold", color: "#F26755" }}>
              TOTAL HT :
            </Text>
            <Text style={{ fontWeight: "bold" }}>{totalHT.toFixed(2)} €</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ fontWeight: "bold", color: "#F26755" }}>
              TVA {tvaRate}% :
            </Text>
            <Text style={{ fontWeight: "bold" }}>{totalTVA.toFixed(2)} €</Text>
          </View>
          <View style={styles.totalTTC}>
            <Text style={styles.totalTTCText}>TOTAL TTC :</Text>
            <Text style={styles.totalTTCAmount}>{totalTTC.toFixed(2)} €</Text>
          </View>
        </View>
      </View>

      {/* Note de signature */}
      <Text style={styles.noteText}>
        Merci de nous retourner un exemplaire de ce devis signé avec votre nom
        et revêtu de la mention « Bon pour accord et commande »
      </Text>

      {/* Signatures */}
      <View style={styles.signatureSection} wrap={false}>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureText}>Signature de l'entreprise</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureText}>Signature du client</Text>
        </View>
      </View>

      {/* Mentions légales */}
      <Text style={styles.legalMentionsFooter} fixed>
        {`${artisan?.companyLegalForm} ${artisan?.companyName} ${
          artisan?.siret ? `Siret ${artisan.siret}` : ""
        } RCS ${artisan?.rcs} Code APE ${artisan?.companyApe}`}
      </Text>
    </Page>
  </Document>
);
