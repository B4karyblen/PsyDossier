import React from 'react';
import { DossierStatus } from '../../types';

const STATUS_STYLES: Record<DossierStatus, { label: string; cls: string }> = {
  VALIDÉ: { label: 'Validé', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  EN_COURS: { label: 'En cours', cls: 'bg-amber-50 text-amber-800 ring-amber-200' },
  BROUILLON: { label: 'Brouillon', cls: 'bg-ink-50 text-ink-600 ring-ink-200' },
  ARCHIVÉ: { label: 'Archivé', cls: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

export const StatusBadge: React.FC<{ status: DossierStatus; label?: string }> = ({ status, label }) => {
  const s = STATUS_STYLES[status];
  if (!s) return null;
  return (
    <span className={`chip ring-1 ring-inset ${s.cls}`}>
      <span className="dot" aria-hidden="true" />
      {label ?? s.label}
    </span>
  );
};
