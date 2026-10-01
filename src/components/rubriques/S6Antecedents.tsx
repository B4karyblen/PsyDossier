import React, { useState } from 'react';
import { S6AntecedentsData, AntecedentItem } from '../../types';
import { History, Users, ShieldAlert, Sparkles } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S6AntecedentsData;
  patientSexe: 'Masculin' | 'Féminin';
  isReadOnly: boolean;
  onSave: (data: S6AntecedentsData) => void;
  onNext: () => void;
  onPrev?: () => void;
}

export const S6Antecedents: React.FC<Props> = ({
  data,
  patientSexe,
  isReadOnly,
  onSave,
  onNext,
  onPrev,
}) => {
  const [formData, setFormData] = useState<S6AntecedentsData>(data);
  const [isSaved, setIsSaved] = useState(false);

  const updateItem = (
    section: 'personnels' | 'familiaux',
    key: string,
    aucun: boolean,
    details: string
  ) => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: {
          aucun,
          details: aucun ? '' : details,
        },
      },
    }));
  };

  const renderAntecedentRow = (
    label: string,
    section: 'personnels' | 'familiaux',
    key: string,
    item?: AntecedentItem,
    placeholder = 'Préciser diagnostic, date, traitement...'
  ) => {
    const val = item || { aucun: false, details: '' };
    return (
      <div className="p-3.5 bg-ink-25 border border-ink-150 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-ink-900">{label}</label>
          <label className="flex items-center gap-1.5 text-xs text-ink-500 cursor-pointer">
            <input
              type="checkbox"
              disabled={isReadOnly}
              checked={val.aucun}
              onChange={(e) => updateItem(section, key, e.target.checked, val.details)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="font-medium">Aucun</span>
          </label>
        </div>

        {!val.aucun ? (
          <textarea
            rows={2}
            disabled={isReadOnly}
            value={val.details}
            onChange={(e) => updateItem(section, key, false, e.target.value)}
            className="w-full bg-white border border-ink-200 focus:border-primary-500 text-xs font-medium rounded-lg p-2.5 focus:outline-none"
            placeholder={placeholder}
          />
        ) : (
          <div className="text-[11px] text-primary-700 bg-primary-50 p-2 rounded-lg font-semibold">
            ✓ Aucun antécédent notable rapporté
          </div>
        )}
      </div>
    );
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
            <span className="chip bg-ink-100 text-ink-700 tabular-nums">
              S6 · ANTÉCÉDENTS
            </span>
            <span className="text-xs text-ink-500">Médico-sociaux</span>
          </div>
          <h2 className="text-h2 text-ink-900 mt-2">
            Antécédents Personnels et Familiaux
          </h2>
          <p className="text-sm text-ink-500 mt-0.5">
            Historique somatique, psychiatrique, addictif, judiciaire et familial
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 : Antécédents personnels */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <History className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-semibold text-ink-900">
              1. Antécédents Personnels du Patient
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {renderAntecedentRow('Médicaux personnels', 'personnels', 'medicaux', formData.personnels.medicaux, 'Ex: HTA, diabète, épilepsie, asthme, drépanocytose...')}
            {renderAntecedentRow('Chirurgicaux personnels', 'personnels', 'chirurgicaux', formData.personnels.chirurgicaux, 'Interventions chirurgicales, anesthésies...')}
            {renderAntecedentRow('Psychiatriques personnels', 'personnels', 'psychiatriques', formData.personnels.psychiatriques, 'Ex: Épisodes dépressifs antérieurs, délires, hospitalisations psychiatriques, TS...')}
            {renderAntecedentRow('Addictifs / Substances', 'personnels', 'addictifs', formData.personnels.addictifs, 'Ex: Tabac, alcool, cannabis, tramadol, solvants...')}
            {renderAntecedentRow('Judiciaires personnels', 'personnels', 'judiciaires', formData.personnels.judiciaires, 'Gardes à vue, incarcérations, condamnations...')}
            {patientSexe === 'Féminin' ? (
              renderAntecedentRow('Gynéco-obstétricaux', 'personnels', 'gynecoObstetricaux', formData.personnels.gynecoObstetricaux, 'Gestité, parité, fausses couches, IVG, accouchements, épisodes du post-partum...')
            ) : (
              <div className="p-3.5 bg-ink-100 border border-ink-150 rounded-lg flex items-center justify-center text-xs text-ink-500 italic">
                Antécédents gynéco-obstétricaux non applicables (Patient masculin)
              </div>
            )}
          </div>
        </div>

        {/* Section 2 : Antécédents familiaux */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <Users className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-semibold text-ink-900">
              2. Antécédents Familiaux (Hérédité & Parentèle)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {renderAntecedentRow('Médicaux familiaux', 'familiaux', 'medicaux', formData.familiaux.medicaux, 'Ex: HTA maternelle, diabète familial, AVC, drépanocytose...')}
            {renderAntecedentRow('Chirurgicaux familiaux', 'familiaux', 'chirurgicaux', formData.familiaux.chirurgicaux, 'Interventions notables dans la famille')}
            {renderAntecedentRow('Psychiatriques familiaux', 'familiaux', 'psychiatriques', formData.familiaux.psychiatriques, 'Ex: Dépression, suicide dans la famille, troubles bipolaires, psychoses chroniques...')}
            {renderAntecedentRow('Addictifs familiaux', 'familiaux', 'addictifs', formData.familiaux.addictifs, 'Ex: Alcoolisme parental, dépendances aux substances dans la fratrie...')}
          </div>
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
          currentRubriqueId="s6"
          isReadOnly={isReadOnly}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};
