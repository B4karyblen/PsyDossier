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
    <div className="clinical-card p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-ink-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip bg-ink-100 text-ink-700 tabular-nums">
              S2 · ADMINISTRATIF
            </span>
            <span className="text-xs text-ink-500">Obligatoire pour validation</span>
          </div>
          <h2 className="text-h2 text-ink-900 mt-2">
            Modalités de Consultation
          </h2>
          <p className="text-sm text-ink-500 mt-0.5">
            Cadre médico-légal d'admission et de consentement aux soins (BR-004, BR-005, BR-006)
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-100 border border-rose-500/30 rounded-lg flex items-center gap-2.5 text-xs text-rose-700 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Option selector cards */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-3.5">
          <label className="block text-sm font-bold text-ink-900">
            Régime d’admission légal <span className="text-rose-500">*</span>
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
                className={`relative flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${
                  formData.modalite === option.id
                    ? 'border-primary-500 bg-white ring-2 ring-primary-500/20 shadow-xs'
                    : 'border-ink-200 bg-white hover:border-primary-500/50'
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
                    className="text-primary-600 focus:ring-primary-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-ink-900">{option.title}</span>
                </div>
                <span className="text-[11px] text-ink-500 mt-1.5 pl-6 font-medium">
                  {option.desc}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Conditionnel : Adressé par un tiers */}
        {formData.modalite === 'Adressé par un tiers' && (
          <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
              <UserCheck className="w-4 h-4 text-primary-600" />
              <h3 className="text-sm font-semibold text-ink-900">
                Précisions sur le tiers orienteur
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
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
                  className="w-full bg-white border border-ink-200 focus:border-primary-500 text-ink-900 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:shadow-[var(--shadow-focus)]"
                >
                  <option value="Médecin traitant">Médecin traitant</option>
                  <option value="Centre de santé">Centre de santé / CSREF</option>
                  <option value="Famille">Famille / Entourage</option>
                  <option value="Autre">Autre intervenant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  Identité / Précisions sur le tiers <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.adresseParTiersPrecision || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, adresseParTiersPrecision: e.target.value })
                  }
                  className="w-full bg-white border border-ink-200 focus:border-primary-500 text-ink-900 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:shadow-[var(--shadow-focus)]"
                  placeholder="Ex: Dr. Traoré (CSREF Commune IV) ou Frère aîné"
                />
              </div>
            </div>
          </div>
        )}

        {/* Conditionnel : Soins sans consentement */}
        {formData.modalite === 'Soins sans consentement' && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-rose-200">
              <ShieldAlert className="w-4 h-4 text-rose-700" />
              <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                Régime Médico-Légal de Soins Sans Consentement (Vigilance)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  Sous-type légal <span className="text-rose-500">*</span>
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
                  className="w-full bg-white border border-ink-200 focus:border-primary-500 text-ink-900 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:shadow-[var(--shadow-focus)]"
                >
                  <option value="À la demande d'un tiers">À la demande d'un tiers (famille, tuteur)</option>
                  <option value="À la demande d'un représentant de l'État">
                    À la demande d'un représentant de l'État (péril imminent / ordre public)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  Identité du demandeur officiel
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.soinsSansConsentementDemandeur || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, soinsSansConsentementDemandeur: e.target.value })
                  }
                  className="w-full bg-white border border-ink-200 focus:border-primary-500 text-ink-900 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:shadow-[var(--shadow-focus)]"
                  placeholder="Ex: Procureur, Préfet, Commissaire ou Tuteur légal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  Date de la décision ou du certificat médical initial
                </label>
                <input
                  type="date"
                  disabled={isReadOnly}
                  value={formData.dateDecisionOuCertificat || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, dateDecisionOuCertificat: e.target.value })
                  }
                  className="w-full bg-white border border-ink-200 focus:border-primary-500 text-ink-900 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:shadow-[var(--shadow-focus)] tabular-nums"
                />
              </div>
            </div>
          </div>
        )}

        {/* Observations générales */}
        <div className="bg-ink-25 border border-ink-150 rounded-xl p-5 space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Observations sur les circonstances d'arrivée / accompagnement
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            value={formData.observationsModalite || ''}
            onChange={(e) => setFormData({ ...formData, observationsModalite: e.target.value })}
            className="w-full bg-white border border-ink-200 focus:border-primary-500 text-ink-900 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:shadow-[var(--shadow-focus)]"
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
