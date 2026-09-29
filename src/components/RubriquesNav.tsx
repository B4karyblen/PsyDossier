import React, { useState } from 'react';
import { DossierPsychiatrique, UserRole } from '../types';
import { RUBRIQUES_CONFIG, getRubriqueCompleteness, getRubriquePermission } from '../utils/rules';
import { Check, Lock, EyeOff, ChevronDown } from 'lucide-react';

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
    { title: 'Administratif', items: RUBRIQUES_CONFIG.slice(0, 2) },
    { title: 'Anamnèse', items: RUBRIQUES_CONFIG.slice(2, 5) },
    { title: 'Antécédents & social', items: RUBRIQUES_CONFIG.slice(5, 9) },
    { title: 'Clinique & synthèse', items: RUBRIQUES_CONFIG.slice(9, 13) },
    { title: 'Prise en charge & suivi', items: RUBRIQUES_CONFIG.slice(13, 17) },
  ];

  // Count total completed
  const completedCount = RUBRIQUES_CONFIG.filter(
    (r) => getRubriqueCompleteness(dossier, r.id) === 'COMPLETE'
  ).length;

  const percentage = Math.round((completedCount / 17) * 100);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const activeRubrique = RUBRIQUES_CONFIG.find((r) => r.id === activeRubriqueId);

  return (
    <aside
      aria-label="Rubriques du dossier"
      className="w-full lg:w-72 shrink-0 clinical-card p-4 h-fit self-start lg:sticky lg:top-20 no-print"
    >
      {/* Progress header */}
      <div className="rounded-2xl bg-ink-900 text-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">Plan type · 17 rubriques</h2>
          <span className="text-xs font-extrabold tabular-nums text-brand-300">
            {completedCount}/17
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-300 to-brand-500 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-[11px] font-medium text-ink-300 mt-2">
          {percentage}% des rubriques complètes
        </p>
      </div>

      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setIsMobileOpen((v) => !v)}
        aria-expanded={isMobileOpen}
        className="lg:hidden mt-3 w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-brand-50 text-brand-800 text-sm font-bold cursor-pointer"
      >
        <span className="truncate">
          {activeRubrique ? `${activeRubrique.code} · ${activeRubrique.titre}` : 'Choisir une rubrique'}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Rubrique blocks */}
      <div className={`mt-4 space-y-4 lg:max-h-[calc(100vh-260px)] overflow-y-auto -mr-2 pr-2 ${isMobileOpen ? 'block' : 'hidden'} lg:block`}>
        {blocks.map((block) => (
          <div key={block.title}>
            <div className="px-2 pb-1.5 text-[11px] font-bold text-ink-400 tracking-wide">{block.title}</div>

            <div className="space-y-0.5">
              {block.items.map((rubrique) => {
                const completeness = getRubriqueCompleteness(dossier, rubrique.id);
                const permission = getRubriquePermission(currentUserRole, rubrique.id);
                const isActive = activeRubriqueId === rubrique.id;
                const isHidden = permission === 'none';
                const isReadOnly = permission === 'read';

                const statusDot = isHidden ? (
                  <span title="Accès restreint pour votre rôle clinique">
                    <EyeOff className="w-3.5 h-3.5 text-ink-300" />
                  </span>
                ) : completeness === 'COMPLETE' ? (
                  <span
                    className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white"
                    title="Rubrique complète"
                  >
                    <Check className="w-3 h-3" strokeWidth={3.5} />
                  </span>
                ) : completeness === 'PARTIELLE' ? (
                  <span
                    className="w-5 h-5 rounded-full border-2 border-amber-400 bg-amber-50 flex items-center justify-center"
                    title="Rubrique en cours de saisie"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </span>
                ) : (
                  <span className="block w-5 h-5 rounded-full border-2 border-ink-200" title="Non commencée" />
                );

                return (
                  <button
                    key={rubrique.id}
                    onClick={() => {
                      onSelectRubrique(rubrique.id);
                      setIsMobileOpen(false);
                    }}
                    aria-current={isActive ? 'step' : undefined}
                    className={`w-full !min-h-10 flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-brand-50 text-brand-800 font-bold ring-1 ring-inset ring-brand-200'
                        : isHidden
                        ? 'text-ink-400 hover:bg-ink-50 font-medium'
                        : 'text-ink-700 hover:text-ink-900 hover:bg-ink-50 font-semibold'
                    }`}
                  >
                    <span
                      className={`w-8 shrink-0 text-[11px] font-extrabold tabular-nums ${
                        isActive ? 'text-brand-700' : 'text-ink-400'
                      }`}
                    >
                      {rubrique.code}
                    </span>
                    <span className="truncate flex-1">{rubrique.titre}</span>
                    {isReadOnly && !isHidden && (
                      <span title="Lecture seule pour votre profil">
                        <Lock className="w-3 h-3 text-ink-400" />
                      </span>
                    )}
                    <span className="shrink-0 flex">{statusDot}</span>
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
