import React, { useState } from 'react';
import { useRubriqueForm } from '../../lib/useRubriqueForm';
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
  const [formData, setFormData, form] = useRubriqueForm<S5RepresentationData>(data);
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
    <div className="clinical-card p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-ink-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip chip-neutral tabular-nums">
              S5 · ANAMNÈSE
            </span>
            <span className="text-xs text-ink-500">Psychiatrie transculturelle</span>
          </div>
          <h2 className="text-h2 text-ink-900 mt-2">
            Représentation Socio-Culturelle de la Maladie
          </h2>
          <p className="text-base text-ink-500 mt-1">
            Compréhension profane, étiologies traditionnelles formulées par le patient et son entourage
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subcard 1: Catégories étiologiques traditionnelles */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <Globe2 className="w-4 h-4 text-primary-600" />
            <label className="field-label">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selected
                      ? 'bg-primary-900 text-white'
                      : 'bg-white text-ink-900 border border-ink-200 hover:border-primary-500'
                  } ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  {selected ? '✓ ' : '+ '} {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcard 2: Explications du patient */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <MessageCircle className="w-4 h-4 text-primary-600" />
            <h3 className="text-base font-bold text-ink-900">
              Explications Profanes Détaillées
            </h3>
          </div>

          <div>
            <label className="field-label">
              Explication de la maladie selon le patient
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={formData.explicationPatient || ''}
              onChange={(e) => setFormData({ ...formData, explicationPatient: e.target.value })}
              className="clinical-input w-full"
              placeholder="Comment le patient interprète-t-il sa souffrance ? (Ex: Attaque mystique, punition, malchance, fatigue intellectuelle...)"
            />
          </div>

          <div>
            <label className="field-label">
              Explication de la maladie selon la famille / entourage
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={formData.explicationFamille || ''}
              onChange={(e) => setFormData({ ...formData, explicationFamille: e.target.value })}
              className="clinical-input w-full"
              placeholder="Interprétation avancée par les parents, conjoints, tuteurs..."
            />
          </div>
        </div>

        {/* Subcard 3: Recours antérieurs & Précisions */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-2">
          <label className="field-label">
            Recours Thérapeutiques Antérieurs & Précisions
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            value={formData.precisions || ''}
            onChange={(e) => setFormData({ ...formData, precisions: e.target.value })}
            className="clinical-input w-full"
            placeholder="Noter les soins traditionnels déjà reçus, lavages, décoctions, rituels religieux, scarifications, ou précisions socioculturelles..."
          />
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
          isDirty={form.isDirty}
          onCancel={form.reset}
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
