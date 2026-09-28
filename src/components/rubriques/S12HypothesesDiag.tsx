import React, { useState } from 'react';
import { S12HypothesesDiagData, HypotheseDiagnostiqueItem, ReferenceLists, UserRole } from '../../types';
import { Save, ChevronRight, Plus, Trash2, AlertCircle, Lock } from 'lucide-react';

interface Props {
  data: S12HypothesesDiagData;
  isReadOnly: boolean;
  currentUserRole: UserRole;
  onSave: (data: S12HypothesesDiagData) => void;
  onNext: () => void;
  referenceLists: ReferenceLists;
}

export const S12HypothesesDiag: React.FC<Props> = ({
  data,
  isReadOnly,
  currentUserRole,
  onSave,
  onNext,
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
      hypotheses: [...(formData.hypotheses || []), newItem]
    });
  };

  const removeHypothese = (id: string) => {
    if (effectiveReadOnly) return;
    setFormData({
      ...formData,
      hypotheses: formData.hypotheses.filter(h => h.id !== id)
    });
  };

  const updateHypothese = (id: string, updates: Partial<HypotheseDiagnostiqueItem>) => {
    if (effectiveReadOnly) return;
    // Si on met 'Principale', les autres doivent passer en 'Différentielle'
    if (updates.type === 'Principale') {
      setFormData({
        ...formData,
        hypotheses: formData.hypotheses.map(h => {
          if (h.id === id) return { ...h, ...updates };
          return { ...h, type: 'Différentielle' };
        })
      });
    } else {
      setFormData({
        ...formData,
        hypotheses: formData.hypotheses.map(h => h.id === id ? { ...h, ...updates } : h)
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hypotheses || formData.hypotheses.length === 0) {
      setError('Veuillez ajouter au moins une hypothèse diagnostique.');
      return;
    }
    const hasPrincipale = formData.hypotheses.some(h => h.type === 'Principale');
    if (!hasPrincipale) {
      setError('Une hypothèse diagnostique doit obligatoirement être désignée comme « Principale ».');
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
            S12 · SYNTHÈSE DIAGNOSTIQUE
          </span>
          <h2 className="text-base font-bold text-[#18243A] mt-1 flex items-center gap-2">
            <span>Hypothèses diagnostiques</span>
            {!isPsychiatre && <Lock className="w-4 h-4 text-[#94A3B8]" />}
          </h2>
          <p className="text-xs text-[#64748B]">
            Règle BR-014 : Réservé exclusivement au médecin psychiatre responsable
          </p>
        </div>

        {!isPsychiatre && (
          <span className="text-xs font-semibold px-2.5 py-1 bg-[#FEF3C7] text-[#B45309] rounded-lg">
            Consultation en lecture seule
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#FFE4E6] border border-[#F43F5E]/30 rounded-lg flex items-center gap-2 text-xs text-[#BE123C]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isSaved && (
        <div className="mb-4 p-2.5 bg-[#DCFCE7] border border-[#10B981]/30 rounded-lg text-xs text-[#15803D] font-medium">
          Hypothèses diagnostiques enregistrées avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Quick diagnosis presets from CIM-10 */}
        {!effectiveReadOnly && (
          <div className="p-3 bg-[#F1F5F7] border border-[#D9E2E8] rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-[#18243A] uppercase tracking-wider block">
              Suggestions diagnostiques fréquentes (CIM-10)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {referenceLists.diagnosticClassifications.slice(0, 6).map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => addHypothese(item)}
                  className="text-[11px] px-2 py-1 bg-white hover:bg-[#ECFBF9] text-[#18243A] hover:text-[#07988D] border border-[#D9E2E8] rounded-md transition-colors"
                >
                  <span className="font-mono font-bold text-[#07988D] mr-1">{item.code}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hypotheses List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#18243A]">
              Hypothèses retenues ({formData.hypotheses?.length || 0})
            </label>
            {!effectiveReadOnly && (
              <button
                type="button"
                onClick={() => addHypothese()}
                className="text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
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
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  hyp.type === 'Principale'
                    ? 'border-[#10B9A9] bg-[#ECFBF9]/40'
                    : 'border-[#D9E2E8] bg-white'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#64748B]">#{index + 1}</span>
                    <select
                      disabled={effectiveReadOnly}
                      value={hyp.type}
                      onChange={(e) => updateHypothese(hyp.id, { type: e.target.value as 'Principale' | 'Différentielle' })}
                      className={`text-xs font-bold rounded-lg px-2.5 py-1 border ${
                        hyp.type === 'Principale'
                          ? 'bg-[#10B9A9] text-white border-[#10B9A9]'
                          : 'bg-[#F1F5F7] text-[#18243A] border-[#D9E2E8]'
                      }`}
                    >
                      <option value="Principale">Principale (Prioritaire)</option>
                      <option value="Différentielle">Différentielle</option>
                    </select>
                  </div>

                  {!effectiveReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeHypothese(hyp.id)}
                      className="text-xs text-[#BE123C] hover:bg-[#FFE4E6] px-2 py-1 rounded flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                      Code CIM-10 / DSM-5
                    </label>
                    <input
                      type="text"
                      disabled={effectiveReadOnly}
                      value={hyp.codeCimDsm || ''}
                      onChange={(e) => updateHypothese(hyp.id, { codeCimDsm: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#D9E2E8] font-mono text-xs rounded-lg px-3 py-1.5 uppercase"
                      placeholder="Ex: F20.0"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                      Intitulé nosologique / Diagnostic <span className="text-[#F43F5E]">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={effectiveReadOnly}
                      value={hyp.libelle}
                      onChange={(e) => updateHypothese(hyp.id, { libelle: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#D9E2E8] text-xs font-semibold text-[#18243A] rounded-lg px-3 py-1.5"
                      placeholder="Ex: Schizophrénie paranoïde ou Bouffée délirante aiguë polymorphe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                    Arguments cliniques & justification sémiologique
                  </label>
                  <textarea
                    rows={2}
                    disabled={effectiveReadOnly}
                    value={hyp.argumentsCliniques}
                    onChange={(e) => updateHypothese(hyp.id, { argumentsCliniques: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#D9E2E8] text-xs rounded-lg p-2.5 focus:outline-none"
                    placeholder="Critères remplis, durée des symptômes, évolution prévisible, arguments en faveur..."
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center bg-[#F8FAFC] border border-dashed border-[#D9E2E8] rounded-xl text-xs text-[#64748B]">
              Aucune hypothèse diagnostique enregistrée.
              {!effectiveReadOnly && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => addHypothese()}
                    className="text-xs font-semibold text-[#07988D] underline"
                  >
                    Ajouter une première hypothèse
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8EEF2]">
          <div className="text-[11px] text-[#64748B]">
            * Au moins une hypothèse Principale requise pour la validation
          </div>

          <div className="flex items-center gap-2">
            {!effectiveReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Enregistrer S12
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors flex items-center gap-1.5"
            >
              Suivant (S13)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
