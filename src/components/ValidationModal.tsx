import React, { useState } from 'react';
import { DossierPsychiatrique, UserProfile } from '../types';
import { checkDossierValidationPreconditions, RUBRIQUES_CONFIG } from '../utils/rules';
import { X, CheckCircle2, Lock, AlertTriangle, FilePlus2, ShieldCheck } from 'lucide-react';

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
    const targetRubrique = RUBRIQUES_CONFIG.find(r => r.id === addendumRubriqueId);
    onConfirmAddendum(
      addendumRubriqueId,
      targetRubrique ? `${targetRubrique.code} : ${targetRubrique.titre}` : addendumRubriqueId,
      addendumContent.trim()
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111827]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#D9E2E8] shadow-xl w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#F8FAFC] border-b border-[#D9E2E8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'VALIDATION' ? (
              <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#15803D]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#ECFBF9] flex items-center justify-center text-[#07988D]">
                <FilePlus2 className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-[#18243A]">
                {mode === 'VALIDATION' ? 'Validation & Verrouillage du Dossier' : 'Ajouter un Addendum Clinique'}
              </h2>
              <p className="text-xs text-[#64748B]">
                {dossier.s1Identification.numeroOrdre} · {dossier.s1Identification.nom} {dossier.s1Identification.prenoms}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#18243A] p-1.5 rounded-lg hover:bg-[#F1F5F7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {mode === 'VALIDATION' ? (
          <form onSubmit={handleValidationSubmit} className="p-6 space-y-4">
            {/* Checklist des préconditions */}
            <div className="p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#18243A] uppercase tracking-wider block">
                  Contrôle qualité des préconditions cliniques (F-21 & B3)
                </span>
                <span className="text-[11px] font-mono text-[#64748B]">
                  {validationChecks.missingRequirements.length === 0 ? '8/8 conformes' : `${8 - validationChecks.missingRequirements.length}/8 conformes`}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                {[
                  { id: 's1', label: 'S1 : Identité complète (Nom, Prénoms, Âge, Sexe)', ok: Boolean(dossier.s1Identification.nom && dossier.s1Identification.prenoms && dossier.s1Identification.age) },
                  { id: 's2', label: 'S2 : Modalité de consultation définie', ok: Boolean(dossier.s2Modalites.modalite) },
                  { id: 's3', label: 'S3 : Plainte principale (Motif) formulée', ok: Boolean(dossier.s3Motif.plaintePrincipale) },
                  { id: 's10', label: 'S10 : Examen somatique et psychiatrique documentés', ok: Boolean(dossier.s10ExamenClinique.somatique.nonRealise || (dossier.s10ExamenClinique.somatique.constantes.temperature && dossier.s10ExamenClinique.somatique.constantes.tensionSystolique)) },
                  { id: 's11', label: 'S11 : Résumé syndromique rédigé', ok: Boolean(dossier.s11ResumeSyndromique.resume) },
                  { id: 's12', label: 'S12 : Hypothèse diagnostique Principale établie', ok: dossier.s12HypothesesDiag.hypotheses?.some(h => h.type === 'Principale') },
                  { id: 's14', label: 'S14 : Orientation thérapeutique choisie', ok: Boolean(dossier.s14PriseEnCharge.orientation) },
                  { id: 's17', label: 'S17 : Pronostic à court, moyen et long terme (BR-017)', ok: Boolean(dossier.s17Pronostic.courtTerme.appreciation && dossier.s17Pronostic.moyenTerme.appreciation && dossier.s17Pronostic.longTerme.appreciation) },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1 rounded hover:bg-white transition-colors">
                    <div className="flex items-center gap-2">
                      {item.ok ? (
                        <span className="text-[#15803D] font-bold">✓</span>
                      ) : (
                        <span className="text-[#BE123C] font-bold">✕</span>
                      )}
                      <span className={item.ok ? 'text-[#18243A]' : 'text-[#BE123C] font-semibold'}>
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
                        className="text-[11px] text-[#07988D] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        Compléter →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Role restriction notification if not Psychiatre */}
            {currentUser.role !== 'PSYCHIATRE' && (
              <div className="p-3 bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#92400E]">
                <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">Signature réservée au Médecin Psychiatre (BR-014)</span>
                  <p className="mt-0.5">
                    Vous êtes actuellement connecté en tant que <strong>{currentUser.name}</strong> ({currentUser.role}). Pour signer et valider définitivement ce dossier :
                  </p>
                  {onSwitchToPsychiatre && (
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchToPsychiatre();
                      }}
                      className="mt-2 px-3 py-1 bg-white text-[#B45309] border border-[#F59E0B] font-bold rounded hover:bg-[#FEF3C7] text-xs cursor-pointer"
                    >
                      Basculer sur le Dr. Oumar Diallo (Psychiatre)
                    </button>
                  )}
                </div>
              </div>
            )}

            {!validationChecks.canValidate ? (
              <div className="p-3 bg-[#FFE4E6] border border-[#F43F5E]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#BE123C]">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Impossible de valider le dossier en l'état</span>
                  <p className="mt-1">
                    Veuillez compléter les rubriques manquantes : {validationChecks.missingRequirements.join(' · ')}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-3 bg-[#DCFCE7]/50 border border-[#10B981]/30 rounded-xl text-xs text-[#15803D] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>Toutes les rubriques requises sont conformes. Le dossier est prêt pour la validation officielle.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18243A] mb-1">
                    Signature du médecin psychiatre signataire <span className="text-[#F43F5E]">*</span>
                  </label>
                  <input
                    type="text"
                    value={signataire}
                    onChange={(e) => setSignataire(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#D9E2E8] text-xs font-semibold text-[#18243A] rounded-lg px-3 py-2"
                  />
                </div>

                <label className="flex items-start gap-2 p-3 bg-[#F1F5F7] rounded-xl text-xs text-[#18243A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedCheckbox}
                    onChange={(e) => setConfirmedCheckbox(e.target.checked)}
                    className="mt-0.5 rounded text-[#10B9A9] focus:ring-[#10B9A9]"
                  />
                  <span>
                    J'atteste sur l'honneur l'exactitude de ces constatations cliniques. Je confirme le verrouillage du dossier. Toute modification ultérieure s'effectuera sous forme d’addendum daté (BR-013).
                  </span>
                </label>
              </>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8EEF2]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={!validationChecks.canValidate || !confirmedCheckbox || !signataire.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                Valider et verrouiller le dossier
              </button>
            </div>
          </form>
        ) : (
          /* Mode ADDENDUM (BR-013) */
          <form onSubmit={handleAddendumSubmit} className="p-6 space-y-4">
            <div className="p-3 bg-[#F3E8FF] border border-[#A855F7]/30 rounded-xl text-xs text-[#9333EA]">
              <span className="font-bold block">Règle médicale BR-013 : Dossier Validé</span>
              <p className="mt-0.5">
                Le dossier étant clôturé, toute nouvelle observation ou rectification clinique doit être inscrite dans un addendum daté et signé nominativement.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Rubrique concernée par l'addendum
              </label>
              <select
                value={addendumRubriqueId}
                onChange={(e) => setAddendumRubriqueId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#D9E2E8] text-xs font-semibold text-[#18243A] rounded-lg px-3 py-2"
              >
                {RUBRIQUES_CONFIG.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} : {r.titre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Contenu de l'addendum clinique <span className="text-[#F43F5E]">*</span>
              </label>
              <textarea
                rows={4}
                value={addendumContent}
                onChange={(e) => setAddendumContent(e.target.value)}
                placeholder="Préciser les nouveaux éléments cliniques, ajustements thérapeutiques, résultats tardifs..."
                className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-xs rounded-lg p-3 focus:outline-none"
              />
            </div>

            <div className="text-[11px] text-[#64748B]">
              Auteur : <strong>{currentUser.name}</strong> ({currentUser.role}) · Horodatage automatique.
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8EEF2]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={!addendumContent.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                Enregistrer l'addendum
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
