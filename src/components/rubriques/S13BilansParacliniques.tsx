import React, { useState } from 'react';
import { S13BilansData, BilanItem, ReferenceLists, UserRole } from '../../types';
import { Save, ChevronRight, Plus, Trash2, CheckCircle2, FileSpreadsheet } from 'lucide-react';

interface Props {
  data: S13BilansData;
  isReadOnly: boolean;
  currentUserRole: UserRole;
  currentUserName: string;
  onSave: (data: S13BilansData) => void;
  onNext: () => void;
  referenceLists: ReferenceLists;
}

export const S13BilansParacliniques: React.FC<Props> = ({
  data,
  isReadOnly,
  currentUserRole,
  currentUserName,
  onSave,
  onNext,
  referenceLists,
}) => {
  const [formData, setFormData] = useState<S13BilansData>(data);
  const [isSaved, setIsSaved] = useState(false);

  const canPrescribe = ['PSYCHIATRE', 'ADMIN'].includes(currentUserRole) && !isReadOnly;
  const canEnterResults = ['PSYCHIATRE', 'INFIRMIER', 'ADMIN'].includes(currentUserRole) && !isReadOnly;

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
      bilans: [...(formData.bilans || []), newItem]
    });
  };

  const removeBilan = (id: string) => {
    if (isReadOnly) return;
    setFormData({
      ...formData,
      bilans: formData.bilans.filter(b => b.id !== id)
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
      bilans: formData.bilans.map(b => b.id === id ? { ...b, ...updates } : b)
    });
  };

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
            S13 · EXAMENS PARACLINIQUES
          </span>
          <h2 className="text-base font-bold text-[#18243A] mt-1">
            Bilans paracliniques
          </h2>
          <p className="text-xs text-[#64748B]">
            Prescriptions d’analyses biologiques, imagerie, toxicologie et bilans psychométriques
          </p>
        </div>

        {canPrescribe && (
          <button
            type="button"
            onClick={() => addBilan()}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Prescrire un bilan
          </button>
        )}
      </div>

      {isSaved && (
        <div className="mb-4 p-2.5 bg-[#DCFCE7] border border-[#10B981]/30 rounded-lg text-xs text-[#15803D] font-medium flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          Bilans paracliniques mis à jour avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Presets rapides */}
        {canPrescribe && (
          <div className="p-3 bg-[#F1F5F7] border border-[#D9E2E8] rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-[#18243A] uppercase tracking-wider block">
              Prescription rapide de bilans usuels
            </span>
            <div className="flex flex-wrap gap-1.5">
              {referenceLists.typesBilans.slice(0, 5).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addBilan(type)}
                  className="text-[11px] px-2.5 py-1 bg-white hover:bg-[#ECFBF9] text-[#18243A] hover:text-[#07988D] border border-[#D9E2E8] rounded-md transition-colors"
                >
                  + {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Liste des bilans */}
        <div className="space-y-3">
          {formData.bilans && formData.bilans.length > 0 ? (
            formData.bilans.map((bilan, idx) => (
              <div
                key={bilan.id}
                className="p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E8EEF2]">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-[#07988D]" />
                    <span className="text-xs font-bold text-[#18243A]">
                      Bilan #{idx + 1}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      Prescrit le {bilan.datePrescription} par {bilan.prescripteur}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      disabled={!canEnterResults}
                      value={bilan.statut}
                      onChange={(e) => updateBilan(bilan.id, { statut: e.target.value as any })}
                      className={`text-xs font-semibold rounded-lg px-2.5 py-1 border ${
                        bilan.statut === 'Résultat reçu'
                          ? 'bg-[#DCFCE7] text-[#15803D] border-[#10B981]/30'
                          : bilan.statut === 'Réalisé'
                          ? 'bg-[#FEF3C7] text-[#B45309] border-[#F59E0B]/30'
                          : 'bg-[#F1F5F7] text-[#64748B] border-[#D9E2E8]'
                      }`}
                    >
                      <option value="Prescrit">Prescrit</option>
                      <option value="Réalisé">Réalisé (En attente résultat)</option>
                      <option value="Résultat reçu">Résultat reçu</option>
                    </select>

                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeBilan(bilan.id)}
                        className="text-[#BE123C] hover:bg-[#FFE4E6] p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                      Intitulé de l'examen
                    </label>
                    <input
                      type="text"
                      disabled={!canPrescribe}
                      value={bilan.type}
                      onChange={(e) => updateBilan(bilan.id, { type: e.target.value })}
                      className="w-full bg-white border border-[#D9E2E8] text-xs font-semibold rounded-lg px-3 py-1.5"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                      Date de réalisation
                    </label>
                    <input
                      type="date"
                      disabled={!canEnterResults}
                      value={bilan.dateRealisation || ''}
                      onChange={(e) => updateBilan(bilan.id, { dateRealisation: e.target.value })}
                      className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                      Résultats bruts (Valeurs chiffrées, NFS, Ionogramme, Toxicologie...)
                    </label>
                    <textarea
                      rows={2}
                      disabled={!canEnterResults}
                      value={bilan.resultat || ''}
                      onChange={(e) => updateBilan(bilan.id, { resultat: e.target.value })}
                      className="w-full bg-white border border-[#D9E2E8] focus:border-[#10B9A9] text-xs font-mono rounded-lg p-2.5 focus:outline-none"
                      placeholder="Saisir les chiffres ou conclusions du laboratoire..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                      Interprétation clinique & retentissement
                    </label>
                    <textarea
                      rows={2}
                      disabled={!canEnterResults}
                      value={bilan.interpretation || ''}
                      onChange={(e) => updateBilan(bilan.id, { interpretation: e.target.value })}
                      className="w-full bg-white border border-[#D9E2E8] focus:border-[#10B9A9] text-xs rounded-lg p-2.5 focus:outline-none"
                      placeholder="Bilan biologique rassurant, élimine une cause organique..."
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-[#F8FAFC] border border-dashed border-[#D9E2E8] rounded-xl text-xs text-[#64748B]">
              Aucun bilan paraclinique prescrit pour ce patient.
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8EEF2]">
          <div className="text-[11px] text-[#64748B]">
            Les infirmiers et médecins peuvent saisir les résultats de laboratoire
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Enregistrer S13
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors flex items-center gap-1.5"
            >
              Suivant (S14)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
