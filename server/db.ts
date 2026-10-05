import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

export const DATA_DIR = path.resolve(process.env.PSYDOSSIER_DATA || 'data');
export const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const DB_FILE = path.join(DATA_DIR, 'psydossier.db');
const BACKUPS_TO_KEEP = 30;

// OneDrive syncing the live database files (.db, -wal, -shm) can lock or corrupt them.
function isInOneDrive(dir: string): boolean {
  const norm = (p: string) => {
    const full = path.resolve(p) + path.sep;
    return process.platform === 'win32' ? full.toLowerCase() : full;
  };
  const roots = [process.env.OneDrive, process.env.OneDriveConsumer, process.env.OneDriveCommercial];
  if (roots.some((r) => r && norm(dir).startsWith(norm(r)))) return true;
  return dir.split(/[\\/]/).some((part) => /^onedrive( - .+)?$/i.test(part));
}
export const DATA_IN_ONEDRIVE = isInOneDrive(DATA_DIR);

fs.mkdirSync(BACKUP_DIR, { recursive: true });

export const db = new DatabaseSync(DB_FILE);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = FULL;
  PRAGMA foreign_keys = ON;

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

  CREATE TABLE IF NOT EXISTS users (
    id               TEXT PRIMARY KEY,
    login            TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name             TEXT NOT NULL,
    role             TEXT NOT NULL,
    title            TEXT NOT NULL DEFAULT '',
    service          TEXT NOT NULL DEFAULT '',
    active           INTEGER NOT NULL DEFAULT 1,
    password_hash    TEXT,
    setup_code_hash  TEXT,
    setup_expires_at TEXT,
    created_at       TEXT NOT NULL,
    last_login_at    TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    last_seen  TEXT NOT NULL
  );

  -- PRD F-01: the audit journal can be neither modified nor deleted.
  CREATE TRIGGER IF NOT EXISTS audit_logs_no_update
    BEFORE UPDATE ON audit_logs
    BEGIN SELECT RAISE(ABORT, 'Journal d''audit inaltérable'); END;

  CREATE TRIGGER IF NOT EXISTS audit_logs_no_delete
    BEFORE DELETE ON audit_logs
    BEGIN SELECT RAISE(ABORT, 'Journal d''audit inaltérable'); END;

  -- PRD F-00: accounts are deactivated, never deleted.
  CREATE TRIGGER IF NOT EXISTS users_no_delete
    BEFORE DELETE ON users
    BEGIN SELECT RAISE(ABORT, 'Les comptes ne peuvent pas être supprimés'); END;
`);

export const parseRows = <T>(rows: unknown[]): T[] =>
  rows.map((r) => JSON.parse((r as { data: string }).data) as T);

/** Runs fn inside a transaction; rolls back on throw. */
export function transaction<T>(fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

// ── Backups: one snapshot per day, keep the most recent ones ──
export function runDailyBackup() {
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
