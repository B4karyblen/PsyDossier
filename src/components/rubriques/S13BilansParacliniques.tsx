import React, { useState } from 'react';
import { useRubriqueForm } from '../../lib/useRubriqueForm';
import { activeValues } from '../../utils/referentiels';
import { S13BilansData, BilanItem, ReferenceLists, UserRole } from '../../types';
import { Plus, Trash2, CheckCircle2, FileSpreadsheet, Lock } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S13BilansData;
  isReadOnly: boolean;
  currentUserRole: UserRole;
  currentUserName: string;
  onSave: (data: S13BilansData) => void;
  onNext: () => void;
  onPrev?: () => void;
  referenceLists: ReferenceLists;
}

export const S13BilansParacliniques: React.FC<Props> = ({
  data,
  isReadOnly,
  currentUserRole,
  currentUserName,
  onSave,
  onNext,
  onPrev,
  referenceLists,
}) => {
  const [formData, setFormData, form] = useRubriqueForm<S13BilansData>(data);
  const [isSaved, setIsSaved] = useState(false);

  const canPrescribe = ['PSYCHIATRE', 'ADMIN'].includes(currentUserRole) && !isReadOnly;
  const canEnterResults =
    ['PSYCHIATRE', 'INFIRMIER', 'ADMIN'].includes(currentUserRole) && !isReadOnly;

  const addBilan = (typePreset?: string) => {
    if (!canPrescribe && currentUserRole !== 'INFIRMIER') return;
    const newItem: BilanItem = {
      id: 'bil-' + Date.now(),
      type: typePreset || activeValues(referenceLists, 'typesBilans')[0] || 'NFS, Ionogramme sanguin',
      datePrescription: new Date().toISOString().split('T')[0],
      prescripteur: currentUserName,
      statut: 'Prescrit',
    };
    setFormData({
      ...formData,
      bilans: [...(formData.bilans || []), newItem],
    });
  };

  const removeBilan = (id: string) => {
    if (isReadOnly) return;
    setFormData({
      ...formData,
      bilans: formData.bilans.filter((b) => b.id !== id),
    });
  };

  const updateBilan = (id: string, updates: Partial<BilanItem>) => {
    if (isReadOnly) return;
    // Règle F-16: si un résultat est saisi, basculer automatiquement à 'Résultat reçu'
    if (updates.resultat && updates.resultat.trim().length > 0 && !updates.statut) {
      updates.statut = 'Résultat reçu';
      if (!updates.dateRealisation) {
        updates.dateRealisation = new Date().toISOString().split('T')[0];
      }
    }
    setFormData({
      ...formData,
      bilans: formData.bilans.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              S13 · PARACLINIQUE
            </span>
            <span className="text-xs text-ink-500">Biologie & Imagerie</span>
          </div>
          <h2 className="text-h2 text-ink-900 mt-2">
            Bilans Paracliniques
          </h2>
          <p className="text-base text-ink-500 mt-1">
            Prescription et suivi des examens biologiques, toxicologiques, EEG et imagerie cérébrale
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick Prescription Presets */}
        {canPrescribe && (
          <div className="bg-ink-25 border border-ink-150 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-ink-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-primary-600" />
                Examens Prédéfinis Référencés (Cliquer pour prescrire) :
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeValues(referenceLists, 'typesBilans').map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addBilan(preset)}
                  className="btn-secondary btn-sm"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bilans list */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-ink-900">
              Examens Prescrits ({formData.bilans?.length || 0})
            </span>
            {canPrescribe && (
              <button
                type="button"
                onClick={() => addBilan()}
                className="btn-secondary btn-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Prescrire un examen
              </button>
            )}
          </div>

          {formData.bilans && formData.bilans.length > 0 ? (
            formData.bilans.map((bilan) => (
              <div
                key={bilan.id}
                className="p-5 rounded-lg border border-ink-150 bg-ink-25 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-ink-100 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink-900">{bilan.type}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        bilan.statut === 'Résultat reçu'
                          ? 'bg-emerald-100 text-emerald-700'
                          : bilan.statut === 'Réalisé'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {bilan.statut}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-500">
                      Prescrit le {bilan.datePrescription} par {bilan.prescripteur}
                    </span>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeBilan(bilan.id)}
                        className="p-1 text-ink-400 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                        title="Supprimer ce bilan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">
                      Résultats du laboratoire / imagerie
                    </label>
                    <textarea
                      rows={2}
                      disabled={!canEnterResults}
                      value={bilan.resultat || ''}
                      onChange={(e) => updateBilan(bilan.id, { resultat: e.target.value })}
                      className="clinical-input w-full"
                      placeholder="Valeurs chiffrées, normes, compte-rendu radiologique..."
                    />
                  </div>

                  <div>
                    <label className="field-label">
                      Interprétation clinique & retentissement
                    </label>
                    <textarea
                      rows={2}
                      disabled={!canEnterResults}
                      value={bilan.interpretation || ''}
                      onChange={(e) => updateBilan(bilan.id, { interpretation: e.target.value })}
                      className="clinical-input w-full"
                      placeholder="Bilan biologique rassurant, élimine une cause organique..."
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-ink-25 border border-dashed border-ink-200 rounded-xl text-xs text-ink-500">
              Aucun bilan paraclinique prescrit pour ce patient.
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
          isDirty={form.isDirty}
          onCancel={form.reset}
          currentRubriqueId="s13"
          isReadOnly={isReadOnly}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};
