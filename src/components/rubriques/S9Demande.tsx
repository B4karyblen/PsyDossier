import React, { useState } from 'react';
import { useRubriqueForm } from '../../lib/useRubriqueForm';
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
  const [formData, setFormData, form] = useRubriqueForm<S9DemandeData>(data);
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
    <div className="clinical-card p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-ink-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip chip-neutral tabular-nums">
              S9 · PSYCHODYNAMIQUE
            </span>
            <span className="text-xs text-ink-500">Analyse de la demande</span>
          </div>
          <h2 className="text-h2 text-ink-900 mt-2">
            Demande du Patient (Manifeste & Latente)
          </h2>
          <p className="text-base text-ink-500 mt-1">
            Distinction clinique entre la demande manifeste consciente et la demande inconsciente sous-jacente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subcard 1: Demande manifeste */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <MessageSquare className="w-4 h-4 text-primary-600" />
            <h3 className="text-base font-bold text-ink-900">
              1. Demande Manifeste / Consciente
            </h3>
          </div>
          <label className="field-label">
            Ce que le patient exprime et réclame explicitement
          </label>
          <textarea
            rows={4}
            disabled={isReadOnly}
            value={formData.demandeConsciente || ''}
            onChange={(e) => setFormData({ ...formData, demandeConsciente: e.target.value })}
            className="clinical-input w-full leading-relaxed"
            placeholder="Ex: « Je veux retrouver le sommeil et calmer mon angoisse pour pouvoir retravailler »..."
          />
        </div>

        {/* Subcard 2: Demande inconsciente */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-ink-100">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-primary-600" />
              <h3 className="text-base font-bold text-ink-900">
                2. Demande Inconsciente / Latente (B2 : Psychiatre & Psychologue)
              </h3>
            </div>
            {!canEditInconsciente && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3" /> Lecture seule
              </span>
            )}
          </div>
          <label className="field-label">
            Analyse psychodynamique des enjeux relationnels, bénéfices secondaires et transfert
          </label>
          <textarea
            rows={4}
            disabled={!canEditInconsciente}
            value={formData.demandeInconsciente || ''}
            onChange={(e) => setFormData({ ...formData, demandeInconsciente: e.target.value })}
            className="clinical-input w-full leading-relaxed"
            placeholder="Ex: Recherche de dépendance maternelle, décharge de responsabilité, besoin de punition, identification au parent perdu..."
          />
        </div>

        {/* Subcard 3: Demande de l'entourage */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-3">
          <label className="field-label">
            3. Demande Exprimée par l’Entourage / Accompagnateurs
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            value={formData.demandeEntourage || ''}
            onChange={(e) => setFormData({ ...formData, demandeEntourage: e.target.value })}
            className="clinical-input w-full"
            placeholder="Attente de la famille (soulagement du fardeau, sédation, placement, reprise du rôle familial...)"
          />
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
          isDirty={form.isDirty}
          onCancel={form.reset}
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
