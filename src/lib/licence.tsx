import React from 'react';
import type { Licence } from './api';

export const LicenceContext = React.createContext<Licence | null>(null);

/** Who issues activation keys, shown on the activation screen. */
export const PUBLISHER = { name: 'Aboubacar Togola', phone: '+223 71 41 47 74' };

/** "Licence personnelle de Dr X (Lieu) · réf. PSD-…" — nothing in development builds. */
export const LicenceNotice: React.FC<{ className?: string }> = ({ className = '' }) => {
  const licence = React.useContext(LicenceContext);
  if (!licence) return null;
  return (
    <p className={`text-xs text-ink-500 ${className}`}>
      Licence personnelle de <span className="font-semibold text-ink-700">{licence.holder}</span>
      {licence.place && ` (${licence.place})`} · non cessible · réf. {licence.id}
    </p>
  );
};
