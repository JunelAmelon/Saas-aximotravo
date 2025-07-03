import { Document, Page, View, Text, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Devis } from '@/types/devis';

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZg.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyYMZg.ttf', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#2D3748'
  },
  // Header élégant
  header: {
    marginBottom: 25,
    position: 'relative'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#F26755',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: 400,
    color: '#718096'
  },
  // Carte client premium
  clientCard: {
    backgroundColor: '#F26755',
    padding: 20,
    borderRadius: 8,
    marginBottom: 25,
    shadow: '0 4px 12px rgba(242, 103, 85, 0.2)'
  },
  clientText: {
    color: 'white',
    fontSize: 11,
    lineHeight: 1.5
  },
  // Section intro avec bordure stylée
  introSection: {
    marginBottom: 25,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F26755',
    backgroundColor: '#FAFAFA',
    borderRadius: 6,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  introText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#4A5568'
  },
  // Tableau des lots modernes
  lotTable: {
    width: '100%',
    marginBottom: 30,
    borderRadius: 8,
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2D3748',
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    backgroundColor: '#FFFFFF'
  },
  // Carte de prestation détaillée
  prestationCard: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  prestationTitle: {
    fontWeight: 600,
    color: '#2D3748',
    marginBottom: 6
  },
  prestationDesc: {
    fontSize: 9,
    color: '#718096',
    marginBottom: 8,
    lineHeight: 1.4
  },
  // Section détails avec couleurs
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  detailLabel: {
    fontSize: 9,
    color: '#718096'
  },
  detailValue: {
    fontSize: 9,
    fontWeight: 600,
    color: '#2D3748'
  },
  // Styles pour les prix et unités
  priceContainer: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BAE6FD'
  },
  priceText: {
    fontSize: 9,
    fontWeight: 700,
    color: '#0369A1'
  },
  unitContainer: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  unitText: {
    fontSize: 8,
    fontWeight: 600,
    color: '#166534'
  },
  totalContainer: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  totalText: {
    fontSize: 10,
    fontWeight: 700,
    color: '#DC2626'
  },
  quantityContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  quantityText: {
    fontSize: 8,
    fontWeight: 600,
    color: '#92400E'
  },
  // Styles pour les montants du tableau
  tablePriceContainer: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  tablePriceText: {
    fontSize: 10,
    fontWeight: 700,
    color: '#059669'
  },
  // Section pièces jointes
  piecesSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7'
  },
  pieceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  pieceBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F26755',
    marginRight: 6
  },
  // Totaux premium
  totalsSection: {
    marginTop: 25,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F26755'
  },
  totalHTContainer: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#BAE6FD'
  },
  totalHTText: {
    fontSize: 11,
    fontWeight: 700,
    color: '#0369A1'
  },
  tvaContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  tvaText: {
    fontSize: 11,
    fontWeight: 700,
    color: '#92400E'
  },
  totalTTCContainer: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#F26755'
  },
  totalTTCText: {
    fontSize: 14,
    fontWeight: 700,
    color: '#F26755'
  },
  // Paiements stylés
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7'
  },
  paymentPercent: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F26755',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  paymentAmountContainer: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  paymentAmountText: {
    fontSize: 10,
    fontWeight: 700,
    color: '#059669'
  },
  // Signature élégante
  signatureSection: {
    marginTop: 40,
    alignItems: 'flex-end'
  },
  signatureLine: {
    width: 200,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    textAlign: 'center'
  }
});

export const DevisPDFDocument = ({ devis }: { devis: Devis }) => {
  const totalHT = devis.selectedItems.reduce((sum, item) => sum + (item.quantite * item.prix_ht), 0);
  const tva = totalHT * 0.2;
  const totalTTC = totalHT + tva;

  const lotGroups = devis.selectedItems.reduce((groups, item) => {
    if (!groups[item.lotName]) groups[item.lotName] = [];
    groups[item.lotName].push(item);
    return groups;
  }, {} as Record<string, typeof devis.selectedItems>);

  const payments = [
    { label: 'Acompte à la signature', percent: 40, amount: totalTTC * 0.4 },
    { label: 'Versement intermédiaire', percent: 25, amount: totalTTC * 0.25 },
    { label: 'Versement intermédiaire', percent: 20, amount: totalTTC * 0.2 },
    { label: 'Solde final', percent: 15, amount: totalTTC * 0.15 }
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header élégant */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DEVIS N°{devis.numero}</Text>
          <Text style={styles.headerSubtitle}>{devis.titre} • Valable 30 jours</Text>
        </View>

        {/* Carte client premium */}
        <View style={styles.clientCard}>
          <Text style={[styles.clientText, { fontWeight: 700, marginBottom: 8 }]}>CLIENT</Text>
          <Text style={styles.clientText}>Société Client</Text>
          <Text style={styles.clientText}>12 Rue des Entrepreneurs</Text>
          <Text style={styles.clientText}>75000 Paris</Text>
          <Text style={[styles.clientText, { marginTop: 8 }]}>contact@client.com</Text>
          <Text style={styles.clientText}>Tél: 01 23 45 67 89</Text>
        </View>

        {/* Message d'intro avec bordure stylée */}
        <View style={styles.introSection}>
          <Text style={styles.introText}>
            Madame, Monsieur,
            {"\n\n"}
            Nous avons le plaisir de vous adresser notre devis détaillant l&apos;ensemble des prestations proposées, incluant les fournitures ainsi que la main d&apos;œuvre.
            {"\n\n"}
            Soucieuse de répondre au mieux à vos attentes, notre équipe reste à votre entière disposition pour toute demande d&apos;éclaircissement ou d&apos;ajustement. Nous mettons tout en œuvre pour que notre collaboration vous apporte pleine satisfaction.
            {"\n\n"}
            Dans l&apos;attente de votre retour, nous vous prions d&apos;agréer, Madame, Monsieur, l&apos;expression de nos salutations distinguées.
          </Text>
        </View>

        {/* Tableau récapitulatif des lots */}
        <View style={styles.lotTable}>
          <View style={styles.tableHeader}>
            <Text style={{ flex: 3, fontWeight: 600, color: 'white' }}>Lot</Text>
            <Text style={{ flex: 1, fontWeight: 600, color: 'white', textAlign: 'right' }}>Montant HT</Text>
          </View>
          
          {Object.entries(lotGroups).map(([lotName, items], index) => (
            <View key={index} style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }]}>
              <Text style={{ flex: 3 }}>Lot {index + 1} - {lotName}</Text>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <View style={styles.tablePriceContainer}>
                  <Text style={styles.tablePriceText}>
                    {items.reduce((sum, item) => sum + (item.quantite * item.prix_ht), 0).toFixed(2)} €
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Détails des prestations */}
        {Object.entries(lotGroups).map(([lotName, items], lotIndex) => (
          <View key={lotIndex} wrap={false}>
            <Text style={{ 
              fontWeight: 700, 
              color: '#F26755', 
              marginBottom: 12,
              fontSize: 12,
              backgroundColor: '#F8FAFC',
              padding: 8,
              borderRadius: 4
            }}>
              LOT {lotIndex + 1} - {lotName.toUpperCase()}
            </Text>
            
            {items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.prestationCard}>
                <Text style={styles.prestationTitle}>{item.optionLabel}</Text>
                <Text style={styles.prestationDesc}>{item.description}</Text>
                
                {/* Images */}
                {item.customImage && (
                  <View style={{ marginBottom: 10 }}>
                    <Image 
                      src={item.customImage} 
                      style={{ 
                        width: 80, 
                        height: 60, 
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: '#E2E8F0'
                      }} 
                    />
                  </View>
                )}
                
                {/* Détails chiffrés stylisés */}
                <View style={styles.detailsRow}>
                  <Text style={styles.detailLabel}>Quantité</Text>
                  <View style={styles.quantityContainer}>
                    <Text style={styles.quantityText}>
                      {item.quantite} {item.customUnit || item.unite}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailsRow}>
                  <Text style={styles.detailLabel}>Prix unitaire HT</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceText}>
                      {item.prix_ht.toFixed(2)} €
                    </Text>
                  </View>
                </View>
                
                <View style={[styles.detailsRow, { marginTop: 6 }]}>
                  <Text style={[styles.detailLabel, { fontWeight: 600 }]}>Total HT</Text>
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>
                      {(item.quantite * item.prix_ht).toFixed(2)} €
                    </Text>
                  </View>
                </View>
                
                {/* Pièces jointes */}
                {item.selectedPieces && item.selectedPieces.length > 0 && (
                  <View style={styles.piecesSection}>
                    <Text style={[styles.detailLabel, { marginBottom: 6 }]}>Pièces incluses:</Text>
                    {item.selectedPieces.map((piece, pieceIndex) => (
                      <View key={pieceIndex} style={styles.pieceItem}>
                        <View style={styles.pieceBullet} />
                        <Text style={[styles.detailValue, { fontSize: 8 }]}>{piece.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Section Totaux avec prix stylisés */}
        <View style={styles.totalsSection}>
          <Text style={{ fontWeight: 700, color: '#2D3748', marginBottom: 12 }}>RÉCAPITULATIF FINANCIER</Text>
          
          <View style={[styles.detailsRow, { marginBottom: 8 }]}>
            <Text style={styles.detailLabel}>Total HT</Text>
            <View style={styles.totalHTContainer}>
              <Text style={styles.totalHTText}>{totalHT.toFixed(2)} €</Text>
            </View>
          </View>
          
          <View style={[styles.detailsRow, { marginBottom: 12 }]}>
            <Text style={styles.detailLabel}>TVA (20%)</Text>
            <View style={styles.tvaContainer}>
              <Text style={styles.tvaText}>{tva.toFixed(2)} €</Text>
            </View>
          </View>
          
          <View style={[styles.detailsRow, { 
            paddingTop: 8, 
            borderTopWidth: 1, 
            borderTopColor: '#E2E8F0' 
          }]}>
            <Text style={[styles.detailLabel, { fontWeight: 700 }]}>Total TTC</Text>
            <View style={styles.totalTTCContainer}>
              <Text style={styles.totalTTCText}>
                {totalTTC.toFixed(2)} €
              </Text>
            </View>
          </View>
        </View>

        {/* Modalités de paiement avec montants stylisés */}
        <View style={{ marginTop: 25 }}>
          <Text style={{ 
            fontWeight: 700, 
            color: '#2D3748', 
            marginBottom: 12,
            paddingBottom: 6,
            borderBottomWidth: 1,
            borderBottomColor: '#E2E8F0'
          }}>
            MODALITÉS DE PAIEMENT
          </Text>
          
          {payments.map((payment, index) => (
            <View key={index} style={styles.paymentItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.paymentPercent}>
                  <Text style={{ color: 'white', fontSize: 8, fontWeight: 700 }}>
                    {payment.percent}%
                  </Text>
                </View>
                <Text style={{ fontSize: 10 }}>{payment.label}</Text>
              </View>
              <View style={styles.paymentAmountContainer}>
                <Text style={styles.paymentAmountText}>{payment.amount.toFixed(2)} €</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureLine}>
            <Text style={{ fontSize: 9, color: '#718096' }}>Fait à Paris, le {new Date().toLocaleDateString('fr-FR')}</Text>
            <Text style={{ marginTop: 15, fontWeight: 600 }}>Signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};