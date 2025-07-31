import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import { Devis } from "@/types/devis";
import { ArtisanUser, User, CourtierUser } from "@/lib/firebase/users";
import { Project } from "@/lib/firebase/projects";
import { Timestamp } from "firebase/firestore";
import { DEFAULT_COMPANY_INFO } from "./FacturePreview";

// Enregistrement des polices (optionnel)
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
// });


// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 15,
    paddingBottom: 40,
    fontFamily: 'Helvetica',
  },
  
  // En-tête
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F26755',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  
  logo: {
    width: 140,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 5,
  },
  
  logoText: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    width: 120,
    textAlign: 'center',
  },
  
  logoTextContent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F26755',
  },
  
  invoiceInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F26755',
    marginBottom: 5,
  },
  
  invoiceDate: {
    fontSize: 12,
    color: '#374151',
  },
  
  // Informations client/entreprise
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 15,
  },
  
  infoBox: {
    flex: 1,
    backgroundColor: '#F2675520',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F26755',
  },
  
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C5453A',
    marginBottom: 10,
  },
  
  infoText: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 3,
  },
  
  infoTextBold: {
    fontSize: 10,
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  
  // Tableaux
  lotTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F26755',
    marginBottom: 8,
    marginTop: 2,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#F2675550',
  },
  
  table: {
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F26755',
    borderRadius: 6,
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F26755',
    color: 'white',
    fontWeight: 'bold',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F2675550',
    minHeight: 25,
  },
  
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#F2675510',
    borderBottomWidth: 1,
    borderBottomColor: '#F2675550',
    minHeight: 25,
  },
  
  tableCellHeader: {
    padding: 6,
    fontSize: 9,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: 'white',
  },
  
  tableCellDescription: {
    flex: 4,
    padding: 6,
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: '#F2675550',
  },
  
  tableCellCenter: {
    flex: 1,
    padding: 6,
    fontSize: 8,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F2675550',
    justifyContent: 'center',
  },
  
  tableCellRight: {
    flex: 1,
    padding: 6,
    fontSize: 8,
    textAlign: 'right',
    borderRightWidth: 1,
    borderRightColor: '#F2675550',
    justifyContent: 'center',
  },
  
  tableCellLast: {
    flex: 1,
    padding: 6,
    fontSize: 8,
    textAlign: 'right',
    justifyContent: 'center',
  },
  
  // Totaux du lot
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#F2675520',
    minHeight: 25,
  },
  
  totalCellLabel: {
    flex: 5,
    padding: 6,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#C5453A',
    textAlign: 'right',
    justifyContent: 'center',
  },
  
  totalCellValue: {
    flex: 1,
    padding: 6,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#C5453A',
    textAlign: 'right',
    justifyContent: 'center',
  },
  
  finalTotalRow: {
    flexDirection: 'row',
    backgroundColor: '#F2675540',
    borderTopWidth: 2,
    borderTopColor: '#F26755',
    minHeight: 30,
  },
  
  finalTotalLabel: {
    flex: 5,
    padding: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C5453A',
    textAlign: 'right',
    justifyContent: 'center',
  },
  
  finalTotalValue: {
    flex: 1,
    padding: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#F26755',
    textAlign: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    margin: 3,
  },
  
  // Section finale
  finalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 15,
  },
  
  conditionsBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
  },
  
  conditionsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C5453A',
    marginBottom: 8,
  },
  
  conditionText: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 3,
  },
  
  totalBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#F26755',
  },
  
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F26755',
  },
  
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  
  tvaDetail: {
    marginLeft: 10,
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#F2675550',
  },
  
  tvaDetailTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#C5453A',
    marginBottom: 3,
  },
  
  tvaDetailLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  
  finalTotalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#F26755',
  },
  
  finalTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F26755',
  },
  
  finalTotalAmount: {
    backgroundColor: '#F26755',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    padding: 8,
    borderRadius: 10,
  },
  
  // Signature et mentions
  signatureMessage: {
    textAlign: 'center',
    fontSize: 10,
    fontStyle: 'italic',
    color: '#6B7280',
    marginTop: 15,
    marginBottom: 15,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#F2675550',
  },
  
  signatureSection: {
    marginTop: 15,
    marginBottom: 15,
  },
  
  signatureTitle: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C5453A',
    marginBottom: 15,
  },
  
  signatureBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 30,
  },
  
  signatureBox: {
    flex: 1,
    alignItems: 'center',
  },
  
  signatureLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#C5453A',
    marginBottom: 10,
  },
  
  signatureSpace: {
    height: 50,
    width: '100%',
  },
  
  // Footer avec mentions légales
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F2675520',
    borderTopWidth: 2,
    borderTopColor: '#F26755',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  
  legalMentions: {
    textAlign: 'center',
    fontSize: 8,
    color: '#6B7280',
  },
  
  // Utilitaires
  tvaTag: {
    backgroundColor: '#F2675520',
    color: '#C5453A',
    fontSize: 8,
    fontWeight: 'bold',
    padding: 2,
    borderRadius: 3,
    textAlign: 'center',
  },
});

interface FacturePDFDocumentProps {
  devis: Devis;
  user: ArtisanUser | CourtierUser | null;
  client: User | null;
  project: Project | null;
}

// Fonction utilitaire pour formater les prix
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

// Fonction utilitaire pour formater les dates
const formatDate = (date: any): string => {
  if (!date) return "-";
  
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString("fr-FR");
  } else if (date instanceof Date) {
    return date.toLocaleDateString("fr-FR");
  }
  
  return "-";
};

export const FacturePDFDocument: React.FC<FacturePDFDocumentProps> = ({
  devis,
  user,
  client,
  project,
}) => {
  // Traitement des lots
  const lotsMap = new Map();
  (devis.selectedItems ?? []).forEach((item) => {
    const lotKey = item.lotName || "Autre";
    if (!lotsMap.has(lotKey)) lotsMap.set(lotKey, []);
    lotsMap.get(lotKey).push(item);
  });

  const lotsTotals: Array<{
    lotName: any;
    items: any;
    lotHT: number;
    lotTVA: number;
    lotTTC: number;
    tvaRate: any;
  }> = [];
  
  let totalHTGeneral = 0;
  let totalTVAGeneral = 0;

  lotsMap.forEach((items, lotName) => {
    let lotHT = 0, lotTVA = 0;
    items.forEach((item: { prix_ht: number; quantite: number; tva: number }) => {
      const itemHT = item.prix_ht * item.quantite;
      const itemTVA = itemHT * (item.tva / 100);
      lotHT += itemHT;
      lotTVA += itemTVA;
    });
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

  // Calcul du détail TVA
  const tvaByRate: Record<number, { baseHT: number; montantTVA: number }> = {};
  (devis.selectedItems ?? []).forEach((item) => {
    if (item.tva === undefined || item.tva === null) return;
    
    const montantHT = item.prix_ht * item.quantite;
    const montantTVA = (montantHT * item.tva) / 100;
    if (!tvaByRate[item.tva]) {
      tvaByRate[item.tva] = { baseHT: 0, montantTVA: 0 };
    }
    tvaByRate[item.tva].baseHT += montantHT;
    tvaByRate[item.tva].montantTVA += montantTVA;
  });

  // Générer le texte des mentions légales
  const legalMentionsText = user && user.role === "artisan"
    ? `${user?.companyLegalForm} ${user?.companyName} au Capital de ${user?.companyCapital} ${
        user?.siret ? `- Siret ${user.siret}` : ""
      } - RCS ${user?.rcs} - Code APE ${user?.companyApe}`
    : `${DEFAULT_COMPANY_INFO.companyLegalForm} ${DEFAULT_COMPANY_INFO.name} au Capital de ${DEFAULT_COMPANY_INFO.companyCapital} ${
        DEFAULT_COMPANY_INFO.siret ? `- Siret ${DEFAULT_COMPANY_INFO.siret}` : ""
      } - RCS ${DEFAULT_COMPANY_INFO.rcs} - Code APE ${DEFAULT_COMPANY_INFO.companyApe}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            {user && user.role === "artisan" ? (
              user?.companyLogoUrl ? (
                <Image src={user.companyLogoUrl} style={styles.logo} />
              ) : (
                <View style={styles.logoText}>
                  <Text style={styles.logoTextContent}>
                    {user?.companyName || "Entreprise"}
                  </Text>
                </View>
              )
            ) : (
              <Image src={DEFAULT_COMPANY_INFO.logoUrl} style={styles.logo} />
            )}
          </View>
          
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>FACTURE N° {devis.numero}</Text>
            <Text style={styles.invoiceDate}>
              Date: {formatDate(devis.createdAt)}
            </Text>
          </View>
        </View>

        {/* Informations client/entreprise */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>PRESTATAIRE</Text>
            <Text style={styles.infoTextBold}>
              {user?.role === "artisan" ? user?.companyName : DEFAULT_COMPANY_INFO.name}
            </Text>
            <Text style={styles.infoText}>
              {user?.role === "artisan" ? user?.companyAddress : DEFAULT_COMPANY_INFO.address}
            </Text>
            <Text style={styles.infoText}>
              {user?.role === "artisan" 
                ? `${user?.companyPostalCode} ${user?.companyCity}`
                : `${DEFAULT_COMPANY_INFO.postalCode} ${DEFAULT_COMPANY_INFO.city}`}
            </Text>
            <Text style={styles.infoText}>
              Tél: {user?.role === "artisan" ? user?.companyPhone : user?.phone}
            </Text>
            <Text style={styles.infoText}>
              Email: {user?.role === "artisan" ? user?.companyEmail : user?.email}
            </Text>
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
        {lotsTotals.map((lot, lotIndex) => (
          <View key={lot.lotName} wrap={false} minPresenceAhead={100}>
            <Text style={styles.lotTitle}>{lot.lotName}</Text>
            
            <View style={styles.table} wrap={false}>
              {/* En-tête du tableau */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, { flex: 4 }]}>Prestation</Text>
                <Text style={[styles.tableCellHeader, { flex: 1 }]}>Qté</Text>
                <Text style={[styles.tableCellHeader, { flex: 1 }]}>PU HT</Text>
                <Text style={[styles.tableCellHeader, { flex: 1 }]}>Total HT</Text>
                <Text style={[styles.tableCellHeader, { flex: 1 }]}>TVA</Text>
                <Text style={[styles.tableCellHeader, { flex: 1, borderRightWidth: 0 }]}>Total TTC</Text>
              </View>

              {/* Corps du tableau */}
              {lot.items.map((item: any, itemIndex: number) => {
                const montantHT = item.prix_ht * item.quantite;
                const montantTVA = (montantHT * item.tva) / 100;
                const montantTTC = montantHT + montantTVA;

                return (
                  <View 
                    key={itemIndex} 
                    style={itemIndex % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                  >
                    <View style={styles.tableCellDescription}>
                      <Text style={{ fontWeight: 'bold', marginBottom: 1 }}>
                        {item.optionLabel}
                      </Text>
                      {item.description && (
                        <Text style={{ fontSize: 7, color: '#6B7280' }}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <View style={styles.tableCellCenter}>
                      <Text style={{ fontWeight: 'bold' }}>{item.quantite}</Text>
                      <Text style={{ fontSize: 7, color: '#6B7280' }}>{item.unite}</Text>
                    </View>
                    <Text style={styles.tableCellRight}>{formatPrice(item.prix_ht)}</Text>
                    <Text style={styles.tableCellRight}>{formatPrice(montantHT)}</Text>
                    <View style={styles.tableCellCenter}>
                      <Text style={styles.tvaTag}>{item.tva}%</Text>
                    </View>
                    <Text style={[styles.tableCellLast, { fontWeight: 'bold', color: '#F26755' }]}>
                      {formatPrice(montantTTC)}
                    </Text>
                  </View>
                );
              })}

              {/* Totaux du lot */}
              <View style={styles.totalRow}>
                <Text style={styles.totalCellLabel}>Total HT du lot :</Text>
                <Text style={styles.totalCellValue}>{formatPrice(lot.lotHT)}</Text>
              </View>
              
              <View style={styles.totalRow}>
                <Text style={styles.totalCellLabel}>Total TVA du lot :</Text>
                <Text style={styles.totalCellValue}>{formatPrice(lot.lotTVA)}</Text>
              </View>
              
              <View style={styles.finalTotalRow}>
                <Text style={styles.finalTotalLabel}>Total TTC du lot :</Text>
                <Text style={styles.finalTotalValue}>{formatPrice(lot.lotTTC)}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Section finale */}
        <View style={styles.finalSection}>
          <View style={styles.conditionsBox}>
            <Text style={styles.conditionsTitle}>Conditions de règlement :</Text>
            <Text style={styles.conditionText}>• Acompte de 20% à la commande</Text>
            <Text style={styles.conditionText}>• Acompte de 30% au début des travaux</Text>
            <Text style={styles.conditionText}>• Solde à la livraison, paiement comptant dès réception</Text>
          </View>
          
          <View style={styles.totalBox}>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>TOTAL HT :</Text>
              <Text style={styles.totalValue}>{formatPrice(totalHTGeneral)}</Text>
            </View>
            
            <View style={styles.tvaDetail}>
              <Text style={styles.tvaDetailTitle}>Détail TVA :</Text>
              {Object.entries(tvaByRate).map(([taux, data]) => (
                <View key={taux} style={styles.tvaDetailLine}>
                  <Text>TVA {taux}% sur {formatPrice(data.baseHT)} :</Text>
                  <Text style={{ color: '#F26755', fontWeight: 'bold' }}>
                    {formatPrice(data.montantTVA)}
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>TOTAL TVA :</Text>
              <Text style={styles.totalValue}>{formatPrice(totalTVAGeneral)}</Text>
            </View>
            
            <View style={styles.finalTotalLine}>
              <Text style={styles.finalTotalText}>TOTAL TTC :</Text>
              <Text style={styles.finalTotalAmount}>{formatPrice(totalTTCGeneral)}</Text>
            </View>
          </View>
        </View>

        {/* Message signature */}
        <Text style={styles.signatureMessage}>
          Merci de nous retourner un exemplaire de ce devis signé avec votre nom et revêtu de la mention « Bon pour accord et commande »
        </Text>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>SIGNATURES</Text>
          <View style={styles.signatureBoxes}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Signature de l'entreprise</Text>
              <View style={styles.signatureSpace} />
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Signature du client</Text>
              <View style={styles.signatureSpace} />
            </View>
          </View>
        </View>

        {/* Footer avec mentions légales */}
        <View style={styles.footer} fixed>
          <Text style={styles.legalMentions}>
            {legalMentionsText}
          </Text>
        </View>
      </Page>
    </Document>
  );
};