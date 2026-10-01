import React, { useState } from 'react';
import { useRubriqueForm } from '../../lib/useRubriqueForm';
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
  const [formData, setFormData, form] = useRubriqueForm<S10ExamenCliniqueData>(data);
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
    <div className="clinical-card p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ink-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip chip-neutral tabular-nums">
              S10 · CLINIQUE
            </span>
            <span className="text-xs text-ink-500">Obligatoire pour validation</span>
          </div>
          <h2 className="text-h2 text-ink-900 mt-2">
            Examen Clinique (Somatique & Psychiatrique)
          </h2>
          <p className="text-base text-ink-500 mt-1">
            Constantes vitales somatiques et sémiologie psychiatrique structurée
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-ink-100 rounded-lg border border-ink-200 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('somatique')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'somatique'
                ? 'bg-white text-ink-900 shadow-xs'
                : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-primary-600" />
            <span>A. Examen Somatique</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('psychiatrique')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'psychiatrique'
                ? 'bg-white text-ink-900 shadow-xs'
                : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-primary-700" />
            <span>B. Examen Psychiatrique</span>
          </button>
        </div>
      </div>


      {error && (
        <div className="mb-4 p-3 bg-rose-100 border border-rose-500/30 rounded-lg flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isSaved && (
        <div className="mb-4 p-2.5 bg-emerald-100 border border-emerald-500/30 rounded-lg text-xs text-emerald-700 font-medium flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          Examen clinique enregistré avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* TAB A: EXAMEN SOMATIQUE */}
        {activeTab === 'somatique' && (
          <div className="space-y-4">
            {isSomatiqueReadOnly && !isReadOnly && (
              <div className="p-2.5 bg-amber-100 border border-amber-500/30 text-amber-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Examen somatique en lecture seule pour le rôle {currentUserRole} (Matrice de permissions B2)</span>
              </div>
            )}

            {/* Non réalisé option */}
            <div className="p-3 bg-ink-25 border border-ink-150 rounded-lg flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-ink-900 cursor-pointer">
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
                  className="rounded text-primary-600 focus:ring-primary-500"
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
                  className="clinical-input flex-1 min-w-[220px]"
                  placeholder="Motif : patient non coopérant, agitation, refus..."
                />
              )}
            </div>

            {!formData.somatique.nonRealise && (
              <>
                {/* Constantes vitales */}
                <div className="p-4 bg-white border border-ink-150 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-ink-900">
                      Constantes Vitales
                    </h3>
                    <span className="text-xs text-ink-500">
                      Saisie infirmier ou médecin
                    </span>
                  </div>

                  {/* Warning banner if abnormal values */}
                  {(isFievre || isHypertension || isHypoxie || isTachycardie) && (
                    <div className="p-2.5 bg-amber-100 border border-amber-500/30 rounded-lg text-xs text-amber-700 flex items-center gap-2">
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
                      <label className="field-label">
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
                          isFievre ? 'border-amber-500 text-amber-700' : 'border-ink-150 text-ink-900'
                        }`}
                        placeholder="36.8"
                      />
                    </div>

                    {/* TA Systolique */}
                    <div>
                      <label className="field-label">
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
                        className="clinical-input w-full font-mono"
                        placeholder="120"
                      />
                    </div>

                    {/* TA Diastolique */}
                    <div>
                      <label className="field-label">
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
                        className="clinical-input w-full font-mono"
                        placeholder="80"
                      />
                    </div>

                    {/* Pouls */}
                    <div>
                      <label className="field-label">
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
                        className="clinical-input w-full font-mono"
                        placeholder="75"
                      />
                    </div>

                    {/* FR */}
                    <div>
                      <label className="field-label">
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
                        className="clinical-input w-full font-mono"
                        placeholder="16"
                      />
                    </div>

                    {/* SpO2 */}
                    <div>
                      <label className="field-label">
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
                        className="clinical-input w-full font-mono"
                        placeholder="99"
                      />
                    </div>
                  </div>
                </div>

                {/* État général */}
                <div>
                  <label className="field-label">
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
                    className="clinical-input w-full"
                    placeholder="Ex: Patient en bon état général, normonutri, plis cutanés élastiques..."
                  />
                </div>

                {/* Examen des appareils */}
                <div className="p-4 bg-white border border-ink-150 rounded-lg space-y-3">
                  <h3 className="text-base font-bold text-ink-900">
                    Examen des Appareils Somatiques
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="field-label">
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
                        className="clinical-input w-full"
                        placeholder="Bruits du cœur réguliers, pas de souffle..."
                      />
                    </div>

                    <div>
                      <label className="field-label">
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
                        className="clinical-input w-full"
                        placeholder="Murmures vésiculaires symétriques..."
                      />
                    </div>

                    <div>
                      <label className="field-label">
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
                        className="clinical-input w-full"
                        placeholder="Abdomen souple, pas d’hépatomégalie..."
                      />
                    </div>

                    <div>
                      <label className="field-label">
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
                        className="clinical-input w-full"
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
              <div className="p-2.5 bg-amber-100 border border-amber-500/30 text-amber-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Examen psychiatrique en lecture seule pour le rôle {currentUserRole} (Matrice de permissions B2)</span>
              </div>
            )}

            {/* 1. Présentation générale */}
            <div className="p-4 bg-ink-25 border border-ink-150 rounded-lg space-y-3">
              <h3 className="text-base font-bold text-ink-900">
                1. Présentation générale
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="field-label">
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
                    className="clinical-input w-full"
                    placeholder="Soignée, débraillée, bizarrerie vestimentaire, incurie..."
                  />
                </div>

                <div>
                  <label className="field-label">
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
                    className="clinical-input w-full"
                    placeholder="Mobile, hypomimie, hypermimie, regard fuyant ou méfiant..."
                  />
                </div>

                <div>
                  <label className="field-label">
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
                    className="clinical-input w-full"
                    placeholder="Facile, chaleureux, distant, méfiant, réticent, agressif..."
                  />
                </div>

                <div>
                  <label className="field-label">
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
                    className="clinical-input w-full"
                    placeholder="Calme, ralentissement, agitation, stéréotypies, déambulation..."
                  />
                </div>
              </div>
            </div>

            {/* 2. Conduites */}
            <div>
              <label className="field-label">
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
                className="clinical-input w-full"
                placeholder="Insomnie d'endormissement ou réveils précoces, anorexie, boulimie, risque auto/hétéro-agressif..."
              />
            </div>

            {/* 3. Fonctions supérieures */}
            <div className="p-4 bg-ink-25 border border-ink-150 rounded-lg space-y-3">
              <h3 className="text-base font-bold text-ink-900">
                Fonctions supérieures & sémiologie cognitive
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="field-label">
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
                    className="clinical-input w-full"
                    placeholder="Tachypsychie, fuite des idées, délire paranoïde ou paranoïaque, thèmes (persécution, mystique, mégalomanie), adhésion..."
                  />
                </div>

                <div>
                  <label className="field-label">
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
                    className="clinical-input w-full"
                    placeholder="Hallucinations auditives (voix), visuelles, olfactives, automatisme mental..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">
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
                      className="clinical-input w-full"
                      placeholder="Orientation temporo-spatiale, lucidité, insight/conscience du trouble..."
                    />
                  </div>

                  <div>
                    <label className="field-label">
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
                      className="clinical-input w-full"
                      placeholder="Euthymie, tristesse vitale, exaltation euphorique, discordance affective..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">
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
                      className="clinical-input w-full"
                      placeholder="Mémoire de fixation, mémoire d'évocation..."
                    />
                  </div>

                  <div>
                    <label className="field-label">
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
                      className="clinical-input w-full"
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
          isDirty={form.isDirty}
          onCancel={form.reset}
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

