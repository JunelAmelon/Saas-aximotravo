import React from 'react';
import { Devis } from '@/types/devis';

interface PDFPreviewProps {
  devis: Devis;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ devis }) => {
  // Calcul des totaux avec gestion de la TVA variable et des prestations offertes
  let totalHT = 0;
  let totalTVA = 0;
  
  // Calcul détaillé des TVA par taux
  const tvaByRate: { [rate: number]: { baseHT: number, tvaAmount: number, count: number } } = {};

  devis.selectedItems.forEach(item => {
    // Récupérer le taux de TVA de l'item ou utiliser celui par défaut du devis
    const itemTvaRate = item.tva !== undefined ? item.tva : (typeof devis.tva === 'number' ? devis.tva : parseFloat(devis.tva as string) || 20);
    
    if (!item.isOffered) {
      const itemHT = item.prix_ht * item.quantite;
      const itemTVA = itemHT * (itemTvaRate / 100);

      totalHT += itemHT;
      totalTVA += itemTVA;

      // Grouper par taux de TVA
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
    <div className="w-full max-w-4xl mx-auto bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* PAGE 1 : Header + Client + Intro */}
      <div className="min-h-screen p-10 text-sm text-gray-800">
        {/* Header élégant */}
        <div className="mb-6 relative">
          <h1 className="text-6xl font-bold text-[#F26755] mb-1">DEVIS N°{devis.numero}</h1>
          <p className="text-3xl text-gray-500">{devis.titre} • Valable 30 jours</p>
        </div>

        {/* Carte client premium */}
        <div className="bg-[#F26755] text-white p-5 rounded-lg mb-6 shadow-lg">
          <div className="font-bold mb-2 text-3xl">CLIENT</div>
          <div className="text-2xl leading-relaxed">
            <div>Société Client</div>
            <div>12 Rue des Entrepreneurs</div>
            <div>75000 Paris</div>
            <div className="mt-2">contact@client.com</div>
            <div>Tél: 01 23 45 67 89</div>
          </div>
        </div>

        {/* Message d'intro avec bordure stylée */}
        <div className="mb-6 p-5 border-l-4 border-[#F26755] bg-gray-50 rounded-r-lg">
          <div className="text-2xl leading-relaxed text-gray-700">
            Madame, Monsieur,
            <br /><br />
            Nous avons le plaisir de vous adresser notre devis détaillant l'ensemble des prestations proposées, incluant les fournitures ainsi que la main d'œuvre.
            <br /><br />
            Soucieuse de répondre au mieux à vos attentes, notre équipe reste à votre entière disposition pour toute demande d'éclaircissement ou d'ajustement. Nous mettons tout en œuvre pour que notre collaboration vous apporte pleine satisfaction.
            <br /><br />
            Dans l'attente de votre retour, nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.
          </div>
        </div>
      </div>

      {/* PAGE 2 : Tableau récapitulatif des lots */}
      <div className="min-h-screen p-10 text-sm text-gray-800">
        {/* Header de page */}
        <div className="mb-5 pb-2 border-b-2 border-[#F26755]">
          <h2 className="text-4xl font-bold text-[#F26755]">RÉCAPITULATIF DES LOTS</h2>
        </div>

        {/* Tableau récapitulatif des lots */}
        <div className="w-full mb-8 rounded-lg overflow-hidden">
          <div className="flex bg-gray-800 text-white py-2 px-4">
            <div className="flex-[3] font-semibold">Lot</div>
            <div className="flex-1 text-right font-semibold">Montant HT</div>
          </div>
          
          {Object.entries(lotGroups).map(([lotName, items], index) => (
            <div key={index} className={`flex py-3 px-4 border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <div className="flex-[3]">Lot {index + 1} - {lotName}</div>
              <div className="flex-1 text-right">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold">
                  {items.reduce((sum, item) => {
                    return sum + (item.isOffered ? 0 : item.quantite * item.prix_ht);
                  }, 0).toFixed(2)} €
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PAGES 3 à N : Détails des prestations par lot */}
      {Object.entries(lotGroups).map(([lotName, items], lotIndex) => (
        <div key={lotIndex} className="min-h-screen p-10 text-sm text-gray-800">
          {/* Header de page */}
          <div className="mb-5 pb-2 border-b-2 border-[#F26755]">
            <h2 className="text-4xl font-bold text-[#F26755]">
              LOT {lotIndex + 1} - {lotName.toUpperCase()}
            </h2>
          </div>
          
          {/* Prestations du lot avec numérotation */}
          {items.map((item, itemIndex) => {
            const itemTvaRate = item.tva !== undefined ? item.tva : (typeof devis.tva === 'number' ? devis.tva : parseFloat(devis.tva as string) || 20);
            const itemHT = item.prix_ht * item.quantite;
            const itemTVA = itemHT * (itemTvaRate / 100);
            const itemTTC = itemHT + itemTVA;

            return (
              <div key={itemIndex} className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                {/* Titre avec numérotation */}
                <div className="flex items-start mb-2">
                  <span className="font-bold text-[#F26755] mr-2 text-2xl">
                    {lotIndex + 1}.{itemIndex + 1}
                  </span>
                  <h4 className="flex-1 font-semibold text-gray-800 text-2xl">
                    {item.optionLabel}
                  </h4>
                </div>

                {/* Badges informatifs */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.isOffered && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                      OFFERT
                    </span>
                  )}
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                    TVA {itemTvaRate}%
                  </span>
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">
                    {item.subcategoryName}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-2 text-xl leading-relaxed">{item.description}</p>
                
                {/* Images */}
                {item.customImage && (
                  <div className="mb-2">
                    <img 
                      src={item.customImage} 
                      alt="Illustration"
                      className="w-20 h-15 object-cover rounded border border-gray-200"
                    />
                  </div>
                )}
                
                {/* Détails chiffrés */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xl">Quantité</span>
                    <span className="font-semibold text-yellow-700 text-xl">
                      {item.quantite} {item.customUnit || item.unite}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xl">Prix unitaire HT</span>
                    <span className="font-bold text-blue-700 text-xl">
                      {item.prix_ht.toFixed(2)} €
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xl">TVA appliquée</span>
                    <span className="font-bold text-yellow-700 text-xl">
                      {itemTvaRate}% = {itemTVA.toFixed(2)} €
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold text-gray-700 text-xl">Total HT</span>
                    <span className={`font-bold text-xl ${item.isOffered ? 'text-green-600' : 'text-red-600'}`}>
                      {item.isOffered ? 'OFFERT' : `${itemHT.toFixed(2)} €`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 text-xl">Total TTC</span>
                    {item.isOffered ? (
                      <div className="flex items-center gap-2">
                        <span className="line-through text-gray-400 text-xl">
                          {itemTTC.toFixed(2)} €
                        </span>
                        <span className="text-green-600 text-3xl font-bold">
                          OFFERT
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#F26755] text-3xl font-bold">
                        {itemTTC.toFixed(2)} €
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Pièces concernées (pour calcul automatique) */}
                {item.pieces && item.pieces.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="font-semibold text-gray-700 mb-2 text-xl">
                      Pièces concernées:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.pieces.map((piece, pieceIndex) => (
                        <span key={pieceIndex} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-lg">
                          {piece}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pièces jointes (selectedPieces) */}
                {item.selectedPieces && item.selectedPieces.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-gray-600 mb-2 text-xl">Pièces incluses:</div>
                    {item.selectedPieces.map((piece, pieceIndex) => (
                      <div key={pieceIndex} className="flex items-center mb-1">
                        <div className="w-1 h-1 bg-[#F26755] rounded-full mr-2"></div>
                        <span className="font-semibold text-lg">{piece.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* DERNIÈRE PAGE : Récapitulatif financier */}
      <div className="min-h-screen p-10 text-sm text-gray-800">
        {/* Header de la page financière */}
        <div className="mb-5 pb-2 border-b-2 border-[#F26755]">
          <h2 className="text-4xl font-bold text-[#F26755]">RÉCAPITULATIF FINANCIER</h2>
        </div>

        {/* Section Totaux */}
        <div className="mt-6 p-5 bg-gray-50 rounded-lg border-l-4 border-[#F26755]">
          <h3 className="font-bold text-gray-800 mb-5 text-3xl">
            DÉTAIL DES MONTANTS
          </h3>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600 text-3xl">Total HT</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded font-bold text-2xl">
              {totalHT.toFixed(2)} €
            </span>
          </div>

          {/* Détail des TVA par taux */}
          <div className="mt-5 mb-5 p-4 border border-gray-200 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2 text-3xl">Détail des TVA par taux</h4>
            {Object.entries(tvaByRate)
              .filter(([rate, data]) => data.baseHT > 0)
              .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
              .map(([rate, data]) => (
                <div key={rate} className="flex justify-between items-center mb-2 py-1">
                  <span className="text-gray-600 text-xl">
                    TVA {rate}% sur {data.baseHT.toFixed(2)} € HT ({data.count} prestation{data.count > 1 ? 's' : ''})
                  </span>
                  <span className="font-bold text-gray-800 text-xl">
                    {data.tvaAmount.toFixed(2)} €
                  </span>
                </div>
              ))}
            
            {/* Prestations offertes */}
            {Object.entries(tvaByRate)
              .filter(([rate, data]) => data.baseHT === 0 && data.count > 0)
              .map(([rate, data]) => (
                <div key={`offered-${rate}`} className="flex justify-between items-center mb-2 py-1">
                  <span className="text-green-600 text-xl">
                    TVA {rate}% - {data.count} prestation{data.count > 1 ? 's' : ''} offerte{data.count > 1 ? 's' : ''}
                  </span>
                  <span className="font-bold text-green-600 text-xl">
                    0,00 €
                  </span>
                </div>
              ))}
            
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700 text-xl">
                  Total TVA
                </span>
                <span className="font-bold text-gray-800 text-3xl">
                  {totalTVA.toFixed(2)} €
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t-2 border-[#F26755]">
            <span className="font-bold text-gray-700 text-3xl">Total TTC</span>
            <span className="bg-red-100 text-[#F26755] px-4 py-2 rounded-lg font-bold text-3xl border-2 border-[#F26755]">
              {totalTTC.toFixed(2)} €
            </span>
          </div>
        </div>

        {/* Modalités de paiement */}
        <div className="mt-10">
          <h3 className="font-bold text-gray-800 mb-5 pb-2 border-b-2 border-[#F26755] text-3xl">
            MODALITÉS DE PAIEMENT
          </h3>
          
          {payments.map((payment, index) => (
            <div key={index} className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 py-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#F26755] text-white rounded-full flex items-center justify-center mr-2 text-xl font-bold">
                  {payment.percent}%
                </div>
                <span className="text-3xl font-medium">{payment.label}</span>
              </div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded font-bold text-3xl">
                {payment.amount.toFixed(2)} €
              </span>
            </div>
          ))}
        </div>

        {/* Signature */}
        <div className="mt-15 flex justify-end">
          <div className="w-50 pt-2 border-t border-gray-200 text-center">
            <div className="text-gray-600 text-xl">
              Fait à Paris, le {new Date().toLocaleDateString('fr-FR')}
            </div>
            <div className="mt-5 font-semibold text-2xl">
              Signature du client
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};