import { useCallback, useEffect, useRef, useState } from 'react';
import { DossierPsychiatrique, ReferenceLists } from '../types';
import { api, ApiError, DossierWriteResult, ServerState } from './api';

const RETRY_MS = 5000;

export interface SyncHandlers {
  /** Server accepted a dossier. `superseded` = a newer local edit is already queued. */
  onSaved: (result: DossierWriteResult, superseded: boolean) => void;
  /** Server refused a dossier write (403 forbidden, 409 conflict, 400 invalid). Local copy should be reverted. */
  onRejected: (dossierId: string, error: ApiError) => void;
  /** Session expired: writes are paused until `resume()`. */
  onUnauthorized: () => void;
  /** Server refused the reference lists. */
  onReferentielsRejected: (error: ApiError) => void;
}

/**
 * Pushes changed records to the local server.
 * Records are compared by object identity against the last known server copy, so only
 * dossiers that were actually replaced get saved. Each write carries the version the edit was
 * based on; the server rejects it if someone else saved in between.
 * Network failures are retried; refusals are reported and dropped.
 */
export function useServerSync(
  dossiers: DossierPsychiatrique[],
  referenceLists: ReferenceLists,
  isLoaded: boolean,
  handlers: SyncHandlers
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const syncedDossiers = useRef(new Map<string, DossierPsychiatrique>());
  const versions = useRef(new Map<string, string>());
  const syncedRefs = useRef<ReferenceLists | null>(null);
  const pending = useRef(new Map<string, () => Promise<unknown>>());
  const inFlight = useRef(new Set<string>());
  const paused = useRef(false);
  const [pendingCount, setPendingCount] = useState(0);

  const drop = useCallback((key: string) => {
    pending.current.delete(key);
    setPendingCount(pending.current.size);
  }, []);

  // One request per record at a time; a newer version waits for the older one.
  const attempt = useCallback(
    (key: string) => {
      const task = pending.current.get(key);
      if (!task || inFlight.current.has(key) || paused.current) return;
      inFlight.current.add(key);
      task()
        .then(() => {
          if (pending.current.get(key) === task) drop(key);
        })
        .catch((err: unknown) => {
          const e = err instanceof ApiError ? err : new ApiError(0, String(err));
          if (e.status === 401) {
            paused.current = true;
            handlersRef.current.onUnauthorized();
          } else if (e.status === 0 || e.status >= 500) {
            // kept in `pending`, retried by the interval below
          } else {
            // Refused: the local edit (and anything queued after it) is discarded.
            drop(key);
            if (key.startsWith('dossier:')) handlersRef.current.onRejected(key.slice(8), e);
            else handlersRef.current.onReferentielsRejected(e);
          }
        })
        .finally(() => {
          inFlight.current.delete(key);
          const next = pending.current.get(key);
          if (next && next !== task) attempt(key);
        });
    },
    [drop]
  );

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
    versions.current = new Map(state.dossiers.map((d) => [d.id, d.dateDerniereModification]));
    syncedRefs.current = state.referenceLists;
    pending.current.clear();
    setPendingCount(0);
  }, []);

  /** Accept a server copy (after save, conflict or refusal) without writing it back. */
  const adoptServerCopy = useCallback((d: DossierPsychiatrique) => {
    syncedDossiers.current.set(d.id, d);
    versions.current.set(d.id, d.dateDerniereModification);
  }, []);

  const adoptReferentiels = useCallback((r: ReferenceLists) => {
    syncedRefs.current = r;
  }, []);

  const resume = useCallback(() => {
    paused.current = false;
    pending.current.forEach((_task, key) => attempt(key));
  }, [attempt]);

  useEffect(() => {
    if (!isLoaded) return;
    for (const d of dossiers) {
      if (syncedDossiers.current.get(d.id) !== d) {
        syncedDossiers.current.set(d.id, d);
        const key = `dossier:${d.id}`;
        const task = async () => {
          const result = await api.saveDossier(d, versions.current.get(d.id));
          versions.current.set(d.id, result.dossier.dateDerniereModification);
          const superseded = pending.current.get(key) !== task;
          if (!superseded) syncedDossiers.current.set(d.id, result.dossier);
          handlersRef.current.onSaved(result, superseded);
        };
        enqueue(key, task);
      }
    }
  }, [dossiers, isLoaded, enqueue]);

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

  return { setBaseline, adoptServerCopy, adoptReferentiels, resume, pendingCount };
}
