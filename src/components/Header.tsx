import React from 'react';
import { UserProfile, DossierPsychiatrique } from '../types';
import { Menu, Search, Plus, ChevronRight } from 'lucide-react';

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

  const crumbBtn = 'hover:text-ink-900 font-semibold transition-colors cursor-pointer !min-h-0 !min-w-0';

  const renderBreadcrumbs = () => (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-[13px] text-ink-500 min-w-0">
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
    <header className="sticky top-0 z-20 bg-canvas/85 backdrop-blur-xl border-b border-ink-150/70 px-4 sm:px-6 lg:px-8 h-16 flex items-center no-print">
      <div className="w-full flex items-center justify-between gap-3 sm:gap-6">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden -ml-2 p-2 rounded-xl text-ink-600 hover:text-ink-900 hover:bg-white transition-colors cursor-pointer"
            aria-label="Ouvrir le menu de navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            {renderBreadcrumbs()}
            <h1 className="text-[17px] font-extrabold text-ink-900 tracking-tight truncate leading-tight">
              {activeView === 'DOSSIER' && activeRubriqueTitle ? activeRubriqueTitle : viewTitles[activeView]}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenQuickSearch}
            className="hidden md:flex items-center gap-2.5 w-64 xl:w-80 pl-3.5 pr-2 py-2 bg-white hover:border-ink-300 border border-ink-150 rounded-xl text-body-sm text-ink-400 transition-colors cursor-pointer shadow-2xs"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="truncate font-medium">Patient, N° d'ordre, CIM…</span>
            <kbd className="ml-auto text-[11px] font-bold bg-ink-50 text-ink-500 px-1.5 py-0.5 rounded-md border border-ink-150 shrink-0">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={onOpenQuickSearch}
            className="md:hidden p-2 text-ink-600 hover:text-ink-900 hover:bg-white rounded-xl transition-colors cursor-pointer"
            aria-label="Recherche (⌘K)"
          >
            <Search className="w-5 h-5" />
          </button>

          <button type="button" onClick={onOpenNewPatient} className="btn-primary !py-2 !px-3 sm:!px-4 whitespace-nowrap">
            <Plus className="w-4 h-4" strokeWidth={2.75} />
            <span className="hidden sm:inline">Nouveau patient</span>
          </button>

          <div
            className="hidden sm:flex w-10 h-10 rounded-xl bg-ink-900 text-white items-center justify-center text-xs font-extrabold shrink-0"
            title={`${currentUser.name} · ${currentUser.role}`}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};
