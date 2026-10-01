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
  Stethoscope,
} from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
import { ROLES_CAN_EXPORT } from '../utils/emptyDossier';

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

  const statusChip = {
    VALIDÉ: { label: 'Validé & verrouillé', cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
    EN_COURS: { label: 'En cours de rédaction', cls: 'bg-amber-100 text-amber-800', icon: null },
    BROUILLON: { label: 'Brouillon', cls: 'bg-ink-100 text-ink-700', icon: null },
    ARCHIVÉ: { label: 'Archivé', cls: 'bg-rose-100 text-rose-700', icon: Archive },
  }[dossier.statut];
  const StatusIcon = statusChip?.icon;

  const ringColor = 'var(--color-brand-500)';

  const facts = [
    `${dossier.s1Identification.age} ans`,
    dossier.s1Identification.sexe,
    dossier.s1Identification.situationMatrimoniale || 'Situation non renseignée',
    dossier.s1Identification.profession || 'Sans profession',
  ].filter(Boolean);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 no-print">
      <div className="clinical-card p-4 sm:p-5">
        <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
          {/* Identity */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <button
              onClick={onCloseDossier}
              className="btn-icon hidden sm:inline-flex shrink-0 border border-ink-200 shadow-[var(--shadow-soft)]"
              title="Revenir au registre des patients"
              aria-label="Revenir au registre des patients"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-ink-100 text-ink-800 flex items-center justify-center font-bold text-base">
                {initials}
              </div>
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  dossier.statut === 'VALIDÉ'
                    ? 'bg-emerald-500'
                    : dossier.statut === 'EN_COURS'
                    ? 'bg-amber-500'
                    : dossier.statut === 'ARCHIVÉ'
                    ? 'bg-rose-500'
                    : 'bg-ink-400'
                }`}
                title={`Statut dossier : ${dossier.statut}`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight truncate">
                  {dossier.s1Identification.nom} {dossier.s1Identification.prenoms}
                </h1>
                {statusChip && <StatusBadge status={dossier.statut} label={statusChip.label} />}
              </div>

              <div className="flex items-center gap-x-2 gap-y-1 text-base text-ink-600 mt-1 flex-wrap">
                <button
                  onClick={handleCopyOrderNumber}
                  className="!min-h-0 !min-w-0 inline-flex items-center gap-1 font-semibold tabular-nums text-ink-700 hover:text-ink-900 transition-colors cursor-pointer"
                  title="Copier le N° d'ordre"
                >
                  {dossier.s1Identification.numeroOrdre}
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3 h-3 text-ink-400" />}
                </button>
                {facts.map((f) => (
                  <React.Fragment key={f}>
                    <span aria-hidden="true" className="text-ink-300">•</span>
                    <span className="truncate max-w-[180px]">{f}</span>
                  </React.Fragment>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="chip chip-neutral">
                  <Stethoscope className="w-3.5 h-3.5 text-ink-500" />
                  {dossier.psychiatreReferent}
                </span>
                {diagPrincipal && (
                  <span className="chip chip-neutral max-w-full sm:max-w-[360px] min-w-0" title={diagPrincipal.libelle}>
                    {diagPrincipal.codeCimDsm && <span className="tabular-nums font-semibold text-ink-900">{diagPrincipal.codeCimDsm}</span>}
                    <span className="truncate font-medium">{diagPrincipal.libelle}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Completeness & actions */}
          <div className="flex flex-wrap items-center gap-2 2xl:justify-end shrink-0 pt-4 2xl:pt-0 border-t border-ink-100 2xl:border-0">
            <div className="relative">
              <button
                onClick={() => setShowChecklist(!showChecklist)}
                className="flex items-center gap-2.5 bg-white hover:bg-ink-50 border border-ink-200 shadow-[var(--shadow-soft)] !min-h-10 pl-2 pr-3 py-1 rounded-lg transition-colors cursor-pointer"
                title="Afficher la checklist des 17 rubriques"
                aria-expanded={showChecklist}
              >
                <span
                  className="relative w-7 h-7 rounded-full grid place-items-center"
                  style={{ background: `conic-gradient(${ringColor} ${stats.percentage * 3.6}deg, var(--color-ink-150) 0deg)` }}
                >
                  <span className="absolute inset-[3px] rounded-full bg-white" />
                  <span className="sr-only">{stats.percentage}%</span>
                </span>
                <span className="text-sm font-bold text-ink-900 tabular-nums">
                  {stats.completeCount}/{stats.total}
                  <span className="font-medium text-ink-500"> rubriques</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-ink-400 transition-transform ${showChecklist ? 'rotate-180' : ''}`} />
              </button>

              {showChecklist && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-ink-150 rounded-xl shadow-[var(--shadow-float)] z-50 p-3">
                  <div className="flex items-center justify-between px-1 pb-2 mb-2 border-b border-ink-100">
                    <span className="text-sm font-bold text-ink-900">Checklist des rubriques</span>
                    <span className="text-xs font-medium text-ink-500">
                      {stats.total - stats.completeCount} restantes
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-0.5 pr-1 text-xs">
                    {RUBRIQUES_CONFIG.map((rub) => {
                      const isComplete = getRubriqueCompleteness(dossier, rub.id) === 'COMPLETE';
                      return (
                        <button
                          key={rub.id}
                          onClick={() => {
                            setShowChecklist(false);
                            onSelectRubrique?.(rub.id);
                          }}
                          className="w-full !min-h-9 flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-ink-50 transition-colors text-left cursor-pointer"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span className="w-7 text-xs font-bold tabular-nums text-ink-400">{rub.code}</span>
                            <span className="truncate font-semibold text-ink-800">{rub.titre}</span>
                          </span>
                          {isComplete ? (
                            <span className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center text-white shrink-0">
                              <Check className="w-2.5 h-2.5" strokeWidth={4} />
                            </span>
                          ) : (
                            <span className="chip bg-amber-50 text-amber-800 !text-xs shrink-0">À compléter</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {dossier.statut === 'VALIDÉ' ? (
              <button onClick={onOpenAddendumModal} className="btn-primary">
                <FilePlus2 className="w-4 h-4" />
                <span>Addendum</span>
              </button>
            ) : (
              dossier.statut !== 'ARCHIVÉ' && (
                <button
                  onClick={onValidateDossier}
                  className={
                    isPsychiatre && validationCheck.canValidate
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }
                  title={
                    isPsychiatre
                      ? validationCheck.canValidate
                        ? 'Valider et verrouiller officiellement le dossier'
                        : `Rubriques requises manquantes : ${validationCheck.missingRequirements.join(', ')}`
                      : 'Validation officielle réservée au Médecin Psychiatre'
                  }
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Valider le dossier</span>
                  {!isPsychiatre && <span className="text-xs text-ink-400 font-medium">(Psychiatre)</span>}
                </button>
              )
            )}

            {ROLES_CAN_EXPORT.includes(currentUser.role) && (
              <button onClick={onOpenExportModal} className="btn-secondary" title="Exporter / imprimer le dossier">
                <Printer className="w-4 h-4 text-ink-500" />
                <span className="hidden sm:inline">Exporter</span>
              </button>
            )}

            {dossier.statut !== 'ARCHIVÉ' && ['ADMIN', 'PSYCHIATRE'].includes(currentUser.role) && (
              <button
                onClick={onArchiveDossier}
                className="btn-icon border border-ink-200 shadow-[var(--shadow-soft)] hover:!text-rose-700 hover:!bg-rose-50 hover:border-rose-200"
                title="Archiver ce dossier médical"
                aria-label="Archiver ce dossier médical"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}

            {dossier.statut === 'ARCHIVÉ' && currentUser.role === 'PSYCHIATRE' && (
              <button onClick={onReactivateDossier} className="btn-secondary">
                <RefreshCw className="w-4 h-4 text-ink-500" />
                <span>Réactiver</span>
              </button>
            )}
          </div>
        </div>

        {dossier.statut === 'VALIDÉ' && dossier.validationInfo && (
          <div className="mt-4 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <Lock className="w-4 h-4 shrink-0" />
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
              <span className="chip bg-white text-emerald-800 border border-emerald-200">
                {dossier.addenda.length} addendum(s) annexé(s)
              </span>
            )}
          </div>
        )}

        {!validationCheck.canValidate &&
          dossier.statut !== 'VALIDÉ' &&
          dossier.statut !== 'ARCHIVÉ' &&
          isPsychiatre && (
            <div className="mt-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-sm text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Prérequis manquants pour la validation légale :{' '}
                <strong className="font-semibold">{validationCheck.missingRequirements.join(' · ')}</strong>
              </span>
            </div>
          )}
      </div>
    </div>
  );
};
