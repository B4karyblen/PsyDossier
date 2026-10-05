/**
 * Licence baked into a client's release by scripts/package-win.mjs (esbuild `define`).
 * Absent (null) in development, where the identifier is never defined.
 */
export interface Licence {
  /** Unique reference, e.g. PSD-2026-K7QM: shown in the app and recorded in the database. */
  id: string;
  holder: string;
  place: string;
  issued: string;
  maxUsers: number;
}

declare const __PSYDOSSIER_LICENCE__: Licence | undefined;

export const LICENCE: Licence | null =
  typeof __PSYDOSSIER_LICENCE__ === 'undefined' ? null : __PSYDOSSIER_LICENCE__;
