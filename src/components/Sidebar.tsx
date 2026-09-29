import React from 'react';
import { DossierPsychiatrique, UserProfile, UserRole } from '../types';
import { CLINICAL_USERS } from '../data/initialData';
import { calculateDossierStats } from '../utils/rules';
import {
  LayoutGrid,
  Users,
  FileText,
  ShieldCheck,
  Database,
  Search,
  ChevronDown,
  HeartPulse,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeView: 'DASHBOARD' | 'REGISTRE' | 'DOSSIER' | 'AUDIT' | 'REFERENTIELS';
  onChangeView: (view: 'DASHBOARD' | 'REGISTRE' | 'DOSSIER' | 'AUDIT' | 'REFERENTIELS') => void;
  activeDossier: DossierPsychiatrique | null;
  activeRubriqueId: string;
  onSelectRubrique?: (rubriqueId: string) => void;
  dossiersCount: number;
  auditCount: number;
  onOpenNewPatient: () => void;
  onOpenQuickSearch: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onChangeView,
  activeDossier,
  activeRubriqueId,
  onSelectRubrique,
  dossiersCount,
  auditCount,
  onOpenNewPatient,
  onOpenQuickSearch,
  currentUser,
  onSelectUser,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {

  // Active dossier stats if open
  const activeStats = activeDossier ? calculateDossierStats(activeDossier) : null;

  const navItems = [
    {
      id: 'DASHBOARD' as const,
      label: 'Tableau de bord',
      icon: LayoutGrid,
      badge: null,
      shortcut: '1',
    },
    {
      id: 'REGISTRE' as const,
      label: 'Registre des patients',
      icon: Users,
      badge: dossiersCount.toString(),
      shortcut: '2',
    },
    {
      id: 'DOSSIER' as const,
      label: activeDossier
        ? `${activeDossier.s1Identification.nom} ${activeDossier.s1Identification.prenoms}`
        : 'Dossier clinique',
      sublabel: activeDossier ? activeDossier.s1Identification.numeroOrdre : 'Aucun patient ouvert',
      icon: FileText,
      badge: activeDossier
        ? activeDossier.statut === 'VALIDÉ'
          ? 'Validé'
          : activeDossier.statut === 'ARCHIVÉ'
          ? 'Archivé'
          : `${activeStats?.completeCount || 0}/17`
        : null,
      hasChildren: Boolean(activeDossier),
      shortcut: '3',
    },
  ];

  const adminItems = [
    {
      id: 'AUDIT' as const,
      label: "Journal d'audit",
      icon: ShieldCheck,
      badge: auditCount.toString(),
      shortcut: '4',
    },
    {
      id: 'REFERENTIELS' as const,
      label: 'Référentiels & CIM-10',
      icon: Database,
      badge: null,
      shortcut: '5',
    },
  ];

  const initials = currentUser.name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const itemClass = (isActive: boolean) =>
    `w-full flex items-center rounded-xl transition-colors duration-150 cursor-pointer group text-left ${
      isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 gap-3'
    } ${
      isActive
        ? 'bg-brand-50 text-brand-800'
        : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'
    }`;

  const iconWrapClass = (isActive: boolean) =>
    `w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 transition-colors ${
      isActive
        ? 'bg-brand-500 text-white shadow-[0_6px_14px_-6px_rgba(20,179,155,0.8)]'
        : 'bg-transparent text-ink-400 group-hover:text-ink-700'
    }`;

  const badgeClass = (isActive: boolean) =>
    `min-w-6 px-1.5 py-0.5 rounded-md text-[11px] font-bold tabular-nums text-center ${
      isActive ? 'bg-white text-brand-700 shadow-2xs' : 'bg-ink-100 text-ink-500'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-ink-150 select-none">
      {/* 1. Brand */}
      <div className={`h-16 flex items-center shrink-0 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
        <button
          onClick={() => {
            onChangeView('DASHBOARD');
            onCloseMobile();
          }}
          className="flex items-center gap-2.5 text-left overflow-hidden cursor-pointer rounded-xl"
          aria-label="PsyDossier — Tableau de bord"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shadow-[0_8px_18px_-8px_rgba(10,132,116,0.8)] shrink-0">
            <HeartPulse className="w-[18px] h-[18px]" strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="text-[17px] font-extrabold tracking-tight text-ink-900 leading-none">
                Psy<span className="text-brand-600">Dossier</span>
              </div>
              <p className="text-[11px] text-ink-500 font-semibold truncate mt-1">
                CHU Point G · Psychiatrie
              </p>
            </div>
          )}
        </button>

        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-8 h-8 !min-h-0 !min-w-0 rounded-lg text-ink-400 hover:text-ink-800 hover:bg-ink-100 transition-colors cursor-pointer"
            title="Réduire le menu latéral"
            aria-label="Réduire le menu latéral"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-ink-400 hover:text-ink-900 hover:bg-ink-100 cursor-pointer"
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Search */}
      <div className={`pb-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <button
          onClick={() => {
            onOpenQuickSearch();
            onCloseMobile();
          }}
          className={`w-full flex items-center rounded-xl bg-ink-50 hover:bg-ink-100 border border-ink-150 text-ink-500 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 gap-2.5 text-body-sm'
          }`}
          title="Recherche rapide (⌘K)"
        >
          <Search className="w-4 h-4 shrink-0 text-ink-400" />
          {!isCollapsed && (
            <>
              <span className="font-medium truncate">Rechercher…</span>
              <kbd className="ml-auto text-[11px] font-bold text-ink-500 bg-white px-1.5 py-0.5 rounded-md border border-ink-150">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* 3. Navigation */}
      <nav aria-label="Navigation principale" className={`flex-1 overflow-y-auto py-3 space-y-6 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[11px] font-bold text-ink-400 tracking-wide">
              Espace clinique
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isDossierItem = item.id === 'DOSSIER';

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => {
                    if (isDossierItem && !activeDossier) {
                      onChangeView('REGISTRE');
                    } else {
                      onChangeView(item.id);
                    }
                    onCloseMobile();
                  }}
                  className={itemClass(isActive)}
                  title={isCollapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={iconWrapClass(isActive)}>
                    <Icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
                  </span>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className={`text-body-sm truncate leading-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>
                          {item.label}
                        </div>
                        {item.sublabel && (
                          <div className={`text-[11px] font-semibold tabular-nums truncate mt-0.5 ${isActive ? 'text-brand-700' : 'text-ink-400'}`}>
                            {item.sublabel}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.badge && <span className={badgeClass(isActive)}>{item.badge}</span>}

                      </div>
                    </div>
                  )}
                </button>

              </div>
            );
          })}
        </div>

        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[11px] font-bold text-ink-400 tracking-wide">
              Conformité & nomenclatures
            </div>
          )}

          {adminItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  onCloseMobile();
                }}
                className={itemClass(isActive)}
                title={isCollapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={iconWrapClass(isActive)}>
                  <Icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
                </span>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <span className={`text-body-sm truncate leading-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>
                      {item.label}
                    </span>
                    {item.badge && <span className={badgeClass(isActive)}>{item.badge}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 4. New patient + profile */}
      <div className={`shrink-0 space-y-3 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center p-2.5 rounded-xl text-ink-400 hover:text-ink-800 hover:bg-ink-100 transition-colors cursor-pointer"
            title="Agrandir le menu latéral"
            aria-label="Agrandir le menu latéral"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        <div className={`rounded-2xl bg-ink-900 text-white ${isCollapsed ? 'p-1.5 flex justify-center' : 'p-3'}`}>
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-extrabold text-xs">
                {initials}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-ink-900"
                title="Session active"
              />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold truncate leading-tight">{currentUser.name}</div>
                <div className="text-[11px] font-semibold text-ink-300 truncate mt-0.5 capitalize">
                  {currentUser.role.toLowerCase()}
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="relative mt-3">
              <label htmlFor="sidebar-role-switch" className="sr-only">
                Changer d'utilisateur clinique
              </label>
              <select
                id="sidebar-role-switch"
                value={currentUser.id}
                onChange={(e) => {
                  const found = CLINICAL_USERS.find((u) => u.id === e.target.value);
                  if (found) onSelectUser(found);
                }}
                className="w-full !min-h-9 appearance-none bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold rounded-lg pl-2.5 pr-7 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 cursor-pointer truncate transition-colors"
              >
                {CLINICAL_USERS.map((user) => (
                  <option key={user.id} value={user.id} className="bg-ink-900 text-white">
                    {user.name} · {user.role}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-ink-950/40 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
