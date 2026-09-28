import {
  UserProfile,
  DossierPsychiatrique,
  ReferenceLists,
  AuditEntry
} from '../types';

export const CLINICAL_USERS: UserProfile[] = [
  {
    id: 'user-psy-1',
    name: 'Dr. Oumar Diallo',
    role: 'PSYCHIATRE',
    title: 'Praticien Hospitalier, Psychiatre',
    service: 'Service de Psychiatrie Universitaire',
    email: 'oumar.diallo@hopital-psy.org',
  },
  {
    id: 'user-psy-2',
    name: 'Dr. Aminata Konaté',
    role: 'PSYCHIATRE',
    title: 'Médecin Psychiatre',
    service: 'Unité d’Accueil et de Crise',
    email: 'aminata.konate@hopital-psy.org',
  },
  {
    id: 'user-psychol-1',
    name: 'Kadidia Traoré',
    role: 'PSYCHOLOGUE',
    title: 'Psychologue Clinicienne',
    service: 'Consultations Externes & Psychothérapie',
    email: 'kadidia.traore@hopital-psy.org',
  },
  {
    id: 'user-inf-1',
    name: 'Moussa Sangaré',
    role: 'INFIRMIER',
    title: 'Infirmier Spécialisé en Santé Mentale',
    service: 'Unité d’Hospitalisation',
    email: 'moussa.sangare@hopital-psy.org',
  },
  {
    id: 'user-as-1',
    name: 'Fatoumata Coulibaly',
    role: 'ASSISTANT_SOCIAL',
    title: 'Assistante de Service Social',
    service: 'Service Social Hospitalier',
    email: 'fatoumata.coulibaly@hopital-psy.org',
  },
  {
    id: 'user-sec-1',
    name: 'Bakary Keïta',
    role: 'SECRETARIAT',
    title: 'Secrétaire Médical',
    service: 'Bureau des Admissions et Dossiers',
    email: 'bakary.keita@hopital-psy.org',
  },
  {
    id: 'user-adm-1',
    name: 'Mahamadou Touré',
    role: 'ADMIN',
    title: 'Administrateur du Système Clinique',
    service: 'Direction du Système d’Information',
    email: 'admin@hopital-psy.org',
  },
  {
    id: 'user-lec-1',
    name: 'Dr. Pierre Lefèvre',
    role: 'LECTEUR',
    title: 'Médecin Généraliste Référent (Observateur)',
    service: 'Centre de Santé Communautaire',
    email: 'pierre.lefevre@cscom.org',
  },
];

export const INITIAL_REFERENCE_LISTS: ReferenceLists = {
  religions: [
    'Musulmane',
    'Chrétienne catholique',
    'Chrétienne protestante',
    'Animiste',
    'Autre',
    'Non précisée'
  ],
  ethnies: [
    'Bambara',
    'Malinké',
    'Peul',
    'Soninké',
    'Songhaï',
    'Dogon',
    'Bobo',
    'Sénoufo',
    'Touareg',
    'Autre'
  ],
  situationsMatrimoniales: [
    'Célibataire',
    'Marié(e)',
    'Divorcé(e)',
    'Veuf / Veuve',
    'Union libre / Concubinage',
    'Autre'
  ],
  typesBilans: [
    'NFS, Plaquettes, VS, CRP',
    'Ionogramme sanguin, Urée, Créatininémie',
    'Bilan hépatique (ALAT, ASAT, GGT, Bilirubine)',
    'TSH ultrasensible',
    'Sérologies VIH, VHB, VHC, Syphilis',
    'Toxiques urinaires (THC, Opiacés, Cocaïne, Amphétamines)',
    'Électrocardiogramme (ECG)',
    'Électroencéphalogramme (EEG)',
    'Scanner cérébral sans injection',
    'IRM cérébrale',
    'Bilan psychologique / Test projectif'
  ],
  syndromesFrequents: [
    'Syndrome délirant paranoïde',
    'Syndrome d’automatisme mental',
    'Syndrome dissociatif / discordance',
    'Syndrome dépressif mélancoliforme',
    'Syndrome maniaque avec logorrhée et agitation',
    'Syndrome anxieux aigu avec attaques de panique',
    'Syndrome confusionnel',
    'Syndrome de conversion somatomorphe',
    'Syndrome de sevrage / addictif',
    'Syndrome catatonique'
  ],
  diagnosticClassifications: [
    { code: 'F20.0', label: 'Schizophrénie paranoïde' },
    { code: 'F23.0', label: 'Trouble psychotique aigu polymorphe sans symptômes schizophréniques' },
    { code: 'F23.1', label: 'Trouble psychotique aigu polymorphe avec symptômes schizophréniques' },
    { code: 'F31.1', label: 'Trouble affectif bipolaire, épisode actuel maniaque sans symptômes psychotiques' },
    { code: 'F31.2', label: 'Trouble affectif bipolaire, épisode actuel maniaque avec symptômes psychotiques' },
    { code: 'F32.2', label: 'Épisode dépressif sévère sans symptômes psychotiques' },
    { code: 'F32.3', label: 'Épisode dépressif sévère avec symptômes psychotiques' },
    { code: 'F43.1', label: 'État de stress post-traumatique (ESPT)' },
    { code: 'F43.2', label: 'Troubles de l’adaptation' },
    { code: 'F10.2', label: 'Troubles mentaux liés à l’utilisation d’alcool (Syndrome de dépendance)' },
    { code: 'F12.2', label: 'Troubles mentaux liés à l’utilisation de cannabinoïdes' },
  ]
};

export const INITIAL_DOSSIERS: DossierPsychiatrique[] = [
  {
    id: 'dossier-001',
    statut: 'VALIDÉ',
    dateCreation: '2026-09-15T08:30:00Z',
    dateDerniereModification: '2026-09-24T14:45:00Z',
    psychiatreReferent: 'Dr. Oumar Diallo',
    serviceHospitalier: 'Service de Psychiatrie Universitaire',
    validationInfo: {
      dateHeure: '2026-09-24T14:45:00Z',
      valideParNom: 'Dr. Oumar Diallo',
      valideParRole: 'PSYCHIATRE',
      signataire: 'Dr. Oumar Diallo, PH - N° Ordre Med 14892'
    },
    addenda: [
      {
        id: 'add-1',
        dateHeure: '2026-09-26T10:15:00Z',
        auteurNom: 'Dr. Oumar Diallo',
        auteurRole: 'PSYCHIATRE',
        rubriqueId: 's14',
        rubriqueNom: 'S14 : Prise en charge',
        contenu: 'Bonne tolérance de l’Olanzapine 10mg le soir. Absence de sédation excessive diurne. Pas de syndrome extrapyramidal constaté. Rendez-vous de contrôle confirmé dans 15 jours.'
      }
    ],
    s1Identification: {
      numeroOrdre: 'PSY-2026-0001',
      nom: 'DIARRA',
      prenoms: 'Ibrahim Boubacar',
      age: 28,
      dateNaissance: '1998-04-12',
      sexe: 'Masculin',
      profession: 'Technicien télécoms',
      situationMatrimoniale: 'Célibataire',
      religion: 'Musulmane',
      ethnie: 'Bambara',
      adresse: 'Bamako, Commune V, Quartier Daoudabougou',
      telephone: '+223 76 45 12 90',
      personneContact: 'Amadou Diarra (Frère aîné) - +223 66 11 88 44'
    },
    s2Modalites: {
      modalite: 'Soins sans consentement',
      soinsSansConsentementType: "À la demande d'un tiers",
      soinsSansConsentementDemandeur: 'Amadou Diarra (Frère aîné avec justificatif de domicile)',
      dateDecisionOuCertificat: '2026-09-15',
      observationsModalite: 'Admission d’urgence sous certificat médical initial du médecin de garde suite à un état d’agitation délirante nocturne.'
    },
    s3Motif: {
      plaintePrincipale: 'Agitation nocturne intense, conviction d’être épié et menacé par des collègues de travail et des esprits (djinns), refus d’alimentation par crainte d’empoisonnement depuis 5 jours.',
      sourcePlainte: 'Patient et entourage',
      accompagnateurs: 'Accompagné par son frère aîné et son oncle maternel.'
    },
    s4HistoireMaladie: {
      dateDebut: '2026-09-08',
      modeInstallation: 'Brutal',
      facteursDeclenchants: ['Stress', 'Perte d’emploi', 'Autre'],
      facteursDeclenchantsAutrePrecision: 'Litige foncier familial récent et rupture de contrat professionnel.',
      facteursAggravants: 'Insomnie totale sans fatigue depuis 96 heures, consommation occasionnelle de tisanes traditionnelles inconnues.',
      itineraireTherapeutique: '1. Consultation chez un tradipraticien à Kati (fumigations et amulettes de protection) ; 2. Consultation en urgence au CSCOM de Daoudabougou ; 3. Transfert en psychiatrie.',
      evolutionAvecTraitement: 'Sédation rapide de l’angoisse et du délire sous Olanzapine 10mg/jour et Clonazépam.',
      evolutionSansTraitement: 'Aggravation rapide vers une insomnie invincible et un risque de passage à l’acte hétéro-agressif défensif.',
      retentissementSocioProfessionnel: 'Arrêt complet de toute activité professionnelle, repli au domicile familial avec barricadement des portes.'
    },
    s5Representation: {
      explicationPatient: 'Le patient affirme que des ondes électromagnétiques lui sont envoyées depuis une antenne relais et que des marabouts malveillants ont envoyé un djinn pour bloquer son destin.',
      explicationFamille: 'La famille évoque avec insistance un envoûtement lié à la jalousie de collègues suite à une promotion manquée.',
      categories: ['Sorcellerie', 'Envoûtement', 'Djinn'],
      precisions: 'Acceptation conjointe d’un traitement médical hospitalier et de prières coraniques (Roqya) sans manipulation corporelle.'
    },
    s6Antecedents: {
      personnels: {
        medicaux: { aucun: false, details: 'Paludisme grave traité en 2022 sans séquelles neurologiques. Pas d’allergie connue.' },
        chirurgicaux: { aucun: false, details: 'Appendicectomie sous anesthésie générale en 2017 sans complication.' },
        psychiatriques: { aucun: true, details: '' },
        addictifs: { aucun: false, details: 'Tabagisme modéré (5 cigarettes/jour), consommation occasionnelle de cannabis arrêtée il y a 2 ans.' },
        judiciaires: { aucun: true, details: '' }
      },
      familiaux: {
        medicaux: { aucun: false, details: 'Hypertension artérielle chez la mère.' },
        chirurgicaux: { aucun: true, details: '' },
        psychiatriques: { aucun: false, details: 'Un oncle paternel a présenté un épisode délirant bref résolutif dans la jeunesse.' },
        addictifs: { aucun: true, details: '' }
      }
    },
    s7Biographie: {
      ascendants: {
        pere: { nom: 'Boubacar Diarra', age: 62, profession: 'Commerçant retraité', vivant: true, antecedentsNotables: 'Aucun notable' },
        mere: { nom: 'Oumou Traoré', age: 56, profession: 'Ménagère', vivant: true, antecedentsNotables: 'HTA suivie' }
      },
      collateraux: {
        placeFratrieUterine: 2,
        nombreFreresSoeursDeclares: 4,
        fratrie: [
          { id: 'fr-1', nom: 'Amadou Diarra', age: 32, sexe: 'M', rang: 1, profession: 'Enseignant', vivant: true },
          { id: 'fr-2', nom: 'Ibrahim (Patient)', age: 28, sexe: 'M', rang: 2, profession: 'Technicien', vivant: true },
          { id: 'fr-3', nom: 'Rokiatou Diarra', age: 24, sexe: 'F', rang: 3, profession: 'Étudiante', vivant: true },
          { id: 'fr-4', nom: 'Seydou Diarra', age: 19, sexe: 'M', rang: 4, profession: 'Lycéen', vivant: true }
        ]
      },
      conceptionGrossesseAccouchement: 'Grossesse menée à terme sans incident signalé, accouchement eutocique en maternité.',
      developpementPsychomoteur: {
        marche: '14 mois',
        langage: 'Phrases complètes à 2 ans',
        proprete: 'Acquise vers 2 ans et demi',
        remarques: 'Développement sans anomalie repérée.'
      },
      scolarite: {
        debutAge: 6,
        niveauAtteint: 'Baccalauréat Scientifique puis BTS Télécommunications',
        diplomes: 'BTS Réseaux & Télécoms',
        echecsScolaires: 'Un redoublement en classe de terminale.',
        vecuDesEchecs: 'Bien surmonté avec soutien familial.'
      },
      developpementProfessionnel: 'Emploi stable pendant 4 ans chez un sous-traitant d’opérateur télécom. Fin de contrat récente ayant provoqué une déstabilisation.',
      developpementSexuelEtSentimentale: {
        spermarcheAge: '14 ans',
        premierRapportConditionsVecu: 'Vers 19 ans, vécu harmonieux sans sentiment de culpabilité.',
        principalesRelationsAmoureuses: 'Deux relations stables antérieures.',
        conjoints: [],
        nombreEnfants: 0,
        enfants: []
      },
      evenementsMarquants: {
        positifs: ['Obtention du BTS Télécoms', 'Premier emploi autonome'],
        negatifs: ['Perte du contrat d’embauche en août 2026', 'Conflit de parcelle foncière']
      }
    },
    s8EnqueteSociale: {
      autodescription: '« Je suis quelqu’un de calme, travailleur et respectueux, mais ces derniers temps mon esprit s’est embrouillé. »',
      heterodescription: 'Décrit par son frère aîné comme un jeune homme dévoué, pieux, apprécié de son voisinage, d’un naturel plutôt introverti mais sociable.',
      heterodescriptionSource: 'Frère aîné (Amadou)',
      relationsSociales: 'Bon réseau amical dans le quartier, participation régulière aux activités sportives et associatives locales.',
      loisirs: 'Football de quartier, lecture technique, écoute musicale.',
      conduitesAddictives: 'Pas de dépendance active constatée.'
    },
    s9Demande: {
      demandeConsciente: 'Retrouver le sommeil, la paix de l’esprit et être débarrassé des voix et menaces imaginaires.',
      demandeInconsciente: 'Nécessité de restaurer le sentiment de toute-puissance et de sécurité suite à la blessure narcissique majeure de la perte d’emploi.'
    },
    s10ExamenClinique: {
      somatique: {
        nonRealise: false,
        constantes: {
          temperature: 36.8,
          tensionSystolique: 125,
          tensionDiastolique: 80,
          pouls: 78,
          frequenceRespiratoire: 16,
          saturationO2: 99
        },
        etatGeneral: 'Patient bien conservé sur le plan nutritionnel, hydratation correcte, conjonctives normocolorées.',
        appareils: {
          cardiovasculaire: 'Bruits du cœur réguliers, pas de souffle ausculté.',
          respiratoire: 'Murmure vésiculaire symétrique, pas de râles.',
          digestif: 'Abdomen souple, indolore, pas d’hépatomégalie.',
          neurologique: 'Pas de déficit moteur ni sensitif, réflexes ostéo-tendineux présents et symétriques.'
        }
      },
      psychiatrique: {
        tenueVestimentaireEtHygiene: 'Tenue correcte et propre, pas d’incurie constatée.',
        mimique: 'Mimique angoissée au départ, s’apaisant au cours de l’entretien.',
        contact: 'Contact accessible, méfiant au tout début puis coopérant et cordial.',
        psychomotriciteComportement: 'Pas d’agitation motrice actuelle, pas de stéréotypies ni de catalepsie.',
        conduites: 'Alimentation reprise normalement sous surveillance infirmière.',
        fonctionsSymboliques: 'Langage articulé clair, pas de néologismes.',
        fonctionsMnesiques: 'Mémoire antérograde et rétrograde conservées.',
        penseeEtJugement: 'Délire paranoïde polymorphe à thèmes de persécution et de référence, mécanismes intuitifs et interprétatifs, adhésion partielle en voie de critique.',
        activitesPerceptives: 'Hallucinations acoustico-verbales intermittentes (« voix de chuchotements ») en nette régression.',
        conscienceDeSoiEtEnvironnement: 'Bien orienté dans le temps et dans l’espace.',
        expressionDesAffects: 'Angoisse de morcellement en régression, affect congru à la thématique délirante.'
      }
    },
    s11ResumeSyndromique: {
      resume: 'Patient de 28 ans, sans antécédent psychiatrique notable, présentant un tableau d’installation brutale associant un syndrome délirant polymorphe (thèmes de persécution, influence, référence à mécanismes intuitifs et interprétatifs) à des hallucinations acoustico-verbales, une angoisse massive et une insomnie totale, survenu dans les suites d’une rupture professionnelle. Sédation favorable sous antipsychotique atypique avec ébauche de critique.',
      syndromesIdentifies: [
        'Syndrome délirant paranoïde',
        'Syndrome anxieux aigu',
        'Insomnie sévère'
      ]
    },
    s12HypothesesDiag: {
      hypotheses: [
        {
          id: 'hyp-1',
          type: 'Principale',
          codeCimDsm: 'F23.1',
          libelle: 'Trouble psychotique aigu polymorphe avec symptômes schizophréniques (Bouffée délirante aiguë)',
          argumentsCliniques: 'Début brutal (< 2 semaines), polymorphisme des thèmes délirants, fluctuation de l’humeur, absence d’antécédent et restitution rapide.'
        },
        {
          id: 'hyp-2',
          type: 'Différentielle',
          codeCimDsm: 'F20.0',
          libelle: 'Entrée dans une schizophrénie débutante',
          argumentsCliniques: 'À surveiller sur le moyen et long terme si persistance des symptômes négatifs ou rechute au sevrage.'
        },
        {
          id: 'hyp-3',
          type: 'Différentielle',
          codeCimDsm: 'F31.2',
          libelle: 'Épisode maniaque avec caractéristiques psychotiques',
          argumentsCliniques: 'Écarté par l’absence d’accélération psychomotrice franche et d’exaltation euphorique.'
        }
      ]
    },
    s13Bilans: {
      bilans: [
        {
          id: 'bil-1',
          type: 'NFS, Ionogramme sanguin, Urée, Créatinine',
          datePrescription: '2026-09-15',
          prescripteur: 'Dr. Oumar Diallo',
          statut: 'Résultat reçu',
          dateRealisation: '2026-09-16',
          resultat: 'NFS normale (GB: 6800/mm³, Hb: 14.2 g/dL), Ionogramme normal (Na+: 139, K+: 4.1, Glycémie: 5.2 mmol/L), Urée: 4.2 mmol/L, Créatinine: 78 µmol/L.',
          interpretation: 'Bilan biologique standard sans particularité organique.'
        },
        {
          id: 'bil-2',
          type: 'Toxiques urinaires (THC, Opiacés, Cocaïne, Amphétamines)',
          datePrescription: '2026-09-15',
          prescripteur: 'Dr. Oumar Diallo',
          statut: 'Résultat reçu',
          dateRealisation: '2026-09-16',
          resultat: 'Recherche négative pour l’ensemble des toxiques dosés.',
          interpretation: 'Élimine formellement une psychose toxique aiguë induite.'
        },
        {
          id: 'bil-3',
          type: 'Électrocardiogramme (ECG)',
          datePrescription: '2026-09-15',
          prescripteur: 'Dr. Oumar Diallo',
          statut: 'Résultat reçu',
          dateRealisation: '2026-09-16',
          resultat: 'Rythme sinusal régulier à 75 bpm. Intervalle QTc normal à 410 ms. Pas de trouble de la repolarisation.',
          interpretation: 'Autorise la prescription de neuroleptiques en toute sécurité.'
        }
      ]
    },
    s14PriseEnCharge: {
      orientation: 'Hospitalisation',
      hospitalisationDetails: {
        service: 'Unité d’hospitalisation de court séjour',
        lit: 'Chambre 104',
        dateEntree: '2026-09-15',
        motif: 'Prise en charge d’un épisode délirant aigu sous soins sans consentement.'
      },
      traitementMedicamenteux: [
        {
          id: 'rx-1',
          molecule: 'Olanzapine (Zyprexa)',
          posologie: '10 mg',
          voie: 'Orale',
          frequence: '1 comprimé le soir au coucher',
          dateDebut: '2026-09-15',
          prescripteur: 'Dr. Oumar Diallo',
          remarques: 'Surveillance hebdomadaire du poids et de la glycémie à jeun.'
        },
        {
          id: 'rx-2',
          molecule: 'Clonazépam (Rivotril)',
          posologie: '0.5 mg',
          voie: 'Orale',
          frequence: '1 comprimé matin et soir (durée 7 jours max)',
          dateDebut: '2026-09-15',
          dateFin: '2026-09-22',
          prescripteur: 'Dr. Oumar Diallo',
          remarques: 'Anxiolyse d’appoint, arrêt programmé progressif.'
        }
      ],
      psychotherapie: {
        type: 'Psychothérapie de soutien et psychoéducation',
        frequence: '2 séances par semaine pendant l’hospitalisation',
        therapeute: 'Kadidia Traoré (Psychologue)',
        objectifs: 'Alliance thérapeutique, travail de verbalisation sur les stresseurs récents et déstigmatisation du trouble.'
      }
    },
    s15Evolution: {
      entrees: [
        {
          id: 'evo-1',
          dateHeure: '2026-09-15T11:00:00Z',
          auteurNom: 'Moussa Sangaré',
          auteurRole: 'INFIRMIER',
          note: 'Accueil en chambre. Patient agité, méfiant, scrute les fenêtres. Prise des constantes réalisée après mise en confiance. Traitement médicamenteux administré sans refus.'
        },
        {
          id: 'evo-2',
          dateHeure: '2026-09-17T09:30:00Z',
          auteurNom: 'Dr. Oumar Diallo',
          auteurRole: 'PSYCHIATRE',
          note: 'Nette régression de l’angoisse. Première nuit de 7 heures consécutives. Le patient commence à s’interroger sur la réalité de ses perceptions nocturnes.'
        },
        {
          id: 'evo-3',
          dateHeure: '2026-09-20T14:00:00Z',
          auteurNom: 'Kadidia Traoré',
          auteurRole: 'PSYCHOLOGUE',
          note: 'Entretien clinique : bonne élaboration autour de la perte d’emploi. Le patient exprime un soulagement d’avoir été hospitalisé avant un geste irréfléchi.'
        },
        {
          id: 'evo-4',
          dateHeure: '2026-09-24T11:00:00Z',
          auteurNom: 'Dr. Oumar Diallo',
          auteurRole: 'PSYCHIATRE',
          note: 'Examen de sortie d’hospitalisation : critique complète du délire. Poursuite du traitement en ambulatoire avec relais familial bienveillant.'
        }
      ]
    },
    s16ProjetTherapeutique: {
      versionCourante: 1,
      objectifsCourtTerme: 'Consolidation de la rémission clinique sous Olanzapine 10mg, régularisation du sommeil, soutien psychologique hebdomadaire.',
      objectifsMoyenTerme: 'Poursuite du traitement d’entretien pendant 6 à 12 mois pour prévenir la rechute, aide à la réinsertion professionnelle avec l’assistante sociale.',
      moyensEtStrategies: 'Consultations mensuelles en CMP, suivi psychothérapeutique d’inspiration cognitivo-comportementale et systémique familiale.',
      echeancesEtRevisions: 'Bilan d’évaluation à 3 mois (décembre 2026).',
      intervenants: ['Dr. Oumar Diallo (Psychiatre)', 'Kadidia Traoré (Psychologue)', 'Fatoumata Coulibaly (Assistante sociale)'],
      historiqueVersions: [
        {
          version: 1,
          dateHeure: '2026-09-24T14:00:00Z',
          auteurNom: 'Dr. Oumar Diallo',
          auteurRole: 'PSYCHIATRE',
          objectifsCourtTerme: 'Consolidation rémission, sommeil régulier.',
          objectifsMoyenTerme: 'Prévention rechute, réinsertion.',
          moyensEtStrategies: 'Consultations CMP, psychothérapie de soutien.',
          echeancesEtRevisions: 'Révision à 3 mois.',
          intervenants: ['Dr. Diallo', 'K. Traoré']
        }
      ]
    },
    s17Pronostic: {
      courtTerme: {
        appreciation: 'Favorable',
        details: 'Excellente réponse initiale aux antipsychotiques atypiques et critique précoce.'
      },
      moyenTerme: {
        appreciation: 'Favorable',
        details: 'Bon soutien familial, bon niveau d’insertion antérieure et bonne observance pressentie.'
      },
      longTerme: {
        appreciation: 'Réservé',
        details: 'Nécessite le maintien du traitement au moins 1 an pour écarter formellement une entrée schizophrénique.'
      },
      facteursPronostiques: 'Facteurs de bon pronostic : début brutal, facteur déclenchant net, bonne adaptation prémorbide, présence d’éléments affectifs et soutien familial solide.'
    }
  },
  {
    id: 'dossier-002',
    statut: 'EN_COURS',
    dateCreation: '2026-09-20T10:00:00Z',
    dateDerniereModification: '2026-09-27T16:30:00Z',
    psychiatreReferent: 'Dr. Aminata Konaté',
    serviceHospitalier: 'Unité d’Accueil et de Crise',
    addenda: [],
    s1Identification: {
      numeroOrdre: 'PSY-2026-0002',
      nom: 'CISSÉ',
      prenoms: 'Mariam',
      age: 34,
      dateNaissance: '1992-06-18',
      sexe: 'Féminin',
      profession: 'Institutrice',
      situationMatrimoniale: 'Marié(e)',
      religion: 'Musulmane',
      ethnie: 'Malinké',
      adresse: 'Bamako, Commune IV, Quartier Lafiabougou',
      telephone: '+223 79 33 22 11',
      personneContact: 'Souleymane Cissé (Époux) - +223 65 44 33 22'
    },
    s2Modalites: {
      modalite: 'Libre',
      observationsModalite: 'Patiente venue d’elle-même accompagnée de son époux.'
    },
    s3Motif: {
      plaintePrincipale: 'Tristesse persistante, pleurs incessants sans motif apparent, épuisement physique intense, désintérêt pour son nourrisson de 4 mois, sentiment d’incapacité maternelle.',
      sourcePlainte: 'Patient et entourage'
    },
    s4HistoireMaladie: {
      dateDebut: '2026-08-15',
      modeInstallation: 'Progressif',
      facteursDeclenchants: ['Deuil', 'Autre'],
      facteursDeclenchantsAutrePrecision: 'Décès de sa mère survenu un mois après l’accouchement.',
      facteursAggravants: 'Isolement au domicile, privation chronique de sommeil.',
      itineraireTherapeutique: 'Consultation auprès du gynécologue obstétricien qui a orienté vers la consultation psychiatrique.',
      evolutionAvecTraitement: 'Non encore débuté lors de l’admission.',
      evolutionSansTraitement: 'Aggravation progressive des idées noires sans plan suicidaire précis.',
      retentissementSocioProfessionnel: 'Congé maternité prolongé par arrêt maladie, incapacité à s’occuper des tâches domestiques.'
    },
    s5Representation: {
      explicationPatient: '« J’ai l’impression que toute la joie m’a quittée avec le départ de ma mère. »',
      explicationFamille: 'L’époux redoutait un coup de froid ou une fatigue physique normale, mais s’inquiète de la durée.',
      categories: ['Autre'],
      precisions: 'Reconnaissance d’une souffrance psychologique liée au deuil périnatal.'
    },
    s6Antecedents: {
      personnels: {
        medicaux: { aucun: true, details: '' },
        chirurgicaux: { aucun: true, details: '' },
        gynecoObstetricaux: { aucun: false, details: 'G3P3. Accouchements par voie basse sans hémorragie. Allaitement maternel exclusif en cours.' },
        psychiatriques: { aucun: false, details: 'Baby-blues modéré lors du premier accouchement, spontanément résolutif en 10 jours.' },
        addictifs: { aucun: true, details: '' },
        judiciaires: { aucun: true, details: '' }
      },
      familiaux: {
        medicaux: { aucun: true, details: '' },
        chirurgicaux: { aucun: true, details: '' },
        psychiatriques: { aucun: false, details: 'Épisode dépressif chez la mère dans le passé.' },
        addictifs: { aucun: true, details: '' }
      }
    },
    s7Biographie: {
      ascendants: {
        pere: { nom: 'Fousseyni Cissé', age: 70, profession: 'Agriculteur', vivant: true },
        mere: { nom: 'Bintou Diop', age: 60, profession: 'Décédée en juillet 2026', vivant: false }
      },
      collateraux: {
        placeFratrieUterine: 1,
        nombreFreresSoeursDeclares: 3,
        fratrie: [
          { id: 'f-1', nom: 'Mariam (Patiente)', age: 34, sexe: 'F', rang: 1, profession: 'Institutrice', vivant: true },
          { id: 'f-2', nom: 'Salif Cissé', age: 30, sexe: 'M', rang: 2, profession: 'Comptable', vivant: true },
          { id: 'f-3', nom: 'Hawa Cissé', age: 26, sexe: 'F', rang: 3, profession: 'Infirmière', vivant: true }
        ]
      },
      conceptionGrossesseAccouchement: 'Grossesse désirée, suivie au CSREF de la commune IV, accouchement à terme.',
      developpementPsychomoteur: {
        marche: '12 mois',
        langage: 'Normal',
        proprete: 'Normale'
      },
      scolarite: {
        debutAge: 7,
        niveauAtteint: 'Institut de Formation des Maîtres (IFM)',
        diplomes: 'Diplôme de Maître d’Enseignement Fondamental',
        echecsScolaires: 'Aucun',
        vecuDesEchecs: 'Parcours scolaire sans encombre'
      },
      developpementProfessionnel: 'Enseignante en école primaire depuis 10 ans, très appréciée des collègues et parents d’élèves.',
      developpementSexuelEtSentimentale: {
        menarcheAge: '13 ans',
        premierRapportConditionsVecu: 'Après le mariage, harmonieux.',
        principalesRelationsAmoureuses: 'Mariée depuis 8 ans.',
        conjoints: [{ id: 'conj-1', nom: 'Souleymane Cissé', statut: 'Époux légitime', dureeUnion: '8 ans' }],
        nombreEnfants: 3,
        enfants: [
          { id: 'enf-1', nom: 'Ali Cissé', age: 6, sexe: 'M' },
          { id: 'enf-2', nom: 'Fatou Cissé', age: 3, sexe: 'F' },
          { id: 'enf-3', nom: 'Bintou Cissé', age: 0, sexe: 'F' }
        ]
      },
      evenementsMarquants: {
        positifs: ['Naissance de ses trois enfants', 'Réussite au concours de la fonction publique'],
        negatifs: ['Perte brutale de sa mère en période post-natale']
      }
    },
    s8EnqueteSociale: {
      autodescription: '« J’étais une femme courageuse et joyeuse, aujourd’hui je n’ai plus de force. »',
      heterodescription: 'L’époux décrit une femme très investie dans sa famille, qui n’arrive plus à sourire depuis deux mois.',
      heterodescriptionSource: 'Époux',
      relationsSociales: 'Relations bienveillantes avec les belles-sœurs et le voisinage.',
      loisirs: 'Couture, chorale, lecture.',
      conduitesAddictives: 'Aucune.'
    },
    s9Demande: {
      demandeConsciente: 'Pouvoir s’occuper de son bébé avec amour et retrouver son énergie pour sa famille.',
      demandeInconsciente: 'Travail de séparation et culpabilité vis-à-vis de la mère disparue lors de la transmission maternelle.'
    },
    s10ExamenClinique: {
      somatique: {
        nonRealise: false,
        constantes: {
          temperature: 37.0,
          tensionSystolique: 110,
          tensionDiastolique: 70,
          pouls: 72,
          frequenceRespiratoire: 16,
          saturationO2: 98
        },
        etatGeneral: 'Pâleur modérée, cernes marquées, perte de 4 kg en deux mois.',
        appareils: {
          cardiovasculaire: 'Régulier, pas de souffle.',
          respiratoire: 'Normal.',
          digestif: 'Normal.',
          neurologique: 'Normal.'
        }
      },
      psychiatrique: {
        tenueVestimentaireEtHygiene: 'Soignée mais regard terne et triste.',
        mimique: 'Hypomimie de tonalité douloureuse, larmes faciles lors de l’évocation de sa mère.',
        contact: 'Contact chaleureux, sincère, demande d’aide authentique.',
        psychomotriciteComportement: 'Ralentissement psychomoteur discret, voix monocorde.',
        conduites: 'Hyporexie marquée, sommeil haché par réveils précoces vers 4h du matin.',
        fonctionsSymboliques: 'Normale.',
        fonctionsMnesiques: 'Difficultés de concentration et d’attention.',
        penseeEtJugement: 'Contenu centré sur l’incurabilité et le sentiment d’indignité. Pas de délire.',
        activitesPerceptives: 'Pas d’hallucinations.',
        conscienceDeSoiEtEnvironnement: 'Clairement orientée, conscience lucide de son état dépressif.',
        expressionDesAffects: 'Anesthésie affective douloureuse envers son entourage.'
      }
    },
    s11ResumeSyndromique: {
      resume: 'Patiente de 34 ans présentant un épisode dépressif majeur du post-partum d’intensité modérée à sévère, marqué par une humeur triste, une anhédonie, une anesthésie affective vis-à-vis du nouveau-né, des réveils précoces et une perte de poids, déclenché par le deuil maternel.',
      syndromesIdentifies: ['Syndrome dépressif caractérisé', 'Ralentissement psychomoteur']
    },
    s12HypothesesDiag: {
      hypotheses: [
        {
          id: 'hyp-cisse-1',
          type: 'Principale',
          codeCimDsm: 'F32.2',
          libelle: 'Épisode dépressif sévère sans symptômes psychotiques (Dépression post-partum)',
          argumentsCliniques: 'Début dans les 6 semaines suivant l’accouchement, sévérité de l’humeur dépressive et culpabilité.'
        }
      ]
    },
    s13Bilans: {
      bilans: [
        {
          id: 'bil-c-1',
          type: 'TSH ultrasensible, Hémogramme',
          datePrescription: '2026-09-20',
          prescripteur: 'Dr. Aminata Konaté',
          statut: 'Prescrit'
        }
      ]
    },
    s14PriseEnCharge: {
      orientation: 'Ambulatoire',
      traitementMedicamenteux: [
        {
          id: 'rx-cisse-1',
          molecule: 'Sertraline',
          posologie: '50 mg',
          voie: 'Orale',
          frequence: '1 comprimé le matin après le petit-déjeuner',
          dateDebut: '2026-09-20',
          prescripteur: 'Dr. Aminata Konaté',
          remarques: 'Compatible avec l’allaitement maternel sous surveillance pédiatrique.'
        }
      ],
      psychotherapie: {
        type: 'Thérapie interpersonnelle axée sur le deuil et le rôle maternel',
        frequence: 'Hebdomadaire',
        therapeute: 'Kadidia Traoré',
        objectifs: 'Traversée du deuil et renforcement du lien mère-enfant.'
      }
    },
    s15Evolution: {
      entrees: [
        {
          id: 'evo-c-1',
          dateHeure: '2026-09-20T11:30:00Z',
          auteurNom: 'Dr. Aminata Konaté',
          auteurRole: 'PSYCHIATRE',
          note: 'Première consultation. Bonne alliance thérapeutique. Instauration Sertraline 50mg et arrêt de travail de 30 jours.'
        }
      ]
    },
    s16ProjetTherapeutique: {
      versionCourante: 1,
      objectifsCourtTerme: 'Amélioration de l’appétit et du sommeil, reprise de confiance dans le portage de l’enfant.',
      objectifsMoyenTerme: 'Rémission symptomatique complète, reprise progressive du travail scolaire.',
      moyensEtStrategies: 'Antidépresseur ISRS + psychothérapie individuelle.',
      echeancesEtRevisions: 'Contrôle à 15 jours.',
      intervenants: ['Dr. Aminata Konaté', 'Kadidia Traoré'],
      historiqueVersions: []
    },
    s17Pronostic: {
      courtTerme: { appreciation: 'Favorable', details: 'Forte demande de soins et soutien chaleureux du conjoint.' },
      moyenTerme: { appreciation: 'Favorable', details: 'Personnalité prémorbide stable, pas d’antécédent de rechute récurrente.' },
      longTerme: { appreciation: 'Favorable', details: 'Excellent pronostic sous réserve d’une observance suffisante de 9 mois.' },
      facteursPronostiques: 'Contexte de deuil identifié, absence de bipolarité, adhésion thérapeutique immédiate.'
    }
  },
  {
    id: 'dossier-003',
    statut: 'BROUILLON',
    dateCreation: '2026-09-28T01:15:00Z',
    dateDerniereModification: '2026-09-28T01:15:00Z',
    psychiatreReferent: 'Dr. Oumar Diallo',
    serviceHospitalier: 'Service de Psychiatrie Universitaire',
    addenda: [],
    s1Identification: {
      numeroOrdre: 'PSY-2026-0003',
      nom: 'COULIBALY',
      prenoms: 'Seydou',
      age: 21,
      dateNaissance: '2005-02-14',
      sexe: 'Masculin',
      profession: 'Apprenti mécanicien',
      situationMatrimoniale: 'Célibataire',
      religion: 'Musulmane',
      ethnie: 'Bambara',
      adresse: 'Bamako, Commune I, Quartier Djelibougou',
      telephone: '+223 71 88 99 00'
    },
    s2Modalites: {
      modalite: 'Soins sans consentement',
      soinsSansConsentementType: "À la demande d'un représentant de l'État",
      soinsSansConsentementDemandeur: 'Commissariat de Police du 6ème Arrondissement / Ordonnance du Procureur',
      dateDecisionOuCertificat: '2026-09-28',
      observationsModalite: 'Admis en urgence suite à des troubles à l’ordre public et bris de matériel sur la voie publique.'
    },
    s3Motif: {
      plaintePrincipale: 'Agitation psychomotrice majeure, cris incohérents dans la rue, menaces verbales.',
      sourcePlainte: 'Entourage'
    },
    s4HistoireMaladie: {
      modeInstallation: 'Brutal',
      facteursDeclenchants: ['Stress', 'Autre'],
      facteursDeclenchantsAutrePrecision: 'Rupture thérapeutique médicamenteuse constatée il y a 10 jours.',
      itineraireTherapeutique: '',
      evolutionAvecTraitement: '',
      evolutionSansTraitement: '',
      retentissementSocioProfessionnel: ''
    },
    s5Representation: {
      categories: [],
      precisions: ''
    },
    s6Antecedents: {
      personnels: {
        medicaux: { aucun: true, details: '' },
        chirurgicaux: { aucun: true, details: '' },
        psychiatriques: { aucun: false, details: 'Hospitalisation brève en 2024 pour épisode similaire.' },
        addictifs: { aucun: false, details: 'Usage régulier de cannabis signalé par la famille.' },
        judiciaires: { aucun: false, details: 'Garde à vue pour rixe en 2025.' }
      },
      familiaux: {
        medicaux: { aucun: true, details: '' },
        chirurgicaux: { aucun: true, details: '' },
        psychiatriques: { aucun: true, details: '' },
        addictifs: { aucun: false, details: 'Tabagisme paternel.' }
      }
    },
    s7Biographie: {
      ascendants: {
        pere: { nom: 'Mamadou Coulibaly', vivant: true, profession: 'Chauffeur' },
        mere: { nom: 'Assitan Sidibé', vivant: true, profession: 'Commerçante' }
      },
      collateraux: {
        fratrie: []
      },
      conceptionGrossesseAccouchement: '',
      developpementPsychomoteur: {},
      scolarite: {
        niveauAtteint: 'Collège (arrêt en classe de 8ème)'
      },
      developpementProfessionnel: 'Apprentissage mécanique interrompu.',
      developpementSexuelEtSentimentale: {
        spermarcheAge: '14 ans',
        conjoints: [],
        enfants: []
      },
      evenementsMarquants: { positifs: [], negatifs: [] }
    },
    s8EnqueteSociale: {},
    s9Demande: {
      demandeConsciente: '« Laissez-moi sortir, je n’ai rien fait ! »'
    },
    s10ExamenClinique: {
      somatique: {
        nonRealise: true,
        motifNonRealise: 'Patient trop agité à l’admission pour prise complète des constantes ; chambre d’apaisement.',
        constantes: {},
        appareils: {}
      },
      psychiatrique: {
        contact: 'Très difficile, méfiant et opposant.',
        mimique: 'Faciès crispé et agressif.',
        psychomotriciteComportement: 'Agitation motrice, déambulation incessante.'
      }
    },
    s11ResumeSyndromique: {
      resume: '',
      syndromesIdentifies: ['Syndrome d’agitation psychomotrice']
    },
    s12HypothesesDiag: {
      hypotheses: []
    },
    s13Bilans: {
      bilans: []
    },
    s14PriseEnCharge: {
      orientation: 'Hospitalisation',
      hospitalisationDetails: {
        service: 'Unité de soins fermée / Chambre d’isolement et de sécurité',
        lit: 'Lit 02'
      },
      traitementMedicamenteux: [],
      psychotherapie: {}
    },
    s15Evolution: {
      entrees: [
        {
          id: 'evo-coul-1',
          dateHeure: '2026-09-28T01:30:00Z',
          auteurNom: 'Bakary Keïta',
          auteurRole: 'SECRETARIAT',
          note: 'Dossier administratif ouvert sous réquisition de police. Patient orienté vers le médecin de garde.'
        }
      ]
    },
    s16ProjetTherapeutique: {
      versionCourante: 1,
      objectifsCourtTerme: '',
      objectifsMoyenTerme: '',
      moyensEtStrategies: '',
      echeancesEtRevisions: '',
      intervenants: [],
      historiqueVersions: []
    },
    s17Pronostic: {
      courtTerme: { appreciation: '', details: '' },
      moyenTerme: { appreciation: '', details: '' },
      longTerme: { appreciation: '', details: '' }
    }
  },
  {
    id: 'dossier-004',
    statut: 'ARCHIVÉ',
    dateCreation: '2025-11-10T09:00:00Z',
    dateDerniereModification: '2026-08-30T10:00:00Z',
    psychiatreReferent: 'Dr. Oumar Diallo',
    serviceHospitalier: 'Service de Psychiatrie Universitaire',
    archivageInfo: {
      dateHeure: '2026-08-30T10:00:00Z',
      archiveParNom: 'Mahamadou Touré (ADMIN)',
      motif: 'Mutation géographique de la patiente à Sikasso avec transfert du dossier médical au médecin chef régional.'
    },
    addenda: [],
    s1Identification: {
      numeroOrdre: 'PSY-2025-0142',
      nom: 'SAMAKÉ',
      prenoms: 'Awa',
      age: 45,
      dateNaissance: '1981-03-22',
      sexe: 'Féminin',
      profession: 'Comptable',
      situationMatrimoniale: 'Marié(e)',
      religion: 'Musulmane',
      ethnie: 'Sénoufo',
      adresse: 'Sikasso, Quartier Wayerma (auparavant Bamako)',
      telephone: '+223 76 99 88 77'
    },
    s2Modalites: {
      modalite: 'Libre',
      observationsModalite: 'Suivi régulier de longue durée.'
    },
    s3Motif: {
      plaintePrincipale: 'Consultation de suivi et de stabilisation dans le cadre d’un trouble bipolaire de type I euthymique sous lithium.',
      sourcePlainte: 'Patient'
    },
    s4HistoireMaladie: {
      dateDebut: '2015-05-10',
      modeInstallation: 'Progressif',
      facteursDeclenchants: ['Stress'],
      itineraireTherapeutique: 'Suivi au CHU du Point G puis transféré en clinique.',
      evolutionAvecTraitement: 'Excellente euthymie sous thymorégulateur.',
      evolutionSansTraitement: 'Récidives maniaques si arrêt.',
      retentissementSocioProfessionnel: 'Activité professionnelle maintenue avec succès.'
    },
    s5Representation: {
      categories: [],
      precisions: 'Très bonne compréhension médicale du trouble de l’humeur.'
    },
    s6Antecedents: {
      personnels: {
        medicaux: { aucun: true, details: '' },
        chirurgicaux: { aucun: true, details: '' },
        gynecoObstetricaux: { aucun: false, details: 'G2P2, ménopause précoce à 43 ans.' },
        psychiatriques: { aucun: false, details: 'Trois épisodes maniaques sévères entre 2015 et 2020.' },
        addictifs: { aucun: true, details: '' },
        judiciaires: { aucun: true, details: '' }
      },
      familiaux: {
        medicaux: { aucun: true, details: '' },
        chirurgicaux: { aucun: true, details: '' },
        psychiatriques: { aucun: false, details: 'Sœur aînée traitée pour dépression récurrente.' },
        addictifs: { aucun: true, details: '' }
      }
    },
    s7Biographie: {
      ascendants: {
        pere: { nom: 'Bakary Samaké', vivant: false },
        mere: { nom: 'Mariétou Traoré', vivant: true }
      },
      collateraux: { fratrie: [] },
      conceptionGrossesseAccouchement: 'Sans particularité',
      developpementPsychomoteur: {},
      scolarite: { niveauAtteint: 'Maîtrise en Sciences Économiques' },
      developpementProfessionnel: 'Cadre comptable dans une entreprise agroalimentaire.',
      developpementSexuelEtSentimentale: {
        menarcheAge: '14 ans',
        conjoints: [{ id: 'cj-s', nom: 'Moussa Fofana', statut: 'Époux' }],
        enfants: []
      },
      evenementsMarquants: { positifs: [], negatifs: [] }
    },
    s8EnqueteSociale: {
      relationsSociales: 'Excellentes relations professionnelles et familiales.'
    },
    s9Demande: {
      demandeConsciente: 'Obtenir la synthèse clinique pour la continuation du traitement à Sikasso.'
    },
    s10ExamenClinique: {
      somatique: {
        nonRealise: false,
        constantes: {
          temperature: 36.6,
          tensionSystolique: 120,
          tensionDiastolique: 80,
          pouls: 70,
          saturationO2: 99
        },
        etatGeneral: 'Très bon état général.',
        appareils: {}
      },
      psychiatrique: {
        contact: 'Contact très aisé, synthétique.',
        mimique: 'Euthymique, congruente.',
        penseeEtJugement: 'Cohérente, pas d’idées délirantes.'
      }
    },
    s11ResumeSyndromique: {
      resume: 'Patiente de 45 ans suivie pour un trouble affectif bipolaire de type I, en rémission clinique complète et durable sous Carbonate de Lithium.',
      syndromesIdentifies: ['Euthymie']
    },
    s12HypothesesDiag: {
      hypotheses: [
        {
          id: 'hyp-awa-1',
          type: 'Principale',
          codeCimDsm: 'F31.1',
          libelle: 'Trouble affectif bipolaire en rémission actuelle sous traitement',
          argumentsCliniques: 'Stabilité thymique depuis plus de 4 ans sans récidive.'
        }
      ]
    },
    s13Bilans: {
      bilans: [
        {
          id: 'bil-lith-1',
          type: 'Lithémie plasmatique, Créatinine, TSH',
          datePrescription: '2026-08-10',
          prescripteur: 'Dr. Oumar Diallo',
          statut: 'Résultat reçu',
          dateRealisation: '2026-08-12',
          resultat: 'Lithémie: 0.72 mEq/L (zone thérapeutique 0.6 - 0.8), Créatinine: 74 µmol/L, TSH: 2.1 mUI/L.',
          interpretation: 'Bilan de surveillance optimal.'
        }
      ]
    },
    s14PriseEnCharge: {
      orientation: 'Ambulatoire',
      traitementMedicamenteux: [
        {
          id: 'rx-awa-1',
          molecule: 'Carbonate de Lithium (Téralithe LP)',
          posologie: '400 mg',
          voie: 'Orale',
          frequence: '2 comprimés le soir à 20h',
          dateDebut: '2020-04-15',
          prescripteur: 'Dr. Oumar Diallo'
        }
      ],
      psychotherapie: {}
    },
    s15Evolution: {
      entrees: [
        {
          id: 'evo-awa-1',
          dateHeure: '2026-08-30T09:30:00Z',
          auteurNom: 'Dr. Oumar Diallo',
          auteurRole: 'PSYCHIATRE',
          note: 'Dernière consultation avant déménagement à Sikasso. Remise du dossier de liaison et des ordonnances pour 3 mois.'
        }
      ]
    },
    s16ProjetTherapeutique: {
      versionCourante: 1,
      objectifsCourtTerme: 'Continuité des soins à Sikasso.',
      objectifsMoyenTerme: 'Surveillance semestrielle de la lithémie et de la fonction rénale.',
      moyensEtStrategies: 'Relais avec le psychiatre référent de Sikasso.',
      echeancesEtRevisions: '6 mois.',
      intervenants: ['Dr. Oumar Diallo'],
      historiqueVersions: []
    },
    s17Pronostic: {
      courtTerme: { appreciation: 'Favorable', details: 'Stabilité parfaite.' },
      moyenTerme: { appreciation: 'Favorable', details: 'Observance exemplaire.' },
      longTerme: { appreciation: 'Favorable', details: 'Excellente qualité de vie.' }
    }
  }
];

export const INITIAL_AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'log-001',
    timestamp: '2026-09-24T14:45:00Z',
    userId: 'user-psy-1',
    userName: 'Dr. Oumar Diallo',
    userRole: 'PSYCHIATRE',
    patientId: 'dossier-001',
    patientNumeroOrdre: 'PSY-2026-0001',
    dossierId: 'dossier-001',
    action: 'VALIDATION',
    rubriqueNom: 'Validation Dossier',
    details: 'Validation et verrouillage officiel du dossier médical après réunion de synthèse clinique.'
  },
  {
    id: 'log-002',
    timestamp: '2026-09-26T10:15:00Z',
    userId: 'user-psy-1',
    userName: 'Dr. Oumar Diallo',
    userRole: 'PSYCHIATRE',
    patientId: 'dossier-001',
    patientNumeroOrdre: 'PSY-2026-0001',
    dossierId: 'dossier-001',
    action: 'ADDENDUM',
    rubriqueId: 's14',
    rubriqueNom: 'S14 : Prise en charge',
    details: 'Ajout d’un addendum clinique daté relatif à la tolérance de l’Olanzapine.'
  },
  {
    id: 'log-003',
    timestamp: '2026-09-27T16:30:00Z',
    userId: 'user-psy-2',
    userName: 'Dr. Aminata Konaté',
    userRole: 'PSYCHIATRE',
    patientId: 'dossier-002',
    patientNumeroOrdre: 'PSY-2026-0002',
    dossierId: 'dossier-002',
    action: 'MODIFICATION',
    rubriqueId: 's10',
    rubriqueNom: 'S10 : Examen clinique',
    details: 'Saisie de l’examen somatique et psychiatrique initial.'
  },
  {
    id: 'log-004',
    timestamp: '2026-09-28T01:15:00Z',
    userId: 'user-sec-1',
    userName: 'Bakary Keïta',
    userRole: 'SECRETARIAT',
    patientId: 'dossier-003',
    patientNumeroOrdre: 'PSY-2026-0003',
    dossierId: 'dossier-003',
    action: 'CREATION',
    rubriqueId: 's1',
    rubriqueNom: 'S1 : Identification',
    details: 'Création du dossier patient d’urgence suite à réquisition.'
  }
];
