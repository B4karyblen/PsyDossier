import React from 'react';
import { Save, ChevronRight, ChevronLeft, Check, CheckCircle2, Clock } from 'lucide-react';
import { RUBRIQUES_CONFIG } from '../../utils/rules';

interface RubriqueFooterNavProps {
  currentRubriqueId: string;
  isReadOnly: boolean;
  isSaved: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  isFormValid?: boolean;
  /** Unsaved edits in the form (PRD B4). */
  isDirty?: boolean;
  /** « Annuler » : restore the last saved values. */
  onCancel?: () => void;
}

export const RubriqueFooterNav: React.FC<RubriqueFooterNavProps> = ({
  currentRubriqueId,
  isReadOnly,
  isSaved,
  onPrev,
  onNext,
  isFormValid = true,
  isDirty = false,
  onCancel,
}) => {
  const currentIndex = RUBRIQUES_CONFIG.findIndex((r) => r.id === currentRubriqueId);
  const prevRubrique = currentIndex > 0 ? RUBRIQUES_CONFIG[currentIndex - 1] : null;
  const nextRubrique =
    currentIndex < RUBRIQUES_CONFIG.length - 1 ? RUBRIQUES_CONFIG[currentIndex + 1] : null;

  return (
    <div className="pt-5 mt-6 border-t border-ink-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
      {/* Previous button */}
      <div>
        {prevRubrique && onPrev ? (
          <button
            type="button"
            onClick={onPrev}
            className="btn-secondary"
            title={`Revenir à ${prevRubrique.code} : ${prevRubrique.titre}`}
          >
            <ChevronLeft className="w-4 h-4 text-ink-500" />
            <span className="hidden sm:inline font-medium text-ink-500">Précédent</span>
            <span className="font-semibold text-ink-900">{prevRubrique.code}</span>
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Center Save Action & Feedback */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {isDirty && !isReadOnly && (
          <span className="chip bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200">
            <span className="dot" />
            Modifications non enregistrées
          </span>
        )}
        {isSaved && !isDirty && (
          <span className="chip bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Enregistré avec succès
          </span>
        )}

        {!isReadOnly && onCancel && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Annuler les modifications non enregistrées de cette rubrique ?')) onCancel();
            }}
            disabled={!isDirty}
            className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
        )}

        {!isReadOnly && (
          <button
            type="submit"
            disabled={!isFormValid}
            className="btn-primary !px-5"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer la rubrique</span>
          </button>
        )}
      </div>

      {/* Next button */}
      <div>
        {nextRubrique && onNext ? (
          <button
            type="button"
            onClick={onNext}
            className="btn-secondary group"
            title={`Passer à ${nextRubrique.code} : ${nextRubrique.titre}`}
          >
            <span className="hidden sm:inline font-medium text-ink-500">Suivant</span>
            <span className="font-semibold text-ink-900">{nextRubrique.code}</span>
            <ChevronRight className="w-4 h-4 text-ink-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};
