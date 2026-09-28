import React, { useState } from 'react';
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
  const [formData, setFormData] = useState<S12HypothesesDiagData>(data);
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
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F7]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2.5 py-0.5 rounded-md border border-[#10B9A9]/20">
              S12 · SYNTHÈSE
            </span>
            <span className="text-xs text-[#64748B]">Obligatoire pour validation</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#18243A] tracking-tight mt-1">
            Hypothèses Diagnostiques (CIM-10 / DSM-5)
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Diagnostic principal et diagnostics différentiels argumentés (BR-014 : exclusivité Psychiatre)
          </p>
        </div>
      </div>

      {!isPsychiatre && (
        <div className="p-3 bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#B45309] rounded-xl text-xs font-semibold flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span>
            Règle BR-014 : La formulation des hypothèses diagnostiques est réservée au Médecin Psychiatre (lecture seule pour {currentUserRole}).
          </span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-[#FFE4E6] border border-[#F43F5E]/30 rounded-xl flex items-center gap-2.5 text-xs text-[#BE123C] font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick CIM-10 Presets from Referentiels */}
        {!effectiveReadOnly && (
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#18243A] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#10B9A9]" />
                Nomenclatures CIM-10 Fréquentes (Cliquer pour insérer) :
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {referenceLists.diagnosticClassifications.slice(0, 10).map((preset) => (
                <button
                  key={preset.code}
                  type="button"
                  onClick={() => addHypothese(preset)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-[#ECFBF9] text-[#18243A] hover:text-[#07988D] border border-[#CBD5E1] hover:border-[#10B9A9] rounded-lg transition-all cursor-pointer shadow-2xs"
                >
                  <span className="font-mono text-[10px] text-[#07988D] mr-1">[{preset.code}]</span>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hypotheses List */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              Diagnostics Formalisés ({formData.hypotheses?.length || 0})
            </span>
            {!effectiveReadOnly && (
              <button
                type="button"
                onClick={() => addHypothese()}
                className="px-3 py-1.5 text-xs font-bold text-[#07988D] bg-[#ECFBF9] hover:bg-[#D9F7F3] border border-[#10B9A9]/30 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
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
                className={`p-5 rounded-2xl border transition-all ${
                  hyp.type === 'Principale'
                    ? 'bg-[#F0FDFA]/40 border-[#10B9A9]/50 shadow-xs'
                    : 'bg-[#F8FAFC] border-[#E2E8F0]'
                }`}
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EDF2F7] gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-[#CBD5E1] text-[#18243A]">
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
                          ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                          : 'bg-white text-[#64748B] border-[#CBD5E1]'
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
                      className="p-1.5 text-[#94A3B8] hover:text-[#BE123C] hover:bg-[#FFE4E6] rounded-lg transition-colors cursor-pointer"
                      title="Supprimer cette hypothèse"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-[#18243A] mb-1">
                      Code CIM-10 / DSM-5
                    </label>
                    <input
                      type="text"
                      disabled={effectiveReadOnly}
                      value={hyp.codeCimDsm || ''}
                      onChange={(e) => updateHypothese(hyp.id, { codeCimDsm: e.target.value.toUpperCase() })}
                      className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-xs font-mono font-bold rounded-lg px-3 py-2 uppercase"
                      placeholder="Ex: F20.0"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-[#18243A] mb-1">
                      Libellé nosologique / Diagnostic <span className="text-[#F43F5E]">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={effectiveReadOnly}
                      value={hyp.libelle}
                      onChange={(e) => updateHypothese(hyp.id, { libelle: e.target.value })}
                      className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-xs font-bold text-[#18243A] rounded-lg px-3 py-2"
                      placeholder="Ex: Schizophrénie paranoïde"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-semibold text-[#18243A] mb-1">
                    Arguments cliniques & critères remplis
                  </label>
                  <textarea
                    rows={2}
                    disabled={effectiveReadOnly}
                    value={hyp.argumentsCliniques}
                    onChange={(e) => updateHypothese(hyp.id, { argumentsCliniques: e.target.value })}
                    className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-xs font-medium rounded-lg p-3 focus:outline-none"
                    placeholder="Critères remplis, durée des symptômes, évolution, arguments en faveur..."
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-2xl text-xs text-[#64748B] space-y-2">
              <Stethoscope className="w-8 h-8 text-[#94A3B8] mx-auto" />
              <p>Aucune hypothèse diagnostique formalisée pour le moment.</p>
              {!effectiveReadOnly && (
                <button
                  type="button"
                  onClick={() => addHypothese()}
                  className="px-3 py-1.5 text-xs font-bold text-[#07988D] bg-[#ECFBF9] hover:bg-[#D9F7F3] rounded-lg transition-colors cursor-pointer"
                >
                  + Ajouter une première hypothèse
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
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
