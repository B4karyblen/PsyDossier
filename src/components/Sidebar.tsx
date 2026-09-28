import React, { useState } from 'react';
import { DossierPsychiatrique, UserProfile, UserRole } from '../types';
import { CLINICAL_USERS } from '../data/initialData';
import { calculateDossierStats, RUBRIQUES_CONFIG } from '../utils/rules';
import {
  Activity,
  Users,
  FileText,
  ShieldCheck,
  Database,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  ChevronDown,
  Sparkles,
  Command,
  HeartPulse,
  Lock,
  Layers,
  Hospital,
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
  const [isRubriquesTreeOpen, setIsRubriquesTreeOpen] = useState(true);

  // Active dossier stats if open
  const activeStats = activeDossier ? calculateDossierStats(activeDossier) : null;

  const navItems = [
    {
      id: 'DASHBOARD' as const,
      label: 'Tableau de Bord',
      icon: Activity,
      badge: null,
      shortcut: '1',
    },
    {
      id: 'REGISTRE' as const,
      label: 'Registre des Patients',
      icon: Users,
      badge: dossiersCount.toString(),
      shortcut: '2',
    },
    {
      id: 'DOSSIER' as const,
      label: activeDossier
        ? `${activeDossier.s1Identification.nom} ${activeDossier.s1Identification.prenoms}`
        : 'Dossier Clinique',
      sublabel: activeDossier ? activeDossier.s1Identification.numeroOrdre : 'Aucun patient sélectionné',
      icon: FileText,
      badge: activeDossier
        ? activeDossier.statut === 'VALIDÉ'
          ? 'Validé'
          : activeDossier.statut === 'ARCHIVÉ'
          ? 'Archivé'
          : `${activeStats?.completeCount || 0}/17`
        : null,
      badgeColor: activeDossier
        ? activeDossier.statut === 'VALIDÉ'
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          : 'bg-[#10B9A9]/20 text-[#2dd4bf] border-[#10B9A9]/30'
        : '',
      hasChildren: Boolean(activeDossier),
      shortcut: '3',
    },
  ];

  const adminItems = [
    {
      id: 'AUDIT' as const,
      label: "Journal d'Audit",
      icon: ShieldCheck,
      badge: auditCount.toString(),
      badgeColor: 'bg-white/10 text-slate-300 border-white/10',
      shortcut: '4',
    },
    {
      id: 'REFERENTIELS' as const,
      label: 'Référentiels & CIM-10',
      icon: Database,
      badge: 'CIM-10',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      shortcut: '5',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#111C2E] text-slate-200 border-r border-[#1E2D44] select-none">
      {/* 1. Header / Hospital Brand */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#1E2D44] shrink-0 bg-[#0E1726]">
        <button
          onClick={() => {
            onChangeView('DASHBOARD');
            onCloseMobile();
          }}
          className="flex items-center gap-3 text-left group overflow-hidden focus:outline-none cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B9A9] to-[#0D9488] flex items-center justify-center text-white shadow-md shadow-[#10B9A9]/20 group-hover:scale-105 transition-transform shrink-0">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-sans truncate">
                  PsyDossier
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#10B9A9]/20 text-[#2DD4BF] border border-[#10B9A9]/30 font-mono">
                  EHR
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                CHU Point G · Psychiatrie
              </p>
            </div>
          )}
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2D44] transition-colors cursor-pointer"
          title={isCollapsed ? 'Agrandir le menu latéral' : 'Réduire le menu latéral'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2D44]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Fast Admission CTA */}
      <div className="p-3 border-b border-[#1E2D44]/60">
        <button
          onClick={() => {
            onOpenNewPatient();
            onCloseMobile();
          }}
          className={`w-full bg-[#10B9A9] hover:bg-[#0D9488] active:scale-98 text-white font-bold rounded-xl transition-all shadow-md shadow-[#10B9A9]/20 flex items-center justify-center cursor-pointer ${
            isCollapsed ? 'p-2.5' : 'px-3.5 py-2.5 gap-2 text-xs'
          }`}
          title="Nouveau Patient (N)"
        >
          <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
          {!isCollapsed && (
            <>
              <span className="font-semibold tracking-wide">Nouveau Patient</span>
              <kbd className="ml-auto text-[10px] font-mono bg-[#0D9488]/80 text-white/90 px-1.5 py-0.5 rounded">
                N
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* 3. Navigation List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-6 scrollbar-thin scrollbar-thumb-[#1E2D44]">
        {/* SECTION 1: ESPACE CLINIQUE */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Espace Clinique
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
                  className={`w-full flex items-center rounded-xl transition-all cursor-pointer group text-left ${
                    isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 gap-3'
                  } ${
                    isActive
                      ? 'bg-[#10B9A9] text-white font-bold shadow-sm shadow-[#10B9A9]/20'
                      : 'text-slate-300 hover:text-white hover:bg-[#18263D]'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <div className="min-w-0 pr-1">
                        <div className="text-xs font-semibold truncate leading-tight">
                          {item.label}
                        </div>
                        {item.sublabel && (
                          <div
                            className={`text-[10px] font-mono truncate ${
                              isActive ? 'text-white/80' : 'text-slate-400'
                            }`}
                          >
                            {item.sublabel}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${
                              isActive
                                ? 'bg-white/20 text-white border-white/30'
                                : item.badgeColor || 'bg-white/10 text-slate-300 border-white/10'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {isDossierItem && activeDossier && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsRubriquesTreeOpen((prev) => !prev);
                            }}
                            className="p-0.5 hover:bg-white/20 rounded transition-colors text-slate-300 hover:text-white"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${
                                isRubriquesTreeOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </button>

                {/* Sub-tree: 17 Rubriques if on active dossier and not collapsed */}
                {!isCollapsed && isDossierItem && activeDossier && isRubriquesTreeOpen && (
                  <div className="ml-4 pl-3 border-l border-[#1E2D44] space-y-0.5 py-1">
                    <div className="text-[10px] font-bold text-slate-400 px-2 py-0.5 flex items-center justify-between">
                      <span>17 RUBRIQUES DU DOSSIER</span>
                      <span className="font-mono text-[9px] text-[#2DD4BF]">
                        {activeStats?.percentage || 0}%
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-[#1E2D44]">
                      {RUBRIQUES_CONFIG.map((rub) => {
                        const isCurrent = activeView === 'DOSSIER' && activeRubriqueId === rub.id;
                        return (
                          <button
                            key={rub.id}
                            onClick={() => {
                              onChangeView('DOSSIER');
                              onSelectRubrique?.(rub.id);
                              onCloseMobile();
                            }}
                            className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer text-left ${
                              isCurrent
                                ? 'bg-[#10B9A9]/20 text-[#2DD4BF] font-bold border border-[#10B9A9]/40'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-[#18263D]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="font-mono text-[10px] opacity-75">{rub.code}</span>
                              <span className="truncate">{rub.titre}</span>
                            </div>
                            {isCurrent && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#10B9A9] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SECTION 2: RÉGLEMENTAIRE & SYSTÈME */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Conformité & Nomenclatures
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
                className={`w-full flex items-center rounded-xl transition-all cursor-pointer group text-left ${
                  isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 gap-3'
                } ${
                  isActive
                    ? 'bg-[#10B9A9] text-white font-bold shadow-sm shadow-[#10B9A9]/20'
                    : 'text-slate-300 hover:text-white hover:bg-[#18263D]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <span className="text-xs font-semibold truncate leading-tight">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${
                          isActive
                            ? 'bg-white/20 text-white border-white/30'
                            : item.badgeColor || 'bg-white/10 text-slate-300 border-white/10'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* SECTION 3: RECHERCHE RAPIDE CMD+K HELPER */}
        <div className="pt-2 border-t border-[#1E2D44]/60">
          <button
            onClick={() => {
              onOpenQuickSearch();
              onCloseMobile();
            }}
            className={`w-full flex items-center rounded-xl bg-[#142034] border border-[#1E2D44] hover:border-[#10B9A9]/40 text-slate-400 hover:text-slate-200 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 gap-2 text-xs'
            }`}
            title="Recherche rapide (⌘K)"
          >
            <Search className="w-3.5 h-3.5 shrink-0 text-[#10B9A9]" />
            {!isCollapsed && (
              <>
                <span className="font-medium truncate">Recherche rapide...</span>
                <kbd className="ml-auto font-mono text-[10px] bg-[#1E2D44] text-slate-300 px-1.5 py-0.5 rounded border border-[#2D3E5B]">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4. Footer Section: Clinician User Profile & Role Switcher */}
      <div className="p-3 border-t border-[#1E2D44] bg-[#0E1726] shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Avatar with role ring */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E2D44] to-[#142034] text-[#2DD4BF] flex items-center justify-center font-bold text-xs border border-[#2D3E5B] shadow-inner">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#0E1726]"
              title="Session active"
            />
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {currentUser.name}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono font-bold text-[#2DD4BF] bg-[#10B9A9]/10 px-1.5 py-0.2 rounded border border-[#10B9A9]/20 truncate">
                  {currentUser.role}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        {!isCollapsed && (
          <div className="mt-2.5 pt-2 border-t border-[#1E2D44]/80">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
              <span>Changer de rôle clinique :</span>
              <span className="text-[9px] text-[#2DD4BF] font-mono">BR-014</span>
            </div>
            <select
              aria-label="Changer d'utilisateur clinique"
              value={currentUser.id}
              onChange={(e) => {
                const found = CLINICAL_USERS.find((u) => u.id === e.target.value);
                if (found) onSelectUser(found);
              }}
              className="w-full bg-[#142034] border border-[#1E2D44] hover:border-[#10B9A9]/50 text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#10B9A9] cursor-pointer truncate"
            >
              {CLINICAL_USERS.map((user) => (
                <option key={user.id} value={user.id} className="bg-[#111C2E] text-white">
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen transition-all duration-300 z-30 ${
          isCollapsed ? 'w-18' : 'w-64 xl:w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-xs transition-opacity"
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
