import { AuditEntry, DossierPsychiatrique, ReferenceLists, UserAccount, UserRole } from '../types';

export interface ServerState {
  dossiers: DossierPsychiatrique[];
  auditLogs: AuditEntry[];
  referenceLists: ReferenceLists | null;
  /** ADMIN only: list values referenced by dossiers (can be deactivated, not deleted). */
  referentielsUsage?: Record<string, string[]>;
}

/** The signed-in user, as resolved by the server session. */
export interface SessionUser {
  id: string;
  login: string;
  name: string;
  role: UserRole;
  title: string;
  service: string;
}

export interface AuthStatus {
  setupRequired: boolean;
  user: SessionUser | null;
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
  setup: (b: { name: string; login: string; password: string; title?: string }) =>
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

  // Accounts (ADMIN)
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
