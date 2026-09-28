import React from 'react';
import { DossierPsychiatrique, UserProfile } from '../types';
import { calculateDossierStats, checkDossierValidationPreconditions } from '../utils/rules';
import { CheckCircle2, Lock, Printer, Archive, RefreshCw, FilePlus2, UserCheck, AlertTriangle } from 'lucide-react';

interface PatientBannerProps {
  dossier: DossierPsychiatrique;
  currentUser: UserProfile;
  onValidateDossier: () => void;
  onOpenAddendumModal: () => void;
  onOpenExportModal: () => void;
  onArchiveDossier: () => void;
  onReactivateDossier: () => void;
  onCloseDossier: () => void;
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
}) => {
  const stats = calculateDossierStats(dossier);
  const validationCheck = checkDossierValidationPreconditions(dossier);
  const isPsychiatre = currentUser.role === 'PSYCHIATRE';
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="bg-white border-b border-[#D9E2E8] shadow-xs px-4 lg:px-8 py-3.5 no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Patient Identity & Key Clinical Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onCloseDossier}
            className="text-xs font-semibold text-[#64748B] hover:text-[#18243A] px-2 py-1 bg-[#F1F5F7] rounded hover:bg-[#D9E2E8] transition-colors"
            title="Revenir au registre des patients"
          >
            ← Registre
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#F1F5F7] text-[#18243A] border border-[#D9E2E8]">
                {dossier.s1Identification.numeroOrdre}
              </span>
              <h1 className="text-base sm:text-lg font-bold text-[#18243A] tracking-tight">
                {dossier.s1Identification.nom} {dossier.s1Identification.prenoms}
              </h1>

              {/* Status Badge */}
              {dossier.statut === 'VALIDÉ' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Validé
                </span>
              )}
              {dossier.statut === 'EN_COURS' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B45309]">
                  En cours
                </span>
              )}
              {dossier.statut === 'BROUILLON' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F7] text-[#64748B]">
                  Brouillon
                </span>
              )}
              {dossier.statut === 'ARCHIVÉ' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FFE4E6] text-[#BE123C]">
                  <Archive className="w-3.5 h-3.5" />
                  Archivé
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1 flex-wrap">
              <span>{dossier.s1Identification.age} ans</span>
              <span aria-hidden="true">·</span>
              <span>{dossier.s1Identification.sexe}</span>
              <span aria-hidden="true">·</span>
              <span>{dossier.s1Identification.situationMatrimoniale || 'Situation non précisée'}</span>
              <span aria-hidden="true">·</span>
              <span>{dossier.s1Identification.profession || 'Sans profession'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#07988D] font-medium">Réf : {dossier.psychiatreReferent}</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar and Actions */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Completeness indicator */}
          <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#D9E2E8] px-3 py-1.5 rounded-lg">
            <div className="text-right">
              <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Complétude
              </div>
              <div className="font-mono text-sm font-bold text-[#18243A]">
                {stats.percentage}%
              </div>
            </div>
            <div className="w-20 bg-[#D9E2E8] h-2 rounded-full overflow-hidden">
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
            <div className="text-[11px] text-[#64748B]">
              <span className="text-[#10B981] font-semibold">{stats.completeCount}</span> / {stats.total}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {dossier.statut === 'VALIDÉ' ? (
              <>
                <button
                  onClick={onOpenAddendumModal}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FilePlus2 className="w-3.5 h-3.5" />
                  + Ajouter un Addendum
                </button>
              </>
            ) : (
              dossier.statut !== 'ARCHIVÉ' && (
                <button
                  onClick={onValidateDossier}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isPsychiatre && validationCheck.canValidate
                      ? 'bg-[#10B981] text-white hover:bg-[#059669] shadow-xs'
                      : isPsychiatre
                      ? 'bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE68A] border border-[#F59E0B]/30'
                      : 'bg-[#F1F5F7] text-[#64748B] hover:bg-[#E8EEF2] border border-[#D9E2E8]'
                  }`}
                  title={
                    isPsychiatre
                      ? validationCheck.canValidate
                        ? 'Valider et verrouiller officiellement le dossier'
                        : `Rubriques requises manquantes : ${validationCheck.missingRequirements.join(', ')} (cliquez pour voir la checklist)`
                      : 'Validation officielle (cliquez pour voir les conditions et la checklist)'
                  }
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Valider le dossier</span>
                  {!isPsychiatre && <span className="text-[10px] text-[#94A3B8] font-normal">(Psychiatre)</span>}
                </button>
              )
            )}

            <button
              onClick={onOpenExportModal}
              className="px-3 py-1.5 text-xs font-semibold text-[#18243A] bg-white border border-[#D9E2E8] hover:bg-[#F8FAFC] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#64748B]" />
              Exporter
            </button>

            {/* Archive / Reactivate */}
            {dossier.statut === 'ARCHIVÉ' ? (
              <button
                onClick={onReactivateDossier}
                className="px-3 py-1.5 text-xs font-semibold text-[#18243A] bg-white border border-[#D9E2E8] hover:bg-[#F8FAFC] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#07988D]" />
                Réactiver
              </button>
            ) : (
              <button
                onClick={onArchiveDossier}
                className="px-2.5 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#BE123C] hover:bg-[#FFE4E6]/50 rounded-lg transition-colors cursor-pointer"
                title="Archiver ce dossier médical (fin de suivi, transfert, etc.)"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Validated notice */}
      {dossier.statut === 'VALIDÉ' && dossier.validationInfo && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-[#E8EEF2] flex items-center justify-between text-[11px] text-[#64748B]">
          <div className="flex items-center gap-1.5 text-[#15803D]">
            <Lock className="w-3 h-3 text-[#10B981]" />
            <span>Dossier validé et verrouillé le {new Date(dossier.validationInfo.dateHeure).toLocaleDateString('fr-FR')} par {dossier.validationInfo.signataire}</span>
          </div>
          {dossier.addenda.length > 0 && (
            <span className="font-medium text-[#07988D]">
              {dossier.addenda.length} addendum(s) enregistré(s)
            </span>
          )}
        </div>
      )}

      {/* Missing validation warning */}
      {!validationCheck.canValidate && dossier.statut !== 'VALIDÉ' && dossier.statut !== 'ARCHIVÉ' && isPsychiatre && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-[#E8EEF2] flex items-center gap-2 text-[11px] text-[#B45309]">
          <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
          <span>Pour valider : {validationCheck.missingRequirements.join(' · ')}</span>
        </div>
      )}
    </div>
  );
};
