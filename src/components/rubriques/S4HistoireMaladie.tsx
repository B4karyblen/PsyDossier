import React, { useState } from 'react';
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
  const [formData, setFormData] = useState<S4HistoireMaladieData>(data);
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
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F7]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2.5 py-0.5 rounded-md border border-[#10B9A9]/20">
              S4 · ANAMNÈSE
            </span>
            <span className="text-xs text-[#64748B]">Chrono-clinique</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#18243A] tracking-tight mt-1">
            Histoire de la Maladie
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Début des troubles, mode d'installation, facteurs déclenchants et évolution de l'épisode actuel
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-[#FFE4E6] border border-[#F43F5E]/30 rounded-xl flex items-center gap-2.5 text-xs text-[#BE123C] font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subcard 1: Début et Mode d'installation */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EDF2F7]">
            <Clock className="w-4 h-4 text-[#10B9A9]" />
            <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              Début & Mode d'Installation
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Date de début des troubles actuels
              </label>
              <input
                type="date"
                disabled={isReadOnly}
                value={formData.dateDebut || ''}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Mode d'installation <span className="text-[#F43F5E]">*</span>
              </label>
              <div className="flex gap-4 pt-1.5">
                {(['Brutal', 'Progressif'] as const).map((mode) => (
                  <label key={mode} className="flex items-center gap-2 text-xs font-semibold text-[#18243A] cursor-pointer">
                    <input
                      type="radio"
                      name="modeInstallation"
                      disabled={isReadOnly}
                      checked={formData.modeInstallation === mode}
                      onChange={() => setFormData({ ...formData, modeInstallation: mode })}
                      className="text-[#10B9A9] focus:ring-[#10B9A9]"
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Subcard 2: Facteurs déclenchants */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EDF2F7]">
            <Zap className="w-4 h-4 text-[#10B9A9]" />
            <label className="block text-xs font-bold text-[#18243A] uppercase tracking-wider">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selected
                      ? 'bg-[#10B9A9] text-white shadow-xs'
                      : 'bg-white text-[#18243A] border border-[#CBD5E1] hover:border-[#10B9A9]'
                  } ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  {selected ? '✓ ' : '+ '} {facteur}
                </button>
              );
            })}
          </div>

          {formData.facteursDeclenchants.includes('Autre') && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Précision pour le facteur « Autre » <span className="text-[#F43F5E]">*</span> (BR-008)
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
                className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Ex: Conflit foncier, sorcellerie perçue, maladie physique..."
              />
            </div>
          )}
        </div>

        {/* Subcard 3: Récit clinique & Évolution */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EDF2F7]">
            <History className="w-4 h-4 text-[#10B9A9]" />
            <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              Chronologie & Récit de l'Épisode
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Récit chronologique et itinéraire thérapeutique
            </label>
            <textarea
              rows={5}
              disabled={isReadOnly}
              value={formData.itineraireTherapeutique || ''}
              onChange={(e) => setFormData({ ...formData, itineraireTherapeutique: e.target.value })}
              className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-xl p-3.5 focus:outline-none leading-relaxed"
              placeholder="Décrire l'apparition des premiers signes, leur succession dans le temps, les modifications comportementales, les consultations ou thérapeutiques déjà essayées..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Retentissement socio-professionnel & familial
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.retentissementSocioProfessionnel || ''}
              onChange={(e) =>
                setFormData({ ...formData, retentissementSocioProfessionnel: e.target.value })
              }
              className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
              placeholder="Ex: Arrêt de travail, déscolarisation, rupture des liens familiaux..."
            />
          </div>
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
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
