import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Devis } from "@/types/devis";
import { getUserById, User, ArtisanUser } from "@/lib/firebase/users";
import { Project } from "@/lib/firebase/projects";
import { FactureType } from "@/types/facture";

// Styles optimisés pour un meilleur affichage
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 20, // Réduit de 30 à 20
    paddingBottom: 120, // Augmenté pour laisser plus d'espace au footer
    fontFamily: "Helvetica",
    fontSize: 9, // Taille de base réduite
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25, // Réduit de 30 à 25
  },
  logo: {
    width: 100, // Réduit de 120 à 100
    height: 50,  // Réduit de 60 à 50
  },
  companyInfo: {
    fontSize: 9, // Réduit de 10 à 9
    lineHeight: 1.3, // Réduit de 1.4 à 1.3
    textAlign: "right",
    color: "#333333",
  },
  title: {
    fontSize: 16, // Réduit de 18 à 16
    fontWeight: "bold",
    color: "#F26755",
    marginBottom: 15, // Réduit de 20 à 15
    textAlign: "center",
  },
  factureNumber: {
    fontSize: 12, // Réduit de 14 à 12
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8, // Réduit de 10 à 8
    textAlign: "center",
  },
  section: {
    marginBottom: 15, // Réduit de 20 à 15
  },
  sectionTitle: {
    fontSize: 11, // Réduit de 12 à 11
    fontWeight: "bold",
    color: "#F26755",
    marginBottom: 6, // Réduit de 8 à 6
    borderBottomWidth: 1,
    borderBottomColor: "#F26755",
    borderBottomStyle: "solid",
    paddingBottom: 2,
  },
  clientInfo: {
    fontSize: 9, // Réduit de 10 à 9
    lineHeight: 1.3, // Réduit de 1.4 à 1.3
    color: "#333333",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    marginBottom: 15, // Réduit de 20 à 15
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
    minHeight: 25, // Hauteur minimale pour les lignes
  },
  tableHeader: {
    backgroundColor: "#F26755",
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  tableCol: {
    width: "20%",
    borderRightWidth: 1,
    borderRightColor: "#CCCCCC",
    borderRightStyle: "solid",
    padding: 6, // Réduit de 8 à 6
    justifyContent: "center",
  },
  tableColLarge: {
    width: "40%",
    borderRightWidth: 1,
    borderRightColor: "#CCCCCC",
    borderRightStyle: "solid",
    padding: 6, // Réduit de 8 à 6
    justifyContent: "center",
  },
  tableColLast: {
    width: "20%",
    padding: 6, // Réduit de 8 à 6
    justifyContent: "center",
  },
  tableCellText: {
    fontSize: 8, // Réduit de 9 à 8
    textAlign: "center",
  },
  tableCellTextLeft: {
    fontSize: 8, // Réduit de 9 à 8
    textAlign: "left",
  },
  totalsSection: {
    marginTop: 15, // Réduit de 20 à 15
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 180, // Réduit de 200 à 180
    marginBottom: 4, // Réduit de 5 à 4
    paddingHorizontal: 8, // Réduit de 10 à 8
  },
  totalLabel: {
    fontSize: 9, // Réduit de 10 à 9
    color: "#333333",
  },
  totalValue: {
    fontSize: 9, // Réduit de 10 à 9
    fontWeight: "bold",
    color: "#333333",
  },
  totalFinal: {
    fontSize: 11, // Réduit de 12 à 11
    fontWeight: "bold",
    color: "#F26755",
    borderTopWidth: 1,
    borderTopColor: "#F26755",
    borderTopStyle: "solid",
    paddingTop: 4, // Réduit de 5 à 4
  },
  paymentConditions: {
    fontSize: 8, // Réduit de 9 à 8
    color: "#333333",
    marginTop: 12, // Réduit de 15 à 12
    lineHeight: 1.3, // Réduit de 1.4 à 1.3
  },
  footer: {
    position: "absolute",
    bottom: 20, // Réduit de 30 à 20
    left: 20,   // Réduit de 30 à 20
    right: 20,  // Réduit de 30 à 20
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 8, // Réduit de 10 à 8
  },
  footerText: {
    fontSize: 7, // Réduit de 8 à 7
    color: "#666666",
    lineHeight: 1.2, // Réduit de 1.3 à 1.2
  },
  sectionBreak: {
    breakInside: "avoid",
  },
  // Nouveaux styles pour optimiser l'espace
  compactSection: {
    marginBottom: 12,
  },
  compactPadding: {
    padding: 8,
  },
  smallText: {
    fontSize: 7,
    lineHeight: 1.2,
  },
});

interface FactureCommissionPDFDocumentProps {
  devis: Devis;
  user: User;
  client: User | null;
  project: Project | null;
  factureType: FactureType;
  tauxCommission: number;
}

export const FactureCommissionPDFDocument: React.FC<FactureCommissionPDFDocumentProps> = ({
  devis,
  user,
  client,
  project,
  factureType,
  tauxCommission,
}) => {
  // Calcul des totaux du devis
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
      totalTTC: totalHTGeneral + totalTVAGeneral
    };
  };

  const devisTotals = calculateDevisTotal();
  // Commission calculée sur le montant HT du devis
  const montantCommissionHT = (devisTotals.totalHT * tauxCommission) / 100;
  const montantCommissionTTC = montantCommissionHT * 1.20; // TVA 20% sur commission

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatDate = (date: any) => {
    let dateObj: Date;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (date && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else {
      dateObj = new Date();
    }
    
    return dateObj.toLocaleDateString('fr-FR');
  };

  const generateFactureNumber = () => {
    let devisDate: Date;
    
    if (devis.createdAt instanceof Date) {
      devisDate = devis.createdAt;
    } else if (devis.createdAt && typeof (devis.createdAt as any).toDate === 'function') {
      devisDate = (devis.createdAt as any).toDate();
    } else {
      devisDate = new Date();
    }
    
    const year = devisDate.getFullYear();
    const month = String(devisDate.getMonth() + 1).padStart(2, '0');
    
    const prefix = factureType === 'commission_courtier' ? 'FC' : 'FA';
    
    const devisIdHash = devis.id.slice(-4);
    const typeCode = factureType === 'commission_courtier' ? '01' : '02';
    
    return `${prefix}${year.toString().slice(-2)}${month}-${devisIdHash}${typeCode}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* En-tête avec logo et numéro de facture - optimisé */}
        <View style={styles.header}>
          {/* Logo */}
          <View style={{ flex: 1 }}>
            <Image
              style={styles.logo}
              src="/Logo-2025.png"
            />
          </View>
          
          {/* Numéro de facture et date - encadré compact */}
          <View style={{
            borderWidth: 1,
            borderColor: '#F26755',
            backgroundColor: '#FFF7F5',
            padding: 10, // Réduit de 15 à 10
            minWidth: 130, // Réduit de 150 à 130
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: 12, // Réduit de 14 à 12
              fontWeight: 'bold',
              color: '#F26755',
              marginBottom: 4 // Réduit de 5 à 4
            }}>Facture</Text>
            <Text style={{
              fontSize: 12, // Réduit de 14 à 12
              fontWeight: 'bold',
              color: '#F26755',
              marginBottom: 6 // Réduit de 10 à 6
            }}>{generateFactureNumber()}</Text>
            <Text style={{
              fontSize: 8, // Réduit de 10 à 8
              color: '#B45309'
            }}>{formatDate(new Date())}</Text>
          </View>
        </View>
        
        {/* Référence au devis */}
        <Text style={{
          fontSize: 10, // Réduit de 11 à 10
          color: '#666666',
          marginBottom: 15, // Réduit de 20 à 15
          textAlign: 'center'
        }}>
          Référence devis N° {devis.numero} du {formatDate(devis.createdAt)}
        </Text>

        {/* Sections Émetteur et Adresse de facturation - compactes */}
        <View style={{
          ...styles.sectionBreak,
          flexDirection: 'row',
          gap: 15, // Réduit de 20 à 15
          marginBottom: 15 // Réduit de 20 à 15
        }}>
          {/* Émetteur */}
          <View style={{ flex: 1 }}>
            <View style={{
              borderWidth: 1,
              borderColor: '#F26755'
            }}>
              <View style={{
                backgroundColor: '#FED7CC',
                paddingHorizontal: 10, // Réduit de 12 à 10
                paddingVertical: 3, // Réduit de 4 à 3
                borderBottomWidth: 1,
                borderBottomColor: '#F26755'
              }}>
                <Text style={{
                  fontSize: 9, // Réduit de 10 à 9
                  fontWeight: 'bold',
                  color: '#F26755'
                }}>ÉMETTEUR</Text>
              </View>
              <View style={{ padding: 8 }}> {/* Réduit de 12 à 8 */}
                <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 1 }}>AXIMOTRAVO</Text>
                <Text style={{ fontSize: 8, marginBottom: 0.5 }}>123 Rue de la République</Text>
                <Text style={{ fontSize: 8, marginBottom: 0.5 }}>75001 Paris</Text>
                <Text style={{ fontSize: 8, marginBottom: 0.5 }}>SIRET: 123 456 789 00012</Text>
                <Text style={{ fontSize: 8, marginBottom: 0.5 }}>TVA: FR12345678901</Text>
                <Text style={{ fontSize: 8, marginBottom: 0.5 }}>Tél: 01 23 45 67 89</Text>
                <Text style={{ fontSize: 8 }}>Email: contact@aximotravo.com</Text>
              </View>
            </View>
          </View>

          {/* Adresse de facturation */}
          <View style={{ flex: 1 }}>
            <View style={{
              borderWidth: 1,
              borderColor: '#F26755'
            }}>
              <View style={{
                backgroundColor: '#FED7CC',
                paddingHorizontal: 10, // Réduit de 12 à 10
                paddingVertical: 3, // Réduit de 4 à 3
                borderBottomWidth: 1,
                borderBottomColor: '#F26755'
              }}>
                <Text style={{
                  fontSize: 9, // Réduit de 10 à 9
                  fontWeight: 'bold',
                  color: '#F26755'
                }}>ADRESSE DE FACTURATION</Text>
              </View>
              <View style={{ padding: 8 }}> {/* Réduit de 12 à 8 */}
                  <>
                    <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 1 }}>
                      {(user as ArtisanUser).companyName || `${user.firstName} ${user.lastName}`}
                    </Text>
                    {(user as ArtisanUser).companyAddress && (
                      <Text style={{ fontSize: 8, marginBottom: 0.5 }}>{(user as ArtisanUser).companyAddress}</Text>
                    )}
                    {(user as ArtisanUser).companyPostalCode && (user as ArtisanUser).companyCity && (
                      <Text style={{ fontSize: 8, marginBottom: 0.5 }}>
                        {(user as ArtisanUser).companyPostalCode} {(user as ArtisanUser).companyCity}
                      </Text>
                    )}
                    {(user as ArtisanUser).siret && (
                      <Text style={{ fontSize: 8, marginBottom: 0.5 }}>SIRET: {(user as ArtisanUser).siret}</Text>
                    )}
                    {(user as ArtisanUser).companyPhone && (
                      <Text style={{ fontSize: 8, marginBottom: 0.5 }}>Tél: {(user as ArtisanUser).companyPhone}</Text>
                    )}
                    <Text style={{ fontSize: 8 }}>
                      Email: {(user as ArtisanUser).companyEmail || user.email}
                    </Text>
                  </>
              </View>
            </View>
          </View>
        </View>

        {/* Section Commission - corrigée */}
        <View style={{
          ...styles.sectionBreak,
          marginBottom: 15,
        }}>
          {/* En-tête de la section */}
          <View style={{
            backgroundColor: '#F26755',
            paddingHorizontal: 10,
            paddingVertical: 6,
            marginBottom: 0,
          }}>
            <Text style={{
              fontSize: 11,
              fontWeight: 'bold',
              color: '#FFFFFF'
            }}>
              {factureType === 'commission_courtier' ? 'COMMISSION COURTIER' : 'COMMISSION GESTION AFFAIRE'}
            </Text>
          </View>
          
          {/* Tableau détaillé sans borders imbriquées */}
          <View style={{
            width: "100%",
            borderStyle: "solid",
            borderWidth: 1,
            borderColor: "#F26755",
            borderTopWidth: 0, // Pas de border top car déjà dans l'en-tête
          }}>
            {/* En-tête du tableau */}
            <View style={{
              flexDirection: "row",
              backgroundColor: '#FED7CC',
              borderBottomWidth: 1,
              borderBottomColor: '#F26755',
            }}>
              <View style={{
                width: "40%",
                padding: 6,
                borderRightWidth: 1,
                borderRightColor: '#F26755',
              }}>
                <Text style={{
                  fontSize: 8,
                  fontWeight: 'bold',
                  color: '#F26755',
                  textAlign: 'center'
                }}>Désignation</Text>
              </View>
              <View style={{
                width: "15%",
                padding: 6,
                borderRightWidth: 1,
                borderRightColor: '#F26755',
              }}>
                <Text style={{
                  fontSize: 8,
                  fontWeight: 'bold',
                  color: '#F26755',
                  textAlign: 'center'
                }}>Prix unitaire € HT</Text>
              </View>
              <View style={{
                width: "10%",
                padding: 6,
                borderRightWidth: 1,
                borderRightColor: '#F26755',
              }}>
                <Text style={{
                  fontSize: 8,
                  fontWeight: 'bold',
                  color: '#F26755',
                  textAlign: 'center'
                }}>Qté</Text>
              </View>
              <View style={{
                width: "20%",
                padding: 6,
                borderRightWidth: 1,
                borderRightColor: '#F26755',
              }}>
                <Text style={{
                  fontSize: 8,
                  fontWeight: 'bold',
                  color: '#F26755',
                  textAlign: 'center'
                }}>Prix total € HT</Text>
              </View>
              <View style={{
                width: "15%",
                padding: 6,
              }}>
                <Text style={{
                  fontSize: 8,
                  fontWeight: 'bold',
                  color: '#F26755',
                  textAlign: 'center'
                }}>TVA</Text>
              </View>
            </View>

            {/* Ligne de commission */}
            <View style={{
              flexDirection: "row",
              minHeight: 80,
            }}>
              <View style={{
                width: "40%",
                padding: 6,
                borderRightWidth: 1,
                borderRightColor: '#F26755',
                justifyContent: 'flex-start',
              }}>
                <Text style={{
                  fontSize: 8,
                  fontWeight: 'bold',
                  marginBottom: 3,
                  textAlign: 'left'
                }}>
                  {factureType === 'commission_courtier' ? 'COMMISSION COURTIER' : 'COMMISSION GESTION AFFAIRE'}
                </Text>
                <Text style={{
                  fontSize: 7,
                  marginBottom: 2,
                  textAlign: 'left'
                }}>
                  Client: {client?.firstName?.toUpperCase()} {client?.lastName?.toUpperCase()}
                </Text>
                <Text style={{
                  fontSize: 7,
                  marginBottom: 2,
                  textAlign: 'left'
                }}>
                  Commissionnement de {tauxCommission}% sur le montant HT:
                </Text>
                <Text style={{
                  fontSize: 7,
                  marginBottom: 2,
                  textAlign: 'left'
                }}>
                  {formatPrice(devisTotals.totalHT)} suivant
                </Text>
                <Text style={{
                  fontSize: 7,
                  marginBottom: 2,
                  textAlign: 'left'
                }}>
                  le devis n° {devis.numero} daté du {formatDate(devis.createdAt)}
                </Text>
                <Text style={{
                  fontSize: 7,
                  textAlign: 'left'
                }}>
                  et accepté le {formatDate(devis.updatedAt)}
                </Text>
              </View>
              <View style={{
                width: "15%",
                padding: 6,
                borderRightWidth: 1,
                borderRightColor: '#F26755',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 8,
                  textAlign: 'center'
                }}>
                  {montantCommissionHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={{
                width: "10%",
                padding: 6,
                borderRightWidth: 1,
                borderRightColor: '#F26755',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 8,
                  textAlign: 'center'
                }}>1</Text>
              </View>
              <View style={{
                width: "20%",
                padding: 6,
                borderRightWidth: 1,
                borderRightColor: '#F26755',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 8,
                  textAlign: 'center'
                }}>
                  {montantCommissionHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={{
                width: "15%",
                padding: 6,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 8,
                  textAlign: 'center'
                }}>20% A</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Conditions de paiement - structure corrigée */}
        <View style={{
          ...styles.sectionBreak,
          marginBottom: 15,
        }}>
          {/* En-tête */}
          <View style={{
            backgroundColor: '#FED7CC',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: '#F26755',
            borderBottomWidth: 0,
          }}>
            <Text style={{
              fontSize: 9,
              fontWeight: 'bold',
              color: '#F26755'
            }}>Conditions de paiement</Text>
          </View>
          
          {/* Contenu */}
          <View style={{
            backgroundColor: '#FFF7F5',
            padding: 10,
            borderWidth: 1,
            borderColor: '#F26755',
            borderTopWidth: 0,
          }}>
            <View style={{
              marginBottom: 8,
            }}>
              <Text style={{
                fontSize: 8,
                fontWeight: 'bold',
                color: '#F26755',
                marginBottom: 4
              }}>Modalités de règlement :</Text>
              <Text style={{
                fontSize: 8,
                lineHeight: 1.4,
                marginBottom: 3,
                color: '#333333'
              }}>
                Selon articles L 441-10 et suivants du code du commerce, taux appliqué : <Text style={{ fontWeight: 'bold' }}>15,21% par an</Text>.
              </Text>
              <Text style={{
                fontSize: 8,
                lineHeight: 1.4,
                color: '#333333'
              }}>
                Indemnité forfaitaire de <Text style={{ fontWeight: 'bold', color: '#F26755' }}>40 €</Text> dès le premier jour de retard.
              </Text>
            </View>
            
            <View style={{
              borderTopWidth: 1,
              borderTopColor: '#F26755',
              paddingTop: 6,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 3,
              }}>
                <Text style={{
                  fontSize: 8,
                  fontWeight: 'bold',
                  color: '#F26755'
                }}>Mode de règlement :</Text>
                <Text style={{ 
                  fontSize: 8,
                  color: '#333333'
                }}>Virement bancaire ou chèque</Text>
              </View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
                <Text style={{
                  fontSize: 8,
                  fontWeight: 'bold',
                  color: '#F26755'
                }}>Délai de paiement :</Text>
                <Text style={{ 
                  fontSize: 8,
                  color: '#333333'
                }}>30 jours à réception de facture</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Totaux - optimisés */}
        <View style={{
          ...styles.sectionBreak,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginBottom: 20 // Réduit de 30 à 20
        }}>
          <View style={{
            minWidth: 220, // Réduit de 250 à 220
            borderWidth: 1,
            borderColor: '#F26755'
          }}>
            <View style={{
              backgroundColor: '#FED7CC',
              paddingHorizontal: 10, // Réduit de 12 à 10
              paddingVertical: 4, // Réduit de 6 à 4
              borderBottomWidth: 1,
              borderBottomColor: '#F26755'
            }}>
              <Text style={{
                fontSize: 10, // Réduit de 11 à 10
                fontWeight: 'bold',
                color: '#F26755'
              }}>Montant total lignes HT</Text>
              <Text style={{
                fontSize: 12, // Réduit de 14 à 12
                fontWeight: 'bold',
                color: '#F26755',
                textAlign: 'right'
              }}>{formatPrice(montantCommissionHT)}</Text>
            </View>
            <View style={{ padding: 8 }}> {/* Réduit de 12 à 8 */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 3 // Réduit de 4 à 3
              }}>
                <Text style={{ fontSize: 8 }}>Frais de port</Text>
                <Text style={{ fontSize: 8 }}>-</Text>
              </View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 6 // Réduit de 8 à 6
              }}>
                <Text style={{ fontSize: 8 }}>TVA collectée sur les débits</Text>
                <Text style={{ fontSize: 8 }}>-</Text>
              </View>
              
              {/* Détail TVA */}
              <View style={{
                backgroundColor: '#FFF7F5',
                padding: 6, // Réduit de 8 à 6
                borderRadius: 4,
                marginBottom: 6, // Réduit de 8 à 6
                borderTopWidth: 1,
                borderTopColor: '#F26755'
              }}>
                <Text style={{
                  fontSize: 8, // Réduit de 9 à 8
                  fontWeight: 'bold',
                  color: '#F26755',
                  marginBottom: 3 // Réduit de 4 à 3
                }}>Détail TVA</Text>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 1 // Réduit de 2 à 1
                }}>
                  <Text style={{ fontSize: 7 }}>Code: A (20%)</Text>
                  <Text style={{ fontSize: 7 }}>TVA: {formatPrice(montantCommissionHT * 0.20)}</Text>
                </View>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 1 // Réduit de 2 à 1
                }}>
                  <Text style={{ fontSize: 7 }}>HT: {formatPrice(montantCommissionHT)}</Text>
                  <Text style={{ fontSize: 7 }}>TTC: {formatPrice(montantCommissionTTC)}</Text>
                </View>
              </View>
              
              <View style={{
                borderTopWidth: 1,
                borderTopColor: '#F26755',
                paddingTop: 6, // Réduit de 8 à 6
                marginBottom: 6 // Réduit de 8 à 6
              }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}>
                  <Text style={{
                    fontSize: 10, // Réduit de 11 à 10
                    fontWeight: 'bold'
                  }}>Montant total TTC</Text>
                  <Text style={{
                    fontSize: 10, // Réduit de 11 à 10
                    fontWeight: 'bold',
                    color: '#F26755'
                  }}>{formatPrice(montantCommissionTTC)}</Text>
                </View>
              </View>
              
              <View>
                <Text style={{ fontSize: 8, marginBottom: 1 }}>Règlement: à réception de facture</Text>
                <Text style={{
                  fontSize: 8, // Réduit de 9 à 8
                  fontWeight: 'bold',
                  color: '#F26755'
                }}>Facture à régler</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer fixe en bas de page - optimisé */}
        <View style={styles.footer} fixed>
          <View style={{ alignItems: 'center' }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6, // Réduit de 8 à 6
              marginBottom: 1 // Réduit de 2 à 1
            }}>
              <Text style={styles.footerText}>AXIMOTRAVO</Text>
              <Text style={styles.footerText}>•</Text>
              <Text style={styles.footerText}>SAS au capital de 1000€</Text>
            </View>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6, // Réduit de 8 à 6
              marginBottom: 1 // Réduit de 2 à 1
            }}>
              <Text style={styles.footerText}>www.aximotravo.com</Text>
              <Text style={styles.footerText}>•</Text>
              <Text style={styles.footerText}>contact@aximotravo.com</Text>
            </View>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6, // Réduit de 8 à 6
              marginBottom: 1 // Réduit de 2 à 1
            }}>
              <Text style={styles.footerText}>123 Rue de la République</Text>
              <Text style={styles.footerText}>•</Text>
              <Text style={styles.footerText}>75001 Paris France</Text>
              <Text style={styles.footerText}>•</Text>
              <Text style={styles.footerText}>tél 01 23 45 67 89</Text>
            </View>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6, // Réduit de 8 à 6
              paddingTop: 3, // Réduit de 4 à 3
              borderTopWidth: 1,
              borderTopColor: '#E5E5E5'
            }}>
              <Text style={styles.footerText}>RCS Paris B 123 456 789</Text>
              <Text style={styles.footerText}>•</Text>
              <Text style={styles.footerText}>SIREN 123456789</Text>
              <Text style={styles.footerText}>•</Text>
              <Text style={styles.footerText}>APE 7022Z</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};