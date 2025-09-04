import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { Devis } from "@/types/devis";
import { entreprise } from "@/types/aximotravo";

interface NoticeComptablePDFDocumentProps {
  devis: Devis;
  clientName: string;
  noticeNumber: string;
  dateStr: string; // already formatted FR date
}

const styles = StyleSheet.create({
  page: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  logo: { width: 120, height: 40 },
  badge: {
    borderWidth: 1,
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
    padding: 8,
    minWidth: 150,
    alignItems: "center",
  },
  badgeTitle: { fontSize: 12, fontWeight: "bold", color: "#166534", marginBottom: 2 },
  badgeNumber: { fontSize: 12, fontWeight: "bold", color: "#166534" },
  badgeDate: { fontSize: 9, color: "#16A34A", marginTop: 4 },

  table: { width: "100%", borderWidth: 1, borderColor: "#D1D5DB" },
  headerRow: { flexDirection: "row", backgroundColor: "#D1FAE5", borderBottomWidth: 1, borderBottomColor: "#D1D5DB" },
  colLeft: { width: "50%", borderRightWidth: 1, borderRightColor: "#D1D5DB", padding: 8 },
  colMid: { width: "25%", borderRightWidth: 1, borderRightColor: "#D1D5DB", padding: 8, alignItems: "center" },
  colRight: { width: "25%", padding: 8, alignItems: "center" },
  th: { fontSize: 10, fontWeight: "bold" },

  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#D1D5DB" },
  rowBlue: { backgroundColor: "#EFF6FF" },
  rowYellow: { backgroundColor: "#FEF9C3" },
  labelBlue: { color: "#2563EB", fontWeight: "medium" },
  labelBold: { fontWeight: "bold" },

  info: { marginTop: 14, backgroundColor: "#F9FAFB", padding: 10, borderRadius: 4 },
  infoTitle: { fontSize: 10, fontWeight: "bold", color: "#374151", marginBottom: 6 },
  infoItem: { fontSize: 9, color: "#374151", marginBottom: 2 },

  footer: {
    position: "absolute",
    bottom: 16,
    left: 24,
    right: 24,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 6,
  },
  footerText: { fontSize: 8, color: "#6B7280" },
});

function formatPriceEuros(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })
    .format(n)
    .replace("€", "").trim() + " €";
}

export const NoticeComptablePDFDocument: React.FC<NoticeComptablePDFDocumentProps> = ({
  devis,
  clientName,
  noticeNumber,
  dateStr,
}) => {
  // Totaux devis
  let totalHT = 0;
  let totalTVA = 0;
  (devis.selectedItems || []).forEach((item: any) => {
    if (!item?.isOffered) {
      const ht = (item?.prix_ht || 0) * (item?.quantite || 0);
      const tvaRate = item?.tva ?? 20;
      totalHT += ht;
      totalTVA += ht * (tvaRate / 100);
    }
  });
  const totalTTC = totalHT + totalTVA;

  // Commissions
  const comCourtierHT = totalHT * 0.12;
  const comCourtierTTC = comCourtierHT * 1.2;
  const comAximoHT = totalHT * 0.03;
  const comAximoTTC = comAximoHT * 1.2;
  const totalComTTC = comCourtierTTC + comAximoTTC;
  const soldeClient = totalTTC - totalComTTC;

  // Use the last 4 chars of the notice number (e.g. NCYYMM-ABCD -> ABCD)
  const codeSuffix = (noticeNumber || '').slice(-4);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image style={styles.logo} src="/Logo-2025.png" />
          <View style={styles.badge}>
            <Text style={styles.badgeTitle}>Notice Comptable</Text>
            <Text style={styles.badgeNumber}>{noticeNumber}</Text>
            <Text style={styles.badgeDate}>{dateStr}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <View style={styles.colLeft}><Text style={styles.th}>Notice comptable AXIMOTRAVO</Text></View>
            <View style={styles.colMid}><Text style={styles.th}>Montant HT (en €)</Text></View>
            <View style={styles.colRight}><Text style={styles.th}>Montant TTC (en €)</Text></View>
          </View>

          {/* ACOMPTE CLIENT */}
          <View style={[styles.row, styles.rowBlue]}>
            <View style={styles.colLeft}>
              <Text style={styles.labelBlue}>ACOMPTE CLIENT</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>Chèque ou virement N° VIREMENTS DU {dateStr.replace(/\//g, ' ').toUpperCase()}</Text>
              <Text style={{ fontSize: 9 }}>Client : {clientName || 'HARDY'}</Text>
            </View>
            <View style={styles.colMid}><Text>{formatPriceEuros(totalHT)}</Text></View>
            <View style={styles.colRight}><Text style={styles.labelBold}>{formatPriceEuros(totalTTC)}</Text></View>
          </View>

          {/* FACTURE COMMISSION COURTIER */}
          <View style={styles.row}>
            <View style={styles.colLeft}>
              <Text style={styles.labelBlue}>FACTURE COMMISSION COURTIER SAS 3 ETOILES</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>N° Facture FA{new Date().getFullYear().toString().slice(-2)}{String(new Date().getMonth() + 1).padStart(2, '0')}-{devis?.id?.slice(-4)}</Text>
            </View>
            <View style={styles.colMid}><Text>{formatPriceEuros(comCourtierHT)}</Text></View>
            <View style={styles.colRight}><Text style={styles.labelBold}>{formatPriceEuros(comCourtierTTC)}</Text></View>
          </View>

          {/* FACTURE GESTION COMPTE SECURE ACOMPTE */}
          <View style={styles.row}>
            <View style={styles.colLeft}>
              <Text style={styles.labelBlue}>FACTURE GESTION COMPTE SECURE ACOMPTE</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>N° Facture FA{new Date().getFullYear().toString().slice(-2)}{String(new Date().getMonth() + 1).padStart(2, '0')}-{devis?.id?.slice(-4)}52</Text>
            </View>
            <View style={styles.colMid}><Text>{formatPriceEuros(comAximoHT)}</Text></View>
            <View style={styles.colRight}><Text style={styles.labelBold}>{formatPriceEuros(comAximoTTC)}</Text></View>
          </View>

          {/* SOLDE VIREMENT */}
          <View style={[styles.row, styles.rowYellow]}> 
            <View style={styles.colLeft}>
              <Text style={{ color: "#EA580C", fontWeight: "bold" }}>SOLDE VIREMENT {codeSuffix}</Text>
            </View>
            <View style={styles.colMid}><Text> </Text></View>
            <View style={styles.colRight}><Text style={{ color: "#EA580C", fontWeight: "bold" }}>{formatPriceEuros(soldeClient)}</Text></View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{entreprise.nom} • {entreprise.statut} • {entreprise.site} • {entreprise.email} • {entreprise.tel}</Text>
          <Text style={styles.footerText}>{entreprise.adresse} • {entreprise.codePostal} {entreprise.ville} • RCS {entreprise.rcs} • SIREN {entreprise.siren} • APE {entreprise.ape}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default NoticeComptablePDFDocument;
