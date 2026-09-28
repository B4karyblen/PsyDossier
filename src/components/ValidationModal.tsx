import React, { useState } from 'react';
import { DossierPsychiatrique, UserProfile } from '../types';
import { checkDossierValidationPreconditions, RUBRIQUES_CONFIG } from '../utils/rules';
import { X, CheckCircle2, Lock, AlertTriangle, FilePlus2, ShieldCheck, ArrowRight, ShieldAlert } from 'lucide-react';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: DossierPsychiatrique;
  currentUser: UserProfile;
  mode: 'VALIDATION' | 'ADDENDUM';
  onConfirmValidation: (signataire: string) => void;
  onConfirmAddendum: (rubriqueId: string, rubriqueNom: string, contenu: string) => void;
  onNavigateToRubrique?: (rubriqueId: string) => void;
  onSwitchToPsychiatre?: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  dossier,
  currentUser,
  mode,
  onConfirmValidation,
  onConfirmAddendum,
  onNavigateToRubrique,
  onSwitchToPsychiatre,
}) => {
  if (!isOpen) return null;

  const validationChecks = checkDossierValidationPreconditions(dossier);
  const [signataire, setSignataire] = useState(
    `${currentUser.name}, ${currentUser.title} - Réf. Ordre Médical`
  );
  const [confirmedCheckbox, setConfirmedCheckbox] = useState(false);

  // Addendum state
  const [addendumRubriqueId, setAddendumRubriqueId] = useState('s15');
  const [addendumContent, setAddendumContent] = useState('');

  const handleValidationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationChecks.canValidate || !confirmedCheckbox || !signataire.trim()) return;
    onConfirmValidation(signataire.trim());
    onClose();
  };

  const handleAddendumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addendumContent.trim()) return;
    const targetRubrique = RUBRIQUES_CONFIG.find((r) => r.id === addendumRubriqueId);
    onConfirmAddendum(
      addendumRubriqueId,
      targetRubrique ? `${targetRubrique.code} : ${targetRubrique.titre}` : addendumRubriqueId,
      addendumContent.trim()
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="clinical-card w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 border-[#CBD5E1] shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F8FAFC] via-white to-[#F0FDFA] border-b border-[#D9E2E8] px-6 sm:px-7 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mode === 'VALIDATION' ? (
              <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center border border-[#86EFAC] shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#ECFBF9] text-[#07988D] flex items-center justify-center border border-[#10B9A9]/20 shadow-xs">
                <FilePlus2 className="w-5 h-5 text-[#07988D]" />
              </div>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#18243A] tracking-tight">
                {mode === 'VALIDATION' ? 'Validation & Verrouillage Clinique' : 'Consignation d’un Addendum'}
              </h2>
              <p className="text-xs text-[#64748B] font-medium">
                {dossier.s1Identification.numeroOrdre} · {dossier.s1Identification.nom} {dossier.s1Identification.prenoms}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#18243A] p-2 rounded-xl hover:bg-[#F1F5F7] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {mode === 'VALIDATION' ? (
          <form onSubmit={handleValidationSubmit} className="p-6 sm:p-7 space-y-4.5">
            {/* Checklist des préconditions */}
            <div className="clinical-subcard p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8EEF2]">
                <span className="text-xs font-black uppercase tracking-wider text-[#18243A]">
                  Contrôle Qualité & Préconditions (F-21 & B3)
                </span>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                  validationChecks.missingRequirements.length === 0
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : 'bg-[#FFE4E6] text-[#BE123C]'
                }`}>
                  {8 - validationChecks.missingRequirements.length}/8 conformes
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { id: 's1', label: 'S1 : Identité complète (Nom, Prénoms, Âge, Sexe)', ok: Boolean(dossier.s1Identification.nom && dossier.s1Identification.prenoms && dossier.s1Identification.age) },
                  { id: 's2', label: 'S2 : Modalité de consultation définie', ok: Boolean(dossier.s2Modalites.modalite) },
                  { id: 's3', label: 'S3 : Plainte principale (Motif) formulée', ok: Boolean(dossier.s3Motif.plaintePrincipale) },
                  { id: 's10', label: 'S10 : Examen somatique et psychiatrique documentés', ok: Boolean(dossier.s10ExamenClinique.somatique.nonRealise || (dossier.s10ExamenClinique.somatique.constantes.temperature && dossier.s10ExamenClinique.somatique.constantes.tensionSystolique)) },
                  { id: 's11', label: 'S11 : Résumé syndromique rédigé', ok: Boolean(dossier.s11ResumeSyndromique.resume) },
                  { id: 's12', label: 'S12 : Hypothèse diagnostique Principale établie', ok: dossier.s12HypothesesDiag.hypotheses?.some((h) => h.type === 'Principale') },
                  { id: 's14', label: 'S14 : Orientation thérapeutique choisie', ok: Boolean(dossier.s14PriseEnCharge.orientation) },
                  { id: 's17', label: 'S17 : Pronostic à court, moyen et long terme (BR-017)', ok: Boolean(dossier.s17Pronostic.courtTerme.appreciation && dossier.s17Pronostic.moyenTerme.appreciation && dossier.s17Pronostic.longTerme.appreciation) },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E8EEF2] hover:border-[#CBD5E1] transition-colors">
                    <div className="flex items-center gap-2.5">
                      {item.ok ? (
                        <div className="w-5 h-5 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center font-bold text-xs shrink-0">
                          ✓
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#FFE4E6] text-[#BE123C] flex items-center justify-center font-bold text-xs shrink-0">
                          ✕
                        </div>
                      )}
                      <span className={`font-semibold ${item.ok ? 'text-[#18243A]' : 'text-[#BE123C]'}`}>
                        {item.label}
                      </span>
                    </div>

                    {!item.ok && onNavigateToRubrique && (
                      <button
                        type="button"
                        onClick={() => {
                          onNavigateToRubrique(item.id);
                          onClose();
                        }}
                        className="text-[11px] text-[#07988D] hover:underline font-bold flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                      >
                        Compléter <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Role restriction notification if not Psychiatre */}
            {currentUser.role !== 'PSYCHIATRE' && (
              <div className="p-3.5 bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-xl flex items-start gap-3 text-xs text-[#92400E]">
                <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <span className="font-extrabold block">Signature réservée au Médecin Psychiatre (BR-014)</span>
                  <p className="leading-snug">
                    Session courante : <strong>{currentUser.name}</strong> ({currentUser.role}). Seul le psychiatre référent peut signer et verrouiller le dossier.
                  </p>
                  {onSwitchToPsychiatre && (
                    <button
                      type="button"
                      onClick={onSwitchToPsychiatre}
                      className="mt-1.5 px-3 py-1 bg-white text-[#B45309] border border-[#F59E0B] font-bold rounded-lg hover:bg-[#FEF3C7] text-xs cursor-pointer shadow-2xs"
                    >
                      Basculer sur le Dr. Oumar Diallo (Psychiatre)
                    </button>
                  )}
                </div>
              </div>
            )}

            {!validationChecks.canValidate ? (
              <div className="p-3.5 bg-[#FFE4E6] border border-[#F43F5E]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#BE123C]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block">Impossible de valider le dossier en l'état</span>
                  <p className="mt-0.5">
                    Veuillez renseigner les rubriques obligatoires requises avant la clôture officielle.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-3.5 bg-[#DCFCE7]/70 border border-[#86EFAC] rounded-xl text-xs text-[#15803D] flex items-center gap-2 font-semibold">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-[#15803D]" />
                  <span>Toutes les rubriques requises sont conformes. Le dossier est prêt pour la signature et le verrouillage officiel.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18243A] mb-1">
                    Signature du médecin psychiatre signataire <span className="text-[#F43F5E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={signataire}
                    onChange={(e) => setSignataire(e.target.value)}
                    className="clinical-input text-xs font-semibold"
                  />
                </div>

                <label className="flex items-start gap-2.5 p-3.5 bg-[#F1F5F7] rounded-xl text-xs text-[#18243A] cursor-pointer border border-[#D9E2E8]">
                  <input
                    type="checkbox"
                    checked={confirmedCheckbox}
                    onChange={(e) => setConfirmedCheckbox(e.target.checked)}
                    className="mt-0.5 rounded text-[#10B9A9] focus:ring-[#10B9A9]"
                  />
                  <span className="font-medium leading-relaxed">
                    J'atteste sur l'honneur l'exactitude de ces constatations cliniques. Je confirme le verrouillage définitif du dossier. Toute observation ultérieure fera l’objet d’un addendum horodaté (BR-013).
                  </span>
                </label>
              </>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#E8EEF2]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-[#64748B] hover:text-[#18243A] bg-[#F1F5F7] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={!validationChecks.canValidate || !confirmedCheckbox || !signataire.trim()}
                className="px-5 py-2.5 text-xs font-black text-white bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all flex items-center gap-2 shadow-sm shadow-[#10B981]/25 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Valider & Verrouiller le Dossier</span>
              </button>
            </div>
          </form>
        ) : (
          /* Mode ADDENDUM (BR-013) */
          <form onSubmit={handleAddendumSubmit} className="p-6 sm:p-7 space-y-4.5">
            <div className="p-3.5 bg-[#F3E8FF] border border-[#D8B4FE] rounded-xl text-xs text-[#7E22CE]">
              <span className="font-extrabold block">Règle médico-légale BR-013 : Dossier Validé</span>
              <p className="mt-0.5 leading-relaxed font-medium">
                Le dossier étant clôturé et certifié, toute nouvelle observation ou rectification clinique doit être inscrite dans un addendum daté et signé nominativement sans altérer l'historique d'origine.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18243A] mb-1">
                Rubrique concernée par l'addendum <span className="text-[#F43F5E]">*</span>
              </label>
              <select
                value={addendumRubriqueId}
                onChange={(e) => setAddendumRubriqueId(e.target.value)}
                className="clinical-input text-xs font-semibold"
              >
                {RUBRIQUES_CONFIG.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} : {r.titre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18243A] mb-1">
                Contenu de l'addendum clinique <span className="text-[#F43F5E]">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={addendumContent}
                onChange={(e) => setAddendumContent(e.target.value)}
                placeholder="Consigner les nouvelles constatations, adaptations thérapeutiques ou résultats récents..."
                className="clinical-input text-xs leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E8EEF2]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-[#64748B] hover:text-[#18243A] bg-[#F1F5F7] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={!addendumContent.trim()}
                className="clinical-btn-primary px-5 py-2.5 text-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm shadow-[#10B9A9]/20"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>Consigner l'Addendum Horodaté</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
