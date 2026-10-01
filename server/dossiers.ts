/**
 * Server-side enforcement for dossier writes.
 *
 * The client is never trusted: every PUT is compared with the stored dossier, section by section,
 * against the permission matrix (PRD B2), field rules (BR-001…BR-017), the lifecycle (B3) and an
 * optimistic-concurrency version. Each accepted change produces audit entries with field-level
 * before/after values (BR-012).
 */
import crypto from 'node:crypto';
import { DossierPsychiatrique, DossierStatus } from '../src/types';
import { checkDossierValidationPreconditions, getRubriquePermission, RUBRIQUES_CONFIG } from '../src/utils/rules';
import {
  createEmptyDossier,
  ROLES_CAN_CREATE_DOSSIER,
  RubriqueId,
  SECTION_KEYS,
} from '../src/utils/emptyDossier';
import { db, parseRows } from './db';
import { diffFields, writeAudit } from './audit';
import type { SessionUser } from './auth';

export class HttpError extends Error {
  constructor(public status: number, message: string, public extra: Record<string, unknown> = {}) {
    super(message);
  }
}

const q = {
  all: db.prepare('SELECT data FROM dossiers ORDER BY updated_at DESC'),
  byId: db.prepare('SELECT data FROM dossiers WHERE id = ?'),
  upsert: db.prepare(`
    INSERT INTO dossiers (id, data, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `),
};

export const allDossiers = () => parseRows<DossierPsychiatrique>(q.all.all());
export function getDossier(id: string): DossierPsychiatrique | undefined {
  const row = q.byId.get(id) as { data: string } | undefined;
  return row ? (JSON.parse(row.data) as DossierPsychiatrique) : undefined;
}
export function saveDossier(d: DossierPsychiatrique) {
  q.upsert.run(d.id, JSON.stringify(d), d.dateDerniereModification);
}

const RUBRIQUE_IDS = Object.keys(SECTION_KEYS) as RubriqueId[];
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const rubLabel = (id: string) => {
  const r = RUBRIQUES_CONFIG.find((x) => x.id === id);
  return r ? `${r.code} : ${r.titre}` : id;
};
const isLocked = (s: DossierStatus) => s === 'VALIDÉ' || s === 'ARCHIVÉ';

/** Replaces the sections a role may not see with blanks (BR-016). */
export function redactForRole(d: DossierPsychiatrique, user: SessionUser): DossierPsychiatrique {
  const blank = createEmptyDossier({
    id: d.id,
    numeroOrdre: d.s1Identification.numeroOrdre,
    now: d.dateCreation,
    sexe: d.s1Identification.sexe,
  });
  const out = { ...d } as Record<string, unknown>;
  let hidden = false;
  for (const id of RUBRIQUE_IDS) {
    if (getRubriquePermission(user.role, id) === 'none') {
      const key = SECTION_KEYS[id];
      out[key] = (blank as unknown as Record<string, unknown>)[key];
      hidden = true;
    }
  }
  if (hidden) {
    out.addenda = d.addenda.filter((a) => getRubriquePermission(user.role, a.rubriqueId) !== 'none');
  }
  return out as unknown as DossierPsychiatrique;
}

function nextNumeroOrdre(now: Date): string {
  const prefix = `PSY-${now.getFullYear()}-`;
  let max = 0;
  for (const d of allDossiers()) {
    const n = d.s1Identification?.numeroOrdre ?? '';
    if (n.startsWith(prefix)) max = Math.max(max, Number(n.slice(prefix.length)) || 0);
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

/** Always strictly after the previous version, so it can serve as an optimistic-lock token. */
function nextVersion(previous?: string): string {
  const now = Date.now();
  const prev = previous ? Date.parse(previous) : 0;
  return new Date(Math.max(now, prev + 1)).toISOString();
}

/** Refusal: the route writes the ACCES_REFUSE audit entry after the transaction is rolled back. */
function deny(_user: SessionUser, d: { id: string; numero: string }, message: string, rubriqueId?: string): never {
  throw new HttpError(403, message, {
    denied: {
      dossierId: d.id,
      numeroOrdre: d.numero,
      rubriqueId,
      rubriqueNom: rubriqueId ? rubLabel(rubriqueId) : undefined,
      details: `Modification refusée : ${message}`,
    },
  });
}

// ── Section rules ───────────────────────────────────────────

function validateS1(s1: DossierPsychiatrique['s1Identification']) {
  if (!s1.nom?.trim()) throw new HttpError(400, 'S1 : le nom est obligatoire.');
  if (!s1.prenoms?.trim()) throw new HttpError(400, 'S1 : les prénoms sont obligatoires.');
  if (!(Number(s1.age) > 0)) throw new HttpError(400, 'S1 : l’âge est obligatoire.');
  if (s1.sexe !== 'Masculin' && s1.sexe !== 'Féminin') throw new HttpError(400, 'S1 : sexe invalide.');
}

function validateS2(s2: DossierPsychiatrique['s2Modalites']) {
  if (!s2.modalite) throw new HttpError(400, 'S2 : la modalité de consultation est obligatoire (BR-004).');
  if (s2.modalite === 'Soins sans consentement' && !s2.soinsSansConsentementType) {
    throw new HttpError(400, 'S2 : le sous-type des soins sans consentement est obligatoire (BR-005).');
  }
}

/**
 * Checks a changed section and returns the value to store
 * (server-stamped where the client must not choose, e.g. journal authors).
 */
function checkSection(
  id: RubriqueId,
  before: any,
  after: any,
  user: SessionUser,
  ref: { id: string; numero: string },
  now: string
): any {
  switch (id) {
    case 's1':
      if (after.numeroOrdre !== before.numeroOrdre) {
        throw new HttpError(400, 'Le numéro d’ordre est définitif et ne peut pas être modifié (BR-001).');
      }
      validateS1(after);
      return after;

    case 's2':
      validateS2(after);
      return after;

    case 's10': {
      if (!same(before.somatique, after.somatique) && !['PSYCHIATRE', 'INFIRMIER'].includes(user.role)) {
        deny(user, ref, 'l’examen somatique est réservé au psychiatre et à l’infirmier.', 's10');
      }
      if (!same(before.psychiatrique, after.psychiatrique) && !['PSYCHIATRE', 'PSYCHOLOGUE'].includes(user.role)) {
        deny(user, ref, 'l’examen psychiatrique est réservé au psychiatre et au psychologue.', 's10');
      }
      const sat = after.somatique?.constantes?.saturationO2;
      if (sat !== undefined && sat !== null && (Number(sat) > 100 || Number(sat) < 0)) {
        throw new HttpError(400, 'S10 : la saturation (SpO2) doit être comprise entre 0 et 100 %.');
      }
      return after;
    }

    case 's12': {
      const principales = (after.hypotheses ?? []).filter((h: { type: string }) => h.type === 'Principale').length;
      if (principales > 1) throw new HttpError(400, 'S12 : une seule hypothèse peut être « Principale ».');
      return after;
    }

    case 's14': {
      const medsOrOrientation =
        !same(before.traitementMedicamenteux, after.traitementMedicamenteux) ||
        before.orientation !== after.orientation ||
        !same(before.hospitalisationDetails, after.hospitalisationDetails);
      if (medsOrOrientation && user.role !== 'PSYCHIATRE') {
        deny(user, ref, 'l’orientation et le traitement médicamenteux sont réservés au psychiatre (BR-014).', 's14');
      }
      return after;
    }

    case 's15': {
      // BR-015: append-only journal. Existing entries are immutable; new ones are stamped by the server.
      const incoming: any[] = after.entrees ?? [];
      const byId = new Map(incoming.map((e) => [e.id, e]));
      for (const old of before.entrees ?? []) {
        const e = byId.get(old.id);
        if (!e || !same(e, old)) {
          deny(user, ref, 'le journal d’évolution est inaltérable : ajoutez une entrée rectificative (BR-015).', 's15');
        }
      }
      const known = new Set((before.entrees ?? []).map((e: { id: string }) => e.id));
      const entrees = incoming.map((e) =>
        known.has(e.id)
          ? e
          : { ...e, note: String(e.note ?? ''), dateHeure: now, auteurNom: user.name, auteurRole: user.role }
      );
      return { ...after, entrees };
    }

    case 's16': {
      // Versioned project (F-19): archived versions are immutable.
      const incoming: any[] = after.historiqueVersions ?? [];
      for (const old of before.historiqueVersions ?? []) {
        const v = incoming.find((x) => x.version === old.version);
        if (!v || !same(v, old)) {
          deny(user, ref, 'les versions archivées du projet thérapeutique ne peuvent pas être modifiées.', 's16');
        }
      }
      return after;
    }

    default:
      return after;
  }
}

// ── Writes ──────────────────────────────────────────────────

export interface WriteResult {
  dossier: DossierPsychiatrique;
  audit: ReturnType<typeof writeAudit>[];
}

export function createDossier(incoming: DossierPsychiatrique, user: SessionUser): WriteResult {
  if (!ROLES_CAN_CREATE_DOSSIER.includes(user.role)) {
    deny(user, { id: incoming.id, numero: '—' }, 'votre rôle ne permet pas de créer un dossier.');
  }
  if (typeof incoming.id !== 'string' || !/^[\w-]{3,80}$/.test(incoming.id)) {
    throw new HttpError(400, 'Identifiant de dossier invalide.');
  }
  validateS1(incoming.s1Identification);
  validateS2(incoming.s2Modalites);

  const now = new Date();
  const nowIso = now.toISOString();
  const d = createEmptyDossier({
    id: incoming.id,
    numeroOrdre: nextNumeroOrdre(now), // BR-001: assigned by the server, unique
    now: nowIso,
    sexe: incoming.s1Identification.sexe,
    psychiatreReferent: String(incoming.psychiatreReferent ?? '').slice(0, 200),
    intervenant: user.name,
  });
  d.serviceHospitalier = String(incoming.serviceHospitalier ?? d.serviceHospitalier).slice(0, 200);
  d.s1Identification = { ...incoming.s1Identification, numeroOrdre: d.s1Identification.numeroOrdre };
  d.s2Modalites = incoming.s2Modalites; // BR-004: required at creation for every creator role
  if (getRubriquePermission(user.role, 's3') === 'write' && incoming.s3Motif?.plaintePrincipale?.trim()) {
    d.s3Motif = incoming.s3Motif;
  }
  d.statut = d.s3Motif.plaintePrincipale.trim() ? 'EN_COURS' : 'BROUILLON';

  saveDossier(d);
  const ref = { dossierId: d.id, numeroOrdre: d.s1Identification.numeroOrdre };
  const audit = [
    writeAudit(user, 'CREATION', {
      ...ref,
      rubriqueId: 's1',
      rubriqueNom: rubLabel('s1'),
      details: `Création du dossier de ${d.s1Identification.nom} ${d.s1Identification.prenoms} (statut ${d.statut}).`,
      changes: diffFields({}, { s1: d.s1Identification, s2: d.s2Modalites, s3: d.s3Motif.plaintePrincipale || undefined }),
    }),
  ];
  return { dossier: redactForRole(d, user), audit };
}

export function updateDossier(
  stored: DossierPsychiatrique,
  incoming: DossierPsychiatrique,
  user: SessionUser,
  baseVersion: string | undefined
): WriteResult {
  const ref = { id: stored.id, numero: stored.s1Identification.numeroOrdre };
  const auditRef = { dossierId: stored.id, numeroOrdre: ref.numero };

  // B4: concurrent edits — the client must have seen the latest version.
  if (baseVersion !== stored.dateDerniereModification) {
    throw new HttpError(409, 'Ce dossier a été modifié entre-temps par un autre utilisateur.', {
      current: redactForRole(stored, user),
    });
  }

  const now = new Date().toISOString();
  const next: any = structuredClone(stored);
  const sectionChanges: { id: RubriqueId; before: unknown; after: unknown }[] = [];

  for (const id of RUBRIQUE_IDS) {
    const key = SECTION_KEYS[id];
    const before = (stored as any)[key];
    const after = (incoming as any)[key];
    if (after === undefined || same(before, after)) continue;
    const perm = getRubriquePermission(user.role, id);
    if (perm === 'none') continue; // section was redacted for this role; keep the stored value
    if (perm === 'read') deny(user, ref, `la rubrique ${rubLabel(id)} est en lecture seule pour votre rôle.`, id);
    if (isLocked(stored.statut)) {
      deny(user, ref, 'le dossier est verrouillé ; toute correction passe par un addendum (BR-013).', id);
    }
    next[key] = checkSection(id, before, after, user, ref, now);
    sectionChanges.push({ id, before, after: next[key] });
  }

  // Dossier-level fields
  if (incoming.psychiatreReferent !== undefined && incoming.psychiatreReferent !== stored.psychiatreReferent) {
    if (user.role !== 'PSYCHIATRE' || isLocked(stored.statut)) {
      deny(user, ref, 'seul un psychiatre peut changer le psychiatre référent d’un dossier actif.');
    }
    next.psychiatreReferent = String(incoming.psychiatreReferent).slice(0, 200);
  }

  // Addenda: append-only, only on a validated dossier (BR-013)
  const storedIds = new Set(stored.addenda.map((a) => a.id));
  for (const a of incoming.addenda ?? []) {
    const old = stored.addenda.find((x) => x.id === a.id);
    if (old && !same(old, a)) deny(user, ref, 'un addendum consigné ne peut pas être modifié.');
  }
  const newAddenda = (incoming.addenda ?? []).filter((a) => !storedIds.has(a.id));
  const audit: WriteResult['audit'] = [];
  if (newAddenda.length) {
    if (stored.statut !== 'VALIDÉ') throw new HttpError(400, 'Les addenda ne concernent que les dossiers validés.');
    const stamped = newAddenda.map((a) => {
      if (getRubriquePermission(user.role, a.rubriqueId) !== 'write') {
        deny(user, ref, `vous n’êtes pas autorisé à annoter la rubrique ${rubLabel(a.rubriqueId)}.`, a.rubriqueId);
      }
      if (!String(a.contenu ?? '').trim()) throw new HttpError(400, 'Le contenu de l’addendum est vide.');
      return {
        ...a,
        contenu: String(a.contenu),
        rubriqueNom: rubLabel(a.rubriqueId),
        dateHeure: now,
        auteurNom: user.name,
        auteurRole: user.role,
      };
    });
    next.addenda = [...stamped, ...stored.addenda];
    for (const a of stamped) {
      audit.push(
        writeAudit(user, 'ADDENDUM', {
          ...auditRef,
          rubriqueId: a.rubriqueId,
          rubriqueNom: a.rubriqueNom,
          details: `Addendum consigné : « ${a.contenu.slice(0, 120)}${a.contenu.length > 120 ? '…' : ''} »`,
          changes: [{ champ: 'addendum', avant: '', apres: a.contenu.slice(0, 300) }],
        })
      );
    }
  }

  for (const c of sectionChanges) {
    audit.push(
      writeAudit(user, 'MODIFICATION', {
        ...auditRef,
        rubriqueId: c.id,
        rubriqueNom: rubLabel(c.id),
        details: `Mise à jour de la rubrique ${rubLabel(c.id)}.`,
        changes: diffFields(c.before, c.after),
      })
    );
  }

  // Lifecycle (B3)
  const from = stored.statut;
  let to: DossierStatus = incoming.statut ?? from;
  if (from === 'BROUILLON' && to === 'BROUILLON' && next.s2Modalites?.modalite && next.s3Motif?.plaintePrincipale?.trim()) {
    to = 'EN_COURS'; // automatic once S1, S2 and S3 are present
  }
  if (to !== from) {
    const t = `${from}→${to}`;
    if (t === 'BROUILLON→EN_COURS') {
      if (!next.s2Modalites?.modalite || !next.s3Motif?.plaintePrincipale?.trim()) {
        throw new HttpError(400, 'Passage EN_COURS impossible : S2 et S3 doivent être renseignées.');
      }
    } else if (t === 'EN_COURS→VALIDÉ') {
      if (user.role !== 'PSYCHIATRE') deny(user, ref, 'seul un psychiatre peut valider un dossier.');
      const check = checkDossierValidationPreconditions(next);
      if (!check.canValidate) {
        throw new HttpError(400, 'Validation impossible : rubriques manquantes.', { missing: check.missingRequirements });
      }
      next.validationInfo = {
        dateHeure: now,
        valideParNom: user.name,
        valideParRole: user.role,
        signataire: String(incoming.validationInfo?.signataire || user.name).slice(0, 200),
      };
      audit.push(
        writeAudit(user, 'VALIDATION', {
          ...auditRef,
          details: `Validation et verrouillage du dossier. Signataire : ${next.validationInfo.signataire}.`,
        })
      );
    } else if (t === 'VALIDÉ→ARCHIVÉ') {
      if (user.role !== 'ADMIN' && user.role !== 'PSYCHIATRE') deny(user, ref, 'archivage réservé à l’administrateur ou au psychiatre.');
      const motif = String(incoming.archivageInfo?.motif ?? '').trim();
      if (!motif) throw new HttpError(400, 'Le motif d’archivage est obligatoire.');
      next.archivageInfo = { dateHeure: now, archiveParNom: `${user.name} (${user.role})`, motif: motif.slice(0, 1000) };
      audit.push(writeAudit(user, 'ARCHIVAGE', { ...auditRef, details: `Archivage du dossier. Motif : ${motif}` }));
    } else if (t === 'ARCHIVÉ→EN_COURS') {
      if (user.role !== 'PSYCHIATRE') deny(user, ref, 'seul un psychiatre peut réactiver un dossier archivé.');
      const motif = String(incoming.derniereReactivation?.motif ?? '').trim();
      if (!motif) throw new HttpError(400, 'Le motif de réactivation est obligatoire.');
      next.derniereReactivation = { dateHeure: now, parNom: user.name, motif: motif.slice(0, 1000) };
      audit.push(writeAudit(user, 'REACTIVATION', { ...auditRef, details: `Réactivation du dossier. Motif : ${motif}` }));
    } else {
      throw new HttpError(400, `Transition de statut invalide : ${from} → ${to}.`);
    }
    next.statut = to;
  }

  next.dateDerniereModification = nextVersion(stored.dateDerniereModification);
  saveDossier(next);
  return { dossier: redactForRole(next, user), audit };
}

export function newDossierId() {
  return `dossier-${crypto.randomUUID()}`;
}
