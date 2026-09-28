import React, { useState } from 'react';
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
  const [formData, setFormData] = useState<S13BilansData>(data);
  const [isSaved, setIsSaved] = useState(false);

  const canPrescribe = ['PSYCHIATRE', 'ADMIN'].includes(currentUserRole) && !isReadOnly;
  const canEnterResults =
    ['PSYCHIATRE', 'INFIRMIER', 'ADMIN'].includes(currentUserRole) && !isReadOnly;

  const addBilan = (typePreset?: string) => {
    if (!canPrescribe && currentUserRole !== 'INFIRMIER') return;
    const newItem: BilanItem = {
      id: 'bil-' + Date.now(),
      type: typePreset || referenceLists.typesBilans[0] || 'NFS, Ionogramme sanguin',
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
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F7]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2.5 py-0.5 rounded-md border border-[#10B9A9]/20">
              S13 · PARACLINIQUE
            </span>
            <span className="text-xs text-[#64748B]">Biologie & Imagerie</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#18243A] tracking-tight mt-1">
            Bilans Paracliniques
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Prescription et suivi des examens biologiques, toxicologiques, EEG et imagerie cérébrale
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick Prescription Presets */}
        {canPrescribe && (
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#18243A] uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B9A9]" />
                Examens Prédéfinis Référencés (Cliquer pour prescrire) :
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(referenceLists.typesBilans || []).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addBilan(preset)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-[#ECFBF9] text-[#18243A] hover:text-[#07988D] border border-[#CBD5E1] hover:border-[#10B9A9] rounded-lg transition-all cursor-pointer shadow-2xs"
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
            <span className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              Examens Prescrits ({formData.bilans?.length || 0})
            </span>
            {canPrescribe && (
              <button
                type="button"
                onClick={() => addBilan()}
                className="px-3 py-1.5 text-xs font-bold text-[#07988D] bg-[#ECFBF9] hover:bg-[#D9F7F3] border border-[#10B9A9]/30 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
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
                className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EDF2F7] gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#18243A]">{bilan.type}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        bilan.statut === 'Résultat reçu'
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : bilan.statut === 'Réalisé'
                          ? 'bg-[#E0E7FF] text-[#4338CA]'
                          : 'bg-[#FEF3C7] text-[#B45309]'
                      }`}
                    >
                      {bilan.statut}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#64748B]">
                      Prescrit le {bilan.datePrescription} par {bilan.prescripteur}
                    </span>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeBilan(bilan.id)}
                        className="p-1 text-[#94A3B8] hover:text-[#BE123C] rounded-lg transition-colors cursor-pointer"
                        title="Supprimer ce bilan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#18243A] mb-1">
                      Résultats du laboratoire / imagerie
                    </label>
                    <textarea
                      rows={2}
                      disabled={!canEnterResults}
                      value={bilan.resultat || ''}
                      onChange={(e) => updateBilan(bilan.id, { resultat: e.target.value })}
                      className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-xs font-medium rounded-lg p-2.5 focus:outline-none"
                      placeholder="Valeurs chiffrées, normes, compte-rendu radiologique..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#18243A] mb-1">
                      Interprétation clinique & retentissement
                    </label>
                    <textarea
                      rows={2}
                      disabled={!canEnterResults}
                      value={bilan.interpretation || ''}
                      onChange={(e) => updateBilan(bilan.id, { interpretation: e.target.value })}
                      className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-xs font-medium rounded-lg p-2.5 focus:outline-none"
                      placeholder="Bilan biologique rassurant, élimine une cause organique..."
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-2xl text-xs text-[#64748B]">
              Aucun bilan paraclinique prescrit pour ce patient.
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
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
