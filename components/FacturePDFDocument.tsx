import { ArtisanUser, User } from "@/lib/firebase/users";
import { Project } from "@/lib/firebase/projects";
import { Devis } from "@/types/devis";
import { Document, Page, View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import { Timestamp } from "firebase/firestore";

// Définition des styles
const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
  },
  
  // Header avec dégradé simulé
  header: {
    backgroundColor: "#F26755",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  
  logoContainer: {
    flexShrink: 0,
  },
  
  logo: {
    height: 45,
    maxWidth: 180,
    objectFit: "contain",
    backgroundColor: "white",
    padding: 6,
    borderRadius: 6,
  },
  
  companyNameFallback: {
    backgroundColor: "white",
    color: "#F26755",
    padding: 8,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 100,
  },
  
  invoiceBox: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    minWidth: 180,
    textAlign: "center",
  },
  
  invoiceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F26755",
    marginBottom: 8,
  },
  
  invoiceDate: {
    fontSize: 12,
    color: "#374151",
  },
  
  // Section informations
  infoSection: {
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#F26755",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  
  infoBox: {
    backgroundColor: "#FFF5F3",
    borderLeftWidth: 2,
    borderLeftColor: "#F26755",
    padding: 10,
    borderRadius: 6,
    width: "48%",
  },
  
  infoTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#C5453A",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  
  infoText: {
    fontSize: 10,
    color: "#374151",
    marginBottom: 2,
  },
  
  infoTextBold: {
    fontSize: 10,
    color: "#1F2937",
    fontWeight: "bold",
    marginBottom: 2,
  },
  
  // Lots et prestations
  lotSection: {
    padding: 12,
    marginBottom: 0,
  },
  
  lotTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#F26755",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F2675550",
    paddingBottom: 3,
  },
  
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#F26755",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
  },
  
  tableHeader: {
    backgroundColor: "#F26755",
    color: "white",
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 3,
  },
  
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F2675550",
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  
  tableRowEven: {
    backgroundColor: "#F2675510",
  },
  
  // Colonnes du tableau
  colPrestation: { width: "35%", paddingRight: 4 },
  colQte: { width: "12%", textAlign: "center" },
  colPU: { width: "13%", textAlign: "right" },
  colTotalHT: { width: "13%", textAlign: "right" },
  colTVA: { width: "12%", textAlign: "center" },
  colTotalTTC: { width: "15%", textAlign: "right" },
  
  prestationName: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  
  prestationDesc: {
    fontSize: 8,
    color: "#6B7280",
    lineHeight: 1.2,
  },
  
  quantityContainer: {
    alignItems: "center",
  },
  
  quantityValue: {
    fontSize: 9,
    fontWeight: "bold",
  },
  
  quantityUnit: {
    fontSize: 8,
    color: "#6B7280",
  },
  
  tvaTag: {
    backgroundColor: "#F2675520",
    color: "#C5453A",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
  },
  
  priceText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  
  totalTTCText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#F26755",
  },
  
  // Totaux de lot
  lotTotalRow: {
    backgroundColor: "#F2675520",
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  
  lotTotalLabel: {
    width: "85%",
    textAlign: "right",
    fontSize: 9,
    fontWeight: "bold",
    color: "#C5453A",
    paddingRight: 8,
  },
  
  lotTotalValue: {
    width: "15%",
    textAlign: "right",
    fontSize: 9,
    fontWeight: "bold",
    color: "#C5453A",
  },
  
  lotTotalTTCRow: {
    backgroundColor: "#F2675530",
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 2,
    borderTopColor: "#F26755",
  },
  
  lotTotalTTCLabel: {
    width: "70%",
    textAlign: "right",
    fontSize: 11,
    fontWeight: "bold",
    color: "#C5453A",
    paddingRight: 8,
  },
  
  lotTotalTTCValue: {
    width: "30%",
    textAlign: "center",
  },
  
  lotTotalTTCBox: {
    backgroundColor: "#F26755",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  
  // Section conditions et totaux
  conditionsSection: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  
  conditionsBox: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 6,
    width: "48%",
  },
  
  conditionsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#C5453A",
    marginBottom: 8,
  },
  
  conditionItem: {
    fontSize: 9,
    color: "#374151",
    marginBottom: 2,
  },
  
  totalBox: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#F26755",
    padding: 10,
    borderRadius: 6,
    width: "48%",
  },
  
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#F26755",
  },
  
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  
  tvaDetailSection: {
    borderLeftWidth: 2,
    borderLeftColor: "#F2675550",
    paddingLeft: 8,
    marginVertical: 6,
  },
  
  tvaDetailTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#C5453A",
    marginBottom: 4,
  },
  
  tvaDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  
  tvaDetailLabel: {
    fontSize: 8,
    color: "#6B7280",
  },
  
  tvaDetailValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#F26755",
  },
  
  totalTTCFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 2,
    borderTopColor: "#F26755",
    paddingTop: 8,
    marginTop: 8,
  },
  
  totalTTCFinalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#F26755",
  },
  
  totalTTCFinalValue: {
    backgroundColor: "#F26755",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: "bold",
  },
  
  // Signature
  signatureNote: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#6B7280",
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: "#F2675550",
    paddingTop: 10,
  },
  
  signatureSection: {
    padding: 12,
    backgroundColor: "white",
  },
  
  signatureTitle: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    color: "#C5453A",
    marginBottom: 12,
  },
  
  signatureBoxes: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  
  signatureBox: {
    width: "48%",
    textAlign: "center",
  },
  
  signatureLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#C5453A",
    marginBottom: 8,
  },
  
  signatureArea: {
    borderWidth: 1,
    borderColor: "#F26755",
    borderStyle: "dashed",
    borderRadius: 6,
    height: 40,
    backgroundColor: "#F2675520",
  },
  
  // Mentions légales
  legalMentions: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: "center",
    fontSize: 8,
    color: "#6B7280",
    backgroundColor: "#F2675520",
    padding: 8,
    borderTopWidth: 3,
    borderTopColor: "#F26755",
  },
});

interface FacturePDFDocumentProps {
  devis: Devis;
  artisan: ArtisanUser | null;
  client: User | null;
  project: Project | null;
}

export const FacturePDFDocument = ({
  artisan,
  devis,
  client,
  project,
}: FacturePDFDocumentProps) => {
  // Fonction de formatage des prix
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  // Calcul des lots et totaux
  const lotsMap = new Map();
  (devis.selectedItems ?? []).forEach((item) => {
    const lotKey = item.lotName || "Autre";
    if (!lotsMap.has(lotKey)) lotsMap.set(lotKey, []);
    lotsMap.get(lotKey).push(item);
  });

  const lotsTotals: {
    lotName: any;
    items: any;
    lotHT: number;
    lotTVA: number;
    lotTTC: number;
    tvaRate: any;
  }[] = [];
  let totalHTGeneral = 0;
  let totalTVAGeneral = 0;

  lotsMap.forEach((items, lotName) => {
    let lotHT = 0,
      lotTVA = 0;
    items.forEach(
      (item: { prix_ht: number; quantite: number; tva: number }) => {
        const itemHT = item.prix_ht * item.quantite;
        const itemTVA = itemHT * (item.tva / 100);
        lotHT += itemHT;
        lotTVA += itemTVA;
      }
    );
    const lotTTC = lotHT + lotTVA;
    lotsTotals.push({
      lotName,
      items,
      lotHT,
      lotTVA,
      lotTTC,
      tvaRate: items[0]?.tva,
    });
    totalHTGeneral += lotHT;
    totalTVAGeneral += lotTVA;
  });
  const totalTTCGeneral = totalHTGeneral + totalTVAGeneral;

  // Calcul du détail TVA par taux
  const tvaByRate: Record<number, { baseHT: number; montantTVA: number }> = {};
  devis.selectedItems.forEach((item) => {
    if (item.tva === undefined || item.tva === null) return;
    const montantHT = item.prix_ht * item.quantite;
    const montantTVA = (montantHT * item.tva) / 100;
    if (!tvaByRate[item.tva]) {
      tvaByRate[item.tva] = { baseHT: 0, montantTVA: 0 };
    }
    tvaByRate[item.tva].baseHT += montantHT;
    tvaByRate[item.tva].montantTVA += montantTVA;
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {artisan?.companyLogoUrl ? (
              <Image src={artisan.companyLogoUrl} style={styles.logo} />
            ) : (
              <Text style={styles.companyNameFallback}>
                {artisan?.companyName || "Entreprise"}
              </Text>
            )}
          </View>
          
          <View style={styles.invoiceBox}>
            <Text style={styles.invoiceTitle}>FACTURE N° {devis.numero}</Text>
            <Text style={styles.invoiceDate}>
              Date:{" "}
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

        {/* Informations prestataire et client */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>PRESTATAIRE</Text>
            <Text style={styles.infoTextBold}>{artisan?.companyName}</Text>
            <Text style={styles.infoText}>{artisan?.companyAddress}</Text>
            <Text style={styles.infoText}>
              {artisan?.companyPostalCode} {artisan?.companyCity}
            </Text>
            <Text style={styles.infoText}>Tél: {artisan?.companyPhone}</Text>
            <Text style={styles.infoText}>Email: {artisan?.companyEmail}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>CLIENT</Text>
            <Text style={styles.infoTextBold}>
              {client?.firstName} {client?.lastName}
            </Text>
            <Text style={styles.infoText}>{project?.location}</Text>
            <Text style={styles.infoText}>
              {project?.postalCode} {project?.addressDetails}
            </Text>
            {client?.phone && (
              <Text style={styles.infoText}>Tél: {client?.phone}</Text>
            )}
            {client?.email && (
              <Text style={styles.infoText}>Email: {client?.email}</Text>
            )}
          </View>
        </View>

        {/* Prestations par lot */}
        <View style={styles.lotSection}>
          {lotsTotals.map((lot, lotIndex) => (
            <View key={lot.lotName} style={{ marginBottom: 20 }} wrap={false}>
              <Text style={styles.lotTitle}>{lot.lotName}</Text>
              
              <View style={styles.table}>
                {/* En-tête du tableau */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.colPrestation, { color: "white", fontSize: 9, fontWeight: "bold" }]}>
                    Prestation
                  </Text>
                  <Text style={[styles.colQte, { color: "white", fontSize: 9, fontWeight: "bold" }]}>
                    Qté
                  </Text>
                  <Text style={[styles.colPU, { color: "white", fontSize: 9, fontWeight: "bold" }]}>
                    PU HT
                  </Text>
                  <Text style={[styles.colTotalHT, { color: "white", fontSize: 9, fontWeight: "bold" }]}>
                    Total HT
                  </Text>
                  <Text style={[styles.colTVA, { color: "white", fontSize: 9, fontWeight: "bold" }]}>
                    TVA
                  </Text>
                  <Text style={[styles.colTotalTTC, { color: "white", fontSize: 9, fontWeight: "bold" }]}>
                    Total TTC
                  </Text>
                </View>

                {/* Lignes du tableau */}
                {lot.items.map((item: any, itemIndex: number) => {
                  const montantHT = item.prix_ht * item.quantite;
                  const montantTVA = (montantHT * item.tva) / 100;
                  const montantTTC = montantHT + montantTVA;

                  return (
                    <View
                      key={itemIndex}
                      style={[
                        styles.tableRow,
                        itemIndex % 2 === 1 ? styles.tableRowEven : {},
                      ]}
                    >
                      <View style={styles.colPrestation}>
                        <Text style={styles.prestationName}>{item.optionLabel}</Text>
                        {item.description && (
                          <Text style={styles.prestationDesc}>{item.description}</Text>
                        )}
                      </View>
                      <View style={[styles.colQte, styles.quantityContainer]}>
                        <Text style={styles.quantityValue}>{item.quantite}</Text>
                        <Text style={styles.quantityUnit}>{item.unite}</Text>
                      </View>
                      <Text style={[styles.colPU, styles.priceText]}>
                        {formatPrice(item.prix_ht)}
                      </Text>
                      <Text style={[styles.colTotalHT, styles.priceText]}>
                        {formatPrice(montantHT)}
                      </Text>
                      <View style={[styles.colTVA, { alignItems: "center" }]}>
                        <Text style={styles.tvaTag}>{item.tva}%</Text>
                      </View>
                      <Text style={[styles.colTotalTTC, styles.totalTTCText]}>
                        {formatPrice(montantTTC)}
                      </Text>
                    </View>
                  );
                })}

                {/* Totaux du lot */}
                <View style={styles.lotTotalRow}>
                  <Text style={styles.lotTotalLabel}>Total HT du lot :</Text>
                  <Text style={styles.lotTotalValue}>{formatPrice(lot.lotHT)}</Text>
                </View>

                <View style={styles.lotTotalRow}>
                  <Text style={styles.lotTotalLabel}>Total TVA du lot :</Text>
                  <Text style={styles.lotTotalValue}>{formatPrice(lot.lotTVA)}</Text>
                </View>

                <View style={styles.lotTotalTTCRow}>
                  <Text style={styles.lotTotalTTCLabel}>Total TTC du lot :</Text>
                  <View style={styles.lotTotalTTCValue}>
                    <Text style={styles.lotTotalTTCBox}>{formatPrice(lot.lotTTC)}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Conditions et totaux */}
        <View style={styles.conditionsSection} wrap={false}>
          <View style={styles.conditionsBox}>
            <Text style={styles.conditionsTitle}>Conditions de règlement :</Text>
            <Text style={styles.conditionItem}>• Acompte de 20% à la commande</Text>
            <Text style={styles.conditionItem}>• Acompte de 30% au début des travaux</Text>
            <Text style={styles.conditionItem}>• Solde à la livraison, paiement comptant dès réception</Text>
          </View>

          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL HT :</Text>
              <Text style={styles.totalValue}>{formatPrice(totalHTGeneral)}</Text>
            </View>

            {/* Détail TVA */}
            <View style={styles.tvaDetailSection}>
              <Text style={styles.tvaDetailTitle}>Détail TVA :</Text>
              {Object.entries(tvaByRate).map(([taux, data]) => (
                <View key={taux} style={styles.tvaDetailRow}>
                  <Text style={styles.tvaDetailLabel}>
                    TVA {taux}% sur {formatPrice(data.baseHT)} :
                  </Text>
                  <Text style={styles.tvaDetailValue}>
                    {formatPrice(data.montantTVA)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL TVA :</Text>
              <Text style={styles.totalValue}>{formatPrice(totalTVAGeneral)}</Text>
            </View>

            <View style={styles.totalTTCFinalRow}>
              <Text style={styles.totalTTCFinalLabel}>TOTAL TTC :</Text>
              <Text style={styles.totalTTCFinalValue}>{formatPrice(totalTTCGeneral)}</Text>
            </View>
          </View>
        </View>

        {/* Note de signature */}
        <Text style={styles.signatureNote}>
          Merci de nous retourner un exemplaire de ce devis signé avec votre nom
          et revêtu de la mention « Bon pour accord et commande »
        </Text>

        {/* Signatures */}
        <View style={styles.signatureSection} wrap={false}>
          <Text style={styles.signatureTitle}>SIGNATURES</Text>
          <View style={styles.signatureBoxes}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Signature de l'entreprise</Text>
              <View style={styles.signatureArea} />
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Signature du client</Text>
              <View style={styles.signatureArea} />
            </View>
          </View>
        </View>

        {/* Mentions légales */}
        <Text style={styles.legalMentions} fixed>
          {artisan?.companyLegalForm} {artisan?.companyName} au Capital de{" "}
          {artisan?.companyCapital} - Siret {artisan?.siret} - RCS{" "}
          {artisan?.rcs} - Code APE {artisan?.companyApe}
        </Text>
      </Page>
    </Document>
  );
};