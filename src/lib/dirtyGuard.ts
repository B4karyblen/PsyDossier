import { useEffect } from 'react';

/**
 * Unsaved-changes guard (PRD B4: confirmation before leaving a form with unsaved input).
 * The mounted rubrique form reports whether it is dirty; navigation asks before discarding.
 */
let dirty = false;

export function useReportDirty(isDirty: boolean) {
  useEffect(() => {
    dirty = isDirty;
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => {
      dirty = false;
      window.removeEventListener('beforeunload', warn);
    };
  }, [isDirty]);
}

/** True when it is safe to navigate away (nothing unsaved, or the user agreed to discard). */
export function confirmDiscard(): boolean {
  if (!dirty) return true;
  const ok = window.confirm('Des modifications de cette rubrique ne sont pas enregistrées. Les abandonner ?');
  if (ok) dirty = false;
  return ok;
}
