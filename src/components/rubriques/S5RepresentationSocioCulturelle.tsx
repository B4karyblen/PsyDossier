import React, { useState } from 'react';
import { S5RepresentationData } from '../../types';
import { Globe2, Sparkles, MessageCircle } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S5RepresentationData;
  isReadOnly: boolean;
  onSave: (data: S5RepresentationData) => void;
  onNext: () => void;
  onPrev?: () => void;
}

const CATEGORIES_SOCIO = [
  'Sorcellerie',
  'Envoûtement',
  'Djinn',
  'Mauvais œil',
  'Sortilège',
  'Rupture d’interdit / Tabou',
  'Autre',
];

export const S5RepresentationSocioCulturelle: React.FC<Props> = ({
  data,
  isReadOnly,
  onSave,
  onNext,
  onPrev,
}) => {
  const [formData, setFormData] = useState<S5RepresentationData>(data);
  const [isSaved, setIsSaved] = useState(false);

  const toggleCategory = (cat: string) => {
    if (isReadOnly) return;
    const current = formData.categories || [];
    if (current.includes(cat)) {
      setFormData({ ...formData, categories: current.filter((c) => c !== cat) });
    } else {
      setFormData({ ...formData, categories: [...current, cat] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              S5 · ANAMNÈSE
            </span>
            <span className="text-xs text-[#64748B]">Psychiatrie transculturelle</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#18243A] tracking-tight mt-1">
            Représentation Socio-Culturelle de la Maladie
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Compréhension profane, étiologies traditionnelles formulées par le patient et son entourage
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subcard 1: Catégories étiologiques traditionnelles */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EDF2F7]">
            <Globe2 className="w-4 h-4 text-[#10B9A9]" />
            <label className="block text-xs font-bold text-[#18243A] uppercase tracking-wider">
              Étiologies & Croyances Évoquées par le Milieu Culturel
            </label>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES_SOCIO.map((cat) => {
              const selected = (formData.categories || []).includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selected
                      ? 'bg-[#10B9A9] text-white shadow-xs'
                      : 'bg-white text-[#18243A] border border-[#CBD5E1] hover:border-[#10B9A9]'
                  } ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  {selected ? '✓ ' : '+ '} {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcard 2: Explications du patient */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EDF2F7]">
            <MessageCircle className="w-4 h-4 text-[#10B9A9]" />
            <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              Explications Profanes Détaillées
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Explication de la maladie selon le patient
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={formData.explicationPatient || ''}
              onChange={(e) => setFormData({ ...formData, explicationPatient: e.target.value })}
              className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-xl p-3 focus:outline-none"
              placeholder="Comment le patient interprète-t-il sa souffrance ? (Ex: Attaque mystique, punition, malchance, fatigue intellectuelle...)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Explication de la maladie selon la famille / entourage
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={formData.explicationFamille || ''}
              onChange={(e) => setFormData({ ...formData, explicationFamille: e.target.value })}
              className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-xl p-3 focus:outline-none"
              placeholder="Interprétation avancée par les parents, conjoints, tuteurs..."
            />
          </div>
        </div>

        {/* Subcard 3: Recours antérieurs & Précisions */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-2">
          <label className="block text-xs font-bold text-[#18243A] uppercase tracking-wider">
            Recours Thérapeutiques Antérieurs & Précisions
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            value={formData.precisions || ''}
            onChange={(e) => setFormData({ ...formData, precisions: e.target.value })}
            className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-xl p-3 focus:outline-none"
            placeholder="Noter les soins traditionnels déjà reçus, lavages, décoctions, rituels religieux, scarifications, ou précisions socioculturelles..."
          />
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
          currentRubriqueId="s5"
          isReadOnly={isReadOnly}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};
