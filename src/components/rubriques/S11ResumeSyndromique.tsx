import React, { useState } from 'react';
import { useRubriqueForm } from '../../lib/useRubriqueForm';
import { activeValues } from '../../utils/referentiels';
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
  const [formData, setFormData, form] = useRubriqueForm<S11ResumeSyndromiqueData>(data);
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
    <div className="clinical-card p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-ink-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip chip-neutral tabular-nums">
              S11 · SYNTHÈSE
            </span>
            <span className="text-xs text-ink-500">Obligatoire pour validation</span>
          </div>
          <h2 className="text-h2 text-ink-900 mt-2">
            Résumé Syndromique Structuré
          </h2>
          <p className="text-base text-ink-500 mt-1">
            Articulation clinique globale : terrain, stresseurs, sémiologie et constellations syndromiques
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-100 border border-rose-500/30 rounded-lg flex items-center gap-2.5 text-xs text-rose-700 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subcard 1: Syndromes Identifiés */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-ink-100">
            <label className="field-label">
              Constellations Syndromiques Identifiées (Cliquer pour sélectionner)
            </label>
            <span className="text-xs font-semibold text-primary-700">
              {formData.syndromesIdentifies.length} sélectionné(s)
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeValues(referenceLists, 'syndromesFrequents').map((syndrome) => {
              const selected = formData.syndromesIdentifies.includes(syndrome);
              return (
                <button
                  key={syndrome}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => toggleSyndrome(syndrome)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selected
                      ? 'bg-primary-900 text-white'
                      : 'bg-white text-ink-900 border border-ink-200 hover:border-primary-500 hover:bg-primary-50'
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
                className="clinical-input flex-1"
              />
              <button
                type="button"
                onClick={addCustom}
                className="btn-secondary btn-sm"
              >
                + Ajouter
              </button>
            </div>
          )}
        </div>

        {/* Subcard 2: Texte du Résumé Rédigé */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <FileSpreadsheet className="w-4 h-4 text-primary-600" />
            <label className="field-label">
              Synthèse & Observation Clinique Finale <span className="text-rose-500">*</span>
            </label>
          </div>
          <textarea
            rows={6}
            disabled={isReadOnly}
            value={formData.resume}
            onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
            className="clinical-input w-full leading-relaxed"
            placeholder="Rédiger une observation clinique synthétique articulant terrain, mode d'entrée, stresseurs déclenchants, sémiologie positive et négative, et orientation syndromique globale..."
          />
          <span className="text-xs text-ink-500 block font-medium">
            Condition bloquante pour la validation officielle du dossier (Règle F-14)
          </span>
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
          isDirty={form.isDirty}
          onCancel={form.reset}
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
