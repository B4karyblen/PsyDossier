import React, { useState } from 'react';
import { DossierPsychiatrique, UserProfile } from '../types';
import { calculateDossierStats, checkDossierValidationPreconditions, RUBRIQUES_CONFIG, getRubriqueCompleteness } from '../utils/rules';
import {
  CheckCircle2,
  Lock,
  Printer,
  Archive,
  RefreshCw,
  FilePlus2,
  UserCheck,
  AlertTriangle,
  ArrowLeft,
  Copy,
  Check,
  ChevronDown,
  Info,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface PatientBannerProps {
  dossier: DossierPsychiatrique;
  currentUser: UserProfile;
  onValidateDossier: () => void;
  onOpenAddendumModal: () => void;
  onOpenExportModal: () => void;
  onArchiveDossier: () => void;
  onReactivateDossier: () => void;
  onCloseDossier: () => void;
  onSelectRubrique?: (rubriqueId: string) => void;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({
  dossier,
  currentUser,
  onValidateDossier,
  onOpenAddendumModal,
  onOpenExportModal,
  onArchiveDossier,
  onReactivateDossier,
  onCloseDossier,
  onSelectRubrique,
}) => {
  const stats = calculateDossierStats(dossier);
  const validationCheck = checkDossierValidationPreconditions(dossier);
  const isPsychiatre = currentUser.role === 'PSYCHIATRE';
  const isAdmin = currentUser.role === 'ADMIN';

  const [copied, setCopied] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  const diagPrincipal = dossier.s12HypothesesDiag.hypotheses?.find((h) => h.type === 'Principale');

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(dossier.s1Identification.numeroOrdre);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = `${dossier.s1Identification.nom?.[0] || 'P'}${dossier.s1Identification.prenoms?.[0] || 'T'}`.toUpperCase();

  return (
    <div className="bg-white border-b border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-4 lg:px-8 py-3.5 no-print relative transition-all">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left Zone: Patient Identity */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Back to registry button */}
          <button
            onClick={onCloseDossier}
            className="flex items-center gap-1 text-xs font-semibold text-[#64748B] hover:text-[#18243A] px-2.5 py-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg transition-all shrink-0 cursor-pointer"
            title="Revenir au registre des patients"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Registre</span>
          </button>

          {/* Avatar with status ring */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#18243A] to-[#334155] text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
              {initials}
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                dossier.statut === 'VALIDÉ'
                  ? 'bg-[#10B981]'
                  : dossier.statut === 'EN_COURS'
                  ? 'bg-[#F59E0B]'
                  : dossier.statut === 'ARCHIVÉ'
                  ? 'bg-[#F43F5E]'
                  : 'bg-[#94A3B8]'
              }`}
              title={`Statut dossier : ${dossier.statut}`}
            />
          </div>

          {/* Identity details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Order number copy button */}
              <button
                onClick={handleCopyOrderNumber}
                className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#18243A] border border-[#CBD5E1] transition-colors flex items-center gap-1 cursor-pointer group"
                title="Cliquer pour copier le N° d'ordre"
              >
                <span>{dossier.s1Identification.numeroOrdre}</span>
                {copied ? (
                  <Check className="w-3 h-3 text-[#10B981]" />
                ) : (
                  <Copy className="w-3 h-3 text-[#94A3B8] group-hover:text-[#18243A]" />
                )}
              </button>

              {/* Patient full name */}
              <h1 className="text-base sm:text-lg font-bold text-[#18243A] tracking-tight truncate">
                {dossier.s1Identification.nom} {dossier.s1Identification.prenoms}
              </h1>

              {/* Status Badge */}
              {dossier.statut === 'VALIDÉ' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Validé & Verrouillé
                </span>
              )}
              {dossier.statut === 'EN_COURS' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                  En cours de rédaction
                </span>
              )}
              {dossier.statut === 'BROUILLON' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                  Brouillon initial
                </span>
              )}
              {dossier.statut === 'ARCHIVÉ' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3]">
                  <Archive className="w-3.5 h-3.5" />
                  Dossier Archivé
                </span>
              )}
            </div>

            {/* Subline: Clean unboxed metadata */}
            <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5 flex-wrap">
              <span className="font-semibold text-[#18243A] tabular-nums">
                {dossier.s1Identification.age} ans
              </span>
              <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
              <span className="font-medium">{dossier.s1Identification.sexe}</span>
              <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
              <span>{dossier.s1Identification.situationMatrimoniale || 'Non renseignée'}</span>
              <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
              <span className="truncate max-w-[140px] sm:max-w-xs">{dossier.s1Identification.profession || 'Sans profession'}</span>
              <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
              <span className="text-[#07988D] font-medium">Réf : {dossier.psychiatreReferent}</span>
              {diagPrincipal && (
                <>
                  <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                  <span className="text-[#07988D] font-semibold truncate max-w-[200px]" title={diagPrincipal.libelle}>
                    {diagPrincipal.codeCimDsm ? `[${diagPrincipal.codeCimDsm}] ` : ''}{diagPrincipal.libelle}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Zone: Completeness & Clinical Actions */}
        <div className="flex flex-wrap items-center gap-3 justify-end shrink-0">
          {/* Completeness Pill & Dropdown Checklist */}
          <div className="relative">
            <button
              onClick={() => setShowChecklist(!showChecklist)}
              className="flex items-center gap-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] px-3 py-1.5 rounded-xl transition-all cursor-pointer group"
              title="Cliquer pour afficher la checklist des 17 rubriques"
            >
              <div className="text-right">
                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  Complétude
                </div>
                <div className="font-mono text-sm font-extrabold text-[#18243A] tabular-nums">
                  {stats.percentage}%
                </div>
              </div>
              <div className="w-16 bg-[#E2E8F0] h-2 rounded-full overflow-hidden shrink-0">
                <div
                  className={`h-full transition-all duration-300 ${
                    stats.percentage === 100
                      ? 'bg-[#10B981]'
                      : stats.percentage >= 60
                      ? 'bg-[#10B9A9]'
                      : 'bg-[#F59E0B]'
                  }`}
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
              <div className="text-[11px] text-[#64748B] font-medium">
                <span className="text-[#10B981] font-bold">{stats.completeCount}</span> / {stats.total}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#18243A] transition-transform" />
            </button>

            {/* Checklist Dropdown Popover */}
            {showChecklist && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#CBD5E1] rounded-2xl shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0]">
                  <span className="text-xs font-bold text-[#18243A]">
                    Checklist des 17 Rubriques
                  </span>
                  <span className="text-[11px] font-semibold text-[#07988D]">
                    {stats.completeCount} validées · {stats.total - stats.completeCount} restantes
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1 text-xs">
                  {RUBRIQUES_CONFIG.map((rub) => {
                    const completeness = getRubriqueCompleteness(dossier, rub.id);
                    const isComplete = completeness === 'COMPLETE';
                    return (
                      <button
                        key={rub.id}
                        onClick={() => {
                          setShowChecklist(false);
                          onSelectRubrique?.(rub.id);
                        }}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors text-left"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-[10px] font-bold text-[#64748B]">
                            {rub.code}
                          </span>
                          <span className="truncate text-[#18243A]">{rub.titre}</span>
                        </div>
                        {isComplete ? (
                          <span className="w-4 h-4 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#15803D] shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#F59E0B] font-medium shrink-0">
                            À compléter
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {dossier.statut === 'VALIDÉ' ? (
              <button
                onClick={onOpenAddendumModal}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                <span>+ Addendum</span>
              </button>
            ) : (
              dossier.statut !== 'ARCHIVÉ' && (
                <button
                  onClick={onValidateDossier}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98 ${
                    isPsychiatre && validationCheck.canValidate
                      ? 'bg-[#10B981] text-white hover:bg-[#059669]'
                      : isPsychiatre
                      ? 'bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE68A] border border-[#F59E0B]/40'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] border border-[#CBD5E1]'
                  }`}
                  title={
                    isPsychiatre
                      ? validationCheck.canValidate
                        ? 'Valider et verrouiller officiellement le dossier'
                        : `Rubriques requises manquantes : ${validationCheck.missingRequirements.join(', ')}`
                      : 'Validation officielle réservée au Médecin Psychiatre'
                  }
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Valider le dossier</span>
                  {!isPsychiatre && (
                    <span className="text-[10px] text-[#94A3B8] font-normal">(Psychiatre)</span>
                  )}
                </button>
              )
            )}

            {/* Export / Print */}
            <button
              onClick={onOpenExportModal}
              className="px-3 py-1.5 text-xs font-semibold text-[#18243A] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Exporter</span>
            </button>

            {/* Archive / Reactivate */}
            {dossier.statut === 'ARCHIVÉ' ? (
              <button
                onClick={onReactivateDossier}
                className="px-3 py-1.5 text-xs font-semibold text-[#18243A] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#07988D]" />
                <span>Réactiver</span>
              </button>
            ) : (
              <button
                onClick={onArchiveDossier}
                className="p-2 text-xs font-medium text-[#64748B] hover:text-[#BE123C] hover:bg-[#FFE4E6]/60 border border-transparent hover:border-[#FECDD3] rounded-xl transition-all cursor-pointer"
                title="Archiver ce dossier médical"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Validation notice ticker */}
      {dossier.statut === 'VALIDÉ' && dossier.validationInfo && (
        <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-[#EDF2F7] flex items-center justify-between text-[11px] text-[#64748B] flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-[#15803D] font-medium">
            <Lock className="w-3.5 h-3.5 text-[#10B981]" />
            <span>
              Dossier validé et scellé le{' '}
              {new Date(dossier.validationInfo.dateHeure).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              par {dossier.validationInfo.signataire}
            </span>
          </div>
          {dossier.addenda.length > 0 && (
            <span className="font-semibold text-[#07988D] bg-[#ECFBF9] px-2 py-0.5 rounded-md border border-[#10B9A9]/20">
              {dossier.addenda.length} addendum(s) annexé(s)
            </span>
          )}
        </div>
      )}

      {/* Missing validation warning banner */}
      {!validationCheck.canValidate &&
        dossier.statut !== 'VALIDÉ' &&
        dossier.statut !== 'ARCHIVÉ' &&
        isPsychiatre && (
          <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-[#EDF2F7] flex items-center gap-2 text-[11px] text-[#B45309]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
            <span>
              Prérequis manquants pour validation légale :{' '}
              <strong className="font-semibold">
                {validationCheck.missingRequirements.join(' · ')}
              </strong>
            </span>
          </div>
        )}
    </div>
  );
};
