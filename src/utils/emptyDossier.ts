import { DossierPsychiatrique, UserRole } from '../types';

/** Section keys of a dossier, indexed by rubrique id (s1…s17). */
export const SECTION_KEYS = {
  s1: 's1Identification',
  s2: 's2Modalites',
  s3: 's3Motif',
  s4: 's4HistoireMaladie',
  s5: 's5Representation',
  s6: 's6Antecedents',
  s7: 's7Biographie',
  s8: 's8EnqueteSociale',
  s9: 's9Demande',
  s10: 's10ExamenClinique',
  s11: 's11ResumeSyndromique',
  s12: 's12HypothesesDiag',
  s13: 's13Bilans',
  s14: 's14PriseEnCharge',
  s15: 's15Evolution',
  s16: 's16ProjetTherapeutique',
  s17: 's17Pronostic',
} as const satisfies Record<string, keyof DossierPsychiatrique>;

export type RubriqueId = keyof typeof SECTION_KEYS;
export type SectionKey = (typeof SECTION_KEYS)[RubriqueId];

/** Blank dossier with every section initialised; used for creation and for redacting hidden sections. */
export function createEmptyDossier(opts: {
  id: string;
  numeroOrdre: string;
  now: string;
  sexe?: 'Masculin' | 'Féminin';
  psychiatreReferent?: string;
  intervenant?: string;
}): DossierPsychiatrique {
  const sexe = opts.sexe ?? 'Masculin';
  return {
    id: opts.id,
    statut: 'BROUILLON',
    dateCreation: opts.now,
    dateDerniereModification: opts.now,
    psychiatreReferent: opts.psychiatreReferent ?? '',
    serviceHospitalier: 'Service de Psychiatrie Universitaire',
    addenda: [],
    s1Identification: {
      numeroOrdre: opts.numeroOrdre,
      nom: '',
      prenoms: '',
      age: 0,
      sexe,
      profession: '',
      situationMatrimoniale: '',
      religion: '',
      ethnie: '',
      adresse: '',
    },
    s2Modalites: { modalite: 'Libre' },
    s3Motif: { plaintePrincipale: '', sourcePlainte: 'Patient et entourage' },
    s4HistoireMaladie: { modeInstallation: '', facteursDeclenchants: [] },
    s5Representation: { categories: [] },
    s6Antecedents: {
      personnels: {
        medicaux: { aucun: false, details: '' },
        chirurgicaux: { aucun: false, details: '' },
        gynecoObstetricaux: sexe === 'Féminin' ? { aucun: false, details: '' } : undefined,
        psychiatriques: { aucun: false, details: '' },
        addictifs: { aucun: false, details: '' },
        judiciaires: { aucun: false, details: '' },
      },
      familiaux: {
        medicaux: { aucun: false, details: '' },
        chirurgicaux: { aucun: false, details: '' },
        psychiatriques: { aucun: false, details: '' },
        addictifs: { aucun: false, details: '' },
      },
    },
    s7Biographie: {
      ascendants: { pere: { nom: '', vivant: true }, mere: { nom: '', vivant: true } },
      collateraux: { fratrie: [] },
      conceptionGrossesseAccouchement: '',
      developpementPsychomoteur: {},
      scolarite: {},
      developpementProfessionnel: '',
      developpementSexuelEtSentimentale: { conjoints: [], enfants: [] },
      evenementsMarquants: { positifs: [], negatifs: [] },
    },
    s8EnqueteSociale: {
      autodescription: '',
      heterodescription: '',
      relationsSociales: '',
      loisirs: '',
      conduitesAddictives: '',
    },
    s9Demande: { demandeConsciente: '', demandeInconsciente: '' },
    s10ExamenClinique: {
      somatique: { nonRealise: false, constantes: {}, appareils: {} },
      psychiatrique: {},
    },
    s11ResumeSyndromique: { syndromesIdentifies: [], resume: '' },
    s12HypothesesDiag: { hypotheses: [] },
    s13Bilans: { bilans: [] },
    s14PriseEnCharge: { orientation: '', traitementMedicamenteux: [], psychotherapie: {} },
    s15Evolution: { entrees: [] },
    s16ProjetTherapeutique: {
      versionCourante: 1,
      objectifsCourtTerme: '',
      objectifsMoyenTerme: '',
      moyensEtStrategies: '',
      echeancesEtRevisions: '',
      intervenants: opts.intervenant ? [opts.intervenant] : [],
      historiqueVersions: [],
    },
    s17Pronostic: {
      courtTerme: { appreciation: '', details: '' },
      moyenTerme: { appreciation: '', details: '' },
      longTerme: { appreciation: '', details: '' },
    },
  };
}

/** Roles allowed to open a new dossier (PRD B3: Ø → BROUILLON). */
export const ROLES_CAN_CREATE_DOSSIER: UserRole[] = ['SECRETARIAT', 'INFIRMIER', 'PSYCHIATRE'];
/** Roles allowed to read the audit journal (PRD F-01). */
export const ROLES_CAN_READ_AUDIT: UserRole[] = ['ADMIN', 'PSYCHIATRE', 'LECTEUR'];
/** Roles allowed to export (PRD F-22 / B5: clinical roles only). */
export const ROLES_CAN_EXPORT: UserRole[] = ['PSYCHIATRE', 'PSYCHOLOGUE', 'INFIRMIER', 'ASSISTANT_SOCIAL'];
