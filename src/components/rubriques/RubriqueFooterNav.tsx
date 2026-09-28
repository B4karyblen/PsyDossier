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
    <div className="pt-5 mt-6 border-t border-[#EDF2F7] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
      {/* Previous button */}
      <div>
        {prevRubrique && onPrev ? (
          <button
            type="button"
            onClick={onPrev}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl transition-all cursor-pointer"
            title={`Revenir à ${prevRubrique.code} : ${prevRubrique.titre}`}
          >
            <ChevronLeft className="w-4 h-4 text-[#64748B]" />
            <span className="hidden sm:inline">Précédent :</span>
            <span className="font-bold text-[#07988D]">{prevRubrique.code}</span>
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Center Save Action & Feedback */}
      <div className="flex items-center gap-3">
        {isSaved && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D] bg-[#DCFCE7] px-3 py-1.5 rounded-xl border border-[#86EFAC]/40 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Enregistré avec succès
          </span>
        )}

        {!isReadOnly && (
          <button
            type="submit"
            disabled={!isFormValid}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#10B9A9] hover:bg-[#07988D] active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm shadow-[#10B9A9]/25 cursor-pointer"
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
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#18243A] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl transition-all cursor-pointer group"
            title={`Passer à ${nextRubrique.code} : ${nextRubrique.titre}`}
          >
            <span className="hidden sm:inline">Suivant :</span>
            <span className="font-bold text-[#07988D]">{nextRubrique.code}</span>
            <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};
