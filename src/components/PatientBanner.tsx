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
    <div className="bg-[#1E293B] border-b border-[#334155] shadow-[0_1px_3px_rgba(0,0,0,0.15)] px-4 lg:px-8 py-3.5 no-print relative transition-all">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left Zone: Patient Identity */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Back to registry button */}
          <button
            onClick={onCloseDossier}
            className="flex items-center gap-1 text-body-sm font-bold text-slate-300 hover:text-white px-2.5 py-1.5 bg-[#334155] hover:bg-[#475569] border border-[#475569] rounded-lg transition-all shrink-0 cursor-pointer"
            title="Revenir au registre des patients"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Registre</span>
          </button>

          {/* Avatar with status ring */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-[#10B9A9] text-white flex items-center justify-center font-bold text-body tracking-wider shadow-sm">
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
                className="text-mono font-bold px-2 py-0.5 rounded-md bg-[#334155] hover:bg-[#475569] text-white border border-[#475569] transition-colors flex items-center gap-1 cursor-pointer group"
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
              <h1 className="text-h1 sm:text-h1 font-bold text-white tracking-tight truncate">
                {dossier.s1Identification.nom} {dossier.s1Identification.prenoms}
              </h1>

              {/* Status Badge */}
              {dossier.statut === 'VALIDÉ' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Validé & Verrouillé
                </span>
              )}
              {dossier.statut === 'EN_COURS' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  En cours de rédaction
                </span>
              )}
              {dossier.statut === 'BROUILLON' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
                  Brouillon initial
                </span>
              )}
              {dossier.statut === 'ARCHIVÉ' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <Archive className="w-3.5 h-3.5" />
                  Dossier Archivé
                </span>
              )}
            </div>

            {/* Subline: Clean unboxed metadata */}
            <div className="flex items-center gap-2 text-body-sm text-slate-400 mt-0.5 flex-wrap">
              <span className="font-bold text-white tabular-nums">
                {dossier.s1Identification.age} ans
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-medium text-slate-300">{dossier.s1Identification.sexe}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">{dossier.s1Identification.situationMatrimoniale || 'Non renseignée'}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300 truncate max-w-[140px] sm:max-w-xs">{dossier.s1Identification.profession || 'Sans profession'}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-white font-bold">Réf : {dossier.psychiatreReferent}</span>
              {diagPrincipal && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-white font-bold truncate max-w-[200px]" title={diagPrincipal.libelle}>
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
                <div className="text-label text-slate-400">
                  Complétude
                </div>
                <div className="text-mono font-extrabold text-white tabular-nums">
                  {stats.percentage}%
                </div>
              </div>
              <div className="w-16 bg-[#334155] h-2 rounded-full overflow-hidden shrink-0">
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
              <div className="text-caption text-slate-400 font-medium">
                <span className="text-[#10B9A9] font-bold">{stats.completeCount}</span> / {stats.total}
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
                className="px-3 py-1.5 text-body-sm font-bold text-white bg-[#1E293B] hover:bg-[#0F172A] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                <span>+ Addendum</span>
              </button>
            ) : (
              dossier.statut !== 'ARCHIVÉ' && (
                <button
                  onClick={onValidateDossier}
                  className={`px-3 py-1.5 text-body-sm font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98 ${
                    isPsychiatre && validationCheck.canValidate
                      ? 'bg-[#1E293B] text-white hover:bg-[#0F172A]'
                      : isPsychiatre
                      ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                      : 'bg-[#334155] text-slate-300 hover:bg-[#475569] border border-[#475569]'
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

            {/* Export / Print — clinical roles only (F-22) */}
            {['PSYCHIATRE', 'PSYCHOLOGUE', 'INFIRMIER', 'ASSISTANT_SOCIAL', 'ADMIN'].includes(currentUser.role) && (
              <button
                onClick={onOpenExportModal}
                className="px-3 py-1.5 text-body-sm font-bold text-white bg-[#334155] border border-[#475569] hover:bg-[#475569] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Exporter</span>
              </button>
            )}

            {/* Archive — Admin & Psychiatre only (F-23) */}
            {dossier.statut !== 'ARCHIVÉ' && ['ADMIN', 'PSYCHIATRE'].includes(currentUser.role) && (
              <button
                onClick={onArchiveDossier}
                className="p-2 text-body-sm font-bold text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 rounded-xl transition-all cursor-pointer"
                title="Archiver ce dossier médical"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}

            {/* Reactivate — Psychiatre only (F-23) */}
            {dossier.statut === 'ARCHIVÉ' && currentUser.role === 'PSYCHIATRE' && (
              <button
                onClick={onReactivateDossier}
                className="px-3 py-1.5 text-body-sm font-bold text-white bg-[#334155] border border-[#475569] hover:bg-[#475569] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#10B9A9]" />
                <span>Réactiver</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Validation notice ticker */}
      {dossier.statut === 'VALIDÉ' && dossier.validationInfo && (
        <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-[#334155] flex items-center justify-between text-caption text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
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
            <span className="font-bold text-[#10B9A9] bg-[#10B9A9]/10 px-2 py-0.5 rounded-md border border-[#10B9A9]/20">
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
          <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-[#334155] flex items-center gap-2 text-caption text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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
