import crypto from 'node:crypto';
import { AuditAction, AuditEntry, AuditFieldChange, UserRole } from '../src/types';
import { db, parseRows } from './db';

export interface Actor {
  id: string;
  name: string;
  role: UserRole;
}

const insertStmt = db.prepare('INSERT INTO audit_logs (id, data, timestamp) VALUES (?, ?, ?)');
const listStmt = db.prepare('SELECT data FROM audit_logs ORDER BY timestamp DESC');

/** Builds an entry stamped by the server (id, time, author) and inserts it. Never updates. */
export function writeAudit(
  actor: Actor,
  action: AuditAction,
  fields: {
    dossierId?: string;
    numeroOrdre?: string;
    details: string;
    rubriqueId?: string;
    rubriqueNom?: string;
    changes?: AuditFieldChange[];
  }
): AuditEntry {
  const entry: AuditEntry = {
    id: `log-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    timestamp: new Date().toISOString(),
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    patientId: fields.dossierId ?? '',
    patientNumeroOrdre: fields.numeroOrdre ?? '—',
    dossierId: fields.dossierId ?? '',
    action,
    rubriqueId: fields.rubriqueId,
    rubriqueNom: fields.rubriqueNom,
    details: fields.details,
    changes: fields.changes?.length ? fields.changes : undefined,
  };
  insertStmt.run(entry.id, JSON.stringify(entry), entry.timestamp);
  return entry;
}

/** Inserts a pre-built entry as-is (demo seed only). */
export function importAudit(entry: AuditEntry) {
  insertStmt.run(entry.id, JSON.stringify(entry), entry.timestamp);
}

export function listAudit(): AuditEntry[] {
  return parseRows<AuditEntry>(listStmt.all());
}

// ── Field-level diff (BR-012) ──────────────────────────────

const MAX_VALUE = 300;
const MAX_CHANGES = 60;

function flatten(value: unknown, prefix: string, out: Map<string, string>) {
  if (value === null || value === undefined || value === '') {
    if (prefix) out.set(prefix, '');
    return;
  }
  if (Array.isArray(value)) {
    if (value.length === 0 && prefix) out.set(prefix, '');
    value.forEach((v, i) => {
      const key = v && typeof v === 'object' && 'id' in v ? String((v as { id: unknown }).id) : String(i);
      flatten(v, prefix ? `${prefix}[${key}]` : `[${key}]`, out);
    });
    return;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0 && prefix) out.set(prefix, '');
    for (const [k, v] of entries) flatten(v, prefix ? `${prefix}.${k}` : k, out);
    return;
  }
  out.set(prefix, String(value));
}

const clip = (s: string) => (s.length > MAX_VALUE ? `${s.slice(0, MAX_VALUE)}…` : s);

/** Lists changed leaf fields between two versions of a section. */
export function diffFields(before: unknown, after: unknown): AuditFieldChange[] {
  const a = new Map<string, string>();
  const b = new Map<string, string>();
  flatten(before, '', a);
  flatten(after, '', b);
  const keys = new Set([...a.keys(), ...b.keys()]);
  const changes: AuditFieldChange[] = [];
  for (const k of keys) {
    const av = a.get(k) ?? '';
    const bv = b.get(k) ?? '';
    if (av !== bv) changes.push({ champ: k, avant: clip(av), apres: clip(bv) });
  }
  changes.sort((x, y) => x.champ.localeCompare(y.champ));
  if (changes.length > MAX_CHANGES) {
    const rest = changes.length - MAX_CHANGES;
    return [...changes.slice(0, MAX_CHANGES), { champ: `(+${rest} autres champs)`, avant: '', apres: '' }];
  }
  return changes;
}
