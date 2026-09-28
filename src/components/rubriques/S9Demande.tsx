import React, { useState } from 'react';
import { S9DemandeData, UserRole } from '../../types';
import { Lock, MessageSquare, Compass, Sparkles } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S9DemandeData;
  isReadOnly: boolean;
  currentUserRole: UserRole;
  onSave: (data: S9DemandeData) => void;
  onNext: () => void;
  onPrev?: () => void;
}

export const S9Demande: React.FC<Props> = ({
  data,
  isReadOnly,
  currentUserRole,
  onSave,
  onNext,
  onPrev,
}) => {
  const [formData, setFormData] = useState<S9DemandeData>(data);
  const [isSaved, setIsSaved] = useState(false);

  // BR-014 / B2: Seuls Psychiatre et Psychologue peuvent modifier la demande inconsciente
  const canEditInconsciente = ['PSYCHIATRE', 'PSYCHOLOGUE'].includes(currentUserRole) && !isReadOnly;

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
              S9 · PSYCHODYNAMIQUE
            </span>
            <span className="text-xs text-[#64748B]">Analyse de la demande</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#18243A] tracking-tight mt-1">
            Demande du Patient (Manifeste & Latente)
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Distinction clinique entre la demande manifeste consciente et la demande inconsciente sous-jacente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subcard 1: Demande manifeste */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EDF2F7]">
            <MessageSquare className="w-4 h-4 text-[#10B9A9]" />
            <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              1. Demande Manifeste / Consciente
            </h3>
          </div>
          <label className="block text-xs font-semibold text-[#18243A]">
            Ce que le patient exprime et réclame explicitement
          </label>
          <textarea
            rows={4}
            disabled={isReadOnly}
            value={formData.demandeConsciente || ''}
            onChange={(e) => setFormData({ ...formData, demandeConsciente: e.target.value })}
            className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-xl p-3.5 focus:outline-none leading-relaxed"
            placeholder="Ex: « Je veux retrouver le sommeil et calmer mon angoisse pour pouvoir retravailler »..."
          />
        </div>

        {/* Subcard 2: Demande inconsciente */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EDF2F7]">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#10B9A9]" />
              <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
                2. Demande Inconsciente / Latente (B2 : Psychiatre & Psychologue)
              </h3>
            </div>
            {!canEditInconsciente && (
              <span className="text-[11px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3" /> Lecture seule
              </span>
            )}
          </div>
          <label className="block text-xs font-semibold text-[#18243A]">
            Analyse psychodynamique des enjeux relationnels, bénéfices secondaires et transfert
          </label>
          <textarea
            rows={4}
            disabled={!canEditInconsciente}
            value={formData.demandeInconsciente || ''}
            onChange={(e) => setFormData({ ...formData, demandeInconsciente: e.target.value })}
            className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-xl p-3.5 focus:outline-none leading-relaxed"
            placeholder="Ex: Recherche de dépendance maternelle, décharge de responsabilité, besoin de punition, identification au parent perdu..."
          />
        </div>

        {/* Subcard 3: Demande de l'entourage */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3">
          <label className="block text-xs font-bold text-[#18243A] uppercase tracking-wider">
            3. Demande Exprimée par l’Entourage / Accompagnateurs
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            value={formData.demandeEntourage || ''}
            onChange={(e) => setFormData({ ...formData, demandeEntourage: e.target.value })}
            className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-xl p-3.5 focus:outline-none"
            placeholder="Attente de la famille (soulagement du fardeau, sédation, placement, reprise du rôle familial...)"
          />
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
          currentRubriqueId="s9"
          isReadOnly={isReadOnly}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};
