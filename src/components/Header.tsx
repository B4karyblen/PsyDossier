import React from 'react';
import { UserProfile, DossierPsychiatrique } from '../types';
import { CLINICAL_USERS } from '../data/initialData';
import {
  Menu,
  Search,
  Plus,
  Printer,
  ChevronRight,
  ShieldCheck,
  Activity,
  FileText,
  User,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

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
  // Compute breadcrumbs dynamically
  const renderBreadcrumbs = () => {
    return (
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-[#64748B]">
        <button
          onClick={() => onChangeView('DASHBOARD')}
          className="hover:text-[#18243A] font-medium transition-colors cursor-pointer"
        >
          EHR
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />

        {activeView === 'DASHBOARD' && (
          <span className="font-extrabold text-[#18243A]">Tableau de Bord</span>
        )}

        {activeView === 'REGISTRE' && (
          <span className="font-extrabold text-[#18243A]">Registre des Patients</span>
        )}

        {activeView === 'AUDIT' && (
          <span className="font-extrabold text-[#18243A]">Journal d'Audit Médico-Légal</span>
        )}

        {activeView === 'REFERENTIELS' && (
          <span className="font-extrabold text-[#18243A]">Nomenclatures & CIM-10</span>
        )}

        {activeView === 'DOSSIER' && activeDossier && (
          <>
            <button
              onClick={() => onChangeView('REGISTRE')}
              className="hover:text-[#18243A] font-medium transition-colors cursor-pointer hidden sm:inline"
            >
              Registre
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0 hidden sm:inline" />
            <button
              onClick={() => onChangeView('DOSSIER')}
              className="font-mono font-bold text-[#07988D] hover:underline cursor-pointer truncate max-w-[120px] sm:max-w-[180px]"
            >
              {activeDossier.s1Identification.numeroOrdre}
            </button>
            {activeRubriqueTitle && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                <span className="font-extrabold text-[#18243A] truncate max-w-[130px] sm:max-w-[220px]">
                  {activeRubriqueTitle}
                </span>
              </>
            )}
          </>
        )}
      </nav>
    );
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-2.5 no-print shadow-2xs transition-all">
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {/* Left Side: Mobile Menu Button & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-[#475569] hover:text-[#18243A] hover:bg-[#F1F5F7] transition-colors cursor-pointer"
            aria-label="Ouvrir le menu de navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <div className="min-w-0">{renderBreadcrumbs()}</div>
        </div>

        {/* Center: Command Search Input Button */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            type="button"
            onClick={onOpenQuickSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F7] border border-[#CBD5E1] hover:border-[#10B9A9] rounded-xl text-xs text-[#64748B] transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#10B9A9] transition-colors shrink-0" />
              <span className="truncate font-medium">Rechercher patient, N° d'ordre, pathologie ou CIM...</span>
            </div>
            <kbd className="font-mono text-[10px] font-bold bg-white text-[#475569] px-2 py-0.5 rounded-md border border-[#CBD5E1] shadow-2xs shrink-0 ml-2">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Side: Quick Actions & User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={onOpenQuickSearch}
            className="md:hidden p-2 text-[#475569] hover:text-[#18243A] hover:bg-[#F1F5F7] rounded-xl transition-colors cursor-pointer"
            title="Recherche (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Print/Export Button when in dossier view */}
          {activeView === 'DOSSIER' && onOpenExport && (
            <button
              type="button"
              onClick={onOpenExport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#18243A] bg-white border border-[#CBD5E1] hover:border-[#10B9A9] rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Exporter / Imprimer</span>
            </button>
          )}

          {/* New Patient CTA */}
          <button
            type="button"
            onClick={onOpenNewPatient}
            className="clinical-btn-primary px-3 sm:px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-sm shadow-[#10B9A9]/20 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau Patient</span>
          </button>

          {/* Clinician Pill / Role Switcher */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#10B9A9] rounded-xl px-2.5 py-1 transition-colors">
              <div className="w-6 h-6 rounded-lg bg-[#18243A] text-[#10B9A9] flex items-center justify-center text-[10px] font-black shrink-0">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <select
                aria-label="Changer d'utilisateur ou de rôle clinique"
                value={currentUser.id}
                onChange={(e) => {
                  const found = CLINICAL_USERS.find((u) => u.id === e.target.value);
                  if (found) onSelectUser(found);
                }}
                className="appearance-none bg-transparent text-[#18243A] text-xs font-bold pr-5 py-0.5 cursor-pointer focus:outline-none max-w-[120px] sm:max-w-[170px] truncate"
              >
                {CLINICAL_USERS.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 flex items-center text-[#64748B]">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
