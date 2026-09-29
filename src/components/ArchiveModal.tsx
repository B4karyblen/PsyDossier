import React, { useState } from 'react';
import { DossierPsychiatrique, UserProfile } from '../types';
import { X, Archive, RefreshCw, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: DossierPsychiatrique;
  currentUser: UserProfile;
  mode: 'ARCHIVER' | 'REACTIVER';
  onConfirmArchive: (motif: string) => void;
  onConfirmReactivate: (motif: string) => void;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  dossier,
  currentUser,
  mode,
  onConfirmArchive,
  onConfirmReactivate,
}) => {
  if (!isOpen) return null;

  const [motifSelect, setMotifSelect] = useState('Fin de suivi médical');
  const [motifDetails, setMotifDetails] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMotif = motifDetails.trim() ? `${motifSelect} : ${motifDetails.trim()}` : motifSelect;
    if (!finalMotif.trim()) {
      setError('Le motif est obligatoire.');
      return;
    }

    if (mode === 'ARCHIVER') {
      onConfirmArchive(finalMotif);
    } else {
      onConfirmReactivate(finalMotif);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="clinical-card w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 !rounded-3xl !border-ink-150 shadow-[var(--shadow-float)]">
        {/* Header */}
        <div className="bg-ink-800 border-b border-ink-700 px-6 sm:px-7 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mode === 'ARCHIVER' ? (
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-xs">
                <Archive className="w-5 h-5 text-rose-400" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-xs">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
              </div>
            )}
            <div>
              <h2 className="text-h2 font-extrabold text-white tracking-tight">
                {mode === 'ARCHIVER' ? 'Archivage du Dossier Patient' : 'Réactivation du Dossier'}
              </h2>
              <p className="text-body-sm text-slate-400 font-medium">
                {dossier.s1Identification.numeroOrdre} · {dossier.s1Identification.nom} {dossier.s1Identification.prenoms}
              </p>
            </div>
          </div>
          <button
            aria-label="Fermer"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-ink-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4.5 text-xs">
          {mode === 'ARCHIVER' ? (
            <div className="p-3.5 bg-rose-100/60 border border-rose-500/30 rounded-xl text-rose-700 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
              <span className="leading-relaxed font-medium">
                Le dossier sera placé en archivage logique (BR-017). Il demeurera traçable et consultable en lecture seule via le filtre des archives.
              </span>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-100/60 border border-emerald-300 rounded-xl text-emerald-700 flex items-start gap-2.5">
              <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
              <span className="leading-relaxed font-medium">
                Le dossier sera rouvert et réintégré dans le registre actif avec le statut « En cours » pour une nouvelle prise en charge.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-500/30">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold text-ink-900 mb-1">
              Catégorie de motif <span className="text-rose-500">*</span>
            </label>
            <select
              value={motifSelect}
              onChange={(e) => setMotifSelect(e.target.value)}
              className="clinical-input text-xs font-semibold"
            >
              {mode === 'ARCHIVER' ? (
                <>
                  <option value="Fin de prise en charge / Rétablissement">Fin de prise en charge / Rétablissement</option>
                  <option value="Mutation géographique / Transfert de structure">Mutation géographique / Transfert de structure</option>
                  <option value="Perdu de vue / Rupture de suivi">Perdu de vue / Rupture de suivi</option>
                  <option value="Décès du patient">Décès du patient</option>
                  <option value="Autre motif clinique">Autre motif clinique</option>
                </>
              ) : (
                <>
                  <option value="Nouvelle consultation / Reprise des soins">Nouvelle consultation / Reprise des soins</option>
                  <option value="Réadmission après transfert">Réadmission après transfert</option>
                  <option value="Réévaluation diagnostique">Réévaluation diagnostique</option>
                  <option value="Autre motif">Autre motif</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block font-bold text-ink-900 mb-1">
              Précisions & justification clinique
            </label>
            <textarea
              rows={3}
              value={motifDetails}
              onChange={(e) => setMotifDetails(e.target.value)}
              placeholder="Préciser les circonstances cliniques ou administratives..."
              className="clinical-input text-xs leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-ink-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-ink-500 hover:text-ink-900 bg-ink-100 hover:bg-ink-150 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              className={`px-5 py-2.5 text-xs font-extrabold text-white rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                mode === 'ARCHIVER'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                  : 'clinical-btn-primary shadow-brand-500/20'
              }`}
            >
              {mode === 'ARCHIVER' ? (
                <>
                  <Archive className="w-4 h-4" />
                  <span>Confirmer l'Archivage</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Confirmer la Réactivation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
