/**
 * PsyDossier local server.
 *
 * Serves the built frontend, persists data in a single SQLite file (Node's built-in
 * `node:sqlite`, no native module to install) and is the sole authority on access:
 * authentication, role permissions, dossier lifecycle and the audit journal.
 *
 * Environment:
 *   PORT                     HTTP port (default 3210), bound to 127.0.0.1 only
 *   PSYDOSSIER_DATA          data directory (default ./data)
 *   PSYDOSSIER_DIST          built frontend directory (default ./dist)
 *   PSYDOSSIER_OPEN_BROWSER  "1" to open the default browser once ready
 *   PSYDOSSIER_DEMO          "1" to seed demo accounts and patients (development)
 */
import express, { type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { exec } from 'node:child_process';
import { DossierPsychiatrique, ReferenceLists } from '../src/types';
import { ROLES_CAN_EXPORT, ROLES_CAN_READ_AUDIT } from '../src/utils/emptyDossier';
import { getRubriquePermission } from '../src/utils/rules';
import { DATA_DIR, db, runDailyBackup, transaction } from './db';
import { listAudit, writeAudit } from './audit';
import { currentUser, purgeExpiredSessions, registerAuthRoutes, requireAuth, requireRole } from './auth';
import { allDossiers, createDossier, getDossier, HttpError, redactForRole, updateDossier } from './dossiers';
import { seedDemo } from './seed';

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT) || 3210;
const DIST_DIR = path.resolve(process.env.PSYDOSSIER_DIST || 'dist');
const APP_URL = `http://${HOST}:${PORT}`;

if (process.env.PSYDOSSIER_DEMO === '1') seedDemo();

const settings = {
  get: db.prepare('SELECT value FROM settings WHERE key = ?'),
  set: db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `),
};
/** Values referenced by at least one dossier, per list (F-24: these can only be deactivated). */
function referentielsUsage() {
  const dossiers = allDossiers();
  const uniq = (xs: (string | undefined)[]) => [...new Set(xs.filter((x): x is string => Boolean(x)))];
  return {
    religions: uniq(dossiers.map((d) => d.s1Identification.religion)),
    ethnies: uniq(dossiers.map((d) => d.s1Identification.ethnie)),
    situationsMatrimoniales: uniq(dossiers.map((d) => d.s1Identification.situationMatrimoniale)),
    typesBilans: uniq(dossiers.flatMap((d) => d.s13Bilans.bilans.map((b) => b.type))),
    syndromesFrequents: uniq(dossiers.flatMap((d) => d.s11ResumeSyndromique.syndromesIdentifies ?? [])),
    diagnosticClassifications: uniq(dossiers.flatMap((d) => d.s12HypothesesDiag.hypotheses.map((h) => h.codeCimDsm))),
  };
}

const readReferentiels = (): ReferenceLists | null => {
  const row = settings.get.get('referentiels') as { value: string } | undefined;
  return row ? JSON.parse(row.value) : null;
};

function sendError(res: Response, err: unknown) {
  if (err instanceof HttpError) {
    const { denied, ...extra } = err.extra as { denied?: Parameters<typeof writeAudit>[2] };
    if (denied) writeAudit(currentUser(res), 'ACCES_REFUSE', denied);
    res.status(err.status).json({ error: err.message, ...extra });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
}

// ── HTTP ────────────────────────────────────────────────────
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '25mb' }));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});
// No caching of API responses (health data).
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, app: 'psydossier' });
});

registerAuthRoutes(app);

app.get('/api/state', requireAuth, (_req, res) => {
  const user = currentUser(res);
  res.json({
    dossiers: allDossiers().map((d) => redactForRole(d, user)),
    auditLogs: ROLES_CAN_READ_AUDIT.includes(user.role) ? listAudit() : [],
    referenceLists: readReferentiels(),
    referentielsUsage: user.role === 'ADMIN' ? referentielsUsage() : undefined,
  });
});

app.put('/api/dossiers/:id', requireAuth, (req, res) => {
  const user = currentUser(res);
  const incoming = req.body as DossierPsychiatrique;
  if (!incoming || incoming.id !== req.params.id) {
    res.status(400).json({ error: 'Identifiant de dossier incohérent.' });
    return;
  }
  const baseVersion = req.header('x-base-version') || undefined;
  try {
    const result = transaction(() => {
      const stored = getDossier(incoming.id);
      return stored ? updateDossier(stored, incoming, user, baseVersion) : createDossier(incoming, user);
    });
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
});

// Client-reported events. Everything else is audited by the server itself.
app.post('/api/audit', requireAuth, (req, res) => {
  const user = currentUser(res);
  const { action, dossierId } = req.body ?? {};
  const dossier = typeof dossierId === 'string' ? getDossier(dossierId) : undefined;
  if (!dossier || (action !== 'LECTURE' && action !== 'EXPORT')) {
    res.status(400).json({ error: 'Événement d’audit invalide.' });
    return;
  }
  const ref = { dossierId: dossier.id, numeroOrdre: dossier.s1Identification.numeroOrdre };
  if (action === 'EXPORT') {
    if (!ROLES_CAN_EXPORT.includes(user.role)) {
      writeAudit(user, 'ACCES_REFUSE', { ...ref, details: 'Export refusé : réservé aux rôles cliniques (F-22).' });
      res.status(403).json({ error: 'L’export est réservé aux rôles cliniques.' });
      return;
    }
    const rubriques: string[] = Array.isArray(req.body.rubriques) ? req.body.rubriques.map(String) : [];
    const visible = rubriques.filter((r) => getRubriquePermission(user.role, r) !== 'none');
    const entry = writeAudit(user, 'EXPORT', {
      ...ref,
      details: `Export / impression du dossier (${visible.length} rubrique${visible.length > 1 ? 's' : ''} : ${visible.join(', ').toUpperCase()}).`,
    });
    res.json({ entry });
    return;
  }
  const entry = writeAudit(user, 'LECTURE', {
    ...ref,
    details: `Consultation du dossier patient par ${user.name} (${user.role}).`,
  });
  res.json({ entry });
});

// F-24: lists are administered by ADMIN; a value used in a dossier can only be deactivated.
app.put('/api/referentiels', requireAuth, requireRole('ADMIN'), (req, res) => {
  const user = currentUser(res);
  const next = req.body as ReferenceLists;
  if (!next || typeof next !== 'object' || !Array.isArray(next.religions)) {
    res.status(400).json({ error: 'Référentiels invalides.' });
    return;
  }
  const prev = readReferentiels();
  if (prev) {
    const used = referentielsUsage();
    for (const cat of Object.keys(used) as (keyof typeof used)[]) {
      const before = (prev[cat] as unknown[] | undefined) ?? [];
      const after = (next[cat] as unknown[] | undefined) ?? [];
      const keyOf = (v: unknown) => (typeof v === 'string' ? v : (v as { code: string }).code);
      const afterKeys = new Set(after.map(keyOf));
      const removedInUse = before.map(keyOf).filter((v) => !afterKeys.has(v) && used[cat].includes(v));
      if (removedInUse.length) {
        res.status(409).json({
          error: `Valeur utilisée dans des dossiers : « ${removedInUse.join(', ')} ». Désactivez-la au lieu de la supprimer.`,
        });
        return;
      }
    }
  }
  settings.set.run('referentiels', JSON.stringify(next));
  writeAudit(user, 'MODIFICATION', { details: 'Mise à jour des listes de valeurs (référentiels).' });
  res.json({ ok: true });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Route inconnue' });
});

if (fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  app.use(express.static(DIST_DIR, { index: false }));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

function openBrowser() {
  if (process.env.PSYDOSSIER_OPEN_BROWSER !== '1') return;
  const cmd =
    process.platform === 'win32'
      ? `start "" "${APP_URL}"`
      : process.platform === 'darwin'
      ? `open "${APP_URL}"`
      : `xdg-open "${APP_URL}"`;
  exec(cmd);
}

// If the port is taken by an already running PsyDossier, just open it.
function handleListenError(err: NodeJS.ErrnoException) {
  if (err.code !== 'EADDRINUSE') throw err;
  http
    .get(`${APP_URL}/api/health`, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        if (body.includes('psydossier')) {
          console.log('PsyDossier est déjà lancé. Ouverture du navigateur…');
          openBrowser();
          setTimeout(() => process.exit(0), 1500);
        } else {
          console.error(`Le port ${PORT} est utilisé par une autre application.`);
          process.exit(1);
        }
      });
    })
    .on('error', () => {
      console.error(`Le port ${PORT} est indisponible.`);
      process.exit(1);
    });
}

const server = app.listen(PORT, HOST, () => {
  runDailyBackup();
  purgeExpiredSessions();
  setInterval(() => {
    runDailyBackup();
    purgeExpiredSessions();
  }, 60 * 60 * 1000);
  console.log('');
  console.log('  PsyDossier est prêt');
  console.log(`  Adresse : ${APP_URL}`);
  console.log(`  Données : ${DATA_DIR}`);
  console.log('');
  console.log('  Laissez cette fenêtre ouverte pendant l’utilisation.');
  openBrowser();
});
server.on('error', handleListenError);
