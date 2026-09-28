import React, { useState } from 'react';
import { S1IdentificationData, ReferenceLists } from '../../types';
import { Save, ChevronRight, AlertCircle } from 'lucide-react';

interface Props {
  data: S1IdentificationData;
  isReadOnly: boolean;
  onSave: (data: S1IdentificationData) => void;
  onNext: () => void;
  referenceLists: ReferenceLists;
}

export const S1Identification: React.FC<Props> = ({
  data,
  isReadOnly,
  onSave,
  onNext,
  referenceLists,
}) => {
  const [formData, setFormData] = useState<S1IdentificationData>(data);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim()) {
      setError('Le nom de famille est obligatoire.');
      return;
    }
    if (!formData.prenoms.trim()) {
      setError('Les prénoms sont obligatoires.');
      return;
    }
    if (!formData.age || formData.age <= 0) {
      setError('L’âge du patient doit être supérieur à 0.');
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
            S1 · ADMINISTRATIF
          </span>
          <h2 className="text-base font-bold text-[#18243A] mt-1">
            Identification du patient
          </h2>
          <p className="text-xs text-[#64748B]">
            Renseignements d’état civil et socio-démographiques
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
          Identité du patient enregistrée avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Numéro d'ordre (auto, lecture seule) & Sexe */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Numéro d'ordre (généré)
            </label>
            <input
              type="text"
              readOnly
              value={formData.numeroOrdre}
              className="w-full bg-[#F1F5F7] border border-[#D9E2E8] text-[#18243A] font-mono text-xs font-bold rounded-lg px-3 py-2 cursor-not-allowed"
            />
            <span className="text-[11px] text-[#94A3B8] mt-0.5 block">Identifiant unique immuable</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Sexe <span className="text-[#F43F5E]">*</span>
            </label>
            <select
              disabled={isReadOnly}
              value={formData.sexe}
              onChange={(e) => setFormData({ ...formData, sexe: e.target.value as 'Masculin' | 'Féminin' })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="Masculin">Masculin</option>
              <option value="Féminin">Féminin</option>
            </select>
            <span className="text-[11px] text-[#07988D] mt-0.5 block">
              Conditionne les rubriques S6 (Gynéco) et S7 (Ménarche/Spermarche)
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Âge (années) <span className="text-[#F43F5E]">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="125"
              disabled={isReadOnly}
              value={formData.age || ''}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none tabular-nums"
              placeholder="Ex: 28"
            />
          </div>
        </div>

        {/* Row 2: Nom et Prénoms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Nom de famille <span className="text-[#F43F5E]">*</span>
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value.toUpperCase() })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none uppercase"
              placeholder="Ex: DIARRA"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Prénoms <span className="text-[#F43F5E]">*</span>
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.prenoms}
              onChange={(e) => setFormData({ ...formData, prenoms: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
              placeholder="Ex: Ibrahim Boubacar"
            />
          </div>
        </div>

        {/* Row 3: Date de naissance, Situation matrimoniale, Profession */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Date de naissance
            </label>
            <input
              type="date"
              disabled={isReadOnly}
              value={formData.dateNaissance || ''}
              onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Situation matrimoniale
            </label>
            <select
              disabled={isReadOnly}
              value={formData.situationMatrimoniale}
              onChange={(e) => setFormData({ ...formData, situationMatrimoniale: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="">Sélectionner...</option>
              {referenceLists.situationsMatrimoniales.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Profession / Activité
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
              placeholder="Ex: Technicien télécoms"
            />
          </div>
        </div>

        {/* Row 4: Religion et Ethnie (données socio-culturelles) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Religion
            </label>
            <select
              disabled={isReadOnly}
              value={formData.religion}
              onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="">Sélectionner...</option>
              {referenceLists.religions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Ethnie
            </label>
            <select
              disabled={isReadOnly}
              value={formData.ethnie}
              onChange={(e) => setFormData({ ...formData, ethnie: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="">Sélectionner...</option>
              {referenceLists.ethnies.map((eth) => (
                <option key={eth} value={eth}>{eth}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 5: Coordonnées & Adresse */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Téléphone du patient
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.telephone || ''}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
              placeholder="+223 ..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Personne à contacter en cas d'urgence
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.personneContact || ''}
              onChange={(e) => setFormData({ ...formData, personneContact: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
              placeholder="Ex: Amadou Diarra (Frère aîné) - +223 66 11 88 44"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#18243A] mb-1">
            Adresse de résidence
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            value={formData.adresse}
            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
            placeholder="Ville, Commune, Quartier, Rue / Porte"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8EEF2]">
          <div className="text-[11px] text-[#64748B]">
            * Champs obligatoires pour la constitution du dossier
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Enregistrer S1
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="px-3.5 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors flex items-center gap-1.5"
            >
              Suivant (S2)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
