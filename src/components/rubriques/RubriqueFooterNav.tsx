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
}

export const RubriqueFooterNav: React.FC<RubriqueFooterNavProps> = ({
  currentRubriqueId,
  isReadOnly,
  isSaved,
  onPrev,
  onNext,
  isFormValid = true,
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
            <span className="hidden sm:inline font-semibold text-ink-500">Précédent</span>
            <span className="font-bold text-brand-700">{prevRubrique.code}</span>
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Center Save Action & Feedback */}
      <div className="flex items-center gap-3">
        {isSaved && (
          <span className="chip bg-emerald-100 text-emerald-800 !py-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Enregistré avec succès
          </span>
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
            <span className="hidden sm:inline font-semibold text-ink-500">Suivant</span>
            <span className="font-bold text-brand-700">{nextRubrique.code}</span>
            <ChevronRight className="w-4 h-4 text-ink-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};
