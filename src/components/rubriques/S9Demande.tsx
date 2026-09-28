import React, { useState } from 'react';
import { S9DemandeData, UserRole } from '../../types';
import { Save, ChevronRight, Lock } from 'lucide-react';

interface Props {
  data: S9DemandeData;
  isReadOnly: boolean;
  currentUserRole: UserRole;
  onSave: (data: S9DemandeData) => void;
  onNext: () => void;
}

export const S9Demande: React.FC<Props> = ({
  data,
  isReadOnly,
  currentUserRole,
  onSave,
  onNext,
}) => {
  const [formData, setFormData] = useState<S9DemandeData>(data);
  const [isSaved, setIsSaved] = useState(false);

  // BR-014 / B2: Seuls Psychiatre et Psychologue peuvent modifier la demande inconsciente
  const canEditInconsciente = ['PSYCHIATRE', 'PSYCHOLOGUE'].includes(currentUserRole) && !isReadOnly;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8EEF2]">
        <div>
          <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2 py-0.5 rounded">
            S9 · PSYCHODYNAMIQUE
          </span>
          <h2 className="text-base font-bold text-[#18243A] mt-1">
            Demande du patient
          </h2>
          <p className="text-xs text-[#64748B]">
            Distinction entre la demande manifeste consciente et la demande inconsciente latente
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="mb-4 p-2.5 bg-[#DCFCE7] border border-[#10B981]/30 rounded-lg text-xs text-[#15803D] font-medium">
          Demande du patient enregistrée avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Demande consciente */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Demande manifeste / consciente (Verbalisée par le patient)
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            value={formData.demandeConsciente || ''}
            onChange={(e) => setFormData({ ...formData, demandeConsciente: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-3 focus:outline-none"
            placeholder="Ce que le patient exprime explicitement souhaiter obtenir de la consultation..."
          />
          <span className="text-[11px] text-[#64748B] mt-0.5 block">
            Exemple : « Retrouver le sommeil, guérir mes maux de tête, être débarrassé des voix... »
          </span>
        </div>

        {/* Demande inconsciente */}
        <div className="p-4 bg-[#F1F5F7] border border-[#D9E2E8] rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#18243A] flex items-center gap-1.5">
              <span>Demande latente / inconsciente (Interprétation clinique & psychanalytique)</span>
              {!canEditInconsciente && (
                <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />
              )}
            </label>
            <span className="text-[10px] font-mono text-[#07988D] bg-[#ECFBF9] px-2 py-0.5 rounded border border-[#10B9A9]/20">
              Réservé Psychiatre & Psychologue
            </span>
          </div>

          <textarea
            rows={4}
            disabled={!canEditInconsciente}
            value={formData.demandeInconsciente || ''}
            onChange={(e) => setFormData({ ...formData, demandeInconsciente: e.target.value })}
            className={`w-full text-xs font-medium rounded-lg p-3 border focus:outline-none ${
              canEditInconsciente
                ? 'bg-white border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A]'
                : 'bg-[#F8FAFC] border-[#D9E2E8] text-[#64748B] cursor-not-allowed'
            }`}
            placeholder={
              canEditInconsciente
                ? "Analyse psycho-dynamique : besoins de réassurance narcissique, bénéfices secondaires, régression, angoisse de séparation..."
                : "Seuls les psychiatres et psychologues sont habilités à renseigner ce champ d'analyse latente."
            }
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8EEF2]">
          <div className="text-[11px] text-[#64748B]">
            Section essentielle pour l'orientation psychothérapeutique
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Enregistrer S9
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors flex items-center gap-1.5"
            >
              Suivant (S10)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
