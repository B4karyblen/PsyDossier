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
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F7]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2.5 py-0.5 rounded-md border border-[#10B9A9]/20">
              S8 · SOCIAL & ENVIRONNEMENT
            </span>
            <span className="text-xs text-[#64748B]">Personnalité & Insertion</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#18243A] tracking-tight mt-1">
            Enquête Sociale & Personnalité Prémorbide
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Autodescription, hétérodescription par l’entourage, insertion relationnelle et centres d'intérêt
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subcard 1: Autodescription & Hétérodescription */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EDF2F7]">
            <UserCheck className="w-4 h-4 text-[#10B9A9]" />
            <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              Traits de Caractère & Personnalité Antérieure
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Autodescription (Comment le patient se décrit-il lui-même avant l'apparition des troubles ?)
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={formData.autodescription || ''}
              onChange={(e) => setFormData({ ...formData, autodescription: e.target.value })}
              className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-3 focus:outline-none"
              placeholder="Ex: Calme, sociable, réservé, perfectionniste, anxieux, colérique..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Hétérodescription (Description du patient par l'entourage / famille)
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={formData.heterodescription || ''}
              onChange={(e) => setFormData({ ...formData, heterodescription: e.target.value })}
              className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-3 focus:outline-none"
              placeholder="Ex: Toujours dévoué, généreux, sans histoire, ou au contraire susceptible, isolé..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Source de l'hétérodescription (Qui a fourni cette description ?)
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.heterodescriptionSource || ''}
              onChange={(e) => setFormData({ ...formData, heterodescriptionSource: e.target.value })}
              className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2.5 focus:outline-none"
              placeholder="Ex: Épouse, mère, frère aîné, ami d'enfance..."
            />
          </div>
        </div>

        {/* Subcard 2: Relations & Loisirs */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EDF2F7]">
            <Heart className="w-4 h-4 text-[#10B9A9]" />
            <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              Vie Relationnelle & Centres d'Intérêt
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Relations avec les pairs & insertion sociale
            </label>
            <textarea
              rows={2}
              disabled={isReadOnly}
              value={formData.relationsSociales || ''}
              onChange={(e) => setFormData({ ...formData, relationsSociales: e.target.value })}
              className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-3 focus:outline-none"
              placeholder="Amis intimes, intégration dans le quartier, associations, relations de travail..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Loisirs, activités culturelles et sportives
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.loisirs || ''}
              onChange={(e) => setFormData({ ...formData, loisirs: e.target.value })}
              className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2.5 focus:outline-none"
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
