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
      <div className="p-4 sm:p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#EDF2F7]">
          <div>
            <h4 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              {title}
            </h4>
            <span className="text-[11px] text-[#64748B] font-medium">{timeframe}</span>
          </div>

          <div className="flex gap-2">
            {(['Favorable', 'Réservé', 'Défavorable'] as const).map((appr) => (
              <label
                key={appr}
                className={`px-3 py-1 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                  dataItem.appreciation === appr
                    ? appr === 'Favorable'
                      ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                      : appr === 'Réservé'
                      ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                      : 'bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3]'
                    : 'bg-white text-[#64748B] border-[#CBD5E1] hover:border-[#10B9A9]'
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
          <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
            Éléments d’appréciation & justification
          </label>
          <textarea
            rows={2}
            disabled={effectiveReadOnly}
            value={dataItem.details || ''}
            onChange={(e) => updateHorizon(horizonKey, { details: e.target.value })}
            className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-xs font-medium rounded-lg p-2.5 focus:outline-none"
            placeholder="Arguments cliniques (adhésion, sévérité, comorbidités)..."
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F7]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2.5 py-0.5 rounded-md border border-[#10B9A9]/20">
              S17 · CONCLUSION CLINIQUE
            </span>
            <span className="text-xs text-[#64748B]">Dernière rubrique du plan</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#18243A] tracking-tight mt-1">
            Pronostic & Perspectives Évolutives
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Évaluation pronostique à court, moyen et long terme (BR-014 : exclusivité Psychiatre)
          </p>
        </div>
      </div>

      {!isPsychiatre && (
        <div className="p-3 bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#B45309] rounded-xl text-xs font-semibold flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span>
            Règle BR-014 : L’évaluation pronostique médicale relève de la responsabilité du Psychiatre (lecture seule pour {currentUserRole}).
          </span>
        </div>
      )}

      {isSaved && (
        <div className="p-3 bg-[#DCFCE7] border border-[#10B981]/30 rounded-xl text-xs text-[#15803D] font-bold flex items-center gap-2">
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
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-2">
          <label className="block text-xs font-bold text-[#18243A] uppercase tracking-wider">
            Synthèse des Facteurs Pronostiques Majeurs (Favorables vs Péjoratifs)
          </label>
          <textarea
            rows={3}
            disabled={effectiveReadOnly}
            value={formData.facteursPronostiques || ''}
            onChange={(e) => setFormData({ ...formData, facteursPronostiques: e.target.value })}
            className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-xs font-medium rounded-xl p-3 focus:outline-none leading-relaxed"
            placeholder="Ex: Facteurs favorables (début aigu, bonne insertion antérieure, soutien familial, observance) vs facteurs péjoratifs (isolement, rupture de soins, abus de substances)..."
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-[#EDF2F7]">
          <div>
            {onPrevious && (
              <button
                type="button"
                onClick={onPrevious}
                className="px-4 py-2 text-xs font-semibold text-[#18243A] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-[#64748B]" />
                <span>Précédent : S16</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!effectiveReadOnly && (
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#10B9A9] hover:bg-[#07988D] active:scale-98 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-[#10B9A9]/25"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer S17</span>
              </button>
            )}

            {onOpenValidation && (
              <button
                type="button"
                onClick={onOpenValidation}
                className="px-4 py-2 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] active:scale-98 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Valider le dossier</span>
              </button>
            )}

            {onOpenExport && (
              <button
                type="button"
                onClick={onOpenExport}
                className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4 text-[#64748B]" />
                <span>Exporter</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
