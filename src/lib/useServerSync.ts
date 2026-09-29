import { useCallback, useEffect, useRef, useState } from 'react';
import { AuditEntry, DossierPsychiatrique, ReferenceLists } from '../types';
import { api, ServerState } from './api';

const RETRY_MS = 5000;

/**
 * Pushes changed records to the local server.
 * Records are compared by object identity against the last known server copy,
 * so only dossiers / audit entries that were actually replaced get saved.
 * Failed saves are kept and retried until the server answers.
 */
export function useServerSync(
  dossiers: DossierPsychiatrique[],
  auditLogs: AuditEntry[],
  referenceLists: ReferenceLists,
  isLoaded: boolean
) {
  const syncedDossiers = useRef(new Map<string, DossierPsychiatrique>());
  const syncedAudit = useRef(new Map<string, AuditEntry>());
  const syncedRefs = useRef<ReferenceLists | null>(null);
  const pending = useRef(new Map<string, () => Promise<unknown>>());
  const [pendingCount, setPendingCount] = useState(0);

  const inFlight = useRef(new Set<string>());

  // One request per record at a time; a newer version waits for the older one.
  const attempt = useCallback((key: string) => {
    const task = pending.current.get(key);
    if (!task || inFlight.current.has(key)) return;
    inFlight.current.add(key);
    task()
      .then(() => {
        if (pending.current.get(key) === task) {
          pending.current.delete(key);
          setPendingCount(pending.current.size);
        }
      })
      .catch(() => {
        // kept in `pending`, retried by the interval below
      })
      .finally(() => {
        inFlight.current.delete(key);
        const next = pending.current.get(key);
        if (next && next !== task) attempt(key);
      });
  }, []);

  const enqueue = useCallback(
    (key: string, task: () => Promise<unknown>) => {
      pending.current.set(key, task);
      setPendingCount(pending.current.size);
      attempt(key);
    },
    [attempt]
  );

  /** Record what the server already holds, so it is not written back. */
  const setBaseline = useCallback((state: ServerState) => {
    syncedDossiers.current = new Map(state.dossiers.map((d) => [d.id, d]));
    syncedAudit.current = new Map(state.auditLogs.map((e) => [e.id, e]));
    syncedRefs.current = state.referenceLists;
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    for (const d of dossiers) {
      if (syncedDossiers.current.get(d.id) !== d) {
        syncedDossiers.current.set(d.id, d);
        enqueue(`dossier:${d.id}`, () => api.saveDossier(d));
      }
    }
  }, [dossiers, isLoaded, enqueue]);

  useEffect(() => {
    if (!isLoaded) return;
    for (const e of auditLogs) {
      if (syncedAudit.current.get(e.id) !== e) {
        syncedAudit.current.set(e.id, e);
        enqueue(`audit:${e.id}`, () => api.saveAuditLog(e));
      }
    }
  }, [auditLogs, isLoaded, enqueue]);

  useEffect(() => {
    if (!isLoaded || syncedRefs.current === referenceLists) return;
    syncedRefs.current = referenceLists;
    enqueue('referentiels', () => api.saveReferenceLists(referenceLists));
  }, [referenceLists, isLoaded, enqueue]);

  useEffect(() => {
    if (pendingCount === 0) return;
    const timer = window.setInterval(() => {
      pending.current.forEach((_task, key) => attempt(key));
    }, RETRY_MS);
    return () => window.clearInterval(timer);
  }, [pendingCount, attempt]);

  useEffect(() => {
    if (pendingCount === 0) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [pendingCount]);

  return { setBaseline, pendingCount };
}
