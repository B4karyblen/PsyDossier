import { AuditEntry, DossierPsychiatrique, ReferenceLists } from '../types';

export interface ServerState {
  dossiers: DossierPsychiatrique[];
  auditLogs: AuditEntry[];
  referenceLists: ReferenceLists | null;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  if (!res.ok) {
    throw new Error(`${init?.method || 'GET'} ${url} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  loadState: () => request<ServerState>('/api/state'),
  saveDossier: (d: DossierPsychiatrique) =>
    request(`/api/dossiers/${encodeURIComponent(d.id)}`, { method: 'PUT', body: JSON.stringify(d) }),
  saveAuditLog: (e: AuditEntry) =>
    request(`/api/audit-logs/${encodeURIComponent(e.id)}`, { method: 'PUT', body: JSON.stringify(e) }),
  saveReferenceLists: (r: ReferenceLists) =>
    request('/api/referentiels', { method: 'PUT', body: JSON.stringify(r) }),
};
