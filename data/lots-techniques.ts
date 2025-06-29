export interface LotOption {
  label: string;
  prix_ht: number;
  unite: string;
  description: string;
  image?: string;
}

export interface LotItem {
  name: string;
  options: LotOption[];
}

export interface LotSubcategory {
  name: string;
  items: LotItem[];
}

export interface LotTechnique {
  name: string;
  icon: string;
  subcategories: LotSubcategory[];
}

export const LOTS_TECHNIQUES: LotTechnique[] = [
  {
    name: "Installation",
    icon: "Wrench",
    subcategories: [
      {
        name: "Protections",
        items: [
          {
            name: "Protection des parties communes",
            options: [
              {
                label: "Pose de bâches de protection renforcées",
                prix_ht: 5.5,
                unite: "m²",
                description: "Pose de bâches professionnelles ignifugées pour préserver vos sols et murs des éclaboussures, poussières et chocs. Un investissement essentiel pour éviter la détérioration et réduire les coûts de remise en état en fin de chantier.",
                image: ""
              },
              {
                label: "Protection des murs avec panneaux rigides",
                prix_ht: 9.5,
                unite: "m²",
                description: "Installation de panneaux rigides haute résistance pour protéger durablement vos murs des dégradations liées aux travaux. Garantie d'une finition sans dommage et d'un chantier sécurisé.",
                image: ""
              },
              {
                label: "Installation de tapis anti-poussière",
                prix_ht: 7.0,
                unite: "m²",
                description: "Mise en place de tapis anti-poussière professionnels pour limiter la propagation des salissures et faciliter le nettoyage des zones de passage à fort trafic.",
                image: ""
              },
              {
                label: "Signalisation de chantier intégrée",
                prix_ht: 6.0,
                unite: "unité",
                description: "Installation de panneaux de sécurité normalisés pour baliser efficacement le chantier et prévenir tout risque d'accident.",
                image: ""
              },
              {
                label: "Mise en place de barrières temporaires",
                prix_ht: 8.0,
                unite: "ml",
                description: "Installation de barrières temporaires robustes pour délimiter clairement les zones à risque et assurer la sécurité du chantier.",
                image: ""
              },
              {
                label: "Nettoyage régulier des zones protégées",
                prix_ht: 15.0,
                unite: "m²",
                description: "Nettoyage professionnel régulier des espaces protégés pour maintenir un environnement de travail propre et sécurisé tout au long du chantier.",
                image: ""
              }
            ]
          },
          {
            name: "Protection ascenseur",
            options: [
              {
                label: "Habillage des parois intérieures avec mousse anti-choc",
                prix_ht: 25.0,
                unite: "unité",
                description: "Habillage des parois intérieures d'ascenseur avec mousse anti-choc de haute qualité pour prévenir toute détérioration lors des travaux.",
                image: ""
              },
              {
                label: "Protection des boutons et commandes",
                prix_ht: 22.0,
                unite: "unité",
                description: "Pose de protections renforcées sur boutons et commandes d'ascenseur, garantissant leur intégrité face aux manipulations répétées et aux chocs.",
                image: ""
              },
              {
                label: "Pose de tapis de sol renforcés",
                prix_ht: 7.0,
                unite: "m²",
                description: "Installation de tapis de sol anti-poussière renforcés, conçus pour résister aux passages intensifs dans les ascenseurs en chantier.",
                image: ""
              },
              {
                label: "Installation de bandes adhésives de sécurité",
                prix_ht: 60.0,
                unite: "unité",
                description: "Pose de bandes adhésives antidérapantes et visibles, conformes aux normes de sécurité, pour sécuriser l'accès et le sol de l'ascenseur.",
                image: ""
              },
              {
                label: "Nettoyage après chaque passage chantier",
                prix_ht: 15.0,
                unite: "m²",
                description: "Nettoyage minutieux des espaces protégés après chaque intervention pour garantir propreté et hygiène sur le chantier.",
                image: ""
              },
              {
                label: "Contrôle de l'intégrité de la protection",
                prix_ht: 22.0,
                unite: "unité",
                description: "Vérification régulière et contrôle qualité des protections mises en place pour assurer leur efficacité tout au long des travaux.",
                image: ""
              }
            ]
          },
          {
            name: "Protection des sols",
            options: [
              {
                label: "Surface < 10 m²",
                prix_ht: 25.0,
                unite: "unité",
                description: "Protection complète pour surfaces inférieures à 10 m² avec matériaux premium garantissant une haute résistance aux agressions du chantier.",
                image: ""
              },
              {
                label: "Surface 10 à 30 m²",
                prix_ht: 23.0,
                unite: "m²",
                description: "Protection dédiée aux surfaces moyennes, avec des matériaux robustes et durables adaptés aux contraintes des zones intensément fréquentées.",
                image: ""
              },
              {
                label: "Pose droite",
                prix_ht: 50.0,
                unite: "unité",
                description: "Pose soignée d'éléments de protection selon les normes strictes pour garantir une finition impeccable et une durabilité optimale.",
                image: ""
              },
              {
                label: "Pose en diagonale",
                prix_ht: 55.0,
                unite: "unité",
                description: "Installation précise et esthétique d'éléments en diagonale, alliant protection renforcée et finition professionnelle pour vos sols.",
                image: ""
              },
              {
                label: "Joint hydrofuge",
                prix_ht: 22.0,
                unite: "unité",
                description: "Application de joints hydrofuges performants pour protéger efficacement les sols contre l'humidité et les infiltrations durant le chantier.",
                image: ""
              },
              {
                label: "Plinthes assorties incluses",
                prix_ht: 25.0,
                unite: "unité",
                description: "Fourniture et pose de plinthes assorties pour une protection complète des finitions murales et un rendu esthétique soigné.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Logistique",
        items: [
          {
            name: "Amenée et repli du matériel",
            options: [
              {
                label: "Livraison à pied d'œuvre",
                prix_ht: 25.0,
                unite: "unité",
                description: "Livraison professionnelle du matériel directement sur le chantier, assurant un acheminement sécurisé et rapide à pied d'œuvre.",
                image: ""
              },
              {
                label: "Utilisation de monte-charge si nécessaire",
                prix_ht: 30.0,
                unite: "unité",
                description: "Mise à disposition d'un monte-charge adapté pour faciliter le transport du matériel en hauteur, garantissant sécurité et efficacité.",
                image: ""
              },
              {
                label: "Repli et nettoyage du matériel après chantier",
                prix_ht: 15.0,
                unite: "m²",
                description: "Repli organisé et nettoyage complet du matériel utilisé, afin de maintenir la propreté du chantier et la bonne conservation des équipements.",
                image: ""
              },
              {
                label: "Stockage sécurisé du matériel sur site",
                prix_ht: 25.0,
                unite: "unité",
                description: "Mise en place d'un espace de stockage sécurisé pour protéger le matériel contre le vol et les dégradations pendant le chantier.",
                image: ""
              },
              {
                label: "Gestion des horaires de livraison",
                prix_ht: 25.0,
                unite: "unité",
                description: "Organisation rigoureuse des horaires de livraison pour optimiser la logistique et réduire les interruptions sur le chantier.",
                image: ""
              },
              {
                label: "Coordination avec les autres corps de métier",
                prix_ht: 30.0,
                unite: "unité",
                description: "Gestion proactive et coordination fluide avec les autres intervenants pour assurer une progression harmonieuse des travaux.",
                image: ""
              }
            ]
          },
          {
            name: "Nettoyage de chantier",
            options: [
              {
                label: "Enlèvement des déchets et gravats",
                prix_ht: 25.0,
                unite: "unité",
                description: "Collecte et évacuation professionnelle des déchets et gravats, garantissant un chantier propre et conforme aux normes environnementales.",
                image: ""
              },
              {
                label: "Dépoussiérage des surfaces et équipements",
                prix_ht: 22.0,
                unite: "unité",
                description: "Nettoyage minutieux des surfaces et équipements pour éliminer poussières et salissures, préparant la réception des travaux.",
                image: ""
              },
              {
                label: "Nettoyage des sols avant réception",
                prix_ht: 18.0,
                unite: "m²",
                description: "Nettoyage professionnel des sols en fin de chantier pour garantir une présentation impeccable avant la remise des clés.",
                image: ""
              },
              {
                label: "Gestion des déchets recyclables",
                prix_ht: 28.0,
                unite: "unité",
                description: "Tri et gestion rigoureuse des déchets recyclables selon les normes en vigueur pour un chantier respectueux de l'environnement.",
                image: ""
              },
              {
                label: "Fourniture de sacs et containers adaptés",
                prix_ht: 35.0,
                unite: "unité",
                description: "Fourniture de sacs et containers professionnels adaptés pour faciliter la collecte et le tri des déchets sur chantier.",
                image: ""
              },
              {
                label: "Respect des normes environnementales",
                prix_ht: 25.0,
                unite: "unité",
                description: "Assurance du respect strict des normes environnementales durant toutes les opérations de nettoyage et de gestion des déchets.",
                image: ""
              }
            ]
          },
          {
            name: "Échafaudage",
            options: [
              {
                label: "Location d'échafaudage standard",
                prix_ht: 30.0,
                unite: "unité",
                description: "Location d'échafaudage conforme aux normes, adapté à vos besoins pour garantir sécurité et facilité d'accès aux zones de travail.",
                image: ""
              },
              {
                label: "Montage et démontage par personnel qualifié",
                prix_ht: 35.0,
                unite: "unité",
                description: "Montage et démontage réalisés par des techniciens qualifiés, garantissant une installation fiable et conforme aux exigences de sécurité.",
                image: ""
              },
              {
                label: "Installation d'échafaudage roulant si besoin",
                prix_ht: 65.0,
                unite: "unité",
                description: "Mise à disposition et installation d'échafaudage roulant performant pour faciliter les déplacements et sécuriser les interventions en hauteur.",
                image: ""
              },
              {
                label: "Vérification de la stabilité et sécurité",
                prix_ht: 25.0,
                unite: "unité",
                description: "Contrôle rigoureux de la stabilité et des dispositifs de sécurité de l'échafaudage tout au long du chantier.",
                image: ""
              },
              {
                label: "Mise en place de garde-corps et filets",
                prix_ht: 28.0,
                unite: "unité",
                description: "Installation de garde-corps et filets de protection conformes aux normes pour prévenir les chutes et accidents.",
                image: ""
              },
              {
                label: "Conformité aux normes de sécurité en vigueur",
                prix_ht: 28.0,
                unite: "unité",
                description: "Garantir la conformité totale de l'échafaudage aux normes de sécurité en vigueur, assurant la protection des intervenants.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Déchetterie",
        items: [
          {
            name: "Déchetterie accès facile",
            options: [
              {
                label: "Transport direct par camion benne",
                prix_ht: 40.0,
                unite: "unité",
                description: "Transport sécurisé et rapide des déchets sur site grâce à un camion benne adapté, facilitant leur évacuation vers la déchetterie.",
                image: ""
              },
              {
                label: "Tri des déchets en amont",
                prix_ht: 30.0,
                unite: "unité",
                description: "Tri rigoureux des déchets à la source pour optimiser leur valorisation et réduire les coûts d'élimination.",
                image: ""
              },
              {
                label: "Ramassage et évacuation rapides",
                prix_ht: 35.0,
                unite: "unité",
                description: "Service efficace de ramassage et évacuation des déchets pour maintenir un chantier propre et sécurisé.",
                image: ""
              },
              {
                label: "Respect des horaires d'ouverture",
                prix_ht: 15.0,
                unite: "unité",
                description: "Organisation de l'évacuation des déchets en respectant strictement les horaires d'ouverture des déchetteries locales.",
                image: ""
              },
              {
                label: "Réduction des allers-retours",
                prix_ht: 20.0,
                unite: "unité",
                description: "Optimisation des trajets pour minimiser les allers-retours et réduire les coûts et nuisances liées au transport des déchets.",
                image: ""
              },
              {
                label: "Gestion des déchets dangereux séparée",
                prix_ht: 50.0,
                unite: "unité",
                description: "Gestion spécialisée et conforme des déchets dangereux, assurant leur traitement sécurisé et respectueux des normes en vigueur.",
                image: ""
              }
            ]
          },
          {
            name: "Déchetterie accès difficile",
            options: [
              {
                label: "Utilisation de bennes adaptées terrain accidenté",
                prix_ht: 50.0,
                unite: "unité",
                description: "Utilisation de bennes robustes et adaptées aux terrains difficiles pour garantir une évacuation sans encombre des déchets.",
                image: ""
              },
              {
                label: "Manutention manuelle avec chariots",
                prix_ht: 40.0,
                unite: "unité",
                description: "Manutention sécurisée et efficace des déchets à l'aide de chariots, adaptée aux accès difficiles ou étroits.",
                image: ""
              },
              {
                label: "Coordination avec services locaux",
                prix_ht: 30.0,
                unite: "unité",
                description: "Organisation en collaboration avec les services locaux pour assurer la bonne gestion des déchets en zone difficile d'accès.",
                image: ""
              },
              {
                label: "Planification des passages selon accessibilité",
                prix_ht: 25.0,
                unite: "unité",
                description: "Planification précise des passages pour optimiser les déplacements et éviter les retards liés à l'accessibilité.",
                image: ""
              },
              {
                label: "Utilisation d'engins légers type mini-chargeuse",
                prix_ht: 60.0,
                unite: "unité",
                description: "Emploi d'engins légers spécialisés comme la mini-chargeuse pour faciliter la manutention dans les zones difficiles d'accès.",
                image: ""
              },
              {
                label: "Formation spécifique du personnel",
                prix_ht: 35.0,
                unite: "unité",
                description: "Formation dédiée du personnel aux contraintes et techniques spécifiques à la gestion des déchets en zones complexes.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Autres",
        items: [
          {
            name: "Constat d'huissier",
            options: [
              {
                label: "Prise de photos avant travaux",
                prix_ht: 80.0,
                unite: "unité",
                description: "Prise de photos professionnelles pour documenter l'état des lieux avant le démarrage des travaux, garantissant une preuve incontestable.",
                image: ""
              },
              {
                label: "Rédaction d'un rapport détaillé",
                prix_ht: 150.0,
                unite: "unité",
                description: "Élaboration d'un rapport complet et formel d'état des lieux, indispensable en cas de litige ou pour suivi précis du chantier.",
                image: ""
              },
              {
                label: "Présence sur site le jour du constat",
                prix_ht: 120.0,
                unite: "unité",
                description: "Assistance et supervision sur site par un huissier le jour du constat, garantissant la validité juridique des observations.",
                image: ""
              },
              {
                label: "Archivage sécurisé des documents",
                prix_ht: 50.0,
                unite: "unité",
                description: "Archivage sécurisé et confidentiel des documents et preuves, accessible à tout moment en cas de besoin juridique.",
                image: ""
              },
              {
                label: "Transmission au client et intervenants",
                prix_ht: 40.0,
                unite: "unité",
                description: "Transmission rapide et sécurisée des rapports aux clients et intervenants, facilitant la communication et la prise de décision.",
                image: ""
              },
              {
                label: "Gestion des litiges éventuels",
                prix_ht: 200.0,
                unite: "unité",
                description: "Intervention et accompagnement spécialisés pour la gestion et résolution des litiges liés aux constatations d'état des lieux.",
                image: ""
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Démolition & Dépose",
    icon: "Hammer",
    subcategories: [
      {
        name: "Démolitions complètes et partielles",
"items": [
  {
    "name": "Démolition salle de bain",
    "options": [
      {
        "label": "Démolition complète jusqu'à 25 m² (équipements inclus)",
        "prix_ht": 350.0,
        "unite": "forfait",
        "description": "Démolition intégrale de la salle de bain (jusqu'à 25 m²), incluant le démontage des sanitaires, meubles, robinetterie, ainsi que l’évacuation des gravats. Travail réalisé avec soin, protection des zones non concernées incluse.",
        "image": ""
      },
      {
        "label": "Démolition carrelage au sol",
        "prix_ht": 80.0,
        "unite": "m²",
        "description": "Dépose soignée du carrelage de sol avec outils adaptés. Comprend la protection des surfaces voisines et l'évacuation des débris en décharge agréée.",
        "image": ""
      },
      {
        "label": "Démolition faïence au mur",
        "prix_ht": 90.0,
        "unite": "m²",
        "description": "Dépose des carreaux muraux avec précision afin de préserver au mieux le support existant. Gravats évacués dans le respect des normes.",
        "image": ""
      },
      {
        "label": "Chape allégée pour reprise de sol",
        "prix_ht": 65.0,
        "unite": "m²",
        "description": "Réalisation d'une chape allégée (type ciment/vermiculite) pour rattrapage de niveau ou renforcement de sol. Support prêt à recevoir le nouveau revêtement.",
        "image": ""
      },
      {
        "label": "Reprise de mur en BA13",
        "prix_ht": 70.0,
        "unite": "m²",
        "description": "Pose de plaques de plâtre BA13 pour habiller ou reprendre les murs après démolition. Finition propre et prête à peindre ou carreler.",
        "image": ""
      },
      {
        "label": "Préparation du support après dépose",
        "prix_ht": 120.0,
        "unite": "forfait",
        "description": "Nettoyage, grattage, réparation ponctuelle et mise à niveau des supports muraux et sols en vue des travaux à venir. Finitions soignées.",
        "image": ""
      }
    ]
  },
  {
    "name": "Démolition cuisine",
    "options": [
      {
        "label": "Démolition complète jusqu'à 25 m² (meubles inclus)",
        "prix_ht": 370.0,
        "unite": "forfait",
        "description": "Démontage complet de la cuisine (jusqu'à 25 m²) : dépose des meubles hauts/bas, électroménager, évier, robinetterie et revêtements. Protection, tri des déchets et évacuation compris.",
        "image": ""
      },
      {
        "label": "Démolition carrelage au sol",
        "prix_ht": 80.0,
        "unite": "m²",
        "description": "Dépose manuelle ou mécanique du carrelage existant avec évacuation des débris. Travail propre et sécurisé.",
        "image": ""
      },
      {
        "label": "Démolition de la crédence",
        "prix_ht": 50.0,
        "unite": "mètre linéaire",
        "description": "Dépose soignée de la crédence murale (carrelage, verre, inox ou stratifié). Les surfaces sont protégées et prêtes à être reprises ou remplacées.",
        "image": ""
      },
      {
        "label": "Chape allégée pour reprise de sol",
        "prix_ht": 65.0,
        "unite": "m²",
        "description": "Mise en œuvre d'une chape légère pour niveler un sol irrégulier ou abîmé. Préparation optimale pour les futurs revêtements.",
        "image": ""
      },
      {
        "label": "Reprise de mur en BA13",
        "prix_ht": 70.0,
        "unite": "m²",
        "description": "Reconstruction ou habillage des murs avec BA13 après dépose d’éléments muraux ou détérioration. Prêt à peindre ou carreler.",
        "image": ""
      },
      {
        "label": "Préparation du support après dépose",
        "prix_ht": 130.0,
        "unite": "forfait",
        "description": "Nettoyage, rebouchage et préparation des surfaces horizontales et verticales. Intervention idéale pour une rénovation dans les règles de l’art.",
        "image": ""
      }
    ]
  },
  {
    "name": "Démolition plancher",
    "options": [
      {
        "label": "Démolition plancher bois",
        "prix_ht": 95.0,
        "unite": "m²",
        "description": "Dépose complète d’un plancher en bois, incluant le retrait des lames et lambourdes. Enlèvement des gravats inclus.",
        "image": ""
      },
      {
        "label": "Démolition plancher béton",
        "prix_ht": 120.0,
        "unite": "m²",
        "description": "Démolition d’un plancher en béton armé ou non, avec matériels adaptés. Évacuation comprise.",
        "image": ""
      },
      {
        "label": "Préparation du support après dépose",
        "prix_ht": 140.0,
        "unite": "forfait",
        "description": "Mise en propreté, dégagement des zones concernées, et ajustements éventuels pour préparation d’une nouvelle dalle ou autre structure.",
        "image": ""
      }
    ]
  },
  {
    "name": "Démolition cloison placo",
    "options": [
      {
        "label": "Démolition placo (25 m² max)",
        "prix_ht": 100.0,
        "unite": "forfait",
        "description": "Dépose de cloisons en plaques de plâtre (BA13) avec ossature métallique ou bois. Gravats triés et évacués. Zone de travail sécurisée.",
        "image": ""
      },
      {
        "label": "Démolition carreaux de plâtre",
        "prix_ht": 110.0,
        "unite": "m²",
        "description": "Démolition de cloisons constituées de carreaux de plâtre, y compris évacuation. Opération réalisée avec le matériel adapté.",
        "image": ""
      },
      {
        "label": "Raccord de plâtrerie",
        "prix_ht": 60.0,
        "unite": "mètre linéaire",
        "description": "Réalisation de raccords en plâtre pour boucher les saignées, ajuster les murs ou réparer les zones abîmées suite à la démolition.",
        "image": ""
      },
      {
        "label": "Reprise de sol",
        "prix_ht": 70.0,
        "unite": "m²",
        "description": "Nivellement et réparation du sol après dépose de cloison. Prêt à recevoir un nouveau revêtement.",
        "image": ""
      },
      {
        "label": "Préparation du support après dépose",
        "prix_ht": 90.0,
        "unite": "forfait",
        "description": "Nettoyage complet, mise en propreté et réparation localisée des zones touchées pour une continuité parfaite avec le reste du chantier.",
        "image": ""
      }
    ]
  }
]

      },
      {
        name: "Ouvertures et percements",
        items: [
          {
            name: "Démolition murs porteurs",
            options: [
              {
                label: "Surface jusqu'à 25 m²",
                prix_ht: 400.0,
                unite: "forfait",
                description: "Démolition de murs porteurs avec étude technique et renforcement.",
                image: ""
              },
              {
                label: "Évacuation des gravats",
                prix_ht: 200.0,
                unite: "forfait",
                description: "Gestion et évacuation complète des gravats de murs porteurs.",
                image: ""
              },
              {
                label: "Protection chantier incluse",
                prix_ht: 100.0,
                unite: "forfait",
                description: "Mise en place des protections pour garantir la sécurité du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 250.0,
                unite: "forfait",
                description: "Préparation des surfaces en vue des travaux de consolidation ou rénovation.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose toiture",
            options: [
              {
                label: "Surface jusqu'à 25 m²",
                prix_ht: 350.0,
                unite: "forfait",
                description: "Dépose complète de toiture, dépose des matériaux et préparation du support.",
                image: ""
              },
              {
                label: "Évacuation des gravats",
                prix_ht: 180.0,
                unite: "forfait",
                description: "Évacuation conforme des déchets issus de la dépose de toiture.",
                image: ""
              },
              {
                label: "Protection chantier incluse",
                prix_ht: 90.0,
                unite: "forfait",
                description: "Protection adaptée des zones avoisinantes pour éviter les dommages.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 200.0,
                unite: "forfait",
                description: "Nettoyage et préparation pour la pose d'une nouvelle toiture.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Dépose de menuiseries extérieures",
        items: [
          {
            name: "Dépose fenêtres & portes fenêtres",
            options: [
              {
                label: "Dépose simple",
                prix_ht: 120.0,
                unite: "unité",
                description: "Dépose de fenêtres et portes-fenêtres, sans évacuation.",
                image: ""
              },
              {
                label: "Avec évacuation des gravats",
                prix_ht: 180.0,
                unite: "unité",
                description: "Dépose avec évacuation et élimination des déchets en conformité.",
                image: ""
              },
              {
                label: "Protection chantier incluse",
                prix_ht: 70.0,
                unite: "unité",
                description: "Installation des protections nécessaires pour éviter les dommages sur le chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 150.0,
                unite: "unité",
                description: "Nettoyage et préparation du support en vue de la pose de nouvelles menuiseries.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose de porte d'entrée",
            options: [
              {
                label: "Dépose simple",
                prix_ht: 140.0,
                unite: "unité",
                description: "Dépose de porte d'entrée sans évacuation.",
                image: ""
              },
              {
                label: "Avec évacuation des gravats",
                prix_ht: 210.0,
                unite: "unité",
                description: "Dépose avec évacuation des gravats vers une décharge agréée.",
                image: ""
              },
              {
                label: "Protection chantier incluse",
                prix_ht: 80.0,
                unite: "unité",
                description: "Mise en place des protections pour protéger les alentours du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 170.0,
                unite: "unité",
                description: "Préparation complète du support pour faciliter la pose de la nouvelle porte.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Dépose de réseaux",
        items: [
          {
            name: "Dépose réseau d'eau",
            options: [
              {
                label: "Dépose réseau d'eau jusqu'à 25 m² avec évacuation des gravats et protection chantier",
                prix_ht: 150.0,
                unite: "forfait",
                description: "Dépose complète du réseau d'eau sur une surface jusqu'à 25 m², incluant évacuation des gravats et protection chantier. Travaux réalisés selon les normes professionnelles pour assurer sécurité et propreté.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 80.0,
                unite: "forfait",
                description: "Préparation et nettoyage du support après dépose, garantissant une finition soignée et conforme aux exigences du chantier.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose canalisations gaz",
            options: [
              {
                label: "Dépose canalisations gaz jusqu'à 25 m² avec évacuation des gravats et protection chantier",
                prix_ht: 180.0,
                unite: "forfait",
                description: "Dépose complète des canalisations gaz avec évacuation des gravats et protection du chantier, réalisée selon les normes de sécurité gaz.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 90.0,
                unite: "forfait",
                description: "Préparation et nettoyage du support après dépose pour garantir un chantier propre et prêt à la suite des travaux.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose tableau électrique",
            options: [
              {
                label: "Dépose tableau électrique avec évacuation des gravats et protection chantier",
                prix_ht: 170.0,
                unite: "forfait",
                description: "Dépose du tableau électrique incluant évacuation des gravats et protection chantier, réalisée dans le respect des normes électriques et de sécurité.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 85.0,
                unite: "forfait",
                description: "Nettoyage et préparation du support après dépose pour garantir une finition propre et conforme.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose réseau électrique",
            options: [
              {
                label: "Dépose réseau électrique jusqu'à 25 m² avec évacuation des gravats et protection chantier",
                prix_ht: 160.0,
                unite: "forfait",
                description: "Dépose complète du réseau électrique incluant évacuation des gravats et protection chantier, conformément aux normes de sécurité électrique.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 85.0,
                unite: "forfait",
                description: "Préparation du support après dépose pour garantir une finition soignée et durable.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Dépose de chauffage, ventilation",
        items: [
          {
            name: "Purge réseau chauffage",
            options: [
              {
                label: "Dépose de l'ancien équipement avec mise en service et contrôle de conformité",
                prix_ht: 180.0,
                unite: "forfait",
                description: "Dépose complète de l'ancien équipement de chauffage, mise en service du nouveau et contrôle de conformité, assurant un fonctionnement optimal et conforme aux normes.",
                image: ""
              },
              {
                label: "Fourniture comprise",
                prix_ht: 40.0,
                unite: "forfait",
                description: "Fourniture de matériel ou produit prêt à l'emploi pour le réseau chauffage.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose chauffe-eau électrique",
            options: [
              {
                label: "Dépose chauffe-eau électrique jusqu'à 25 m² avec évacuation des gravats et protection chantier",
                prix_ht: 160.0,
                unite: "forfait",
                description: "Dépose complète du chauffe-eau électrique avec évacuation des gravats et protection chantier. Travaux réalisés selon les normes électriques.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 85.0,
                unite: "forfait",
                description: "Préparation et nettoyage du support après dépose du chauffe-eau pour assurer une finition propre.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose chaudière gaz",
            options: [
              {
                label: "Dépose chaudière gaz jusqu'à 25 m² avec évacuation des gravats et protection chantier",
                prix_ht: 200.0,
                unite: "forfait",
                description: "Dépose complète de la chaudière gaz avec évacuation des gravats et protection chantier, réalisée selon les normes de sécurité gaz.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 95.0,
                unite: "forfait",
                description: "Préparation du support après dépose de la chaudière, garantissant un chantier propre et prêt à la suite des travaux.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose chaudière fioul",
            options: [
              {
                label: "Dépose chaudière fioul jusqu'à 25 m² avec évacuation des gravats et protection chantier",
                prix_ht: 220.0,
                unite: "forfait",
                description: "Dépose complète de la chaudière fioul incluant évacuation des gravats et protection chantier, réalisée selon les normes en vigueur.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 95.0,
                unite: "forfait",
                description: "Nettoyage et préparation du support après dépose de la chaudière fioul pour garantir une finition soignée.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose radiateur",
            options: [
              {
                label: "Dépose radiateur jusqu'à 25 m² avec évacuation des gravats et protection chantier",
                prix_ht: 140.0,
                unite: "forfait",
                description: "Dépose complète du radiateur avec évacuation des gravats et protection du chantier, réalisée selon les normes de sécurité.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 75.0,
                unite: "forfait",
                description: "Préparation du support après dépose du radiateur pour assurer un chantier propre et prêt à la suite.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose sèche-serviette",
            options: [
              {
                label: "Dépose sèche-serviette jusqu'à 25 m² avec évacuation des gravats et protection chantier",
                prix_ht: 140.0,
                unite: "forfait",
                description: "Dépose complète du sèche-serviette avec évacuation des gravats et protection chantier, dans le respect des normes.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 75.0,
                unite: "forfait",
                description: "Préparation et nettoyage du support après dépose du sèche-serviette pour une finition soignée.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose/repose radiateur à eau",
            options: [
              {
                label: "Dépose et repose radiateur à eau jusqu'à 25 m² avec évacuation des gravats et protection chantier",
                prix_ht: 250.0,
                unite: "forfait",
                description: "Opération complète de dépose et repose du radiateur à eau incluant évacuation des gravats et protection chantier, réalisée selon les normes de sécurité et qualité.",
                image: ""
              },
              {
                label: "Préparation du support après intervention",
                prix_ht: 100.0,
                unite: "forfait",
                description: "Préparation et nettoyage du support après dépose/repose pour assurer une finition durable et propre.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose VMC",
            options: [
              {
                label: "Dépose VMC jusqu'à 25 m² avec évacuation des gravats et protection chantier",
                prix_ht: 150.0,
                unite: "forfait",
                description: "Dépose complète de la VMC incluant évacuation des gravats et protection chantier, réalisée selon les normes en vigueur.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 80.0,
                unite: "forfait",
                description: "Préparation et nettoyage du support après dépose de la VMC pour garantir un chantier propre et conforme.",
                image: ""
              }
            ]
          },
          {
            name: "Démolition cheminée",
            options: [
              {
                label: "Démolition cheminée jusqu'à 25 m² avec évacuation des gravats et protection chantier",
                prix_ht: 280.0,
                unite: "forfait",
                description: "Démolition complète de la cheminée avec évacuation des gravats et protection du chantier, dans le respect des règles de sécurité.",
                image: ""
              },
              {
                label: "Préparation du support après démolition",
                prix_ht: 120.0,
                unite: "forfait",
                description: "Préparation et nettoyage du support après démolition, garantissant une surface propre et prête à la suite des travaux.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Dépose sanitaires",
        items: [
          {
            name: "Dépose baignoire",
            options: [
              {
                label: "Dépose baignoire avec évacuation des gravats et protection chantier",
                prix_ht: 150.0,
                unite: "forfait",
                description: "Dépose complète de la baignoire incluant l'évacuation des gravats et la protection intégrale du chantier. Travaux réalisés selon les normes professionnelles pour garantir sécurité et propreté.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 45.0,
                unite: "forfait",
                description: "Nettoyage et préparation du support après dépose de la baignoire pour assurer une finition soignée et durable.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose douche",
            options: [
              {
                label: "Dépose douche avec évacuation des gravats et protection chantier",
                prix_ht: 140.0,
                unite: "forfait",
                description: "Dépose complète de la douche incluant évacuation des gravats et protection chantier, conformément aux normes en vigueur.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 45.0,
                unite: "forfait",
                description: "Préparation et nettoyage du support après dépose de la douche pour garantir un chantier propre et prêt à la suite des travaux.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose lavabo ou vasque",
            options: [
              {
                label: "Dépose lavabo ou vasque avec évacuation des gravats et protection chantier",
                prix_ht: 120.0,
                unite: "forfait",
                description: "Dépose complète du lavabo ou de la vasque incluant évacuation des gravats et protection chantier, réalisée dans le respect des normes sanitaires.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 40.0,
                unite: "forfait",
                description: "Nettoyage et préparation du support après dépose pour assurer une finition propre et durable.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose WC",
            options: [
              {
                label: "Dépose WC avec évacuation des gravats et protection chantier",
                prix_ht: 130.0,
                unite: "forfait",
                description: "Dépose complète du WC avec évacuation des gravats et protection chantier, effectuée selon les normes d'hygiène et sécurité.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 40.0,
                unite: "forfait",
                description: "Préparation du support après dépose pour garantir une finition soignée et un chantier propre.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose bidet",
            options: [
              {
                label: "Dépose bidet avec évacuation des gravats et protection chantier",
                prix_ht: 120.0,
                unite: "forfait",
                description: "Dépose complète du bidet avec évacuation des gravats et protection chantier, réalisée selon les normes sanitaires en vigueur.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 40.0,
                unite: "forfait",
                description: "Nettoyage et préparation du support après dépose du bidet pour assurer une finition soignée.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose évier",
            options: [
              {
                label: "Dépose évier avec évacuation des gravats et protection chantier",
                prix_ht: 130.0,
                unite: "forfait",
                description: "Dépose complète de l'évier avec évacuation des gravats et protection chantier, dans le respect des normes sanitaires et professionnelles.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 40.0,
                unite: "forfait",
                description: "Préparation et nettoyage du support après dépose pour garantir une finition propre et durable.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Dépose de revêtements de sol",
        items: [
          {
            name: "Dépose de carrelage",
            options: [
              {
                label: "Dépose carrelage avec évacuation des gravats et protection chantier",
                prix_ht: 150.0,
                unite: "forfait",
                description: "Dépose complète du carrelage avec évacuation des gravats et protection chantier. Travaux effectués selon les normes pour garantir propreté et sécurité.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 50.0,
                unite: "forfait",
                description: "Nettoyage et préparation du support après dépose du carrelage, assurant une surface propre et prête à recevoir le nouveau revêtement.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose moquette/vinyle/sol souple",
            options: [
              {
                label: "Dépose moquette/vinyle/sol souple avec évacuation des gravats et protection chantier",
                prix_ht: 140.0,
                unite: "forfait",
                description: "Dépose complète des revêtements souples (moquette, vinyle, sol souple) incluant évacuation des gravats et protection chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 50.0,
                unite: "forfait",
                description: "Préparation et nettoyage du support après dépose pour garantir un chantier propre et prêt à la suite des travaux.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose jonc de mer",
            options: [
              {
                label: "Dépose jonc de mer avec évacuation des gravats et protection chantier",
                prix_ht: 140.0,
                unite: "forfait",
                description: "Dépose complète du jonc de mer incluant évacuation des gravats et protection chantier, selon les règles professionnelles.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 50.0,
                unite: "forfait",
                description: "Nettoyage et préparation du support après dépose du jonc de mer pour une finition propre et durable.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose de parquet",
            options: [
              {
                label: "Dépose parquet avec évacuation des gravats et protection chantier",
                prix_ht: 160.0,
                unite: "forfait",
                description: "Dépose complète du parquet incluant évacuation des gravats et protection chantier, réalisée selon les normes professionnelles.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 55.0,
                unite: "forfait",
                description: "Préparation et nettoyage du support après dépose du parquet pour assurer une surface prête à recevoir un nouveau revêtement.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose plinthes",
            options: [
              {
                label: "Dépose plinthes avec évacuation des gravats et protection chantier",
                prix_ht: 120.0,
                unite: "forfait",
                description: "Dépose complète des plinthes avec évacuation des gravats et protection chantier, réalisée dans le respect des normes.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 45.0,
                unite: "forfait",
                description: "Nettoyage et préparation du support après dépose des plinthes pour une finition soignée et durable.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Dépose de revêtements de mur & plafond",
        items: [
          {
            name: "Dépose faïence",
            options: [
              {
                label: "Prestation complète (inclut protection chantier et évacuation des gravats)",
                prix_ht: 120.0,
                unite: "forfait",
                description: "Dépose complète de faïence avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 60.0,
                unite: "forfait",
                description: "Préparation soignée du support pour assurer une finition parfaite.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose papier peint",
            options: [
              {
                label: "Prestation complète (inclut protection chantier et évacuation des gravats)",
                prix_ht: 110.0,
                unite: "forfait",
                description: "Dépose complète de papier peint avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 55.0,
                unite: "forfait",
                description: "Préparation soignée du support pour assurer une finition parfaite.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose de moulures",
            options: [
              {
                label: "Prestation complète (inclut protection chantier et évacuation des gravats)",
                prix_ht: 100.0,
                unite: "forfait",
                description: "Dépose complète des moulures avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 50.0,
                unite: "forfait",
                description: "Préparation soignée du support pour assurer une finition parfaite.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose toile de verre",
            options: [
              {
                label: "Prestation complète (inclut protection chantier et évacuation des gravats)",
                prix_ht: 115.0,
                unite: "forfait",
                description: "Dépose complète de toile de verre avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 58.0,
                unite: "forfait",
                description: "Préparation soignée du support pour assurer une finition parfaite.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose lambris",
            options: [
              {
                label: "Prestation complète (inclut protection chantier et évacuation des gravats)",
                prix_ht: 130.0,
                unite: "forfait",
                description: "Dépose complète de lambris avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 65.0,
                unite: "forfait",
                description: "Préparation soignée du support pour assurer une finition parfaite.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose paille japonaise",
            options: [
              {
                label: "Prestation complète (inclut protection chantier et évacuation des gravats)",
                prix_ht: 120.0,
                unite: "forfait",
                description: "Dépose complète de paille japonaise avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 60.0,
                unite: "forfait",
                description: "Préparation soignée du support pour assurer une finition parfaite.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose tissu mural",
            options: [
              {
                label: "Prestation complète (inclut protection chantier et évacuation des gravats)",
                prix_ht: 110.0,
                unite: "forfait",
                description: "Dépose complète de tissu mural avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 55.0,
                unite: "forfait",
                description: "Préparation soignée du support pour assurer une finition parfaite.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Menuiseries intérieures",
        items: [
          {
            name: "Dépose menuiseries bois",
            options: [
              {
                label: "Prestation complète (inclut protection chantier et évacuation des gravats)",
                prix_ht: 130.0,
                unite: "forfait",
                description: "Dépose complète de menuiseries bois avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 65.0,
                unite: "forfait",
                description: "Préparation soignée du support pour garantir une finition optimale.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose porte intérieure",
            options: [
              {
                label: "Prestation complète (inclut protection chantier et évacuation des gravats)",
                prix_ht: 125.0,
                unite: "forfait",
                description: "Dépose complète de porte intérieure avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 60.0,
                unite: "forfait",
                description: "Préparation soignée du support pour garantir une finition optimale.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose d'étagères",
            options: [
              {
                label: "Prestation complète (inclut protection chantier et évacuation des gravats)",
                prix_ht: 115.0,
                unite: "forfait",
                description: "Dépose complète d'étagères avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 55.0,
                unite: "forfait",
                description: "Préparation soignée du support pour garantir une finition optimale.",
                image: ""
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Gros œuvre & structure",
    icon: "Building",
    subcategories: [
      {
        name: "Fondations",
        items: [
          {
            name: "Longrine béton armé",
            options: [
              {
                label: "Réalisation complète de longrine béton armé",
                prix_ht: 150.0,
                unite: "ml",
                description: "Prestation complète incluant coffrage, armatures inox, coulage béton fibré et contrôle géotechnique. Finition lissée et traitement anti-corrosion inclus.",
                image: ""
              }
            ]
          },
          {
            name: "Semelles filantes",
            options: [
              {
                label: "Semelles filantes renforcées",
                prix_ht: 180.0,
                unite: "ml",
                description: "Réalisation clé en main : excavation, film polyane, coffrage perdu, béton haute résistance avec armatures et contrôle de planéité.",
                image: ""
              }
            ]
          },
          {
            name: "Semelles isolées",
            options: [
              {
                label: "Semelles ponctuelles sur mesure (jusqu'à 30m²)",
                prix_ht: 250.0,
                unite: "unité",
                description: "Solutions techniques adaptées aux charges lourdes incluant étude structurelle, hérisson compacté et joints hydrofuges.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Dallage",
        items: [
          {
            name: "Dalle béton haute performance",
            options: [
              {
                label: "Dalle armée fibrée intégrale",
                prix_ht: 85.0,
                unite: "m²",
                description: "Solution premium avec treillis soudé, isolation PEX, cure humide et finition parfaitement plane (tolérance 2mm/m).",
                image: ""
              }
            ]
          },
          {
            name: "Seuil maçonné premium",
            options: [
              {
                label: "Seuil en béton ou pierre naturelle",
                prix_ht: 120.0,
                unite: "ml",
                description: "Réalisation sur mesure avec coffrage métallique, renforts acier, hydrofuge et finition talochée ou pierre taillée.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Poteaux & poutres",
        items: [
          {
            name: "Structure béton haute résistance",
            options: [
              {
                label: "Poteaux et poutres architectoniques",
                prix_ht: 320.0,
                unite: "unité",
                description: "Éléments porteurs en BHP avec coffrage bois/métal, armatures calculées par bureau d'études et finition vue brute ou lissée.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Murs",
        items: [
          {
            name: "Voile béton architecturale",
            options: [
              {
                label: "Mur béton banché isolé",
                prix_ht: 110.0,
                unite: "m²",
                description: "Voile structurel avec isolation intégrée, coffrage nervuré pour effet architectural et traitement anti-fissuration professionnel.",
                image: ""
              }
            ]
          },
          {
            name: "Mur en blocs à joint mince",
            options: [
              {
                label: "Mur bloc béton cellulaire",
                prix_ht: 75.0,
                unite: "m²",
                description: "Montage rapide avec mortier-colle, arases renforcées et préparation parfaite pour enduit ou bardage ventilé.",
                image: ""
              }
            ]
          },
          {
            name: "Mur brique traditionnelle",
            options: [
              {
                label: "Maçonnerie de briques pleines",
                prix_ht: 95.0,
                unite: "m²",
                description: "Artisanat maçonné avec mortier traditionnel, chaînages intégrés et finition brute pour charme authentique.",
                image: ""
              }
            ]
          },
          {
            name: "Chaînages structurels",
            options: [
              {
                label: "Chaînages béton armé",
                prix_ht: 65.0,
                unite: "ml",
                description: "Ensemble ceinture et raidisseurs en béton fibré avec acier haute adhérence pour stabilité parasismique.",
                image: ""
              }
            ]
          },
          {
            name: "Linteaux sur mesure",
            options: [
              {
                label: "Linteaux béton/acié précontraints",
                prix_ht: 180.0,
                unite: "unité",
                description: "Solutions techniques pour grandes ouvertures avec calage précis, scellement chimique et finition intégrée.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Planchers",
        items: [
          {
            name: "Plancher béton nervuré",
            options: [
              {
                label: "Dalle pleine ou alvéolaire",
                prix_ht: 130.0,
                unite: "m²",
                description: "Solution structurelle avec isolation phonique intégrée, traitement de joints et planéité contrôlée au laser.",
                image: ""
              }
            ]
          },
          {
            name: "Plancher poutrelles-hourdis",
            options: [
              {
                label: "Système préfabriqué isolé",
                prix_ht: 95.0,
                unite: "m²",
                description: "Plancher léger à montage rapide avec hourdis PSE/béton, dalle de compression et passages techniques intégrés.",
                image: ""
              }
            ]
          },
          {
            name: "Plancher collaborant acier-béton",
            options: [
              {
                label: "Système mixte haute performance",
                prix_ht: 145.0,
                unite: "m²",
                description: "Bac acier galvanisé avec dalle béton coulée en œuvre, permettant de grandes portées sans étais intermédiaires.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Chapes",
        items: [
          {
            name: "Chape fluide anhydrite",
            options: [
              {
                label: "Chape auto-nivelante technique",
                prix_ht: 35.0,
                unite: "m²",
                description: "Solution sèche pour planéité parfaite (±1mm/m), idéale pour chauffage au sol et délais raccourcis.",
                image: ""
              }
            ]
          },
          {
            name: "Chape traditionnelle isolante",
            options: [
              {
                label: "Chape légère thermo-acoustique",
                prix_ht: 28.0,
                unite: "m²",
                description: "Mortier allégé aux billes de PSE avec treillis soudé, permettant une isolation intégrée performante.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Escaliers & Trémies",
        items: [
          {
            name: "Escalier béton architecturale",
            options: [
              {
                label: "Escalier monumental coulé en place",
                prix_ht: 2500.0,
                unite: "unité",
                description: "Structure porteuse avec coffrage bois précis, nez de marche antidérapants et finition bouchardée ou lissée.",
                image: ""
              }
            ]
          },
          {
            name: "Travaux de trémie",
            options: [
              {
                label: "Ouverture sécurisée en plancher existant",
                prix_ht: 850.0,
                unite: "unité",
                description: "Découpe au diamant avec renforts métalliques, mise en sécurité et finitions professionnelles.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Étanchéité",
        items: [
          {
            name: "Étanchéité des soubassements",
            options: [
              {
                label: "Bande d'arase haute adhérence",
                prix_ht: 15.0,
                unite: "ml",
                description: "Protection bitumineuse auto-adhésive double couche avec contrôle d'étanchéité par test d'arrosage.",
                image: ""
              }
            ]
          },
          {
            name: "Drainage périphérique complet",
            options: [
              {
                label: "Système de drainage avec regard",
                prix_ht: 120.0,
                unite: "ml",
                description: "Installation clé en main : drains, géotextile, pente calculée et raccordement au réseau pluvial.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Charpente",
        items: [
          {
            name: "Charpente bois traditionnelle",
            options: [
              {
                label: "Structure sur mesure en bois massif",
                prix_ht: 180.0,
                unite: "m²",
                description: "Artisanat charpenté avec assemblages traditionnels, bois traité classe 4 et finition rabotée quatre faces.",
                image: ""
              }
            ]
          },
          {
            name: "Charpente industrielle optimisée",
            options: [
              {
                label: "Fermettes préfabriquées certifiées",
                prix_ht: 95.0,
                unite: "m²",
                description: "Solution économique à montage rapide avec connecteurs métalliques et préparation pour isolation soufflée.",
                image: ""
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Façade, Couverture & ITE",
    icon: "Home",
    subcategories: [
      {
        name: "Façade",
        items: [
          {
            name: "ITE avec enduit minéral complet",
            options: [
              {
                label: "Isolation et finition complète de façade",
                prix_ht: 125.0,
                unite: "m²",
                description: "Prestation complète incluant : isolation en polystyrène/laine de roche, pose d'armature, application d'enduit minéral, protections et finitions teintées. Conforme aux normes RT 2012/RE 2020. Protection du chantier incluse."
              }
            ]
          },
          {
            name: "Enduits muraux complets",
            options: [
              {
                label: "Enduit traditionnel ou monocouche complet",
                prix_ht: 85.0,
                unite: "m²",
                description: "Application d'enduit à la chaux ou monocouche hydraulique avec finitions au choix (gratté, taloché). Inclut traitement hydrofuge et application sur tout type de support. Possibilité d'enduit isolant."
              }
            ]
          }
        ]
      },
      {
        name: "Couverture",
        items: [
          {
            name: "ITE toiture sarking complète",
            options: [
              {
                label: "Isolation et habillage de toiture",
                prix_ht: 150.0,
                unite: "m²",
                description: "Solution complète : pose d'isolant rigide, écran sous-toiture ventilé, habillage en bac acier ou tuiles. Inclut renforcement charpente si nécessaire. Étanchéité garantie selon DTU."
              }
            ]
          },
          {
            name: "Couverture tuile complète",
            options: [
              {
                label: "Pose complète de toiture en tuiles",
                prix_ht: 175.0,
                unite: "m²",
                description: "Installation clé en main : tuiles terre cuite/béton, liteaux, sous-toiture ventilée, finitions faîtage et rives. Traitement anti-mousse et garantie décennale inclus."
              }
            ]
          },
          {
            name: "Couverture ardoise complète",
            options: [
              {
                label: "Toiture en ardoise naturelle complète",
                prix_ht: 210.0,
                unite: "m²",
                description: "Pose professionnelle d'ardoises naturelles sur voliges, avec écran sous-toiture et fixation inox. Inclut traitement anti-lichen et entretien initial. Étanchéité optimale garantie."
              }
            ]
          }
        ]
      },
      {
        name: "Gouttières et descentes EP",
        items: [
          {
            name: "Installation complète gouttières",
            options: [
              {
                label: "Système d'évacuation complet",
                prix_ht: 95.0,
                unite: "ml",
                description: "Pose de gouttières zinc/PVC (demi-ronde ou carrée) avec descentes EP, crochets inox et grilles anti-feuilles. Inclut traitement anti-corrosion et raccordement aux évacuations."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Menuiseries extérieures",
    icon: "DoorOpen",
    subcategories: [
      {
        name: "Portes et fenêtres",
        items: [
          {
            name: "Porte d'entrée haut de gamme",
            options: [
              {
                label: "Porte d'entrée complète avec pose",
                prix_ht: 2500.0,
                unite: "unité",
                description: "Porte d'entrée isolante en PVC, Alu ou Bois massif avec système de sécurité multi-points. Inclut : quincaillerie premium, seuil étanche, pose professionnelle et finitions parfaites. Choix parmi plusieurs designs et finitions."
              }
            ]
          },
          {
            name: "Fenêtres sur-mesure",
            options: [
              {
                label: "Fenêtre complète avec installation",
                prix_ht: 850.0,
                unite: "unité",
                description: "Fenêtre isolante double vitrage (4/16/4) en PVC, Alu ou Bois. Inclut : pose étanche, reprise des enduits, joints silicone professionnels et réglage précis. Performance thermique et acoustique certifiée."
              }
            ]
          },
          {
            name: "Porte-fenêtre premium",
            options: [
              {
                label: "Porte-fenêtre coulissante ou battante",
                prix_ht: 1800.0,
                unite: "unité",
                description: "Porte-fenêtre haute performance avec système d'étanchéité renforcé. Disponible en différents modes d'ouverture. Inclut : pose technique, seuil bas isolant et finitions intérieur/extérieur parfaites."
              }
            ]
          },
          {
            name: "Baie vitrée coulissante",
            options: [
              {
                label: "Baie coulissante grande dimension",
                prix_ht: 650.0,
                unite: "m²",
                description: "Baie vitrée coulissante à galandage avec vitrage isolant. Système à roulement silencieux et durable. Inclut : structure renforcée, pose technique et finitions d'étanchéité professionnelles."
              }
            ]
          }
        ]
      },
      {
        name: "Menuiseries de toiture",
        items: [
          {
            name: "Fenêtre de toit VELUX",
            options: [
              {
                label: "Fenêtre de toit complète",
                prix_ht: 1200.0,
                unite: "unité",
                description: "Fenêtre de toit VELUX standard avec installation clé en main. Inclut : cadre isolant, volets roulants intégrés, étanchéité parfaite et finitions intérieures/exterieures. Garantie étanchéité 10 ans."
              }
            ]
          },
          {
            name: "Accès toit-terrasse",
            options: [
              {
                label: "Trappe d'accès isolée",
                prix_ht: 2200.0,
                unite: "unité",
                description: "Trappe d'accès toit-terrasse professionnelle avec isolation renforcée. Sécurité anti-effraction et étanchéité parfaite. Inclut : quincaillerie premium et pose technique avec reprise d'étanchéité."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Plâtrerie & Isolation Thermique Intérieure",
    icon: "Wrench",
    subcategories: [
      {
        name: "Cloisonnement complet",
        items: [
          {
            name: "Cloisonnement sur mesure",
            options: [
              {
                label: "Cloison Placo® complète",
                prix_ht: 75.0,
                unite: "m²",
                description: "Cloison en plaques de plâtre BA13 sur ossature métallique, avec isolation phonique et thermique optionnelle. Inclut : fourniture, pose, joints et finitions prêtes à peindre. Épaisseur standard 72mm ou sur mesure."
              },
              {
                label: "Cloison en carreaux de plâtre",
                prix_ht: 95.0,
                unite: "m²",
                description: "Cloison en carreaux de plâtre collés pour une excellente isolation phonique et résistance au feu. Inclut : préparation des supports, collage professionnel et finitions parfaites. Solution idéale pour les pièces humides."
              },
              {
                label: "Condamnation de porte professionnelle",
                prix_ht: 350.0,
                unite: "unité",
                description: "Condamnation complète d'une porte existante avec isolation phonique et thermique. Inclut : dépose de la menuiserie, mise en place de l'ossature, isolation et finitions identiques au mur existant."
              }
            ]
          }
        ]
      },
      {
        name: "Doublage et ITI",
        items: [
          {
            name: "Isolation des murs",
            options: [
              {
                label: "Doublage isolant complet",
                prix_ht: 65.0,
                unite: "m²",
                description: "Doublage thermique et phonique sur ossature métallique avec laine minérale. Inclut : pare-vapeur, plaques de plâtre hydrofuges et finitions prêtes à peindre. Épaisseur 45mm à 100mm selon performance souhaitée."
              },
              {
                label: "ITI collée haute performance",
                prix_ht: 85.0,
                unite: "m²",
                description: "Isolation Thermique Intérieure par collage direct de plaques isolantes avec finition plâtre. Solution mince et performante (jusqu'à R=4.5). Inclut préparation des supports et finitions parfaites."
              }
            ]
          }
        ]
      },
      {
        name: "Faux-plafonds techniques",
        items: [
          {
            name: "Faux-plafonds sur mesure",
            options: [
              {
                label: "Faux-plafond isolant plâtre",
                prix_ht: 55.0,
                unite: "m²",
                description: "Faux-plafond suspendu avec ossature métallique, isolation phonique/thermique et plaques de plâtre. Inclut : découpes techniques, trappes de visite et finitions prêtes à peindre."
              },
              {
                label: "Faux-plafond dalles amovibles",
                prix_ht: 45.0,
                unite: "m²",
                description: "Faux-plafond technique avec dalles minérales acoustiques et accès facile aux gaines. Large choix de dalles (classique, hygro-régulante, phonique). Inclut structure métallique et finitions périphériques."
              }
            ]
          }
        ]
      },
      {
        name: "Isolation des combles",
        items: [
          {
            name: "Solutions combles performantes",
            options: [
              {
                label: "ITI combles perdus soufflée",
                prix_ht: 35.0,
                unite: "m²",
                description: "Isolation des combles perdus par laine minérale soufflée (épaisseur 320mm). Inclut : traitement des ponts thermiques, mise en place des écrans de protection et trappes d'accès. Performance R≥7.5."
              },
              {
                label: "ITI sous rampants complet",
                prix_ht: 90.0,
                unite: "m²",
                description: "Isolation sous rampants avec ossature métallique, pare-vapeur et laine de verre. Inclut : plaques de plâtre finition lisse, traitement des angles et finitions prêtes à décorer. Épaisseur 100-120mm."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Plomberie & CVC",
    icon: "Wrench",
    subcategories: [
      {
        name: "Chauffage et ECS",
        items: [
          {
            name: "Chaudière gaz",
            options: [
              {
                label: "Installation complète chaudière gaz à condensation",
                prix_ht: 2500.0,
                unite: "unité",
                description: "Prestation clé en main incluant dépose ancienne chaudière, installation neuve, raccordements, mise en service et contrôle conformité. Fourniture chaudière haut rendement incluse.",
                image: ""
              }
            ]
          },
          {
            name: "Pompe à chaleur air/eau",
            options: [
              {
                label: "Installation complète PAC air/eau",
                prix_ht: 4500.0,
                unite: "unité",
                description: "Solution complète avec étude thermique, pose unités intérieure/extérieure, raccordements hydrauliques/électriques, mise en service et garantie constructeur.",
                image: ""
              }
            ]
          },
          {
            name: "Chauffe-eau électrique",
            options: [
              {
                label: "Installation chauffe-eau électrique 200L",
                prix_ht: 850.0,
                unite: "unité",
                description: "Pose complète incluant fourniture appareil, groupe de sécurité, raccordements et mise en service. Dépose ancien chauffe-eau incluse.",
                image: ""
              }
            ]
          },
          {
            name: "Chauffe-eau thermodynamique",
            options: [
              {
                label: "Installation CET avec unité extérieure",
                prix_ht: 2200.0,
                unite: "unité",
                description: "Solution complète avec optimisation énergétique, maintenance incluse et garantie prolongée. Raccordements hydrauliques/électriques professionnels.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Réseaux",
        items: [
          {
            name: "Attentes pour lave-linge et/ou lave-vaisselle",
            options: [
              {
                label: "Installation complète attentes lave-linge",
                prix_ht: 180.0,
                unite: "unité",
                description: "Pose professionnelle avec alimentation eau chaude/froide, évacuation PVC 40mm et test d'étanchéité. Robinetterie incluse.",
                image: ""
              }
            ]
          },
          {
            name: "Réseau alimentation chauffage",
            options: [
              {
                label: "Mise en œuvre réseau chauffage PER",
                prix_ht: 35.0,
                unite: "ml",
                description: "Installation complète avec tubes PER, raccords laiton et purgeurs automatiques. Test pression à 3 bars inclus.",
                image: ""
              }
            ]
          },
          {
            name: "Réseau alimentation eau",
            options: [
              {
                label: "Réseau eau multicouche complet",
                prix_ht: 28.0,
                unite: "ml",
                description: "Pose canalisations avec robinetterie d'arrêt, filtres et clapets. Certification NF et test d'étanchéité inclus.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Radiateurs",
        items: [
          {
            name: "Radiateurs électriques",
            options: [
              {
                label: "Pose radiateur électrique à inertie",
                prix_ht: 350.0,
                unite: "unité",
                description: "Installation complète avec fourniture appareil haut de gamme, raccordement électrique sécurisé et programmation connectée incluse.",
                image: ""
              }
            ]
          },
          {
            name: "Radiateurs à eau",
            options: [
              {
                label: "Installation radiateur à eau haute performance",
                prix_ht: 480.0,
                unite: "unité",
                description: "Pose complète avec robinets thermostatiques, équilibrage hydraulique et test de pression. Dépose ancien radiateur incluse.",
                image: ""
              }
            ]
          },
          {
            name: "Vannes d'arrêts",
            options: [
              {
                label: "Remplacement vannes thermostatiques",
                prix_ht: 120.0,
                unite: "unité",
                description: "Échange complet avec vannes haute qualité, réglage précis et garantie d'étanchéité. Compatible tous radiateurs.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Planchers chauffants",
        items: [
          {
            name: "Plancher chauffant électrique",
            options: [
              {
                label: "Plancher rayonnant électrique complet",
                prix_ht: 65.0,
                unite: "m²",
                description: "Solution intégrale avec câbles chauffants, isolant thermique, thermostat programmable et raccordement sécurisé au tableau.",
                image: ""
              }
            ]
          },
          {
            name: "Plancher chauffant à eau",
            options: [
              {
                label: "Plancher chauffant hydraulique clé en main",
                prix_ht: 85.0,
                unite: "m²",
                description: "Installation professionnelle avec tubes PER, collecteur équilibré, raccordement chaudière et test de pression prolongé.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Équipements",
        items: [
          {
            name: "Douche",
            options: [
              {
                label: "Installation complète douche à l'italienne",
                prix_ht: 1250.0,
                unite: "unité",
                description: "Pose clé en main avec étanchéité renforcée, receveur, raccordements et habillage. Finition premium garantie.",
                image: ""
              }
            ]
          },
          {
            name: "Lavabo",
            options: [
              {
                label: "Pose lavabo avec robinetterie",
                prix_ht: 320.0,
                unite: "unité",
                description: "Installation complète incluant siphon, alimentations et tests d'étanchéité. Fixation murale ou sur meuble.",
                image: ""
              }
            ]
          },
          {
            name: "WC",
            options: [
              {
                label: "Installation WC suspendu complet",
                prix_ht: 580.0,
                unite: "unité",
                description: "Pose professionnelle avec réservation, raccordements et habillage. Dépose ancien WC incluse.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Ventilation",
        items: [
          {
            name: "VMC double flux",
            options: [
              {
                label: "Installation VMC DF hygroréglable",
                prix_ht: 2200.0,
                unite: "unité",
                description: "Solution complète conforme RE2020 avec récupération de chaleur, gaines isolées et bouches haut débit. Mise en service incluse.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Climatisation réversible",
        items: [
          {
            name: "Climatisation monosplit",
            options: [
              {
                label: "Installation climatisation inverter",
                prix_ht: 2900.0,
                unite: "unité",
                description: "Pose complète avec unité murale silencieuse (<25dB), télécommande WiFi et filtre antiallergique. Garantie 5 ans.",
                image: ""
              }
            ]
          },
          {
            name: "Climatisation multisplit",
            options: [
              {
                label: "Solution multisplit pour 3 pièces",
                prix_ht: 6500.0,
                unite: "unité",
                description: "Installation professionnelle avec gestion individuelle des pièces, régulation précise et design discret. Contrat maintenance inclus.",
                image: ""
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Électricité Complète",
    icon: "Wrench",
    subcategories: [
      {
        name: "Conception & Plans",
        items: [
          {
            name: "Étude électrique complète",
            options: [
              {
                label: "Plan électrique NF C 15-100",
                prix_ht: 450.0,
                unite: "projet",
                description: "Conception complète incluant : plan 2D détaillé, implantation des prises/éclairages, schéma du tableau électrique, gestion des zones humides. Validation client incluse avec 3 modifications possibles."
              }
            ]
          }
        ]
      },
      {
        name: "Tableaux & Distribution",
        items: [
          {
            name: "Tableau électrique principal",
            options: [
              {
                label: "Tableau neuf complet avec pose",
                prix_ht: 1200.0,
                unite: "unité",
                description: "Tableau divisionnaire 12 à 24 modules avec disjoncteurs différentiels 30mA. Inclut : coffret, rangement des câbles, tests électriques et certification partielle. Fourniture Hager ou Schneider."
              }
            ]
          },
          {
            name: "Gestion des circuits",
            options: [
              {
                label: "Installation complète des circuits",
                prix_ht: 25.0,
                unite: "m²",
                description: "Pose des gaines ICTA, câbles cuivre 1.5 à 6mm² et raccordement au tableau. Inclut : repérage des circuits, protection différentielle et tests de conformité. Solution prête à raccorder."
              }
            ]
          },
          {
            name: "GTL & Communication",
            options: [
              {
                label: "Gaine Technique Logement complète",
                prix_ht: 850.0,
                unite: "unité",
                description: "Installation clé en main de la GTL avec tableau communication, pré-câblage RJ45 et préparation fibre optique. Inclut gestion des arrivées opérateurs et espace domotique."
              }
            ]
          }
        ]
      },
      {
        name: "Chauffage Électrique",
        items: [
          {
            name: "Radiateurs performants",
            options: [
              {
                label: "Pose de radiateurs dernière génération",
                prix_ht: 600.0,
                unite: "unité",
                description: "Installation de radiateurs à inertie avec thermostat connecté. Inclut : dépose ancien modèle, raccordement sécurisé, réglage et garantie 5 ans. Consommation optimisée."
              }
            ]
          },
          {
            name: "Plancher chauffant",
            options: [
              {
                label: "Plancher chauffant électrique complet",
                prix_ht: 95.0,
                unite: "m²",
                description: "Solution tout compris : isolation, câbles chauffants, thermostat programmable et raccordement au tableau. Inclut tests de résistance et mise en service professionnelle."
              }
            ]
          }
        ]
      },
      {
        name: "Prises & Éclairages",
        items: [
          {
            name: "Installation électrique standard",
            options: [
              {
                label: "Prises et éclairages NF C 15-100",
                prix_ht: 65.0,
                unite: "point",
                description: "Pose de prises 16A avec terre, interrupteurs et éclairages selon normes. Inclut : découpes, boîtes d'encastrement, raccordement et tests. Choix finitions (coulissants, tactiles...)"
              }
            ]
          },
          {
            name: "Solutions sur-mesure",
            options: [
              {
                label: "Pack salle de bain sécurisée",
                prix_ht: 450.0,
                unite: "pièce",
                description: "Installation spécifique zone humide : prises IP44, trafo 12V pour miroir, spots étanches. Respect des volumes et sécurité maximale. Inclut attestation de conformité."
              },
              {
                label: "Pack domotique de base",
                prix_ht: 1800.0,
                unite: "logement",
                description: "Solution clé en main : gestion éclairage/prises connectées, thermostat intelligent, interface centralisée. Compatible Alexa/Google Home. Installation et paramétrage inclus."
              }
            ]
          }
        ]
      },
      {
        name: "Certifications",
        items: [
          {
            name: "Mise en conformité",
            options: [
              {
                label: "Attestation CONSUEL complète",
                prix_ht: 350.0,
                unite: "dossier",
                description: "Accompagnement complet : vérification pré-contrôle, préparation dossier, assistance au contrôle et régularisation si nécessaire. Garantie d'obtention du certificat."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Revêtement sol",
    icon: "Package",
    subcategories: [
      {
        name: "Carrelage",
        items: [
          {
            name: "Pose carrelage céramique",
            options: [
              {
                label: "Pose standard droit ou diagonal (20-60cm)",
                prix_ht: 55.0,
                unite: "m²",
                description: "Pose professionnelle incluant préparation du support, jointoiement hydrofuge et finition parfaite. Plinthes assorties incluses.",
                image: ""
              }
            ]
          },
          {
            name: "Mosaïque sol",
            options: [
              {
                label: "Pose mosaïque artisanale",
                prix_ht: 85.0,
                unite: "m²",
                description: "Pose délicate avec calepinage précis, joints fins et finition lustrée. Protection hydrofuge incluse.",
                image: ""
              }
            ]
          },
          {
            name: "Carreaux de ciment",
            options: [
              {
                label: "Pose carreaux de ciment artisanaux",
                prix_ht: 95.0,
                unite: "m²",
                description: "Pose sur chape parfaite avec traitement imperméabilisant. Finition cire naturelle pour protection durable.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Parquet",
        items: [
          {
            name: "Pose parquet massif",
            options: [
              {
                label: "Pose clouée ou collée (chêne/châtaignier)",
                prix_ht: 65.0,
                unite: "m²",
                description: "Pose traditionnelle avec sous-couche isolante, finition huilée ou vitrifiée au choix. Plinthes assorties.",
                image: ""
              }
            ]
          },
          {
            name: "Rénovation parquet",
            options: [
              {
                label: "Rénovation complète parquet ancien",
                prix_ht: 45.0,
                unite: "m²",
                description: "Ponçage professionnel, rebouchage, traitement anti-termites et finition cire ou vernis. Garantie 5 ans.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Sols souples",
        items: [
          {
            name: "Sol vinyle haute gamme",
            options: [
              {
                label: "Pose vinyle clipable ou collé (LVT)",
                prix_ht: 42.0,
                unite: "m²",
                description: "Pose sur sol parfaitement plan avec sous-couche insonorisante. Finitions bords et raccords invisibles.",
                image: ""
              }
            ]
          },
          {
            name: "Moquette premium",
            options: [
              {
                label: "Pose moquette velours ou bouclée",
                prix_ht: 38.0,
                unite: "m²",
                description: "Installation avec sous-couche anti-humidité, traitement anti-taches et antidérapant pour escaliers.",
                image: ""
              }
            ]
          },
          {
            name: "Béton ciré contemporain",
            options: [
              {
                label: "Application béton ciré époxy",
                prix_ht: 85.0,
                unite: "m²",
                description: "Préparation du support, application en 3 couches avec finition mate ou satinée. Résistance aux chocs.",
                image: ""
              }
            ]
          },
          {
            name: "Rénovation tomettes anciennes",
            options: [
              {
                label: "Restauraton tomettes traditionnelles",
                prix_ht: 75.0,
                unite: "m²",
                description: "Nettoyage profond, rejointement à la chaux, traitement hydrofuge et cire naturelle. Conservation du patrimoine.",
                image: ""
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Revêtement mur & plafond",
    icon: "Package",
    subcategories: [
      {
        name: "Peinture & papiers peints",
        items: [
          {
            name: "Peinture intérieure complète",
            options: [
              {
                label: "Peinture murs et plafonds - finition mate/satinée",
                prix_ht: 15.0,
                unite: "m²",
                description: "Prestation complète incluant préparation des supports, protection des sols, application de 2 couches de peinture acrylique haut de gamme et finition professionnelle.",
                image: ""
              }
            ]
          },
          {
            name: "Toile de verre",
            options: [
              {
                label: "Pose toile de verre avec finition peinte",
                prix_ht: 28.0,
                unite: "m²",
                description: "Application professionnelle de toile de verre sur murs et plafonds, incluant préparation du support, colle spécifique et finition peinte sur mesure.",
                image: ""
              }
            ]
          },
          {
            name: "Pose papier peint",
            options: [
              {
                label: "Pose papier peint intissé ou vinyle",
                prix_ht: 22.0,
                unite: "m²",
                description: "Pose experte avec préparation murale parfaite, encollage et lissage professionnel pour un résultat sans bulle ni défaut. Découpes précises incluses.",
                image: ""
              }
            ]
          },
          {
            name: "Peinture éléments spécifiques",
            options: [
              {
                label: "Peinture portes/radiateurs/fenêtres",
                prix_ht: 85.0,
                unite: "unité",
                description: "Rénovation complète incluant décapage si nécessaire, ponçage, application peinture spécifique (thermorésistante pour radiateurs) et finition durable.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Carrelage mural",
        items: [
          {
            name: "Pose faïence salle de bain",
            options: [
              {
                label: "Carrelage mural standard (20x25 à 30x60cm)",
                prix_ht: 65.0,
                unite: "m²",
                description: "Pose technique avec étanchéité intégrale, joints hydrofuges et finitions parfaites pour douches et baignoires. Choix de pose droit/diagonal.",
                image: ""
              }
            ]
          },
          {
            name: "Mosaïque murale décorative",
            options: [
              {
                label: "Pose mosaïque verre/pierre",
                prix_ht: 95.0,
                unite: "m²",
                description: "Travail artisanal pour créations uniques avec calepinage personnalisé, joints colorés au choix et traitement hydrofuge renforcé.",
                image: ""
              }
            ]
          },
          {
            name: "Carreaux de ciment mural",
            options: [
              {
                label: "Pose carreaux de ciment décoratifs",
                prix_ht: 110.0,
                unite: "m²",
                description: "Installation experte avec traitement imperméabilisant avant et après pose pour espaces humides. Finition cire naturelle incluse.",
                image: ""
              }
            ]
          },
          {
            name: "Finition carrelage",
            options: [
              {
                label: "Pose baguettes et profilés",
                prix_ht: 18.0,
                unite: "ml",
                description: "Installation de profilés aluminium ou PVC pour finitions parfaites (angles, transitions). Large choix de coloris disponible.",
                image: ""
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Menuiseries Intérieures Haut de Gamme",
    icon: "Cabinet",
    subcategories: [
      {
        name: "Mobilier Sur-Mesure",
        items: [
          {
            name: "Dressing Complet",
            options: [
              {
                label: "Dressing intégré haut de gamme",
                prix_ht: 450.0,
                unite: "ml",
                description: "Solution clé en main comprenant : structure en MDF/massif, portes coulissantes ou battantes, système d'éclairage LED intégré, rangements modulables et finition laquée/bois noble. Livraison et pose incluses."
              }
            ]
          },
          {
            name: "Bibliothèque Design",
            options: [
              {
                label: "Bibliothèque sur-mesure",
                prix_ht: 380.0,
                unite: "ml",
                description: "Création unique avec niches intégrées, éclairage LED, étagères réglables et possibilité de portes vitrées. Finition au choix : peinture haute résistance ou placage bois massif."
              }
            ]
          },
          {
            name: "Cuisine Aménagée",
            options: [
              {
                label: "Meuble cuisine intégré",
                prix_ht: 650.0,
                unite: "ml",
                description: "Aménagement complet avec façades sur-mesure, tiroirs à fermeture amortie, plans de travail en quartz/composite et intégration d'électroménager. 3 finitions au choix."
              }
            ]
          }
        ]
      },
      {
        name: "Portes Intérieures",
        items: [
          {
            name: "Portes Standards",
            options: [
              {
                label: "Porte pleine ou vitrée",
                prix_ht: 850.0,
                unite: "unité",
                description: "Porte en bois massif ou alvéolaire avec quincaillerie premium (paumelles silencieuses, poignée design). Pose incluse avec réglage parfait et finitions."
              }
            ]
          },
          {
            name: "Portes Spéciales",
            options: [
              {
                label: "Porte acoustique/isotherme",
                prix_ht: 1250.0,
                unite: "unité",
                description: "Porte isolante phonique (jusqu'à 32dB) et thermique avec joints périphériques. Cadre renforcé et système de fermeture automatique optionnel."
              },
              {
                label: "Porte coulissante à galandage",
                prix_ht: 1800.0,
                unite: "unité",
                description: "Système coulissant intégré au mur avec mécanisme silencieux haut de gamme. Personnalisation des panneaux (verre, bois, laque)."
              }
            ]
          }
        ]
      },
      {
        name: "Cloisons & Séparations",
        items: [
          {
            name: "Verrières Design",
            options: [
              {
                label: "Verrière sur-mesure",
                prix_ht: 350.0,
                unite: "ml",
                description: "Structure aluminium/bois avec vitrage feuilleté ou verre dépoli. Intégration lumineuse LED possible. Montage par nos menuisiers experts."
              }
            ]
          },
          {
            name: "Cloisons Aménagées",
            options: [
              {
                label: "Cloison rangement intégré",
                prix_ht: 420.0,
                unite: "m²",
                description: "Solution 2-en-1 : séparation d'espace avec rangements intégrés (niches, étagères, portes coulissantes). Finition peinture ou plaquage bois."
              }
            ]
          }
        ]
      },
      {
        name: "Solutions Techniques",
        items: [
          {
            name: "Aménagements Complexes",
            options: [
              {
                label: "Intégration sous-pente/angle",
                prix_ht: 280.0,
                unite: "m²",
                description: "Optimisation d'espaces complexes avec solutions sur-mesure pour combles, niches ou structures irrégulières. Finitions professionnelles garanties."
              }
            ]
          },
          {
            name: "Éléments Premium",
            options: [
              {
                label: "Menuiserie laquée/mat",
                prix_ht: 320.0,
                unite: "m²",
                description: "Réalisation en atelier avec finition laque polyuréthane 6 couches ou effet mat velours. Garantie anti-rayures 5 ans."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Cuisine",
    icon: "Cabinet",
    subcategories: [
      {
        name: "Meubles et plan de travail",
        items: [
          {
            name: "Cuisine complète sur-mesure",
            options: [
              {
                label: "Cuisine équipée haut et bas avec plan de travail",
                prix_ht: 2500.0,
                unite: "ml",
                description: "Solution clé en main incluant meubles sur-mesure, plan de travail, pose professionnelle et finitions. Choix de matériaux (mélaminé, laqué, bois massif) et options d'amortisseurs inclus.",
                image: ""
              }
            ]
          },
          {
            name: "Plan de travail premium",
            options: [
              {
                label: "Plan de travail en quartz/granit ou bois massif",
                prix_ht: 350.0,
                unite: "ml",
                description: "Fabrication sur mesure avec découpe pour évier et plaque de cuisson, finition des chants et traitement hydrofuge/anti-taches pour le bois.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Équipements électroménagers",
        items: [
          {
            name: "Pack électroménager cuisine",
            options: [
              {
                label: "Pack complet haut de gamme (hotte, four, plaque, lave-vaisselle)",
                prix_ht: 4500.0,
                unite: "unité",
                description: "Ensemble d'électroménagers encastrables de classe énergétique A++ avec pose, raccordements et mise en service inclus. Garantie 2 ans.",
                image: ""
              }
            ]
          },
          {
            name: "Évier et robinetterie",
            options: [
              {
                label: "Évier céramique/inox avec mitigeur haut de gamme",
                prix_ht: 850.0,
                unite: "unité",
                description: "Installation complète incluant évier double bac, mitigeur avec douchette extractible, siphon et raccordements. Finition anti-taches et anti-calcaire.",
                image: ""
              }
            ]
          }
        ]
      },
      {
        name: "Pose et installation",
        items: [
          {
            name: "Installation complète",
            options: [
              {
                label: "Pose et raccordement de tous les éléments",
                prix_ht: 1800.0,
                unite: "unité",
                description: "Service complet incluant le montage des meubles, pose du plan de travail, installation des électroménagers et robinetterie avec tests de fonctionnement.",
                image: ""
              }
            ]
          },
          {
            name: "Rénovation cuisine existante",
            options: [
              {
                label: "Remplacement éléments sans gros œuvre",
                prix_ht: 1200.0,
                unite: "unité",
                description: "Dépose des anciens éléments et installation des nouveaux meubles/électroménagers en conservant les raccordements existants lorsque possible.",
                image: ""
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "VRD & Aménagements Extérieurs Premium",
    icon: "Building",
    subcategories: [
      {
        name: "Terrassement & Fondations",
        items: [
          {
            name: "Terrassement complet",
            options: [
              {
                label: "Terrassement mécanisé avec gestion des déblais",
                prix_ht: 45.0,
                unite: "m³",
                description: "Prestation complète incluant : piquetage topographique, décapage de terre végétale, terrassement à la pelle mécanique, évacuation des déblais (jusqu'à 30km), compactage et contrôle altimétrique laser. Adapté à tous types de sols."
              }
            ]
          },
          {
            name: "Fondations spécialisées",
            options: [
              {
                label: "Semelles filantes armées",
                prix_ht: 120.0,
                unite: "ml",
                description: "Réalisation de semelles filantes en béton armé (25x40cm) avec ferraillage HA500, coffrage perdu et contrôle géométrique. Convient pour murs porteurs et clôtures."
              }
            ]
          }
        ]
      },
      {
        name: "Réseaux Enterrés",
        items: [
          {
            name: "Réseaux humides complets",
            options: [
              {
                label: "Package eaux usées + pluviales",
                prix_ht: 95.0,
                unite: "ml",
                description: "Installation complète incluant : canalisations PVC Ø100/Ø125, regards béton, pentes contrôlées, remblaiement sélectif et tests d'étanchéité. Conforme aux DTU et normes sanitaires."
              }
            ]
          },
          {
            name: "Réseaux secs premium",
            options: [
              {
                label: "Gaine technique multi-réseaux",
                prix_ht: 65.0,
                unite: "ml",
                description: "Fourreau intégré pour électricité (TPC rouge Ø90), fibre optique (TPC verte Ø40) et irrigation avec regards de visite et repérage avertisseur. Pré-câblage optionnel."
              }
            ]
          }
        ]
      },
      {
        name: "Clôtures & Portails",
        items: [
          {
            name: "Clôture complète",
            options: [
              {
                label: "Clôture aluminium sur-mesure",
                prix_ht: 250.0,
                unite: "ml",
                description: "Clôture rigide en panneaux aluminium (hauteur 1.80m) avec poteaux scellés au béton, portillon intégré et finition thermolaquée RAL. Garantie 10 ans contre la corrosion."
              }
            ]
          },
          {
            name: "Portail motorisé",
            options: [
              {
                label: "Portail coulissant automatique",
                prix_ht: 3500.0,
                unite: "unité",
                description: "Portail aluminium coulissant de 4m avec motorisation silencieuse, télécommande, détecteurs de sécurité et éclairage LED intégré. Pose complète sur rail inox."
              }
            ]
          }
        ]
      },
      {
        name: "Aménagements Paysagers",
        items: [
          {
            name: "Terrasses haut de gamme",
            options: [
              {
                label: "Terrasse composite sur structure aluminium",
                prix_ht: 180.0,
                unite: "m²",
                description: "Pose de lames composite WPC (20x145mm) sur structure réglable antidéformation, avec fixation invisible et finition anti-UV. Large choix de coloris."
              }
            ]
          },
          {
            name: "Voirie & Accès",
            options: [
              {
                label: "Allée pavée drainante",
                prix_ht: 110.0,
                unite: "m²",
                description: "Allée en pavés béton (6cm) sur lit de sable compacté avec joints drainants, bordures acier et fondation grave-bitume. Résistante au gel et aux charges lourdes."
              }
            ]
          }
        ]
      },
      {
        name: "Équipements Techniques",
        items: [
          {
            name: "Gestion des eaux",
            options: [
              {
                label: "Puisard complet avec drainage",
                prix_ht: 1200.0,
                unite: "unité",
                description: "Puisard béton Ø1m avec géotextile, couvercle grillagé, regard de visite et réseau drainant périphérique. Solution clé en main pour problèmes d'infiltration."
              }
            ]
          },
          {
            name: "Bornes électriques",
            options: [
              {
                label: "Borne de recharge véhicule électrique",
                prix_ht: 2200.0,
                unite: "unité",
                description: "Borne wallbox 22kW avec gestion intelligente, certification IRVE, câble renforcé et disjoncteur différentiel 30mA. Installation complète avec mise en service."
              }
            ]
          }
        ]
      }
    ]
  }
];