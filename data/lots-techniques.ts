export interface LotOption {
  label: string;
  prix_ht: number;
  unite: string;
  description: string;
  tva: number;
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
                tva: 10,
                description: "Pose de bâches professionnelles ignifugées pour préserver vos sols et murs des éclaboussures, poussières et chocs. Un investissement essentiel pour éviter la détérioration et réduire les coûts de remise en état en fin de chantier.",
                image: ""
              },
              {
                label: "Protection des murs avec panneaux rigides",
                prix_ht: 9.5,
                unite: "m²",
                tva: 10,
                description: "Installation de panneaux rigides haute résistance pour protéger durablement vos murs des dégradations liées aux travaux. Garantie d'une finition sans dommage et d'un chantier sécurisé.",
                image: ""
              },
              {
                label: "Installation de tapis anti-poussière",
                prix_ht: 7.0,
                unite: "m²",
                tva: 10,
                description: "Mise en place de tapis anti-poussière professionnels pour limiter la propagation des salissures et faciliter le nettoyage des zones de passage à fort trafic.",
                image: ""
              },
              {
                label: "Signalisation de chantier intégrée",
                prix_ht: 6.0,
                unite: "unité",
                tva: 10,
                description: "Installation de panneaux de sécurité normalisés pour baliser efficacement le chantier et prévenir tout risque d'accident.",
                image: ""
              },
              {
                label: "Mise en place de barrières temporaires",
                prix_ht: 8.0,
                unite: "ml",
                tva: 10,
                description: "Installation de barrières temporaires robustes pour délimiter clairement les zones à risque et assurer la sécurité du chantier.",
                image: ""
              },
              {
                label: "Nettoyage régulier des zones protégées",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Nettoyage professionnel régulier des espaces protégés pour maintenir un environnement de travail propre et sécurisé tout au long du chantier.",
                image: ""
              },
              {
                label: "Protection des escaliers",
                prix_ht: 12.0,
                unite: "ml",
                tva: 10,
                description: "Protection complète des escaliers avec tapis antidérapants et protection des rampes pour éviter les dégradations.",
                image: ""
              },
              {
                label: "Film de protection pour vitres",
                prix_ht: 4.5,
                unite: "m²",
                tva: 10,
                description: "Application de film protecteur sur les vitres existantes pour éviter les projections et faciliter le nettoyage.",
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
                tva: 10,
                description: "Habillage des parois intérieures d'ascenseur avec mousse anti-choc de haute qualité pour prévenir toute détérioration lors des travaux.",
                image: ""
              },
              {
                label: "Protection des boutons et commandes",
                prix_ht: 22.0,
                unite: "unité",
                tva: 10,
                description: "Pose de protections renforcées sur boutons et commandes d'ascenseur, garantissant leur intégrité face aux manipulations répétées et aux chocs.",
                image: ""
              },
              {
                label: "Pose de tapis de sol renforcés",
                prix_ht: 7.0,
                unite: "m²",
                tva: 10,
                description: "Installation de tapis de sol anti-poussière renforcés, conçus pour résister aux passages intensifs dans les ascenseurs en chantier.",
                image: ""
              },
              {
                label: "Installation de bandes adhésives de sécurité",
                prix_ht: 60.0,
                unite: "unité",
                tva: 10,
                description: "Pose de bandes adhésives antidérapantes et visibles, conformes aux normes de sécurité, pour sécuriser l'accès et le sol de l'ascenseur.",
                image: ""
              },
              {
                label: "Nettoyage après chaque passage chantier",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Nettoyage minutieux des espaces protégés après chaque intervention pour garantir propreté et hygiène sur le chantier.",
                image: ""
              },
              {
                label: "Contrôle de l'intégrité de la protection",
                prix_ht: 22.0,
                unite: "unité",
                tva: 10,
                description: "Vérification régulière et contrôle qualité des protections mises en place pour assurer leur efficacité tout au long des travaux.",
                image: ""
              },
              {
                label: "Protection des miroirs",
                prix_ht: 18.0,
                unite: "unité",
                tva: 10,
                description: "Protection spécifique des miroirs d'ascenseur avec films adhésifs résistants aux chocs.",
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
                tva: 10,
                description: "Protection complète pour surfaces inférieures à 10 m² avec matériaux premium garantissant une haute résistance aux agressions du chantier.",
                image: ""
              },
              {
                label: "Surface 10 à 30 m²",
                prix_ht: 23.0,
                unite: "m²",
                tva: 10,
                description: "Protection dédiée aux surfaces moyennes, avec des matériaux robustes et durables adaptés aux contraintes des zones intensément fréquentées.",
                image: ""
              },
              {
                label: "Surface > 30 m²",
                prix_ht: 20.0,
                unite: "m²",
                tva: 10,
                description: "Protection économique pour grandes surfaces avec matériaux adaptés aux chantiers de longue durée.",
                image: ""
              },
              {
                label: "Protection parquet massif",
                prix_ht: 35.0,
                unite: "m²",
                tva: 10,
                description: "Protection spécialisée pour parquets anciens ou de valeur avec matériaux respirants et anti-rayures.",
                image: ""
              },
              {
                label: "Protection carrelage délicat",
                prix_ht: 28.0,
                unite: "m²",
                tva: 10,
                description: "Protection renforcée pour carrelages fragiles, marbre ou pierre naturelle avec système anti-choc.",
                image: ""
              },
              {
                label: "Pose droite",
                prix_ht: 50.0,
                unite: "unité",
                tva: 10,
                description: "Pose soignée d'éléments de protection selon les normes strictes pour garantir une finition impeccable et une durabilité optimale.",
                image: ""
              },
              {
                label: "Pose en diagonale",
                prix_ht: 55.0,
                unite: "unité",
                tva: 10,
                description: "Installation précise et esthétique d'éléments en diagonale, alliant protection renforcée et finition professionnelle pour vos sols.",
                image: ""
              },
              {
                label: "Joint hydrofuge",
                prix_ht: 22.0,
                unite: "unité",
                tva: 10,
                description: "Application de joints hydrofuges performants pour protéger efficacement les sols contre l'humidité et les infiltrations durant le chantier.",
                image: ""
              },
              {
                label: "Plinthes assorties incluses",
                prix_ht: 25.0,
                unite: "unité",
                tva: 10,
                description: "Fourniture et pose de plinthes assorties pour une protection complète des finitions murales et un rendu esthétique soigné.",
                image: ""
              }
            ]
          },
          {
            name: "Protection mobilier et équipements",
            options: [
              {
                label: "Bâchage mobilier sur place",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Protection du mobilier existant avec bâches étanches et respirantes pour éviter condensation et dégradations.",
                image: ""
              },
              {
                label: "Protection radiateurs et convecteurs",
                prix_ht: 25.0,
                unite: "unité",
                tva: 10,
                description: "Habillage spécifique des radiateurs pour éviter les projections de peinture et plâtre.",
                image: ""
              },
              {
                label: "Protection luminaires",
                prix_ht: 18.0,
                unite: "unité",
                tva: 10,
                description: "Protection des luminaires existants avec films plastiques et supports adaptés.",
                image: ""
              },
              {
                label: "Protection cuisine équipée",
                prix_ht: 180.0,
                unite: "forfait",
                tva: 10,
                description: "Protection complète d'une cuisine équipée : électroménager, plan de travail, façades.",
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
                tva: 10,
                description: "Livraison professionnelle du matériel directement sur le chantier, assurant un acheminement sécurisé et rapide à pied d'œuvre.",
                image: ""
              },
              {
                label: "Utilisation de monte-charge si nécessaire",
                prix_ht: 30.0,
                unite: "unité",
                tva: 10,
                description: "Mise à disposition d'un monte-charge adapté pour faciliter le transport du matériel en hauteur, garantissant sécurité et efficacité.",
                image: ""
              },
              {
                label: "Repli et nettoyage du matériel après chantier",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Repli organisé et nettoyage complet du matériel utilisé, afin de maintenir la propreté du chantier et la bonne conservation des équipements.",
                image: ""
              },
              {
                label: "Stockage sécurisé du matériel sur site",
                prix_ht: 25.0,
                unite: "unité",
                tva: 10,
                description: "Mise en place d'un espace de stockage sécurisé pour protéger le matériel contre le vol et les dégradations pendant le chantier.",
                image: ""
              },
              {
                label: "Gestion des horaires de livraison",
                prix_ht: 25.0,
                unite: "unité",
                tva: 10,
                description: "Organisation rigoureuse des horaires de livraison pour optimiser la logistique et réduire les interruptions sur le chantier.",
                image: ""
              },
              {
                label: "Coordination avec les autres corps de métier",
                prix_ht: 30.0,
                unite: "unité",
                tva: 10,
                description: "Gestion proactive et coordination fluide avec les autres intervenants pour assurer une progression harmonieuse des travaux.",
                image: ""
              },
              {
                label: "Transport matériaux lourds",
                prix_ht: 45.0,
                unite: "unité",
                tva: 10,
                description: "Transport spécialisé pour matériaux lourds (carrelage, sanitaires, radiateurs) avec matériel de manutention adapté.",
                image: ""
              },
              {
                label: "Livraison étages sans ascenseur",
                prix_ht: 35.0,
                unite: "étage",
                tva: 10,
                description: "Supplément pour montée manuelle du matériel dans les étages sans ascenseur.",
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
                tva: 10,
                description: "Collecte et évacuation professionnelle des déchets et gravats, garantissant un chantier propre et conforme aux normes environnementales.",
                image: ""
              },
              {
                label: "Dépoussiérage des surfaces et équipements",
                prix_ht: 22.0,
                unite: "unité",
                tva: 10,
                description: "Nettoyage minutieux des surfaces et équipements pour éliminer poussières et salissures, préparant la réception des travaux.",
                image: ""
              },
              {
                label: "Nettoyage des sols avant réception",
                prix_ht: 18.0,
                unite: "m²",
                tva: 10,
                description: "Nettoyage professionnel des sols en fin de chantier pour garantir une présentation impeccable avant la remise des clés.",
                image: ""
              },
              {
                label: "Gestion des déchets recyclables",
                prix_ht: 28.0,
                unite: "unité",
                tva: 10,
                description: "Tri et gestion rigoureuse des déchets recyclables selon les normes en vigueur pour un chantier respectueux de l'environnement.",
                image: ""
              },
              {
                label: "Fourniture de sacs et containers adaptés",
                prix_ht: 35.0,
                unite: "unité",
                tva: 10,
                description: "Fourniture de sacs et containers professionnels adaptés pour faciliter la collecte et le tri des déchets sur chantier.",
                image: ""
              },
              {
                label: "Respect des normes environnementales",
                prix_ht: 25.0,
                unite: "unité",
                tva: 10,
                description: "Assurance du respect strict des normes environnementales durant toutes les opérations de nettoyage et de gestion des déchets.",
                image: ""
              },
              {
                label: "Nettoyage vitres et surfaces vitrées",
                prix_ht: 8.0,
                unite: "m²",
                tva: 10,
                description: "Nettoyage professionnel des vitres et surfaces vitrées avec produits spécialisés sans traces.",
                image: ""
              },
              {
                label: "Aspiration poussières fines",
                prix_ht: 12.0,
                unite: "m²",
                tva: 10,
                description: "Aspiration spécialisée des poussières fines avec aspirateur HEPA pour finition parfaite.",
                image: ""
              },
              {
                label: "Nettoyage de fin de chantier complet",
                prix_ht: 25.0,
                unite: "m²",
                tva: 10,
                description: "Nettoyage complet incluant sols, murs, plafonds, équipements et évacuation de tous déchets.",
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
                tva: 10,
                description: "Location d'échafaudage conforme aux normes, adapté à vos besoins pour garantir sécurité et facilité d'accès aux zones de travail.",
                image: ""
              },
              {
                label: "Montage et démontage par personnel qualifié",
                prix_ht: 35.0,
                unite: "unité",
                tva: 10,
                description: "Montage et démontage réalisés par des techniciens qualifiés, garantissant une installation fiable et conforme aux exigences de sécurité.",
                image: ""
              },
              {
                label: "Installation d'échafaudage roulant si besoin",
                prix_ht: 65.0,
                unite: "unité",
                tva: 10,
                description: "Mise à disposition et installation d'échafaudage roulant performant pour faciliter les déplacements et sécuriser les interventions en hauteur.",
                image: ""
              },
              {
                label: "Vérification de la stabilité et sécurité",
                prix_ht: 25.0,
                unite: "unité",
                tva: 10,
                description: "Contrôle rigoureux de la stabilité et des dispositifs de sécurité de l'échafaudage tout au long du chantier.",
                image: ""
              },
              {
                label: "Mise en place de garde-corps et filets",
                prix_ht: 28.0,
                unite: "unité",
                tva: 10,
                description: "Installation de garde-corps et filets de protection conformes aux normes pour prévenir les chutes et accidents.",
                image: ""
              },
              {
                label: "Conformité aux normes de sécurité en vigueur",
                prix_ht: 28.0,
                unite: "unité",
                tva: 10,
                description: "Garantir la conformité totale de l'échafaudage aux normes de sécurité en vigueur, assurant la protection des intervenants.",
                image: ""
              },
              {
                label: "Échafaudage de façade complet",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Échafaudage de façade avec planchers, garde-corps et bâches de protection pour travaux extérieurs.",
                image: ""
              },
              {
                label: "Tour d'échafaudage mobile",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Tour mobile pour travaux ponctuels en hauteur, montage et démontage inclus.",
                image: ""
              }
            ]
          },
          {
            name: "Outillage et équipements",
            options: [
              {
                label: "Location outillage électroportatif",
                prix_ht: 25.0,
                unite: "jour",
                tva: 10,
                description: "Mise à disposition d'outillage professionnel : perceuses, meuleuses, scies, ponceuses.",
                image: ""
              },
              {
                label: "Location compresseur et outillage pneumatique",
                prix_ht: 45.0,
                unite: "jour",
                tva: 10,
                description: "Compresseur avec cloueurs, agrafeuses et pistolets à peinture pour travaux spécialisés.",
                image: ""
              },
              {
                label: "Location bétonnière et malaxeur",
                prix_ht: 35.0,
                unite: "jour",
                tva: 10,
                description: "Équipement pour préparation de mortiers et bétons sur chantier.",
                image: ""
              },
              {
                label: "Groupe électrogène de chantier",
                prix_ht: 55.0,
                unite: "jour",
                tva: 10,
                description: "Alimentation électrique autonome pour chantiers sans raccordement.",
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
                tva: 10,
                description: "Transport sécurisé et rapide des déchets sur site grâce à un camion benne adapté, facilitant leur évacuation vers la déchetterie.",
                image: ""
              },
              {
                label: "Tri des déchets en amont",
                prix_ht: 30.0,
                unite: "unité",
                tva: 10,
                description: "Tri rigoureux des déchets à la source pour optimiser leur valorisation et réduire les coûts d'élimination.",
                image: ""
              },
              {
                label: "Ramassage et évacuation rapides",
                prix_ht: 35.0,
                unite: "unité",
                tva: 10,
                description: "Service efficace de ramassage et évacuation des déchets pour maintenir un chantier propre et sécurisé.",
                image: ""
              },
              {
                label: "Respect des horaires d'ouverture",
                prix_ht: 15.0,
                unite: "unité",
                tva: 10,
                description: "Organisation de l'évacuation des déchets en respectant strictement les horaires d'ouverture des déchetteries locales.",
                image: ""
              },
              {
                label: "Réduction des allers-retours",
                prix_ht: 20.0,
                unite: "unité",
                tva: 10,
                description: "Optimisation des trajets pour minimiser les allers-retours et réduire les coûts et nuisances liées au transport des déchets.",
                image: ""
              },
              {
                label: "Gestion des déchets dangereux séparée",
                prix_ht: 50.0,
                unite: "unité",
                tva: 10,
                description: "Gestion spécialisée et conforme des déchets dangereux, assurant leur traitement sécurisé et respectueux des normes en vigueur.",
                image: ""
              },
              {
                label: "Évacuation gravats inertes",
                prix_ht: 25.0,
                unite: "m³",
                tva: 10,
                description: "Évacuation spécialisée des gravats inertes (béton, briques, tuiles) vers centres de recyclage agréés.",
                image: ""
              },
              {
                label: "Évacuation déchets verts",
                prix_ht: 35.0,
                unite: "m³",
                tva: 10,
                description: "Collecte et évacuation des déchets verts vers plateformes de compostage.",
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
                tva: 10,
                description: "Utilisation de bennes robustes et adaptées aux terrains difficiles pour garantir une évacuation sans encombre des déchets.",
                image: ""
              },
              {
                label: "Manutention manuelle avec chariots",
                prix_ht: 40.0,
                unite: "unité",
                tva: 10,
                description: "Manutention sécurisée et efficace des déchets à l'aide de chariots, adaptée aux accès difficiles ou étroits.",
                image: ""
              },
              {
                label: "Coordination avec services locaux",
                prix_ht: 30.0,
                unite: "unité",
                tva: 10,
                description: "Organisation en collaboration avec les services locaux pour assurer la bonne gestion des déchets en zone difficile d'accès.",
                image: ""
              },
              {
                label: "Planification des passages selon accessibilité",
                prix_ht: 25.0,
                unite: "unité",
                tva: 10,
                description: "Planification précise des passages pour optimiser les déplacements et éviter les retards liés à l'accessibilité.",
                image: ""
              },
              {
                label: "Utilisation d'engins légers type mini-chargeuse",
                prix_ht: 60.0,
                unite: "unité",
                tva: 10,
                description: "Emploi d'engins légers spécialisés comme la mini-chargeuse pour faciliter la manutention dans les zones difficiles d'accès.",
                image: ""
              },
              {
                label: "Formation spécifique du personnel",
                prix_ht: 35.0,
                unite: "unité",
                tva: 10,
                description: "Formation dédiée du personnel aux contraintes et techniques spécifiques à la gestion des déchets en zones complexes.",
                image: ""
              },
              {
                label: "Transport par sacs étanches",
                prix_ht: 45.0,
                unite: "unité",
                tva: 10,
                description: "Conditionnement en sacs étanches pour transport manuel dans les zones inaccessibles aux véhicules.",
                image: ""
              },
              {
                label: "Évacuation par monte-matériaux",
                prix_ht: 65.0,
                unite: "unité",
                tva: 10,
                description: "Utilisation de monte-matériaux pour évacuation verticale des déchets en immeuble.",
                image: ""
              }
            ]
          },
          {
            name: "Gestion spécialisée des déchets",
            options: [
              {
                label: "Évacuation amiante (sous-traitance spécialisée)",
                prix_ht: 150.0,
                unite: "m²",
                tva: 10,
                description: "Évacuation sécurisée de matériaux amiantés par entreprise certifiée avec toutes les précautions réglementaires.",
                image: ""
              },
              {
                label: "Évacuation plomb (peintures anciennes)",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Traitement et évacuation sécurisée des déchets contenant du plomb selon protocole spécialisé.",
                image: ""
              },
              {
                label: "Recyclage métaux ferreux et non ferreux",
                prix_ht: 15.0,
                unite: "kg",
                tva: 10,
                description: "Collecte et valorisation des métaux avec possibilité de rachat selon cours du marché.",
                image: ""
              },
              {
                label: "Évacuation équipements électroniques",
                prix_ht: 25.0,
                unite: "unité",
                tva: 10,
                description: "Collecte et traitement des DEEE (Déchets d'Équipements Électriques et Électroniques).",
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
                tva: 20,
                description: "Prise de photos professionnelles pour documenter l'état des lieux avant le démarrage des travaux, garantissant une preuve incontestable.",
                image: ""
              },
              {
                label: "Rédaction d'un rapport détaillé",
                prix_ht: 150.0,
                unite: "unité",
                tva: 20,
                description: "Élaboration d'un rapport complet et formel d'état des lieux, indispensable en cas de litige ou pour suivi précis du chantier.",
                image: ""
              },
              {
                label: "Présence sur site le jour du constat",
                prix_ht: 120.0,
                unite: "unité",
                tva: 20,
                description: "Assistance et supervision sur site par un huissier le jour du constat, garantissant la validité juridique des observations.",
                image: ""
              },
              {
                label: "Archivage sécurisé des documents",
                prix_ht: 50.0,
                unite: "unité",
                tva: 20,
                description: "Archivage sécurisé et confidentiel des documents et preuves, accessible à tout moment en cas de besoin juridique.",
                image: ""
              },
              {
                label: "Transmission au client et intervenants",
                prix_ht: 40.0,
                unite: "unité",
                tva: 20,
                description: "Transmission rapide et sécurisée des rapports aux clients et intervenants, facilitant la communication et la prise de décision.",
                image: ""
              },
              {
                label: "Gestion des litiges éventuels",
                prix_ht: 200.0,
                unite: "unité",
                tva: 20,
                description: "Intervention et accompagnement spécialisés pour la gestion et résolution des litiges liés aux constatations d'état des lieux.",
                image: ""
              },
              {
                label: "Constat contradictoire avec voisinage",
                prix_ht: 180.0,
                unite: "unité",
                tva: 20,
                description: "Constat réalisé en présence des voisins pour documenter l'état avant travaux et prévenir les litiges.",
                image: ""
              },
              {
                label: "Constat de fin de travaux",
                prix_ht: 120.0,
                unite: "unité",
                tva: 20,
                description: "Documentation de l'état final des travaux pour validation de la conformité et réception.",
                image: ""
              }
            ]
          },
          {
            name: "Études et diagnostics",
            options: [
              {
                label: "Diagnostic technique avant travaux",
                prix_ht: 350.0,
                unite: "unité",
                tva: 20,
                description: "Analyse complète de l'existant pour identifier les contraintes techniques et optimiser les travaux.",
                image: ""
              },
              {
                label: "Étude de faisabilité",
                prix_ht: 450.0,
                unite: "unité",
                tva: 20,
                description: "Étude approfondie de la faisabilité technique et réglementaire du projet de rénovation.",
                image: ""
              },
              {
                label: "Relevé de mesures précis",
                prix_ht: 180.0,
                unite: "unité",
                tva: 20,
                description: "Relevé dimensionnel précis des locaux pour optimisation des quantités et calepinage.",
                image: ""
              },
              {
                label: "Analyse de la structure existante",
                prix_ht: 650.0,
                unite: "unité",
                tva: 20,
                description: "Diagnostic structural par bureau d'études pour travaux touchant aux éléments porteurs.",
                image: ""
              }
            ]
          },
          {
            name: "Assurances et garanties",
            options: [
              {
                label: "Extension de garantie décennale",
                prix_ht: 2.5,
                unite: "% du montant HT",
                tva: 20,
                description: "Extension de la couverture décennale pour sécuriser l'investissement client.",
                image: ""
              },
              {
                label: "Assurance dommages-ouvrage",
                prix_ht: 1.8,
                unite: "% du montant HT",
                tva: 20,
                description: "Souscription d'une assurance dommages-ouvrage pour financement rapide des réparations.",
                image: ""
              },
              {
                label: "Garantie de parfait achèvement étendue",
                prix_ht: 1.2,
                unite: "% du montant HT",
                tva: 20,
                description: "Extension de la garantie de parfait achèvement à 2 ans au lieu d'1 an.",
                image: ""
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Démolition & Déposes",
    icon: "Hammer",
    subcategories: [
      {
        name: "Démolitions complètes et partielles",
        items: [
          {
            name: "Démolition salle de bain",
            options: [
              {
                label: "Démolition complète jusqu'à 25 m² (équipements inclus)",
                prix_ht: 350.0,
                unite: "forfait",
                tva: 10,
                description: "Démolition intégrale de la salle de bain (jusqu'à 25 m²), incluant le démontage des sanitaires, meubles, robinetterie, ainsi que l'évacuation des gravats. Travail réalisé avec soin, protection des zones non concernées incluse.",
                image: ""
              },
              {
                label: "Démolition carrelage au sol",
                prix_ht: 80.0,
                unite: "m²",
                tva: 10,
                description: "Dépose soignée du carrelage de sol avec outils adaptés. Comprend la protection des surfaces voisines et l'évacuation des débris en décharge agréée.",
                image: ""
              },
              {
                label: "Démolition faïence au mur",
                prix_ht: 90.0,
                unite: "m²",
                tva: 10,
                description: "Dépose des carreaux muraux avec précision afin de préserver au mieux le support existant. Gravats évacués dans le respect des normes.",
                image: ""
              },
              {
                label: "Chape allégée pour reprise de sol",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Réalisation d'une chape allégée (type ciment/vermiculite) pour rattrapage de niveau ou renforcement de sol. Support prêt à recevoir le nouveau revêtement.",
                image: ""
              },
              {
                label: "Reprise de mur en BA13",
                prix_ht: 70.0,
                unite: "m²",
                tva: 10,
                description: "Pose de plaques de plâtre BA13 pour habiller ou reprendre les murs après démolition. Finition propre et prête à peindre ou carreler.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 120.0,
                unite: "forfait",
                tva: 10,
                description: "Nettoyage, grattage, réparation ponctuelle et mise à niveau des supports muraux et sols en vue des travaux à venir. Finitions soignées.",
                image: ""
              },
              {
                label: "Démolition partielle (douche seule)",
                prix_ht: 180.0,
                unite: "forfait",
                tva: 10,
                description: "Démolition ciblée de la zone douche uniquement, préservation du reste de la salle de bain.",
                image: ""
              },
              {
                label: "Démolition avec récupération d'éléments",
                prix_ht: 280.0,
                unite: "forfait",
                tva: 10,
                description: "Démolition soignée permettant la récupération d'éléments réutilisables (robinetterie, miroirs, etc.).",
                image: ""
              }
            ]
          },
          {
            name: "Démolition cuisine",
            options: [
              {
                label: "Démolition complète jusqu'à 25 m² (meubles inclus)",
                prix_ht: 370.0,
                unite: "forfait",
                tva: 10,
                description: "Démontage complet de la cuisine (jusqu'à 25 m²) : dépose des meubles hauts/bas, électroménager, évier, robinetterie et revêtements. Protection, tri des déchets et évacuation compris.",
                image: ""
              },
              {
                label: "Démolition carrelage au sol",
                prix_ht: 80.0,
                unite: "m²",
                tva: 10,
                description: "Dépose manuelle ou mécanique du carrelage existant avec évacuation des débris. Travail propre et sécurisé.",
                image: ""
              },
              {
                label: "Démolition de la crédence",
                prix_ht: 50.0,
                unite: "mètre linéaire",
                tva: 10,
                description: "Dépose soignée de la crédence murale (carrelage, verre, inox ou stratifié). Les surfaces sont protégées et prêtes à être reprises ou remplacées.",
                image: ""
              },
              {
                label: "Chape allégée pour reprise de sol",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Mise en œuvre d'une chape légère pour niveler un sol irrégulier ou abîmé. Préparation optimale pour les futurs revêtements.",
                image: ""
              },
              {
                label: "Reprise de mur en BA13",
                prix_ht: 70.0,
                unite: "m²",
                tva: 10,
                description: "Reconstruction ou habillage des murs avec BA13 après dépose d'éléments muraux ou détérioration. Prêt à peindre ou carreler.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 130.0,
                unite: "forfait",
                tva: 10,
                description: "Nettoyage, rebouchage et préparation des surfaces horizontales et verticales. Intervention idéale pour une rénovation dans les règles de l'art.",
                image: ""
              },
              {
                label: "Démontage électroménager encastrable",
                prix_ht: 150.0,
                unite: "forfait",
                tva: 10,
                description: "Déconnexion et démontage soigneux de l'électroménager encastrable avec possibilité de récupération.",
                image: ""
              },
              {
                label: "Dépose plan de travail et évier",
                prix_ht: 120.0,
                unite: "forfait",
                tva: 10,
                description: "Dépose du plan de travail et de l'évier avec déconnexion des arrivées d'eau et évacuations.",
                image: ""
              },
              {
                label: "Démolition îlot central",
                prix_ht: 250.0,
                unite: "forfait",
                tva: 10,
                description: "Démolition complète d'un îlot central avec déconnexion des réseaux et évacuation.",
                image: ""
              }
            ]
          },
          {
            name: "Démolition plancher",
            options: [
              {
                label: "Démolition plancher bois",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Dépose complète d'un plancher en bois, incluant le retrait des lames et lambourdes. Enlèvement des gravats inclus.",
                image: ""
              },
              {
                label: "Démolition plancher béton",
                prix_ht: 120.0,
                unite: "m²",
                tva: 10,
                description: "Démolition d'un plancher en béton armé ou non, avec matériels adaptés. Évacuation comprise.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 140.0,
                unite: "forfait",
                tva: 10,
                description: "Mise en propreté, dégagement des zones concernées, et ajustements éventuels pour préparation d'une nouvelle dalle ou autre structure.",
                image: ""
              },
              {
                label: "Démolition plancher OSB/aggloméré",
                prix_ht: 75.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de plancher en panneaux OSB ou aggloméré avec structure porteuse.",
                image: ""
              },
              {
                label: "Démolition plancher collaborant",
                prix_ht: 140.0,
                unite: "m²",
                tva: 10,
                description: "Démolition de plancher collaborant acier-béton avec découpe spécialisée.",
                image: ""
              },
              {
                label: "Renforcement provisoire pendant démolition",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Mise en place d'étaiement provisoire pour sécuriser la démolition de plancher.",
                image: ""
              }
            ]
          },
          {
            name: "Démolition cloison placo",
            options: [
              {
                label: "Démolition placo (25 m² max)",
                prix_ht: 100.0,
                unite: "forfait",
                tva: 10,
                description: "Dépose de cloisons en plaques de plâtre (BA13) avec ossature métallique ou bois. Gravats triés et évacués. Zone de travail sécurisée.",
                image: ""
              },
              {
                label: "Démolition carreaux de plâtre",
                prix_ht: 110.0,
                unite: "m²",
                tva: 10,
                description: "Démolition de cloisons constituées de carreaux de plâtre, y compris évacuation. Opération réalisée avec le matériel adapté.",
                image: ""
              },
              {
                label: "Raccord de plâtrerie",
                prix_ht: 60.0,
                unite: "mètre linéaire",
                tva: 10,
                description: "Réalisation de raccords en plâtre pour boucher les saignées, ajuster les murs ou réparer les zones abîmées suite à la démolition.",
                image: ""
              },
              {
                label: "Reprise de sol",
                prix_ht: 70.0,
                unite: "m²",
                tva: 10,
                description: "Nivellement et réparation du sol après dépose de cloison. Prêt à recevoir un nouveau revêtement.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 90.0,
                unite: "forfait",
                tva: 10,
                description: "Nettoyage complet, mise en propreté et réparation localisée des zones touchées pour une continuité parfaite avec le reste du chantier.",
                image: ""
              },
              {
                label: "Démolition cloison hydrofuge",
                prix_ht: 120.0,
                unite: "m²",
                tva: 10,
                description: "Démolition de cloisons en plaques hydrofuges (salles d'eau) avec précautions particulières.",
                image: ""
              },
              {
                label: "Démolition cloison avec isolation",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de cloisons avec isolation phonique ou thermique intégrée.",
                image: ""
              },
              {
                label: "Récupération ossature métallique",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Démolition soignée permettant la récupération de l'ossature métallique pour réutilisation.",
                image: ""
              }
            ]
          },
          {
            name: "Démolition maçonnerie",
            options: [
              {
                label: "Démolition mur en béton cellulaire",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Démolition de mur en béton cellulaire avec évacuation des gravats.",
                image: ""
              },
              {
                label: "Démolition mur en brique",
                prix_ht: 110.0,
                unite: "m²",
                tva: 10,
                description: "Démolition de mur en briques pleuses ou creuses avec tri des matériaux.",
                image: ""
              },
              {
                label: "Démolition mur en parpaing",
                prix_ht: 105.0,
                unite: "m²",
                tva: 10,
                description: "Démolition de mur en blocs béton avec évacuation et tri des gravats.",
                image: ""
              },
              {
                label: "Démolition mur en pierre",
                prix_ht: 150.0,
                unite: "m²",
                tva: 10,
                description: "Démolition délicate de mur en pierre avec possibilité de récupération des matériaux.",
                image: ""
              },
              {
                label: "Ouverture dans mur porteur (étude incluse)",
                prix_ht: 850.0,
                unite: "m²",
                tva: 10,
                description: "Ouverture sécurisée dans mur porteur avec étude de structure et renforcement.",
                image: ""
              },
              {
                label: "Rebouchage d'ouverture",
                prix_ht: 180.0,
                unite: "m²",
                tva: 10,
                description: "Rebouchage d'ouverture existante avec maçonnerie assortie au mur existant.",
                image: ""
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
                tva: 10,
                description: "Démolition de murs porteurs avec étude technique et renforcement.",
                image: ""
              },
              {
                label: "Évacuation des gravats",
                prix_ht: 200.0,
                unite: "forfait",
                tva: 10,
                description: "Gestion et évacuation complète des gravats de murs porteurs.",
                image: ""
              },
              {
                label: "Protection chantier incluse",
                prix_ht: 100.0,
                unite: "forfait",
                tva: 10,
                description: "Mise en place des protections pour garantir la sécurité du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 250.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation des surfaces en vue des travaux de consolidation ou rénovation.",
                image: ""
              },
              {
                label: "Étude de structure préalable",
                prix_ht: 650.0,
                unite: "unité",
                tva: 20,
                description: "Étude structurelle obligatoire par bureau d'études avant intervention sur mur porteur.",
                image: ""
              },
              {
                label: "Pose de poutre de reprise",
                prix_ht: 350.0,
                unite: "ml",
                tva: 10,
                description: "Installation de poutre métallique ou béton pour reprendre les charges.",
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
                tva: 10,
                description: "Dépose complète de toiture, dépose des matériaux et préparation du support.",
                image: ""
              },
              {
                label: "Évacuation des gravats",
                prix_ht: 180.0,
                unite: "forfait",
                tva: 10,
                description: "Évacuation conforme des déchets issus de la dépose de toiture.",
                image: ""
              },
              {
                label: "Protection chantier incluse",
                prix_ht: 90.0,
                unite: "forfait",
                tva: 10,
                description: "Protection adaptée des zones avoisinantes pour éviter les dommages.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 200.0,
                unite: "forfait",
                tva: 10,
                description: "Nettoyage et préparation pour la pose d'une nouvelle toiture.",
                image: ""
              },
              {
                label: "Dépose tuiles avec tri et récupération",
                prix_ht: 25.0,
                unite: "m²",
                tva: 10,
                description: "Dépose soignée des tuiles avec tri pour récupération des éléments réutilisables.",
                image: ""
              },
              {
                label: "Dépose ardoises naturelles",
                prix_ht: 35.0,
                unite: "m²",
                tva: 10,
                description: "Dépose délicate d'ardoises naturelles avec récupération possible.",
                image: ""
              },
              {
                label: "Dépose isolation sous toiture",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Retrait de l'isolation existante sous toiture avec évacuation spécialisée.",
                image: ""
              }
            ]
          },
          {
            name: "Percements et ouvertures",
            options: [
              {
                label: "Percement pour fenêtre standard",
                prix_ht: 450.0,
                unite: "unité",
                tva: 10,
                description: "Percement d'ouverture pour fenêtre avec linteau et reprise des finitions.",
                image: ""
              },
              {
                label: "Percement pour porte",
                prix_ht: 380.0,
                unite: "unité",
                tva: 10,
                description: "Création d'ouverture pour porte avec seuil et habillage.",
                image: ""
              },
              {
                label: "Percement pour baie vitrée",
                prix_ht: 750.0,
                unite: "unité",
                tva: 10,
                description: "Ouverture grande dimension pour baie vitrée avec renforcement structural.",
                image: ""
              },
              {
                label: "Percement pour évacuation (VMC, hotte)",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Percement technique pour passage de gaines d'évacuation.",
                image: ""
              },
              {
                label: "Carottage béton (diamètre 100-200mm)",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Percement précis au carottier pour passage de canalisations.",
                image: ""
              },
              {
                label: "Saignée pour réseaux électriques",
                prix_ht: 25.0,
                unite: "ml",
                tva: 10,
                description: "Réalisation de saignées pour passage de câbles électriques.",
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
                tva: 10,
                description: "Dépose de fenêtres et portes-fenêtres, sans évacuation.",
                image: ""
              },
              {
                label: "Avec évacuation des gravats",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Dépose avec évacuation et élimination des déchets en conformité.",
                image: ""
              },
              {
                label: "Protection chantier incluse",
                prix_ht: 70.0,
                unite: "unité",
                tva: 10,
                description: "Installation des protections nécessaires pour éviter les dommages sur le chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 150.0,
                unite: "unité",
                tva: 10,
                description: "Nettoyage et préparation du support en vue de la pose de nouvelles menuiseries.",
                image: ""
              },
              {
                label: "Dépose avec récupération pour réemploi",
                prix_ht: 95.0,
                unite: "unité",
                tva: 10,
                description: "Dépose soignée permettant la récupération des menuiseries en bon état.",
                image: ""
              },
              {
                label: "Dépose fenêtre de toit",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Dépose spécialisée de fenêtre de toit avec reprise d'étanchéité provisoire.",
                image: ""
              },
              {
                label: "Dépose volets roulants intégrés",
                prix_ht: 220.0,
                unite: "unité",
                tva: 10,
                description: "Dépose complète de fenêtre avec volets roulants et coffre intégré.",
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
                tva: 10,
                description: "Dépose de porte d'entrée sans évacuation.",
                image: ""
              },
              {
                label: "Avec évacuation des gravats",
                prix_ht: 210.0,
                unite: "unité",
                tva: 10,
                description: "Dépose avec évacuation des gravats vers une décharge agréée.",
                image: ""
              },
              {
                label: "Protection chantier incluse",
                prix_ht: 80.0,
                unite: "unité",
                tva: 10,
                description: "Mise en place des protections pour protéger les alentours du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 170.0,
                unite: "unité",
                tva: 10,
                description: "Préparation complète du support pour faciliter la pose de la nouvelle porte.",
                image: ""
              },
              {
                label: "Dépose porte blindée",
                prix_ht: 280.0,
                unite: "unité",
                tva: 10,
                description: "Dépose spécialisée de porte blindée avec outillage adapté.",
                image: ""
              },
              {
                label: "Dépose avec conservation serrure",
                prix_ht: 160.0,
                unite: "unité",
                tva: 10,
                description: "Dépose soignée avec récupération de la serrure et quincaillerie.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose volets et protections",
            options: [
              {
                label: "Dépose volets battants bois",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de volets battants en bois avec quincaillerie.",
                image: ""
              },
              {
                label: "Dépose volets roulants",
                prix_ht: 150.0,
                unite: "unité",
                tva: 10,
                description: "Dépose complète de volets roulants avec coffre et mécanisme.",
                image: ""
              },
              {
                label: "Dépose stores extérieurs",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de stores bannes ou vénitiens extérieurs.",
                image: ""
              },
              {
                label: "Dépose grilles de protection",
                prix_ht: 95.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de grilles de sécurité avec découpe si nécessaire.",
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
                tva: 10,
                description: "Dépose complète du réseau d'eau sur une surface jusqu'à 25 m², incluant évacuation des gravats et protection chantier. Travaux réalisés selon les normes professionnelles pour assurer sécurité et propreté.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 80.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation et nettoyage du support après dépose, garantissant une finition soignée et conforme aux exigences du chantier.",
                image: ""
              },
              {
                label: "Dépose canalisations cuivre",
                prix_ht: 25.0,
                unite: "ml",
                tva: 10,
                description: "Dépose de canalisations cuivre avec récupération possible du métal.",
                image: ""
              },
              {
                label: "Dépose canalisations PER",
                prix_ht: 18.0,
                unite: "ml",
                tva: 10,
                description: "Dépose de canalisations PER avec évacuation spécialisée.",
                image: ""
              },
              {
                label: "Dépose collecteur et nourrice",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Dépose du collecteur principal et des nourrices de distribution.",
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
                tva: 10,
                description: "Dépose complète des canalisations gaz avec évacuation des gravats et protection du chantier, réalisée selon les normes de sécurité gaz.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 90.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation et nettoyage du support après dépose pour garantir un chantier propre et prêt à la suite des travaux.",
                image: ""
              },
              {
                label: "Neutralisation arrivée gaz",
                prix_ht: 150.0,
                unite: "unité",
                tva: 10,
                description: "Neutralisation sécurisée de l'arrivée gaz par professionnel agréé.",
                image: ""
              },
              {
                label: "Dépose compteur gaz (avec GrDF)",
                prix_ht: 200.0,
                unite: "unité",
                tva: 10,
                description: "Coordination avec GrDF pour dépose du compteur gaz.",
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
                tva: 10,
                description: "Dépose du tableau électrique incluant évacuation des gravats et protection chantier, réalisée dans le respect des normes électriques et de sécurité.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 85.0,
                unite: "forfait",
                tva: 10,
                description: "Nettoyage et préparation du support après dépose pour garantir une finition propre et conforme.",
                image: ""
              },
              {
                label: "Dépose ancien tableau à fusibles",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Dépose d'ancien tableau à fusibles avec mise en sécurité.",
                image: ""
              },
              {
                label: "Récupération disjoncteurs réutilisables",
                prix_ht: 45.0,
                unite: "forfait",
                tva: 10,
                description: "Dépose soignée avec récupération des disjoncteurs en bon état.",
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
                tva: 10,
                description: "Dépose complète du réseau électrique incluant évacuation des gravats et protection chantier, conformément aux normes de sécurité électrique.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 85.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation du support après dépose pour garantir une finition soignée et durable.",
                image: ""
              },
              {
                label: "Dépose câblage apparent",
                prix_ht: 12.0,
                unite: "ml",
                tva: 10,
                description: "Dépose de câblage électrique apparent avec récupération du cuivre.",
                image: ""
              },
              {
                label: "Dépose gaines encastrées",
                prix_ht: 18.0,
                unite: "ml",
                tva: 10,
                description: "Dépose de gaines électriques encastrées avec rebouchage des saignées.",
                image: ""
              },
              {
                label: "Dépose prises et interrupteurs",
                prix_ht: 15.0,
                unite: "unité",
                tva: 10,
                description: "Dépose d'appareillage électrique avec rebouchage des boîtiers.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose réseaux communication",
            options: [
              {
                label: "Dépose réseau téléphonique",
                prix_ht: 85.0,
                unite: "forfait",
                tva: 10,
                description: "Dépose complète du réseau téléphonique avec prises et câblage.",
                image: ""
              },
              {
                label: "Dépose réseau informatique",
                prix_ht: 95.0,
                unite: "forfait",
                tva: 10,
                description: "Dépose du câblage réseau RJ45 et équipements associés.",
                image: ""
              },
              {
                label: "Dépose antenne TV/satellite",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Dépose d'antenne avec câblage et répartiteur.",
                image: ""
              },
              {
                label: "Dépose interphone/visiophone",
                prix_ht: 150.0,
                unite: "unité",
                tva: 10,
                description: "Dépose système d'interphonie avec câblage et platine de rue.",
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
                tva: 10,
                description: "Dépose complète de l'ancien équipement de chauffage, mise en service du nouveau et contrôle de conformité, assurant un fonctionnement optimal et conforme aux normes.",
                image: ""
              },
              {
                label: "Fourniture comprise",
                prix_ht: 40.0,
                unite: "forfait",
                tva: 10,
                description: "Fourniture de matériel ou produit prêt à l'emploi pour le réseau chauffage.",
                image: ""
              },
              {
                label: "Vidange complète du circuit",
                prix_ht: 120.0,
                unite: "forfait",
                tva: 10,
                description: "Vidange complète du circuit de chauffage avec récupération du fluide.",
                image: ""
              },
              {
                label: "Nettoyage et désembouage",
                prix_ht: 250.0,
                unite: "forfait",
                tva: 10,
                description: "Nettoyage complet du circuit avec produit désembouant.",
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
                tva: 10,
                description: "Dépose complète du chauffe-eau électrique avec évacuation des gravats et protection chantier. Travaux réalisés selon les normes électriques.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 85.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation et nettoyage du support après dépose du chauffe-eau pour assurer une finition propre.",
                image: ""
              },
              {
                label: "Dépose chauffe-eau 100L",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de chauffe-eau électrique 100L avec déconnexion électrique et hydraulique.",
                image: ""
              },
              {
                label: "Dépose chauffe-eau 200L et plus",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de chauffe-eau de grande capacité avec manutention spécialisée.",
                image: ""
              },
              {
                label: "Récupération pour recyclage",
                prix_ht: 25.0,
                unite: "unité",
                tva: 10,
                description: "Évacuation vers centre de recyclage agréé avec certificat.",
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
                tva: 10,
                description: "Dépose complète de la chaudière gaz avec évacuation des gravats et protection chantier, réalisée selon les normes de sécurité gaz.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 95.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation du support après dépose de la chaudière, garantissant un chantier propre et prêt à la suite des travaux.",
                image: ""
              },
              {
                label: "Dépose chaudière murale",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de chaudière murale avec déconnexion gaz et hydraulique sécurisée.",
                image: ""
              },
              {
                label: "Dépose chaudière au sol",
                prix_ht: 250.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de chaudière au sol avec manutention et évacuation.",
                image: ""
              },
              {
                label: "Dépose conduit de fumée",
                prix_ht: 85.0,
                unite: "ml",
                tva: 10,
                description: "Dépose du conduit de fumée avec rebouchage des traversées.",
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
                tva: 10,
                description: "Dépose complète de la chaudière fioul incluant évacuation des gravats et protection chantier, réalisée selon les normes en vigueur.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 95.0,
                unite: "forfait",
                tva: 10,
                description: "Nettoyage et préparation du support après dépose de la chaudière fioul pour garantir une finition soignée.",
                image: ""
              },
              {
                label: "Vidange et nettoyage cuve fioul",
                prix_ht: 450.0,
                unite: "unité",
                tva: 10,
                description: "Vidange complète et nettoyage de la cuve fioul par entreprise spécialisée.",
                image: ""
              },
              {
                label: "Dépose cuve fioul enterrée",
                prix_ht: 1200.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de cuve fioul enterrée avec dépollution du sol si nécessaire.",
                image: ""
              },
              {
                label: "Neutralisation cuve fioul",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Neutralisation de cuve fioul par remplissage de sable selon normes.",
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
                tva: 10,
                description: "Dépose complète du radiateur avec évacuation des gravats et protection du chantier, réalisée selon les normes de sécurité.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 75.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation du support après dépose du radiateur pour assurer un chantier propre et prêt à la suite.",
                image: ""
              },
              {
                label: "Dépose radiateur fonte",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de radiateur en fonte avec manutention spécialisée.",
                image: ""
              },
              {
                label: "Dépose radiateur acier",
                prix_ht: 65.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de radiateur acier avec vidange et déconnexion.",
                image: ""
              },
              {
                label: "Dépose convecteur électrique",
                prix_ht: 45.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de convecteur électrique avec déconnexion sécurisée.",
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
                tva: 10,
                description: "Dépose complète du sèche-serviette avec évacuation des gravats et protection chantier, dans le respect des normes.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 75.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation et nettoyage du support après dépose du sèche-serviette pour une finition soignée.",
                image: ""
              },
              {
                label: "Dépose sèche-serviette électrique",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de sèche-serviette électrique avec déconnexion sécurisée.",
                image: ""
              },
              {
                label: "Dépose sèche-serviette mixte",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de sèche-serviette mixte (eau + électrique) avec double déconnexion.",
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
                tva: 10,
                description: "Opération complète de dépose et repose du radiateur à eau incluant évacuation des gravats et protection chantier, réalisée selon les normes de sécurité et qualité.",
                image: ""
              },
              {
                label: "Préparation du support après intervention",
                prix_ht: 100.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation et nettoyage du support après dépose/repose pour assurer une finition durable et propre.",
                image: ""
              },
              {
                label: "Dépose/repose pour peinture mur",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Dépose temporaire pour permettre la peinture du mur, puis repose.",
                image: ""
              },
              {
                label: "Dépose/repose pour changement robinets",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Dépose temporaire pour remplacement des robinets thermostatiques.",
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
                tva: 10,
                description: "Dépose complète de la VMC incluant évacuation des gravats et protection chantier, réalisée selon les normes en vigueur.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 80.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation et nettoyage du support après dépose de la VMC pour garantir un chantier propre et conforme.",
                image: ""
              },
              {
                label: "Dépose VMC simple flux",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de VMC simple flux avec caisson et gaines.",
                image: ""
              },
              {
                label: "Dépose VMC double flux",
                prix_ht: 280.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de VMC double flux avec échangeur et réseau complet.",
                image: ""
              },
              {
                label: "Dépose gaines VMC",
                prix_ht: 25.0,
                unite: "ml",
                tva: 10,
                description: "Dépose des gaines VMC avec rebouchage des passages.",
                image: ""
              },
              {
                label: "Dépose bouches d'extraction",
                prix_ht: 35.0,
                unite: "unité",
                tva: 10,
                description: "Dépose des bouches d'extraction avec rebouchage des percements.",
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
                tva: 10,
                description: "Démolition complète de la cheminée avec évacuation des gravats et protection du chantier, dans le respect des règles de sécurité.",
                image: ""
              },
              {
                label: "Préparation du support après démolition",
                prix_ht: 120.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation et nettoyage du support après démolition, garantissant une surface propre et prête à la suite des travaux.",
                image: ""
              },
              {
                label: "Démolition foyer seul",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Démolition du foyer en conservant le conduit de fumée.",
                image: ""
              },
              {
                label: "Démolition conduit de fumée",
                prix_ht: 120.0,
                unite: "ml",
                tva: 10,
                description: "Démolition du conduit de fumée avec rebouchage des traversées.",
                image: ""
              },
              {
                label: "Récupération matériaux (pierres, briques)",
                prix_ht: 45.0,
                unite: "m³",
                tva: 10,
                description: "Démolition soignée avec récupération des matériaux nobles.",
                image: ""
              },
              {
                label: "Tubage ou neutralisation conduit",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Tubage ou neutralisation du conduit existant selon réglementation.",
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
                tva: 10,
                description: "Dépose complète de la baignoire incluant l'évacuation des gravats et la protection intégrale du chantier. Travaux réalisés selon les normes professionnelles pour garantir sécurité et propreté.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 45.0,
                unite: "forfait",
                tva: 10,
                description: "Nettoyage et préparation du support après dépose de la baignoire pour assurer une finition soignée et durable.",
                image: ""
              },
              {
                label: "Dépose baignoire fonte",
                prix_ht: 220.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de baignoire en fonte avec découpe et manutention spécialisée.",
                image: ""
              },
              {
                label: "Dépose baignoire acrylique",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Dépose soignée de baignoire acrylique pour éviter la casse.",
                image: ""
              },
              {
                label: "Dépose baignoire balnéo",
                prix_ht: 280.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de baignoire balnéothérapie avec déconnexion électrique et hydraulique.",
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
                tva: 10,
                description: "Dépose complète de la douche incluant évacuation des gravats et protection chantier, conformément aux normes en vigueur.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 45.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation et nettoyage du support après dépose de la douche pour garantir un chantier propre et prêt à la suite des travaux.",
                image: ""
              },
              {
                label: "Dépose receveur de douche",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Dépose du receveur avec déconnexion de l'évacuation.",
                image: ""
              },
              {
                label: "Dépose cabine de douche complète",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de cabine de douche intégrale avec parois et robinetterie.",
                image: ""
              },
              {
                label: "Dépose douche à l'italienne",
                prix_ht: 220.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de douche à l'italienne avec reprise d'étanchéité.",
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
                tva: 10,
                description: "Dépose complète du lavabo ou de la vasque incluant évacuation des gravats et protection chantier, réalisée dans le respect des normes sanitaires.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 40.0,
                unite: "forfait",
                tva: 10,
                description: "Nettoyage et préparation du support après dépose pour assurer une finition propre et durable.",
                image: ""
              },
              {
                label: "Dépose lavabo sur colonne",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de lavabo sur colonne avec robinetterie.",
                image: ""
              },
              {
                label: "Dépose vasque à poser",
                prix_ht: 65.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de vasque à poser avec plan de toilette.",
                image: ""
              },
              {
                label: "Dépose meuble vasque",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Dépose complète de meuble vasque avec plan et robinetterie.",
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
                tva: 10,
                description: "Dépose complète du WC avec évacuation des gravats et protection chantier, effectuée selon les normes d'hygiène et sécurité.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 40.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation du support après dépose pour garantir une finition soignée et un chantier propre.",
                image: ""
              },
              {
                label: "Dépose WC au sol",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de WC posé au sol avec évacuation horizontale.",
                image: ""
              },
              {
                label: "Dépose WC suspendu",
                prix_ht: 150.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de WC suspendu avec bâti-support et réservoir encastré.",
                image: ""
              },
              {
                label: "Dépose WC avec broyeur",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de WC avec broyeur intégré et déconnexion électrique.",
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
                tva: 10,
                description: "Dépose complète du bidet avec évacuation des gravats et protection chantier, réalisée selon les normes sanitaires en vigueur.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 40.0,
                unite: "forfait",
                tva: 10,
                description: "Nettoyage et préparation du support après dépose du bidet pour assurer une finition soignée.",
                image: ""
              },
              {
                label: "Dépose bidet sur colonne",
                prix_ht: 95.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de bidet sur colonne avec robinetterie complète.",
                image: ""
              },
              {
                label: "Dépose bidet suspendu",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de bidet suspendu avec bâti-support.",
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
                tva: 10,
                description: "Dépose complète de l'évier avec évacuation des gravats et protection chantier, dans le respect des normes sanitaires et professionnelles.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 40.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation et nettoyage du support après dépose pour garantir une finition propre et durable.",
                image: ""
              },
              {
                label: "Dépose évier inox",
                prix_ht: 95.0,
                unite: "unité",
                tva: 10,
                description: "Dépose d'évier inox avec récupération possible du matériau.",
                image: ""
              },
              {
                label: "Dépose évier céramique",
                prix_ht: 110.0,
                unite: "unité",
                tva: 10,
                description: "Dépose soignée d'évier céramique pour éviter la casse.",
                image: ""
              },
              {
                label: "Dépose évier avec broyeur",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Dépose d'évier équipé d'un broyeur avec déconnexion électrique.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose équipements spéciaux",
            options: [
              {
                label: "Dépose urinoir",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Dépose d'urinoir avec robinetterie et évacuation.",
                image: ""
              },
              {
                label: "Dépose lave-mains",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de lave-mains avec robinetterie intégrée.",
                image: ""
              },
              {
                label: "Dépose bac à laver",
                prix_ht: 150.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de bac à laver avec robinetterie et évacuation.",
                image: ""
              },
              {
                label: "Dépose spa ou jacuzzi",
                prix_ht: 850.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de spa avec déconnexion électrique et hydraulique complexe.",
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
                tva: 10,
                description: "Dépose complète du carrelage avec évacuation des gravats et protection chantier. Travaux effectués selon les normes pour garantir propreté et sécurité.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 50.0,
                unite: "forfait",
                tva: 10,
                description: "Nettoyage et préparation du support après dépose du carrelage, assurant une surface propre et prête à recevoir le nouveau revêtement.",
                image: ""
              },
              {
                label: "Dépose carrelage grand format",
                prix_ht: 35.0,
                unite: "m²",
                tva: 10,
                description: "Dépose spécialisée de carrelage grand format avec précautions particulières.",
                image: ""
              },
              {
                label: "Dépose carrelage ancien scellé",
                prix_ht: 45.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de carrelage ancien scellé au mortier, plus difficile à déposer.",
                image: ""
              },
              {
                label: "Récupération carrelage en bon état",
                prix_ht: 25.0,
                unite: "m²",
                tva: 10,
                description: "Dépose soignée permettant la récupération du carrelage pour réemploi.",
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
                tva: 10,
                description: "Dépose complète des revêtements souples (moquette, vinyle, sol souple) incluant évacuation des gravats et protection chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 50.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation et nettoyage du support après dépose pour garantir un chantier propre et prêt à la suite des travaux.",
                image: ""
              },
              {
                label: "Dépose moquette collée",
                prix_ht: 18.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de moquette collée avec grattage des résidus de colle.",
                image: ""
              },
              {
                label: "Dépose sol PVC en lés",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de revêtement PVC en lés avec nettoyage du support.",
                image: ""
              },
              {
                label: "Dépose sol vinyle clipsable",
                prix_ht: 12.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de sol vinyle clipsable avec récupération possible.",
                image: ""
              },
              {
                label: "Dépose linoléum",
                prix_ht: 16.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de linoléum avec grattage des résidus d'adhésif.",
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
                tva: 10,
                description: "Dépose complète du jonc de mer incluant évacuation des gravats et protection chantier, selon les règles professionnelles.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 50.0,
                unite: "forfait",
                tva: 10,
                description: "Nettoyage et préparation du support après dépose du jonc de mer pour une finition propre et durable.",
                image: ""
              },
              {
                label: "Dépose sisal ou coco",
                prix_ht: 16.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de revêtements naturels sisal ou coco.",
                image: ""
              },
              {
                label: "Dépose avec récupération",
                prix_ht: 20.0,
                unite: "m²",
                tva: 10,
                description: "Dépose soignée permettant la récupération du revêtement.",
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
                tva: 10,
                description: "Dépose complète du parquet incluant évacuation des gravats et protection chantier, réalisée selon les normes professionnelles.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 55.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation et nettoyage du support après dépose du parquet pour assurer une surface prête à recevoir un nouveau revêtement.",
                image: ""
              },
              {
                label: "Dépose parquet massif cloué",
                prix_ht: 28.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de parquet massif cloué avec récupération possible du bois.",
                image: ""
              },
              {
                label: "Dépose parquet contrecollé",
                prix_ht: 22.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de parquet contrecollé flottant ou collé.",
                image: ""
              },
              {
                label: "Dépose parquet stratifié",
                prix_ht: 18.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de parquet stratifié avec récupération possible.",
                image: ""
              },
              {
                label: "Dépose lambourdes",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Dépose des lambourdes et remise à niveau du support.",
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
                tva: 10,
                description: "Dépose complète des plinthes avec évacuation des gravats et protection chantier, réalisée dans le respect des normes.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 45.0,
                unite: "forfait",
                tva: 10,
                description: "Nettoyage et préparation du support après dépose des plinthes pour une finition soignée et durable.",
                image: ""
              },
              {
                label: "Dépose plinthes bois",
                prix_ht: 8.0,
                unite: "ml",
                tva: 10,
                description: "Dépose de plinthes en bois avec récupération possible.",
                image: ""
              },
              {
                label: "Dépose plinthes carrelage",
                prix_ht: 12.0,
                unite: "ml",
                tva: 10,
                description: "Dépose de plinthes en carrelage avec nettoyage du support.",
                image: ""
              },
              {
                label: "Dépose plinthes PVC",
                prix_ht: 6.0,
                unite: "ml",
                tva: 10,
                description: "Dépose de plinthes PVC avec nettoyage des résidus de colle.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose revêtements spéciaux",
            options: [
              {
                label: "Dépose résine époxy",
                prix_ht: 35.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de revêtement résine époxy par ponçage spécialisé.",
                image: ""
              },
              {
                label: "Dépose béton ciré",
                prix_ht: 45.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de béton ciré par ponçage et aspiration des poussières.",
                image: ""
              },
              {
                label: "Dépose tomettes anciennes",
                prix_ht: 55.0,
                unite: "m²",
                tva: 10,
                description: "Dépose délicate de tomettes anciennes avec récupération possible.",
                image: ""
              },
              {
                label: "Dépose pierre naturelle",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de dallage en pierre naturelle avec récupération.",
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
                tva: 10,
                description: "Dépose complète de faïence avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 60.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation soignée du support pour assurer une finition parfaite.",
                image: ""
              },
              {
                label: "Dépose faïence standard",
                prix_ht: 25.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de faïence murale standard avec nettoyage du support.",
                image: ""
              },
              {
                label: "Dépose faïence ancienne scellée",
                prix_ht: 35.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de faïence ancienne scellée au mortier.",
                image: ""
              },
              {
                label: "Récupération faïence en bon état",
                prix_ht: 30.0,
                unite: "m²",
                tva: 10,
                description: "Dépose soignée permettant la récupération de la faïence.",
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
                tva: 10,
                description: "Dépose complète de papier peint avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 55.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation soignée du support pour assurer une finition parfaite.",
                image: ""
              },
              {
                label: "Dépose papier peint simple",
                prix_ht: 8.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de papier peint traditionnel avec grattage.",
                image: ""
              },
              {
                label: "Dépose papier peint vinyle",
                prix_ht: 12.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de papier peint vinyle avec décolleuse vapeur.",
                image: ""
              },
              {
                label: "Dépose papier peint intissé",
                prix_ht: 10.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de papier peint intissé par pelage à sec.",
                image: ""
              },
              {
                label: "Dépose multiple couches",
                prix_ht: 18.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de plusieurs couches de papier peint superposées.",
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
                tva: 10,
                description: "Dépose complète des moulures avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 50.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation soignée du support pour assurer une finition parfaite.",
                image: ""
              },
              {
                label: "Dépose moulures bois",
                prix_ht: 15.0,
                unite: "ml",
                tva: 10,
                description: "Dépose de moulures en bois avec récupération possible.",
                image: ""
              },
              {
                label: "Dépose moulures plâtre",
                prix_ht: 18.0,
                unite: "ml",
                tva: 10,
                description: "Dépose de moulures en plâtre avec rebouchage.",
                image: ""
              },
              {
                label: "Dépose corniches",
                prix_ht: 22.0,
                unite: "ml",
                tva: 10,
                description: "Dépose de corniches décoratives avec finition du plafond.",
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
                tva: 10,
                description: "Dépose complète de toile de verre avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 58.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation soignée du support pour assurer une finition parfaite.",
                image: ""
              },
              {
                label: "Dépose toile de verre standard",
                prix_ht: 12.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de toile de verre avec grattage des résidus de colle.",
                image: ""
              },
              {
                label: "Dépose toile de verre peinte",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de toile de verre peinte avec décapage.",
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
                tva: 10,
                description: "Dépose complète de lambris avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 65.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation soignée du support pour assurer une finition parfaite.",
                image: ""
              },
              {
                label: "Dépose lambris bois",
                prix_ht: 18.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de lambris bois avec récupération possible.",
                image: ""
              },
              {
                label: "Dépose lambris PVC",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de lambris PVC avec nettoyage du support.",
                image: ""
              },
              {
                label: "Dépose tasseaux de fixation",
                prix_ht: 8.0,
                unite: "m²",
                tva: 10,
                description: "Dépose des tasseaux avec rebouchage des fixations.",
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
                tva: 10,
                description: "Dépose complète de paille japonaise avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 60.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation soignée du support pour assurer une finition parfaite.",
                image: ""
              },
              {
                label: "Dépose paille japonaise collée",
                prix_ht: 14.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de paille japonaise avec grattage des résidus.",
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
                tva: 10,
                description: "Dépose complète de tissu mural avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 55.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation soignée du support pour assurer une finition parfaite.",
                image: ""
              },
              {
                label: "Dépose tissu tendu",
                prix_ht: 16.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de tissu mural tendu avec démontage des fixations.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose revêtements plafond",
            options: [
              {
                label: "Dépose dalles de plafond",
                prix_ht: 12.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de dalles de plafond avec structure porteuse.",
                image: ""
              },
              {
                label: "Dépose faux plafond placo",
                prix_ht: 18.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de faux plafond en plaques de plâtre.",
                image: ""
              },
              {
                label: "Dépose lambris plafond",
                prix_ht: 20.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de lambris de plafond avec tasseaux.",
                image: ""
              },
              {
                label: "Dépose peinture écaillée",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Grattage et dépose de peinture écaillée au plafond.",
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
                tva: 10,
                description: "Dépose complète de menuiseries bois avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 65.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation soignée du support pour garantir une finition optimale.",
                image: ""
              },
              {
                label: "Dépose placard sur mesure",
                prix_ht: 180.0,
                unite: "ml",
                tva: 10,
                description: "Dépose de placard intégré avec récupération possible des éléments.",
                image: ""
              },
              {
                label: "Dépose bibliothèque intégrée",
                prix_ht: 150.0,
                unite: "ml",
                tva: 10,
                description: "Dépose de bibliothèque sur mesure avec étagères.",
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
                tva: 10,
                description: "Dépose complète de porte intérieure avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 60.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation soignée du support pour garantir une finition optimale.",
                image: ""
              },
              {
                label: "Dépose porte standard",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de porte intérieure avec huisserie et quincaillerie.",
                image: ""
              },
              {
                label: "Dépose porte coulissante",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de porte coulissante avec rail et mécanisme.",
                image: ""
              },
              {
                label: "Dépose porte à galandage",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Dépose de porte à galandage avec châssis intégré.",
                image: ""
              },
              {
                label: "Récupération quincaillerie",
                prix_ht: 25.0,
                unite: "unité",
                tva: 10,
                description: "Dépose soignée avec récupération de la quincaillerie.",
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
                tva: 10,
                description: "Dépose complète d'étagères avec évacuation des gravats et protection du chantier.",
                image: ""
              },
              {
                label: "Préparation du support après dépose",
                prix_ht: 55.0,
                unite: "forfait",
                tva: 10,
                description: "Préparation soignée du support pour garantir une finition optimale.",
                image: ""
              },
              {
                label: "Dépose étagères murales",
                prix_ht: 15.0,
                unite: "ml",
                tva: 10,
                description: "Dépose d'étagères murales avec supports et fixations.",
                image: ""
              },
              {
                label: "Dépose étagères d'angle",
                prix_ht: 25.0,
                unite: "unité",
                tva: 10,
                description: "Dépose d'étagères d'angle avec supports spécifiques.",
                image: ""
              }
            ]
          },
          {
            name: "Dépose cloisons amovibles",
            options: [
              {
                label: "Dépose cloison japonaise",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de cloison japonaise avec panneaux coulissants.",
                image: ""
              },
              {
                label: "Dépose verrière intérieure",
                prix_ht: 150.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de verrière intérieure avec structure métallique.",
                image: ""
              },
              {
                label: "Dépose paravent fixe",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Dépose de paravent ou séparation fixe.",
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
                tva: 20,
                description: "Prestation complète incluant coffrage, armatures inox, coulage béton fibré et contrôle géotechnique. Finition lissée et traitement anti-corrosion inclus.",
                image: ""
              },
              {
                label: "Longrine préfabriquée",
                prix_ht: 120.0,
                unite: "ml",
                tva: 20,
                description: "Pose de longrine préfabriquée avec raccordement et scellement.",
                image: ""
              },
              {
                label: "Longrine avec isolation intégrée",
                prix_ht: 180.0,
                unite: "ml",
                tva: 20,
                description: "Longrine avec rupture de pont thermique intégrée.",
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
                tva: 20,
                description: "Réalisation clé en main : excavation, film polyane, coffrage perdu, béton haute résistance avec armatures et contrôle de planéité.",
                image: ""
              },
              {
                label: "Semelles avec drainage intégré",
                prix_ht: 220.0,
                unite: "ml",
                tva: 20,
                description: "Semelles filantes avec système de drainage périphérique.",
                image: ""
              },
              {
                label: "Semelles sur pieux",
                prix_ht: 350.0,
                unite: "ml",
                tva: 20,
                description: "Semelles filantes sur pieux pour terrain difficile.",
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
                tva: 20,
                description: "Solutions techniques adaptées aux charges lourdes incluant étude structurelle, hérisson compacté et joints hydrofuges.",
                image: ""
              },
              {
                label: "Semelles avec plots béton",
                prix_ht: 180.0,
                unite: "unité",
                tva: 20,
                description: "Semelles isolées avec plots de liaison préfabriqués.",
                image: ""
              },
              {
                label: "Semelles renforcées grande portée",
                prix_ht: 450.0,
                unite: "unité",
                tva: 20,
                description: "Semelles dimensionnées pour charges exceptionnelles.",
                image: ""
              }
            ]
          },
          {
            name: "Fondations spéciales",
            options: [
              {
                label: "Pieux forés",
                prix_ht: 85.0,
                unite: "ml",
                tva: 20,
                description: "Pieux forés avec béton armé pour fondations profondes.",
                image: ""
              },
              {
                label: "Micropieux",
                prix_ht: 120.0,
                unite: "ml",
                tva: 20,
                description: "Micropieux pour reprise en sous-œuvre ou terrain difficile.",
                image: ""
              },
              {
                label: "Radier général",
                prix_ht: 95.0,
                unite: "m²",
                tva: 20,
                description: "Radier béton armé pour répartition des charges sur sol faible.",
                image: ""
              },
              {
                label: "Fondations sur plots",
                prix_ht: 65.0,
                unite: "unité",
                tva: 20,
                description: "Plots béton préfabriqués pour construction légère.",
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
                tva: 20,
                description: "Solution premium avec treillis soudé, isolation PEX, cure humide et finition parfaitement plane (tolérance 2mm/m).",
                image: ""
              },
              {
                label: "Dalle béton standard",
                prix_ht: 65.0,
                unite: "m²",
                tva: 20,
                description: "Dalle béton dosé à 350kg/m³ avec treillis soudé standard.",
                image: ""
              },
              {
                label: "Dalle isolée sous plancher chauffant",
                prix_ht: 95.0,
                unite: "m²",
                tva: 20,
                description: "Dalle avec isolation renforcée pour plancher chauffant.",
                image: ""
              },
              {
                label: "Dalle avec incorporation chauffant",
                prix_ht: 120.0,
                unite: "m²",
                tva: 20,
                description: "Dalle avec tubes de plancher chauffant intégrés.",
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
                tva: 20,
                description: "Réalisation sur mesure avec coffrage métallique, renforts acier, hydrofuge et finition talochée ou pierre taillée.",
                image: ""
              },
              {
                label: "Seuil avec rupture thermique",
                prix_ht: 150.0,
                unite: "ml",
                tva: 20,
                description: "Seuil avec isolation thermique intégrée.",
                image: ""
              },
              {
                label: "Seuil PMR (accessibilité)",
                prix_ht: 180.0,
                unite: "ml",
                tva: 20,
                description: "Seuil adapté aux normes d'accessibilité PMR.",
                image: ""
              }
            ]
          },
          {
            name: "Chapes spécialisées",
            options: [
              {
                label: "Chape fluide anhydrite",
                prix_ht: 45.0,
                unite: "m²",
                tva: 20,
                description: "Chape autonivelante pour finition parfaite.",
                image: ""
              },
              {
                label: "Chape isolante légère",
                prix_ht: 55.0,
                unite: "m²",
                tva: 20,
                description: "Chape allégée avec isolation thermique intégrée.",
                image: ""
              },
              {
                label: "Chape sèche",
                prix_ht: 35.0,
                unite: "m²",
                tva: 20,
                description: "Chape sèche pour rénovation rapide.",
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
                tva: 20,
                description: "Éléments porteurs en BHP avec coffrage bois/métal, armatures calculées par bureau d'études et finition vue brute ou lissée.",
                image: ""
              },
              {
                label: "Poteaux préfabriqués",
                prix_ht: 280.0,
                unite: "unité",
                tva: 20,
                description: "Poteaux béton préfabriqués avec assemblage sur site.",
                image: ""
              },
              {
                label: "Poutres précontraintes",
                prix_ht: 450.0,
                unite: "ml",
                tva: 20,
                description: "Poutres précontraintes pour grandes portées.",
                image: ""
              }
            ]
          },
          {
            name: "Structure métallique",
            options: [
              {
                label: "Charpente métallique",
                prix_ht: 85.0,
                unite: "kg",
                tva: 20,
                description: "Structure métallique avec assemblage boulonné ou soudé.",
                image: ""
              },
              {
                label: "Poteaux acier",
                prix_ht: 180.0,
                unite: "unité",
                tva: 20,
                description: "Poteaux en acier galvanisé avec platines de fixation.",
                image: ""
              },
              {
                label: "Poutres IPN/IPE",
                prix_ht: 65.0,
                unite: "ml",
                tva: 20,
                description: "Poutres métalliques standard avec protection anticorrosion.",
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
                tva: 20,
                description: "Voile structurel avec isolation intégrée, coffrage nervuré pour effet architectural et traitement anti-fissuration professionnel.",
                image: ""
              },
              {
                label: "Mur béton préfabriqué",
                prix_ht: 95.0,
                unite: "m²",
                tva: 20,
                description: "Panneaux béton préfabriqués avec assemblage sur site.",
                image: ""
              },
              {
                label: "Mur béton architectonique",
                prix_ht: 150.0,
                unite: "m²",
                tva: 20,
                description: "Mur béton avec finition architecturale (matrice, sablage).",
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
                tva: 20,
                description: "Montage rapide avec mortier-colle, arases renforcées et préparation parfaite pour enduit ou bardage ventilé.",
                image: ""
              },
              {
                label: "Mur bloc béton standard",
                prix_ht: 65.0,
                unite: "m²",
                tva: 20,
                description: "Mur en blocs béton 20cm avec mortier traditionnel.",
                image: ""
              },
              {
                label: "Mur bloc isolant",
                prix_ht: 85.0,
                unite: "m²",
                tva: 20,
                description: "Blocs béton avec isolation intégrée.",
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
                tva: 20,
                description: "Artisanat maçonné avec mortier traditionnel, chaînages intégrés et finition brute pour charme authentique.",
                image: ""
              },
              {
                label: "Mur brique creuse",
                prix_ht: 75.0,
                unite: "m²",
                tva: 20,
                description: "Mur en briques creuses avec isolation rapportée.",
                image: ""
              },
              {
                label: "Mur brique monomur",
                prix_ht: 85.0,
                unite: "m²",
                tva: 20,
                description: "Brique monomur avec isolation intégrée.",
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
                tva: 20,
                description: "Ensemble ceinture et raidisseurs en béton fibré avec acier haute adhérence pour stabilité parasismique.",
                image: ""
              },
              {
                label: "Chaînage horizontal",
                prix_ht: 45.0,
                unite: "ml",
                tva: 20,
                description: "Chaînage horizontal en béton armé.",
                image: ""
              },
              {
                label: "Chaînage vertical",
                prix_ht: 55.0,
                unite: "ml",
                tva: 20,
                description: "Chaînage vertical d'angle et de liaison.",
                image: ""
              }
            ]
          },
          {
            name: "Linteaux sur mesure",
            options: [
              {
                label: "Linteaux béton/acier précontraints",
                prix_ht: 180.0,
                unite: "unité",
                tva: 20,
                description: "Solutions techniques pour grandes ouvertures avec calage précis, scellement chimique et finition intégrée.",
                image: ""
              },
              {
                label: "Linteau préfabriqué",
                prix_ht: 85.0,
                unite: "ml",
                tva: 20,
                description: "Linteau béton préfabriqué standard.",
                image: ""
              },
              {
                label: "Linteau métallique",
                prix_ht: 120.0,
                unite: "ml",
                tva: 20,
                description: "Linteau en acier galvanisé pour grandes portées.",
                image: ""
              }
            ]
          },
          {
            name: "Murs de soutènement",
            options: [
              {
                label: "Mur de soutènement béton armé",
                prix_ht: 180.0,
                unite: "m²",
                tva: 20,
                description: "Mur de soutènement avec drainage et étanchéité.",
                image: ""
              },
              {
                label: "Mur en gabions",
                prix_ht: 120.0,
                unite: "m²",
                tva: 20,
                description: "Mur de soutènement en gabions métalliques.",
                image: ""
              },
              {
                label: "Mur végétalisé",
                prix_ht: 250.0,
                unite: "m²",
                tva: 20,
                description: "Mur de soutènement avec système de végétalisation.",
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
                tva: 20,
                description: "Solution structurelle avec isolation phonique intégrée, traitement de joints et planéité contrôlée au laser.",
                image: ""
              },
              {
                label: "Plancher prédalles",
                prix_ht: 95.0,
                unite: "m²",
                tva: 20,
                description: "Plancher prédalles avec table de compression.",
                image: ""
              },
              {
                label: "Plancher alvéolaire précontraint",
                prix_ht: 110.0,
                unite: "m²",
                tva: 20,
                description: "Plancher alvéolaire pour grandes portées.",
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
                tva: 20,
                description: "Plancher léger à montage rapide avec hourdis PSE/béton, dalle de compression et passages techniques intégrés.",
                image: ""
              },
              {
                label: "Plancher poutrelles béton",
                prix_ht: 85.0,
                unite: "m²",
                tva: 20,
                description: "Plancher traditionnel poutrelles béton et hourdis.",
                image: ""
              },
              {
                label: "Plancher poutrelles précontraintes",
                prix_ht: 105.0,
                unite: "m²",
                tva: 20,
                description: "Plancher poutrelles précontraintes pour grandes portées.",
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
                tva: 20,
                description: "Bac acier galvanisé avec dalle béton coulée en œuvre, permettant de grandes portées sans étais intermédiaires.",
                image: ""
              },
              {
                label: "Plancher mixte standard",
                prix_ht: 120.0,
                unite: "m²",
                tva: 20,
                description: "Plancher collaborant standard pour bâtiments tertiaires.",
                image: ""
              }
            ]
          },
          {
            name: "Planchers bois",
            options: [
              {
                label: "Plancher bois massif",
                prix_ht: 85.0,
                unite: "m²",
                tva: 20,
                description: "Plancher en solives bois massif avec voligeage.",
                image: ""
              },
              {
                label: "Plancher OSB sur solives",
                prix_ht: 65.0,
                unite: "m²",
                tva: 20,
                description: "Plancher OSB sur structure bois.",
                image: ""
              },
              {
                label: "Plancher CLT",
                prix_ht: 120.0,
                unite: "m²",
                tva: 20,
                description: "Plancher en bois lamellé-croisé (CLT).",
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
                tva: 20,
                description: "Solution sèche pour planéité parfaite (±1mm/m), idéale pour chauffage au sol et délais raccourcis.",
                image: ""
              },
              {
                label: "Chape anhydrite standard",
                prix_ht: 28.0,
                unite: "m²",
                tva: 20,
                description: "Chape anhydrite traditionnelle pour finition courante.",
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
                tva: 20,
                description: "Mortier allégé aux billes de PSE avec treillis soudé, permettant une isolation intégrée performante.",
                image: ""
              },
              {
                label: "Chape béton standard",
                prix_ht: 22.0,
                unite: "m²",
                tva: 20,
                description: "Chape béton traditionnelle dosée à 300kg/m³.",
                image: ""
              },
              {
                label: "Chape fibrée",
                prix_ht: 32.0,
                unite: "m²",
                tva: 20,
                description: "Chape avec fibres synthétiques pour résistance accrue.",
                image: ""
              }
            ]
          },
          {
            name: "Chapes spécialisées",
            options: [
              {
                label: "Chape isolante phonique",
                prix_ht: 45.0,
                unite: "m²",
                tva: 20,
                description: "Chape avec isolation phonique intégrée.",
                image: ""
              },
              {
                label: "Chape pour plancher chauffant",
                prix_ht: 38.0,
                unite: "m²",
                tva: 20,
                description: "Chape spéciale pour enrobage de plancher chauffant.",
                image: ""
              },
              {
                label: "Chape industrielle",
                prix_ht: 55.0,
                unite: "m²",
                tva: 20,
                description: "Chape haute résistance pour usage industriel.",
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
                tva: 20,
                description: "Structure porteuse avec coffrage bois précis, nez de marche antidérapants et finition bouchardée ou lissée.",
                image: ""
              },
              {
                label: "Escalier béton préfabriqué",
                prix_ht: 1800.0,
                unite: "unité",
                tva: 20,
                description: "Escalier béton préfabriqué avec pose sur site.",
                image: ""
              },
              {
                label: "Escalier hélicoïdal béton",
                prix_ht: 3500.0,
                unite: "unité",
                tva: 20,
                description: "Escalier hélicoïdal coulé en place avec coffrage spécialisé.",
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
                tva: 10,
                description: "Découpe au diamant avec renforts métalliques, mise en sécurité et finitions professionnelles.",
                image: ""
              },
              {
                label: "Trémie avec chevêtre béton",
                prix_ht: 650.0,
                unite: "unité",
                tva: 20,
                description: "Création de trémie avec chevêtre béton armé.",
                image: ""
              },
              {
                label: "Trémie avec chevêtre métallique",
                prix_ht: 750.0,
                unite: "unité",
                tva: 20,
                description: "Trémie avec chevêtre en poutrelles métalliques.",
                image: ""
              }
            ]
          },
          {
            name: "Escaliers métalliques",
            options: [
              {
                label: "Escalier acier droit",
                prix_ht: 1200.0,
                unite: "unité",
                tva: 20,
                description: "Escalier métallique droit avec marches et garde-corps.",
                image: ""
              },
              {
                label: "Escalier hélicoïdal acier",
                prix_ht: 2200.0,
                unite: "unité",
                tva: 20,
                description: "Escalier hélicoïdal en acier galvanisé.",
                image: ""
              },
              {
                label: "Escalier industriel",
                prix_ht: 850.0,
                unite: "unité",
                tva: 20,
                description: "Escalier métallique industriel avec caillebotis.",
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
                tva: 20,
                description: "Protection bitumineuse auto-adhésive double couche avec contrôle d'étanchéité par test d'arrosage.",
                image: ""
              },
              {
                label: "Étanchéité liquide",
                prix_ht: 25.0,
                unite: "m²",
                tva: 20,
                description: "Étanchéité liquide polyuréthane pour soubassements.",
                image: ""
              },
              {
                label: "Membrane EPDM",
                prix_ht: 35.0,
                unite: "m²",
                tva: 20,
                description: "Membrane EPDM pour étanchéité durable.",
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
                tva: 20,
                description: "Installation clé en main : drains, géotextile, pente calculée et raccordement au réseau pluvial.",
                image: ""
              },
              {
                label: "Drain français",
                prix_ht: 85.0,
                unite: "ml",
                tva: 20,
                description: "Drain français traditionnel avec graviers.",
                image: ""
              },
              {
                label: "Drainage avec pompe de relevage",
                prix_ht: 180.0,
                unite: "ml",
                tva: 20,
                description: "Système de drainage avec pompe pour évacuation forcée.",
                image: ""
              }
            ]
          },
          {
            name: "Étanchéité toiture",
            options: [
              {
                label: "Étanchéité membrane bitumineuse",
                prix_ht: 45.0,
                unite: "m²",
                tva: 20,
                description: "Étanchéité bicouche bitume pour toiture terrasse.",
                image: ""
              },
              {
                label: "Étanchéité EPDM toiture",
                prix_ht: 55.0,
                unite: "m²",
                tva: 20,
                description: "Membrane EPDM pour toiture terrasse.",
                image: ""
              },
              {
                label: "Étanchéité végétalisée",
                prix_ht: 85.0,
                unite: "m²",
                tva: 20,
                description: "Étanchéité pour toiture végétalisée avec protection.",
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
                tva: 20,
                description: "Artisanat charpenté avec assemblages traditionnels, bois traité classe 4 et finition rabotée quatre faces.",
                image: ""
              },
              {
                label: "Charpente en chêne",
                prix_ht: 250.0,
                unite: "m²",
                tva: 20,
                description: "Charpente traditionnelle en chêne massif.",
                image: ""
              },
              {
                label: "Charpente douglas",
                prix_ht: 160.0,
                unite: "m²",
                tva: 20,
                description: "Charpente en douglas naturellement résistant.",
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
                tva: 20,
                description: "Solution économique à montage rapide avec connecteurs métalliques et préparation pour isolation soufflée.",
                image: ""
              },
              {
                label: "Charpente lamellé-collé",
                prix_ht: 140.0,
                unite: "m²",
                tva: 20,
                description: "Charpente en bois lamellé-collé pour grandes portées.",
                image: ""
              },
              {
                label: "Charpente métallique",
                prix_ht: 120.0,
                unite: "m²",
                tva: 20,
                description: "Charpente métallique galvanisée pour bâtiments industriels.",
                image: ""
              }
            ]
          },
          {
            name: "Éléments de charpente",
            options: [
              {
                label: "Pannes et chevrons",
                prix_ht: 25.0,
                unite: "ml",
                tva: 20,
                description: "Pannes et chevrons en bois traité.",
                image: ""
              },
              {
                label: "Faîtage et arêtiers",
                prix_ht: 35.0,
                unite: "ml",
                tva: 20,
                description: "Éléments de faîtage et arêtiers sur mesure.",
                image: ""
              },
              {
                label: "Voligeage",
                prix_ht: 18.0,
                unite: "m²",
                tva: 20,
                description: "Voligeage en planches de bois résineux.",
                image: ""
              },
              {
                label: "Liteaux et contre-liteaux",
                prix_ht: 8.0,
                unite: "m²",
                tva: 20,
                description: "Pose de liteaux pour support de couverture.",
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
                tva: 5.5,
                description: "Prestation complète incluant : isolation en polystyrène/laine de roche, pose d'armature, application d'enduit minéral, protections et finitions teintées. Conforme aux normes RT 2012/RE 2020. Protection du chantier incluse."
              },
              {
                label: "ITE polystyrène expansé",
                prix_ht: 110.0,
                unite: "m²",
                tva: 5.5,
                description: "Isolation thermique extérieure avec polystyrène expansé et enduit organique."
              },
              {
                label: "ITE laine de roche",
                prix_ht: 135.0,
                unite: "m²",
                tva: 5.5,
                description: "Isolation thermique extérieure avec laine de roche et enduit minéral."
              },
              {
                label: "ITE fibre de bois",
                prix_ht: 150.0,
                unite: "m²",
                tva: 5.5,
                description: "Isolation écologique avec panneaux de fibre de bois."
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
                tva: 10,
                description: "Application d'enduit à la chaux ou monocouche hydraulique avec finitions au choix (gratté, taloché). Inclut traitement hydrofuge et application sur tout type de support. Possibilité d'enduit isolant."
              },
              {
                label: "Enduit à la chaux",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Enduit traditionnel à la chaux en trois couches."
              },
              {
                label: "Enduit monocouche",
                prix_ht: 75.0,
                unite: "m²",
                tva: 10,
                description: "Enduit monocouche hydraulique avec finition grattée."
              },
              {
                label: "Enduit décoratif",
                prix_ht: 120.0,
                unite: "m²",
                tva: 10,
                description: "Enduit décoratif avec effets de matière."
              }
            ]
          },
          {
            name: "Bardage extérieur",
            options: [
              {
                label: "Bardage bois naturel",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Bardage en lames de bois avec ossature et isolation."
              },
              {
                label: "Bardage composite",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Bardage composite imitation bois sans entretien."
              },
              {
                label: "Bardage métallique",
                prix_ht: 75.0,
                unite: "m²",
                tva: 10,
                description: "Bardage en bac acier laqué avec isolation."
              },
              {
                label: "Bardage fibrociment",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Bardage en plaques fibrociment avec finition."
              }
            ]
          },
          {
            name: "Ravalement de façade",
            options: [
              {
                label: "Ravalement complet avec échafaudage",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Nettoyage, réparation et peinture de façade avec échafaudage."
              },
              {
                label: "Nettoyage haute pression",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Nettoyage de façade par haute pression."
              },
              {
                label: "Sablage de façade",
                prix_ht: 25.0,
                unite: "m²",
                tva: 10,
                description: "Décapage par sablage pour façades anciennes."
              },
              {
                label: "Peinture façade",
                prix_ht: 35.0,
                unite: "m²",
                tva: 10,
                description: "Application de peinture façade avec sous-couche."
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
                tva: 5.5,
                description: "Solution complète : pose d'isolant rigide, écran sous-toiture ventilé, habillage en bac acier ou tuiles. Inclut renforcement charpente si nécessaire. Étanchéité garantie selon DTU."
              },
              {
                label: "Sarking polyuréthane",
                prix_ht: 135.0,
                unite: "m²",
                tva: 5.5,
                description: "Isolation sarking avec panneaux polyuréthane haute performance."
              },
              {
                label: "Sarking fibre de bois",
                prix_ht: 165.0,
                unite: "m²",
                tva: 5.5,
                description: "Isolation sarking écologique avec panneaux fibre de bois."
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
                tva: 10,
                description: "Installation clé en main : tuiles terre cuite/béton, liteaux, sous-toiture ventilée, finitions faîtage et rives. Traitement anti-mousse et garantie décennale inclus."
              },
              {
                label: "Tuiles terre cuite",
                prix_ht: 165.0,
                unite: "m²",
                tva: 10,
                description: "Couverture en tuiles terre cuite avec accessoires."
              },
              {
                label: "Tuiles béton",
                prix_ht: 145.0,
                unite: "m²",
                tva: 10,
                description: "Couverture en tuiles béton économique."
              },
              {
                label: "Tuiles photovoltaïques",
                prix_ht: 350.0,
                unite: "m²",
                tva: 10,
                description: "Tuiles solaires intégrées avec production électrique."
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
                tva: 10,
                description: "Pose professionnelle d'ardoises naturelles sur voliges, avec écran sous-toiture et fixation inox. Inclut traitement anti-lichen et entretien initial. Étanchéité optimale garantie."
              },
              {
                label: "Ardoise naturelle d'Angers",
                prix_ht: 250.0,
                unite: "m²",
                tva: 10,
                description: "Ardoise naturelle française haut de gamme."
              },
              {
                label: "Ardoise fibrociment",
                prix_ht: 120.0,
                unite: "m²",
                tva: 10,
                description: "Ardoise synthétique aspect naturel."
              }
            ]
          },
          {
            name: "Couvertures spécialisées",
            options: [
              {
                label: "Bac acier isolé",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Couverture bac acier avec isolation intégrée."
              },
              {
                label: "Zinc joint debout",
                prix_ht: 180.0,
                unite: "m²",
                tva: 10,
                description: "Couverture zinc traditionnelle joint debout."
              },
              {
                label: "Membrane EPDM",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Étanchéité membrane EPDM pour toiture terrasse."
              },
              {
                label: "Toiture végétalisée",
                prix_ht: 120.0,
                unite: "m²",
                tva: 10,
                description: "Toiture végétalisée extensive avec substrat."
              }
            ]
          },
          {
            name: "Rénovation couverture",
            options: [
              {
                label: "Réfection partielle",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Réfection partielle avec remplacement des éléments défaillants."
              },
              {
                label: "Démoussage et traitement",
                prix_ht: 25.0,
                unite: "m²",
                tva: 10,
                description: "Démoussage et traitement hydrofuge de toiture."
              },
              {
                label: "Réparation fuites",
                prix_ht: 150.0,
                unite: "unité",
                tva: 10,
                description: "Recherche et réparation de fuites ponctuelles."
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
                tva: 10,
                description: "Pose de gouttières zinc/PVC (demi-ronde ou carrée) avec descentes EP, crochets inox et grilles anti-feuilles. Inclut traitement anti-corrosion et raccordement aux évacuations."
              },
              {
                label: "Gouttières zinc",
                prix_ht: 85.0,
                unite: "ml",
                tva: 10,
                description: "Gouttières en zinc naturel avec soudures."
              },
              {
                label: "Gouttières PVC",
                prix_ht: 45.0,
                unite: "ml",
                tva: 10,
                description: "Gouttières PVC avec raccords collés."
              },
              {
                label: "Gouttières aluminium",
                prix_ht: 65.0,
                unite: "ml",
                tva: 10,
                description: "Gouttières aluminium laqué sans entretien."
              }
            ]
          },
          {
            name: "Descentes pluviales",
            options: [
              {
                label: "Descente EP zinc",
                prix_ht: 55.0,
                unite: "ml",
                tva: 10,
                description: "Descente pluviale zinc avec colliers de fixation."
              },
              {
                label: "Descente EP PVC",
                prix_ht: 35.0,
                unite: "ml",
                tva: 10,
                description: "Descente pluviale PVC avec colliers."
              },
              {
                label: "Descente EP carrée",
                prix_ht: 65.0,
                unite: "ml",
                tva: 10,
                description: "Descente pluviale carrée design."
              }
            ]
          },
          {
            name: "Accessoires et finitions",
            options: [
              {
                label: "Crapaudines et grilles",
                prix_ht: 25.0,
                unite: "unité",
                tva: 10,
                description: "Crapaudines anti-feuilles et grilles de protection."
              },
              {
                label: "Récupérateur d'eau",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Récupérateur d'eau de pluie avec filtre."
              },
              {
                label: "Chaîne de pluie décorative",
                prix_ht: 45.0,
                unite: "ml",
                tva: 10,
                description: "Chaîne de pluie décorative en remplacement de descente."
              }
            ]
          }
        ]
      },
      {
        name: "Zinguerie et étanchéité",
        items: [
          {
            name: "Travaux de zinguerie",
            options: [
              {
                label: "Noues et arêtiers zinc",
                prix_ht: 85.0,
                unite: "ml",
                tva: 10,
                description: "Noues et arêtiers en zinc soudé."
              },
              {
                label: "Solins et bavettes",
                prix_ht: 45.0,
                unite: "ml",
                tva: 10,
                description: "Solins et bavettes d'étanchéité."
              },
              {
                label: "Chéneaux zinc",
                prix_ht: 120.0,
                unite: "ml",
                tva: 10,
                description: "Chéneaux zinc avec évacuation intégrée."
              },
              {
                label: "Habillage cheminée",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Habillage complet de souche de cheminée."
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
                tva: 5.5,
                description: "Porte d'entrée isolante en PVC, Alu ou Bois massif avec système de sécurité multi-points. Inclut : quincaillerie premium, seuil étanche, pose professionnelle et finitions parfaites. Choix parmi plusieurs designs et finitions."
              },
              {
                label: "Porte d'entrée PVC",
                prix_ht: 1800.0,
                unite: "unité",
                tva: 5.5,
                description: "Porte d'entrée PVC avec vitrage et serrure 3 points."
              },
              {
                label: "Porte d'entrée aluminium",
                prix_ht: 2200.0,
                unite: "unité",
                tva: 5.5,
                description: "Porte d'entrée aluminium design avec isolation renforcée."
              },
              {
                label: "Porte d'entrée bois",
                prix_ht: 2800.0,
                unite: "unité",
                tva: 5.5,
                description: "Porte d'entrée en bois massif avec finition lasure."
              },
              {
                label: "Porte blindée",
                prix_ht: 3500.0,
                unite: "unité",
                tva: 5.5,
                description: "Porte blindée certifiée A2P avec serrure haute sécurité."
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
                tva: 5.5,
                description: "Fenêtre isolante double vitrage (4/16/4) en PVC, Alu ou Bois. Inclut : pose étanche, reprise des enduits, joints silicone professionnels et réglage précis. Performance thermique et acoustique certifiée."
              },
              {
                label: "Fenêtre PVC double vitrage",
                prix_ht: 650.0,
                unite: "unité",
                tva: 5.5,
                description: "Fenêtre PVC blanc avec double vitrage standard."
              },
              {
                label: "Fenêtre aluminium",
                prix_ht: 950.0,
                unite: "unité",
                tva: 5.5,
                description: "Fenêtre aluminium avec rupture de pont thermique."
              },
              {
                label: "Fenêtre bois",
                prix_ht: 1200.0,
                unite: "unité",
                tva: 5.5,
                description: "Fenêtre bois massif avec double vitrage."
              },
              {
                label: "Fenêtre triple vitrage",
                prix_ht: 1100.0,
                unite: "unité",
                tva: 5.5,
                description: "Fenêtre haute performance avec triple vitrage."
              },
              {
                label: "Fenêtre oscillo-battante",
                prix_ht: 750.0,
                unite: "unité",
                tva: 5.5,
                description: "Fenêtre avec ouverture oscillo-battante."
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
                tva: 5.5,
                description: "Porte-fenêtre haute performance avec système d'étanchéité renforcé. Disponible en différents modes d'ouverture. Inclut : pose technique, seuil bas isolant et finitions intérieur/extérieur parfaites."
              },
              {
                label: "Porte-fenêtre 2 vantaux",
                prix_ht: 1600.0,
                unite: "unité",
                tva: 5.5,
                description: "Porte-fenêtre 2 vantaux avec seuil PMR."
              },
              {
                label: "Porte-fenêtre coulissante",
                prix_ht: 2200.0,
                unite: "unité",
                tva: 5.5,
                description: "Porte-fenêtre coulissante avec rail au sol."
              },
              {
                label: "Porte-fenêtre à galandage",
                prix_ht: 3500.0,
                unite: "unité",
                tva: 5.5,
                description: "Porte-fenêtre coulissante à galandage intégré."
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
                tva: 5.5,
                description: "Baie vitrée coulissante à galandage avec vitrage isolant. Système à roulement silencieux et durable. Inclut : structure renforcée, pose technique et finitions d'étanchéité professionnelles."
              },
              {
                label: "Baie vitrée fixe",
                prix_ht: 450.0,
                unite: "m²",
                tva: 5.5,
                description: "Baie vitrée fixe grande dimension."
              },
              {
                label: "Baie vitrée pliante",
                prix_ht: 850.0,
                unite: "m²",
                tva: 5.5,
                description: "Baie vitrée pliante accordéon."
              },
              {
                label: "Mur rideau",
                prix_ht: 1200.0,
                unite: "m²",
                tva: 5.5,
                description: "Mur rideau structural avec vitrage isolant."
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
                tva: 5.5,
                description: "Fenêtre de toit VELUX standard avec installation clé en main. Inclut : cadre isolant, volets roulants intégrés, étanchéité parfaite et finitions intérieures/exterieures. Garantie étanchéité 10 ans."
              },
              {
                label: "VELUX standard",
                prix_ht: 850.0,
                unite: "unité",
                tva: 5.5,
                description: "Fenêtre de toit VELUX ouverture par rotation."
              },
              {
                label: "VELUX motorisé",
                prix_ht: 1500.0,
                unite: "unité",
                tva: 5.5,
                description: "Fenêtre de toit motorisée avec télécommande."
              },
              {
                label: "VELUX avec volet roulant",
                prix_ht: 1800.0,
                unite: "unité",
                tva: 5.5,
                description: "Fenêtre de toit avec volet roulant intégré."
              },
              {
                label: "Verrière de toit",
                prix_ht: 2500.0,
                unite: "unité",
                tva: 5.5,
                description: "Verrière de toit fixe grande dimension."
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
                tva: 5.5,
                description: "Trappe d'accès toit-terrasse professionnelle avec isolation renforcée. Sécurité anti-effraction et étanchéité parfaite. Inclut : quincaillerie premium et pose technique avec reprise d'étanchéité."
              },
              {
                label: "Trappe d'accès standard",
                prix_ht: 1500.0,
                unite: "unité",
                tva: 5.5,
                description: "Trappe d'accès simple avec échelle escamotable."
              },
              {
                label: "Escalier escamotable",
                prix_ht: 850.0,
                unite: "unité",
                tva: 5.5,
                description: "Escalier escamotable pour accès combles."
              }
            ]
          }
        ]
      },
      {
        name: "Volets et protections",
        items: [
          {
            name: "Volets roulants",
            options: [
              {
                label: "Volet roulant manuel",
                prix_ht: 450.0,
                unite: "unité",
                tva: 5.5,
                description: "Volet roulant manuel avec coffre extérieur."
              },
              {
                label: "Volet roulant motorisé",
                prix_ht: 650.0,
                unite: "unité",
                tva: 5.5,
                description: "Volet roulant motorisé avec télécommande."
              },
              {
                label: "Volet roulant solaire",
                prix_ht: 850.0,
                unite: "unité",
                tva: 5.5,
                description: "Volet roulant avec alimentation solaire autonome."
              },
              {
                label: "Volet roulant rénovation",
                prix_ht: 550.0,
                unite: "unité",
                tva: 5.5,
                description: "Volet roulant pour rénovation sans coffre apparent."
              }
            ]
          },
          {
            name: "Volets battants",
            options: [
              {
                label: "Volets bois traditionnels",
                prix_ht: 350.0,
                unite: "unité",
                tva: 5.5,
                description: "Volets battants en bois avec quincaillerie."
              },
              {
                label: "Volets PVC",
                prix_ht: 280.0,
                unite: "unité",
                tva: 5.5,
                description: "Volets battants PVC sans entretien."
              },
              {
                label: "Volets aluminium",
                prix_ht: 450.0,
                unite: "unité",
                tva: 5.5,
                description: "Volets battants aluminium laqué."
              }
            ]
          },
          {
            name: "Stores extérieurs",
            options: [
              {
                label: "Store banne manuel",
                prix_ht: 850.0,
                unite: "unité",
                tva: 5.5,
                description: "Store banne manuel avec toile acrylique."
              },
              {
                label: "Store banne motorisé",
                prix_ht: 1200.0,
                unite: "unité",
                tva: 5.5,
                description: "Store banne motorisé avec capteur vent."
              },
              {
                label: "Pergola bioclimatique",
                prix_ht: 650.0,
                unite: "m²",
                tva: 5.5,
                description: "Pergola avec lames orientables motorisées."
              }
            ]
          }
        ]
      },
      {
        name: "Portails et clôtures",
        items: [
          {
            name: "Portails",
            options: [
              {
                label: "Portail battant aluminium",
                prix_ht: 1800.0,
                unite: "unité",
                tva: 10,
                description: "Portail battant aluminium 3m avec motorisation."
              },
              {
                label: "Portail coulissant",
                prix_ht: 2500.0,
                unite: "unité",
                tva: 10,
                description: "Portail coulissant autoportant avec motorisation."
              },
              {
                label: "Portail bois",
                prix_ht: 1500.0,
                unite: "unité",
                tva: 10,
                description: "Portail battant en bois massif traité."
              },
              {
                label: "Portillon assorti",
                prix_ht: 650.0,
                unite: "unité",
                tva: 10,
                description: "Portillon assorti au portail avec serrure."
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
                tva: 10,
                description: "Cloison en plaques de plâtre BA13 sur ossature métallique, avec isolation phonique et thermique optionnelle. Inclut : fourniture, pose, joints et finitions prêtes à peindre. Épaisseur standard 72mm ou sur mesure."
              },
              {
                label: "Cloison en carreaux de plâtre",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Cloison en carreaux de plâtre collés pour une excellente isolation phonique et résistance au feu. Inclut : préparation des supports, collage professionnel et finitions parfaites. Solution idéale pour les pièces humides."
              },
              {
                label: "Condamnation de porte professionnelle",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Condamnation complète d'une porte existante avec isolation phonique et thermique. Inclut : dépose de la menuiserie, mise en place de l'ossature, isolation et finitions identiques au mur existant."
              },
              {
                label: "Cloison hydrofuge",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Cloison avec plaques hydrofuges pour pièces humides."
              },
              {
                label: "Cloison phonique renforcée",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Cloison avec isolation phonique haute performance."
              },
              {
                label: "Cloison coupe-feu",
                prix_ht: 120.0,
                unite: "m²",
                tva: 10,
                description: "Cloison avec résistance au feu 1h ou 2h."
              }
            ]
          },
          {
            name: "Cloisons techniques",
            options: [
              {
                label: "Cloison avec gaines intégrées",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Cloison avec passage de gaines électriques et plomberie."
              },
              {
                label: "Cloison distributive",
                prix_ht: 110.0,
                unite: "m²",
                tva: 10,
                description: "Cloison technique pour distribution des fluides."
              },
              {
                label: "Gaine technique verticale",
                prix_ht: 180.0,
                unite: "ml",
                tva: 10,
                description: "Gaine technique pour passage vertical des réseaux."
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
                tva: 5.5,
                description: "Doublage thermique et phonique sur ossature métallique avec laine minérale. Inclut : pare-vapeur, plaques de plâtre hydrofuges et finitions prêtes à peindre. Épaisseur 45mm à 100mm selon performance souhaitée."
              },
              {
                label: "ITI collée haute performance",
                prix_ht: 85.0,
                unite: "m²",
                tva: 5.5,
                description: "Isolation Thermique Intérieure par collage direct de plaques isolantes avec finition plâtre. Solution mince et performante (jusqu'à R=4.5). Inclut préparation des supports et finitions parfaites."
              },
              {
                label: "Doublage laine de verre",
                prix_ht: 55.0,
                unite: "m²",
                tva: 5.5,
                description: "Doublage avec laine de verre et BA13."
              },
              {
                label: "Doublage laine de roche",
                prix_ht: 65.0,
                unite: "m²",
                tva: 5.5,
                description: "Doublage avec laine de roche pour isolation phonique."
              },
              {
                label: "Doublage polystyrène",
                prix_ht: 45.0,
                unite: "m²",
                tva: 5.5,
                description: "Doublage économique avec polystyrène expansé."
              },
              {
                label: "Doublage écologique",
                prix_ht: 85.0,
                unite: "m²",
                tva: 5.5,
                description: "Doublage avec isolants naturels (chanvre, ouate)."
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
                tva: 10,
                description: "Faux-plafond suspendu avec ossature métallique, isolation phonique/thermique et plaques de plâtre. Inclut : découpes techniques, trappes de visite et finitions prêtes à peindre."
              },
              {
                label: "Faux-plafond dalles amovibles",
                prix_ht: 45.0,
                unite: "m²",
                tva: 10,
                description: "Faux-plafond technique avec dalles minérales acoustiques et accès facile aux gaines. Large choix de dalles (classique, hygro-régulante, phonique). Inclut structure métallique et finitions périphériques."
              },
              {
                label: "Faux-plafond acoustique",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Faux-plafond avec isolation phonique renforcée."
              },
              {
                label: "Faux-plafond décoratif",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Faux-plafond avec effets décoratifs (courbes, éclairage)."
              },
              {
                label: "Faux-plafond coupe-feu",
                prix_ht: 75.0,
                unite: "m²",
                tva: 10,
                description: "Faux-plafond avec résistance au feu."
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
                tva: 5.5,
                description: "Isolation des combles perdus par laine minérale soufflée (épaisseur 320mm). Inclut : traitement des ponts thermiques, mise en place des écrans de protection et trappes d'accès. Performance R≥7.5."
              },
              {
                label: "ITI sous rampants complet",
                prix_ht: 90.0,
                unite: "m²",
                tva: 5.5,
                description: "Isolation sous rampants avec ossature métallique, pare-vapeur et laine de verre. Inclut : plaques de plâtre finition lisse, traitement des angles et finitions prêtes à décorer. Épaisseur 100-120mm."
              },
              {
                label: "Isolation ouate de cellulose",
                prix_ht: 45.0,
                unite: "m²",
                tva: 5.5,
                description: "Isolation écologique par ouate de cellulose soufflée."
              },
              {
                label: "Isolation laine de bois",
                prix_ht: 65.0,
                unite: "m²",
                tva: 5.5,
                description: "Isolation naturelle avec panneaux de laine de bois."
              },
              {
                label: "Pare-vapeur renforcé",
                prix_ht: 8.0,
                unite: "m²",
                tva: 5.5,
                description: "Pose de pare-vapeur haute performance."
              }
            ]
          }
        ]
      },
      {
        name: "Finitions plâtrerie",
        items: [
          {
            name: "Enduits et finitions",
            options: [
              {
                label: "Enduit de lissage",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Enduit de lissage pour finition parfaite."
              },
              {
                label: "Enduit décoratif",
                prix_ht: 25.0,
                unite: "m²",
                tva: 10,
                description: "Enduit décoratif avec effets de matière."
              },
              {
                label: "Bandes et joints",
                prix_ht: 8.0,
                unite: "ml",
                tva: 10,
                description: "Traitement des joints entre plaques."
              },
              {
                label: "Angles et arêtes",
                prix_ht: 12.0,
                unite: "ml",
                tva: 10,
                description: "Finition des angles avec baguettes de protection."
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
                tva: 5.5,
                description: "Prestation clé en main incluant dépose ancienne chaudière, installation neuve, raccordements, mise en service et contrôle conformité. Fourniture chaudière haut rendement incluse."
              },
              {
                label: "Chaudière gaz murale",
                prix_ht: 2200.0,
                unite: "unité",
                tva: 5.5,
                description: "Chaudière gaz murale condensation avec régulation."
              },
              {
                label: "Chaudière gaz au sol",
                prix_ht: 3500.0,
                unite: "unité",
                tva: 5.5,
                description: "Chaudière gaz au sol haute puissance."
              },
              {
                label: "Chaudière hybride gaz/PAC",
                prix_ht: 6500.0,
                unite: "unité",
                tva: 5.5,
                description: "Système hybride chaudière gaz et pompe à chaleur."
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
                tva: 5.5,
                description: "Solution complète avec étude thermique, pose unités intérieure/extérieure, raccordements hydrauliques/électriques, mise en service et garantie constructeur."
              },
              {
                label: "PAC air/eau basse température",
                prix_ht: 5500.0,
                unite: "unité",
                tva: 5.5,
                description: "Pompe à chaleur optimisée pour plancher chauffant."
              },
              {
                label: "PAC air/eau haute température",
                prix_ht: 6500.0,
                unite: "unité",
                tva: 5.5,
                description: "Pompe à chaleur pour radiateurs existants."
              },
              {
                label: "PAC géothermique",
                prix_ht: 12000.0,
                unite: "unité",
                tva: 5.5,
                description: "Pompe à chaleur géothermique avec forage."
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
                tva: 10,
                description: "Pose complète incluant fourniture appareil, groupe de sécurité, raccordements et mise en service. Dépose ancien chauffe-eau incluse."
              },
              {
                label: "Chauffe-eau 100L",
                prix_ht: 650.0,
                unite: "unité",
                tva: 10,
                description: "Chauffe-eau électrique 100L vertical ou horizontal."
              },
              {
                label: "Chauffe-eau 300L",
                prix_ht: 1200.0,
                unite: "unité",
                tva: 10,
                description: "Chauffe-eau électrique 300L pour grande famille."
              },
              {
                label: "Chauffe-eau instantané",
                prix_ht: 450.0,
                unite: "unité",
                tva: 10,
                description: "Chauffe-eau instantané électrique pour point d'usage."
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
                tva: 5.5,
                description: "Solution complète avec optimisation énergétique, maintenance incluse et garantie prolongée. Raccordements hydrauliques/électriques professionnels."
              },
              {
                label: "CET sur air ambiant",
                prix_ht: 1800.0,
                unite: "unité",
                tva: 5.5,
                description: "Chauffe-eau thermodynamique sur air ambiant."
              },
              {
                label: "CET sur air extérieur",
                prix_ht: 2500.0,
                unite: "unité",
                tva: 5.5,
                description: "Chauffe-eau thermodynamique avec prise d'air extérieur."
              }
            ]
          },
          {
            name: "Chauffe-eau solaire",
            options: [
              {
                label: "Installation solaire complète",
                prix_ht: 4500.0,
                unite: "unité",
                tva: 5.5,
                description: "Chauffe-eau solaire avec capteurs et ballon."
              },
              {
                label: "Système solaire combiné",
                prix_ht: 8500.0,
                unite: "unité",
                tva: 5.5,
                description: "Système solaire pour ECS et chauffage."
              }
            ]
          },
          {
            name: "Chaudière bois",
            options: [
              {
                label: "Chaudière granulés automatique",
                prix_ht: 8500.0,
                unite: "unité",
                tva: 5.5,
                description: "Chaudière à granulés avec alimentation automatique."
              },
              {
                label: "Chaudière bûches",
                prix_ht: 5500.0,
                unite: "unité",
                tva: 5.5,
                description: "Chaudière à bûches avec ballon tampon."
              },
              {
                label: "Poêle bouilleur",
                prix_ht: 3500.0,
                unite: "unité",
                tva: 5.5,
                description: "Poêle bouilleur pour chauffage central."
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
                tva: 10,
                description: "Pose professionnelle avec alimentation eau chaude/froide, évacuation PVC 40mm et test d'étanchéité. Robinetterie incluse."
              },
              {
                label: "Attentes lave-vaisselle",
                prix_ht: 160.0,
                unite: "unité",
                tva: 10,
                description: "Alimentation eau chaude et évacuation pour lave-vaisselle."
              },
              {
                label: "Attentes combinées",
                prix_ht: 280.0,
                unite: "unité",
                tva: 10,
                description: "Attentes pour lave-linge et lave-vaisselle."
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
                tva: 10,
                description: "Installation complète avec tubes PER, raccords laiton et purgeurs automatiques. Test pression à 3 bars inclus."
              },
              {
                label: "Réseau cuivre",
                prix_ht: 45.0,
                unite: "ml",
                tva: 10,
                description: "Réseau chauffage en tube cuivre avec soudures."
              },
              {
                label: "Collecteur de distribution",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Collecteur avec vannes d'équilibrage et débitmètres."
              },
              {
                label: "Vase d'expansion",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Vase d'expansion avec soupape de sécurité."
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
                tva: 10,
                description: "Pose canalisations avec robinetterie d'arrêt, filtres et clapets. Certification NF et test d'étanchéité inclus."
              },
              {
                label: "Réseau PER",
                prix_ht: 25.0,
                unite: "ml",
                tva: 10,
                description: "Réseau en PER avec raccords à compression."
              },
              {
                label: "Réseau cuivre",
                prix_ht: 35.0,
                unite: "ml",
                tva: 10,
                description: "Réseau en tube cuivre avec raccords soudés."
              },
              {
                label: "Nourrice de distribution",
                prix_ht: 280.0,
                unite: "unité",
                tva: 10,
                description: "Nourrice avec vannes d'arrêt individuelles."
              }
            ]
          },
          {
            name: "Évacuations",
            options: [
              {
                label: "Évacuation eaux usées",
                prix_ht: 45.0,
                unite: "ml",
                tva: 10,
                description: "Évacuation PVC avec pentes et ventilation."
              },
              {
                label: "Évacuation eaux vannes",
                prix_ht: 55.0,
                unite: "ml",
                tva: 10,
                description: "Évacuation diamètre 100mm pour WC."
              },
              {
                label: "Siphon de sol",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Siphon de sol avec grille inox."
              },
              {
                label: "Regard de visite",
                prix_ht: 150.0,
                unite: "unité",
                tva: 10,
                description: "Regard de visite avec tampon étanche."
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
                tva: 10,
                description: "Installation complète avec fourniture appareil haut de gamme, raccordement électrique sécurisé et programmation connectée incluse."
              },
              {
                label: "Convecteur électrique",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Convecteur électrique avec thermostat intégré."
              },
              {
                label: "Panneau rayonnant",
                prix_ht: 280.0,
                unite: "unité",
                tva: 10,
                description: "Panneau rayonnant avec programmation."
              },
              {
                label: "Radiateur connecté",
                prix_ht: 450.0,
                unite: "unité",
                tva: 10,
                description: "Radiateur électrique connecté avec application mobile."
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
                tva: 10,
                description: "Pose complète avec robinets thermostatiques, équilibrage hydraulique et test de pression. Dépose ancien radiateur incluse."
              },
              {
                label: "Radiateur acier",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Radiateur acier avec robinets thermostatiques."
              },
              {
                label: "Radiateur fonte",
                prix_ht: 650.0,
                unite: "unité",
                tva: 10,
                description: "Radiateur fonte décoratif avec robinetterie."
              },
              {
                label: "Radiateur design",
                prix_ht: 850.0,
                unite: "unité",
                tva: 10,
                description: "Radiateur design vertical ou horizontal."
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
                tva: 10,
                description: "Échange complet avec vannes haute qualité, réglage précis et garantie d'étanchéité. Compatible tous radiateurs."
              },
              {
                label: "Robinet d'arrêt",
                prix_ht: 45.0,
                unite: "unité",
                tva: 10,
                description: "Robinet d'arrêt avec volant de manœuvre."
              },
              {
                label: "Té de réglage",
                prix_ht: 65.0,
                unite: "unité",
                tva: 10,
                description: "Té de réglage avec débitmètre intégré."
              }
            ]
          },
          {
            name: "Sèche-serviettes",
            options: [
              {
                label: "Sèche-serviette électrique",
                prix_ht: 450.0,
                unite: "unité",
                tva: 10,
                description: "Sèche-serviette électrique avec programmation."
              },
              {
                label: "Sèche-serviette eau chaude",
                prix_ht: 380.0,
                unite: "unité",
                tva: 10,
                description: "Sèche-serviette raccordé au chauffage central."
              },
              {
                label: "Sèche-serviette mixte",
                prix_ht: 650.0,
                unite: "unité",
                tva: 10,
                description: "Sèche-serviette mixte eau chaude et électrique."
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
                tva: 5.5,
                description: "Solution intégrale avec câbles chauffants, isolant thermique, thermostat programmable et raccordement sécurisé au tableau."
              },
              {
                label: "Film chauffant mince",
                prix_ht: 85.0,
                unite: "m²",
                tva: 5.5,
                description: "Film chauffant ultra-mince pour rénovation."
              },
              {
                label: "Trame chauffante",
                prix_ht: 75.0,
                unite: "m²",
                tva: 5.5,
                description: "Trame chauffante pré-assemblée."
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
                tva: 5.5,
                description: "Installation professionnelle avec tubes PER, collecteur équilibré, raccordement chaudière et test de pression prolongé."
              },
              {
                label: "Plancher chauffant-rafraîchissant",
                prix_ht: 95.0,
                unite: "m²",
                tva: 5.5,
                description: "Système réversible pour chauffage et rafraîchissement."
              },
              {
                label: "Plancher sec",
                prix_ht: 120.0,
                unite: "m²",
                tva: 5.5,
                description: "Plancher chauffant sec sans chape."
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
                tva: 10,
                description: "Pose clé en main avec étanchéité renforcée, receveur, raccordements et habillage. Finition premium garantie."
              },
              {
                label: "Receveur de douche",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Receveur de douche avec évacuation et siphon."
              },
              {
                label: "Cabine de douche",
                prix_ht: 850.0,
                unite: "unité",
                tva: 10,
                description: "Cabine de douche complète avec parois et robinetterie."
              },
              {
                label: "Colonne de douche",
                prix_ht: 450.0,
                unite: "unité",
                tva: 10,
                description: "Colonne de douche avec douchette et pommeau."
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
                tva: 10,
                description: "Installation complète incluant siphon, alimentations et tests d'étanchéité. Fixation murale ou sur meuble."
              },
              {
                label: "Vasque à poser",
                prix_ht: 280.0,
                unite: "unité",
                tva: 10,
                description: "Vasque à poser avec plan de toilette."
              },
              {
                label: "Lave-mains",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Lave-mains compact avec robinetterie."
              },
              {
                label: "Meuble vasque",
                prix_ht: 650.0,
                unite: "unité",
                tva: 10,
                description: "Meuble vasque avec plan et robinetterie."
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
                tva: 10,
                description: "Pose professionnelle avec réservation, raccordements et habillage. Dépose ancien WC incluse."
              },
              {
                label: "WC au sol",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "WC posé au sol avec réservoir apparent."
              },
              {
                label: "WC avec broyeur",
                prix_ht: 750.0,
                unite: "unité",
                tva: 10,
                description: "WC avec broyeur intégré pour évacuation forcée."
              },
              {
                label: "WC japonais",
                prix_ht: 1500.0,
                unite: "unité",
                tva: 10,
                description: "WC japonais avec fonctions lavantes."
              }
            ]
          },
          {
            name: "Baignoire",
            options: [
              {
                label: "Baignoire acrylique",
                prix_ht: 650.0,
                unite: "unité",
                tva: 10,
                description: "Baignoire acrylique avec robinetterie et vidage."
              },
              {
                label: "Baignoire fonte",
                prix_ht: 1200.0,
                unite: "unité",
                tva: 10,
                description: "Baignoire fonte émaillée avec pieds."
              },
              {
                label: "Baignoire balnéo",
                prix_ht: 2500.0,
                unite: "unité",
                tva: 10,
                description: "Baignoire balnéothérapie avec système de massage."
              },
              {
                label: "Baignoire îlot",
                prix_ht: 1800.0,
                unite: "unité",
                tva: 10,
                description: "Baignoire îlot design avec robinetterie sur colonne."
              }
            ]
          },
          {
            name: "Évier",
            options: [
              {
                label: "Évier inox 1 bac",
                prix_ht: 280.0,
                unite: "unité",
                tva: 10,
                description: "Évier inox 1 bac avec robinetterie."
              },
              {
                label: "Évier inox 2 bacs",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Évier inox 2 bacs avec égouttoir."
              },
              {
                label: "Évier céramique",
                prix_ht: 450.0,
                unite: "unité",
                tva: 10,
                description: "Évier céramique blanc avec robinetterie."
              },
              {
                label: "Évier granit",
                prix_ht: 650.0,
                unite: "unité",
                tva: 10,
                description: "Évier en granit reconstitué avec robinetterie."
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
                tva: 5.5,
                description: "Solution complète conforme RE2020 avec récupération de chaleur, gaines isolées et bouches haut débit. Mise en service incluse."
              },
              {
                label: "VMC double flux thermodynamique",
                prix_ht: 3500.0,
                unite: "unité",
                tva: 5.5,
                description: "VMC DF avec pompe à chaleur intégrée."
              },
              {
                label: "VMC double flux décentralisée",
                prix_ht: 1500.0,
                unite: "unité",
                tva: 5.5,
                description: "Système décentralisé pour rénovation."
              }
            ]
          },
          {
            name: "VMC simple flux",
            options: [
              {
                label: "VMC simple flux autoréglable",
                prix_ht: 650.0,
                unite: "unité",
                tva: 5.5,
                description: "VMC simple flux avec bouches autoréglables."
              },
              {
                label: "VMC simple flux hygroréglable",
                prix_ht: 850.0,
                unite: "unité",
                tva: 5.5,
                description: "VMC simple flux avec régulation hygrométrique."
              },
              {
                label: "Extracteur d'air",
                prix_ht: 180.0,
                unite: "unité",
                tva: 5.5,
                description: "Extracteur d'air pour pièce humide."
              }
            ]
          },
          {
            name: "Ventilation naturelle",
            options: [
              {
                label: "Grilles de ventilation",
                prix_ht: 45.0,
                unite: "unité",
                tva: 10,
                description: "Grilles de ventilation réglables."
              },
              {
                label: "Aérateurs de fenêtre",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Aérateurs autoréglables pour fenêtres."
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
                tva: 10,
                description: "Pose complète avec unité murale silencieuse (<25dB), télécommande WiFi et filtre antiallergique. Garantie 5 ans."
              },
              {
                label: "Climatisation réversible standard",
                prix_ht: 2200.0,
                unite: "unité",
                tva: 10,
                description: "Climatisation réversible avec unité extérieure."
              },
              {
                label: "Climatisation gainable",
                prix_ht: 3500.0,
                unite: "unité",
                tva: 10,
                description: "Climatisation gainable avec réseau de gaines."
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
                tva: 10,
                description: "Installation professionnelle avec gestion individuelle des pièces, régulation précise et design discret. Contrat maintenance inclus."
              },
              {
                label: "Multisplit 2 zones",
                prix_ht: 4500.0,
                unite: "unité",
                tva: 10,
                description: "Climatisation multisplit pour 2 pièces."
              },
              {
                label: "Multisplit 4 zones",
                prix_ht: 8500.0,
                unite: "unité",
                tva: 10,
                description: "Climatisation multisplit pour 4 pièces."
              }
            ]
          },
          {
            name: "Climatisation centralisée",
            options: [
              {
                label: "Système VRV/VRF",
                prix_ht: 450.0,
                unite: "m²",
                tva: 10,
                description: "Système de climatisation centralisée à débit variable."
              },
              {
                label: "Centrale de traitement d'air",
                prix_ht: 8500.0,
                unite: "unité",
                tva: 10,
                description: "CTA avec filtration et récupération de chaleur."
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
                tva: 20,
                description: "Conception complète incluant : plan 2D détaillé, implantation des prises/éclairages, schéma du tableau électrique, gestion des zones humides. Validation client incluse avec 3 modifications possibles."
              },
              {
                label: "Étude de faisabilité",
                prix_ht: 280.0,
                unite: "projet",
                tva: 20,
                description: "Analyse de l'installation existante et faisabilité des modifications."
              },
              {
                label: "Schéma unifilaire",
                prix_ht: 180.0,
                unite: "projet",
                tva: 20,
                description: "Schéma unifilaire du tableau électrique."
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
                tva: 10,
                description: "Tableau divisionnaire 12 à 24 modules avec disjoncteurs différentiels 30mA. Inclut : coffret, rangement des câbles, tests électriques et certification partielle. Fourniture Hager ou Schneider."
              },
              {
                label: "Tableau 1 rangée",
                prix_ht: 650.0,
                unite: "unité",
                tva: 10,
                description: "Tableau électrique 1 rangée 13 modules."
              },
              {
                label: "Tableau 2 rangées",
                prix_ht: 850.0,
                unite: "unité",
                tva: 10,
                description: "Tableau électrique 2 rangées 26 modules."
              },
              {
                label: "Tableau 3 rangées",
                prix_ht: 1050.0,
                unite: "unité",
                tva: 10,
                description: "Tableau électrique 3 rangées 39 modules."
              },
              {
                label: "Tableau 4 rangées",
                prix_ht: 1350.0,
                unite: "unité",
                tva: 10,
                description: "Tableau électrique 4 rangées 52 modules."
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
                tva: 10,
                description: "Pose des gaines ICTA, câbles cuivre 1.5 à 6mm² et raccordement au tableau. Inclut : repérage des circuits, protection différentielle et tests de conformité. Solution prête à raccorder."
              },
              {
                label: "Circuit éclairage",
                prix_ht: 85.0,
                unite: "circuit",
                tva: 10,
                description: "Circuit éclairage complet avec disjoncteur 16A."
              },
              {
                label: "Circuit prise 16A",
                prix_ht: 95.0,
                unite: "circuit",
                tva: 10,
                description: "Circuit prises 16A avec disjoncteur 20A."
              },
              {
                label: "Circuit spécialisé",
                prix_ht: 120.0,
                unite: "circuit",
                tva: 10,
                description: "Circuit spécialisé pour gros électroménager."
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
                tva: 10,
                description: "Installation clé en main de la GTL avec tableau communication, pré-câblage RJ45 et préparation fibre optique. Inclut gestion des arrivées opérateurs et espace domotique."
              },
              {
                label: "Coffret de communication",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Coffret de communication grade 3 avec répartiteur."
              },
              {
                label: "Câblage RJ45",
                prix_ht: 45.0,
                unite: "point",
                tva: 10,
                description: "Point RJ45 avec câble cat 6 et connectique."
              }
            ]
          },
          {
            name: "Protection et sécurité",
            options: [
              {
                label: "Disjoncteur différentiel 30mA",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Disjoncteur différentiel type AC ou A."
              },
              {
                label: "Parafoudre",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Parafoudre type 2 pour protection des équipements."
              },
              {
                label: "Délesteur",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Délesteur pour gestion de la puissance."
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
                tva: 10,
                description: "Installation de radiateurs à inertie avec thermostat connecté. Inclut : dépose ancien modèle, raccordement sécurisé, réglage et garantie 5 ans. Consommation optimisée."
              },
              {
                label: "Radiateur à inertie sèche",
                prix_ht: 450.0,
                unite: "unité",
                tva: 10,
                description: "Radiateur à inertie sèche avec programmation."
              },
              {
                label: "Radiateur à inertie fluide",
                prix_ht: 380.0,
                unite: "unité",
                tva: 10,
                description: "Radiateur à inertie fluide avec thermostat."
              },
              {
                label: "Convecteur design",
                prix_ht: 250.0,
                unite: "unité",
                tva: 10,
                description: "Convecteur électrique design avec thermostat."
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
                tva: 5.5,
                description: "Solution tout compris : isolation, câbles chauffants, thermostat programmable et raccordement au tableau. Inclut tests de résistance et mise en service professionnelle."
              },
              {
                label: "Régulation plancher chauffant",
                prix_ht: 350.0,
                unite: "zone",
                tva: 5.5,
                description: "Thermostat programmable pour plancher chauffant."
              }
            ]
          },
          {
            name: "Chauffage d'appoint",
            options: [
              {
                label: "Cheminée électrique",
                prix_ht: 850.0,
                unite: "unité",
                tva: 10,
                description: "Cheminée électrique décorative avec chauffage."
              },
              {
                label: "Poêle électrique",
                prix_ht: 650.0,
                unite: "unité",
                tva: 10,
                description: "Poêle électrique avec effet flamme."
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
                tva: 10,
                description: "Pose de prises 16A avec terre, interrupteurs et éclairages selon normes. Inclut : découpes, boîtes d'encastrement, raccordement et tests. Choix finitions (coulissants, tactiles...)"
              },
              {
                label: "Prise 16A standard",
                prix_ht: 45.0,
                unite: "unité",
                tva: 10,
                description: "Prise 16A avec terre et boîtier d'encastrement."
              },
              {
                label: "Prise 32A",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Prise 32A pour gros électroménager."
              },
              {
                label: "Interrupteur simple",
                prix_ht: 35.0,
                unite: "unité",
                tva: 10,
                description: "Interrupteur simple avec boîtier."
              },
              {
                label: "Interrupteur va-et-vient",
                prix_ht: 55.0,
                unite: "unité",
                tva: 10,
                description: "Interrupteur va-et-vient avec câblage."
              },
              {
                label: "Télérupteur",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Télérupteur avec boutons poussoirs."
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
                tva: 10,
                description: "Installation spécifique zone humide : prises IP44, trafo 12V pour miroir, spots étanches. Respect des volumes et sécurité maximale. Inclut attestation de conformité."
              },
              {
                label: "Pack domotique de base",
                prix_ht: 1800.0,
                unite: "logement",
                tva: 10,
                description: "Solution clé en main : gestion éclairage/prises connectées, thermostat intelligent, interface centralisée. Compatible Alexa/Google Home. Installation et paramétrage inclus."
              },
              {
                label: "Éclairage LED intégré",
                prix_ht: 120.0,
                unite: "point",
                tva: 10,
                description: "Spot LED encastrable avec alimentation."
              },
              {
                label: "Variateur d'éclairage",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Variateur compatible LED avec bouton rotatif."
              }
            ]
          },
          {
            name: "Éclairage extérieur",
            options: [
              {
                label: "Applique extérieure",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Applique extérieure étanche avec détecteur."
              },
              {
                label: "Projecteur LED",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Projecteur LED avec détecteur de mouvement."
              },
              {
                label: "Éclairage de jardin",
                prix_ht: 85.0,
                unite: "point",
                tva: 10,
                description: "Borne d'éclairage de jardin avec câblage enterré."
              }
            ]
          }
        ]
      },
      {
        name: "Domotique et automatismes",
        items: [
          {
            name: "Systèmes domotiques",
            options: [
              {
                label: "Box domotique",
                prix_ht: 650.0,
                unite: "unité",
                tva: 10,
                description: "Box domotique avec application mobile."
              },
              {
                label: "Modules connectés",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Module connecté pour prise ou éclairage."
              },
              {
                label: "Thermostat connecté",
                prix_ht: 280.0,
                unite: "unité",
                tva: 10,
                description: "Thermostat connecté avec programmation."
              },
              {
                label: "Volets roulants connectés",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Motorisation connectée pour volets roulants."
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
                tva: 20,
                description: "Accompagnement complet : vérification pré-contrôle, préparation dossier, assistance au contrôle et régularisation si nécessaire. Garantie d'obtention du certificat."
              },
              {
                label: "Diagnostic électrique",
                prix_ht: 180.0,
                unite: "logement",
                tva: 20,
                description: "Diagnostic de l'installation électrique existante."
              },
              {
                label: "Mise aux normes partielle",
                prix_ht: 850.0,
                unite: "logement",
                tva: 10,
                description: "Mise aux normes des éléments de sécurité prioritaires."
              },
              {
                label: "Mise aux normes complète",
                prix_ht: 2500.0,
                unite: "logement",
                tva: 10,
                description: "Mise aux normes complète de l'installation électrique."
              }
            ]
          }
        ]
      },
      {
        name: "Réseaux et communication",
        items: [
          {
            name: "Réseau informatique",
            options: [
              {
                label: "Câblage réseau RJ45",
                prix_ht: 65.0,
                unite: "point",
                tva: 10,
                description: "Point réseau RJ45 cat 6 avec connectique."
              },
              {
                label: "Switch réseau",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Switch réseau 8 ports gigabit."
              },
              {
                label: "Point d'accès WiFi",
                prix_ht: 250.0,
                unite: "unité",
                tva: 10,
                description: "Point d'accès WiFi professionnel."
              }
            ]
          },
          {
            name: "Téléphonie",
            options: [
              {
                label: "Prise téléphonique",
                prix_ht: 45.0,
                unite: "unité",
                tva: 10,
                description: "Prise téléphonique RJ11 avec câblage."
              },
              {
                label: "Répartiteur téléphonique",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Répartiteur téléphonique avec protection."
              }
            ]
          },
          {
            name: "Télévision",
            options: [
              {
                label: "Prise TV/SAT",
                prix_ht: 65.0,
                unite: "unité",
                tva: 10,
                description: "Prise TV/satellite avec répartiteur."
              },
              {
                label: "Antenne TNT",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Antenne TNT avec amplificateur."
              },
              {
                label: "Parabole satellite",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Parabole satellite avec décodeur."
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
                tva: 10,
                description: "Pose professionnelle incluant préparation du support, jointoiement hydrofuge et finition parfaite. Plinthes assorties incluses."
              },
              {
                label: "Carrelage petit format (< 20cm)",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Pose de carrelage petit format avec joints fins."
              },
              {
                label: "Carrelage grand format (> 60cm)",
                prix_ht: 75.0,
                unite: "m²",
                tva: 10,
                description: "Pose de carrelage grand format avec ventouses."
              },
              {
                label: "Carrelage rectifié",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Pose de carrelage rectifié avec joints minces."
              },
              {
                label: "Pose en chevron",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Pose décorative en chevron ou bâtons rompus."
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
                tva: 10,
                description: "Pose délicate avec calepinage précis, joints fins et finition lustrée. Protection hydrofuge incluse."
              },
              {
                label: "Mosaïque verre",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Mosaïque en pâte de verre avec joints colorés."
              },
              {
                label: "Mosaïque pierre naturelle",
                prix_ht: 110.0,
                unite: "m²",
                tva: 10,
                description: "Mosaïque en pierre naturelle avec traitement."
              },
              {
                label: "Mosaïque métallique",
                prix_ht: 120.0,
                unite: "m²",
                tva: 10,
                description: "Mosaïque métallique inox ou aluminium."
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
                tva: 10,
                description: "Pose sur chape parfaite avec traitement imperméabilisant. Finition cire naturelle pour protection durable."
              },
              {
                label: "Carreaux de ciment unis",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Carreaux de ciment unis avec finition mate."
              },
              {
                label: "Carreaux de ciment à motifs",
                prix_ht: 110.0,
                unite: "m²",
                tva: 10,
                description: "Carreaux de ciment avec motifs géométriques."
              }
            ]
          },
          {
            name: "Carrelage technique",
            options: [
              {
                label: "Carrelage antidérapant",
                prix_ht: 75.0,
                unite: "m²",
                tva: 10,
                description: "Carrelage antidérapant pour zones humides."
              },
              {
                label: "Carrelage industriel",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Carrelage haute résistance pour usage intensif."
              },
              {
                label: "Carrelage chauffant",
                prix_ht: 120.0,
                unite: "m²",
                tva: 10,
                description: "Carrelage avec système chauffant intégré."
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
                tva: 10,
                description: "Pose traditionnelle avec sous-couche isolante, finition huilée ou vitrifiée au choix. Plinthes assorties."
              },
              {
                label: "Parquet massif chêne",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Parquet chêne massif 20mm avec finition."
              },
              {
                label: "Parquet massif exotique",
                prix_ht: 120.0,
                unite: "m²",
                tva: 10,
                description: "Parquet en bois exotique (teck, wengé)."
              },
              {
                label: "Parquet massif français",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Parquet en essences françaises (châtaignier, frêne)."
              }
            ]
          },
          {
            name: "Parquet contrecollé",
            options: [
              {
                label: "Parquet contrecollé flottant",
                prix_ht: 45.0,
                unite: "m²",
                tva: 10,
                description: "Parquet contrecollé avec sous-couche phonique."
              },
              {
                label: "Parquet contrecollé collé",
                prix_ht: 55.0,
                unite: "m²",
                tva: 10,
                description: "Parquet contrecollé collé en plein."
              },
              {
                label: "Parquet 3 plis",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Parquet contrecollé 3 plis haute qualité."
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
                tva: 10,
                description: "Ponçage professionnel, rebouchage, traitement anti-termites et finition cire ou vernis. Garantie 5 ans."
              },
              {
                label: "Ponçage et vitrification",
                prix_ht: 35.0,
                unite: "m²",
                tva: 10,
                description: "Ponçage et application de vitrificateur."
              },
              {
                label: "Ponçage et huilage",
                prix_ht: 40.0,
                unite: "m²",
                tva: 10,
                description: "Ponçage et application d'huile naturelle."
              },
              {
                label: "Réparation lames abîmées",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Remplacement des lames endommagées."
              }
            ]
          },
          {
            name: "Parquet stratifié",
            options: [
              {
                label: "Stratifié classe 32",
                prix_ht: 25.0,
                unite: "m²",
                tva: 10,
                description: "Stratifié usage domestique avec sous-couche."
              },
              {
                label: "Stratifié classe 33",
                prix_ht: 35.0,
                unite: "m²",
                tva: 10,
                description: "Stratifié usage commercial avec garantie."
              },
              {
                label: "Stratifié hydrofuge",
                prix_ht: 45.0,
                unite: "m²",
                tva: 10,
                description: "Stratifié résistant à l'humidité."
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
                tva: 10,
                description: "Pose sur sol parfaitement plan avec sous-couche insonorisante. Finitions bords et raccords invisibles."
              },
              {
                label: "LVT clipsable",
                prix_ht: 38.0,
                unite: "m²",
                tva: 10,
                description: "Lames vinyle clipsables imitation bois."
              },
              {
                label: "LVT collé",
                prix_ht: 45.0,
                unite: "m²",
                tva: 10,
                description: "Lames vinyle collées haute résistance."
              },
              {
                label: "Sol PVC en lés",
                prix_ht: 35.0,
                unite: "m²",
                tva: 10,
                description: "Sol PVC en lés avec soudure à chaud."
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
                tva: 10,
                description: "Installation avec sous-couche anti-humidité, traitement anti-taches et antidérapant pour escaliers."
              },
              {
                label: "Moquette aiguilletée",
                prix_ht: 25.0,
                unite: "m²",
                tva: 10,
                description: "Moquette aiguilletée pour usage intensif."
              },
              {
                label: "Moquette de luxe",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Moquette pure laine ou mohair."
              },
              {
                label: "Dalles de moquette",
                prix_ht: 45.0,
                unite: "m²",
                tva: 10,
                description: "Dalles de moquette modulaires."
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
                tva: 10,
                description: "Préparation du support, application en 3 couches avec finition mate ou satinée. Résistance aux chocs."
              },
              {
                label: "Béton ciré décoratif",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Béton ciré avec effets colorés ou métallisés."
              },
              {
                label: "Béton lissé",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Béton lissé avec protection de surface."
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
                tva: 10,
                description: "Nettoyage profond, rejointement à la chaux, traitement hydrofuge et cire naturelle. Conservation du patrimoine."
              },
              {
                label: "Nettoyage et protection",
                prix_ht: 45.0,
                unite: "m²",
                tva: 10,
                description: "Nettoyage et application de protection."
              },
              {
                label: "Remplacement tomettes cassées",
                prix_ht: 120.0,
                unite: "m²",
                tva: 10,
                description: "Remplacement des tomettes endommagées."
              }
            ]
          },
          {
            name: "Sols naturels",
            options: [
              {
                label: "Jonc de mer",
                prix_ht: 35.0,
                unite: "m²",
                tva: 10,
                description: "Jonc de mer naturel avec finitions."
              },
              {
                label: "Sisal",
                prix_ht: 45.0,
                unite: "m²",
                tva: 10,
                description: "Sisal naturel résistant à l'usure."
              },
              {
                label: "Coco",
                prix_ht: 40.0,
                unite: "m²",
                tva: 10,
                description: "Fibre de coco naturelle antidérapante."
              },
              {
                label: "Bambou",
                prix_ht: 55.0,
                unite: "m²",
                tva: 10,
                description: "Parquet bambou écologique."
              }
            ]
          },
          {
            name: "Sols techniques",
            options: [
              {
                label: "Sol antidérapant",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Revêtement antidérapant pour zones humides."
              },
              {
                label: "Sol antistatique",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Sol conducteur pour zones sensibles."
              },
              {
                label: "Sol acoustique",
                prix_ht: 75.0,
                unite: "m²",
                tva: 10,
                description: "Revêtement avec isolation phonique intégrée."
              }
            ]
          }
        ]
      },
      {
        name: "Pierre naturelle",
        items: [
          {
            name: "Dallage pierre",
            options: [
              {
                label: "Travertin",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Dallage travertin avec finition antique."
              },
              {
                label: "Marbre",
                prix_ht: 120.0,
                unite: "m²",
                tva: 10,
                description: "Dallage marbre poli avec protection."
              },
              {
                label: "Granit",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Dallage granit flammé ou poli."
              },
              {
                label: "Ardoise",
                prix_ht: 75.0,
                unite: "m²",
                tva: 10,
                description: "Dallage ardoise naturelle clivée."
              },
              {
                label: "Pierre calcaire",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Dallage pierre calcaire française."
              }
            ]
          }
        ]
      },
      {
        name: "Finitions et accessoires",
        items: [
          {
            name: "Plinthes",
            options: [
              {
                label: "Plinthes assorties au sol",
                prix_ht: 18.0,
                unite: "ml",
                tva: 10,
                description: "Plinthes dans le même matériau que le sol."
              },
              {
                label: "Plinthes bois massif",
                prix_ht: 25.0,
                unite: "ml",
                tva: 10,
                description: "Plinthes en bois massif avec finition."
              },
              {
                label: "Plinthes MDF",
                prix_ht: 12.0,
                unite: "ml",
                tva: 10,
                description: "Plinthes MDF prêtes à peindre."
              },
              {
                label: "Plinthes carrelage",
                prix_ht: 22.0,
                unite: "ml",
                tva: 10,
                description: "Plinthes en carrelage assorti."
              }
            ]
          },
          {
            name: "Seuils et transitions",
            options: [
              {
                label: "Seuil de porte",
                prix_ht: 45.0,
                unite: "unité",
                tva: 10,
                description: "Seuil de porte en métal ou bois."
              },
              {
                label: "Barre de seuil",
                prix_ht: 35.0,
                unite: "ml",
                tva: 10,
                description: "Barre de seuil pour transition entre sols."
              },
              {
                label: "Nez de marche",
                prix_ht: 28.0,
                unite: "ml",
                tva: 10,
                description: "Nez de marche antidérapant."
              }
            ]
          },
          {
            name: "Préparation supports",
            options: [
              {
                label: "Ragréage autolissant",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Ragréage pour mise à niveau du sol."
              },
              {
                label: "Primaire d'accrochage",
                prix_ht: 8.0,
                unite: "m²",
                tva: 10,
                description: "Primaire pour améliorer l'adhérence."
              },
              {
                label: "Sous-couche isolante",
                prix_ht: 12.0,
                unite: "m²",
                tva: 10,
                description: "Sous-couche phonique et thermique."
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
                tva: 10,
                description: "Prestation complète incluant préparation des supports, protection des sols, application de 2 couches de peinture acrylique haut de gamme et finition professionnelle."
              },
              {
                label: "Peinture glycéro",
                prix_ht: 18.0,
                unite: "m²",
                tva: 10,
                description: "Peinture glycérophtalique pour pièces humides."
              },
              {
                label: "Peinture écologique",
                prix_ht: 22.0,
                unite: "m²",
                tva: 10,
                description: "Peinture naturelle sans COV."
              },
              {
                label: "Peinture décorative",
                prix_ht: 35.0,
                unite: "m²",
                tva: 10,
                description: "Peinture avec effets (pailletée, métallisée)."
              },
              {
                label: "Peinture magnétique",
                prix_ht: 45.0,
                unite: "m²",
                tva: 10,
                description: "Peinture magnétique pour murs interactifs."
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
                tva: 10,
                description: "Application professionnelle de toile de verre sur murs et plafonds, incluant préparation du support, colle spécifique et finition peinte sur mesure."
              },
              {
                label: "Toile de verre fine",
                prix_ht: 25.0,
                unite: "m²",
                tva: 10,
                description: "Toile de verre fine pour finition lisse."
              },
              {
                label: "Toile de verre moyenne",
                prix_ht: 28.0,
                unite: "m²",
                tva: 10,
                description: "Toile de verre moyenne pour masquer défauts."
              },
              {
                label: "Toile de verre grossière",
                prix_ht: 32.0,
                unite: "m²",
                tva: 10,
                description: "Toile de verre grossière pour gros défauts."
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
                tva: 10,
                description: "Pose experte avec préparation murale parfaite, encollage et lissage professionnel pour un résultat sans bulle ni défaut. Découpes précises incluses."
              },
              {
                label: "Papier peint traditionnel",
                prix_ht: 18.0,
                unite: "m²",
                tva: 10,
                description: "Papier peint traditionnel avec colle."
              },
              {
                label: "Papier peint panoramique",
                prix_ht: 45.0,
                unite: "m²",
                tva: 10,
                description: "Papier peint panoramique sur mesure."
              },
              {
                label: "Papier peint textile",
                prix_ht: 55.0,
                unite: "m²",
                tva: 10,
                description: "Papier peint textile haut de gamme."
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
                tva: 10,
                description: "Rénovation complète incluant décapage si nécessaire, ponçage, application peinture spécifique (thermorésistante pour radiateurs) et finition durable."
              },
              {
                label: "Peinture volets",
                prix_ht: 65.0,
                unite: "unité",
                tva: 10,
                description: "Peinture volets avec protection UV."
              },
              {
                label: "Peinture escalier",
                prix_ht: 45.0,
                unite: "marche",
                tva: 10,
                description: "Peinture escalier avec peinture antidérapante."
              },
              {
                label: "Peinture plafond",
                prix_ht: 12.0,
                unite: "m²",
                tva: 10,
                description: "Peinture plafond mate anti-traces."
              }
            ]
          },
          {
            name: "Préparation supports",
            options: [
              {
                label: "Rebouchage fissures",
                prix_ht: 8.0,
                unite: "ml",
                tva: 10,
                description: "Rebouchage et ponçage des fissures."
              },
              {
                label: "Ponçage murs",
                prix_ht: 6.0,
                unite: "m²",
                tva: 10,
                description: "Ponçage des murs avant peinture."
              },
              {
                label: "Sous-couche d'accrochage",
                prix_ht: 5.0,
                unite: "m²",
                tva: 10,
                description: "Application de sous-couche spécialisée."
              },
              {
                label: "Décapage peinture",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Décapage de l'ancienne peinture."
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
                tva: 10,
                description: "Pose technique avec étanchéité intégrale, joints hydrofuges et finitions parfaites pour douches et baignoires. Choix de pose droit/diagonal."
              },
              {
                label: "Faïence petit format",
                prix_ht: 75.0,
                unite: "m²",
                tva: 10,
                description: "Faïence format métro ou petit carré."
              },
              {
                label: "Faïence grand format",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Faïence grand format avec ventouses."
              },
              {
                label: "Faïence relief",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Faïence avec relief ou texture."
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
                tva: 10,
                description: "Travail artisanal pour créations uniques avec calepinage personnalisé, joints colorés au choix et traitement hydrofuge renforcé."
              },
              {
                label: "Mosaïque émaux",
                prix_ht: 110.0,
                unite: "m²",
                tva: 10,
                description: "Mosaïque en émaux de Briare."
              },
              {
                label: "Mosaïque métallique",
                prix_ht: 125.0,
                unite: "m²",
                tva: 10,
                description: "Mosaïque inox ou aluminium."
              },
              {
                label: "Mosaïque nacre",
                prix_ht: 150.0,
                unite: "m²",
                tva: 10,
                description: "Mosaïque en nacre naturelle."
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
                tva: 10,
                description: "Installation experte avec traitement imperméabilisant avant et après pose pour espaces humides. Finition cire naturelle incluse."
              },
              {
                label: "Carreaux de ciment unis",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Carreaux de ciment unis colorés."
              },
              {
                label: "Carreaux de ciment à motifs",
                prix_ht: 125.0,
                unite: "m²",
                tva: 10,
                description: "Carreaux de ciment avec motifs complexes."
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
                tva: 10,
                description: "Installation de profilés aluminium ou PVC pour finitions parfaites (angles, transitions). Large choix de coloris disponible."
              },
              {
                label: "Joints décoratifs",
                prix_ht: 8.0,
                unite: "ml",
                tva: 10,
                description: "Joints colorés ou pailletés."
              },
              {
                label: "Traitement hydrofuge",
                prix_ht: 12.0,
                unite: "m²",
                tva: 10,
                description: "Traitement hydrofuge des joints."
              }
            ]
          },
          {
            name: "Carrelage technique",
            options: [
              {
                label: "Carrelage antidérapant",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Carrelage antidérapant pour douches."
              },
              {
                label: "Carrelage chauffant",
                prix_ht: 150.0,
                unite: "m²",
                tva: 10,
                description: "Carrelage avec chauffage intégré."
              }
            ]
          }
        ]
      },
      {
        name: "Revêtements décoratifs",
        items: [
          {
            name: "Lambris",
            options: [
              {
                label: "Lambris bois massif",
                prix_ht: 45.0,
                unite: "m²",
                tva: 10,
                description: "Lambris en bois massif avec finition."
              },
              {
                label: "Lambris PVC",
                prix_ht: 35.0,
                unite: "m²",
                tva: 10,
                description: "Lambris PVC pour pièces humides."
              },
              {
                label: "Lambris MDF",
                prix_ht: 28.0,
                unite: "m²",
                tva: 10,
                description: "Lambris MDF prêt à peindre."
              }
            ]
          },
          {
            name: "Parement pierre",
            options: [
              {
                label: "Parement pierre naturelle",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Parement en pierre naturelle."
              },
              {
                label: "Parement pierre reconstituée",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Parement en pierre reconstituée."
              },
              {
                label: "Plaquettes de brique",
                prix_ht: 55.0,
                unite: "m²",
                tva: 10,
                description: "Plaquettes de parement brique."
              }
            ]
          },
          {
            name: "Enduits décoratifs",
            options: [
              {
                label: "Enduit à la chaux",
                prix_ht: 35.0,
                unite: "m²",
                tva: 10,
                description: "Enduit décoratif à la chaux."
              },
              {
                label: "Tadelakt",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Enduit tadelakt traditionnel."
              },
              {
                label: "Stuc vénitien",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Stuc vénitien avec finition cirée."
              }
            ]
          },
          {
            name: "Revêtements naturels",
            options: [
              {
                label: "Paille japonaise",
                prix_ht: 45.0,
                unite: "m²",
                tva: 10,
                description: "Paille japonaise naturelle."
              },
              {
                label: "Tissu mural",
                prix_ht: 55.0,
                unite: "m²",
                tva: 10,
                description: "Tissu mural tendu sur cadre."
              },
              {
                label: "Liège mural",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Revêtement liège naturel."
              }
            ]
          }
        ]
      },
      {
        name: "Plafonds décoratifs",
        items: [
          {
            name: "Plafonds tendus",
            options: [
              {
                label: "Plafond tendu mat",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Plafond tendu mat avec éclairage intégré."
              },
              {
                label: "Plafond tendu laqué",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Plafond tendu laqué brillant."
              },
              {
                label: "Plafond tendu imprimé",
                prix_ht: 95.0,
                unite: "m²",
                tva: 10,
                description: "Plafond tendu avec impression personnalisée."
              }
            ]
          },
          {
            name: "Moulures et corniches",
            options: [
              {
                label: "Moulures plâtre",
                prix_ht: 25.0,
                unite: "ml",
                tva: 10,
                description: "Moulures décoratives en plâtre."
              },
              {
                label: "Corniches éclairantes",
                prix_ht: 45.0,
                unite: "ml",
                tva: 10,
                description: "Corniches avec éclairage LED intégré."
              },
              {
                label: "Rosaces de plafond",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Rosaces décoratives pour luminaires."
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
                tva: 10,
                description: "Solution clé en main comprenant : structure en MDF/massif, portes coulissantes ou battantes, système d'éclairage LED intégré, rangements modulables et finition laquée/bois noble. Livraison et pose incluses."
              },
              {
                label: "Dressing d'angle",
                prix_ht: 520.0,
                unite: "ml",
                tva: 10,
                description: "Dressing d'angle optimisé avec plateaux tournants."
              },
              {
                label: "Dressing avec îlot central",
                prix_ht: 650.0,
                unite: "ml",
                tva: 10,
                description: "Dressing avec îlot central et tiroirs."
              },
              {
                label: "Dressing sous pente",
                prix_ht: 380.0,
                unite: "ml",
                tva: 10,
                description: "Dressing adapté aux combles et sous-pentes."
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
                tva: 10,
                description: "Création unique avec niches intégrées, éclairage LED, étagères réglables et possibilité de portes vitrées. Finition au choix : peinture haute résistance ou placage bois massif."
              },
              {
                label: "Bibliothèque murale",
                prix_ht: 320.0,
                unite: "ml",
                tva: 10,
                description: "Bibliothèque fixée au mur avec étagères invisibles."
              },
              {
                label: "Bibliothèque avec bureau intégré",
                prix_ht: 480.0,
                unite: "ml",
                tva: 10,
                description: "Bibliothèque avec espace bureau et rangements."
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
                tva: 10,
                description: "Aménagement complet avec façades sur-mesure, tiroirs à fermeture amortie, plans de travail en quartz/composite et intégration d'électroménager. 3 finitions au choix."
              },
              {
                label: "Cuisine linéaire",
                prix_ht: 580.0,
                unite: "ml",
                tva: 10,
                description: "Cuisine linéaire avec optimisation de l'espace."
              },
              {
                label: "Cuisine en L",
                prix_ht: 620.0,
                unite: "ml",
                tva: 10,
                description: "Cuisine en L avec angle optimisé."
              },
              {
                label: "Cuisine avec îlot",
                prix_ht: 850.0,
                unite: "ml",
                tva: 10,
                description: "Cuisine avec îlot central multifonction."
              }
            ]
          },
          {
            name: "Rangements spécialisés",
            options: [
              {
                label: "Placard sous escalier",
                prix_ht: 350.0,
                unite: "ml",
                tva: 10,
                description: "Optimisation de l'espace sous escalier."
              },
              {
                label: "Meuble TV intégré",
                prix_ht: 450.0,
                unite: "ml",
                tva: 10,
                description: "Meuble TV sur mesure avec rangements."
              },
              {
                label: "Banquette avec coffre",
                prix_ht: 380.0,
                unite: "ml",
                tva: 10,
                description: "Banquette avec rangement intégré."
              },
              {
                label: "Tête de lit avec rangements",
                prix_ht: 650.0,
                unite: "unité",
                tva: 10,
                description: "Tête de lit sur mesure avec tables de chevet intégrées."
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
                tva: 10,
                description: "Porte en bois massif ou alvéolaire avec quincaillerie premium (paumelles silencieuses, poignée design). Pose incluse avec réglage parfait et finitions."
              },
              {
                label: "Porte postformée",
                prix_ht: 450.0,
                unite: "unité",
                tva: 10,
                description: "Porte postformée prête à peindre."
              },
              {
                label: "Porte stratifiée",
                prix_ht: 380.0,
                unite: "unité",
                tva: 10,
                description: "Porte stratifiée décor bois."
              },
              {
                label: "Porte bois massif",
                prix_ht: 1200.0,
                unite: "unité",
                tva: 10,
                description: "Porte en bois massif avec finition naturelle."
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
                tva: 10,
                description: "Porte isolante phonique (jusqu'à 32dB) et thermique avec joints périphériques. Cadre renforcé et système de fermeture automatique optionnel."
              },
              {
                label: "Porte coulissante à galandage",
                prix_ht: 1800.0,
                unite: "unité",
                tva: 10,
                description: "Système coulissant intégré au mur avec mécanisme silencieux haut de gamme. Personnalisation des panneaux (verre, bois, laque)."
              },
              {
                label: "Porte coulissante apparente",
                prix_ht: 950.0,
                unite: "unité",
                tva: 10,
                description: "Porte coulissante avec rail apparent design."
              },
              {
                label: "Porte pliante accordéon",
                prix_ht: 650.0,
                unite: "unité",
                tva: 10,
                description: "Porte pliante pour optimiser l'espace."
              },
              {
                label: "Porte pivotante",
                prix_ht: 1500.0,
                unite: "unité",
                tva: 10,
                description: "Porte pivotante design avec axe décentré."
              }
            ]
          },
          {
            name: "Huisseries et finitions",
            options: [
              {
                label: "Huisserie bois massif",
                prix_ht: 280.0,
                unite: "unité",
                tva: 10,
                description: "Huisserie en bois massif avec finition."
              },
              {
                label: "Huisserie métallique",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Huisserie métallique pour cloisons sèches."
              },
              {
                label: "Chambranles décoratifs",
                prix_ht: 85.0,
                unite: "ml",
                tva: 10,
                description: "Chambranles moulurés pour finition soignée."
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
                tva: 10,
                description: "Structure aluminium/bois avec vitrage feuilleté ou verre dépoli. Intégration lumineuse LED possible. Montage par nos menuisiers experts."
              },
              {
                label: "Verrière atelier",
                prix_ht: 320.0,
                unite: "ml",
                tva: 10,
                description: "Verrière style atelier avec croisillons."
              },
              {
                label: "Verrière courbe",
                prix_ht: 450.0,
                unite: "ml",
                tva: 10,
                description: "Verrière cintrée sur mesure."
              },
              {
                label: "Verrière avec porte",
                prix_ht: 1200.0,
                unite: "unité",
                tva: 10,
                description: "Verrière avec porte intégrée."
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
                tva: 10,
                description: "Solution 2-en-1 : séparation d'espace avec rangements intégrés (niches, étagères, portes coulissantes). Finition peinture ou plaquage bois."
              },
              {
                label: "Cloison japonaise",
                prix_ht: 280.0,
                unite: "m²",
                tva: 10,
                description: "Cloison coulissante style japonais."
              },
              {
                label: "Paravent décoratif",
                prix_ht: 350.0,
                unite: "m²",
                tva: 10,
                description: "Paravent fixe ou mobile décoratif."
              }
            ]
          },
          {
            name: "Séparations modulaires",
            options: [
              {
                label: "Cloison amovible",
                prix_ht: 180.0,
                unite: "m²",
                tva: 10,
                description: "Cloison démontable et réutilisable."
              },
              {
                label: "Rideau séparateur",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Rideau sur rail pour séparation temporaire."
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
                tva: 10,
                description: "Optimisation d'espaces complexes avec solutions sur-mesure pour combles, niches ou structures irrégulières. Finitions professionnelles garanties."
              },
              {
                label: "Mezzanine bois",
                prix_ht: 450.0,
                unite: "m²",
                tva: 10,
                description: "Mezzanine en bois avec garde-corps."
              },
              {
                label: "Escalier intérieur bois",
                prix_ht: 2500.0,
                unite: "unité",
                tva: 10,
                description: "Escalier intérieur sur mesure en bois."
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
                tva: 10,
                description: "Réalisation en atelier avec finition laque polyuréthane 6 couches ou effet mat velours. Garantie anti-rayures 5 ans."
              },
              {
                label: "Placage bois précieux",
                prix_ht: 280.0,
                unite: "m²",
                tva: 10,
                description: "Placage en bois précieux (noyer, chêne, wengé)."
              },
              {
                label: "Finition thermolaquée",
                prix_ht: 350.0,
                unite: "m²",
                tva: 10,
                description: "Finition thermolaquée haute résistance."
              }
            ]
          },
          {
            name: "Quincaillerie haut de gamme",
            options: [
              {
                label: "Ferrures invisibles",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Paumelles et ferrures invisibles."
              },
              {
                label: "Système push-pull",
                prix_ht: 65.0,
                unite: "unité",
                tva: 10,
                description: "Système d'ouverture push-pull sans poignée."
              },
              {
                label: "Amortisseurs de fermeture",
                prix_ht: 45.0,
                unite: "unité",
                tva: 10,
                description: "Amortisseurs pour fermeture douce."
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
                tva: 10,
                description: "Solution clé en main incluant meubles sur-mesure, plan de travail, pose professionnelle et finitions. Choix de matériaux (mélaminé, laqué, bois massif) et options d'amortisseurs inclus."
              },
              {
                label: "Cuisine linéaire standard",
                prix_ht: 1800.0,
                unite: "ml",
                tva: 10,
                description: "Cuisine linéaire avec meubles standards."
              },
              {
                label: "Cuisine en L",
                prix_ht: 2200.0,
                unite: "ml",
                tva: 10,
                description: "Cuisine en L avec optimisation d'angle."
              },
              {
                label: "Cuisine en U",
                prix_ht: 2800.0,
                unite: "ml",
                tva: 10,
                description: "Cuisine en U avec maximum de rangements."
              },
              {
                label: "Cuisine avec îlot",
                prix_ht: 3500.0,
                unite: "ml",
                tva: 10,
                description: "Cuisine avec îlot central multifonction."
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
                tva: 10,
                description: "Fabrication sur mesure avec découpe pour évier et plaque de cuisson, finition des chants et traitement hydrofuge/anti-taches pour le bois."
              },
              {
                label: "Plan de travail stratifié",
                prix_ht: 120.0,
                unite: "ml",
                tva: 10,
                description: "Plan de travail stratifié avec chants ABS."
              },
              {
                label: "Plan de travail céramique",
                prix_ht: 450.0,
                unite: "ml",
                tva: 10,
                description: "Plan de travail céramique ultra-résistant."
              },
              {
                label: "Plan de travail inox",
                prix_ht: 280.0,
                unite: "ml",
                tva: 10,
                description: "Plan de travail inox professionnel."
              },
              {
                label: "Plan de travail béton ciré",
                prix_ht: 320.0,
                unite: "ml",
                tva: 10,
                description: "Plan de travail béton ciré sur mesure."
              }
            ]
          },
          {
            name: "Façades et finitions",
            options: [
              {
                label: "Façades mélaminé",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Façades mélaminé décor bois ou uni."
              },
              {
                label: "Façades laquées",
                prix_ht: 150.0,
                unite: "m²",
                tva: 10,
                description: "Façades laquées brillantes ou mates."
              },
              {
                label: "Façades bois massif",
                prix_ht: 220.0,
                unite: "m²",
                tva: 10,
                description: "Façades en bois massif avec finition."
              },
              {
                label: "Façades verre",
                prix_ht: 180.0,
                unite: "m²",
                tva: 10,
                description: "Façades en verre laqué ou sérigraphié."
              }
            ]
          },
          {
            name: "Rangements optimisés",
            options: [
              {
                label: "Tiroirs à l'anglaise",
                prix_ht: 120.0,
                unite: "unité",
                tva: 10,
                description: "Tiroirs avec coulisses à fermeture amortie."
              },
              {
                label: "Plateaux tournants d'angle",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Optimisation des angles avec plateaux rotatifs."
              },
              {
                label: "Colonnes extractibles",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Colonnes avec paniers extractibles."
              },
              {
                label: "Organiseurs de tiroirs",
                prix_ht: 85.0,
                unite: "unité",
                tva: 10,
                description: "Organiseurs modulables pour tiroirs."
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
                tva: 20,
                description: "Ensemble d'électroménagers encastrables de classe énergétique A++ avec pose, raccordements et mise en service inclus. Garantie 2 ans."
              },
              {
                label: "Pack électroménager standard",
                prix_ht: 2800.0,
                unite: "unité",
                tva: 20,
                description: "Pack électroménager milieu de gamme."
              },
              {
                label: "Pack électroménager premium",
                prix_ht: 6500.0,
                unite: "unité",
                tva: 20,
                description: "Pack électroménager très haut de gamme."
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
                tva: 10,
                description: "Installation complète incluant évier double bac, mitigeur avec douchette extractible, siphon et raccordements. Finition anti-taches et anti-calcaire."
              },
              {
                label: "Évier inox 1 bac",
                prix_ht: 450.0,
                unite: "unité",
                tva: 10,
                description: "Évier inox 1 bac avec robinetterie."
              },
              {
                label: "Évier inox 2 bacs",
                prix_ht: 650.0,
                unite: "unité",
                tva: 10,
                description: "Évier inox 2 bacs avec égouttoir."
              },
              {
                label: "Évier granit",
                prix_ht: 950.0,
                unite: "unité",
                tva: 10,
                description: "Évier en granit reconstitué."
              },
              {
                label: "Évier céramique",
                prix_ht: 750.0,
                unite: "unité",
                tva: 10,
                description: "Évier céramique blanc ou coloré."
              }
            ]
          },
          {
            name: "Appareils individuels",
            options: [
              {
                label: "Four encastrable",
                prix_ht: 850.0,
                unite: "unité",
                tva: 20,
                description: "Four encastrable multifonction avec pyrolyse."
              },
              {
                label: "Plaque de cuisson",
                prix_ht: 650.0,
                unite: "unité",
                tva: 20,
                description: "Plaque induction ou vitrocéramique."
              },
              {
                label: "Hotte aspirante",
                prix_ht: 450.0,
                unite: "unité",
                tva: 20,
                description: "Hotte décorative ou intégrée."
              },
              {
                label: "Lave-vaisselle",
                prix_ht: 750.0,
                unite: "unité",
                tva: 20,
                description: "Lave-vaisselle encastrable 12 couverts."
              },
              {
                label: "Réfrigérateur encastrable",
                prix_ht: 1200.0,
                unite: "unité",
                tva: 20,
                description: "Réfrigérateur encastrable avec congélateur."
              },
              {
                label: "Micro-ondes encastrable",
                prix_ht: 450.0,
                unite: "unité",
                tva: 20,
                description: "Micro-ondes encastrable avec grill."
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
                tva: 10,
                description: "Service complet incluant le montage des meubles, pose du plan de travail, installation des électroménagers et robinetterie avec tests de fonctionnement."
              },
              {
                label: "Montage meubles seuls",
                prix_ht: 850.0,
                unite: "unité",
                tva: 10,
                description: "Montage des meubles de cuisine uniquement."
              },
              {
                label: "Pose plan de travail",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Pose du plan de travail avec découpes."
              },
              {
                label: "Raccordement électroménager",
                prix_ht: 180.0,
                unite: "appareil",
                tva: 10,
                description: "Raccordement et mise en service d'un appareil."
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
                tva: 10,
                description: "Dépose des anciens éléments et installation des nouveaux meubles/électroménagers en conservant les raccordements existants lorsque possible."
              },
              {
                label: "Changement façades seules",
                prix_ht: 650.0,
                unite: "unité",
                tva: 10,
                description: "Remplacement des façades et poignées."
              },
              {
                label: "Changement plan de travail seul",
                prix_ht: 450.0,
                unite: "unité",
                tva: 10,
                description: "Remplacement du plan de travail uniquement."
              }
            ]
          },
          {
            name: "Finitions et accessoires",
            options: [
              {
                label: "Crédence sur mesure",
                prix_ht: 120.0,
                unite: "ml",
                tva: 10,
                description: "Crédence en carrelage, verre ou inox."
              },
              {
                label: "Éclairage sous meubles",
                prix_ht: 85.0,
                unite: "ml",
                tva: 10,
                description: "Éclairage LED sous meubles hauts."
              },
              {
                label: "Poignées et boutons",
                prix_ht: 25.0,
                unite: "unité",
                tva: 10,
                description: "Poignées design en inox ou laiton."
              },
              {
                label: "Socle et plinthe",
                prix_ht: 35.0,
                unite: "ml",
                tva: 10,
                description: "Socle réglable et plinthe assortie."
              }
            ]
          }
        ]
      },
      {
        name: "Cuisines spécialisées",
        items: [
          {
            name: "Cuisine professionnelle",
            options: [
              {
                label: "Cuisine inox professionnelle",
                prix_ht: 4500.0,
                unite: "ml",
                tva: 10,
                description: "Cuisine tout inox pour usage professionnel."
              },
              {
                label: "Piano de cuisson",
                prix_ht: 3500.0,
                unite: "unité",
                tva: 20,
                description: "Piano de cuisson professionnel."
              },
              {
                label: "Hotte professionnelle",
                prix_ht: 1800.0,
                unite: "unité",
                tva: 20,
                description: "Hotte professionnelle avec extraction."
              }
            ]
          },
          {
            name: "Cuisine extérieure",
            options: [
              {
                label: "Cuisine d'été couverte",
                prix_ht: 3500.0,
                unite: "ml",
                tva: 10,
                description: "Cuisine extérieure avec protection."
              },
              {
                label: "Barbecue intégré",
                prix_ht: 2200.0,
                unite: "unité",
                tva: 10,
                description: "Barbecue gaz ou charbon intégré."
              },
              {
                label: "Plan de travail extérieur",
                prix_ht: 450.0,
                unite: "ml",
                tva: 10,
                description: "Plan de travail résistant aux intempéries."
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
                tva: 20,
                description: "Prestation complète incluant : piquetage topographique, décapage de terre végétale, terrassement à la pelle mécanique, évacuation des déblais (jusqu'à 30km), compactage et contrôle altimétrique laser. Adapté à tous types de sols."
              },
              {
                label: "Décapage terre végétale",
                prix_ht: 25.0,
                unite: "m³",
                tva: 20,
                description: "Décapage et stockage de la terre végétale."
              },
              {
                label: "Remblaiement compacté",
                prix_ht: 35.0,
                unite: "m³",
                tva: 20,
                description: "Remblaiement avec matériaux sélectionnés."
              },
              {
                label: "Nivellement au laser",
                prix_ht: 15.0,
                unite: "m²",
                tva: 20,
                description: "Nivellement précis au laser."
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
                tva: 20,
                description: "Réalisation de semelles filantes en béton armé (25x40cm) avec ferraillage HA500, coffrage perdu et contrôle géométrique. Convient pour murs porteurs et clôtures."
              },
              {
                label: "Plots béton préfabriqués",
                prix_ht: 85.0,
                unite: "unité",
                tva: 20,
                description: "Plots béton pour terrasses sur plots."
              },
              {
                label: "Fondations sur pieux",
                prix_ht: 180.0,
                unite: "ml",
                tva: 20,
                description: "Fondations profondes sur pieux forés."
              }
            ]
          },
          {
            name: "Drainage et assainissement",
            options: [
              {
                label: "Drain français",
                prix_ht: 65.0,
                unite: "ml",
                tva: 20,
                description: "Drain français avec géotextile et graviers."
              },
              {
                label: "Regard de visite",
                prix_ht: 180.0,
                unite: "unité",
                tva: 20,
                description: "Regard béton avec tampon fonte."
              },
              {
                label: "Puisard d'infiltration",
                prix_ht: 850.0,
                unite: "unité",
                tva: 20,
                description: "Puisard pour gestion des eaux pluviales."
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
                tva: 20,
                description: "Installation complète incluant : canalisations PVC Ø100/Ø125, regards béton, pentes contrôlées, remblaiement sélectif et tests d'étanchéité. Conforme aux DTU et normes sanitaires."
              },
              {
                label: "Réseau eaux usées seul",
                prix_ht: 65.0,
                unite: "ml",
                tva: 20,
                description: "Canalisation eaux usées PVC Ø100."
              },
              {
                label: "Réseau eaux pluviales",
                prix_ht: 55.0,
                unite: "ml",
                tva: 20,
                description: "Canalisation eaux pluviales PVC Ø125."
              },
              {
                label: "Raccordement tout-à-l'égout",
                prix_ht: 1200.0,
                unite: "unité",
                tva: 20,
                description: "Raccordement au réseau public."
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
                tva: 20,
                description: "Fourreau intégré pour électricité (TPC rouge Ø90), fibre optique (TPC verte Ø40) et irrigation avec regards de visite et repérage avertisseur. Pré-câblage optionnel."
              },
              {
                label: "Fourreau électrique",
                prix_ht: 25.0,
                unite: "ml",
                tva: 20,
                description: "Fourreau TPC rouge Ø90 avec tire-fil."
              },
              {
                label: "Fourreau télécom",
                prix_ht: 35.0,
                unite: "ml",
                tva: 20,
                description: "Fourreau TPC vert Ø40 pour fibre optique."
              },
              {
                label: "Chambre de tirage",
                prix_ht: 350.0,
                unite: "unité",
                tva: 20,
                description: "Chambre de tirage pour réseaux secs."
              }
            ]
          },
          {
            name: "Alimentation eau",
            options: [
              {
                label: "Branchement eau potable",
                prix_ht: 850.0,
                unite: "unité",
                tva: 20,
                description: "Branchement au réseau public d'eau potable."
              },
              {
                label: "Canalisation PEHD",
                prix_ht: 35.0,
                unite: "ml",
                tva: 20,
                description: "Canalisation PEHD pour eau potable."
              },
              {
                label: "Compteur d'eau",
                prix_ht: 450.0,
                unite: "unité",
                tva: 20,
                description: "Compteur d'eau avec regard de protection."
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
                tva: 10,
                description: "Clôture rigide en panneaux aluminium (hauteur 1.80m) avec poteaux scellés au béton, portillon intégré et finition thermolaquée RAL. Garantie 10 ans contre la corrosion."
              },
              {
                label: "Clôture grillage rigide",
                prix_ht: 85.0,
                unite: "ml",
                tva: 10,
                description: "Clôture grillage rigide plastifié vert."
              },
              {
                label: "Clôture bois",
                prix_ht: 120.0,
                unite: "ml",
                tva: 10,
                description: "Clôture en lames de bois traité."
              },
              {
                label: "Clôture béton",
                prix_ht: 180.0,
                unite: "ml",
                tva: 10,
                description: "Clôture en panneaux béton décoratifs."
              },
              {
                label: "Clôture composite",
                prix_ht: 220.0,
                unite: "ml",
                tva: 10,
                description: "Clôture composite sans entretien."
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
                tva: 10,
                description: "Portail aluminium coulissant de 4m avec motorisation silencieuse, télécommande, détecteurs de sécurité et éclairage LED intégré. Pose complète sur rail inox."
              },
              {
                label: "Portail battant motorisé",
                prix_ht: 2800.0,
                unite: "unité",
                tva: 10,
                description: "Portail battant 2 vantaux avec motorisation."
              },
              {
                label: "Portail manuel",
                prix_ht: 1800.0,
                unite: "unité",
                tva: 10,
                description: "Portail battant manuel en aluminium."
              },
              {
                label: "Portillon assorti",
                prix_ht: 650.0,
                unite: "unité",
                tva: 10,
                description: "Portillon assorti au portail."
              }
            ]
          },
          {
            name: "Automatismes et sécurité",
            options: [
              {
                label: "Interphone vidéo",
                prix_ht: 850.0,
                unite: "unité",
                tva: 10,
                description: "Interphone vidéo avec écran couleur."
              },
              {
                label: "Digicode",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Digicode étanche avec rétroéclairage."
              },
              {
                label: "Éclairage automatique",
                prix_ht: 280.0,
                unite: "unité",
                tva: 10,
                description: "Éclairage LED avec détecteur de mouvement."
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
                tva: 10,
                description: "Pose de lames composite WPC (20x145mm) sur structure réglable antidéformation, avec fixation invisible et finition anti-UV. Large choix de coloris."
              },
              {
                label: "Terrasse bois exotique",
                prix_ht: 150.0,
                unite: "m²",
                tva: 10,
                description: "Terrasse en bois exotique (ipé, cumaru)."
              },
              {
                label: "Terrasse carrelage",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Terrasse carrelée sur plots ou dalle."
              },
              {
                label: "Terrasse pierre naturelle",
                prix_ht: 120.0,
                unite: "m²",
                tva: 10,
                description: "Terrasse en pierre naturelle."
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
                tva: 10,
                description: "Allée en pavés béton (6cm) sur lit de sable compacté avec joints drainants, bordures acier et fondation grave-bitume. Résistante au gel et aux charges lourdes."
              },
              {
                label: "Allée gravillonnée",
                prix_ht: 45.0,
                unite: "m²",
                tva: 10,
                description: "Allée en graviers stabilisés."
              },
              {
                label: "Allée béton désactivé",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Allée béton avec finition désactivée."
              },
              {
                label: "Allée enrobé",
                prix_ht: 65.0,
                unite: "m²",
                tva: 10,
                description: "Allée en enrobé à chaud."
              }
            ]
          },
          {
            name: "Espaces verts",
            options: [
              {
                label: "Engazonnement",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Préparation du sol et semis de gazon."
              },
              {
                label: "Pose gazon en rouleaux",
                prix_ht: 25.0,
                unite: "m²",
                tva: 10,
                description: "Pose de gazon en plaques."
              },
              {
                label: "Plantation arbustes",
                prix_ht: 45.0,
                unite: "unité",
                tva: 10,
                description: "Plantation d'arbustes avec amendement."
              },
              {
                label: "Plantation arbres",
                prix_ht: 180.0,
                unite: "unité",
                tva: 10,
                description: "Plantation d'arbres avec tuteurage."
              },
              {
                label: "Massifs paysagers",
                prix_ht: 35.0,
                unite: "m²",
                tva: 10,
                description: "Création de massifs avec plantes vivaces."
              }
            ]
          },
          {
            name: "Arrosage automatique",
            options: [
              {
                label: "Système d'arrosage automatique",
                prix_ht: 25.0,
                unite: "m²",
                tva: 10,
                description: "Arrosage automatique avec programmateur."
              },
              {
                label: "Arrosage goutte à goutte",
                prix_ht: 15.0,
                unite: "m²",
                tva: 10,
                description: "Système d'arrosage économique."
              },
              {
                label: "Récupérateur d'eau de pluie",
                prix_ht: 850.0,
                unite: "unité",
                tva: 10,
                description: "Cuve de récupération d'eau enterrée."
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
                tva: 20,
                description: "Puisard béton Ø1m avec géotextile, couvercle grillagé, regard de visite et réseau drainant périphérique. Solution clé en main pour problèmes d'infiltration."
              },
              {
                label: "Bassin de rétention",
                prix_ht: 85.0,
                unite: "m³",
                tva: 20,
                description: "Bassin de rétention des eaux pluviales."
              },
              {
                label: "Pompe de relevage",
                prix_ht: 1500.0,
                unite: "unité",
                tva: 20,
                description: "Station de relevage automatique."
              },
              {
                label: "Séparateur hydrocarbures",
                prix_ht: 2500.0,
                unite: "unité",
                tva: 20,
                description: "Séparateur pour eaux de ruissellement."
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
                tva: 5.5,
                description: "Borne wallbox 22kW avec gestion intelligente, certification IRVE, câble renforcé et disjoncteur différentiel 30mA. Installation complète avec mise en service."
              },
              {
                label: "Borne d'éclairage",
                prix_ht: 350.0,
                unite: "unité",
                tva: 10,
                description: "Borne d'éclairage LED avec détecteur."
              },
              {
                label: "Borne électrique jardin",
                prix_ht: 280.0,
                unite: "unité",
                tva: 10,
                description: "Borne électrique étanche pour jardin."
              }
            ]
          },
          {
            name: "Équipements de loisirs",
            options: [
              {
                label: "Préparation piscine hors-sol",
                prix_ht: 85.0,
                unite: "m²",
                tva: 10,
                description: "Préparation terrain pour piscine hors-sol."
              },
              {
                label: "Abri de jardin béton",
                prix_ht: 2500.0,
                unite: "unité",
                tva: 10,
                description: "Dalle béton pour abri de jardin."
              },
              {
                label: "Terrain de pétanque",
                prix_ht: 45.0,
                unite: "m²",
                tva: 10,
                description: "Terrain de pétanque avec bordures."
              }
            ]
          },
          {
            name: "Assainissement individuel",
            options: [
              {
                label: "Fosse septique toutes eaux",
                prix_ht: 3500.0,
                unite: "unité",
                tva: 20,
                description: "Fosse septique avec épandage."
              },
              {
                label: "Micro-station d'épuration",
                prix_ht: 6500.0,
                unite: "unité",
                tva: 20,
                description: "Micro-station d'épuration agréée."
              },
              {
                label: "Filtre à sable",
                prix_ht: 2800.0,
                unite: "unité",
                tva: 20,
                description: "Filtre à sable vertical ou horizontal."
              }
            ]
          }
        ]
      }
    ]
  }
];