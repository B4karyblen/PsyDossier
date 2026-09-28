import React, { useState } from 'react';
import { S6AntecedentsData, AntecedentItem } from '../../types';
import { Save, ChevronRight, Check } from 'lucide-react';

interface Props {
  data: S6AntecedentsData;
  patientSexe: 'Masculin' | 'Féminin';
  isReadOnly: boolean;
  onSave: (data: S6AntecedentsData) => void;
  onNext: () => void;
}

export const S6Antecedents: React.FC<Props> = ({
  data,
  patientSexe,
  isReadOnly,
  onSave,
  onNext,
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
          details: aucun ? '' : details
        }
      }
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
      <div className="p-3 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#18243A]">
            {label}
          </label>
          <label className="flex items-center gap-1.5 text-xs text-[#64748B] cursor-pointer">
            <input
              type="checkbox"
              disabled={isReadOnly}
              checked={val.aucun}
              onChange={(e) => updateItem(section, key, e.target.checked, val.details)}
              className="rounded text-[#10B9A9] focus:ring-[#10B9A9]"
            />
            <span className={val.aucun ? 'text-[#15803D] font-semibold' : ''}>
              Aucun antécédent connu
            </span>
          </label>
        </div>

        {!val.aucun ? (
          <textarea
            rows={2}
            disabled={isReadOnly}
            value={val.details}
            onChange={(e) => updateItem(section, key, false, e.target.value)}
            className="w-full bg-white border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-2.5 focus:outline-none"
            placeholder={placeholder}
          />
        ) : (
          <div className="py-1 px-2.5 bg-[#DCFCE7] text-[#15803D] text-[11px] font-medium rounded flex items-center gap-1">
            <Check className="w-3 h-3" />
            Néant / Aucun antécédent répertorié
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
    <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8EEF2]">
        <div>
          <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2 py-0.5 rounded">
            S6 · ANTÉCÉDENTS
          </span>
          <h2 className="text-base font-bold text-[#18243A] mt-1">
            Antécédents personnels et familiaux
          </h2>
          <p className="text-xs text-[#64748B]">
            Règle BR-003 (Gynéco conditionné au sexe Féminin) & BR-011 (Familiaux sans volet judiciaire)
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="mb-4 p-2.5 bg-[#DCFCE7] border border-[#10B981]/30 rounded-lg text-xs text-[#15803D] font-medium">
          Antécédents enregistrés avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 : Antécédents personnels */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-[#E8EEF2]">
            <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              1. Antécédents personnels
            </h3>
            <span className="text-[11px] text-[#64748B]">(Propres au patient)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderAntecedentRow('Médicaux', 'personnels', 'medicaux', formData.personnels.medicaux, 'Ex: Paludisme, asthme, diabète, HTA, allergies...')}
            {renderAntecedentRow('Chirurgicaux', 'personnels', 'chirurgicaux', formData.personnels.chirurgicaux, 'Ex: Appendicectomie, césarienne, traumatismes crâniens...')}
            
            {/* Conditionnel au sexe Féminin (BR-003) */}
            {patientSexe === 'Féminin' && (
              <div className="md:col-span-2">
                {renderAntecedentRow(
                  'Gynéco-obstétricaux (Patiente de sexe Féminin - BR-003)',
                  'personnels',
                  'gynecoObstetricaux',
                  formData.personnels.gynecoObstetricaux,
                  'Ex: Gestité, parité (G...P...), grossesses, accouchements, fausses couches, contraception...'
                )}
              </div>
            )}

            {renderAntecedentRow('Psychiatriques', 'personnels', 'psychiatriques', formData.personnels.psychiatriques, 'Ex: Épisodes dépressifs, tentatives de suicide, hospitalisations antérieures...')}
            {renderAntecedentRow('Addictifs / Substances', 'personnels', 'addictifs', formData.personnels.addictifs, 'Ex: Alcool, tabac, cannabis, tramadol, solvants, drogues injectables...')}
            
            <div className="md:col-span-2">
              {renderAntecedentRow('Judiciaires', 'personnels', 'judiciaires', formData.personnels.judiciaires, 'Ex: Garde à vue, détention, poursuites pénales, condamnations...')}
            </div>
          </div>
        </div>

        {/* Section 2 : Antécédents familiaux (BR-011: pas de judiciaire ni gynéco) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-[#E8EEF2]">
            <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              2. Antécédents familiaux
            </h3>
            <span className="text-[11px] text-[#64748B]">(Ascendants, collatéraux, lignées parentales)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderAntecedentRow('Médicaux familiaux', 'familiaux', 'medicaux', formData.familiaux.medicaux, 'Ex: HTA maternelle, diabète familial, cardiopathies...')}
            {renderAntecedentRow('Chirurgicaux familiaux', 'familiaux', 'chirurgicaux', formData.familiaux.chirurgicaux, 'Interventions notables dans la famille')}
            {renderAntecedentRow('Psychiatriques familiaux', 'familiaux', 'psychiatriques', formData.familiaux.psychiatriques, 'Ex: Dépression, suicide dans la parentèle, troubles bipolaires, psychoses...')}
            {renderAntecedentRow('Addictifs familiaux', 'familiaux', 'addictifs', formData.familiaux.addictifs, 'Ex: Alcoolisme parental ou fraternel, dépendances...')}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8EEF2]">
          <div className="text-[11px] text-[#64748B]">
            La case « Aucun » exclut la saisie de texte (et inversement)
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Enregistrer S6
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors flex items-center gap-1.5"
            >
              Suivant (S7)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
