import React, { useState } from 'react';
import { S7BiographieData, FratrieItem, ConjointItem, EnfantItem } from '../../types';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { RubriqueFooterNav } from './RubriqueFooterNav';

interface Props {
  data: S7BiographieData;
  patientSexe: 'Masculin' | 'Féminin';
  isReadOnly: boolean;
  onSave: (data: S7BiographieData) => void;
  onNext: () => void;
  onPrev?: () => void;
}

export const S7Biographie: React.FC<Props> = ({
  data,
  patientSexe,
  isReadOnly,
  onSave,
  onNext,
  onPrev,
}) => {

  const [formData, setFormData] = useState<S7BiographieData>(data);
  const [isSaved, setIsSaved] = useState(false);
  const [newPositif, setNewPositif] = useState('');
  const [newNegatif, setNewNegatif] = useState('');

  // Fratrie helpers
  const addFrereSoeur = () => {
    if (isReadOnly) return;
    const newItem: FratrieItem = {
      id: 'fr-' + Date.now(),
      nom: '',
      age: undefined,
      sexe: 'M',
      rang: (formData.collateraux.fratrie?.length || 0) + 1,
      profession: '',
      vivant: true,
    };
    setFormData((prev) => ({
      ...prev,
      collateraux: {
        ...prev.collateraux,
        fratrie: [...(prev.collateraux.fratrie || []), newItem],
      },
    }));
  };

  const removeFrereSoeur = (id: string) => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      collateraux: {
        ...prev.collateraux,
        fratrie: prev.collateraux.fratrie.filter((f) => f.id !== id),
      },
    }));
  };

  const updateFrereSoeur = (id: string, updates: Partial<FratrieItem>) => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      collateraux: {
        ...prev.collateraux,
        fratrie: prev.collateraux.fratrie.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      },
    }));
  };

  // Conjoint helpers
  const addConjoint = () => {
    if (isReadOnly) return;
    const newItem: ConjointItem = {
      id: 'conj-' + Date.now(),
      nom: '',
      statut: 'Actuel',
      dureeUnion: '',
    };
    setFormData((prev) => ({
      ...prev,
      developpementSexuelEtSentimentale: {
        ...prev.developpementSexuelEtSentimentale,
        conjoints: [...(prev.developpementSexuelEtSentimentale.conjoints || []), newItem],
      },
    }));
  };

  const removeConjoint = (id: string) => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      developpementSexuelEtSentimentale: {
        ...prev.developpementSexuelEtSentimentale,
        conjoints: prev.developpementSexuelEtSentimentale.conjoints.filter((c) => c.id !== id),
      },
    }));
  };

  // Enfant helpers
  const addEnfant = () => {
    if (isReadOnly) return;
    const newItem: EnfantItem = {
      id: 'enf-' + Date.now(),
      nom: '',
      age: undefined,
      sexe: 'M',
    };
    setFormData((prev) => ({
      ...prev,
      developpementSexuelEtSentimentale: {
        ...prev.developpementSexuelEtSentimentale,
        enfants: [...(prev.developpementSexuelEtSentimentale.enfants || []), newItem],
      },
    }));
  };

  const removeEnfant = (id: string) => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      developpementSexuelEtSentimentale: {
        ...prev.developpementSexuelEtSentimentale,
        enfants: prev.developpementSexuelEtSentimentale.enfants.filter((e) => e.id !== id),
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const declaredBroCount = formData.collateraux.nombreFreresSoeursDeclares || 0;
  const listBroCount = formData.collateraux.fratrie?.length || 0;
  const hasFratrieMismatch = declaredBroCount > 0 && listBroCount > 0 && declaredBroCount !== listBroCount;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F7]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#07988D] bg-[#ECFBF9] px-2.5 py-0.5 rounded-md border border-[#10B9A9]/20">
              S7 · DÉVELOPPEMENT
            </span>
            <span className="text-xs text-[#64748B]">8 sections de vie</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#18243A] tracking-tight mt-1">
            Éléments de Biographie Clinique
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Histoire de vie, ascendants, collatéraux, scolarité, parcours affectif et événements marquants
          </p>
        </div>
      </div>


      {isSaved && (
        <div className="mb-4 p-2.5 bg-[#DCFCE7] border border-[#10B981]/30 rounded-lg text-xs text-[#15803D] font-medium">
          Biographie enregistrée avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Ascendants */}
        <div className="p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
            1. Ascendants
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Père */}
            <div className="p-3 bg-white border border-[#D9E2E8] rounded-lg space-y-2">
              <span className="text-xs font-bold text-[#18243A]">Père</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.ascendants.pere.nom}
                  onChange={(e) => setFormData({
                    ...formData,
                    ascendants: {
                      ...formData.ascendants,
                      pere: { ...formData.ascendants.pere, nom: e.target.value }
                    }
                  })}
                  className="bg-[#F8FAFC] border border-[#D9E2E8] text-xs rounded px-2.5 py-1.5"
                  placeholder="Nom & prénom du père"
                />
                <input
                  type="number"
                  disabled={isReadOnly}
                  value={formData.ascendants.pere.age || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    ascendants: {
                      ...formData.ascendants,
                      pere: { ...formData.ascendants.pere, age: parseInt(e.target.value) || undefined }
                    }
                  })}
                  className="bg-[#F8FAFC] border border-[#D9E2E8] text-xs rounded px-2.5 py-1.5"
                  placeholder="Âge"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.ascendants.pere.profession || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    ascendants: {
                      ...formData.ascendants,
                      pere: { ...formData.ascendants.pere, profession: e.target.value }
                    }
                  })}
                  className="bg-[#F8FAFC] border border-[#D9E2E8] text-xs rounded px-2.5 py-1.5"
                  placeholder="Profession"
                />
                <label className="flex items-center gap-2 text-xs text-[#18243A]">
                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    checked={formData.ascendants.pere.vivant}
                    onChange={(e) => setFormData({
                      ...formData,
                      ascendants: {
                        ...formData.ascendants,
                        pere: { ...formData.ascendants.pere, vivant: e.target.checked }
                      }
                    })}
                    className="rounded text-[#10B9A9]"
                  />
                  <span>Vivant</span>
                </label>
              </div>
            </div>

            {/* Mère */}
            <div className="p-3 bg-white border border-[#D9E2E8] rounded-lg space-y-2">
              <span className="text-xs font-bold text-[#18243A]">Mère</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.ascendants.mere.nom}
                  onChange={(e) => setFormData({
                    ...formData,
                    ascendants: {
                      ...formData.ascendants,
                      mere: { ...formData.ascendants.mere, nom: e.target.value }
                    }
                  })}
                  className="bg-[#F8FAFC] border border-[#D9E2E8] text-xs rounded px-2.5 py-1.5"
                  placeholder="Nom & prénom de la mère"
                />
                <input
                  type="number"
                  disabled={isReadOnly}
                  value={formData.ascendants.mere.age || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    ascendants: {
                      ...formData.ascendants,
                      mere: { ...formData.ascendants.mere, age: parseInt(e.target.value) || undefined }
                    }
                  })}
                  className="bg-[#F8FAFC] border border-[#D9E2E8] text-xs rounded px-2.5 py-1.5"
                  placeholder="Âge"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.ascendants.mere.profession || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    ascendants: {
                      ...formData.ascendants,
                      mere: { ...formData.ascendants.mere, profession: e.target.value }
                    }
                  })}
                  className="bg-[#F8FAFC] border border-[#D9E2E8] text-xs rounded px-2.5 py-1.5"
                  placeholder="Profession"
                />
                <label className="flex items-center gap-2 text-xs text-[#18243A]">
                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    checked={formData.ascendants.mere.vivant}
                    onChange={(e) => setFormData({
                      ...formData,
                      ascendants: {
                        ...formData.ascendants,
                        mere: { ...formData.ascendants.mere, vivant: e.target.checked }
                      }
                    })}
                    className="rounded text-[#10B9A9]"
                  />
                  <span>Vivante</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Collatéraux & Fratrie utérine */}
        <div className="p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              2. Collatéraux & Fratrie utérine
            </h3>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addFrereSoeur}
                className="text-[11px] font-semibold text-[#07988D] bg-[#ECFBF9] hover:bg-[#D9F7F3] px-2.5 py-1 rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Ajouter un frère/sœur
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Place du patient dans la fratrie utérine (rang)
              </label>
              <input
                type="number"
                min="1"
                disabled={isReadOnly}
                value={formData.collateraux.placeFratrieUterine || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  collateraux: {
                    ...formData.collateraux,
                    placeFratrieUterine: parseInt(e.target.value) || undefined
                  }
                })}
                className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                placeholder="Ex: 2 (cadet, aîné...)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Nombre total de frères et sœurs déclarés
              </label>
              <input
                type="number"
                min="0"
                disabled={isReadOnly}
                value={formData.collateraux.nombreFreresSoeursDeclares || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  collateraux: {
                    ...formData.collateraux,
                    nombreFreresSoeursDeclares: parseInt(e.target.value) || undefined
                  }
                })}
                className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                placeholder="Ex: 4"
              />
            </div>
          </div>

          {hasFratrieMismatch && (
            <div className="p-2 bg-[#FEF3C7] border border-[#F59E0B]/30 rounded text-[11px] text-[#B45309] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Attention : {declaredBroCount} frères et sœurs déclarés, mais {listBroCount} répertoriés ci-dessous (avertissement non bloquant).
              </span>
            </div>
          )}

          {/* Liste répétable de la fratrie */}
          {formData.collateraux.fratrie && formData.collateraux.fratrie.length > 0 && (
            <div className="space-y-2 mt-2">
              {formData.collateraux.fratrie.map((frere) => (
                <div key={frere.id} className="flex flex-wrap items-center gap-2 p-2 bg-white border border-[#D9E2E8] rounded-lg">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={frere.nom}
                    onChange={(e) => updateFrereSoeur(frere.id, { nom: e.target.value })}
                    className="text-xs bg-[#F8FAFC] border border-[#D9E2E8] rounded px-2 py-1 flex-1 min-w-[120px]"
                    placeholder="Nom du frère / sœur"
                  />
                  <input
                    type="number"
                    disabled={isReadOnly}
                    value={frere.age || ''}
                    onChange={(e) => updateFrereSoeur(frere.id, { age: parseInt(e.target.value) || undefined })}
                    className="text-xs bg-[#F8FAFC] border border-[#D9E2E8] rounded px-2 py-1 w-16"
                    placeholder="Âge"
                  />
                  <select
                    disabled={isReadOnly}
                    value={frere.sexe}
                    onChange={(e) => updateFrereSoeur(frere.id, { sexe: e.target.value as 'M' | 'F' })}
                    className="text-xs bg-[#F8FAFC] border border-[#D9E2E8] rounded px-2 py-1"
                  >
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={frere.profession || ''}
                    onChange={(e) => updateFrereSoeur(frere.id, { profession: e.target.value })}
                    className="text-xs bg-[#F8FAFC] border border-[#D9E2E8] rounded px-2 py-1 flex-1 min-w-[100px]"
                    placeholder="Profession"
                  />
                  <label className="flex items-center gap-1 text-[11px] text-[#64748B]">
                    <input
                      type="checkbox"
                      disabled={isReadOnly}
                      checked={frere.vivant}
                      onChange={(e) => updateFrereSoeur(frere.id, { vivant: e.target.checked })}
                      className="rounded text-[#10B9A9]"
                    />
                    <span>Vivant</span>
                  </label>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeFrereSoeur(frere.id)}
                      className="text-[#BE123C] hover:text-[#9F1239] p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Conception, grossesse & accouchement */}
        <div className="p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-2">
          <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
            3. Conception, grossesse et accouchement du patient
          </h3>
          <textarea
            rows={2}
            disabled={isReadOnly}
            value={formData.conceptionGrossesseAccouchement || ''}
            onChange={(e) => setFormData({ ...formData, conceptionGrossesseAccouchement: e.target.value })}
            className="w-full bg-white border border-[#D9E2E8] focus:border-[#10B9A9] text-[#18243A] text-xs font-medium rounded-lg p-2.5 focus:outline-none"
            placeholder="Désir d'enfant, déroulement de la grossesse, terme, voie basse/césarienne, réanimation néonatale..."
          />
        </div>

        {/* 4. Développement psychomoteur */}
        <div className="p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
            4. Développement psychomoteur
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Âge de la marche
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.developpementPsychomoteur?.marche || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  developpementPsychomoteur: { ...formData.developpementPsychomoteur, marche: e.target.value }
                })}
                className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                placeholder="Ex: 12-14 mois"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Âge d'acquisition du langage
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.developpementPsychomoteur?.langage || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  developpementPsychomoteur: { ...formData.developpementPsychomoteur, langage: e.target.value }
                })}
                className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                placeholder="Ex: Phrases vers 2 ans"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Propreté sphinctérienne
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.developpementPsychomoteur?.proprete || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  developpementPsychomoteur: { ...formData.developpementPsychomoteur, proprete: e.target.value }
                })}
                className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                placeholder="Ex: Vers 2 ans et demi"
              />
            </div>
          </div>
        </div>

        {/* 5. Scolarité */}
        <div className="p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
            5. Scolarité
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Âge de début de scolarisation
              </label>
              <input
                type="number"
                disabled={isReadOnly}
                value={formData.scolarite.debutAge || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scolarite: { ...formData.scolarite, debutAge: parseInt(e.target.value) || undefined }
                })}
                className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                placeholder="Ex: 6 ans"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Niveau scolaire atteint
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.scolarite.niveauAtteint || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scolarite: { ...formData.scolarite, niveauAtteint: e.target.value }
                })}
                className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                placeholder="Ex: Terminale, Université..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Diplômes obtenus
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.scolarite.diplomes || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scolarite: { ...formData.scolarite, diplomes: e.target.value }
                })}
                className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                placeholder="Ex: DEF, Bac, Licence..."
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Échecs ou redoublements
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.scolarite.echecsScolaires || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scolarite: { ...formData.scolarite, echecsScolaires: e.target.value }
                })}
                className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                placeholder="Classes redoublées, abandons..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Vécu psychologique des échecs
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.scolarite.vecuDesEchecs || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scolarite: { ...formData.scolarite, vecuDesEchecs: e.target.value }
                })}
                className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                placeholder="Réaction familiale, dévalorisation..."
              />
            </div>
          </div>
        </div>

        {/* 6. Développement ultérieur et parcours professionnel */}
        <div className="p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-2">
          <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
            6. Développement ultérieur et parcours professionnel
          </h3>
          <textarea
            rows={2}
            disabled={isReadOnly}
            value={formData.developpementProfessionnel || ''}
            onChange={(e) => setFormData({ ...formData, developpementProfessionnel: e.target.value })}
            className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg p-2.5"
            placeholder="Historique des emplois, stabilité, relations avec collègues et hiérarchie..."
          />
        </div>

        {/* 7. Développement sexuel et sentimental (BR-003: Ménarche vs Spermarche) */}
        <div className="p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
              7. Développement sexuel et adaptation sentimentale
            </h3>
            <div className="flex items-center gap-2">
              {!isReadOnly && (
                <>
                  <button
                    type="button"
                    onClick={addConjoint}
                    className="text-[11px] font-semibold text-[#07988D] bg-[#ECFBF9] hover:bg-[#D9F7F3] px-2 py-0.5 rounded"
                  >
                    + Conjoint(e)
                  </button>
                  <button
                    type="button"
                    onClick={addEnfant}
                    className="text-[11px] font-semibold text-[#07988D] bg-[#ECFBF9] hover:bg-[#D9F7F3] px-2 py-0.5 rounded"
                  >
                    + Enfant
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Conditionnel au sexe (BR-003) */}
            {patientSexe === 'Féminin' ? (
              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1">
                  Âge de la ménarche (premières règles) <span className="text-[#07988D] font-mono text-[10px]">(Féminin)</span>
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.developpementSexuelEtSentimentale.menarcheAge || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    developpementSexuelEtSentimentale: {
                      ...formData.developpementSexuelEtSentimentale,
                      menarcheAge: e.target.value
                    }
                  })}
                  className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                  placeholder="Ex: 13 ans"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1">
                  Âge de la spermarche (premières éjaculations) <span className="text-[#07988D] font-mono text-[10px]">(Masculin)</span>
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.developpementSexuelEtSentimentale.spermarcheAge || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    developpementSexuelEtSentimentale: {
                      ...formData.developpementSexuelEtSentimentale,
                      spermarcheAge: e.target.value
                    }
                  })}
                  className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                  placeholder="Ex: 14 ans"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#18243A] mb-1">
                Premier rapport sexuel (conditions & vécu)
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.developpementSexuelEtSentimentale.premierRapportConditionsVecu || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  developpementSexuelEtSentimentale: {
                    ...formData.developpementSexuelEtSentimentale,
                    premierRapportConditionsVecu: e.target.value
                  }
                })}
                className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
                placeholder="Consentement, âge, traumatisme éventuel..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18243A] mb-1">
              Principales relations amoureuses et histoire du couple
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.developpementSexuelEtSentimentale.principalesRelationsAmoureuses || ''}
              onChange={(e) => setFormData({
                ...formData,
                developpementSexuelEtSentimentale: {
                  ...formData.developpementSexuelEtSentimentale,
                  principalesRelationsAmoureuses: e.target.value
                }
              })}
              className="w-full bg-white border border-[#D9E2E8] text-xs rounded-lg px-3 py-1.5"
              placeholder="Ex: Marié depuis 8 ans, vie conjugale harmonieuse..."
            />
          </div>

          {/* Conjoints */}
          {formData.developpementSexuelEtSentimentale.conjoints?.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-[#64748B]">Conjoint(e)s identifié(e)s :</span>
              {formData.developpementSexuelEtSentimentale.conjoints.map((c) => (
                <div key={c.id} className="flex items-center gap-2 p-1.5 bg-white border border-[#D9E2E8] rounded">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={c.nom}
                    onChange={(e) => {
                      const updated = formData.developpementSexuelEtSentimentale.conjoints.map(x => x.id === c.id ? { ...x, nom: e.target.value } : x);
                      setFormData({ ...formData, developpementSexuelEtSentimentale: { ...formData.developpementSexuelEtSentimentale, conjoints: updated } });
                    }}
                    className="text-xs bg-[#F8FAFC] border border-[#D9E2E8] rounded px-2 py-1 flex-1"
                    placeholder="Nom du conjoint"
                  />
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={c.statut}
                    onChange={(e) => {
                      const updated = formData.developpementSexuelEtSentimentale.conjoints.map(x => x.id === c.id ? { ...x, statut: e.target.value } : x);
                      setFormData({ ...formData, developpementSexuelEtSentimentale: { ...formData.developpementSexuelEtSentimentale, conjoints: updated } });
                    }}
                    className="text-xs bg-[#F8FAFC] border border-[#D9E2E8] rounded px-2 py-1 w-28"
                    placeholder="Statut (Actuel, Ex...)"
                  />
                  {!isReadOnly && (
                    <button type="button" onClick={() => removeConjoint(c.id)} className="text-[#BE123C] p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Enfants */}
          {formData.developpementSexuelEtSentimentale.enfants?.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-[#64748B]">Enfants identifiés :</span>
              {formData.developpementSexuelEtSentimentale.enfants.map((enf) => (
                <div key={enf.id} className="flex items-center gap-2 p-1.5 bg-white border border-[#D9E2E8] rounded">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={enf.nom}
                    onChange={(e) => {
                      const updated = formData.developpementSexuelEtSentimentale.enfants.map(x => x.id === enf.id ? { ...x, nom: e.target.value } : x);
                      setFormData({ ...formData, developpementSexuelEtSentimentale: { ...formData.developpementSexuelEtSentimentale, enfants: updated } });
                    }}
                    className="text-xs bg-[#F8FAFC] border border-[#D9E2E8] rounded px-2 py-1 flex-1"
                    placeholder="Nom / Prénom de l’enfant"
                  />
                  <input
                    type="number"
                    disabled={isReadOnly}
                    value={enf.age || ''}
                    onChange={(e) => {
                      const updated = formData.developpementSexuelEtSentimentale.enfants.map(x => x.id === enf.id ? { ...x, age: parseInt(e.target.value) || undefined } : x);
                      setFormData({ ...formData, developpementSexuelEtSentimentale: { ...formData.developpementSexuelEtSentimentale, enfants: updated } });
                    }}
                    className="text-xs bg-[#F8FAFC] border border-[#D9E2E8] rounded px-2 py-1 w-16"
                    placeholder="Âge"
                  />
                  <select
                    disabled={isReadOnly}
                    value={enf.sexe}
                    onChange={(e) => {
                      const updated = formData.developpementSexuelEtSentimentale.enfants.map(x => x.id === enf.id ? { ...x, sexe: e.target.value as 'M' | 'F' } : x);
                      setFormData({ ...formData, developpementSexuelEtSentimentale: { ...formData.developpementSexuelEtSentimentale, enfants: updated } });
                    }}
                    className="text-xs bg-[#F8FAFC] border border-[#D9E2E8] rounded px-2 py-1"
                  >
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                  {!isReadOnly && (
                    <button type="button" onClick={() => removeEnfant(enf.id)} className="text-[#BE123C] p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8. Événements marquants positifs et négatifs */}
        <div className="p-4 bg-[#F8FAFC] border border-[#D9E2E8] rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-[#18243A] uppercase tracking-wider">
            8. Événements marquants de la vie
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Positifs */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#15803D] block">Événements positifs</span>
              <ul className="space-y-1">
                {formData.evenementsMarquants.positifs?.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs bg-white px-2.5 py-1 rounded border border-[#D9E2E8]">
                    <span>• {item}</span>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          evenementsMarquants: {
                            ...formData.evenementsMarquants,
                            positifs: formData.evenementsMarquants.positifs.filter((_, i) => i !== idx)
                          }
                        })}
                        className="text-[#94A3B8] hover:text-[#BE123C]"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {!isReadOnly && (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newPositif}
                    onChange={(e) => setNewPositif(e.target.value)}
                    className="text-xs bg-white border border-[#D9E2E8] rounded px-2.5 py-1 flex-1"
                    placeholder="Ajouter un événement positif..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPositif.trim()) {
                        setFormData({
                          ...formData,
                          evenementsMarquants: {
                            ...formData.evenementsMarquants,
                            positifs: [...(formData.evenementsMarquants.positifs || []), newPositif.trim()]
                          }
                        });
                        setNewPositif('');
                      }
                    }}
                    className="px-2 py-1 text-xs bg-[#DCFCE7] text-[#15803D] font-semibold rounded hover:bg-[#BBF7D0]"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Négatifs */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#BE123C] block">Événements négatifs / traumatismes</span>
              <ul className="space-y-1">
                {formData.evenementsMarquants.negatifs?.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs bg-white px-2.5 py-1 rounded border border-[#D9E2E8]">
                    <span>• {item}</span>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          evenementsMarquants: {
                            ...formData.evenementsMarquants,
                            negatifs: formData.evenementsMarquants.negatifs.filter((_, i) => i !== idx)
                          }
                        })}
                        className="text-[#94A3B8] hover:text-[#BE123C]"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {!isReadOnly && (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newNegatif}
                    onChange={(e) => setNewNegatif(e.target.value)}
                    className="text-xs bg-white border border-[#D9E2E8] rounded px-2.5 py-1 flex-1"
                    placeholder="Ajouter un événement négatif..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newNegatif.trim()) {
                        setFormData({
                          ...formData,
                          evenementsMarquants: {
                            ...formData.evenementsMarquants,
                            negatifs: [...(formData.evenementsMarquants.negatifs || []), newNegatif.trim()]
                          }
                        });
                        setNewNegatif('');
                      }
                    }}
                    className="px-2 py-1 text-xs bg-[#FFE4E6] text-[#BE123C] font-semibold rounded hover:bg-[#FECDD3]"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <RubriqueFooterNav
          currentRubriqueId="s7"
          isReadOnly={isReadOnly}
          isSaved={isSaved}
          onPrev={onPrev}
          onNext={onNext}
        />
      </form>
    </div>
  );
};

