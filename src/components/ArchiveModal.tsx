import React, { useState } from 'react';
import { DossierPsychiatrique, UserProfile } from '../types';
import { X, Archive, RefreshCw, AlertTriangle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-[#111827]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#D9E2E8] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#F8FAFC] border-b border-[#D9E2E8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'ARCHIVER' ? (
              <div className="w-8 h-8 rounded-lg bg-[#FFE4E6] flex items-center justify-center text-[#BE123C]">
                <Archive className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#15803D]">
                <RefreshCw className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-[#18243A]">
                {mode === 'ARCHIVER' ? 'Archiver le Dossier Patient' : 'Réactiver le Dossier Patient'}
              </h2>
              <p className="text-xs text-[#64748B]">
                {dossier.s1Identification.numeroOrdre} · {dossier.s1Identification.nom}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#18243A] p-1.5 rounded-lg hover:bg-[#F1F5F7]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {mode === 'ARCHIVER' ? (
            <div className="p-3 bg-[#FFE4E6]/50 border border-[#F43F5E]/30 rounded-xl text-[#BE123C] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Le dossier sera placé en archivage logique (BR-017). Il ne figurera plus dans les listes actives mais demeurera consultable sous filtre d'archives.
              </span>
            </div>
          ) : (
            <div className="p-3 bg-[#DCFCE7]/50 border border-[#10B981]/30 rounded-xl text-[#15803D] flex items-start gap-2">
              <RefreshCw className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Le dossier sera rouvert et réintégré dans le registre actif avec le statut « En cours ».
              </span>
            </div>
          )}

          {error && (
            <div className="p-2 bg-[#FFE4E6] text-[#BE123C] rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#18243A] mb-1">
              Catégorie du motif
            </label>
            <select
              value={motifSelect}
              onChange={(e) => setMotifSelect(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] text-xs rounded-lg px-3 py-2 font-medium"
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
            <label className="block font-semibold text-[#18243A] mb-1">
              Précisions & justification clinique (obligatoire)
            </label>
            <textarea
              rows={3}
              value={motifDetails}
              onChange={(e) => setMotifDetails(e.target.value)}
              placeholder="Préciser les circonstances (ex: déménagement à Sikasso avec transfert du dossier)..."
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] rounded-lg p-2.5 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E8EEF2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#F1F5F7] hover:bg-[#D9E2E8] text-[#18243A] font-semibold rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-4 py-2 font-semibold text-white rounded-lg ${
                mode === 'ARCHIVER' ? 'bg-[#BE123C] hover:bg-[#9F1239]' : 'bg-[#10B9A9] hover:bg-[#07988D]'
              }`}
            >
              {mode === 'ARCHIVER' ? 'Confirmer l’archivage' : 'Confirmer la réactivation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
