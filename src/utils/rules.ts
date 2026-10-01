import {
  DossierPsychiatrique,
  UserRole,
  RubriqueCompleteness,
  RubriqueDefinition
} from '../types';

export const RUBRIQUES_CONFIG: RubriqueDefinition[] = [
  { id: 's1', num: 1, code: 'S1', titre: 'Identification du patient', bloc: 'ADMINISTRATIF', description: 'État civil, coordonnées, données socio-démographiques' },
  { id: 's2', num: 2, code: 'S2', titre: 'Modalités de consultation', bloc: 'ADMINISTRATIF', description: 'Libre, adressé par un tiers ou soins sans consentement' },
  { id: 's3', num: 3, code: 'S3', titre: 'Motif de consultation actuel', bloc: 'ANAMNÈSE', description: 'Plainte principale formulée par le patient ou l’entourage' },
  { id: 's4', num: 4, code: 'S4', titre: 'Histoire de la maladie', bloc: 'ANAMNÈSE', description: 'Anamnèse, mode d’installation, facteurs déclenchants, itinéraire' },
  { id: 's5', num: 5, code: 'S5', titre: 'Représentation socio-culturelle', bloc: 'ANAMNÈSE', description: 'Perception du patient et de la famille (sorcellerie, djinns, etc.)' },
  { id: 's6', num: 6, code: 'S6', titre: 'Antécédents', bloc: 'ANTÉCÉDENTS', description: 'Personnels (méd., chir., gynéco., psy., jud.) et familiaux' },
  { id: 's7', num: 7, code: 'S7', titre: 'Éléments de biographie', bloc: 'ANTÉCÉDENTS', description: 'Ascendants, fratrie utérine, scolarité, vie affective et événements' },
  { id: 's8', num: 8, code: 'S8', titre: 'Enquête sociale', bloc: 'ANTÉCÉDENTS', description: 'Autodescription, hétérodescription, relations et conduites addictives' },
  { id: 's9', num: 9, code: 'S9', titre: 'Demande du patient', bloc: 'ANTÉCÉDENTS', description: 'Demande consciente et demande inconsciente (psycho-dynamique)' },
  { id: 's10', num: 10, code: 'S10', titre: 'Examen clinique', bloc: 'CLINIQUE', description: 'Examen somatique (constantes, appareils) et examen psychiatrique' },
  { id: 's11', num: 11, code: 'S11', titre: 'Résumé syndromique', bloc: 'SYNTHÈSE', description: 'Synthèse sémiologique et regroupement syndromique' },
  { id: 's12', num: 12, code: 'S12', titre: 'Hypothèses diagnostiques', bloc: 'SYNTHÈSE', description: 'Diagnostic principal et différentiels (Psychiatre uniquement)' },
  { id: 's13', num: 13, code: 'S13', titre: 'Bilans paracliniques', bloc: 'SYNTHÈSE', description: 'Analyses bio, imagerie, EEG, bilans psychométriques' },
  { id: 's14', num: 14, code: 'S14', titre: 'Prise en charge', bloc: 'PRISE EN CHARGE', description: 'Orientation, prescriptions médicamenteuses, psychothérapie' },
  { id: 's15', num: 15, code: 'S15', titre: 'Évolution clinique', bloc: 'PRISE EN CHARGE', description: 'Journal clinique chronologique inaltérable et addenda' },
  { id: 's16', num: 16, code: 'S16', titre: 'Projet thérapeutique', bloc: 'PRISE EN CHARGE', description: 'Objectifs à court et moyen terme, moyens et versions' },
  { id: 's17', num: 17, code: 'S17', titre: 'Pronostic', bloc: 'PRISE EN CHARGE', description: 'Évaluation pronostique à court, moyen et long terme' },
];

/**
 * Matrice de permissions B2
 * Returns: 'write' | 'read' | 'none'
 */
export function getRubriquePermission(role: UserRole, rubriqueId: string): 'write' | 'read' | 'none' {
  if (role === 'LECTEUR') return 'read';
  // ADMIN (PRD B2): reads S1–S2 only, no access to clinical rubriques
  if (role === 'ADMIN') return rubriqueId === 's1' || rubriqueId === 's2' ? 'read' : 'none';

  switch (rubriqueId) {
    case 's1':
      // S1: ADMIN (L), PSYCHIATRE, INFIRMIER, SECRETARIAT (C/L/M), PSYCHOLOGUE, ASS. SOCIAL (L)
      if (['PSYCHIATRE', 'INFIRMIER', 'SECRETARIAT'].includes(role)) return 'write';
      return 'read';

    case 's2':
      // S2: ADMIN (L), PSYCHIATRE, SECRETARIAT (C/L/M), others (L)
      if (['PSYCHIATRE', 'SECRETARIAT'].includes(role)) return 'write';
      return 'read';

    case 's3':
    case 's4':
    case 's5':
      // S3-S5: PSYCHIATRE, PSYCHOLOGUE (C/L/M), INFIRMIER, ASS. SOCIAL (L), ADMIN/SECRETARIAT (X)
      if (['PSYCHIATRE', 'PSYCHOLOGUE'].includes(role)) return 'write';
      if (['INFIRMIER', 'ASSISTANT_SOCIAL'].includes(role)) return 'read';
      return 'none';

    case 's6':
      // S6: PSYCHIATRE, PSYCHOLOGUE, INFIRMIER (C/L/M), ASS. SOCIAL (L), ADMIN/SECRETARIAT (X)
      if (['PSYCHIATRE', 'PSYCHOLOGUE', 'INFIRMIER'].includes(role)) return 'write';
      if (role === 'ASSISTANT_SOCIAL') return 'read';
      return 'none';

    case 's7':
    case 's8':
      // S7-S8: PSYCHIATRE, PSYCHOLOGUE, ASS. SOCIAL (C/L/M), INFIRMIER (L)
      if (['PSYCHIATRE', 'PSYCHOLOGUE', 'ASSISTANT_SOCIAL'].includes(role)) return 'write';
      if (role === 'INFIRMIER') return 'read';
      return 'none';

    case 's9':
      // S9: PSYCHIATRE, PSYCHOLOGUE (write), INFIRMIER, ASS. SOCIAL (read)
      if (['PSYCHIATRE', 'PSYCHOLOGUE'].includes(role)) return 'write';
      if (['INFIRMIER', 'ASSISTANT_SOCIAL'].includes(role)) return 'read';
      return 'none';

    case 's10':
      // B2: Somatique — PSYCHIATRE & INFIRMIER write, PSYCHOLOGUE read
      //      Psychiatrique — PSYCHIATRE & PSYCHOLOGUE write, INFIRMIER read
      // Note: Component-level overrides handle the split; this returns the broadest permission
      if (['PSYCHIATRE', 'PSYCHOLOGUE', 'INFIRMIER'].includes(role)) return 'write';
      if (role === 'ASSISTANT_SOCIAL') return 'read';
      return 'none';

    case 's11':
      // S11: PSYCHIATRE (write), PSYCHOLOGUE, INFIRMIER, ASS. SOCIAL (read)
      if (role === 'PSYCHIATRE') return 'write';
      if (['PSYCHOLOGUE', 'INFIRMIER', 'ASSISTANT_SOCIAL'].includes(role)) return 'read';
      return 'none';

    case 's12':
      // S12 Hypothèses diag: PSYCHIATRE ONLY (write), others clinical (read)
      if (role === 'PSYCHIATRE') return 'write';
      if (['PSYCHOLOGUE', 'INFIRMIER'].includes(role)) return 'read';
      return 'none';

    case 's13':
      // S13: PSYCHIATRE (prescrit/write), INFIRMIER (saisie résultats/write), others (read)
      if (['PSYCHIATRE', 'INFIRMIER'].includes(role)) return 'write';
      if (role === 'PSYCHOLOGUE') return 'read';
      return 'none';

    case 's14':
      // S14: PSYCHIATRE (prescriptions/write), PSYCHOLOGUE (psychothérapie write)
      if (['PSYCHIATRE', 'PSYCHOLOGUE'].includes(role)) return 'write';
      if (role === 'INFIRMIER') return 'read';
      return 'none';

    case 's15':
      // S15: PSYCHIATRE, PSYCHOLOGUE, INFIRMIER, ASS. SOCIAL (write/add)
      if (['PSYCHIATRE', 'PSYCHOLOGUE', 'INFIRMIER', 'ASSISTANT_SOCIAL'].includes(role)) return 'write';
      return 'none';

    case 's16':
      // S16: PSYCHIATRE (write/validate), PSYCHOLOGUE (write), others (read)
      if (['PSYCHIATRE', 'PSYCHOLOGUE'].includes(role)) return 'write';
      if (['INFIRMIER', 'ASSISTANT_SOCIAL'].includes(role)) return 'read';
      return 'none';

    case 's17':
      // S17: PSYCHIATRE ONLY (write), PSYCHOLOGUE (read)
      if (role === 'PSYCHIATRE') return 'write';
      if (role === 'PSYCHOLOGUE') return 'read';
      return 'none';

    default:
      return 'read';
  }
}

/**
 * Calcul du statut de complétude d'une rubrique
 */
export function getRubriqueCompleteness(dossier: DossierPsychiatrique, rubriqueId: string): RubriqueCompleteness {
  switch (rubriqueId) {
    case 's1': {
      const { nom, prenoms, age, sexe, profession, adresse } = dossier.s1Identification;
      if (!nom || !prenoms || !age || !sexe) return 'PARTIELLE';
      if (profession && adresse) return 'COMPLETE';
      return 'PARTIELLE';
    }
    case 's2': {
      const { modalite, soinsSansConsentementType, adresseParTiersPrecision } = dossier.s2Modalites;
      if (!modalite) return 'NON_COMMENCEE';
      if (modalite === 'Soins sans consentement' && !soinsSansConsentementType) return 'PARTIELLE';
      if (modalite === 'Adressé par un tiers' && !adresseParTiersPrecision) return 'PARTIELLE';
      return 'COMPLETE';
    }
    case 's3': {
      const { plaintePrincipale } = dossier.s3Motif;
      if (!plaintePrincipale || plaintePrincipale.trim() === '') return 'NON_COMMENCEE';
      if (plaintePrincipale.length < 15) return 'PARTIELLE';
      return 'COMPLETE';
    }
    case 's4': {
      const { modeInstallation, facteursDeclenchants, itineraireTherapeutique } = dossier.s4HistoireMaladie;
      if (!modeInstallation && facteursDeclenchants.length === 0 && !itineraireTherapeutique) return 'NON_COMMENCEE';
      if (modeInstallation && (facteursDeclenchants.length > 0 || itineraireTherapeutique)) return 'COMPLETE';
      return 'PARTIELLE';
    }
    case 's5': {
      const { explicationPatient, explicationFamille, categories } = dossier.s5Representation;
      if (!explicationPatient && !explicationFamille && categories.length === 0) return 'NON_COMMENCEE';
      if ((explicationPatient || explicationFamille) && categories.length > 0) return 'COMPLETE';
      return 'PARTIELLE';
    }
    case 's6': {
      const p = dossier.s6Antecedents.personnels;
      const f = dossier.s6Antecedents.familiaux;
      const hasAny = (p.medicaux.aucun || p.medicaux.details) || (p.psychiatriques.aucun || p.psychiatriques.details);
      if (!hasAny) return 'NON_COMMENCEE';
      const hasFam = (f.medicaux.aucun || f.medicaux.details) || (f.psychiatriques.aucun || f.psychiatriques.details);
      if (hasAny && hasFam) return 'COMPLETE';
      return 'PARTIELLE';
    }
    case 's7': {
      const { ascendants, collateraux, scolarite } = dossier.s7Biographie;
      if (!ascendants.pere.nom && !ascendants.mere.nom && !scolarite.niveauAtteint) return 'NON_COMMENCEE';
      if ((ascendants.pere.nom || ascendants.mere.nom) && (scolarite.niveauAtteint || collateraux.fratrie.length > 0)) return 'COMPLETE';
      return 'PARTIELLE';
    }
    case 's8': {
      const { autodescription, relationsSociales } = dossier.s8EnqueteSociale;
      if (!autodescription && !relationsSociales) return 'NON_COMMENCEE';
      if (autodescription && relationsSociales) return 'COMPLETE';
      return 'PARTIELLE';
    }
    case 's9': {
      const { demandeConsciente, demandeInconsciente } = dossier.s9Demande;
      if (!demandeConsciente && !demandeInconsciente) return 'NON_COMMENCEE';
      if (demandeConsciente) return 'COMPLETE';
      return 'PARTIELLE';
    }
    case 's10': {
      const { somatique, psychiatrique } = dossier.s10ExamenClinique;
      const hasSom = somatique.nonRealise || (somatique.constantes.temperature && somatique.constantes.tensionSystolique);
      const hasPsy = Boolean(psychiatrique.contact || psychiatrique.mimique || psychiatrique.penseeEtJugement);
      if (!hasSom && !hasPsy) return 'NON_COMMENCEE';
      if (hasSom && hasPsy) return 'COMPLETE';
      return 'PARTIELLE';
    }
    case 's11': {
      const { resume } = dossier.s11ResumeSyndromique;
      if (!resume || resume.trim() === '') return 'NON_COMMENCEE';
      if (resume.length > 30) return 'COMPLETE';
      return 'PARTIELLE';
    }
    case 's12': {
      const { hypotheses } = dossier.s12HypothesesDiag;
      if (hypotheses.length === 0) return 'NON_COMMENCEE';
      const hasPrincipale = hypotheses.some(h => h.type === 'Principale');
      if (hasPrincipale) return 'COMPLETE';
      return 'PARTIELLE';
    }
    case 's13': {
      const { bilans } = dossier.s13Bilans;
      if (bilans.length === 0) return 'NON_COMMENCEE';
      return 'COMPLETE';
    }
    case 's14': {
      const { orientation, traitementMedicamenteux, psychotherapie } = dossier.s14PriseEnCharge;
      if (!orientation) return 'NON_COMMENCEE';
      if (traitementMedicamenteux.length > 0 || psychotherapie.type) return 'COMPLETE';
      return 'PARTIELLE';
    }
    case 's15': {
      const { entrees } = dossier.s15Evolution;
      if (entrees.length === 0) return 'NON_COMMENCEE';
      return 'COMPLETE';
    }
    case 's16': {
      const { objectifsCourtTerme, moyensEtStrategies } = dossier.s16ProjetTherapeutique;
      if (!objectifsCourtTerme && !moyensEtStrategies) return 'NON_COMMENCEE';
      if (objectifsCourtTerme && moyensEtStrategies) return 'COMPLETE';
      return 'PARTIELLE';
    }
    case 's17': {
      const { courtTerme, moyenTerme, longTerme } = dossier.s17Pronostic;
      if (!courtTerme.appreciation && !moyenTerme.appreciation && !longTerme.appreciation) return 'NON_COMMENCEE';
      if (courtTerme.appreciation && moyenTerme.appreciation && longTerme.appreciation) return 'COMPLETE';
      return 'PARTIELLE';
    }
    default:
      return 'NON_COMMENCEE';
  }
}

/**
 * Calcul du taux de complétude global (0 à 100%)
 */
export function calculateDossierStats(dossier: DossierPsychiatrique) {
  let completeCount = 0;
  let partialCount = 0;
  let notStartedCount = 0;

  RUBRIQUES_CONFIG.forEach(r => {
    const status = getRubriqueCompleteness(dossier, r.id);
    if (status === 'COMPLETE') completeCount++;
    else if (status === 'PARTIELLE') partialCount++;
    else notStartedCount++;
  });

  const percentage = Math.round(((completeCount * 1 + partialCount * 0.5) / RUBRIQUES_CONFIG.length) * 100);

  return {
    percentage,
    completeCount,
    partialCount,
    notStartedCount,
    total: RUBRIQUES_CONFIG.length,
  };
}

/**
 * Préconditions pour valider le dossier (F-21 & B3):
 * Nécessite S3 (Motif), S10 (Examen somatique + psychiatrique), S11 (Résumé syndromique),
 * S12 (Hypothèses diag avec au moins 1 principale), S14 (Orientation).
 */
export function checkDossierValidationPreconditions(dossier: DossierPsychiatrique): {
  canValidate: boolean;
  missingRequirements: string[];
  /** Non-blocking (F-20): shown before validation, do not prevent it. */
  warnings: string[];
} {
  const missing: string[] = [];

  // BR-002: S1 obligatoires
  if (!dossier.s1Identification.nom || !dossier.s1Identification.prenoms || !dossier.s1Identification.age) {
    missing.push('S1 : Identité incomplète (Nom, Prénoms, Âge)');
  }

  // BR-004 / BR-005: S2 modalité
  if (!dossier.s2Modalites.modalite) {
    missing.push('S2 : Modalité de consultation obligatoire');
  } else if (dossier.s2Modalites.modalite === 'Soins sans consentement' && !dossier.s2Modalites.soinsSansConsentementType) {
    missing.push('S2 : Préciser le sous-type pour les soins sans consentement');
  }

  // S3: Motif
  if (!dossier.s3Motif.plaintePrincipale || dossier.s3Motif.plaintePrincipale.trim() === '') {
    missing.push('S3 : Plainte principale (motif de consultation)');
  }

  // S10: Examen clinique
  const hasSomatique = dossier.s10ExamenClinique.somatique.nonRealise ||
    (dossier.s10ExamenClinique.somatique.constantes.tensionSystolique && dossier.s10ExamenClinique.somatique.constantes.temperature);
  const hasPsychiatrique = Boolean(dossier.s10ExamenClinique.psychiatrique.contact || dossier.s10ExamenClinique.psychiatrique.mimique);
  if (!hasSomatique || !hasPsychiatrique) {
    missing.push('S10 : Examen clinique (somatique et psychiatrique)');
  }

  // S11: Résumé syndromique
  if (!dossier.s11ResumeSyndromique.resume || dossier.s11ResumeSyndromique.resume.trim() === '') {
    missing.push('S11 : Résumé syndromique obligatoire');
  }

  // S12: Hypothèse principale
  const hasPrincipale = dossier.s12HypothesesDiag.hypotheses.some(h => h.type === 'Principale');
  if (!hasPrincipale) {
    missing.push('S12 : Au moins une hypothèse diagnostique Principale');
  }

  // S14: Orientation
  if (!dossier.s14PriseEnCharge.orientation) {
    missing.push('S14 : Orientation (Ambulatoire ou Hospitalisation) obligatoire');
  }

  // S17 (F-20, BR-010): an empty horizon is a non-blocking warning
  const warnings: string[] = [];
  const horizons: Array<[keyof typeof dossier.s17Pronostic, string]> = [
    ['courtTerme', 'court'],
    ['moyenTerme', 'moyen'],
    ['longTerme', 'long'],
  ];
  const emptyHorizons = horizons
    .filter(([key]) => !(dossier.s17Pronostic[key] as { appreciation?: string } | undefined)?.appreciation)
    .map(([, label]) => label);
  if (emptyHorizons.length) {
    warnings.push(`S17 : pronostic à ${emptyHorizons.join(', ')} terme non renseigné (BR-010)`);
  }

  return {
    canValidate: missing.length === 0,
    missingRequirements: missing,
    warnings,
  };
}
