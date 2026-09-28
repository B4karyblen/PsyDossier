import React from 'react';
import { DossierPsychiatrique, UserRole } from '../types';
import { RUBRIQUES_CONFIG, getRubriqueCompleteness, getRubriquePermission } from '../utils/rules';
import { Check, Clock, Circle, Lock, EyeOff, Sparkles, ChevronRight } from 'lucide-react';

interface RubriquesNavProps {
  dossier: DossierPsychiatrique;
  activeRubriqueId: string;
  onSelectRubrique: (id: string) => void;
  currentUserRole: UserRole;
}

export const RubriquesNav: React.FC<RubriquesNavProps> = ({
  dossier,
  activeRubriqueId,
  onSelectRubrique,
  currentUserRole,
}) => {
  const blocks = [
    { title: 'ADMINISTRATIF', items: RUBRIQUES_CONFIG.slice(0, 2) },
    { title: 'ANAMNÈSE', items: RUBRIQUES_CONFIG.slice(2, 5) },
    { title: 'ANTÉCÉDENTS & SOCIAL', items: RUBRIQUES_CONFIG.slice(5, 9) },
    { title: 'CLINIQUE & SYNTHÈSE', items: RUBRIQUES_CONFIG.slice(9, 13) },
    { title: 'PRISE EN CHARGE & SUIVI', items: RUBRIQUES_CONFIG.slice(13, 17) },
  ];

  // Count total completed
  const completedCount = RUBRIQUES_CONFIG.filter(
    (r) => getRubriqueCompleteness(dossier, r.id) === 'COMPLETE'
  ).length;

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-[#1E293B] border border-[#334155] rounded-2xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.15)] h-fit self-start sticky top-18 no-print">
      {/* Title & Micro Progress */}
      <div className="pb-3 mb-3 border-b border-[#334155]">
        <div className="flex items-center justify-between">
          <h2 className="text-label text-slate-400">
            Plan Type (17 Rubriques)
          </h2>
          <span className="text-mono text-caption font-bold text-[#10B9A9] bg-[#10B9A9]/10 px-2 py-0.5 rounded-md border border-[#10B9A9]/20">
            {completedCount} / 17
          </span>
        </div>
        <p className="text-caption text-slate-500 mt-1">
          Dossier psychiatrique structuré de référence
        </p>
      </div>

      {/* Rubrique blocks */}
      <div className="space-y-4 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
        {blocks.map((block) => (
          <div key={block.title} className="space-y-1">
            <div className="px-2 py-1 text-label text-slate-500 flex items-center justify-between">
              <span>{block.title}</span>
            </div>

            <div className="space-y-0.5">
              {block.items.map((rubrique) => {
                const completeness = getRubriqueCompleteness(dossier, rubrique.id);
                const permission = getRubriquePermission(currentUserRole, rubrique.id);
                const isActive = activeRubriqueId === rubrique.id;
                const isHidden = permission === 'none';
                const isReadOnly = permission === 'read';

                return (
                  <button
                    key={rubrique.id}
                    onClick={() => onSelectRubrique(rubrique.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-body-sm font-medium text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#10B9A9]/15 text-[#10B9A9] font-bold border-l-4 border-[#10B9A9] shadow-xs'
                        : isHidden
                        ? 'text-slate-600 hover:bg-[#334155]'
                        : 'text-slate-300 hover:text-white hover:bg-[#334155]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <span
                        className={`text-mono text-caption font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                          isActive
                            ? 'bg-[#10B9A9]/20 text-[#10B9A9]'
                            : isHidden
                            ? 'bg-[#334155] text-slate-600'
                            : 'bg-[#334155] text-slate-400'
                        }`}
                      >
                        {rubrique.code}
                      </span>
                      <span className="truncate">{rubrique.titre}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                      {isHidden ? (
                        <span title="Accès restreint pour votre rôle clinique">
                          <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                        </span>
                      ) : isReadOnly ? (
                        <span title="Lecture seule pour votre profil">
                          <Lock className="w-3 h-3 text-slate-500" />
                        </span>
                      ) : null}

                      {!isHidden && completeness === 'COMPLETE' && (
                        <span
                          className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"
                          title="Rubrique complète"
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                      {!isHidden && completeness === 'PARTIELLE' && (
                        <span
                          className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400"
                          title="Rubrique en cours de saisie"
                        >
                          <Clock className="w-2.5 h-2.5" />
                        </span>
                      )}
                      {!isHidden && completeness === 'NON_COMMENCEE' && (
                        <span
                          className="w-4 h-4 rounded-full bg-[#334155] flex items-center justify-center text-slate-500"
                          title="Non commencée"
                        >
                          <Circle className="w-2 h-2" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
