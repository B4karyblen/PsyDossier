import React, { useState } from 'react';
import { useRubriqueForm } from '../../lib/useRubriqueForm';
import { activeClassifications } from '../../utils/referentiels';
import { S12HypothesesDiagData, HypotheseDiagnostiqueItem, ReferenceLists, UserRole } from '../../types';
import { Plus, Trash2, AlertCircle, Lock, BookOpen, Stethoscope, Sparkles } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S12HypothesesDiagData;
  isReadOnly: boolean;
  currentUserRole: UserRole;
  onSave: (data: S12HypothesesDiagData) => void;
  onNext: () => void;
  onPrev?: () => void;
  referenceLists: ReferenceLists;
}

export const S12HypothesesDiag: React.FC<Props> = ({
  data,
  isReadOnly,
  currentUserRole,
  onSave,
  onNext,
  onPrev,
  referenceLists,
}) => {
  const [formData, setFormData, form] = useRubriqueForm<S12HypothesesDiagData>(data);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // BR-014: Seul le Psychiatre peut rédiger les hypothèses diagnostiques
  const isPsychiatre = currentUserRole === 'PSYCHIATRE';
  const effectiveReadOnly = isReadOnly || !isPsychiatre;

  const addHypothese = (preset?: { code: string; label: string }) => {
    if (effectiveReadOnly) return;
    const hasAny = (formData.hypotheses || []).length > 0;
    const newItem: HypotheseDiagnostiqueItem = {
      id: 'hyp-' + Date.now(),
      type: hasAny ? 'Différentielle' : 'Principale',
      codeCimDsm: preset?.code || '',
      libelle: preset?.label || '',
      argumentsCliniques: '',
    };
    setFormData({
      ...formData,
      hypotheses: [...(formData.hypotheses || []), newItem],
    });
  };

  const removeHypothese = (id: string) => {
    if (effectiveReadOnly) return;
    setFormData({
      ...formData,
      hypotheses: formData.hypotheses.filter((h) => h.id !== id),
    });
  };

  const updateHypothese = (id: string, partial: Partial<HypotheseDiagnostiqueItem>) => {
    if (effectiveReadOnly) return;
    setFormData({
      ...formData,
      hypotheses: formData.hypotheses.map((h) => (h.id === id ? { ...h, ...partial } : h)),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveReadOnly) return;

    if (!formData.hypotheses || formData.hypotheses.length === 0) {
      setError('Au moins une hypothèse diagnostique doit être formalisée.');
      return;
    }

    const hasPrincipale = formData.hypotheses.some((h) => h.type === 'Principale');
    if (!hasPrincipale) {
      setError('Une hypothèse diagnostique Principale est obligatoire.');
      return;
    }

    const emptyLibelle = formData.hypotheses.some((h) => !h.libelle.trim());
    if (emptyLibelle) {
      setError('Toutes les hypothèses doivent posséder un intitulé ou code CIM-10 / DSM-5.');
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
              S12 · SYNTHÈSE
            </span>
            <span className="text-xs text-ink-500">Obligatoire pour validation</span>
          </div>
          <h2 className="text-h2 text-ink-900 mt-2">
            Hypothèses Diagnostiques (CIM-10 / DSM-5)
          </h2>
          <p className="text-base text-ink-500 mt-1">
            Diagnostic principal et diagnostics différentiels argumentés (BR-014 : exclusivité Psychiatre)
          </p>
        </div>
      </div>

      {!isPsychiatre && (
        <div className="p-3 bg-amber-100 border border-amber-500/30 text-amber-700 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span>
            Règle BR-014 : La formulation des hypothèses diagnostiques est réservée au Médecin Psychiatre (lecture seule pour {currentUserRole}).
          </span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-100 border border-rose-500/30 rounded-lg flex items-center gap-2.5 text-xs text-rose-700 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick CIM-10 Presets from Referentiels */}
        {!effectiveReadOnly && (
          <div className="bg-ink-25 border border-ink-150 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-ink-900 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary-600" />
                Nomenclatures CIM-10 Fréquentes (Cliquer pour insérer) :
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeClassifications(referenceLists).slice(0, 10).map((preset) => (
                <button
                  key={preset.code}
                  type="button"
                  onClick={() => addHypothese(preset)}
                  className="btn-secondary btn-sm"
                >
                  <span className="font-mono text-xs text-primary-700 mr-1">[{preset.code}]</span>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hypotheses List */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-ink-900">
              Diagnostics Formalisés ({formData.hypotheses?.length || 0})
            </span>
            {!effectiveReadOnly && (
              <button
                type="button"
                onClick={() => addHypothese()}
                className="btn-secondary btn-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter une hypothèse
              </button>
            )}
          </div>

          {formData.hypotheses && formData.hypotheses.length > 0 ? (
            formData.hypotheses.map((hyp, index) => (
              <div
                key={hyp.id}
                className={`p-5 rounded-xl border transition-all ${
                  hyp.type === 'Principale'
                    ? 'bg-primary-50/40 border-primary-500/50 shadow-xs'
                    : 'bg-ink-25 border-ink-150'
                }`}
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-ink-100 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-ink-200 text-ink-900">
                      #{index + 1}
                    </span>
                    <select
                      disabled={effectiveReadOnly}
                      value={hyp.type}
                      onChange={(e) =>
                        updateHypothese(hyp.id, {
                          type: e.target.value as 'Principale' | 'Différentielle',
                        })
                      }
                      className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors ${
                        hyp.type === 'Principale'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                          : 'bg-white text-ink-500 border-ink-200'
                      }`}
                    >
                      <option value="Principale">Hypothèse Principale</option>
                      <option value="Différentielle">Diagnostic Différentiel</option>
                    </select>
                  </div>

                  {!effectiveReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeHypothese(hyp.id)}
                      className="p-1.5 text-ink-400 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                      title="Supprimer cette hypothèse"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-1">
                    <label className="field-label">
                      Code CIM-10 / DSM-5
                    </label>
                    <input
                      type="text"
                      disabled={effectiveReadOnly}
                      value={hyp.codeCimDsm || ''}
                      onChange={(e) => updateHypothese(hyp.id, { codeCimDsm: e.target.value.toUpperCase() })}
                      className="clinical-input w-full font-mono uppercase"
                      placeholder="Ex: F20.0"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="field-label">
                      Libellé nosologique / Diagnostic <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={effectiveReadOnly}
                      value={hyp.libelle}
                      onChange={(e) => updateHypothese(hyp.id, { libelle: e.target.value })}
                      className="clinical-input w-full"
                      placeholder="Ex: Schizophrénie paranoïde"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="field-label">
                    Arguments cliniques & critères remplis
                  </label>
                  <textarea
                    rows={2}
                    disabled={effectiveReadOnly}
                    value={hyp.argumentsCliniques}
                    onChange={(e) => updateHypothese(hyp.id, { argumentsCliniques: e.target.value })}
                    className="clinical-input w-full"
                    placeholder="Critères remplis, durée des symptômes, évolution, arguments en faveur..."
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-ink-25 border border-dashed border-ink-200 rounded-xl text-xs text-ink-500 space-y-2">
              <Stethoscope className="w-8 h-8 text-ink-400 mx-auto" />
              <p>Aucune hypothèse diagnostique formalisée pour le moment.</p>
              {!effectiveReadOnly && (
                <button
                  type="button"
                  onClick={() => addHypothese()}
                  className="px-3 py-1.5 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors cursor-pointer"
                >
                  + Ajouter une première hypothèse
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
          isDirty={form.isDirty}
          onCancel={form.reset}
          currentRubriqueId="s12"
          isReadOnly={effectiveReadOnly}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};
