import React, { useState } from 'react';
import { DossierPsychiatrique, UserProfile } from '../types';
import { RUBRIQUES_CONFIG } from '../utils/rules';
import { X, Printer, CheckSquare, Square, FileText, Lock } from 'lucide-react';

interface ExportDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: DossierPsychiatrique;
  currentUser: UserProfile;
  onLogExport: () => void;
}

export const ExportDossierModal: React.FC<ExportDossierModalProps> = ({
  isOpen,
  onClose,
  dossier,
  currentUser,
  onLogExport,
}) => {
  if (!isOpen) return null;

  const [selectedRubriques, setSelectedRubriques] = useState<string[]>(
    RUBRIQUES_CONFIG.map(r => r.id)
  );

  const toggleAll = () => {
    if (selectedRubriques.length === RUBRIQUES_CONFIG.length) {
      setSelectedRubriques(['s1', 's2', 's3']);
    } else {
      setSelectedRubriques(RUBRIQUES_CONFIG.map(r => r.id));
    }
  };

  const toggleRubrique = (id: string) => {
    if (selectedRubriques.includes(id)) {
      setSelectedRubriques(selectedRubriques.filter(r => r !== id));
    } else {
      setSelectedRubriques([...selectedRubriques, id]);
    }
  };

  const handlePrint = () => {
    onLogExport();
    window.print();
  };

  const diagPrincipal = dossier.s12HypothesesDiag.hypotheses?.find(h => h.type === 'Principale');

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:static print:bg-white print:p-0 print:overflow-visible">
      <div className="clinical-card w-full max-w-4xl overflow-hidden my-6 flex flex-col max-h-[92vh] border-[#CBD5E1] shadow-2xl print:max-h-none print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none print:overflow-visible">
        {/* Header - Screen only */}
        <div className="bg-gradient-to-r from-[#F8FAFC] via-white to-[#F0FDFA] border-b border-[#D9E2E8] px-6 sm:px-7 py-4 flex items-center justify-between no-print shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#18243A] tracking-tight">
              Exportation & Impression Clinique
            </h2>
            <p className="text-xs text-[#64748B] font-medium">
              Standard 17 Rubriques · Document officiel sous secret médical (Art. 226-13)
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="clinical-btn-primary px-4 py-2 text-xs flex items-center gap-2 cursor-pointer shadow-sm shadow-[#10B9A9]/20"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Exporter PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#18243A] p-2 rounded-xl hover:bg-[#F1F5F7] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rubrique selection bar - Screen only */}
        <div className="p-4 sm:px-7 bg-[#F1F5F7] border-b border-[#D9E2E8] text-xs no-print shrink-0 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[#18243A]">
              Rubriques à inclure dans l'export officiel ({selectedRubriques.length} / {RUBRIQUES_CONFIG.length}) :
            </span>
            <button
              onClick={toggleAll}
              className="text-[#07988D] hover:underline font-bold text-xs cursor-pointer"
            >
              {selectedRubriques.length === RUBRIQUES_CONFIG.length ? 'Désélectionner tout' : 'Tout sélectionner (17)'}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {RUBRIQUES_CONFIG.map((r) => {
              const checked = selectedRubriques.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => toggleRubrique(r.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
                    checked
                      ? 'bg-white text-[#07988D] border-[#10B9A9] font-bold shadow-2xs'
                      : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  {checked ? <CheckSquare className="w-3.5 h-3.5 text-[#10B9A9]" /> : <Square className="w-3.5 h-3.5 text-[#94A3B8]" />}
                  <span>{r.code}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview / Printable Document View */}
        <div className="p-8 overflow-y-auto space-y-6 bg-white text-[#18243A] print:p-0 print:space-y-4 font-sans text-xs">
          {/* Watermark Notice */}
          <div className="p-2.5 bg-[#F1F5F7] border border-[#D9E2E8] rounded text-center text-[10px] font-bold tracking-widest text-[#64748B] uppercase">
            *** CONFIDENTIEL — DOSSIER PATIENT EN PSYCHIATRIE — SECRET MÉDICAL (ART. 226-13) ***
          </div>

          {/* Official Clinical Header */}
          <div className="border-b-2 border-[#18243A] pb-4 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <div className="text-sm font-bold tracking-tight text-[#18243A] uppercase">
                {dossier.serviceHospitalier}
              </div>
              <div className="text-xs text-[#64748B]">
                Médecin Psychiatre Référent : <strong>{dossier.psychiatreReferent}</strong>
              </div>
              <div className="text-[11px] text-[#64748B]">
                Date d’édition : {new Date().toLocaleDateString('fr-FR')} par {currentUser.name} ({currentUser.role})
              </div>
            </div>

            <div className="sm:text-right">
              <div className="font-mono text-base font-bold text-[#18243A] px-2 py-1 bg-[#F1F5F7] inline-block border border-[#D9E2E8]">
                N° {dossier.s1Identification.numeroOrdre}
              </div>
              <div className="text-xs font-bold text-[#07988D] mt-1">
                Statut : {dossier.statut}
              </div>
            </div>
          </div>

          {/* Patient Card Summary */}
          <div className="p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-[#64748B] block">Nom & Prénoms :</span>
              <strong className="text-[#18243A] uppercase">
                {dossier.s1Identification.nom} {dossier.s1Identification.prenoms}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] block">Âge & Sexe :</span>
              <strong>{dossier.s1Identification.age} ans · {dossier.s1Identification.sexe}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] block">Modalité :</span>
              <strong>{dossier.s2Modalites.modalite}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] block">Orientation :</span>
              <strong>{dossier.s14PriseEnCharge.orientation || 'Non définie'}</strong>
            </div>
          </div>

          {/* S1: Identification */}
          {selectedRubriques.includes('s1') && (
            <section className="space-y-1.5 border-b border-[#E8EEF2] pb-3">
              <h3 className="font-bold text-[#07988D] text-xs uppercase tracking-wide">
                S1. Identification & Données socio-démographiques
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div><strong>Profession :</strong> {dossier.s1Identification.profession || 'Néant'}</div>
                <div><strong>Situation matrimoniale :</strong> {dossier.s1Identification.situationMatrimoniale || 'Non renseignée'}</div>
                <div><strong>Religion :</strong> {dossier.s1Identification.religion || 'Non renseignée'}</div>
                <div><strong>Ethnie :</strong> {dossier.s1Identification.ethnie || 'Non renseignée'}</div>
                <div><strong>Adresse :</strong> {dossier.s1Identification.adresse || 'Non renseignée'}</div>
                <div><strong>Contact urgence :</strong> {dossier.s1Identification.personneContact || 'Aucun'}</div>
              </div>
            </section>
          )}

          {/* S2: Modalités */}
          {selectedRubriques.includes('s2') && (
            <section className="space-y-1.5 border-b border-[#E8EEF2] pb-3">
              <h3 className="font-bold text-[#07988D] text-xs uppercase tracking-wide">
                S2. Modalités de consultation
              </h3>
              <p><strong>Régime :</strong> {dossier.s2Modalites.modalite}</p>
              {dossier.s2Modalites.soinsSansConsentementType && (
                <p><strong>Cadre légal :</strong> {dossier.s2Modalites.soinsSansConsentementType} ({dossier.s2Modalites.soinsSansConsentementDemandeur || 'Autorité'})</p>
              )}
              {dossier.s2Modalites.observationsModalite && (
                <p className="text-[#64748B]"><strong>Observations :</strong> {dossier.s2Modalites.observationsModalite}</p>
              )}
            </section>
          )}

          {/* S3: Motif */}
          {selectedRubriques.includes('s3') && (
            <section className="space-y-1.5 border-b border-[#E8EEF2] pb-3">
              <h3 className="font-bold text-[#07988D] text-xs uppercase tracking-wide">
                S3. Motif de consultation actuel
              </h3>
              <p className="leading-relaxed bg-[#F8FAFC] p-2.5 rounded border border-[#E8EEF2]">
                {dossier.s3Motif.plaintePrincipale || 'Non renseigné'}
              </p>
              <div className="text-[11px] text-[#64748B]">
                Source : {dossier.s3Motif.sourcePlainte} · {dossier.s3Motif.accompagnateurs ? `Accompagnateurs : ${dossier.s3Motif.accompagnateurs}` : ''}
              </div>
            </section>
          )}

          {/* S4: Histoire de la maladie */}
          {selectedRubriques.includes('s4') && (
            <section className="space-y-1.5 border-b border-[#E8EEF2] pb-3">
              <h3 className="font-bold text-[#07988D] text-xs uppercase tracking-wide">
                S4. Histoire de la maladie (Anamnèse)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <p><strong>Début des troubles :</strong> {dossier.s4HistoireMaladie.dateDebut || 'Non précisé'}</p>
                <p><strong>Mode d'installation :</strong> {dossier.s4HistoireMaladie.modeInstallation || 'Non précisé'}</p>
              </div>
              <p><strong>Facteurs déclenchants :</strong> {dossier.s4HistoireMaladie.facteursDeclenchants?.join(', ') || 'Aucun identifié'} {dossier.s4HistoireMaladie.facteursDeclenchantsAutrePrecision ? `(${dossier.s4HistoireMaladie.facteursDeclenchantsAutrePrecision})` : ''}</p>
              {dossier.s4HistoireMaladie.itineraireTherapeutique && (
                <p><strong>Itinéraire thérapeutique :</strong> {dossier.s4HistoireMaladie.itineraireTherapeutique}</p>
              )}
              {dossier.s4HistoireMaladie.retentissementSocioProfessionnel && (
                <p><strong>Retentissement :</strong> {dossier.s4HistoireMaladie.retentissementSocioProfessionnel}</p>
              )}
            </section>
          )}

          {/* S5: Représentation socio-culturelle */}
          {selectedRubriques.includes('s5') && (
            <section className="space-y-1.5 border-b border-[#E8EEF2] pb-3">
              <h3 className="font-bold text-[#07988D] text-xs uppercase tracking-wide">
                S5. Représentation socio-culturelle de la maladie
              </h3>
              <p><strong>Catégories évoquées :</strong> {dossier.s5Representation.categories?.join(', ') || 'Aucune catégorie spécifique'}</p>
              {dossier.s5Representation.explicationPatient && (
                <p><strong>Vécu patient :</strong> {dossier.s5Representation.explicationPatient}</p>
              )}
              {dossier.s5Representation.explicationFamille && (
                <p><strong>Perception famille :</strong> {dossier.s5Representation.explicationFamille}</p>
              )}
            </section>
          )}

          {/* S6: Antécédents */}
          {selectedRubriques.includes('s6') && (
            <section className="space-y-1.5 border-b border-[#E8EEF2] pb-3">
              <h3 className="font-bold text-[#07988D] text-xs uppercase tracking-wide">
                S6. Antécédents
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-[11px] text-[#18243A]">Personnels :</h4>
                  <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                    <li>Médicaux : {dossier.s6Antecedents.personnels.medicaux.aucun ? 'Néant' : dossier.s6Antecedents.personnels.medicaux.details || 'Non renseigné'}</li>
                    <li>Chirurgicaux : {dossier.s6Antecedents.personnels.chirurgicaux.aucun ? 'Néant' : dossier.s6Antecedents.personnels.chirurgicaux.details || 'Non renseigné'}</li>
                    {dossier.s1Identification.sexe === 'Féminin' && (
                      <li>Gynéco-obstétricaux : {dossier.s6Antecedents.personnels.gynecoObstetricaux?.aucun ? 'Néant' : dossier.s6Antecedents.personnels.gynecoObstetricaux?.details || 'Non renseigné'}</li>
                    )}
                    <li>Psychiatriques : {dossier.s6Antecedents.personnels.psychiatriques.aucun ? 'Néant' : dossier.s6Antecedents.personnels.psychiatriques.details || 'Non renseigné'}</li>
                    <li>Addictifs : {dossier.s6Antecedents.personnels.addictifs.aucun ? 'Néant' : dossier.s6Antecedents.personnels.addictifs.details || 'Non renseigné'}</li>
                    <li>Judiciaires : {dossier.s6Antecedents.personnels.judiciaires.aucun ? 'Néant' : dossier.s6Antecedents.personnels.judiciaires.details || 'Non renseigné'}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-[11px] text-[#18243A]">Familiaux :</h4>
                  <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                    <li>Médicaux : {dossier.s6Antecedents.familiaux.medicaux.aucun ? 'Néant' : dossier.s6Antecedents.familiaux.medicaux.details || 'Non renseigné'}</li>
                    <li>Chirurgicaux : {dossier.s6Antecedents.familiaux.chirurgicaux.aucun ? 'Néant' : dossier.s6Antecedents.familiaux.chirurgicaux.details || 'Non renseigné'}</li>
                    <li>Psychiatriques : {dossier.s6Antecedents.familiaux.psychiatriques.aucun ? 'Néant' : dossier.s6Antecedents.familiaux.psychiatriques.details || 'Non renseigné'}</li>
                    <li>Addictifs : {dossier.s6Antecedents.familiaux.addictifs.aucun ? 'Néant' : dossier.s6Antecedents.familiaux.addictifs.details || 'Non renseigné'}</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* S10: Examen clinique */}
          {selectedRubriques.includes('s10') && (
            <section className="space-y-2 border-b border-[#E8EEF2] pb-3">
              <h3 className="font-bold text-[#07988D] text-xs uppercase tracking-wide">
                S10. Examen Clinique
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-[11px] text-[#18243A]">Constantes vitales :</h4>
                  <p className="text-[11px]">
                    T° : {dossier.s10ExamenClinique.somatique.constantes.temperature ?? '--'} °C · TA : {dossier.s10ExamenClinique.somatique.constantes.tensionSystolique ?? '--'}/{dossier.s10ExamenClinique.somatique.constantes.tensionDiastolique ?? '--'} mmHg · Pouls : {dossier.s10ExamenClinique.somatique.constantes.pouls ?? '--'} bpm · SpO2 : {dossier.s10ExamenClinique.somatique.constantes.saturationO2 ?? '--'}%
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    État général : {dossier.s10ExamenClinique.somatique.etatGeneral || 'Non précisé'}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-[11px] text-[#18243A]">Sémiologie psychiatrique :</h4>
                  <p className="text-[11px]"><strong>Contact / Mimique :</strong> {dossier.s10ExamenClinique.psychiatrique.contact || '--'} · {dossier.s10ExamenClinique.psychiatrique.mimique || '--'}</p>
                  <p className="text-[11px]"><strong>Pensée & Jugement :</strong> {dossier.s10ExamenClinique.psychiatrique.penseeEtJugement || 'Non documenté'}</p>
                  <p className="text-[11px]"><strong>Affects :</strong> {dossier.s10ExamenClinique.psychiatrique.expressionDesAffects || '--'}</p>
                </div>
              </div>
            </section>
          )}

          {/* S11: Résumé syndromique */}
          {selectedRubriques.includes('s11') && (
            <section className="space-y-1.5 border-b border-[#E8EEF2] pb-3">
              <h3 className="font-bold text-[#07988D] text-xs uppercase tracking-wide">
                S11. Résumé Syndromique
              </h3>
              <p className="bg-[#F8FAFC] p-3 rounded border border-[#E8EEF2] leading-relaxed">
                {dossier.s11ResumeSyndromique.resume || 'Aucun résumé syndromique'}
              </p>
            </section>
          )}

          {/* S12: Hypothèses diagnostiques */}
          {selectedRubriques.includes('s12') && (
            <section className="space-y-1.5 border-b border-[#E8EEF2] pb-3">
              <h3 className="font-bold text-[#07988D] text-xs uppercase tracking-wide">
                S12. Hypothèses Diagnostiques
              </h3>
              <div className="space-y-1">
                {dossier.s12HypothesesDiag.hypotheses?.map((h) => (
                  <div key={h.id} className="flex items-start gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${h.type === 'Principale' ? 'bg-[#10B9A9] text-white' : 'bg-[#F1F5F7] text-[#18243A]'}`}>
                      {h.type}
                    </span>
                    <div>
                      <strong>{h.codeCimDsm ? `[${h.codeCimDsm}] ` : ''}{h.libelle}</strong>
                      {h.argumentsCliniques && <p className="text-[11px] text-[#64748B]">{h.argumentsCliniques}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* S14: Prise en charge */}
          {selectedRubriques.includes('s14') && (
            <section className="space-y-1.5 border-b border-[#E8EEF2] pb-3">
              <h3 className="font-bold text-[#07988D] text-xs uppercase tracking-wide">
                S14. Prise en charge & Prescriptions
              </h3>
              <p><strong>Orientation :</strong> {dossier.s14PriseEnCharge.orientation}</p>
              {dossier.s14PriseEnCharge.traitementMedicamenteux?.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-bold text-[11px] mb-1">Prescriptions pharmacologiques :</h4>
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-[#D9E2E8] text-[#64748B]">
                        <th className="py-1">Molécule</th>
                        <th className="py-1">Posologie / Fréquence</th>
                        <th className="py-1">Voie</th>
                        <th className="py-1">Début</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EEF2]">
                      {dossier.s14PriseEnCharge.traitementMedicamenteux.map(rx => (
                        <tr key={rx.id}>
                          <td className="py-1 font-semibold">{rx.molecule}</td>
                          <td className="py-1">{rx.posologie} · {rx.frequence}</td>
                          <td className="py-1">{rx.voie}</td>
                          <td className="py-1">{rx.dateDebut}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* S17: Pronostic */}
          {selectedRubriques.includes('s17') && (
            <section className="space-y-1.5 border-b border-[#E8EEF2] pb-3">
              <h3 className="font-bold text-[#07988D] text-xs uppercase tracking-wide">
                S17. Pronostic
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-[#F8FAFC] rounded border border-[#E8EEF2]">
                  <span className="text-[10px] text-[#64748B] block">Court terme :</span>
                  <strong>{dossier.s17Pronostic.courtTerme.appreciation || 'Non évalué'}</strong>
                </div>
                <div className="p-2 bg-[#F8FAFC] rounded border border-[#E8EEF2]">
                  <span className="text-[10px] text-[#64748B] block">Moyen terme :</span>
                  <strong>{dossier.s17Pronostic.moyenTerme.appreciation || 'Non évalué'}</strong>
                </div>
                <div className="p-2 bg-[#F8FAFC] rounded border border-[#E8EEF2]">
                  <span className="text-[10px] text-[#64748B] block">Long terme :</span>
                  <strong>{dossier.s17Pronostic.longTerme.appreciation || 'Non évalué'}</strong>
                </div>
              </div>
            </section>
          )}

          {/* Addenda notice if present */}
          {dossier.addenda?.length > 0 && (
            <section className="space-y-2 pt-2">
              <h3 className="font-bold text-[#9333EA] text-xs uppercase tracking-wide">
                Addenda Cliniques ({dossier.addenda.length})
              </h3>
              {dossier.addenda.map(add => (
                <div key={add.id} className="p-2.5 bg-[#F3E8FF]/30 border border-[#A855F7]/30 rounded text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-[#18243A]">
                    <span>{add.rubriqueNom}</span>
                    <span className="text-[11px] text-[#64748B]">{new Date(add.dateHeure).toLocaleDateString('fr-FR')} - {add.auteurNom}</span>
                  </div>
                  <p className="text-[#18243A]">{add.contenu}</p>
                </div>
              ))}
            </section>
          )}

          {/* Validation sign-off footer */}
          <div className="pt-8 mt-6 border-t border-[#18243A] flex justify-between items-end text-xs">
            <div>
              <p className="text-[#64748B]">Document certifié conforme à l'observation clinique hospitalière.</p>
              <p className="text-[#64748B]">Conservation et traçabilité selon le plan type en 17 rubriques.</p>
            </div>
            <div className="text-right border-t border-dashed border-[#18243A] pt-2 min-w-[240px]">
              <span className="text-[10px] text-[#64748B] block">Signature & Cachet du Praticien :</span>
              <strong className="block mt-4">{dossier.validationInfo?.signataire || dossier.psychiatreReferent}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
