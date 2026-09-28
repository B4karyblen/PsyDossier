export type UserRole = 
  | 'ADMIN'
  | 'PSYCHIATRE'
  | 'PSYCHOLOGUE'
  | 'INFIRMIER'
  | 'ASSISTANT_SOCIAL'
  | 'SECRETARIAT'
  | 'LECTEUR';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  service: string;
  email: string;
}

export type DossierStatus = 'BROUILLON' | 'EN_COURS' | 'VALIDÉ' | 'ARCHIVÉ';

export type RubriqueCompleteness = 'NON_COMMENCEE' | 'PARTIELLE' | 'COMPLETE';

export type AuditAction = 
  | 'LECTURE'
  | 'CREATION'
  | 'MODIFICATION'
  | 'VALIDATION'
  | 'ARCHIVAGE'
  | 'REACTIVATION'
  | 'EXPORT'
  | 'ADDENDUM';

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  patientId: string;
  patientNumeroOrdre: string;
  dossierId: string;
  action: AuditAction;
  rubriqueId?: string;
  rubriqueNom?: string;
  details: string;
  oldValueSummary?: string;
  newValueSummary?: string;
}

// S1: Identification
export interface S1IdentificationData {
  numeroOrdre: string; // Unique, auto-generated, read-only
  nom: string; // Required
  prenoms: string; // Required
  age: number; // Required
  dateNaissance?: string;
  sexe: 'Masculin' | 'Féminin'; // Required, conditions S6 & S7
  profession: string;
  situationMatrimoniale: string;
  religion: string;
  ethnie: string;
  adresse: string;
  telephone?: string;
  personneContact?: string;
}

// S2: Modalités de consultation
export type ModaliteType = 'Libre' | 'Adressé par un tiers' | 'Soins sans consentement';
export type SoinsSansConsentementType = "À la demande d'un tiers" | "À la demande d'un représentant de l'État";

export interface S2ModalitesData {
  modalite: ModaliteType;
  adresseParTiersType?: 'Médecin traitant' | 'Centre de santé' | 'Famille' | 'Autre';
  adresseParTiersPrecision?: string;
  soinsSansConsentementType?: SoinsSansConsentementType;
  soinsSansConsentementDemandeur?: string;
  dateDecisionOuCertificat?: string;
  observationsModalite?: string;
}

// S3: Motif de consultation actuel
export interface S3MotifData {
  plaintePrincipale: string; // Required
  sourcePlainte: 'Patient' | 'Entourage' | 'Patient et entourage';
  accompagnateurs?: string;
}

// S4: Histoire de la maladie (anamnèse)
export interface S4HistoireMaladieData {
  dateDebut?: string;
  modeInstallation: 'Brutal' | 'Progressif' | '';
  facteursDeclenchants: string[]; // stress, deuil, rupture sentimentale, échec, perte d'emploi, autre
  facteursDeclenchantsAutrePrecision?: string;
  facteursAggravants?: string;
  itineraireTherapeutique?: string; // structures, tradipraticiens, ordre chrono
  evolutionAvecTraitement?: string;
  evolutionSansTraitement?: string;
  retentissementSocioProfessionnel?: string;
}

// S5: Représentation socio-culturelle de la maladie
export interface S5RepresentationData {
  explicationPatient?: string;
  explicationFamille?: string;
  categories: string[]; // sorcellerie, envoûtement, djinn, autre
  precisions?: string;
}

// S6: Antécédents
export interface AntecedentItem {
  aucun: boolean;
  details: string;
}

export interface S6AntecedentsData {
  personnels: {
    medicaux: AntecedentItem;
    chirurgicaux: AntecedentItem;
    gynecoObstetricaux?: AntecedentItem; // Affiché seulement si sexe === 'Féminin'
    psychiatriques: AntecedentItem;
    addictifs: AntecedentItem;
    judiciaires: AntecedentItem;
  };
  familiaux: {
    medicaux: AntecedentItem;
    chirurgicaux: AntecedentItem;
    psychiatriques: AntecedentItem;
    addictifs: AntecedentItem;
    // Note: pas de judiciaires ni gynéco selon BR-011
  };
}

// S7: Éléments de biographie
export interface ParentBio {
  nom: string;
  age?: number;
  profession?: string;
  vivant: boolean;
  antecedentsNotables?: string;
}

export interface FratrieItem {
  id: string;
  nom: string;
  age?: number;
  sexe: 'M' | 'F';
  rang: number;
  profession?: string;
  vivant: boolean;
}

export interface ConjointItem {
  id: string;
  nom: string;
  statut: string; // actuel, ex-conjoint(e), etc.
  dureeUnion?: string;
}

export interface EnfantItem {
  id: string;
  nom: string;
  age?: number;
  sexe: 'M' | 'F';
}

export interface S7BiographieData {
  ascendants: {
    pere: ParentBio;
    mere: ParentBio;
  };
  collateraux: {
    placeFratrieUterine?: number;
    nombreFreresSoeursDeclares?: number;
    fratrie: FratrieItem[];
  };
  conceptionGrossesseAccouchement: string;
  developpementPsychomoteur: {
    marche?: string;
    langage?: string;
    proprete?: string;
    remarques?: string;
  };
  scolarite: {
    debutAge?: number;
    niveauAtteint?: string;
    diplomes?: string;
    echecsScolaires?: string;
    vecuDesEchecs?: string;
  };
  developpementProfessionnel: string;
  developpementSexuelEtSentimentale: {
    menarcheAge?: string; // Si Féminin
    spermarcheAge?: string; // Si Masculin
    premierRapportConditionsVecu?: string;
    principalesRelationsAmoureuses?: string;
    conjoints: ConjointItem[];
    nombreEnfants?: number;
    enfants: EnfantItem[];
  };
  evenementsMarquants: {
    positifs: string[];
    negatifs: string[];
  };
}

// S8: Enquête sociale
export interface S8EnqueteSocialeData {
  autodescription?: string;
  heterodescription?: string;
  heterodescriptionSource?: string;
  relationsSociales?: string;
  loisirs?: string;
  conduitesAddictives?: string;
}

// S9: Demande du patient
export interface S9DemandeData {
  demandeConsciente?: string;
  demandeInconsciente?: string; // Réservé PSYCHIATRE & PSYCHOLOGUE
  demandeEntourage?: string;
}

// S10: Examen clinique
export interface ConstantesSomatiques {
  temperature?: number; // °C
  tensionSystolique?: number; // mmHg
  tensionDiastolique?: number; // mmHg
  pouls?: number; // bpm
  frequenceRespiratoire?: number; // cycles/min
  saturationO2?: number; // % (max 100)
}

export interface ExamenAppareils {
  cardiovasculaire?: string;
  respiratoire?: string;
  digestif?: string;
  neurologique?: string;
  locomoteur?: string;
  autres?: string;
}

export interface ExamenPsychiatriqueItems {
  tenueVestimentaireEtHygiene?: string;
  mimique?: string;
  contact?: string;
  psychomotriciteComportement?: string;
  conduites?: string;
  fonctionsSymboliques?: string;
  fonctionsMnesiques?: string;
  penseeEtJugement?: string;
  activitesPerceptives?: string;
  conscienceDeSoiEtEnvironnement?: string;
  expressionDesAffects?: string;
}

export interface S10ExamenCliniqueData {
  somatique: {
    nonRealise: boolean;
    motifNonRealise?: string;
    constantes: ConstantesSomatiques;
    etatGeneral?: string;
    appareils: ExamenAppareils;
  };
  psychiatrique: ExamenPsychiatriqueItems;
}

// S11: Résumé syndromique
export interface S11ResumeSyndromiqueData {
  resume: string; // Obligatoire pour validation
  syndromesIdentifies: string[];
}

// S12: Hypothèses diagnostiques
export interface HypotheseDiagnostiqueItem {
  id: string;
  type: 'Principale' | 'Différentielle';
  codeCimDsm?: string;
  libelle: string;
  argumentsCliniques: string;
}

export interface S12HypothesesDiagData {
  hypotheses: HypotheseDiagnostiqueItem[];
}

// S13: Bilans paracliniques
export interface BilanItem {
  id: string;
  type: string;
  datePrescription: string;
  prescripteur: string;
  statut: 'Prescrit' | 'Réalisé' | 'Résultat reçu';
  dateRealisation?: string;
  resultat?: string;
  interpretation?: string;
}

export interface S13BilansData {
  bilans: BilanItem[];
}

// S14: Prise en charge
export interface PrescriptionItem {
  id: string;
  molecule: string;
  posologie: string;
  voie: 'Orale' | 'Injectable IM' | 'Injectable IV' | 'Autre';
  frequence: string;
  dateDebut: string;
  dateFin?: string;
  remarques?: string;
  prescripteur: string;
}

export interface S14PriseEnChargeData {
  orientation: 'Ambulatoire' | 'Hospitalisation' | '';
  hospitalisationDetails?: {
    service?: string;
    lit?: string;
    dateEntree?: string;
    motif?: string;
  };
  traitementMedicamenteux: PrescriptionItem[];
  psychotherapie: {
    type?: string;
    frequence?: string;
    therapeute?: string;
    objectifs?: string;
  };
}

// S15: Évolution clinique
export interface EntreeEvolution {
  id: string;
  dateHeure: string;
  auteurNom: string;
  auteurRole: UserRole;
  note: string;
  estAddendum?: boolean;
  addendumParentId?: string;
}

export interface S15EvolutionData {
  entrees: EntreeEvolution[];
}

// S16: Projet thérapeutique
export interface ProjetTherapeutiqueVersion {
  version: number;
  dateHeure: string;
  auteurNom: string;
  auteurRole: UserRole;
  objectifsCourtTerme: string;
  objectifsMoyenTerme: string;
  moyensEtStrategies: string;
  echeancesEtRevisions: string;
  intervenants: string[];
}

export interface S16ProjetTherapeutiqueData {
  versionCourante: number;
  objectifsCourtTerme: string;
  objectifsMoyenTerme: string;
  moyensEtStrategies: string;
  echeancesEtRevisions: string;
  intervenants: string[];
  historiqueVersions: ProjetTherapeutiqueVersion[];
}

// S17: Pronostic
export interface PronosticHorizon {
  appreciation: 'Favorable' | 'Réservé' | 'Défavorable' | '';
  details: string;
}

export interface S17PronosticData {
  courtTerme: PronosticHorizon;
  moyenTerme: PronosticHorizon;
  longTerme: PronosticHorizon;
  facteursPronostiques?: string;
}

// Complete Patient Record Data
export interface DossierPsychiatrique {
  id: string;
  statut: DossierStatus;
  dateCreation: string;
  dateDerniereModification: string;
  psychiatreReferent: string;
  serviceHospitalier: string;
  
  // 17 Rubriques
  s1Identification: S1IdentificationData;
  s2Modalites: S2ModalitesData;
  s3Motif: S3MotifData;
  s4HistoireMaladie: S4HistoireMaladieData;
  s5Representation: S5RepresentationData;
  s6Antecedents: S6AntecedentsData;
  s7Biographie: S7BiographieData;
  s8EnqueteSociale: S8EnqueteSocialeData;
  s9Demande: S9DemandeData;
  s10ExamenClinique: S10ExamenCliniqueData;
  s11ResumeSyndromique: S11ResumeSyndromiqueData;
  s12HypothesesDiag: S12HypothesesDiagData;
  s13Bilans: S13BilansData;
  s14PriseEnCharge: S14PriseEnChargeData;
  s15Evolution: S15EvolutionData;
  s16ProjetTherapeutique: S16ProjetTherapeutiqueData;
  s17Pronostic: S17PronosticData;

  // Validation details
  validationInfo?: {
    dateHeure: string;
    valideParNom: string;
    valideParRole: UserRole;
    signataire: string;
  };

  // Archiving details
  archivageInfo?: {
    dateHeure: string;
    archiveParNom: string;
    motif: string;
  };

  // Addenda when dossier is VALIDÉ
  addenda: Array<{
    id: string;
    dateHeure: string;
    auteurNom: string;
    auteurRole: UserRole;
    rubriqueId: string;
    rubriqueNom: string;
    contenu: string;
  }>;
}

export interface RubriqueDefinition {
  id: string;
  num: number;
  code: string;
  titre: string;
  bloc: 'ADMINISTRATIF' | 'ANAMNÈSE' | 'ANTÉCÉDENTS' | 'CLINIQUE' | 'SYNTHÈSE' | 'PRISE EN CHARGE';
  description: string;
}

export interface ReferenceLists {
  religions: string[];
  ethnies: string[];
  situationsMatrimoniales: string[];
  typesBilans: string[];
  syndromesFrequents: string[];
  diagnosticClassifications: Array<{ code: string; label: string }>;
}
