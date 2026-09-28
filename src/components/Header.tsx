import React from 'react';
import { UserProfile } from '../types';
import { CLINICAL_USERS } from '../data/initialData';
import { Activity, Plus, ShieldCheck, Database, FileText, Users } from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  activeView: 'DASHBOARD' | 'REGISTRE' | 'DOSSIER' | 'AUDIT' | 'REFERENTIELS';
  onChangeView: (view: 'DASHBOARD' | 'REGISTRE' | 'AUDIT' | 'REFERENTIELS') => void;
  onOpenNewPatient: () => void;
  activeDossierPatientName?: string;
  hasActiveDossier?: boolean;
  onReturnToDossier?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectUser,
  activeView,
  onChangeView,
  onOpenNewPatient,
  activeDossierPatientName,
  hasActiveDossier,
  onReturnToDossier
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#D9E2E8] px-4 lg:px-8 py-3 no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChangeView('REGISTRE')}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-[#ECFBF9] border border-[#10B9A9]/20 flex items-center justify-center text-[#10B9A9] group-hover:bg-[#D9F7F3] transition-colors">
              <Activity className="w-5 h-5 text-[#10B9A9]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#18243A] block leading-tight">
                PsyDossier
              </span>
              <span className="text-[11px] text-[#64748B] font-medium hidden sm:inline-block">
                Dossier Patient en Psychiatrie
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onChangeView('DASHBOARD')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'DASHBOARD'
                ? 'bg-[#ECFBF9] text-[#07988D]'
                : 'text-[#64748B] hover:text-[#18243A] hover:bg-[#F1F5F7]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tableau de Bord</span>
            <span className="sm:hidden">Stats</span>
          </button>

          <button
            onClick={() => onChangeView('REGISTRE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'REGISTRE'
                ? 'bg-[#ECFBF9] text-[#07988D]'
                : 'text-[#64748B] hover:text-[#18243A] hover:bg-[#F1F5F7]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Registre Patients</span>
            <span className="sm:hidden">Patients</span>
          </button>

          {hasActiveDossier && (
            <button
              onClick={onReturnToDossier}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 max-w-[200px] truncate ${
                activeView === 'DOSSIER'
                  ? 'bg-[#ECFBF9] text-[#07988D] border border-[#10B9A9]/30'
                  : 'text-[#64748B] hover:text-[#18243A] hover:bg-[#F1F5F7]'
              }`}
              title={activeDossierPatientName ? `Dossier en cours : ${activeDossierPatientName}` : 'Dossier en cours'}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Dossier : {activeDossierPatientName || 'Actif'}</span>
            </button>
          )}

          <button
            onClick={() => onChangeView('AUDIT')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'AUDIT'
                ? 'bg-[#ECFBF9] text-[#07988D]'
                : 'text-[#64748B] hover:text-[#18243A] hover:bg-[#F1F5F7]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Journal d'Audit</span>
            <span className="md:hidden">Audit</span>
          </button>

          <button
            onClick={() => onChangeView('REFERENTIELS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'REFERENTIELS'
                ? 'bg-[#ECFBF9] text-[#07988D]'
                : 'text-[#64748B] hover:text-[#18243A] hover:bg-[#F1F5F7]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Référentiels</span>
            <span className="md:hidden">Listes</span>
          </button>
        </nav>

        {/* Zone 3: Primary action + Role Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewPatient}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau Patient</span>
          </button>

          {/* Clinician Role Switcher */}
          <div className="relative group">
            <select
              aria-label="Changer d'utilisateur ou de rôle clinique"
              value={currentUser.id}
              onChange={(e) => {
                const found = CLINICAL_USERS.find(u => u.id === e.target.value);
                if (found) onSelectUser(found);
              }}
              className="appearance-none bg-[#F8FAFC] border border-[#D9E2E8] hover:border-[#10B9A9] focus:border-[#10B9A9] text-[#18243A] text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 cursor-pointer focus:outline-none transition-colors max-w-[210px] truncate"
            >
              {CLINICAL_USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#64748B]">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
