import React from 'react';
import { UserProfile, DossierPsychiatrique } from '../types';
import { Menu, Search, ChevronRight } from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  activeView: 'DASHBOARD' | 'REGISTRE' | 'DOSSIER' | 'AUDIT' | 'REFERENTIELS';
  onChangeView: (view: 'DASHBOARD' | 'REGISTRE' | 'DOSSIER' | 'AUDIT' | 'REFERENTIELS') => void;
  onOpenNewPatient: () => void;
  onOpenQuickSearch: () => void;
  onOpenMobileMenu: () => void;
  activeDossier: DossierPsychiatrique | null;
  activeRubriqueTitle?: string;
  onOpenExport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectUser,
  activeView,
  onChangeView,
  onOpenNewPatient,
  onOpenQuickSearch,
  onOpenMobileMenu,
  activeDossier,
  activeRubriqueTitle,
  onOpenExport,
}) => {
  const viewTitles: Record<HeaderProps['activeView'], string> = {
    DASHBOARD: 'Tableau de bord',
    REGISTRE: 'Registre des patients',
    AUDIT: "Journal d'audit médico-légal",
    REFERENTIELS: 'Nomenclatures & CIM-10',
    DOSSIER: 'Dossier patient',
  };

  const initials = currentUser.name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const crumbBtn = 'hover:text-ink-900 font-medium transition-colors cursor-pointer !min-h-0 !min-w-0';

  const renderBreadcrumbs = () => (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm text-ink-500 min-w-0 shrink-0">
      {activeView === 'DOSSIER' && activeDossier ? (
        <>
          <button onClick={() => onChangeView('REGISTRE')} className={`${crumbBtn} hidden sm:inline`}>
            Registre
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-ink-300 shrink-0 hidden sm:inline" />
          <button
            onClick={() => onChangeView('DOSSIER')}
            className={`${crumbBtn} tabular-nums truncate max-w-[140px] sm:max-w-none`}
          >
            {activeDossier.s1Identification.numeroOrdre}
          </button>
        </>
      ) : (
        <button onClick={() => onChangeView('DASHBOARD')} className={crumbBtn}>
          PsyDossier
        </button>
      )}
    </nav>
  );

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-ink-150 px-4 sm:px-6 lg:px-8 h-14 flex items-center no-print">
      <div className="w-full flex items-center justify-between gap-3 sm:gap-6">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="btn-icon lg:hidden -ml-2"
            aria-label="Ouvrir le menu de navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0 flex items-center gap-1.5 text-sm">
            {renderBreadcrumbs()}
            <ChevronRight className="w-3.5 h-3.5 text-ink-300 shrink-0" aria-hidden="true" />
            <h1 className="font-semibold text-ink-900 truncate">
              {activeView === 'DOSSIER' && activeRubriqueTitle ? activeRubriqueTitle : viewTitles[activeView]}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenQuickSearch}
            className="hidden md:flex !min-h-9 items-center gap-2 w-64 xl:w-72 pl-3 pr-1.5 py-1.5 bg-white hover:bg-ink-50 border border-ink-200 rounded-lg text-sm text-ink-400 transition-colors cursor-pointer shadow-[var(--shadow-soft)]"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="truncate font-medium">Rechercher un patient…</span>
            <kbd className="kbd ml-auto shrink-0">⌘K</kbd>
          </button>

          <button
            type="button"
            onClick={onOpenQuickSearch}
            className="btn-icon md:hidden"
            aria-label="Recherche (⌘K)"
          >
            <Search className="w-5 h-5" />
          </button>

          <div
            className="hidden sm:flex w-8 h-8 rounded-full bg-primary-900 text-white items-center justify-center text-[11px] font-semibold shrink-0"
            title={`${currentUser.name} · ${currentUser.role}`}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};
