/**
 * PsyDossier local server.
 *
 * Serves the built frontend and persists data in a single SQLite file
 * (Node's built-in `node:sqlite`, no native module to install).
 *
 * Environment:
 *   PORT                     HTTP port (default 3210), bound to 127.0.0.1 only
 *   PSYDOSSIER_DATA          data directory (default ./data)
 *   PSYDOSSIER_DIST          built frontend directory (default ./dist)
 *   PSYDOSSIER_OPEN_BROWSER  "1" to open the default browser once ready
 */
import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { exec } from 'node:child_process';

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT) || 3210;
const DATA_DIR = path.resolve(process.env.PSYDOSSIER_DATA || 'data');
const DIST_DIR = path.resolve(process.env.PSYDOSSIER_DIST || 'dist');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const DB_FILE = path.join(DATA_DIR, 'psydossier.db');
const BACKUPS_TO_KEEP = 30;
const APP_URL = `http://${HOST}:${PORT}`;

// ── Database ────────────────────────────────────────────────
fs.mkdirSync(BACKUP_DIR, { recursive: true });

const db = new DatabaseSync(DB_FILE);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = FULL;

  CREATE TABLE IF NOT EXISTS dossiers (
    id         TEXT PRIMARY KEY,
    data       TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id        TEXT PRIMARY KEY,
    data      TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

const stmt = {
  allDossiers: db.prepare('SELECT data FROM dossiers ORDER BY updated_at DESC'),
  upsertDossier: db.prepare(`
    INSERT INTO dossiers (id, data, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `),
  allAuditLogs: db.prepare('SELECT data FROM audit_logs ORDER BY timestamp DESC'),
  upsertAuditLog: db.prepare(`
    INSERT INTO audit_logs (id, data, timestamp) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data
  `),
  getSetting: db.prepare('SELECT value FROM settings WHERE key = ?'),
  setSetting: db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `),
};

const parseRows = (rows: unknown[]) => rows.map((r) => JSON.parse((r as { data: string }).data));

// ── Backups: one snapshot per day, keep the most recent ones ──
function runDailyBackup() {
  const day = new Date().toISOString().slice(0, 10);
  const target = path.join(BACKUP_DIR, `psydossier-${day}.db`);
  if (fs.existsSync(target)) return;
  try {
    db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
    const old = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => /^psydossier-\d{4}-\d{2}-\d{2}\.db$/.test(f))
      .sort()
      .reverse()
      .slice(BACKUPS_TO_KEEP);
    old.forEach((f) => fs.rmSync(path.join(BACKUP_DIR, f)));
    console.log(`[backup] ${target}`);
  } catch (err) {
    console.error('[backup] échec :', err);
  }
}

// ── HTTP ────────────────────────────────────────────────────
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '25mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, app: 'psydossier' });
});

app.get('/api/state', (_req, res) => {
  const ref = stmt.getSetting.get('referentiels') as { value: string } | undefined;
  res.json({
    dossiers: parseRows(stmt.allDossiers.all()),
    auditLogs: parseRows(stmt.allAuditLogs.all()),
    referenceLists: ref ? JSON.parse(ref.value) : null,
  });
});

app.put('/api/dossiers/:id', (req, res) => {
  const dossier = req.body;
  if (!dossier || dossier.id !== req.params.id) {
    res.status(400).json({ error: 'Identifiant de dossier incohérent' });
    return;
  }
  const updatedAt = dossier.dateDerniereModification || new Date().toISOString();
  stmt.upsertDossier.run(dossier.id, JSON.stringify(dossier), updatedAt);
  res.json({ ok: true });
});

app.put('/api/audit-logs/:id', (req, res) => {
  const entry = req.body;
  if (!entry || entry.id !== req.params.id) {
    res.status(400).json({ error: "Identifiant d'audit incohérent" });
    return;
  }
  stmt.upsertAuditLog.run(entry.id, JSON.stringify(entry), entry.timestamp || new Date().toISOString());
  res.json({ ok: true });
});

app.put('/api/referentiels', (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({ error: 'Référentiels invalides' });
    return;
  }
  stmt.setSetting.run('referentiels', JSON.stringify(req.body));
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
  setInterval(runDailyBackup, 60 * 60 * 1000);
  console.log('');
  console.log('  PsyDossier est prêt');
  console.log(`  Adresse : ${APP_URL}`);
  console.log(`  Données : ${DB_FILE}`);
  console.log('');
  console.log('  Laissez cette fenêtre ouverte pendant l’utilisation.');
  openBrowser();
});
server.on('error', handleListenError);

function shutdown() {
  server.close();
  try {
    db.close();
  } catch {
    // already closed
  }
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
