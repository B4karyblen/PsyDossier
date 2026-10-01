import { ReferenceLists, ReferenceListsInactive } from '../types';

type StringCategory = Exclude<keyof ReferenceListsInactive, 'diagnosticClassifications'>;

/**
 * Values offered for new selections (PRD F-24): deactivated values are hidden,
 * except the one already stored in the record being edited.
 */
export function activeValues(lists: ReferenceLists, category: StringCategory, keep?: string): string[] {
  const inactive = new Set(lists.inactive?.[category] ?? []);
  return (lists[category] ?? []).filter((v) => !inactive.has(v) || v === keep);
}

export function activeClassifications(lists: ReferenceLists) {
  const inactive = new Set(lists.inactive?.diagnosticClassifications ?? []);
  return lists.diagnosticClassifications.filter((c) => !inactive.has(c.code));
}
