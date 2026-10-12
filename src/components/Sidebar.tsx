import React from 'react';
import { DossierPsychiatrique, UserProfile, UserRole, AppView } from '../types';
import { ROLE_LABELS } from './UsersView';
import { calculateDossierStats } from '../utils/rules';
import { LicenceNotice } from '../lib/licence';
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
  UserCog,
  LogOut,
  KeyRound,
  HardDrive,
} from 'lucide-react';
import { BACKUP_REMINDER_DAYS, daysSince } from './BackupDialog';

interface SidebarProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  activeDossier: DossierPsychiatrique | null;
  activeRubriqueId: string;
  onSelectRubrique?: (rubriqueId: string) => void;
  dossiersCount: number;
  auditCount: number;
  onOpenNewPatient?: () => void;
  onOpenQuickSearch: () => void;
  currentUser: UserProfile;
  canReadAudit: boolean;
  canManage: boolean;
  lastBackup: string | null;
  onOpenBackup: () => void;
  onLogout: () => void;
  onChangePassword: () => void;
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
  canReadAudit,
  canManage,
  lastBackup,
  onOpenBackup,
  onLogout,
  onChangePassword,
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
    ...(canReadAudit
      ? [
          {
            id: 'AUDIT' as const,
            label: "Journal d'audit",
            icon: ShieldCheck,
            badge: auditCount.toString(),
            shortcut: '4',
          },
        ]
      : []),
    {
      id: 'REFERENTIELS' as const,
      label: 'Référentiels & CIM-10',
      icon: Database,
      badge: null,
      shortcut: '5',
    },
    ...(currentUser.role === 'ADMIN'
      ? [
          {
            id: 'UTILISATEURS' as const,
            label: 'Utilisateurs & rôles',
            icon: UserCog,
            badge: null,
            shortcut: '6',
          },
        ]
      : []),
  ];

  const initials = currentUser.name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const itemClass = (isActive: boolean) =>
    `relative w-full !min-h-10 flex items-center rounded-lg transition-colors duration-150 cursor-pointer group text-left ${
      isCollapsed ? 'justify-center p-2' : 'px-3 py-2 gap-3'
    } ${
      isActive
        ? 'bg-ink-100 text-ink-900'
        : 'text-ink-700 hover:text-ink-900 hover:bg-ink-50'
    }`;

  const iconWrapClass = (isActive: boolean) =>
    `w-5 h-5 flex items-center justify-center shrink-0 transition-colors ${
      isActive ? 'text-ink-900' : 'text-ink-500 group-hover:text-ink-800'
    }`;

  const badgeClass = (isActive: boolean) =>
    `min-w-6 px-1.5 rounded-md text-xs leading-5 font-bold tabular-nums text-center ${
      isActive ? 'bg-white text-ink-800 ring-1 ring-inset ring-ink-200' : 'bg-ink-100 text-ink-700'
    }`;

  const activeIndicator = (isActive: boolean) =>
    isActive && !isCollapsed ? (
      <span aria-hidden="true" className="absolute -left-3 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-brand-500" />
    ) : null;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-ink-150 select-none">
      {/* 1. Brand */}
      <div className={`h-14 flex items-center shrink-0 border-b border-ink-150 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        <button
          onClick={() => {
            onChangeView('DASHBOARD');
            onCloseMobile();
          }}
          className="flex items-center gap-2.5 text-left overflow-hidden cursor-pointer rounded-lg"
          aria-label="PsyDossier — Tableau de bord"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white shrink-0">
            <HeartPulse className="w-4 h-4" strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="text-base font-bold tracking-tight text-ink-900 leading-none">
                PsyDossier
              </div>
              <p className="text-xs text-ink-600 font-medium truncate mt-1">
                {currentUser.service || 'Dossier patient en psychiatrie'}
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
      <div className={`pt-3 pb-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        <button
          onClick={() => {
            onOpenQuickSearch();
            onCloseMobile();
          }}
          className={`w-full !min-h-10 flex items-center rounded-lg bg-ink-50 hover:bg-ink-100 border border-ink-200 text-ink-500 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center p-2' : 'px-2.5 py-1.5 gap-2 text-sm'
          }`}
          title="Recherche rapide (⌘K)"
        >
          <Search className="w-4 h-4 shrink-0 text-ink-400" />
          {!isCollapsed && (
            <>
              <span className="font-medium truncate">Rechercher…</span>
              <kbd className="kbd ml-auto">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* 3. Navigation */}
      <nav aria-label="Navigation principale" className={`flex-1 overflow-y-auto py-3 space-y-5 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        <div className="space-y-0.5">
          {!isCollapsed && (
            <div className="px-3 pb-1.5 text-xs font-bold text-ink-500">
              Espace clinique
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isDossierItem = item.id === 'DOSSIER';

            return (
              <div key={item.id}>
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
                  {activeIndicator(isActive)}
                  <span className={iconWrapClass(isActive)}>
                    <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                  </span>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className={`text-sm truncate leading-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>
                          {item.label}
                        </div>
                        {item.sublabel && (
                          <div className={`text-xs font-medium tabular-nums truncate mt-0.5 text-ink-600`}>
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

        <div className="space-y-0.5">
          {!isCollapsed && (
            <div className="px-3 pb-1.5 text-xs font-bold text-ink-500">
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
                {activeIndicator(isActive)}
                <span className={iconWrapClass(isActive)}>
                  <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                </span>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <span className={`text-sm truncate leading-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>
                      {item.label}
                    </span>
                    {item.badge && <span className={badgeClass(isActive)}>{item.badge}</span>}
                  </div>
                )}
              </button>
            );
          })}

          {canManage && (() => {
            const age = daysSince(lastBackup);
            const overdue = age === null || age >= BACKUP_REMINDER_DAYS;
            return (
              <button
                type="button"
                onClick={() => {
                  onOpenBackup();
                  onCloseMobile();
                }}
                className={itemClass(false)}
                title={isCollapsed ? 'Sauvegarde sur clé USB' : undefined}
              >
                <span className={iconWrapClass(false)}>
                  <HardDrive className="w-[18px] h-[18px]" strokeWidth={2} />
                </span>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <span className="text-sm truncate leading-tight font-semibold">Sauvegarde</span>
                    {overdue && (
                      <span className="chip bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200 !px-1.5" title="Sauvegarde externe à faire">
                        <span className="dot" />
                        À faire
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })()}
        </div>
      </nav>

      {/* 4. New patient + profile */}
      <div className={`shrink-0 space-y-2 border-t border-ink-150 ${isCollapsed ? 'p-2' : 'p-3'}`}>
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center p-2.5 rounded-lg text-ink-400 hover:text-ink-800 hover:bg-ink-100 transition-colors cursor-pointer"
            title="Agrandir le menu latéral"
            aria-label="Agrandir le menu latéral"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        <div className={`${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary-900 text-white flex items-center justify-center font-bold text-xs">
                {initials}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white"
                title="Session active"
              />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink-900 truncate leading-tight">{currentUser.name}</div>
                <div className="text-xs font-medium text-ink-500 truncate mt-0.5">
                  {ROLE_LABELS[currentUser.role]}
                </div>
              </div>
            )}
          </div>

          {!isCollapsed ? (
            <div className="mt-2.5 grid grid-cols-2 gap-1.5">
              <button type="button" onClick={onChangePassword} className="btn-secondary btn-sm !px-2">
                <KeyRound className="w-4 h-4 text-ink-500" />
                Mot de passe
              </button>
              <button type="button" onClick={onLogout} className="btn-secondary btn-sm !px-2">
                <LogOut className="w-4 h-4 text-ink-500" />
                Déconnexion
              </button>
              <LicenceNotice className="col-span-2 mt-1 leading-snug" />
            </div>
          ) : (
            <button
              type="button"
              onClick={onLogout}
              className="btn-icon mt-2 mx-auto flex"
              title="Se déconnecter"
              aria-label="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
          isCollapsed ? 'w-[72px]' : 'w-[280px]'
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
          <div className="relative w-[280px] max-w-[85vw] h-full shadow-[var(--shadow-float)] z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
