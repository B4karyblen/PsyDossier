import React, { useState } from 'react';
import { S11ResumeSyndromiqueData, ReferenceLists } from '../../types';
import { AlertCircle, Plus, Check, FileSpreadsheet, Sparkles } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S11ResumeSyndromiqueData;
  isReadOnly: boolean;
  onSave: (data: S11ResumeSyndromiqueData) => void;
  onNext: () => void;
  onPrev?: () => void;
  referenceLists: ReferenceLists;
}

export const S11ResumeSyndromique: React.FC<Props> = ({
  data,
  isReadOnly,
  onSave,
  onNext,
  onPrev,
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
        syndromesIdentifies: current.filter((s) => s !== syndrome),
      });
    } else {
      setFormData({
        ...formData,
        syndromesIdentifies: [...current, syndrome],
      });
    }
  };

  const addCustom = () => {
    if (isReadOnly || !customSyndrome.trim()) return;
    if (!formData.syndromesIdentifies.includes(customSyndrome.trim())) {
      setFormData({
        ...formData,
        syndromesIdentifies: [...formData.syndromesIdentifies, customSyndrome.trim()],
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
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F7]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2.5 py-0.5 rounded-md border border-[#10B9A9]/20">
              S11 · SYNTHÈSE
            </span>
            <span className="text-xs text-[#64748B]">Obligatoire pour validation</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#18243A] tracking-tight mt-1">
            Résumé Syndromique Structuré
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Articulation clinique globale : terrain, stresseurs, sémiologie et constellations syndromiques
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-[#FFE4E6] border border-[#F43F5E]/30 rounded-xl flex items-center gap-2.5 text-xs text-[#BE123C] font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subcard 1: Syndromes Identifiés */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#EDF2F7]">
            <label className="block text-xs font-bold text-[#18243A] uppercase tracking-wider">
              Constellations Syndromiques Identifiées (Cliquer pour sélectionner)
            </label>
            <span className="text-[11px] font-semibold text-[#07988D]">
              {formData.syndromesIdentifies.length} sélectionné(s)
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(referenceLists.syndromesFrequents || []).map((syndrome) => {
              const selected = formData.syndromesIdentifies.includes(syndrome);
              return (
                <button
                  key={syndrome}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => toggleSyndrome(syndrome)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selected
                      ? 'bg-[#10B9A9] text-white shadow-xs scale-102'
                      : 'bg-white text-[#18243A] border border-[#CBD5E1] hover:border-[#10B9A9] hover:bg-[#F0FDFA]'
                  } ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="Ajouter un autre syndrome personnalisé..."
                className="bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-xs font-medium rounded-lg px-3 py-2 flex-1 outline-none text-[#18243A]"
              />
              <button
                type="button"
                onClick={addCustom}
                className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
              >
                + Ajouter
              </button>
            </div>
          )}
        </div>

        {/* Subcard 2: Texte du Résumé Rédigé */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EDF2F7]">
            <FileSpreadsheet className="w-4 h-4 text-[#10B9A9]" />
            <label className="block text-xs font-bold text-[#18243A] uppercase tracking-wider">
              Synthèse & Observation Clinique Finale <span className="text-[#F43F5E]">*</span>
            </label>
          </div>
          <textarea
            rows={6}
            disabled={isReadOnly}
            value={formData.resume}
            onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
            className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-xl p-3.5 focus:outline-none leading-relaxed"
            placeholder="Rédiger une observation clinique synthétique articulant terrain, mode d'entrée, stresseurs déclenchants, sémiologie positive et négative, et orientation syndromique globale..."
          />
          <span className="text-[11px] text-[#64748B] block font-medium">
            Condition bloquante pour la validation officielle du dossier (Règle F-14)
          </span>
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
          currentRubriqueId="s11"
          isReadOnly={isReadOnly}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};
