import React, { useState } from 'react';
import { useRubriqueForm } from '../../lib/useRubriqueForm';
import { S4HistoireMaladieData } from '../../types';
import { AlertCircle, Clock, Zap, History, Sparkles } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S4HistoireMaladieData;
  isReadOnly: boolean;
  onSave: (data: S4HistoireMaladieData) => void;
  onNext: () => void;
  onPrev?: () => void;
}

const FACTEURS_OPTIONS = [
  'Stress',
  'Deuil',
  'Rupture sentimentale',
  'Échec',
  'Perte d’emploi',
  'Autre',
];

export const S4HistoireMaladie: React.FC<Props> = ({
  data,
  isReadOnly,
  onSave,
  onNext,
  onPrev,
}) => {
  const [formData, setFormData, form] = useRubriqueForm<S4HistoireMaladieData>(data);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const toggleFacteur = (facteur: string) => {
    if (isReadOnly) return;
    const current = formData.facteursDeclenchants || [];
    if (current.includes(facteur)) {
      setFormData({
        ...formData,
        facteursDeclenchants: current.filter((f) => f !== facteur),
        facteursDeclenchantsAutrePrecision:
          facteur === 'Autre' ? '' : formData.facteursDeclenchantsAutrePrecision,
      });
    } else {
      setFormData({
        ...formData,
        facteursDeclenchants: [...current, facteur],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.dateDebut) {
      const today = new Date().toISOString().split('T')[0];
      if (formData.dateDebut > today) {
        setError('La date de début des troubles ne peut pas être située dans le futur.');
        return;
      }
    }
    if (
      formData.facteursDeclenchants.includes('Autre') &&
      !formData.facteursDeclenchantsAutrePrecision?.trim()
    ) {
      setError('Veuillez préciser le facteur déclenchant « Autre » coché (BR-008).');
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
              S4 · ANAMNÈSE
            </span>
            <span className="text-xs text-ink-500">Chrono-clinique</span>
          </div>
          <h2 className="text-h2 text-ink-900 mt-2">
            Histoire de la Maladie
          </h2>
          <p className="text-base text-ink-500 mt-1">
            Début des troubles, mode d'installation, facteurs déclenchants et évolution de l'épisode actuel
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
        {/* Subcard 1: Début et Mode d'installation */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <Clock className="w-4 h-4 text-primary-600" />
            <h3 className="text-base font-bold text-ink-900">
              Début & Mode d'Installation
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="field-label">
                Date de début des troubles actuels
              </label>
              <input
                type="date"
                disabled={isReadOnly}
                value={formData.dateDebut || ''}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                className="clinical-input w-full tabular-nums"
              />
            </div>

            <div>
              <label className="field-label">
                Mode d'installation <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-4 pt-1.5">
                {(['Brutal', 'Progressif'] as const).map((mode) => (
                  <label key={mode} className="flex items-center gap-2 text-xs font-semibold text-ink-900 cursor-pointer">
                    <input
                      type="radio"
                      name="modeInstallation"
                      disabled={isReadOnly}
                      checked={formData.modeInstallation === mode}
                      onChange={() => setFormData({ ...formData, modeInstallation: mode })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Subcard 2: Facteurs déclenchants */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <Zap className="w-4 h-4 text-primary-600" />
            <label className="field-label">
              Facteurs Déclenchants Potentiels (Cocher les options applicables)
            </label>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {FACTEURS_OPTIONS.map((facteur) => {
              const selected = formData.facteursDeclenchants.includes(facteur);
              return (
                <button
                  key={facteur}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => toggleFacteur(facteur)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selected
                      ? 'bg-primary-900 text-white'
                      : 'bg-white text-ink-900 border border-ink-200 hover:border-primary-500'
                  } ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  {selected ? '✓ ' : '+ '} {facteur}
                </button>
              );
            })}
          </div>

          {formData.facteursDeclenchants.includes('Autre') && (
            <div className="pt-2">
              <label className="field-label">
                Précision pour le facteur « Autre » <span className="text-rose-500">*</span> (BR-008)
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.facteursDeclenchantsAutrePrecision || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    facteursDeclenchantsAutrePrecision: e.target.value,
                  })
                }
                className="clinical-input w-full"
                placeholder="Ex: Conflit foncier, sorcellerie perçue, maladie physique..."
              />
            </div>
          )}
        </div>

        {/* Subcard 3: Récit clinique & Évolution */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <History className="w-4 h-4 text-primary-600" />
            <h3 className="text-base font-bold text-ink-900">
              Chronologie & Récit de l'Épisode
            </h3>
          </div>

          <div>
            <label className="field-label">
              Récit chronologique et itinéraire thérapeutique
            </label>
            <textarea
              rows={5}
              disabled={isReadOnly}
              value={formData.itineraireTherapeutique || ''}
              onChange={(e) => setFormData({ ...formData, itineraireTherapeutique: e.target.value })}
              className="clinical-input w-full leading-relaxed"
              placeholder="Décrire l'apparition des premiers signes, leur succession dans le temps, les modifications comportementales, les consultations ou thérapeutiques déjà essayées..."
            />
          </div>

          <div>
            <label className="field-label">
              Retentissement socio-professionnel & familial
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.retentissementSocioProfessionnel || ''}
              onChange={(e) =>
                setFormData({ ...formData, retentissementSocioProfessionnel: e.target.value })
              }
              className="clinical-input w-full"
              placeholder="Ex: Arrêt de travail, déscolarisation, rupture des liens familiaux..."
            />
          </div>
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
          isDirty={form.isDirty}
          onCancel={form.reset}
          currentRubriqueId="s4"
          isReadOnly={isReadOnly}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};
