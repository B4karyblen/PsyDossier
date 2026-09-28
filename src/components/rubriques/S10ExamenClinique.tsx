import React, { useState } from 'react';
import { S10ExamenCliniqueData, UserRole } from '../../types';
import { AlertTriangle, AlertCircle, CheckCircle2, Lock, Activity, Brain } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S10ExamenCliniqueData;
  isReadOnly: boolean;
  currentUserRole?: UserRole;
  onSave: (data: S10ExamenCliniqueData) => void;
  onNext: () => void;
  onPrev?: () => void;
}

export const S10ExamenClinique: React.FC<Props> = ({
  data,
  isReadOnly,
  currentUserRole,
  onSave,
  onNext,
  onPrev,
}) => {
  const [formData, setFormData] = useState<S10ExamenCliniqueData>(data);
  const [activeTab, setActiveTab] = useState<'somatique' | 'psychiatrique'>('somatique');
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // B2: Somatique modifiable par Psychiatre et Infirmier (Lecture seule pour Psychologue)
  const isSomatiqueReadOnly = isReadOnly || (currentUserRole === 'PSYCHOLOGUE');
  // B2: Psychiatrique modifiable par Psychiatre et Psychologue (Lecture seule pour Infirmier)
  const isPsychiatriqueReadOnly = isReadOnly || (currentUserRole === 'INFIRMIER');

  const constantes = formData.somatique.constantes || {};


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation F-13: SpO2 max 100%
    if (constantes.saturationO2 !== undefined && constantes.saturationO2 > 100) {
      setError('La saturation en oxygène (SpO2) ne peut pas dépasser 100%.');
      setActiveTab('somatique');
      return;
    }
    if (constantes.saturationO2 !== undefined && constantes.saturationO2 < 50) {
      setError('Valeur de saturation en oxygène (SpO2) invalide (< 50%).');
      setActiveTab('somatique');
      return;
    }
    if (constantes.temperature !== undefined && (constantes.temperature < 34 || constantes.temperature > 43)) {
      setError('Valeur de température corporelle anormale (doit être entre 34°C et 43°C).');
      setActiveTab('somatique');
      return;
    }

    if (formData.somatique.nonRealise && !formData.somatique.motifNonRealise?.trim()) {
      setError('Veuillez préciser le motif pour lequel l’examen somatique n’a pas été réalisé.');
      setActiveTab('somatique');
      return;
    }

    setError(null);
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Warning thresholds
  const isFievre = constantes.temperature && constantes.temperature >= 38.5;
  const isHypertension = (constantes.tensionSystolique && constantes.tensionSystolique >= 140) ||
    (constantes.tensionDiastolique && constantes.tensionDiastolique >= 90);
  const isHypoxie = constantes.saturationO2 && constantes.saturationO2 < 95;
  const isTachycardie = constantes.pouls && constantes.pouls > 100;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EDF2F7] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2.5 py-0.5 rounded-md border border-[#10B9A9]/20">
              S10 · CLINIQUE
            </span>
            <span className="text-xs text-[#64748B]">Obligatoire pour validation</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#18243A] tracking-tight mt-1">
            Examen Clinique (Somatique & Psychiatrique)
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Constantes vitales somatiques et sémiologie psychiatrique structurée
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-[#F1F5F9] rounded-xl border border-[#CBD5E1] shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('somatique')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'somatique'
                ? 'bg-white text-[#18243A] shadow-xs'
                : 'text-[#64748B] hover:text-[#18243A]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#10B9A9]" />
            <span>A. Examen Somatique</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('psychiatrique')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'psychiatrique'
                ? 'bg-white text-[#18243A] shadow-xs'
                : 'text-[#64748B] hover:text-[#18243A]'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-[#07988D]" />
            <span>B. Examen Psychiatrique</span>
          </button>
        </div>
      </div>


      {error && (
        <div className="mb-4 p-3 bg-[#FFE4E6] border border-[#F43F5E]/30 rounded-lg flex items-center gap-2 text-xs text-[#BE123C]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isSaved && (
        <div className="mb-4 p-2.5 bg-[#DCFCE7] border border-[#10B981]/30 rounded-lg text-xs text-[#15803D] font-medium flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          Examen clinique enregistré avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* TAB A: EXAMEN SOMATIQUE */}
        {activeTab === 'somatique' && (
          <div className="space-y-4">
            {isSomatiqueReadOnly && !isReadOnly && (
              <div className="p-2.5 bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#B45309] rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Examen somatique en lecture seule pour le rôle {currentUserRole} (Matrice de permissions B2)</span>
              </div>
            )}

            {/* Non réalisé option */}
            <div className="p-3 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-[#18243A] cursor-pointer">
                <input
                  type="checkbox"
                  disabled={isSomatiqueReadOnly}
                  checked={formData.somatique.nonRealise}
                  onChange={(e) => setFormData({
                    ...formData,
                    somatique: {
                      ...formData.somatique,
                      nonRealise: e.target.checked
                    }
                  })}
                  className="rounded text-[#10B9A9] focus:ring-[#10B9A9]"
                />
                <span>Examen somatique impossible / non réalisé à ce stade</span>
              </label>

              {formData.somatique.nonRealise && (
                <input
                  type="text"
                  disabled={isSomatiqueReadOnly}
                  value={formData.somatique.motifNonRealise || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    somatique: {
                      ...formData.somatique,
                      motifNonRealise: e.target.value
                    }
                  })}
                  className="bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5 flex-1 min-w-[220px]"
                  placeholder="Motif : patient non coopérant, agitation, refus..."
                />
              )}
            </div>

            {!formData.somatique.nonRealise && (
              <>
                {/* Constantes vitales */}
                <div className="p-4 bg-[#F1F5F7] border border-[#D9E2E8] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
                      Constantes Vitales
                    </h3>
                    <span className="text-[11px] text-[#64748B]">
                      Saisie infirmier ou médecin
                    </span>
                  </div>

                  {/* Warning banner if abnormal values */}
                  {(isFievre || isHypertension || isHypoxie || isTachycardie) && (
                    <div className="p-2.5 bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-lg text-xs text-[#B45309] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        Alerte clinique :{' '}
                        {[
                          isFievre && `Hyperthermie (${constantes.temperature}°C)`,
                          isHypertension && `Tension artérielle élevée (${constantes.tensionSystolique}/${constantes.tensionDiastolique} mmHg)`,
                          isHypoxie && `SpO2 basse (${constantes.saturationO2}%)`,
                          isTachycardie && `Tachycardie (${constantes.pouls} bpm)`
                        ].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {/* Température */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                        Température (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        disabled={isSomatiqueReadOnly}
                        value={constantes.temperature ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          somatique: {
                            ...formData.somatique,
                            constantes: {
                              ...constantes,
                              temperature: e.target.value === '' ? undefined : parseFloat(e.target.value)
                            }
                          }
                        })}
                        className={`w-full bg-white border text-xs font-mono font-medium rounded-lg px-2.5 py-1.5 focus:outline-none ${
                          isFievre ? 'border-[#F59E0B] text-[#B45309]' : 'border-[#D9E2E8] text-[#18243A]'
                        }`}
                        placeholder="36.8"
                      />
                    </div>

                    {/* TA Systolique */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                        TA Syst. (mmHg)
                      </label>
                      <input
                        type="number"
                        disabled={isSomatiqueReadOnly}
                        value={constantes.tensionSystolique ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          somatique: {
                            ...formData.somatique,
                            constantes: {
                              ...constantes,
                              tensionSystolique: e.target.value === '' ? undefined : parseInt(e.target.value)
                            }
                          }
                        })}
                        className="w-full bg-white border border-[#D9E2E8] text-xs font-mono font-medium rounded-lg px-2.5 py-1.5 focus:outline-none"
                        placeholder="120"
                      />
                    </div>

                    {/* TA Diastolique */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                        TA Diast. (mmHg)
                      </label>
                      <input
                        type="number"
                        disabled={isSomatiqueReadOnly}
                        value={constantes.tensionDiastolique ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          somatique: {
                            ...formData.somatique,
                            constantes: {
                              ...constantes,
                              tensionDiastolique: e.target.value === '' ? undefined : parseInt(e.target.value)
                            }
                          }
                        })}
                        className="w-full bg-white border border-[#D9E2E8] text-xs font-mono font-medium rounded-lg px-2.5 py-1.5 focus:outline-none"
                        placeholder="80"
                      />
                    </div>

                    {/* Pouls */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                        Pouls (bpm)
                      </label>
                      <input
                        type="number"
                        disabled={isSomatiqueReadOnly}
                        value={constantes.pouls ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          somatique: {
                            ...formData.somatique,
                            constantes: {
                              ...constantes,
                              pouls: e.target.value === '' ? undefined : parseInt(e.target.value)
                            }
                          }
                        })}
                        className="w-full bg-white border border-[#D9E2E8] text-xs font-mono font-medium rounded-lg px-2.5 py-1.5 focus:outline-none"
                        placeholder="75"
                      />
                    </div>

                    {/* FR */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                        FR (cycles/min)
                      </label>
                      <input
                        type="number"
                        disabled={isSomatiqueReadOnly}
                        value={constantes.frequenceRespiratoire ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          somatique: {
                            ...formData.somatique,
                            constantes: {
                              ...constantes,
                              frequenceRespiratoire: e.target.value === '' ? undefined : parseInt(e.target.value)
                            }
                          }
                        })}
                        className="w-full bg-white border border-[#D9E2E8] text-xs font-mono font-medium rounded-lg px-2.5 py-1.5 focus:outline-none"
                        placeholder="16"
                      />
                    </div>

                    {/* SpO2 */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                        SpO2 (%) [max 100]
                      </label>
                      <input
                        type="number"
                        max="100"
                        min="0"
                        disabled={isSomatiqueReadOnly}
                        value={constantes.saturationO2 ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          somatique: {
                            ...formData.somatique,
                            constantes: {
                              ...constantes,
                              saturationO2: e.target.value === '' ? undefined : parseInt(e.target.value)
                            }
                          }
                        })}
                        className="w-full bg-white border border-[#D9E2E8] text-xs font-mono font-medium rounded-lg px-2.5 py-1.5 focus:outline-none"
                        placeholder="99"
                      />
                    </div>
                  </div>
                </div>

                {/* État général */}
                <div>
                  <label className="block text-xs font-semibold text-[#18243A] mb-1">
                    État général (nutrition, hydratation, conjonctives, plis cutanés)
                  </label>
                  <input
                    type="text"
                    disabled={isSomatiqueReadOnly}
                    value={formData.somatique.etatGeneral || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      somatique: { ...formData.somatique, etatGeneral: e.target.value }
                    })}
                    className="w-full bg-[#F8FAFC] border border-[#D9E2E8] text-xs rounded-lg px-3 py-2"
                    placeholder="Ex: Patient en bon état général, normonutri, plis cutanés élastiques..."
                  />
                </div>

                {/* Examen des appareils */}
                <div className="p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
                    Examen des Appareils Somatiques
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#18243A] mb-0.5">
                        Cardio-vasculaire
                      </label>
                      <input
                        type="text"
                        disabled={isSomatiqueReadOnly}
                        value={formData.somatique.appareils?.cardiovasculaire || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          somatique: {
                            ...formData.somatique,
                            appareils: { ...formData.somatique.appareils, cardiovasculaire: e.target.value }
                          }
                        })}
                        className="w-full bg-white border border-[#D9E2E8] text-xs rounded px-2.5 py-1.5"
                        placeholder="Bruits du cœur réguliers, pas de souffle..."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#18243A] mb-0.5">
                        Respiratoire
                      </label>
                      <input
                        type="text"
                        disabled={isSomatiqueReadOnly}
                        value={formData.somatique.appareils?.respiratoire || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          somatique: {
                            ...formData.somatique,
                            appareils: { ...formData.somatique.appareils, respiratoire: e.target.value }
                          }
                        })}
                        className="w-full bg-white border border-[#D9E2E8] text-xs rounded px-2.5 py-1.5"
                        placeholder="Murmures vésiculaires symétriques..."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#18243A] mb-0.5">
                        Digestif
                      </label>
                      <input
                        type="text"
                        disabled={isSomatiqueReadOnly}
                        value={formData.somatique.appareils?.digestif || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          somatique: {
                            ...formData.somatique,
                            appareils: { ...formData.somatique.appareils, digestif: e.target.value }
                          }
                        })}
                        className="w-full bg-white border border-[#D9E2E8] text-xs rounded px-2.5 py-1.5"
                        placeholder="Abdomen souple, pas d’hépatomégalie..."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#18243A] mb-0.5">
                        Neurologique
                      </label>
                      <input
                        type="text"
                        disabled={isSomatiqueReadOnly}
                        value={formData.somatique.appareils?.neurologique || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          somatique: {
                            ...formData.somatique,
                            appareils: { ...formData.somatique.appareils, neurologique: e.target.value }
                          }
                        })}
                        className="w-full bg-white border border-[#D9E2E8] text-xs rounded px-2.5 py-1.5"
                        placeholder="ROT symétriques, pas de déficit sensitivo-moteur..."
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB B: EXAMEN PSYCHIATRIQUE */}
        {activeTab === 'psychiatrique' && (
          <div className="space-y-4">
            {isPsychiatriqueReadOnly && !isReadOnly && (
              <div className="p-2.5 bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#B45309] rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Examen psychiatrique en lecture seule pour le rôle {currentUserRole} (Matrice de permissions B2)</span>
              </div>
            )}

            {/* 1. Présentation générale */}
            <div className="p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
                1. Présentation générale
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#18243A] mb-1">
                    Tenue vestimentaire et hygiène
                  </label>
                  <input
                    type="text"
                    disabled={isPsychiatriqueReadOnly}
                    value={formData.psychiatrique.tenueVestimentaireEtHygiene || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      psychiatrique: { ...formData.psychiatrique, tenueVestimentaireEtHygiene: e.target.value }
                    })}
                    className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                    placeholder="Soignée, débraillée, bizarrerie vestimentaire, incurie..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18243A] mb-1">
                    Mimique et regard
                  </label>
                  <input
                    type="text"
                    disabled={isPsychiatriqueReadOnly}
                    value={formData.psychiatrique.mimique || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      psychiatrique: { ...formData.psychiatrique, mimique: e.target.value }
                    })}
                    className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                    placeholder="Mobile, hypomimie, hypermimie, regard fuyant ou méfiant..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18243A] mb-1">
                    Contact et relation avec le soignant
                  </label>
                  <input
                    type="text"
                    disabled={isPsychiatriqueReadOnly}
                    value={formData.psychiatrique.contact || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      psychiatrique: { ...formData.psychiatrique, contact: e.target.value }
                    })}
                    className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                    placeholder="Facile, chaleureux, distant, méfiant, réticent, agressif..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18243A] mb-1">
                    Psychomotricité et comportement moteur
                  </label>
                  <input
                    type="text"
                    disabled={isPsychiatriqueReadOnly}
                    value={formData.psychiatrique.psychomotriciteComportement || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      psychiatrique: { ...formData.psychiatrique, psychomotriciteComportement: e.target.value }
                    })}
                    className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                    placeholder="Calme, ralentissement, agitation, stéréotypies, déambulation..."
                  />
                </div>
              </div>
            </div>

            {/* 2. Conduites */}
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Conduites instinctuelles & comportementales (Alimentation, sommeil, impulsions)
              </label>
              <textarea
                rows={2}
                disabled={isPsychiatriqueReadOnly}
                value={formData.psychiatrique.conduites || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  psychiatrique: { ...formData.psychiatrique, conduites: e.target.value }
                })}
                className="w-full bg-[#F8FAFC] border border-[#D9E2E8] text-xs rounded-lg p-2.5"
                placeholder="Insomnie d'endormissement ou réveils précoces, anorexie, boulimie, risque auto/hétéro-agressif..."
              />
            </div>

            {/* 3. Fonctions supérieures */}
            <div className="p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
                Fonctions supérieures & sémiologie cognitive
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                    Fonctionnement de la pensée & du jugement (Délire, logique, flux verbal)
                  </label>
                  <textarea
                    rows={2}
                    disabled={isPsychiatriqueReadOnly}
                    value={formData.psychiatrique.penseeEtJugement || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      psychiatrique: { ...formData.psychiatrique, penseeEtJugement: e.target.value }
                    })}
                    className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg p-2.5"
                    placeholder="Tachypsychie, fuite des idées, délire paranoïde ou paranoïaque, thèmes (persécution, mystique, mégalomanie), adhésion..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                    Activités perceptives (Hallucinations, illusions)
                  </label>
                  <input
                    type="text"
                    disabled={isPsychiatriqueReadOnly}
                    value={formData.psychiatrique.activitesPerceptives || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      psychiatrique: { ...formData.psychiatrique, activitesPerceptives: e.target.value }
                    })}
                    className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                    placeholder="Hallucinations auditives (voix), visuelles, olfactives, automatisme mental..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                      Conscience de soi & de l’environnement (Orientation TS)
                    </label>
                    <input
                      type="text"
                      disabled={isPsychiatriqueReadOnly}
                      value={formData.psychiatrique.conscienceDeSoiEtEnvironnement || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        psychiatrique: { ...formData.psychiatrique, conscienceDeSoiEtEnvironnement: e.target.value }
                      })}
                      className="w-full bg-white border border-[#D9E2E8] text-xs rounded px-2.5 py-1.5"
                      placeholder="Orientation temporo-spatiale, lucidité, insight/conscience du trouble..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                      Expression des affects & humeur
                    </label>
                    <input
                      type="text"
                      disabled={isPsychiatriqueReadOnly}
                      value={formData.psychiatrique.expressionDesAffects || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        psychiatrique: { ...formData.psychiatrique, expressionDesAffects: e.target.value }
                      })}
                      className="w-full bg-white border border-[#D9E2E8] text-xs rounded px-2.5 py-1.5"
                      placeholder="Euthymie, tristesse vitale, exaltation euphorique, discordance affective..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                      Fonctions mnésiques (Mémoire)
                    </label>
                    <input
                      type="text"
                      disabled={isPsychiatriqueReadOnly}
                      value={formData.psychiatrique.fonctionsMnesiques || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        psychiatrique: { ...formData.psychiatrique, fonctionsMnesiques: e.target.value }
                      })}
                      className="w-full bg-white border border-[#D9E2E8] text-xs rounded px-2.5 py-1.5"
                      placeholder="Mémoire de fixation, mémoire d'évocation..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
                      Fonctions symboliques & langage
                    </label>
                    <input
                      type="text"
                      disabled={isPsychiatriqueReadOnly}
                      value={formData.psychiatrique.fonctionsSymboliques || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        psychiatrique: { ...formData.psychiatrique, fonctionsSymboliques: e.target.value }
                      })}
                      className="w-full bg-white border border-[#D9E2E8] text-xs rounded px-2.5 py-1.5"
                      placeholder="Débit, prosodie, néologismes, barrages, mutisme..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <RubriqueFooterNav
          currentRubriqueId="s10"
          isReadOnly={isSomatiqueReadOnly && isPsychiatriqueReadOnly}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};

