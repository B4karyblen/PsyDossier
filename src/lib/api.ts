import { AuditEntry, DossierPsychiatrique, ReferenceLists, UserAccount, UserRole } from '../types';

export interface ServerState {
  dossiers: DossierPsychiatrique[];
  auditLogs: AuditEntry[];
  referenceLists: ReferenceLists | null;
  /** ADMIN only: list values referenced by dossiers (can be deactivated, not deleted). */
  referentielsUsage?: Record<string, string[]>;
  /** ADMIN / owner only: when a full backup was last downloaded (ISO), or null if never. */
  lastExternalBackup?: string | null;
}

/** The signed-in user, as resolved by the server session. */
export interface SessionUser {
  id: string;
  login: string;
  name: string;
  role: UserRole;
  title: string;
  service: string;
  /** The doctor who installed PsyDossier: also manages lists, accounts and backups. */
  isOwner: boolean;
}

/** Manages lists, accounts and backups. */
export const canManage = (u: Pick<SessionUser, 'role' | 'isOwner'>) => u.role === 'ADMIN' || u.isOwner;

export interface AuthStatus {
  setupRequired: boolean;
  user: SessionUser | null;
  /** The data folder is synced by OneDrive, which can corrupt the live database. */
  dataInOneDrive?: boolean;
}

export interface DossierWriteResult {
  dossier: DossierPsychiatrique;
  audit: AuditEntry[];
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public body: Record<string, unknown> = {}) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
  } catch {
    throw new ApiError(0, 'Serveur local injoignable.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, (body as { error?: string }).error || `Erreur ${res.status}`, body);
  }
  return body as T;
}

const post = <T>(url: string, body?: unknown) =>
  request<T>(url, { method: 'POST', body: JSON.stringify(body ?? {}) });

export const api = {
  // Session
  status: () => request<AuthStatus>('/api/auth/status'),
  setup: (b: { name: string; login: string; password: string; title?: string; service?: string }) =>
    post<{ user: SessionUser }>('/api/auth/setup', b),
  login: (login: string, password: string) => post<{ user: SessionUser }>('/api/auth/login', { login, password }),
  activate: (login: string, code: string, password: string) =>
    post<{ user: SessionUser }>('/api/auth/activate', { login, code, password }),
  logout: () => post<{ ok: true }>('/api/auth/logout'),
  changePassword: (currentPassword: string, newPassword: string) =>
    post<{ ok: true }>('/api/auth/password', { currentPassword, newPassword }),

  // Data
  loadState: () => request<ServerState>('/api/state'),
  saveDossier: (d: DossierPsychiatrique, baseVersion: string | undefined) =>
    request<DossierWriteResult>(`/api/dossiers/${encodeURIComponent(d.id)}`, {
      method: 'PUT',
      body: JSON.stringify(d),
      headers: baseVersion ? { 'X-Base-Version': baseVersion } : {},
    }),
  logEvent: (action: 'LECTURE' | 'EXPORT', dossierId: string, rubriques?: string[]) =>
    post<{ entry: AuditEntry }>('/api/audit', { action, dossierId, rubriques }),
  saveReferenceLists: (r: ReferenceLists) =>
    request<{ ok: true }>('/api/referentiels', { method: 'PUT', body: JSON.stringify(r) }),

  /** Downloads a full database snapshot; resolves with the suggested file name and contents. */
  downloadBackup: async (): Promise<{ name: string; blob: Blob }> => {
    let res: Response;
    try {
      res = await fetch('/api/backup', { credentials: 'same-origin' });
    } catch {
      throw new ApiError(0, 'Serveur local injoignable.');
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, (body as { error?: string }).error || `Erreur ${res.status}`, body);
    }
    const disposition = res.headers.get('Content-Disposition') || '';
    const name = /filename="?([^";]+)"?/.exec(disposition)?.[1] || 'psydossier-sauvegarde.db';
    return { name, blob: await res.blob() };
  },

  // Accounts (ADMIN / owner)
  listUsers: () => request<UserAccount[]>('/api/users'),
  createUser: (u: { login: string; name: string; role: UserRole; title: string; service: string }) =>
    post<{ user: UserAccount; setupCode: string }>('/api/users', u),
  updateUser: (id: string, patch: Partial<Pick<UserAccount, 'name' | 'role' | 'title' | 'service' | 'active'>>) =>
    request<{ user: UserAccount }>(`/api/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
  resetAccess: (id: string) =>
    post<{ user: UserAccount; setupCode: string }>(`/api/users/${encodeURIComponent(id)}/reset-access`),
};
