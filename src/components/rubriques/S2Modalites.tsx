import React, { useState } from 'react';
import { S2ModalitesData, ModaliteType, SoinsSansConsentementType } from '../../types';
import { Save, ChevronRight, AlertCircle, ShieldAlert } from 'lucide-react';

interface Props {
  data: S2ModalitesData;
  isReadOnly: boolean;
  onSave: (data: S2ModalitesData) => void;
  onNext: () => void;
}

export const S2Modalites: React.FC<Props> = ({
  data,
  isReadOnly,
  onSave,
  onNext,
}) => {
  const [formData, setFormData] = useState<S2ModalitesData>(data);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.modalite) {
      setError('La modalité de consultation est obligatoire.');
      return;
    }
    if (formData.modalite === 'Soins sans consentement' && !formData.soinsSansConsentementType) {
      setError('Pour les soins sans consentement, le sous-type légal est obligatoire.');
      return;
    }
    if (formData.modalite === 'Adressé par un tiers' && !formData.adresseParTiersPrecision?.trim()) {
      setError('Veuillez préciser le tiers ayant adressé le patient (nom du médecin, CSREF, etc.).');
      return;
    }
    setError(null);
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8EEF2]">
        <div>
          <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2 py-0.5 rounded">
            S2 · ADMINISTRATIF
          </span>
          <h2 className="text-base font-bold text-[#18243A] mt-1">
            Modalités de consultation
          </h2>
          <p className="text-xs text-[#64748B]">
            Cadre médico-légal d'admission et de consentement aux soins (BR-004, BR-005, BR-006)
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#FFE4E6] border border-[#F43F5E]/30 rounded-lg flex items-center gap-2 text-xs text-[#BE123C]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isSaved && (
        <div className="mb-4 p-2.5 bg-[#DCFCE7] border border-[#10B981]/30 rounded-lg text-xs text-[#15803D] font-medium">
          Modalités enregistrées avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Modalité principale */}
        <div>
          <label className="block text-xs font-bold text-[#18243A] mb-2">
            Régime d’admission <span className="text-[#F43F5E]">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: 'Libre' as ModaliteType,
                title: 'Soins Libres',
                desc: 'À la demande exclusive du patient'
              },
              {
                id: 'Adressé par un tiers' as ModaliteType,
                title: 'Adressé par un tiers',
                desc: 'Orientation médecin traitant, famille, structure'
              },
              {
                id: 'Soins sans consentement' as ModaliteType,
                title: 'Soins sans consentement',
                desc: 'À la demande d’un tiers ou représentant de l’État'
              }
            ].map((option) => (
              <label
                key={option.id}
                className={`relative flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.modalite === option.id
                    ? 'border-[#10B9A9] bg-[#ECFBF9] ring-2 ring-[#10B9A9]/20'
                    : 'border-[#D9E2E8] bg-[#F8FAFC] hover:border-[#10B9A9]/50'
                } ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="modalite"
                    disabled={isReadOnly}
                    checked={formData.modalite === option.id}
                    onChange={() => setFormData({
                      ...formData,
                      modalite: option.id,
                      // Clear conditional fields if switching
                      soinsSansConsentementType: option.id === 'Soins sans consentement' ? formData.soinsSansConsentementType : undefined,
                      adresseParTiersPrecision: option.id === 'Adressé par un tiers' ? formData.adresseParTiersPrecision : undefined,
                    })}
                    className="text-[#10B9A9] focus:ring-[#10B9A9]"
                  />
                  <span className="text-xs font-bold text-[#18243A]">{option.title}</span>
                </div>
                <span className="text-[11px] text-[#64748B] mt-1 pl-5">
                  {option.desc}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Conditionnel : Adressé par un tiers */}
        {formData.modalite === 'Adressé par un tiers' && (
          <div className="p-4 bg-[#F1F5F7] rounded-xl border border-[#D9E2E8] space-y-3">
            <h3 className="text-xs font-bold text-[#18243A]">
              Précisions sur le tiers orienteur
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1">
                  Type de prescripteur / tiers
                </label>
                <select
                  disabled={isReadOnly}
                  value={formData.adresseParTiersType || 'Médecin traitant'}
                  onChange={(e) => setFormData({ ...formData, adresseParTiersType: e.target.value as any })}
                  className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
                >
                  <option value="Médecin traitant">Médecin traitant / Généraliste</option>
                  <option value="Centre de santé">Centre de santé (CSCOM / CSREF)</option>
                  <option value="Famille">Famille / Entourage proche</option>
                  <option value="Autre">Autre intervenant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1">
                  Nom et coordonnées du tiers orienteur <span className="text-[#F43F5E]">*</span>
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.adresseParTiersPrecision || ''}
                  onChange={(e) => setFormData({ ...formData, adresseParTiersPrecision: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
                  placeholder="Ex: Dr. Traoré, CSREF de Kalaban-Coro"
                />
              </div>
            </div>
          </div>
        )}

        {/* Conditionnel : Soins sans consentement (BR-005) */}
        {formData.modalite === 'Soins sans consentement' && (
          <div className="p-4 bg-[#FFE4E6]/30 rounded-xl border border-[#F43F5E]/30 space-y-4">
            <div className="flex items-center gap-2 text-[#BE123C]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Cadre légal des soins psychiatriques sans consentement
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18243A] mb-2">
                Sous-type légal obligatoire <span className="text-[#F43F5E]">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "À la demande d'un tiers",
                  "À la demande d'un représentant de l'État"
                ].map((subtype) => (
                  <label
                    key={subtype}
                    className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer ${
                      formData.soinsSansConsentementType === subtype
                        ? 'border-[#BE123C] bg-white ring-1 ring-[#BE123C]'
                        : 'border-[#D9E2E8] bg-white hover:border-[#BE123C]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="soinsSansConsentementType"
                      disabled={isReadOnly}
                      checked={formData.soinsSansConsentementType === subtype}
                      onChange={() => setFormData({ ...formData, soinsSansConsentementType: subtype as SoinsSansConsentementType })}
                      className="mt-0.5 text-[#BE123C] focus:ring-[#BE123C]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#18243A] block">{subtype}</span>
                      <span className="text-[11px] text-[#64748B]">
                        {subtype === "À la demande d'un tiers"
                          ? 'Membre de la famille ou personne agissant dans l’intérêt du patient'
                          : 'Arrêté préfectoral, réquisition de police ou autorité judiciaire'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1">
                  Identité du demandeur ou autorité requérante
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.soinsSansConsentementDemandeur || ''}
                  onChange={(e) => setFormData({ ...formData, soinsSansConsentementDemandeur: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
                  placeholder="Ex: Commissariat de police ou Frère aîné"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1">
                  Date de l’ordonnance / certificat initial
                </label>
                <input
                  type="date"
                  disabled={isReadOnly}
                  value={formData.dateDecisionOuCertificat || ''}
                  onChange={(e) => setFormData({ ...formData, dateDecisionOuCertificat: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Observations libres sur la modalité */}
        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Observations cliniques et administratives
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            value={formData.observationsModalite || ''}
            onChange={(e) => setFormData({ ...formData, observationsModalite: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-3 focus:outline-none"
            placeholder="Circonstances d’arrivée, présence de l’entourage, attitude du patient lors de l'admission..."
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8EEF2]">
          <div className="text-[11px] text-[#64748B]">
            * Régime juridique obligatoire avant toute validation clinique
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Enregistrer S2
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors flex items-center gap-1.5"
            >
              Suivant (S3)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
