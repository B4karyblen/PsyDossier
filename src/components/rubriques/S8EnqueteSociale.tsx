import React, { useState } from 'react';
import { S8EnqueteSocialeData } from '../../types';
import { UserCheck, Users, Heart, Palette } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S8EnqueteSocialeData;
  isReadOnly: boolean;
  onSave: (data: S8EnqueteSocialeData) => void;
  onNext: () => void;
  onPrev?: () => void;
}

export const S8EnqueteSociale: React.FC<Props> = ({
  data,
  isReadOnly,
  onSave,
  onNext,
  onPrev,
}) => {
  const [formData, setFormData] = useState<S8EnqueteSocialeData>(data);
  const [isSaved, setIsSaved] = useState(false);

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
              S8 · SOCIAL & ENVIRONNEMENT
            </span>
            <span className="text-xs text-ink-500">Personnalité & Insertion</span>
          </div>
          <h2 className="text-h2 text-ink-900 mt-2">
            Enquête Sociale & Personnalité Prémorbide
          </h2>
          <p className="text-base text-ink-500 mt-1">
            Autodescription, hétérodescription par l’entourage, insertion relationnelle et centres d'intérêt
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subcard 1: Autodescription & Hétérodescription */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <UserCheck className="w-4 h-4 text-primary-600" />
            <h3 className="text-base font-bold text-ink-900">
              Traits de Caractère & Personnalité Antérieure
            </h3>
          </div>

          <div>
            <label className="field-label">
              Autodescription (Comment le patient se décrit-il lui-même avant l'apparition des troubles ?)
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={formData.autodescription || ''}
              onChange={(e) => setFormData({ ...formData, autodescription: e.target.value })}
              className="clinical-input w-full"
              placeholder="Ex: Calme, sociable, réservé, perfectionniste, anxieux, colérique..."
            />
          </div>

          <div>
            <label className="field-label">
              Hétérodescription (Description du patient par l'entourage / famille)
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={formData.heterodescription || ''}
              onChange={(e) => setFormData({ ...formData, heterodescription: e.target.value })}
              className="clinical-input w-full"
              placeholder="Ex: Toujours dévoué, généreux, sans histoire, ou au contraire susceptible, isolé..."
            />
          </div>

          <div>
            <label className="field-label">
              Source de l'hétérodescription (Qui a fourni cette description ?)
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.heterodescriptionSource || ''}
              onChange={(e) => setFormData({ ...formData, heterodescriptionSource: e.target.value })}
              className="clinical-input w-full"
              placeholder="Ex: Épouse, mère, frère aîné, ami d'enfance..."
            />
          </div>
        </div>

        {/* Subcard 2: Relations & Loisirs */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <Heart className="w-4 h-4 text-primary-600" />
            <h3 className="text-base font-bold text-ink-900">
              Vie Relationnelle & Centres d'Intérêt
            </h3>
          </div>

          <div>
            <label className="field-label">
              Relations avec les pairs & insertion sociale
            </label>
            <textarea
              rows={2}
              disabled={isReadOnly}
              value={formData.relationsSociales || ''}
              onChange={(e) => setFormData({ ...formData, relationsSociales: e.target.value })}
              className="clinical-input w-full"
              placeholder="Amis intimes, intégration dans le quartier, associations, relations de travail..."
            />
          </div>

          <div>
            <label className="field-label">
              Loisirs, activités culturelles et sportives
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.loisirs || ''}
              onChange={(e) => setFormData({ ...formData, loisirs: e.target.value })}
              className="clinical-input w-full"
              placeholder="Ex: Football, lecture, musique, thé au grin, religion..."
            />
          </div>
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
          currentRubriqueId="s8"
          isReadOnly={isReadOnly}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};
