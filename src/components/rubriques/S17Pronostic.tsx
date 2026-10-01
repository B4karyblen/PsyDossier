import React, { useState } from 'react';
import { S17PronosticData, PronosticHorizon, UserRole } from '../../types';
import { Save, Lock, AlertCircle, CheckCircle2, ChevronLeft, Printer, TrendingUp, Sparkles } from 'lucide-react';

interface Props {
  data: S17PronosticData;
  isReadOnly: boolean;
  currentUserRole: UserRole;
  onSave: (data: S17PronosticData) => void;
  onPrevious?: () => void;
  onOpenValidation?: () => void;
  onOpenExport?: () => void;
}

export const S17Pronostic: React.FC<Props> = ({
  data,
  isReadOnly,
  currentUserRole,
  onSave,
  onPrevious,
  onOpenValidation,
  onOpenExport,
}) => {
  const [formData, setFormData] = useState<S17PronosticData>(data);
  const [isSaved, setIsSaved] = useState(false);

  const isPsychiatre = currentUserRole === 'PSYCHIATRE';
  const effectiveReadOnly = isReadOnly || !isPsychiatre;

  const updateHorizon = (
    horizon: 'courtTerme' | 'moyenTerme' | 'longTerme',
    updates: Partial<PronosticHorizon>
  ) => {
    if (effectiveReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      [horizon]: {
        ...prev[horizon],
        ...updates,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const renderHorizonCard = (
    title: string,
    timeframe: string,
    horizonKey: 'courtTerme' | 'moyenTerme' | 'longTerme',
    dataItem: PronosticHorizon
  ) => {
    return (
      <div className="p-4 sm:p-5 bg-ink-25 border border-ink-150 rounded-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-ink-100">
          <div>
            <h4 className="text-sm font-bold text-ink-900">
              {title}
            </h4>
            <span className="text-xs text-ink-500 font-medium">{timeframe}</span>
          </div>

          <div className="flex gap-2">
            {(['Favorable', 'Réservé', 'Défavorable'] as const).map((appr) => (
              <label
                key={appr}
                className={`px-3 py-1 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                  dataItem.appreciation === appr
                    ? appr === 'Favorable'
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : appr === 'Réservé'
                      ? 'bg-amber-100 text-amber-700 border-amber-200'
                      : 'bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-white text-ink-500 border-ink-200 hover:border-primary-500'
                } ${effectiveReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                <input
                  type="radio"
                  name={`appreciation-${horizonKey}`}
                  disabled={effectiveReadOnly}
                  checked={dataItem.appreciation === appr}
                  onChange={() => updateHorizon(horizonKey, { appreciation: appr })}
                  className="sr-only"
                />
                <span>{appr}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">
            Éléments d’appréciation & justification
          </label>
          <textarea
            rows={2}
            disabled={effectiveReadOnly}
            value={dataItem.details || ''}
            onChange={(e) => updateHorizon(horizonKey, { details: e.target.value })}
            className="clinical-input w-full"
            placeholder="Arguments cliniques (adhésion, sévérité, comorbidités)..."
          />
        </div>
      </div>
    );
  };

  return (
    <div className="clinical-card p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-ink-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip chip-neutral tabular-nums">
              S17 · CONCLUSION CLINIQUE
            </span>
            <span className="text-xs text-ink-500">Dernière rubrique du plan</span>
          </div>
          <h2 className="text-h2 text-ink-900 mt-2">
            Pronostic & Perspectives Évolutives
          </h2>
          <p className="text-base text-ink-500 mt-1">
            Évaluation pronostique à court, moyen et long terme (BR-014 : exclusivité Psychiatre)
          </p>
        </div>
      </div>

      {!isPsychiatre && (
        <div className="p-3 bg-amber-100 border border-amber-500/30 text-amber-700 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span>
            Règle BR-014 : L’évaluation pronostique médicale relève de la responsabilité du Psychiatre (lecture seule pour {currentUserRole}).
          </span>
        </div>
      )}

      {isSaved && (
        <div className="p-3 bg-emerald-100 border border-emerald-500/30 rounded-lg text-xs text-emerald-700 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Évaluation pronostique enregistrée avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 3 Horizons */}
        <div className="space-y-4">
          {renderHorizonCard('1. Pronostic Immédiat & Court Terme', 'Échéance : 1 à 4 semaines (sortie de crise)', 'courtTerme', formData.courtTerme)}
          {renderHorizonCard('2. Pronostic à Moyen Terme', 'Échéance : 3 à 12 mois (consolidation / rémission)', 'moyenTerme', formData.moyenTerme)}
          {renderHorizonCard('3. Pronostic à Long Terme', 'Échéance : > 1 an (insertion socio-professionnelle & rechute)', 'longTerme', formData.longTerme)}
        </div>

        {/* Facteurs pronostiques */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-2">
          <label className="field-label">
            Synthèse des Facteurs Pronostiques Majeurs (Favorables vs Péjoratifs)
          </label>
          <textarea
            rows={3}
            disabled={effectiveReadOnly}
            value={formData.facteursPronostiques || ''}
            onChange={(e) => setFormData({ ...formData, facteursPronostiques: e.target.value })}
            className="clinical-input w-full leading-relaxed"
            placeholder="Ex: Facteurs favorables (début aigu, bonne insertion antérieure, soutien familial, observance) vs facteurs péjoratifs (isolement, rupture de soins, abus de substances)..."
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-ink-100">
          <div>
            {onPrevious && (
              <button
                type="button"
                onClick={onPrevious}
                className="btn-secondary btn-sm"
              >
                <ChevronLeft className="w-4 h-4 text-ink-500" />
                <span>Précédent : S16</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!effectiveReadOnly && (
              <button
                type="submit"
                className="btn-primary btn-sm"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer S17</span>
              </button>
            )}

            {onOpenValidation && (
              <button
                type="button"
                onClick={onOpenValidation}
                className="btn-secondary btn-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Valider le dossier</span>
              </button>
            )}

            {onOpenExport && (
              <button
                type="button"
                onClick={onOpenExport}
                className="btn-secondary btn-sm"
              >
                <Printer className="w-4 h-4 text-ink-500" />
                <span>Exporter</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
