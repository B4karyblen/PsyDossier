/**
 * Accounts, sessions and access control (PRD F-00).
 *
 * - Passwords: scrypt with per-user salt.
 * - Sessions: random token in an HttpOnly, SameSite=Strict cookie; only its SHA-256 is stored.
 *   Idle timeout 30 min, absolute lifetime 12 h.
 * - Accounts are created by an ADMIN; the user sets their own password with a one-time
 *   activation code. Accounts are deactivated, never deleted.
 */
import crypto from 'node:crypto';
import type { Express, NextFunction, Request, Response } from 'express';
import { UserAccount, UserRole } from '../src/types';
import { db, transaction } from './db';
import { Actor, writeAudit } from './audit';

const COOKIE = 'psyd_session';
const IDLE_MS = 30 * 60 * 1000;
const ABSOLUTE_MS = 12 * 60 * 60 * 1000;
const SETUP_CODE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_PASSWORD = 8;
const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;

export const ROLES: UserRole[] = [
  'ADMIN',
  'PSYCHIATRE',
  'PSYCHOLOGUE',
  'INFIRMIER',
  'ASSISTANT_SOCIAL',
  'SECRETARIAT',
  'LECTEUR',
];

export interface SessionUser extends Actor {
  login: string;
  title: string;
  service: string;
}

interface UserRow {
  id: string;
  login: string;
  name: string;
  role: UserRole;
  title: string;
  service: string;
  active: number;
  password_hash: string | null;
  setup_code_hash: string | null;
  setup_expires_at: string | null;
  created_at: string;
  last_login_at: string | null;
}

const q = {
  countUsers: db.prepare('SELECT COUNT(*) AS n FROM users'),
  userById: db.prepare('SELECT * FROM users WHERE id = ?'),
  userByLogin: db.prepare('SELECT * FROM users WHERE login = ? COLLATE NOCASE'),
  allUsers: db.prepare('SELECT * FROM users ORDER BY active DESC, name'),
  activeAdmins: db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'ADMIN' AND active = 1"),
  insertUser: db.prepare(`
    INSERT INTO users (id, login, name, role, title, service, active, password_hash, setup_code_hash, setup_expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
  `),
  updateProfile: db.prepare('UPDATE users SET name = ?, role = ?, title = ?, service = ?, active = ? WHERE id = ?'),
  setPassword: db.prepare(
    'UPDATE users SET password_hash = ?, setup_code_hash = NULL, setup_expires_at = NULL WHERE id = ?'
  ),
  setSetupCode: db.prepare(
    'UPDATE users SET password_hash = NULL, setup_code_hash = ?, setup_expires_at = ? WHERE id = ?'
  ),
  touchLogin: db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?'),
  insertSession: db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, last_seen) VALUES (?, ?, ?, ?)'),
  sessionByHash: db.prepare('SELECT * FROM sessions WHERE token_hash = ?'),
  touchSession: db.prepare('UPDATE sessions SET last_seen = ? WHERE token_hash = ?'),
  deleteSession: db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
  deleteUserSessions: db.prepare('DELETE FROM sessions WHERE user_id = ?'),
  purgeSessions: db.prepare('DELETE FROM sessions WHERE last_seen < ? OR created_at < ?'),
};

// ── Helpers ─────────────────────────────────────────────────

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString('base64')}$${hash.toString('base64')}`;
}

function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [scheme, n, r, p, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt') return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = crypto.scryptSync(password, Buffer.from(salt, 'base64'), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return crypto.timingSafeEqual(actual, expected);
}

// Constant-cost dummy check so unknown logins take as long as wrong passwords.
const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString('hex'));

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newSetupCode(): string {
  const bytes = crypto.randomBytes(8);
  const chars = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]);
  return `${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`;
}
const normalizeCode = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, '');

function toAccount(u: UserRow): UserAccount {
  return {
    id: u.id,
    login: u.login,
    name: u.name,
    role: u.role,
    title: u.title,
    service: u.service,
    active: u.active === 1,
    hasPassword: Boolean(u.password_hash),
    createdAt: u.created_at,
    lastLoginAt: u.last_login_at ?? undefined,
  };
}

const toSessionUser = (u: UserRow): SessionUser => ({
  id: u.id,
  login: u.login,
  name: u.name,
  role: u.role,
  title: u.title,
  service: u.service,
});

function passwordProblem(pw: unknown): string | null {
  if (typeof pw !== 'string' || pw.length < MIN_PASSWORD) {
    return `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`;
  }
  if (pw.length > 200) return 'Mot de passe trop long.';
  return null;
}

const LOGIN_RE = /^[a-z0-9._-]{3,40}$/i;

export function usersExist(): boolean {
  return (q.countUsers.get() as { n: number }).n > 0;
}

/** Creates an account directly with a password (setup wizard and demo seed). */
export function createUserWithPassword(u: {
  id?: string;
  login: string;
  name: string;
  role: UserRole;
  title?: string;
  service?: string;
  password: string;
}): UserRow {
  const id = u.id ?? `user-${crypto.randomUUID()}`;
  q.insertUser.run(
    id,
    u.login,
    u.name,
    u.role,
    u.title ?? '',
    u.service ?? '',
    hashPassword(u.password),
    null,
    null,
    new Date().toISOString()
  );
  return q.userById.get(id) as unknown as UserRow;
}

// ── Cookies & sessions ──────────────────────────────────────

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

function setSessionCookie(res: Response, token: string) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${ABSOLUTE_MS / 1000}`
  );
}
function clearSessionCookie(res: Response) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
}

function startSession(res: Response, user: UserRow) {
  const token = crypto.randomBytes(32).toString('base64url');
  const now = new Date().toISOString();
  q.insertSession.run(sha256(token), user.id, now, now);
  q.touchLogin.run(now, user.id);
  setSessionCookie(res, token);
}

/** Resolves the session cookie to an active user, sliding the idle timeout. */
function sessionUser(req: Request): SessionUser | null {
  const token = readCookie(req, COOKIE);
  if (!token) return null;
  const hash = sha256(token);
  const s = q.sessionByHash.get(hash) as { user_id: string; created_at: string; last_seen: string } | undefined;
  if (!s) return null;
  const now = Date.now();
  if (now - Date.parse(s.last_seen) > IDLE_MS || now - Date.parse(s.created_at) > ABSOLUTE_MS) {
    q.deleteSession.run(hash);
    return null;
  }
  const u = q.userById.get(s.user_id) as unknown as UserRow | undefined;
  if (!u || u.active !== 1) {
    q.deleteSession.run(hash);
    return null;
  }
  q.touchSession.run(new Date(now).toISOString(), hash);
  return toSessionUser(u);
}

export function purgeExpiredSessions() {
  const now = Date.now();
  q.purgeSessions.run(new Date(now - IDLE_MS).toISOString(), new Date(now - ABSOLUTE_MS).toISOString());
}

// ── Middleware ──────────────────────────────────────────────

export const currentUser = (res: Response) => res.locals.user as SessionUser;

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = sessionUser(req);
  if (!user) {
    res.status(401).json({ error: 'Session expirée ou absente. Veuillez vous reconnecter.' });
    return;
  }
  res.locals.user = user;
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = currentUser(res);
    if (!roles.includes(user.role)) {
      writeAudit(user, 'ACCES_REFUSE', { details: `Accès refusé : ${req.method} ${req.path} (rôle ${user.role}).` });
      res.status(403).json({ error: 'Action non autorisée pour votre rôle.' });
      return;
    }
    next();
  };
}

// ── Login throttling ────────────────────────────────────────

const failures = new Map<string, { count: number; until: number }>();
function isLocked(key: string) {
  const f = failures.get(key);
  return Boolean(f && f.count >= MAX_FAILURES && f.until > Date.now());
}
function recordFailure(key: string) {
  const f = failures.get(key);
  const fresh = !f || f.until < Date.now();
  const count = fresh ? 1 : f.count + 1;
  failures.set(key, { count, until: Date.now() + LOCK_MS });
}

// ── Routes ──────────────────────────────────────────────────

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function registerAuthRoutes(app: Express) {
  app.get('/api/auth/status', (req, res) => {
    const user = sessionUser(req);
    res.json({ setupRequired: !usersExist(), user });
  });

  // First start: create the initial administrator. Only possible while no account exists.
  app.post('/api/auth/setup', (req, res) => {
    const name = str(req.body?.name);
    const login = str(req.body?.login, 40);
    const password = req.body?.password;
    if (!name || !LOGIN_RE.test(login)) {
      res.status(400).json({ error: 'Nom et identifiant (3 à 40 caractères : lettres, chiffres, . _ -) requis.' });
      return;
    }
    const pwErr = passwordProblem(password);
    if (pwErr) {
      res.status(400).json({ error: pwErr });
      return;
    }
    const created = transaction(() => {
      if (usersExist()) return null;
      return createUserWithPassword({
        login,
        name,
        role: 'ADMIN',
        title: str(req.body?.title) || 'Administrateur',
        password,
      });
    });
    if (!created) {
      res.status(409).json({ error: 'La configuration initiale a déjà été effectuée.' });
      return;
    }
    writeAudit(toSessionUser(created), 'GESTION_COMPTE', {
      details: `Configuration initiale : création du compte administrateur « ${login} ».`,
    });
    startSession(res, created);
    res.json({ user: toSessionUser(created) });
  });

  app.post('/api/auth/login', (req, res) => {
    const login = str(req.body?.login, 40);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const key = `${login.toLowerCase()}|${req.ip}`;
    if (isLocked(key)) {
      res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
      return;
    }
    const u = q.userByLogin.get(login) as unknown as UserRow | undefined;
    const ok = verifyPassword(password, u?.password_hash ?? DUMMY_HASH) && Boolean(u?.password_hash);
    if (!u || !ok) {
      recordFailure(key);
      writeAudit(
        u ? toSessionUser(u) : { id: '', name: `Identifiant inconnu « ${login || '—'} »`, role: '—' as UserRole },
        'ECHEC_CONNEXION',
        { details: 'Échec de connexion : identifiant ou mot de passe incorrect.' }
      );
      res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });
      return;
    }
    if (u.active !== 1) {
      writeAudit(toSessionUser(u), 'ECHEC_CONNEXION', { details: 'Tentative de connexion sur un compte désactivé.' });
      res.status(403).json({ error: 'Ce compte est désactivé. Contactez l’administrateur.' });
      return;
    }
    failures.delete(key);
    startSession(res, u);
    writeAudit(toSessionUser(u), 'CONNEXION', { details: 'Connexion à PsyDossier.' });
    res.json({ user: toSessionUser(u) });
  });

  // The user sets their own password with the activation code given by the administrator.
  app.post('/api/auth/activate', (req, res) => {
    const login = str(req.body?.login, 40);
    const code = normalizeCode(str(req.body?.code, 20));
    const key = `activate|${login.toLowerCase()}|${req.ip}`;
    if (isLocked(key)) {
      res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
      return;
    }
    const u = q.userByLogin.get(login) as unknown as UserRow | undefined;
    const valid =
      u &&
      u.active === 1 &&
      u.setup_code_hash &&
      u.setup_expires_at &&
      Date.parse(u.setup_expires_at) > Date.now() &&
      crypto.timingSafeEqual(Buffer.from(sha256(code)), Buffer.from(u.setup_code_hash));
    if (!valid) {
      recordFailure(key);
      res.status(400).json({ error: 'Code d’activation invalide ou expiré. Demandez-en un nouveau à l’administrateur.' });
      return;
    }
    const pwErr = passwordProblem(req.body?.password);
    if (pwErr) {
      res.status(400).json({ error: pwErr });
      return;
    }
    q.setPassword.run(hashPassword(req.body.password), u.id);
    failures.delete(key);
    writeAudit(toSessionUser(u), 'GESTION_COMPTE', { details: 'Activation du compte : mot de passe défini.' });
    startSession(res, u);
    writeAudit(toSessionUser(u), 'CONNEXION', { details: 'Connexion à PsyDossier.' });
    res.json({ user: toSessionUser(u) });
  });

  app.post('/api/auth/logout', (req, res) => {
    const token = readCookie(req, COOKIE);
    const user = sessionUser(req);
    if (token) q.deleteSession.run(sha256(token));
    if (user) writeAudit(user, 'DECONNEXION', { details: 'Déconnexion.' });
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  app.post('/api/auth/password', requireAuth, (req, res) => {
    const user = currentUser(res);
    const u = q.userById.get(user.id) as unknown as UserRow;
    if (!verifyPassword(String(req.body?.currentPassword ?? ''), u.password_hash)) {
      res.status(400).json({ error: 'Mot de passe actuel incorrect.' });
      return;
    }
    const pwErr = passwordProblem(req.body?.newPassword);
    if (pwErr) {
      res.status(400).json({ error: pwErr });
      return;
    }
    q.setPassword.run(hashPassword(req.body.newPassword), u.id);
    writeAudit(user, 'GESTION_COMPTE', { details: 'Changement de mot de passe.' });
    res.json({ ok: true });
  });

  // ── Account management (ADMIN) ──
  const admin = [requireAuth, requireRole('ADMIN')];

  app.get('/api/users', ...admin, (_req, res) => {
    res.json((q.allUsers.all() as unknown as UserRow[]).map(toAccount));
  });

  app.post('/api/users', ...admin, (req, res) => {
    const actor = currentUser(res);
    const login = str(req.body?.login, 40);
    const name = str(req.body?.name);
    const role = req.body?.role as UserRole;
    if (!name || !LOGIN_RE.test(login) || !ROLES.includes(role)) {
      res.status(400).json({ error: 'Nom, identifiant valide et rôle requis.' });
      return;
    }
    if (q.userByLogin.get(login)) {
      res.status(409).json({ error: `L’identifiant « ${login} » est déjà utilisé.` });
      return;
    }
    const id = `user-${crypto.randomUUID()}`;
    const code = newSetupCode();
    q.insertUser.run(
      id,
      login,
      name,
      role,
      str(req.body?.title),
      str(req.body?.service),
      null,
      sha256(normalizeCode(code)),
      new Date(Date.now() + SETUP_CODE_TTL_MS).toISOString(),
      new Date().toISOString()
    );
    writeAudit(actor, 'GESTION_COMPTE', { details: `Création du compte « ${login} » (${name}, ${role}).` });
    res.json({ user: toAccount(q.userById.get(id) as unknown as UserRow), setupCode: code });
  });

  app.patch('/api/users/:id', ...admin, (req, res) => {
    const actor = currentUser(res);
    const u = q.userById.get(req.params.id) as unknown as UserRow | undefined;
    if (!u) {
      res.status(404).json({ error: 'Compte introuvable.' });
      return;
    }
    const next = {
      name: req.body?.name !== undefined ? str(req.body.name) : u.name,
      role: (req.body?.role ?? u.role) as UserRole,
      title: req.body?.title !== undefined ? str(req.body.title) : u.title,
      service: req.body?.service !== undefined ? str(req.body.service) : u.service,
      active: req.body?.active !== undefined ? (req.body.active ? 1 : 0) : u.active,
    };
    if (!next.name || !ROLES.includes(next.role)) {
      res.status(400).json({ error: 'Nom et rôle valides requis.' });
      return;
    }
    if (u.id === actor.id && (next.active === 0 || next.role !== 'ADMIN')) {
      res.status(400).json({ error: 'Vous ne pouvez pas désactiver votre propre compte ni retirer votre rôle administrateur.' });
      return;
    }
    const losesAdmin = u.role === 'ADMIN' && u.active === 1 && (next.role !== 'ADMIN' || next.active === 0);
    if (losesAdmin && (q.activeAdmins.get() as { n: number }).n <= 1) {
      res.status(400).json({ error: 'Au moins un administrateur actif est requis.' });
      return;
    }
    q.updateProfile.run(next.name, next.role, next.title, next.service, next.active, u.id);
    if (next.active === 0 || next.role !== u.role) q.deleteUserSessions.run(u.id);

    const what: string[] = [];
    if (next.active !== u.active) what.push(next.active ? 'réactivation' : 'désactivation');
    if (next.role !== u.role) what.push(`rôle ${u.role} → ${next.role}`);
    if (next.name !== u.name || next.title !== u.title || next.service !== u.service) what.push('profil modifié');
    writeAudit(actor, 'GESTION_COMPTE', {
      details: `Compte « ${u.login} » : ${what.join(', ') || 'aucun changement'}.`,
    });
    res.json({ user: toAccount(q.userById.get(u.id) as unknown as UserRow) });
  });

  // New activation code: clears the password and closes the user's sessions.
  app.post('/api/users/:id/reset-access', ...admin, (req, res) => {
    const actor = currentUser(res);
    const u = q.userById.get(req.params.id) as unknown as UserRow | undefined;
    if (!u) {
      res.status(404).json({ error: 'Compte introuvable.' });
      return;
    }
    if (u.id === actor.id) {
      res.status(400).json({ error: 'Utilisez « Changer mon mot de passe » pour votre propre compte.' });
      return;
    }
    const code = newSetupCode();
    q.setSetupCode.run(sha256(normalizeCode(code)), new Date(Date.now() + SETUP_CODE_TTL_MS).toISOString(), u.id);
    q.deleteUserSessions.run(u.id);
    writeAudit(actor, 'GESTION_COMPTE', { details: `Réinitialisation de l’accès du compte « ${u.login} ».` });
    res.json({ user: toAccount(q.userById.get(u.id) as unknown as UserRow), setupCode: code });
  });
}
