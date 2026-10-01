import { useEffect, useRef, useState } from 'react';
import { useReportDirty } from './dirtyGuard';

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Local form state for a rubrique, kept in step with the stored section:
 * when the stored value changes (save echo, server normalisation, conflict reload)
 * the form adopts it unless the user has unsaved edits.
 */
export function useRubriqueForm<T>(data: T) {
  const [formData, setFormData] = useState<T>(data);
  const baseline = useRef(data);

  useEffect(() => {
    if (baseline.current === data) return;
    const previous = baseline.current;
    baseline.current = data;
    setFormData((current) => (same(current, previous) || same(current, data) ? data : current));
  }, [data]);

  const isDirty = !same(formData, data);
  useReportDirty(isDirty);

  return [formData, setFormData, { isDirty, reset: () => setFormData(data) }] as const;
}
