import React, { useState } from 'react';
import { HelpCircle, X, Calculator, Home, Zap, Wrench, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface TVAHelperProps {
  onSelectTVA?: (tva: number) => void;
}

export const TVAHelper: React.FC<TVAHelperProps> = ({ onSelectTVA }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTVA, setSelectedTVA] = useState<number | null>(null);

  const steps = [
    {
      title: "Type de projet",
      question: "Quel type de projet réalisez-vous ?",
      options: [
        {
          id: "new",
          label: "Construction neuve",
          description: "Nouvelle maison, extension avec création de surface",
          icon: Home,
          tva: 20,
          color: "bg-red-50 border-red-200 text-red-700"
        },
        {
          id: "renovation",
          label: "Rénovation classique",
          description: "Amélioration, entretien, réparation (logement +2 ans)",
          icon: Wrench,
          tva: 10,
          color: "bg-blue-50 border-blue-200 text-blue-700"
        },
        {
          id: "energy",
          label: "Rénovation énergétique",
          description: "Isolation, chauffage écologique, performance énergétique",
          icon: Zap,
          tva: 5.5,
          color: "bg-green-50 border-green-200 text-green-700"
        }
      ]
    }
  ];

  const tvaDetails = {
    20: {
      title: "TVA 20% - Taux normal",
      cases: [
        "Constructions neuves",
        "Extensions créant de la surface habitable",
        "Travaux ne remplissant pas les critères des taux réduits"
      ],
      examples: [
        "Construction d'une maison neuve",
        "Ajout d'un étage",
        "Création d'une véranda"
      ],
      color: "red"
    },
    10: {
      title: "TVA 10% - Taux intermédiaire",
      cases: [
        "Logements de plus de 2 ans",
        "Travaux d'amélioration, transformation, entretien",
        "Sans création de volume ou nouvelles ouvertures"
      ],
      examples: [
        "Rénovation de cuisine",
        "Remplacement de sols",
        "Réfection de peinture",
        "Installation salle de bain"
      ],
      color: "blue"
    },
    5.5: {
      title: "TVA 5,5% - Taux réduit",
      cases: [
        "Travaux d'amélioration énergétique",
        "Matériaux et équipements éligibles",
        "Travaux induits par les travaux énergétiques"
      ],
      examples: [
        "Isolation thermique",
        "Pompe à chaleur",
        "Fenêtres double vitrage",
        "Chauffe-eau solaire"
      ],
      color: "green"
    }
  };

  const handleOptionSelect = (option: any) => {
    setSelectedTVA(option.tva);
    setCurrentStep(1);
  };

  const handleConfirm = () => {
    if (selectedTVA && onSelectTVA) {
      onSelectTVA(selectedTVA);
    }
    setIsOpen(false);
    setCurrentStep(0);
    setSelectedTVA(null);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      red: "bg-red-50 border-red-200 text-red-700",
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      green: "bg-green-50 border-green-200 text-green-700"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <>
      {/* Bouton d'aide TVA avec les couleurs de la marque */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#f26755] to-[#e55a4a] hover:from-[#e55a4a] hover:to-[#d54d3f] text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 group"
      >
        <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
          <Calculator className="h-4 w-4" />
        </div>
        <span>Aide TVA</span>
        <HelpCircle className="h-4 w-4 opacity-80" />
      </button>

      {/* Modal d'aide */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header avec les couleurs de la marque */}
            <div className="bg-gradient-to-r from-[#f26755] to-[#e55a4a] px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Calculator className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Assistant TVA BTP</h3>
                    <p className="text-white/90 text-sm">Trouvez le bon taux en 30 secondes</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      {steps[0].question}
                    </h4>
                    <p className="text-gray-600">Sélectionnez le type de projet qui correspond à votre chantier</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {steps[0].options.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleOptionSelect(option)}
                          className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${option.color} hover:border-opacity-60`}
                        >
                          <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-white/50 rounded-full flex items-center justify-center">
                              <IconComponent className="h-8 w-8" />
                            </div>
                            <div>
                              <h5 className="font-bold text-lg mb-2">{option.label}</h5>
                              <p className="text-sm opacity-80">{option.description}</p>
                            </div>
                            <div className="bg-white/70 rounded-full px-4 py-2 font-bold text-lg">
                              TVA {option.tva}%
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Guide rapide */}
                  <div className="mt-8 bg-gray-50 rounded-xl p-6">
                    <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Info className="h-5 w-5 text-[#f26755]" />
                      Guide rapide
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <div className="font-semibold text-red-600 mb-2">TVA 20%</div>
                        <div className="text-gray-600">Construction neuve, extension</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <div className="font-semibold text-blue-600 mb-2">TVA 10%</div>
                        <div className="text-gray-600">Rénovation classique (+2 ans)</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <div className="font-semibold text-green-600 mb-2">TVA 5,5%</div>
                        <div className="text-gray-600">Rénovation énergétique</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && selectedTVA && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      Taux recommandé : {selectedTVA}%
                    </h4>
                    <p className="text-gray-600">Voici le détail pour ce taux de TVA</p>
                  </div>

                  <div className={`p-6 rounded-xl border-2 ${getColorClasses(tvaDetails[selectedTVA as keyof typeof tvaDetails].color)}`}>
                    <h5 className="text-xl font-bold mb-4">{tvaDetails[selectedTVA as keyof typeof tvaDetails].title}</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h6 className="font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Cas d'application
                        </h6>
                        <ul className="space-y-2">
                          {tvaDetails[selectedTVA as keyof typeof tvaDetails].cases.map((cas, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0"></div>
                              {cas}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h6 className="font-semibold mb-3 flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          Exemples concrets
                        </h6>
                        <ul className="space-y-2">
                          {tvaDetails[selectedTVA as keyof typeof tvaDetails].examples.map((example, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0"></div>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Points d'attention */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h6 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Points d'attention
                    </h6>
                    <div className="text-sm text-amber-700 space-y-1">
                      <p>• Les travaux doivent être réalisés par un professionnel pour bénéficier des taux réduits</p>
                      <p>• Le logement doit avoir plus de 2 ans pour les taux 10% et 5,5%</p>
                      <p>• Une attestation peut être demandée pour justifier l'application du taux réduit</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setCurrentStep(0)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#f26755] to-[#e55a4a] text-white rounded-xl font-semibold hover:from-[#e55a4a] hover:to-[#d54d3f] transition-all shadow-lg"
                    >
                      Utiliser ce taux ({selectedTVA}%)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};