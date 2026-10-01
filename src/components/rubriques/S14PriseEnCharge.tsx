import React, { useState } from 'react';
import { S14PriseEnChargeData, PrescriptionItem, UserRole } from '../../types';
import { Plus, Trash2, AlertCircle, Pill, Building2, HeartHandshake, Lock } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S14PriseEnChargeData;
  isReadOnly: boolean;
  currentUserRole: UserRole;
  currentUserName: string;
  onSave: (data: S14PriseEnChargeData) => void;
  onNext: () => void;
  onPrev?: () => void;
}

export const S14PriseEnCharge: React.FC<Props> = ({
  data,
  isReadOnly,
  currentUserRole,
  currentUserName,
  onSave,
  onNext,
  onPrev,
}) => {

  const [formData, setFormData] = useState<S14PriseEnChargeData>(data);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const isPsychiatre = currentUserRole === 'PSYCHIATRE';
  const isPsychologue = currentUserRole === 'PSYCHOLOGUE';
  const canPrescribeRx = isPsychiatre && !isReadOnly;
  const canEditPsychotherapy = (isPsychiatre || isPsychologue) && !isReadOnly;

  const addPrescription = () => {
    if (!canPrescribeRx) return;
    const newItem: PrescriptionItem = {
      id: 'rx-' + Date.now(),
      molecule: '',
      posologie: '',
      voie: 'Orale',
      frequence: '1 prise par jour',
      dateDebut: new Date().toISOString().split('T')[0],
      prescripteur: currentUserName,
    };
    setFormData({
      ...formData,
      traitementMedicamenteux: [...(formData.traitementMedicamenteux || []), newItem]
    });
  };

  const removePrescription = (id: string) => {
    if (!canPrescribeRx) return;
    setFormData({
      ...formData,
      traitementMedicamenteux: formData.traitementMedicamenteux.filter(p => p.id !== id)
    });
  };

  const updatePrescription = (id: string, updates: Partial<PrescriptionItem>) => {
    if (!canPrescribeRx) return;
    setFormData({
      ...formData,
      traitementMedicamenteux: formData.traitementMedicamenteux.map(p => p.id === id ? { ...p, ...updates } : p)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orientation) {
      setError('L’orientation du patient (Ambulatoire ou Hospitalisation) est obligatoire (BR-009).');
      return;
    }
    setError(null);
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="clinical-card p-5 sm:p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-ink-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip chip-neutral tabular-nums">
              S14 · PRISE EN CHARGE
            </span>
            <span className="text-xs text-ink-500">Obligatoire pour validation</span>
          </div>
          <h2 className="text-h2 text-ink-900 mt-2">
            Prise en Charge Thérapeutique
          </h2>
          <p className="text-base text-ink-500 mt-1">
            Orientation clinique (BR-009), prescriptions pharmacologiques (BR-014) et stratégie psychothérapeutique
          </p>
        </div>
      </div>


      {error && (
        <div className="mb-4 p-3 bg-rose-100 border border-rose-500/30 rounded-lg flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isSaved && (
        <div className="mb-4 p-2.5 bg-emerald-100 border border-emerald-500/30 rounded-lg text-xs text-emerald-700 font-medium">
          Prise en charge enregistrée avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Orientation du patient (BR-009: Ambulatoire vs Hospitalisation exclusif) */}
        <div>
          <label className="field-label flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-primary-700" />
            Orientation du patient <span className="text-rose-500">*</span> (BR-009)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                id: 'Ambulatoire' as const,
                title: 'Suivi Ambulatoire',
                desc: 'Consultations externes, CMP, hôpital de jour'
              },
              {
                id: 'Hospitalisation' as const,
                title: 'Hospitalisation complète',
                desc: 'Unité d’admission, soins intensifs de psychiatrie'
              }
            ].map((option) => (
              <label
                key={option.id}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                  formData.orientation === option.id
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
                    : 'border-ink-150 bg-ink-25 hover:border-primary-500/50'
                } ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                <input
                  type="radio"
                  name="orientation"
                  disabled={isReadOnly}
                  checked={formData.orientation === option.id}
                  onChange={() => setFormData({ ...formData, orientation: option.id })}
                  className="mt-0.5 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-xs font-bold text-ink-900 block">{option.title}</span>
                  <span className="text-xs text-ink-500">{option.desc}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Details si Hospitalisation */}
          {formData.orientation === 'Hospitalisation' && (
            <div className="mt-3 p-4 bg-ink-100 border border-ink-150 rounded-lg space-y-3">
              <span className="text-xs font-bold text-ink-900 block">
                Détails de l'admission en hospitalisation
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="field-label">
                    Service hospitalier
                  </label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={formData.hospitalisationDetails?.service || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hospitalisationDetails: { ...formData.hospitalisationDetails, service: e.target.value }
                    })}
                    className="clinical-input w-full"
                    placeholder="Ex: Unité de soins de crise"
                  />
                </div>
                <div>
                  <label className="field-label">
                    Lit / Chambre
                  </label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={formData.hospitalisationDetails?.lit || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hospitalisationDetails: { ...formData.hospitalisationDetails, lit: e.target.value }
                    })}
                    className="clinical-input w-full"
                    placeholder="Ex: Chambre 104"
                  />
                </div>
                <div>
                  <label className="field-label">
                    Date d'entrée
                  </label>
                  <input
                    type="date"
                    disabled={isReadOnly}
                    value={formData.hospitalisationDetails?.dateEntree || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hospitalisationDetails: { ...formData.hospitalisationDetails, dateEntree: e.target.value }
                    })}
                    className="clinical-input w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Traitement médicamenteux (BR-014: Psychiatre only) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-ink-100">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-primary-700" />
              <h3 className="text-base font-bold text-ink-900">
                Prescriptions médicamenteuses
              </h3>
              {!isPsychiatre && (
                <span className="text-xs font-mono text-ink-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Réservé Médecin Psychiatre
                </span>
              )}
            </div>

            {canPrescribeRx && (
              <button
                type="button"
                onClick={addPrescription}
                className="btn-primary btn-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter une molécule
              </button>
            )}
          </div>

          {formData.traitementMedicamenteux && formData.traitementMedicamenteux.length > 0 ? (
            <div className="space-y-3">
              {formData.traitementMedicamenteux.map((rx, idx) => (
                <div key={rx.id} className="p-3.5 bg-ink-25 border border-ink-150 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink-900">Prescription #{idx + 1}</span>
                    {canPrescribeRx && (
                      <button
                        type="button"
                        onClick={() => removePrescription(rx.id)}
                        className="text-xs text-rose-700 hover:bg-rose-100 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="field-label">
                        Molécule & Forme
                      </label>
                      <input
                        type="text"
                        disabled={!canPrescribeRx}
                        value={rx.molecule}
                        onChange={(e) => updatePrescription(rx.id, { molecule: e.target.value })}
                        className="clinical-input w-full"
                        placeholder="Ex: Olanzapine 10mg ou Risperidone 2mg"
                      />
                    </div>

                    <div>
                      <label className="field-label">
                        Posologie & Fréquence
                      </label>
                      <input
                        type="text"
                        disabled={!canPrescribeRx}
                        value={rx.posologie}
                        onChange={(e) => updatePrescription(rx.id, { posologie: e.target.value })}
                        className="clinical-input w-full"
                        placeholder="Ex: 1 cp le soir"
                      />
                    </div>

                    <div>
                      <label className="field-label">
                        Voie d'administration
                      </label>
                      <select
                        disabled={!canPrescribeRx}
                        value={rx.voie}
                        onChange={(e) => updatePrescription(rx.id, { voie: e.target.value as any })}
                        className="clinical-input w-full"
                      >
                        <option value="Orale">Orale</option>
                        <option value="Injectable IM">Injectable IM</option>
                        <option value="Injectable IV">Injectable IV</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="field-label">
                        Date début
                      </label>
                      <input
                        type="date"
                        disabled={!canPrescribeRx}
                        value={rx.dateDebut}
                        onChange={(e) => updatePrescription(rx.id, { dateDebut: e.target.value })}
                        className="clinical-input w-full"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="field-label">
                        Remarques de surveillance clinique (NFS, glycémie, ECG...)
                      </label>
                      <input
                        type="text"
                        disabled={!canPrescribeRx}
                        value={rx.remarques || ''}
                        onChange={(e) => updatePrescription(rx.id, { remarques: e.target.value })}
                        className="clinical-input w-full"
                        placeholder="Surveillance hématologique, surveillance du poids..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-ink-25 border border-dashed border-ink-150 rounded-lg text-xs text-ink-500">
              Aucun traitement médicamenteux prescrit.
            </div>
          )}
        </div>

        {/* 3. Psychothérapie (Psychologue & Psychiatre) */}
        <div className="p-4 bg-ink-25 border border-ink-150 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-violet-500" />
            <h3 className="text-base font-bold text-ink-900">
              Prise en charge psychothérapeutique
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="field-label">
                Type de psychothérapie
              </label>
              <input
                type="text"
                disabled={!canEditPsychotherapy}
                value={formData.psychotherapie?.type || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  psychotherapie: { ...formData.psychotherapie, type: e.target.value }
                })}
                className="clinical-input w-full"
                placeholder="Ex: TCC, psychothérapie de soutien, systémique..."
              />
            </div>

            <div>
              <label className="field-label">
                Fréquence des séances
              </label>
              <input
                type="text"
                disabled={!canEditPsychotherapy}
                value={formData.psychotherapie?.frequence || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  psychotherapie: { ...formData.psychotherapie, frequence: e.target.value }
                })}
                className="clinical-input w-full"
                placeholder="Ex: 1 séance par semaine"
              />
            </div>

            <div>
              <label className="field-label">
                Thérapeute référent
              </label>
              <input
                type="text"
                disabled={!canEditPsychotherapy}
                value={formData.psychotherapie?.therapeute || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  psychotherapie: { ...formData.psychotherapie, therapeute: e.target.value }
                })}
                className="clinical-input w-full"
                placeholder="Nom du psychologue / psychiatre"
              />
            </div>
          </div>

          <div>
            <label className="field-label">
              Objectifs thérapeutiques ciblés
            </label>
            <input
              type="text"
              disabled={!canEditPsychotherapy}
              value={formData.psychotherapie?.objectifs || ''}
              onChange={(e) => setFormData({
                ...formData,
                psychotherapie: { ...formData.psychotherapie, objectifs: e.target.value }
              })}
              className="clinical-input w-full"
              placeholder="Ex: Restauration de l'estime de soi, travail sur le deuil..."
            />
          </div>
        </div>

        {/* Action buttons */}
        <RubriqueFooterNav
          currentRubriqueId="s14"
          isReadOnly={isReadOnly}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};

