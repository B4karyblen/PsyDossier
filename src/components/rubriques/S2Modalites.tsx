import React, { useState } from 'react';
import { S2ModalitesData, ModaliteType, SoinsSansConsentementType } from '../../types';
import { AlertCircle, ShieldAlert, FileText, UserCheck } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S2ModalitesData;
  isReadOnly: boolean;
  onSave: (data: S2ModalitesData) => void;
  onNext: () => void;
  onPrev?: () => void;
}

export const S2Modalites: React.FC<Props> = ({
  data,
  isReadOnly,
  onSave,
  onNext,
  onPrev,
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
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F7]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2.5 py-0.5 rounded-md border border-[#10B9A9]/20">
              S2 · ADMINISTRATIF
            </span>
            <span className="text-xs text-[#64748B]">Obligatoire pour validation</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#18243A] tracking-tight mt-1">
            Modalités de Consultation
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Cadre médico-légal d'admission et de consentement aux soins (BR-004, BR-005, BR-006)
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-[#FFE4E6] border border-[#F43F5E]/30 rounded-xl flex items-center gap-2.5 text-xs text-[#BE123C] font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Option selector cards */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3.5">
          <label className="block text-xs font-bold text-[#18243A] uppercase tracking-wider">
            Régime d’admission légal <span className="text-[#F43F5E]">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {[
              {
                id: 'Libre' as ModaliteType,
                title: 'Soins Libres',
                desc: 'À la demande exclusive et volontaire du patient',
              },
              {
                id: 'Adressé par un tiers' as ModaliteType,
                title: 'Adressé par un tiers',
                desc: 'Orientation médecin traitant, famille, CSREF',
              },
              {
                id: 'Soins sans consentement' as ModaliteType,
                title: 'Soins sans consentement',
                desc: 'Demande d’un tiers ou représentant de l’État',
              },
            ].map((option) => (
              <label
                key={option.id}
                className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.modalite === option.id
                    ? 'border-[#10B9A9] bg-white ring-2 ring-[#10B9A9]/20 shadow-xs'
                    : 'border-[#CBD5E1] bg-white hover:border-[#10B9A9]/50'
                } ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="modalite"
                    disabled={isReadOnly}
                    checked={formData.modalite === option.id}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        modalite: option.id,
                        soinsSansConsentementType:
                          option.id === 'Soins sans consentement'
                            ? formData.soinsSansConsentementType
                            : undefined,
                        adresseParTiersPrecision:
                          option.id === 'Adressé par un tiers'
                            ? formData.adresseParTiersPrecision
                            : undefined,
                      })
                    }
                    className="text-[#10B9A9] focus:ring-[#10B9A9] w-4 h-4"
                  />
                  <span className="text-xs font-bold text-[#18243A]">{option.title}</span>
                </div>
                <span className="text-[11px] text-[#64748B] mt-1.5 pl-6 font-medium">
                  {option.desc}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Conditionnel : Adressé par un tiers */}
        {formData.modalite === 'Adressé par un tiers' && (
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#EDF2F7]">
              <UserCheck className="w-4 h-4 text-[#10B9A9]" />
              <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
                Précisions sur le tiers orienteur
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1">
                  Type de prescripteur / tiers
                </label>
                <select
                  disabled={isReadOnly}
                  value={formData.adresseParTiersType || 'Médecin traitant'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      adresseParTiersType: e.target.value as any,
                    })
                  }
                  className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none"
                >
                  <option value="Médecin traitant">Médecin traitant</option>
                  <option value="Centre de santé">Centre de santé / CSREF</option>
                  <option value="Famille">Famille / Entourage</option>
                  <option value="Autre">Autre intervenant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1">
                  Identité / Précisions sur le tiers <span className="text-[#F43F5E]">*</span>
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.adresseParTiersPrecision || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, adresseParTiersPrecision: e.target.value })
                  }
                  className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
                  placeholder="Ex: Dr. Traoré (CSREF Commune IV) ou Frère aîné"
                />
              </div>
            </div>
          </div>
        )}

        {/* Conditionnel : Soins sans consentement */}
        {formData.modalite === 'Soins sans consentement' && (
          <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#FECDD3]">
              <ShieldAlert className="w-4 h-4 text-[#BE123C]" />
              <h3 className="text-xs font-bold text-[#BE123C] uppercase tracking-wider">
                Régime Médico-Légal de Soins Sans Consentement (Vigilance)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1">
                  Sous-type légal <span className="text-[#F43F5E]">*</span>
                </label>
                <select
                  disabled={isReadOnly}
                  value={formData.soinsSansConsentementType || "À la demande d'un tiers"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      soinsSansConsentementType: e.target.value as SoinsSansConsentementType,
                    })
                  }
                  className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none"
                >
                  <option value="À la demande d'un tiers">À la demande d'un tiers (famille, tuteur)</option>
                  <option value="À la demande d'un représentant de l'État">
                    À la demande d'un représentant de l'État (péril imminent / ordre public)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1">
                  Identité du demandeur officiel
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.soinsSansConsentementDemandeur || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, soinsSansConsentementDemandeur: e.target.value })
                  }
                  className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
                  placeholder="Ex: Procureur, Préfet, Commissaire ou Tuteur légal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1">
                  Date de la décision ou du certificat médical initial
                </label>
                <input
                  type="date"
                  disabled={isReadOnly}
                  value={formData.dateDecisionOuCertificat || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, dateDecisionOuCertificat: e.target.value })
                  }
                  className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none tabular-nums"
                />
              </div>
            </div>
          </div>
        )}

        {/* Observations générales */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-2">
          <label className="block text-xs font-semibold text-[#18243A]">
            Observations sur les circonstances d'arrivée / accompagnement
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            value={formData.observationsModalite || ''}
            onChange={(e) => setFormData({ ...formData, observationsModalite: e.target.value })}
            className="w-full bg-white border border-[#CBD5E1] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
            placeholder="Ex: Arrivé calme / agité, accompagné par ses parents et son oncle..."
          />
        </div>

        {/* Footer Navigation */}
        <RubriqueFooterNav
          currentRubriqueId="s2"
          isReadOnly={isReadOnly}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};
