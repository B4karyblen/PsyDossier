import React, { useState } from 'react';
import { S1IdentificationData, ReferenceLists } from '../../types';
import { AlertCircle, User, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S1IdentificationData;
  isReadOnly: boolean;
  onSave: (data: S1IdentificationData) => void;
  onNext: () => void;
  onPrev?: () => void;
  referenceLists: ReferenceLists;
}

export const S1Identification: React.FC<Props> = ({
  data,
  isReadOnly,
  onSave,
  onNext,
  onPrev,
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
    <div className="clinical-card p-6 sm:p-7 space-y-6">
      {/* Rubrique Header */}
      <div className="flex items-center justify-between pb-4 border-b border-ink-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip bg-brand-100 text-brand-800 tabular-nums">
              S1 · ADMINISTRATIF
            </span>
            <span className="text-xs text-ink-500">Obligatoire pour validation</span>
          </div>
          <h2 className="text-xl font-extrabold text-ink-900 tracking-tight mt-2">
            Identification du Patient
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            Renseignements d’état civil, socio-démographiques et coordonnées de contact
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-100 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subcard 1: Identifiant & État Civil */}
        <div className="bg-ink-25 border border-ink-150 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <User className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-ink-900">
              État Civil & Identifiant Légal
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-900 mb-1">
                Numéro d'Ordre Patient
              </label>
              <input
                type="text"
                readOnly
                value={formData.numeroOrdre}
                className="w-full bg-ink-100 border border-ink-200 text-ink-900 font-mono text-xs font-bold rounded-lg px-3 py-2 cursor-not-allowed"
              />
              <span className="text-[11px] text-ink-500 mt-1 block">Identifiant unique immuable</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-900 mb-1">
                Sexe <span className="text-rose-500">*</span>
              </label>
              <select
                disabled={isReadOnly}
                value={formData.sexe}
                onChange={(e) =>
                  setFormData({ ...formData, sexe: e.target.value as 'Masculin' | 'Féminin' })
                }
                className="w-full bg-white border border-ink-200 focus:border-brand-500 text-ink-900 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="Masculin">Masculin</option>
                <option value="Féminin">Féminin</option>
              </select>
              <span className="text-[10px] text-brand-700 mt-1 block font-medium">
                Conditionne les rubriques S6 (Gynéco) et S7 (Puberté)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-900 mb-1">
                Âge en années <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="125"
                disabled={isReadOnly}
                value={formData.age || ''}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="w-full bg-white border border-ink-200 focus:border-brand-500 text-ink-900 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none tabular-nums"
                placeholder="Ex: 28"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-900 mb-1">
                Nom de famille <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value.toUpperCase() })}
                className="w-full bg-white border border-ink-200 focus:border-brand-500 text-ink-900 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none uppercase"
                placeholder="Ex: DIARRA"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-900 mb-1">
                Prénoms du patient <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.prenoms}
                onChange={(e) => setFormData({ ...formData, prenoms: e.target.value })}
                className="w-full bg-white border border-ink-200 focus:border-brand-500 text-ink-900 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Ex: Cheick Modibo"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-900 mb-1">
              Date de naissance (optionnelle si âge précisé)
            </label>
            <input
              type="date"
              disabled={isReadOnly}
              value={formData.dateNaissance || ''}
              onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
              className="w-full bg-white border border-ink-200 focus:border-brand-500 text-ink-900 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none tabular-nums"
            />
          </div>
        </div>

        {/* Subcard 2: Profil Socio-Démographique & Matrimonial */}
        <div className="bg-ink-25 border border-ink-150 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-ink-900">
              Profil Socio-Démographique & Culturel
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-900 mb-1">
                Profession / Activité
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                className="w-full bg-white border border-ink-200 focus:border-brand-500 text-ink-900 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Ex: Enseignant, Commerçant, Étudiant..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-900 mb-1">
                Situation matrimoniale
              </label>
              <select
                disabled={isReadOnly}
                value={formData.situationMatrimoniale}
                onChange={(e) => setFormData({ ...formData, situationMatrimoniale: e.target.value })}
                className="w-full bg-white border border-ink-200 focus:border-brand-500 text-ink-900 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="">Sélectionner la situation</option>
                {referenceLists.situationsMatrimoniales.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-900 mb-1">
                Religion / Confession
              </label>
              <select
                disabled={isReadOnly}
                value={formData.religion}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                className="w-full bg-white border border-ink-200 focus:border-brand-500 text-ink-900 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="">Sélectionner</option>
                {referenceLists.religions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-900 mb-1">
                Ethnie / Groupe culturel
              </label>
              <select
                disabled={isReadOnly}
                value={formData.ethnie}
                onChange={(e) => setFormData({ ...formData, ethnie: e.target.value })}
                className="w-full bg-white border border-ink-200 focus:border-brand-500 text-ink-900 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="">Sélectionner</option>
                {referenceLists.ethnies.map((eth) => (
                  <option key={eth} value={eth}>
                    {eth}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Subcard 3: Coordonnées & Personne à contacter */}
        <div className="bg-ink-25 border border-ink-150 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
            <Phone className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-ink-900">
              Coordonnées de Contact & Urgence
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-900 mb-1">
                Téléphone du patient
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.telephone || ''}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full bg-white border border-ink-200 focus:border-brand-500 text-ink-900 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
                placeholder="+223 70 00 00 00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-ink-900 mb-1">
                Personne à contacter en cas d'urgence (Nom, Lien, Tél)
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.personneContact || ''}
                onChange={(e) => setFormData({ ...formData, personneContact: e.target.value })}
                className="w-full bg-white border border-ink-200 focus:border-brand-500 text-ink-900 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Ex: Moussa Diarra (Oncle paternel) - +223 66 22 33 44"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-900 mb-1">
              Adresse de résidence habituelle
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full bg-white border border-ink-200 focus:border-brand-500 text-ink-900 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none"
              placeholder="Ville, Commune, Quartier, Rue / Porte"
            />
          </div>
        </div>

        {/* Reusable Clinical Footer Navigation */}
        <RubriqueFooterNav
          currentRubriqueId="s1"
          isReadOnly={isReadOnly}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};
