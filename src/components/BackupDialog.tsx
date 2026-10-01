import React, { useState } from 'react';
import { AlertTriangle, Download, HardDrive, X } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useToast } from './ui/Toaster';

/** Days after which the dashboard reminds the doctor to back up off the PC. */
export const BACKUP_REMINDER_DAYS = 7;

export const daysSince = (iso?: string | null) =>
  iso ? Math.floor((Date.now() - Date.parse(iso)) / 86_400_000) : null;

export const formatBackupAge = (iso?: string | null) => {
  const d = daysSince(iso);
  if (d === null) return 'jamais';
  if (d === 0) return 'aujourd’hui';
  if (d === 1) return 'hier';
  return `il y a ${d} jours`;
};

/**
 * Full backup to take off the PC (USB key, external disk). The automatic daily snapshots
 * stay on the same disk and do not protect against a disk failure or theft.
 */
export const BackupDialog: React.FC<{
  lastBackup?: string | null;
  onClose: () => void;
  onDone: (when: string) => void;
}> = ({ lastBackup, onClose, onDone }) => {
  const notify = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const download = async () => {
    setBusy(true);
    setError('');
    try {
      const { name, blob } = await api.downloadBackup();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      onDone(new Date().toISOString());
      notify({ title: 'Sauvegarde téléchargée', message: `${name} — copiez-la sur votre clé USB.` });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'La sauvegarde a échoué.');
    } finally {
      setBusy(false);
    }
  };

  const age = daysSince(lastBackup);
  const overdue = age === null || age >= BACKUP_REMINDER_DAYS;

  return (
    <div className="fixed inset-0 z-50 bg-ink-950/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="backup-title">
      <div className="clinical-card w-full max-w-lg !rounded-2xl shadow-[var(--shadow-float)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-150">
          <div className="flex items-center gap-3">
            <span className="icon-tile tile-primary !w-9 !h-9">
              <HardDrive className="w-5 h-5" />
            </span>
            <h2 id="backup-title" className="text-lg font-bold text-ink-900">Sauvegarde sur clé USB</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className={`clinical-subcard flex items-center justify-between gap-3 ${overdue ? '!bg-amber-50 !border-amber-200' : ''}`}>
            <span className="text-sm font-semibold text-ink-700">Dernière sauvegarde externe</span>
            <span className={`text-base font-bold ${overdue ? 'text-amber-800' : 'text-ink-900'}`}>{formatBackupAge(lastBackup)}</span>
          </div>

          <ol className="space-y-2.5 text-base text-ink-700 list-decimal pl-5">
            <li>Branchez votre clé USB ou disque externe.</li>
            <li>Cliquez sur « Télécharger la sauvegarde ».</li>
            <li>Enregistrez le fichier sur la clé (ou déplacez-le depuis « Téléchargements »).</li>
          </ol>

          <p className="text-sm text-ink-600">
            Le fichier contient <strong>tous les dossiers, le journal d’audit et les comptes</strong>. Faites-le au moins une
            fois par semaine et gardez la clé en lieu sûr : ces données de santé ne sont pas chiffrées sur la clé.
          </p>

          {error && (
            <div role="alert" className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={onClose}>Fermer</button>
            <button type="button" className="btn-primary" onClick={download} disabled={busy}>
              <Download className="w-4 h-4" />
              {busy ? 'Préparation…' : 'Télécharger la sauvegarde'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
