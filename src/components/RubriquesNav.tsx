import React from 'react';
import { DossierPsychiatrique, UserRole } from '../types';
import { RUBRIQUES_CONFIG, getRubriqueCompleteness, getRubriquePermission } from '../utils/rules';
import { Check, Clock, Circle, Lock, EyeOff } from 'lucide-react';

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
    { title: 'PRISE EN CHARGE', items: RUBRIQUES_CONFIG.slice(13, 17) },
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-white border border-[#D9E2E8] rounded-xl p-3 shadow-xs h-fit self-start sticky top-20 no-print">
      <div className="pb-2 mb-2 border-b border-[#E8EEF2] flex items-center justify-between">
        <h2 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
          Plan Type (17 Rubriques)
        </h2>
        <span className="text-[11px] text-[#64748B]">S1 — S17</span>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
        {blocks.map((block) => (
          <div key={block.title} className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
              {block.title}
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
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#ECFBF9] text-[#07988D] font-semibold border-l-3 border-[#10B9A9]'
                        : isHidden
                        ? 'text-[#94A3B8] hover:bg-[#F1F5F7]'
                        : 'text-[#18243A] hover:bg-[#F1F5F7]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <span
                        className={`font-mono text-[11px] font-semibold px-1 py-0.5 rounded ${
                          isActive
                            ? 'bg-[#D9F7F3] text-[#07988D]'
                            : isHidden
                            ? 'bg-[#F1F5F7] text-[#94A3B8]'
                            : 'bg-[#F1F5F7] text-[#64748B]'
                        }`}
                      >
                        {rubrique.code}
                      </span>
                      <span className="truncate">{rubrique.titre}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                      {isHidden ? (
                        <span title="Accès restreint pour votre rôle (B2)">
                          <EyeOff className="w-3.5 h-3.5 text-[#94A3B8]" />
                        </span>
                      ) : isReadOnly ? (
                        <span title="Lecture seule pour votre rôle">
                          <Lock className="w-3 h-3 text-[#94A3B8]" />
                        </span>
                      ) : null}

                      {!isHidden && completeness === 'COMPLETE' && (
                        <span className="w-4 h-4 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#15803D]" title="Rubrique complète">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                      {!isHidden && completeness === 'PARTIELLE' && (
                        <span className="w-4 h-4 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#B45309]" title="Rubrique partielle">
                          <Clock className="w-2.5 h-2.5" />
                        </span>
                      )}
                      {!isHidden && completeness === 'NON_COMMENCEE' && (
                        <span className="w-4 h-4 rounded-full bg-[#F1F5F7] flex items-center justify-center text-[#94A3B8]" title="Non commencée">
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
