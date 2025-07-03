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
    marginBottom: 6,
    fontSize: 11
  },
  prestationNumber: {
    fontWeight: 700,
    color: '#F26755',
    marginRight: 8,
    fontSize: 11
  },
  prestationDesc: {
    fontSize: 9,
    color: '#718096',
    marginBottom: 8,
    lineHeight: 1.4
  },
  // Badges informatifs - simplifiés
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 10
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1
  },
  badgeOffered: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC'
  },
  badgeOfferedText: {
    fontSize: 7,
    fontWeight: 700,
    color: '#166534'
  },
  badgeTva: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD'
  },
  badgeTvaText: {
    fontSize: 7,
    fontWeight: 600,
    color: '#1E40AF'
  },
  badgeCategory: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A'
  },
  badgeCategoryText: {
    fontSize: 7,
    fontWeight: 600,
    color: '#92400E'
  },
  // Section détails avec couleurs simplifiées
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
  // Styles pour les prix et unités - sans fond
  priceText: {
    fontSize: 9,
    fontWeight: 700,
    color: '#0369A1'
  },
  unitText: {
    fontSize: 8,
    fontWeight: 600,
    color: '#166534'
  },
  totalText: {
    fontSize: 10,
    fontWeight: 700,
    color: '#DC2626'
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
  // Styles pour les pièces sélectionnées
  pieceTag: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4
  },
  pieceTagText: {
    fontSize: 8,
    color: '#1E40AF',
    fontWeight: 500
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
  // Styles pour le détail des TVA - simplifié
  tvaDetailSection: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  tvaDetailTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#2D3748',
    marginBottom: 10
  },
  tvaDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 4
  },
  tvaDetailLabel: {
    fontSize: 10,
    color: '#4A5568',
    fontWeight: 500
  },
  tvaDetailAmount: {
    fontSize: 10,
    fontWeight: 700,
    color: '#2D3748'
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
  },
  // Header pour pages suivantes
  pageHeader: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#F26755'
  },
  pageHeaderTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#F26755'
  },
  // Style pour prix barré
  strikethrough: {
    textDecoration: 'line-through',
    color: '#9CA3AF'
  }
});

export const DevisPDFDocument = ({ devis }: { devis: Devis }) => {
  // Calcul des totaux avec gestion de la TVA variable et des prestations offertes
  let totalHT = 0;
  let totalTVA = 0;
  
  // Calcul détaillé des TVA par taux - CORRECTION ICI
  const tvaByRate: { [rate: number]: { baseHT: number, tvaAmount: number, count: number } } = {};

  devis.selectedItems.forEach(item => {
    // Récupérer le taux de TVA de l'item ou utiliser celui par défaut du devis
    const itemTvaRate = item.tva !== undefined ? item.tva : (typeof devis.tva === 'number' ? devis.tva : parseFloat(devis.tva as string) || 20);
    
    if (!item.isOffered) {
      const itemHT = item.prix_ht * item.quantite;
      const itemTVA = itemHT * (itemTvaRate / 100);

      totalHT += itemHT;
      totalTVA += itemTVA;

      // Grouper par taux de TVA - CORRECTION: utiliser itemTvaRate au lieu de taux fixe
      if (!tvaByRate[itemTvaRate]) {
        tvaByRate[itemTvaRate] = { baseHT: 0, tvaAmount: 0, count: 0 };
      }
      tvaByRate[itemTvaRate].baseHT += itemHT;
      tvaByRate[itemTvaRate].tvaAmount += itemTVA;
      tvaByRate[itemTvaRate].count += 1;
    } else {
      // Pour les prestations offertes, on les compte quand même dans les statistiques
      if (!tvaByRate[itemTvaRate]) {
        tvaByRate[itemTvaRate] = { baseHT: 0, tvaAmount: 0, count: 0 };
      }
      // On incrémente juste le compteur pour les prestations offertes
      tvaByRate[itemTvaRate].count += 1;
    }
  });

  const totalTTC = totalHT + totalTVA;

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
      {/* PAGE 1 : Header + Client + Intro */}
      <Page size="A4" style={styles.page}>
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
      </Page>

      {/* PAGE 2 : Tableau récapitulatif des lots UNIQUEMENT */}
      <Page size="A4" style={styles.page}>
        {/* Header de page */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderTitle}>RÉCAPITULATIF DES LOTS</Text>
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
                    {items.reduce((sum, item) => {
                      return sum + (item.isOffered ? 0 : item.quantite * item.prix_ht);
                    }, 0).toFixed(2)} €
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </Page>

      {/* PAGES 3 à N : Détails des prestations par lot avec numérotation */}
      {Object.entries(lotGroups).map(([lotName, items], lotIndex) => (
        <Page key={lotIndex} size="A4" style={styles.page}>
          {/* Header de page */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageHeaderTitle}>
              LOT {lotIndex + 1} - {lotName.toUpperCase()}
            </Text>
          </View>
          
          {/* Prestations du lot avec numérotation */}
          {items.map((item, itemIndex) => {
            const itemTvaRate = item.tva !== undefined ? item.tva : (typeof devis.tva === 'number' ? devis.tva : parseFloat(devis.tva as string) || 20);
            const itemHT = item.prix_ht * item.quantite;
            const itemTVA = itemHT * (itemTvaRate / 100);
            const itemTTC = itemHT + itemTVA;

            return (
              <View key={itemIndex} style={styles.prestationCard} wrap={false}>
                {/* Titre avec numérotation */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                  <Text style={styles.prestationNumber}>
                    {lotIndex + 1}.{itemIndex + 1}
                  </Text>
                  <Text style={[styles.prestationTitle, { flex: 1 }]}>
                    {item.optionLabel}
                  </Text>
                </View>

                {/* Badges informatifs - sans icônes */}
                <View style={styles.badgeContainer}>
                  {item.isOffered && (
                    <View style={[styles.badge, styles.badgeOffered]}>
                      <Text style={styles.badgeOfferedText}>OFFERT</Text>
                    </View>
                  )}
                  <View style={[styles.badge, styles.badgeTva]}>
                    <Text style={styles.badgeTvaText}>TVA {itemTvaRate}%</Text>
                  </View>
                  <View style={[styles.badge, styles.badgeCategory]}>
                    <Text style={styles.badgeCategoryText}>{item.subcategoryName}</Text>
                  </View>
                </View>
                
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
                
                {/* Détails chiffrés stylisés - sans fonds */}
                <View style={styles.detailsRow}>
                  <Text style={styles.detailLabel}>Quantité</Text>
                  <Text style={styles.quantityText}>
                    {item.quantite} {item.customUnit || item.unite}
                  </Text>
                </View>
                
                <View style={styles.detailsRow}>
                  <Text style={styles.detailLabel}>Prix unitaire HT</Text>
                  <Text style={styles.priceText}>
                    {item.prix_ht.toFixed(2)} €
                  </Text>
                </View>

                <View style={styles.detailsRow}>
                  <Text style={styles.detailLabel}>TVA appliquée</Text>
                  <Text style={styles.priceText}>
                    {itemTvaRate}% = {itemTVA.toFixed(2)} €
                  </Text>
                </View>
                
                <View style={[styles.detailsRow, { marginTop: 6 }]}>
                  <Text style={[styles.detailLabel, { fontWeight: 600 }]}>Total HT</Text>
                  <Text style={[styles.totalText, { 
                    color: item.isOffered ? '#166534' : '#DC2626'
                  }]}>
                    {item.isOffered ? 'OFFERT' : `${itemHT.toFixed(2)} €`}
                  </Text>
                </View>

                <View style={styles.detailsRow}>
                  <Text style={[styles.detailLabel, { fontWeight: 600 }]}>Total TTC</Text>
                  {item.isOffered ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.strikethrough, { fontSize: 10, marginRight: 5 }]}>
                        {itemTTC.toFixed(2)} €
                      </Text>
                      <Text style={{ color: '#166534', fontSize: 12, fontWeight: 700 }}>
                        OFFERT
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.totalText, { 
                      color: '#F26755',
                      fontSize: 12,
                      fontWeight: 700
                    }]}>
                      {itemTTC.toFixed(2)} €
                    </Text>
                  )}
                </View>
                
                {/* Pièces concernées (pour calcul automatique) */}
                {item.pieces && item.pieces.length > 0 && (
                  <View style={styles.piecesSection}>
                    <Text style={[styles.detailLabel, { 
                      marginBottom: 8, 
                      fontWeight: 600,
                      color: '#374151'
                    }]}>
                      Pièces concernées:
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {item.pieces.map((piece, pieceIndex) => (
                        <View key={pieceIndex} style={styles.pieceTag}>
                          <Text style={styles.pieceTagText}>{piece}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Pièces jointes (selectedPieces) */}
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
            );
          })}
        </Page>
      ))}

      {/* DERNIÈRE PAGE DÉDIÉE : Récapitulatif financier + Modalités de paiement + Signature */}
      <Page size="A4" style={styles.page}>
        {/* Header de la page financière */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderTitle}>RÉCAPITULATIF FINANCIER</Text>
        </View>

        {/* Section Totaux avec prix stylisés */}
        <View style={styles.totalsSection}>
          <Text style={{ fontWeight: 700, color: '#2D3748', marginBottom: 20, fontSize: 14 }}>
            DÉTAIL DES MONTANTS
          </Text>
          
          <View style={[styles.detailsRow, { marginBottom: 12 }]}>
            <Text style={[styles.detailLabel, { fontSize: 12 }]}>Total HT</Text>
            <View style={styles.totalHTContainer}>
              <Text style={styles.totalHTText}>{totalHT.toFixed(2)} €</Text>
            </View>
          </View>

          {/* Détail des TVA par taux - design simplifié et CORRIGÉ */}
          <View style={styles.tvaDetailSection}>
            <Text style={styles.tvaDetailTitle}>Détail des TVA par taux</Text>
            {Object.entries(tvaByRate)
              .filter(([rate, data]) => data.baseHT > 0) // Ne montrer que les taux avec montant HT > 0
              .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
              .map(([rate, data]) => (
                <View key={rate} style={styles.tvaDetailRow}>
                  <Text style={styles.tvaDetailLabel}>
                    TVA {rate}% sur {data.baseHT.toFixed(2)} € HT ({data.count} prestation{data.count > 1 ? 's' : ''})
                  </Text>
                  <Text style={styles.tvaDetailAmount}>
                    {data.tvaAmount.toFixed(2)} €
                  </Text>
                </View>
              ))}
            
            {/* Afficher aussi les prestations offertes avec TVA 0 */}
            {Object.entries(tvaByRate)
              .filter(([rate, data]) => data.baseHT === 0 && data.count > 0)
              .map(([rate, data]) => (
                <View key={`offered-${rate}`} style={styles.tvaDetailRow}>
                  <Text style={[styles.tvaDetailLabel, { color: '#166534' }]}>
                    TVA {rate}% - {data.count} prestation{data.count > 1 ? 's' : ''} offerte{data.count > 1 ? 's' : ''}
                  </Text>
                  <Text style={[styles.tvaDetailAmount, { color: '#166534' }]}>
                    0,00 €
                  </Text>
                </View>
              ))}
            
            <View style={[styles.tvaDetailRow, { 
              borderTopWidth: 1, 
              borderTopColor: '#E2E8F0', 
              paddingTop: 8, 
              marginTop: 8 
            }]}>
              <Text style={[styles.tvaDetailLabel, { fontWeight: 700 }]}>
                Total TVA
              </Text>
              <Text style={[styles.tvaDetailAmount, { fontWeight: 700, fontSize: 12 }]}>
                {totalTVA.toFixed(2)} €
              </Text>
            </View>
          </View>
          
          <View style={[styles.detailsRow, { 
            paddingTop: 15, 
            borderTopWidth: 2, 
            borderTopColor: '#F26755' 
          }]}>
            <Text style={[styles.detailLabel, { fontWeight: 700, fontSize: 14 }]}>Total TTC</Text>
            <View style={styles.totalTTCContainer}>
              <Text style={styles.totalTTCText}>
                {totalTTC.toFixed(2)} €
              </Text>
            </View>
          </View>
        </View>

        {/* Modalités de paiement avec montants stylisés */}
        <View style={{ marginTop: 40 }}>
          <Text style={{ 
            fontWeight: 700, 
            color: '#2D3748', 
            marginBottom: 20,
            paddingBottom: 10,
            borderBottomWidth: 2,
            borderBottomColor: '#F26755',
            fontSize: 14
          }}>
            MODALITÉS DE PAIEMENT
          </Text>
          
          {payments.map((payment, index) => (
            <View key={index} style={[styles.paymentItem, { paddingVertical: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.paymentPercent, { width: 30, height: 30, borderRadius: 15 }]}>
                  <Text style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>
                    {payment.percent}%
                  </Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: 500 }}>{payment.label}</Text>
              </View>
              <View style={styles.paymentAmountContainer}>
                <Text style={[styles.paymentAmountText, { fontSize: 12 }]}>
                  {payment.amount.toFixed(2)} €
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Signature */}
        <View style={[styles.signatureSection, { marginTop: 60 }]}>
          <View style={styles.signatureLine}>
            <Text style={{ fontSize: 10, color: '#718096' }}>
              Fait le {new Date().toLocaleDateString('fr-FR')}
            </Text>
            <Text style={{ marginTop: 20, fontWeight: 600, fontSize: 11 }}>
              Signature du client
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};