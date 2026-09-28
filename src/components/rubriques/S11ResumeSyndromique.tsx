import React, { useState } from 'react';
import { S11ResumeSyndromiqueData, ReferenceLists } from '../../types';
import { Save, ChevronRight, AlertCircle, Plus, Check } from 'lucide-react';

interface Props {
  data: S11ResumeSyndromiqueData;
  isReadOnly: boolean;
  onSave: (data: S11ResumeSyndromiqueData) => void;
  onNext: () => void;
  referenceLists: ReferenceLists;
}

export const S11ResumeSyndromique: React.FC<Props> = ({
  data,
  isReadOnly,
  onSave,
  onNext,
  referenceLists,
}) => {
  const [formData, setFormData] = useState<S11ResumeSyndromiqueData>(data);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [customSyndrome, setCustomSyndrome] = useState('');

  const toggleSyndrome = (syndrome: string) => {
    if (isReadOnly) return;
    const current = formData.syndromesIdentifies || [];
    if (current.includes(syndrome)) {
      setFormData({
        ...formData,
        syndromesIdentifies: current.filter(s => s !== syndrome)
      });
    } else {
      setFormData({
        ...formData,
        syndromesIdentifies: [...current, syndrome]
      });
    }
  };

  const addCustom = () => {
    if (isReadOnly || !customSyndrome.trim()) return;
    if (!formData.syndromesIdentifies.includes(customSyndrome.trim())) {
      setFormData({
        ...formData,
        syndromesIdentifies: [...formData.syndromesIdentifies, customSyndrome.trim()]
      });
    }
    setCustomSyndrome('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.resume.trim()) {
      setError('Le résumé syndromique est obligatoire pour la clôture et la validation du dossier (F-14).');
      return;
    }
    setError(null);
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8EEF2]">
        <div>
          <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2 py-0.5 rounded">
            S11 · SYNTHÈSE
          </span>
          <h2 className="text-base font-bold text-[#18243A] mt-1">
            Résumé syndromique
          </h2>
          <p className="text-xs text-[#64748B]">
            Synthèse sémiologique intégrative et regroupement en grands syndromes cliniques
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#FFE4E6] border border-[#F43F5E]/30 rounded-lg flex items-center gap-2 text-xs text-[#BE123C]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isSaved && (
        <div className="mb-4 p-2.5 bg-[#DCFCE7] border border-[#10B981]/30 rounded-lg text-xs text-[#15803D] font-medium">
          Résumé syndromique enregistré avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Syndromes identifiés */}
        <div className="p-4 bg-[#F1F5F7] border border-[#D9E2E8] rounded-xl space-y-3">
          <label className="block text-xs font-bold text-[#18243A]">
            Syndromes cliniques prédominants identifiés
          </label>

          <div className="flex flex-wrap gap-2">
            {referenceLists.syndromesFrequents.map((syndrome) => {
              const selected = formData.syndromesIdentifies?.includes(syndrome);
              return (
                <button
                  key={syndrome}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => toggleSyndrome(syndrome)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                    selected
                      ? 'bg-[#10B9A9] text-white border-[#10B9A9]'
                      : 'bg-white text-[#18243A] border-[#D9E2E8] hover:border-[#10B9A9]/60'
                  } ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  {selected && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>{syndrome}</span>
                </button>
              );
            })}
          </div>

          {!isReadOnly && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={customSyndrome}
                onChange={(e) => setCustomSyndrome(e.target.value)}
                placeholder="Ajouter un autre syndrome spécifique..."
                className="text-xs bg-white border border-[#D9E2E8] focus:border-[#10B9A9] rounded-lg px-3 py-1.5 flex-1 focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustom}
                className="px-3 py-1.5 text-xs font-semibold bg-[#ECFBF9] text-[#07988D] hover:bg-[#D9F7F3] rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter
              </button>
            </div>
          )}
        </div>

        {/* Résumé syndromique rédigé */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Texte du résumé syndromique <span className="text-[#F43F5E]">*</span> (Obligatoire pour validation)
          </label>
          <textarea
            rows={6}
            disabled={isReadOnly}
            value={formData.resume}
            onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-3 focus:outline-none leading-relaxed"
            placeholder="Rédiger une observation clinique synthétique articulant terrain, mode d'entrée, stresseurs déclenchants, sémiologie positive et négative, et orientation syndromique globale..."
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8EEF2]">
          <div className="text-[11px] text-[#64748B]">
            * Le résumé syndromique est une condition bloquante de la validation du dossier
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Enregistrer S11
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors flex items-center gap-1.5"
            >
              Suivant (S12)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
