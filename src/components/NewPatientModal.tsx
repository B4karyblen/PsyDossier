import React, { useState } from 'react';
import { DossierPsychiatrique, ReferenceLists } from '../types';
import { X, Plus, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';

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
  const potentialDuplicate = existingDossiers.find(d => {
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
      s8EnqueteSociale: {},
      s9Demande: {},
      s10ExamenClinique: {
        somatique: {
          nonRealise: false,
          constantes: {},
          appareils: {},
        },
        psychiatrique: {},
      },
      s11ResumeSyndromique: {
        resume: '',
        syndromesIdentifies: [],
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
    <div className="fixed inset-0 z-50 bg-[#111827]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#D9E2E8] shadow-xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#F8FAFC] border-b border-[#D9E2E8] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#18243A]">
              Création d’un Nouveau Patient
            </h2>
            <p className="text-xs text-[#64748B]">
              Attribution du N° d'ordre et ouverture du dossier médical (S1 / S2)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#18243A] p-1.5 rounded-lg hover:bg-[#F1F5F7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate warning (B5) */}
        {potentialDuplicate && (
          <div className="mx-6 mt-4 p-3 bg-[#FEF3C7] border border-[#F59E0B]/40 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-[#B45309] block">
                Doublon potentiel détecté dans le registre
              </span>
              <p className="text-[#92400E]">
                Un patient nommé <strong>{potentialDuplicate.s1Identification.nom} {potentialDuplicate.s1Identification.prenoms}</strong> ({potentialDuplicate.s1Identification.age} ans) existe déjà sous le numéro <strong>{potentialDuplicate.s1Identification.numeroOrdre}</strong>.
              </p>
              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectExistingDossier(potentialDuplicate.id);
                  }}
                  className="px-2.5 py-1 bg-white text-[#B45309] border border-[#F59E0B] font-bold rounded text-[11px] hover:bg-[#FEF3C7]"
                >
                  Ouvrir le dossier existant
                </button>
                <span className="text-[11px] text-[#92400E] self-center">
                  ou poursuivre la création ci-dessous.
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 bg-[#FFE4E6] border border-[#F43F5E]/30 rounded-lg text-xs text-[#BE123C]">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Row 1: Numéro d'ordre (auto-généré) & Sexe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Numéro d'ordre
              </label>
              <input
                type="text"
                readOnly
                value={autoNumeroOrdre}
                className="w-full bg-[#F1F5F7] border border-[#D9E2E8] font-mono text-xs font-bold rounded-lg px-3 py-2 cursor-not-allowed text-[#18243A]"
              />
              <span className="text-[10px] text-[#07988D] font-medium">Généré automatiquement (BR-001)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Sexe <span className="text-[#F43F5E]">*</span>
              </label>
              <select
                value={sexe}
                onChange={(e) => setSexe(e.target.value as 'Masculin' | 'Féminin')}
                className="w-full bg-[#F8FAFC] border border-[#D9E2E8] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-[#10B9A9]"
              >
                <option value="Masculin">Masculin</option>
                <option value="Féminin">Féminin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Âge (années) <span className="text-[#F43F5E]">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="125"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="Ex: 28"
                className="w-full bg-[#F8FAFC] border border-[#D9E2E8] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-[#10B9A9] tabular-nums"
              />
            </div>
          </div>

          {/* Row 2: Nom & Prénoms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Nom de famille <span className="text-[#F43F5E]">*</span>
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: TRAORÉ"
                className="w-full bg-[#F8FAFC] border border-[#D9E2E8] text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-[#10B9A9] uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Prénoms <span className="text-[#F43F5E]">*</span>
              </label>
              <input
                type="text"
                value={prenoms}
                onChange={(e) => setPrenoms(e.target.value)}
                placeholder="Ex: Fousseyni"
                className="w-full bg-[#F8FAFC] border border-[#D9E2E8] text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-[#10B9A9]"
              />
            </div>
          </div>

          {/* Row 3: Modalité de consultation (S2 initial) */}
          <div className="p-3.5 bg-[#F1F5F7] rounded-xl border border-[#D9E2E8] space-y-2">
            <label className="block text-xs font-bold text-[#18243A]">
              Modalité de consultation initiale <span className="text-[#F43F5E]">*</span> (BR-004)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {(['Libre', 'Adressé par un tiers', 'Soins sans consentement'] as const).map((m) => (
                <label
                  key={m}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer ${
                    modalite === m
                      ? 'border-[#10B9A9] bg-white text-[#07988D] font-bold shadow-xs'
                      : 'border-[#D9E2E8] bg-white text-[#18243A]'
                  }`}
                >
                  <input
                    type="radio"
                    name="newPatientModalite"
                    checked={modalite === m}
                    onChange={() => setModalite(m)}
                    className="text-[#10B9A9]"
                  />
                  <span>{m}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Row 4: Plainte principale / Motif d'arrivée */}
          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Motif d’admission ou plainte initiale
            </label>
            <textarea
              rows={2}
              value={plainteInitiale}
              onChange={(e) => setPlainteInitiale(e.target.value)}
              placeholder="Plainte initiale formulée à l'accueil ou au secrétariat..."
              className="w-full bg-[#F8FAFC] border border-[#D9E2E8] text-xs rounded-lg p-2.5 focus:outline-none focus:border-[#10B9A9]"
            />
          </div>

          {/* Row 5: Ethnie, Religion, Profession, Adresse */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">Profession</label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Ex: Agriculteur"
                className="w-full bg-[#F8FAFC] border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">Ethnie</label>
              <select
                value={ethnie}
                onChange={(e) => setEthnie(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#D9E2E8] text-xs rounded-lg px-2.5 py-1.5"
              >
                <option value="">Sélectionner...</option>
                {referenceLists.ethnies.map(eth => <option key={eth} value={eth}>{eth}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">Téléphone</label>
              <input
                type="text"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="+223 ..."
                className="w-full bg-[#F8FAFC] border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E8EEF2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#18243A] bg-[#F1F5F7] hover:bg-[#D9E2E8] rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#10B9A9] hover:bg-[#07988D] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Créer et ouvrir le dossier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
