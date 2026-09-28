import React, { useState } from 'react';
import { S17PronosticData, PronosticHorizon, UserRole } from '../../types';
import { Save, Lock, AlertCircle, CheckCircle2, ChevronLeft, Printer } from 'lucide-react';

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
        ...updates
      }
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
      <div className="p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              {title}
            </h3>
            <span className="text-[11px] text-[#64748B]">{timeframe}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {(['Favorable', 'Réservé', 'Défavorable'] as const).map((appr) => {
              const selected = dataItem.appreciation === appr;
              let badgeColor = 'bg-white text-[#18243A] border-[#D9E2E8]';
              if (selected) {
                if (appr === 'Favorable') badgeColor = 'bg-[#DCFCE7] text-[#15803D] border-[#10B981] font-bold';
                if (appr === 'Réservé') badgeColor = 'bg-[#FEF3C7] text-[#B45309] border-[#F59E0B] font-bold';
                if (appr === 'Défavorable') badgeColor = 'bg-[#FFE4E6] text-[#BE123C] border-[#F43F5E] font-bold';
              }

              return (
                <button
                  key={appr}
                  type="button"
                  disabled={effectiveReadOnly}
                  onClick={() => updateHorizon(horizonKey, { appreciation: appr })}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${badgeColor} ${
                    effectiveReadOnly ? 'cursor-not-allowed opacity-80' : ''
                  }`}
                >
                  {appr}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#18243A] mb-1">
            Justification clinique & évolution prévisible
          </label>
          <textarea
            rows={2}
            disabled={effectiveReadOnly}
            value={dataItem.details}
            onChange={(e) => updateHorizon(horizonKey, { details: e.target.value })}
            className="w-full bg-white border border-[#D9E2E8] focus:border-[#10B9A9] text-xs font-medium rounded-lg p-2.5 focus:outline-none"
            placeholder={`Éléments pronostiques à ${title.toLowerCase()}...`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8EEF2]">
        <div>
          <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2 py-0.5 rounded">
            S17 · PRONOSTIC
          </span>
          <h2 className="text-base font-bold text-[#18243A] mt-1 flex items-center gap-2">
            <span>Pronostic psychiatrique</span>
            {!isPsychiatre && <Lock className="w-4 h-4 text-[#94A3B8]" />}
          </h2>
          <p className="text-xs text-[#64748B]">
            Règle BR-010 : Trois horizons distincts (court, moyen et long terme) — Réservé au médecin psychiatre
          </p>
        </div>

        {!isPsychiatre && (
          <span className="text-xs font-semibold px-2.5 py-1 bg-[#FEF3C7] text-[#B45309] rounded-lg">
            Consultation en lecture seule
          </span>
        )}
      </div>

      {isSaved && (
        <div className="mb-4 p-2.5 bg-[#DCFCE7] border border-[#10B981]/30 rounded-lg text-xs text-[#15803D] font-medium flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          Pronostic enregistré avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Les 3 horizons (BR-010) */}
        {renderHorizonCard('Court terme', '0 à 3 mois (phase aiguë et rémission initiale)', 'courtTerme', formData.courtTerme)}
        {renderHorizonCard('Moyen terme', '6 à 18 mois (stabilisation et réhabilitation)', 'moyenTerme', formData.moyenTerme)}
        {renderHorizonCard('Long terme', 'Évolution à plus de 2 ans et devenir global', 'longTerme', formData.longTerme)}

        {/* Facteurs pronostiques globaux */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Facteurs pronostiques majeurs (Favorables et Péjoratifs)
          </label>
          <textarea
            rows={3}
            disabled={effectiveReadOnly}
            value={formData.facteursPronostiques || ''}
            onChange={(e) => setFormData({ ...formData, facteursPronostiques: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-xs font-medium rounded-lg p-3 focus:outline-none"
            placeholder="Ex: Facteurs de bon pronostic (début brutal, bon niveau antérieur, soutien familial, absence d'antécédents) vs facteurs péjoratifs..."
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E8EEF2]">
          <div className="flex items-center gap-2">
            {onPrevious && (
              <button
                type="button"
                onClick={onPrevious}
                className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Précédent (S16)
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!effectiveReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                Enregistrer S17
              </button>
            )}

            {onOpenValidation && (
              <button
                type="button"
                onClick={onOpenValidation}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#10B981] hover:bg-[#059669] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Valider le dossier
              </button>
            )}

            {onOpenExport && (
              <button
                type="button"
                onClick={onOpenExport}
                className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-white border border-[#D9E2E8] hover:bg-[#F8FAFC] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                Exporter (PDF)
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
