import React, { useState } from 'react';
import { DossierPsychiatrique, ReferenceLists } from '../types';
import { createEmptyDossier } from '../utils/emptyDossier';
import { activeValues } from '../utils/referentiels';
import {
  X,
  Plus,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  UserPlus,
  ArrowRight,
  Info,
  Calendar,
  Phone,
  Briefcase,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingDossiers: DossierPsychiatrique[];
  onCreateDossier: (newDossier: DossierPsychiatrique) => void;
  onSelectExistingDossier: (dossierId: string) => void;
  referenceLists: ReferenceLists;
  currentUserName: string;
  /** S3 is only filled at admission by roles allowed to write it (PRD B2). */
  canWriteMotif: boolean;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  existingDossiers,
  onCreateDossier,
  onSelectExistingDossier,
  referenceLists,
  currentUserName,
  canWriteMotif,
}) => {
  if (!isOpen) return null;

  // Provisional number; the server assigns the definitive unique one on save (BR-001)
  const currentYear = new Date().getFullYear();
  const autoNumeroOrdre = `PSY-${currentYear}-····`;

  const [nom, setNom] = useState('');
  const [prenoms, setPrenoms] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [sexe, setSexe] = useState<'Masculin' | 'Féminin'>('Masculin');
  const [dateNaissance, setDateNaissance] = useState('');
  const [profession, setProfession] = useState('');
  const [situationMatrimoniale, setSituationMatrimoniale] = useState('');
  const [religion, setReligion] = useState('');
  const [ethnie, setEthnie] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [modalite, setModalite] = useState<'Libre' | 'Adressé par un tiers' | 'Soins sans consentement'>('Libre');
  const [plainteInitiale, setPlainteInitiale] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Duplicate detection (BR-001 & B5)
  const potentialDuplicate = existingDossiers.find((d) => {
    if (!nom.trim() || !prenoms.trim()) return false;
    const sameNom = d.s1Identification.nom.toLowerCase() === nom.trim().toLowerCase();
    const samePrenoms = d.s1Identification.prenoms.toLowerCase() === prenoms.trim().toLowerCase();
    return sameNom && samePrenoms;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      setError('Le nom de famille est obligatoire.');
      return;
    }
    if (!prenoms.trim()) {
      setError('Les prénoms sont obligatoires.');
      return;
    }
    if (!age || age <= 0) {
      setError('L’âge du patient est obligatoire et doit être supérieur à 0.');
      return;
    }

    const now = new Date().toISOString();

    const blank = createEmptyDossier({
      id: 'dossier-' + crypto.randomUUID(),
      numeroOrdre: autoNumeroOrdre,
      now,
      sexe,
      psychiatreReferent: currentUserName,
      intervenant: currentUserName,
    });
    const motif = canWriteMotif ? plainteInitiale.trim() : '';
    const newDossier: DossierPsychiatrique = {
      ...blank,
      statut: motif ? 'EN_COURS' : 'BROUILLON',
      s1Identification: {
        ...blank.s1Identification,
        nom: nom.trim().toUpperCase(),
        prenoms: prenoms.trim(),
        age: Number(age),
        dateNaissance: dateNaissance || undefined,
        profession,
        situationMatrimoniale,
        religion,
        ethnie,
        adresse,
        telephone: telephone || undefined,
      },
      s2Modalites: {
        modalite,
        soinsSansConsentementType: modalite === 'Soins sans consentement' ? "À la demande d'un tiers" : undefined,
      },
      s3Motif: { ...blank.s3Motif, plaintePrincipale: motif },
    };

    onCreateDossier(newDossier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-950/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="clinical-card w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 !rounded-2xl !border-ink-150 shadow-[var(--shadow-float)]">
        {/* Header */}
        <div className="bg-white border-b border-ink-150 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-tile tile-primary !w-9 !h-9">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink-900">
                Admission & Création de Patient
              </h2>
              <p className="text-sm text-ink-500">
                Génération immédiate du N° d'ordre et ouverture du dossier médical (S1 / S2)
              </p>
            </div>
          </div>
          <button
            aria-label="Fermer"
            type="button"
            onClick={onClose}
            className="btn-icon"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate warning (B5) */}
        {potentialDuplicate && (
          <div className="mx-6 sm:mx-7 mt-5 p-4 bg-amber-100 border border-amber-500/40 rounded-xl flex items-start gap-3.5 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1.5 flex-1">
              <span className="font-bold text-amber-700 block text-sm">
                Doublon potentiel détecté dans le registre
              </span>
              <p className="text-amber-800 leading-relaxed">
                Un patient nommé <strong className="underline">{potentialDuplicate.s1Identification.nom} {potentialDuplicate.s1Identification.prenoms}</strong> ({potentialDuplicate.s1Identification.age} ans) existe déjà sous le numéro <strong className="font-mono">{potentialDuplicate.s1Identification.numeroOrdre}</strong>.
              </p>
              <div className="pt-1.5 flex flex-wrap gap-2.5 items-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectExistingDossier(potentialDuplicate.id);
                  }}
                  className="btn-secondary btn-sm"
                >
                  <span>Ouvrir le dossier existant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-amber-800 font-medium">
                  ou poursuivre la création d'un nouveau dossier distinct ci-dessous.
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-6 sm:mx-7 mt-5 p-3.5 bg-rose-100 border border-rose-500/30 rounded-lg text-xs text-rose-700 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 max-h-[calc(88vh-130px)] overflow-y-auto">
          {/* Subcard 1: Identité fondamentale */}
          <div className="clinical-subcard p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100">
              <span className="text-sm font-bold text-ink-900">
                1. Identification & N° d'Ordre Médical
              </span>
              <span className="text-xs font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-500/20">
                Attribué à l’enregistrement
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="field-label">
                  N° Ordre Patient
                </label>
                <input
                  type="text"
                  readOnly
                  value={autoNumeroOrdre}
                  className="clinical-input font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="field-label">
                  Nom de famille <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: TRAORÉ"
                  className="clinical-input uppercase"
                />
              </div>

              <div>
                <label className="field-label">
                  Prénoms <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={prenoms}
                  onChange={(e) => setPrenoms(e.target.value)}
                  placeholder="Ex: Fousseyni"
                  className="clinical-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="field-label">
                  Âge (années) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="125"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="Ex: 28"
                  className="clinical-input tabular-nums"
                />
              </div>

              <div>
                <label className="field-label">
                  Sexe biologique <span className="text-rose-500">*</span>
                </label>
                <select
                  value={sexe}
                  onChange={(e) => setSexe(e.target.value as 'Masculin' | 'Féminin')}
                  className="clinical-input"
                >
                  <option value="Masculin">Masculin</option>
                  <option value="Féminin">Féminin</option>
                </select>
              </div>

              <div>
                <label className="field-label">
                  Date de naissance (si connue)
                </label>
                <input
                  type="date"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                  className="clinical-input font-medium"
                />
              </div>
            </div>
          </div>

          {/* Subcard 2: Modalités de consultation (S2) */}
          <div className="clinical-subcard p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100">
              <span className="text-sm font-bold text-ink-900">
                2. Modalité de Consultation Initiale <span className="text-rose-500">*</span>
              </span>
              <span className="text-xs font-bold text-ink-500">Règle BR-004</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(
                [
                  { id: 'Libre', label: 'Consultation Libre', desc: 'Démarche spontanée du patient' },
                  { id: 'Adressé par un tiers', label: 'Adressé par un tiers', desc: 'Famille, médecin, structure' },
                  { id: 'Soins sans consentement', label: 'Soins sans consentement', desc: 'Péril imminent ou tiers' },
                ] as const
              ).map((m) => {
                const isSelected = modalite === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModalite(m.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50/60 shadow-xs ring-1 ring-primary-500'
                        : 'border-ink-150 bg-white hover:border-ink-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-primary-700' : 'text-ink-900'}`}>
                          {m.label}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-600" />}
                      </div>
                      <p className="text-xs text-ink-500 mt-1 leading-snug">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcard 3: Motif & plainte d'admission */}
          {canWriteMotif && (
          <div className="clinical-subcard p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-ink-100">
              <span className="text-sm font-bold text-ink-900">
                3. Motif d’Admission & Plainte Principale (S3)
              </span>
              <span className="text-xs text-primary-700 font-bold">Initialise statut EN COURS si saisi</span>
            </div>
            <textarea
              rows={2}
              value={plainteInitiale}
              onChange={(e) => setPlainteInitiale(e.target.value)}
              placeholder="Formulation littérale de la plainte principale recueillie lors de l'accueil..."
              className="clinical-input leading-relaxed"
            />
          </div>
          )}

          {/* Subcard 4: Coordonnées & Données Sociales */}
          <div className="clinical-subcard p-4 sm:p-5 space-y-3">
            <span className="text-sm font-bold text-ink-900 block pb-1 border-b border-ink-100">
              4. Données Complémentaires (Optionnelles à l'ouverture)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="field-label">Profession</label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Ex: Commerçant"
                  className="clinical-input"
                />
              </div>

              <div>
                <label className="field-label">Ethnie</label>
                <select
                  value={ethnie}
                  onChange={(e) => setEthnie(e.target.value)}
                  className="clinical-input"
                >
                  <option value="">Sélectionner...</option>
                  {activeValues(referenceLists, 'ethnies').map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Téléphone</label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+223 ..."
                  className="clinical-input font-mono"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-ink-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Créer & Ouvrir le Dossier Médical</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
