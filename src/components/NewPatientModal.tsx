import React, { useState } from 'react';
import { DossierPsychiatrique, ReferenceLists } from '../types';
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
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  existingDossiers,
  onCreateDossier,
  onSelectExistingDossier,
  referenceLists,
  currentUserName,
}) => {
  if (!isOpen) return null;

  // Generate unique order number
  const currentYear = new Date().getFullYear();
  const nextNum = existingDossiers.length + 1;
  const autoNumeroOrdre = `PSY-${currentYear}-${String(nextNum).padStart(4, '0')}`;

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

    const newDossier: DossierPsychiatrique = {
      id: 'dossier-' + Date.now(),
      statut: plainteInitiale.trim() ? 'EN_COURS' : 'BROUILLON',
      dateCreation: now,
      dateDerniereModification: now,
      psychiatreReferent: currentUserName,
      serviceHospitalier: 'Service de Psychiatrie Universitaire',
      addenda: [],
      s1Identification: {
        numeroOrdre: autoNumeroOrdre,
        nom: nom.trim().toUpperCase(),
        prenoms: prenoms.trim(),
        age: Number(age),
        dateNaissance: dateNaissance || undefined,
        sexe,
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
      s3Motif: {
        plaintePrincipale: plainteInitiale.trim(),
        sourcePlainte: 'Patient et entourage',
      },
      s4HistoireMaladie: {
        modeInstallation: '',
        facteursDeclenchants: [],
      },
      s5Representation: {
        categories: [],
      },
      s6Antecedents: {
        personnels: {
          medicaux: { aucun: false, details: '' },
          chirurgicaux: { aucun: false, details: '' },
          gynecoObstetricaux: sexe === 'Féminin' ? { aucun: false, details: '' } : undefined,
          psychiatriques: { aucun: false, details: '' },
          addictifs: { aucun: false, details: '' },
          judiciaires: { aucun: false, details: '' },
        },
        familiaux: {
          medicaux: { aucun: false, details: '' },
          chirurgicaux: { aucun: false, details: '' },
          psychiatriques: { aucun: false, details: '' },
          addictifs: { aucun: false, details: '' },
        },
      },
      s7Biographie: {
        ascendants: {
          pere: { nom: '', vivant: true },
          mere: { nom: '', vivant: true },
        },
        collateraux: {
          fratrie: [],
        },
        conceptionGrossesseAccouchement: '',
        developpementPsychomoteur: {},
        scolarite: {},
        developpementProfessionnel: '',
        developpementSexuelEtSentimentale: {
          conjoints: [],
          enfants: [],
        },
        evenementsMarquants: { positifs: [], negatifs: [] },
      },
      s8EnqueteSociale: {
        autodescription: '',
        heterodescription: '',
        relationsSociales: '',
        loisirs: '',
        conduitesAddictives: '',
      },
      s9Demande: {
        demandeConsciente: '',
        demandeInconsciente: '',
      },
      s10ExamenClinique: {
        somatique: {
          nonRealise: false,
          constantes: {},
          appareils: {},
        },
        psychiatrique: {},
      },
      s11ResumeSyndromique: {
        syndromesIdentifies: [],
        resume: '',
      },
      s12HypothesesDiag: {
        hypotheses: [],
      },
      s13Bilans: {
        bilans: [],
      },
      s14PriseEnCharge: {
        orientation: '',
        traitementMedicamenteux: [],
        psychotherapie: {},
      },
      s15Evolution: {
        entrees: [
          {
            id: 'init-evo-' + Date.now(),
            dateHeure: now,
            auteurNom: currentUserName,
            auteurRole: 'SECRETARIAT',
            note: 'Création du dossier médical et initialisation de l’identité.',
          },
        ],
      },
      s16ProjetTherapeutique: {
        versionCourante: 1,
        objectifsCourtTerme: '',
        objectifsMoyenTerme: '',
        moyensEtStrategies: '',
        echeancesEtRevisions: '',
        intervenants: [currentUserName],
        historiqueVersions: [],
      },
      s17Pronostic: {
        courtTerme: { appreciation: '', details: '' },
        moyenTerme: { appreciation: '', details: '' },
        longTerme: { appreciation: '', details: '' },
      },
    };

    onCreateDossier(newDossier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="clinical-card w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 !rounded-3xl !border-ink-150 shadow-[var(--shadow-float)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-ink-25 via-white to-brand-50 border-b border-ink-150 px-6 sm:px-7 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-500/20 shadow-xs">
              <UserPlus className="w-5 h-5 text-brand-700" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-ink-900 tracking-tight">
                Admission & Création de Patient
              </h2>
              <p className="text-xs text-ink-500 font-medium">
                Génération immédiate du N° d'ordre et ouverture du dossier médical (S1 / S2)
              </p>
            </div>
          </div>
          <button
            aria-label="Fermer"
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-900 p-2 rounded-xl hover:bg-ink-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate warning (B5) */}
        {potentialDuplicate && (
          <div className="mx-6 sm:mx-7 mt-5 p-4 bg-amber-100 border border-amber-500/40 rounded-2xl flex items-start gap-3.5 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1.5 flex-1">
              <span className="font-extrabold text-amber-700 block text-sm">
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
                  className="px-3 py-1.5 bg-white text-amber-700 border border-amber-500 font-extrabold rounded-lg text-xs hover:bg-amber-100 shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Ouvrir le dossier existant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] text-amber-800 font-medium">
                  ou poursuivre la création d'un nouveau dossier distinct ci-dessous.
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-6 sm:mx-7 mt-5 p-3.5 bg-rose-100 border border-rose-500/30 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
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
              <span className="text-[10px] font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-500/20">
                BR-001 Attribué
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-ink-900 mb-1">
                  N° Ordre Patient
                </label>
                <input
                  type="text"
                  readOnly
                  value={autoNumeroOrdre}
                  className="clinical-input bg-ink-100 font-mono text-xs font-bold cursor-not-allowed text-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-900 mb-1">
                  Nom de famille <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: TRAORÉ"
                  className="clinical-input text-xs font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-900 mb-1">
                  Prénoms <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={prenoms}
                  onChange={(e) => setPrenoms(e.target.value)}
                  placeholder="Ex: Fousseyni"
                  className="clinical-input text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-ink-900 mb-1">
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
                  className="clinical-input text-xs font-semibold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-900 mb-1">
                  Sexe biologique <span className="text-rose-500">*</span>
                </label>
                <select
                  value={sexe}
                  onChange={(e) => setSexe(e.target.value as 'Masculin' | 'Féminin')}
                  className="clinical-input text-xs font-semibold"
                >
                  <option value="Masculin">Masculin</option>
                  <option value="Féminin">Féminin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-900 mb-1">
                  Date de naissance (si connue)
                </label>
                <input
                  type="date"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                  className="clinical-input text-xs font-medium"
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
              <span className="text-[10px] font-bold text-ink-500">Règle BR-004</span>
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
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/60 shadow-xs ring-1 ring-brand-500'
                        : 'border-ink-150 bg-white hover:border-ink-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-extrabold ${isSelected ? 'text-brand-700' : 'text-ink-900'}`}>
                          {m.label}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </div>
                      <p className="text-[11px] text-ink-500 mt-1 leading-snug">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcard 3: Motif & plainte d'admission */}
          <div className="clinical-subcard p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-ink-100">
              <span className="text-sm font-bold text-ink-900">
                3. Motif d’Admission & Plainte Principale (S3)
              </span>
              <span className="text-[10px] text-brand-700 font-bold">Initialise statut EN COURS si saisi</span>
            </div>
            <textarea
              rows={2}
              value={plainteInitiale}
              onChange={(e) => setPlainteInitiale(e.target.value)}
              placeholder="Formulation littérale de la plainte principale recueillie lors de l'accueil..."
              className="clinical-input text-xs leading-relaxed"
            />
          </div>

          {/* Subcard 4: Coordonnées & Données Sociales */}
          <div className="clinical-subcard p-4 sm:p-5 space-y-3">
            <span className="text-sm font-bold text-ink-900 block pb-1 border-b border-ink-100">
              4. Données Complémentaires (Optionnelles à l'ouverture)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink-900 mb-1">Profession</label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Ex: Commerçant"
                  className="clinical-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-900 mb-1">Ethnie</label>
                <select
                  value={ethnie}
                  onChange={(e) => setEthnie(e.target.value)}
                  className="clinical-input text-xs"
                >
                  <option value="">Sélectionner...</option>
                  {referenceLists.ethnies.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-900 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+223 ..."
                  className="clinical-input text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-ink-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-ink-500 hover:text-ink-900 bg-ink-100 hover:bg-ink-150 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="clinical-btn-primary px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer shadow-sm shadow-brand-500/20"
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
